"""
ANSAPRA - 高中生自然科学论文自适应阅读程序
后端主文件（修复版）
"""

import os
import json
import base64
import hashlib
import secrets
from datetime import datetime, timedelta
from functools import wraps
from pathlib import Path

import requests
from flask import Flask, render_template, request, jsonify, session, send_file, make_response
from flask_cors import CORS
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import pdfplumber
from docx import Document
import PyPDF2
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 初始化Flask应用
app = Flask(__name__)

# 基础配置
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# 启用CORS（修复跨域问题）
CORS(app, 
     supports_credentials=True,
     origins=["http://localhost:10000", "http://localhost:5000", "https://*.onrender.com", "*"],  # 允许所有来源用于测试
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Content-Type", "Authorization"])

# 初始化Session
Session(app)

# API密钥配置
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY')
SPRINGER_API_KEY = os.environ.get('SPRINGER_API_KEY')

# 确保上传文件夹存在
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 允许的文件扩展名
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

# 用户数据存储（生产环境应使用数据库）
# 使用字典模拟数据库
users_db = {}
papers_db = {}
settings_db = {}
questionnaire_db = {}

def allowed_file(filename):
    """检查文件扩展名是否允许"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def login_required(f):
    """登录装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': '请先登录', 'code': 401}), 401
        return f(*args, **kwargs)
    return decorated_function

def generate_user_id(email):
    """生成用户ID"""
    return hashlib.sha256(email.encode()).hexdigest()[:16]

@app.route('/')
def index():
    """渲染主页面"""
    return render_template('index.html')

@app.route('/health')
def health_check():
    """健康检查端点"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    """用户注册（修复版）"""
    if request.method == 'OPTIONS':
        # 处理预检请求
        return _build_cors_preflight_response()
    
    try:
        # 检查Content-Type
        if not request.is_json:
            return jsonify({'error': '请求必须是JSON格式', 'code': 400}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({'error': '请求数据为空', 'code': 400}), 400
        
        email = data.get('email', '').strip().lower()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        questionnaire = data.get('questionnaire', {})
        
        # 验证输入
        if not email or '@' not in email:
            return jsonify({'error': '请输入有效的邮箱地址', 'code': 400}), 400
        
        if not username or len(username) < 2:
            return jsonify({'error': '用户名至少2个字符', 'code': 400}), 400
        
        if len(password) < 6:
            return jsonify({'error': '密码至少6个字符', 'code': 400}), 400
        
        if password != confirm_password:
            return jsonify({'error': '两次输入的密码不一致', 'code': 400}), 400
        
        # 检查邮箱是否已注册
        user_id = generate_user_id(email)
        if user_id in users_db:
            return jsonify({'error': '该邮箱已注册', 'code': 409}), 409
        
        # 创建用户
        users_db[user_id] = {
            'id': user_id,
            'email': email,
            'username': username,
            'password_hash': generate_password_hash(password),
            'created_at': datetime.now().isoformat(),
            'last_login': datetime.now().isoformat()
        }
        
        # 保存问卷数据
        if questionnaire:
            questionnaire_db[user_id] = questionnaire
        else:
            # 如果问卷为空，设置默认问卷
            questionnaire_db[user_id] = {
                'grade': '10',
                'education_system': 'regular',
                'learning_frequency': 'monthly',
                'subject_interests': {
                    'physics': 3,
                    'biology': 3,
                    'chemistry': 3,
                    'geology': 3,
                    'astronomy': 3
                }
            }
        
        # 初始化默认设置
        default_settings = {
            'reading': {
                'preparation_level': 'B',
                'reading_reason': 'B',
                'time_preference': 'B',
                'interpretation_style': 'A',
                'interpretation_depth': 'B',
                'self_test_content': ['A', 'B'],
                'preferred_charts': ['A', 'B']
            },
            'visual': {
                'theme': 'light-blue',
                'font_size': '18px',
                'font_family': 'Microsoft YaHei, sans-serif',
                'custom_background': None
            },
            'language': {
                'interface_language': 'zh'
            }
        }
        settings_db[user_id] = default_settings
        
        # 初始化论文历史
        papers_db[user_id] = []
        
        # 设置会话
        session['user_id'] = user_id
        session['username'] = username
        session['last_page'] = 'intro'
        session.permanent = True
        
        response = jsonify({
            'success': True,
            'message': '注册成功',
            'user': {
                'id': user_id,
                'username': username,
                'email': email
            }
        })
        
        return _corsify_actual_response(response)
        
    except Exception as e:
        app.logger.error(f'注册错误: {str(e)}', exc_info=True)
        return jsonify({'error': '服务器内部错误，请稍后重试', 'code': 500}), 500

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    """用户登录（修复版）"""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        if not request.is_json:
            return jsonify({'error': '请求必须是JSON格式', 'code': 400}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({'error': '请求数据为空', 'code': 400}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': '请输入邮箱和密码', 'code': 400}), 400
        
        user_id = generate_user_id(email)
        user = users_db.get(user_id)
        
        if not user:
            return jsonify({'error': '邮箱或密码错误', 'code': 401}), 401
        
        if not check_password_hash(user['password_hash'], password):
            return jsonify({'error': '邮箱或密码错误', 'code': 401}), 401
        
        # 更新最后登录时间
        user['last_login'] = datetime.now().isoformat()
        
        # 设置会话
        session['user_id'] = user_id
        session['username'] = user['username']
        session.permanent = True
        
        # 获取上次访问页面
        last_page = session.get('last_page', 'intro')
        
        response = jsonify({
            'success': True,
            'message': '登录成功',
            'user': {
                'id': user_id,
                'username': user['username'],
                'email': user['email']
            },
            'last_page': last_page
        })
        
        return _corsify_actual_response(response)
        
    except Exception as e:
        app.logger.error(f'登录错误: {str(e)}', exc_info=True)
        return jsonify({'error': '服务器内部错误，请稍后重试', 'code': 500}), 500

@app.route('/api/logout', methods=['POST', 'OPTIONS'])
def logout():
    """用户退出"""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    session.clear()
    response = jsonify({'success': True, 'message': '已退出登录'})
    return _corsify_actual_response(response)

@app.route('/api/guest', methods=['POST', 'OPTIONS'])
def guest_login():
    """游客登录"""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    session['user_id'] = 'guest_' + hashlib.sha256(str(datetime.now()).encode()).hexdigest()[:12]
    session['username'] = '游客'
    session['guest'] = True
    session.permanent = True
    
    response = jsonify({
        'success': True,
        'message': '游客模式已启用',
        'user': {
            'id': session['user_id'],
            'username': '游客'
        }
    })
    
    return _corsify_actual_response(response)

@app.route('/api/check_auth', methods=['GET', 'OPTIONS'])
def check_auth():
    """检查认证状态"""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        if 'user_id' in session:
            user_id = session['user_id']
            is_guest = session.get('guest', False)
            
            if is_guest:
                response = jsonify({
                    'authenticated': True,
                    'user': {
                        'id': user_id,
                        'username': '游客',
                        'guest': True
                    }
                })
                return _corsify_actual_response(response)
            
            user = users_db.get(user_id)
            if user:
                response = jsonify({
                    'authenticated': True,
                    'user': {
                        'id': user_id,
                        'username': user['username'],
                        'email': user['email']
                    }
                })
                return _corsify_actual_response(response)
        
        response = jsonify({'authenticated': False})
        return _corsify_actual_response(response)
        
    except Exception as e:
        app.logger.error(f'检查认证状态错误: {str(e)}')
        response = jsonify({'authenticated': False, 'error': str(e)})
        return _corsify_actual_response(response)

# 其他API路由保持不变，但需要添加CORS支持...

def _build_cors_preflight_response():
    """构建CORS预检响应"""
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response

def _corsify_actual_response(response):
    """为实际响应添加CORS头"""
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response

@app.route('/api/test', methods=['GET', 'POST', 'OPTIONS'])
def test_endpoint():
    """测试端点"""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    response = jsonify({
        'status': 'success',
        'message': 'API工作正常',
        'timestamp': datetime.now().isoformat(),
        'method': request.method,
        'session': dict(session) if 'user_id' in session else 'no session'
    })
    
    return _corsify_actual_response(response)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=True)
