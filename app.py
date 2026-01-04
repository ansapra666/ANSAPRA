"""
ANSAPRA - 高中生自然科学论文自适应阅读程序
后端主文件
"""

import os
import json
import base64
import hashlib
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

# 导入配置
from config import Config

# 初始化Flask应用
app = Flask(__name__)
app.config.from_object(Config)

# 启用CORS
CORS(app, supports_credentials=True)

# 初始化Session
Session(app)

# 确保上传文件夹存在
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 允许的文件扩展名
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

# 用户数据存储（生产环境应使用数据库）
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
            return jsonify({'error': '请先登录'}), 401
        return f(*args, **kwargs)
    return decorated_function

def generate_user_id(email):
    """生成用户ID"""
    return hashlib.sha256(email.encode()).hexdigest()[:16]

@app.route('/')
def index():
    """渲染主页面"""
    return render_template('index.html')

@app.route('/api/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        questionnaire = data.get('questionnaire', {})
        
        # 验证输入
        if not email or '@' not in email:
            return jsonify({'error': '请输入有效的邮箱地址'}), 400
        
        if not username or len(username) < 2:
            return jsonify({'error': '用户名至少2个字符'}), 400
        
        if len(password) < 6:
            return jsonify({'error': '密码至少6个字符'}), 400
        
        if password != confirm_password:
            return jsonify({'error': '两次输入的密码不一致'}), 400
        
        if not questionnaire:
            return jsonify({'error': '请填写认知框架调查问卷'}), 400
        
        # 检查邮箱是否已注册
        user_id = generate_user_id(email)
        if user_id in users_db:
            return jsonify({'error': '该邮箱已注册'}), 400
        
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
        questionnaire_db[user_id] = questionnaire
        
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
        
        return jsonify({
            'success': True,
            'message': '注册成功',
            'user': {
                'id': user_id,
                'username': username,
                'email': email
            }
        })
        
    except Exception as e:
        app.logger.error(f'注册错误: {str(e)}')
        return jsonify({'error': '注册失败，请稍后重试'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': '请输入邮箱和密码'}), 400
        
        user_id = generate_user_id(email)
        user = users_db.get(user_id)
        
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'error': '邮箱或密码错误'}), 401
        
        # 更新最后登录时间
        user['last_login'] = datetime.now().isoformat()
        
        # 设置会话
        session['user_id'] = user_id
        session['username'] = user['username']
        
        # 获取上次访问页面
        last_page = session.get('last_page', 'intro')
        
        return jsonify({
            'success': True,
            'message': '登录成功',
            'user': {
                'id': user_id,
                'username': user['username'],
                'email': user['email']
            },
            'last_page': last_page
        })
        
    except Exception as e:
        app.logger.error(f'登录错误: {str(e)}')
        return jsonify({'error': '登录失败，请稍后重试'}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """用户退出"""
    session.clear()
    return jsonify({'success': True, 'message': '已退出登录'})

@app.route('/api/guest', methods=['POST'])
def guest_login():
    """游客登录"""
    session['user_id'] = 'guest_' + hashlib.sha256(str(datetime.now()).encode()).hexdigest()[:12]
    session['username'] = '游客'
    session['guest'] = True
    
    return jsonify({
        'success': True,
        'message': '游客模式已启用',
        'user': {
            'id': session['user_id'],
            'username': '游客'
        }
    })

@app.route('/api/upload_paper', methods=['POST'])
@login_required
def upload_paper():
    """上传论文文件"""
    try:
        user_id = session['user_id']
        
        # 检查文件上传
        if 'file' not in request.files:
            return jsonify({'error': '没有选择文件'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '没有选择文件'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': '只支持PDF、DOCX、TXT格式'}), 400
        
        # 检查文件大小 (16MB限制)
        file.seek(0, 2)  # 移动到文件末尾
        file_size = file.tell()
        file.seek(0)  # 重置文件指针
        
        if file_size > 16 * 1024 * 1024:  # 16MB
            return jsonify({'error': '文件太大，最大支持16MB'}), 400
        
        # 保存文件
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # 直接返回文件信息，不提取文本
        return jsonify({
            'success': True,
            'filename': filename,
            'unique_filename': unique_filename,
            'filepath': filepath,
            'size': file_size
        })
        
    except Exception as e:
        app.logger.error(f'上传文件错误: {str(e)}')
        return jsonify({'error': f'上传失败: {str(e)}'}), 500

@app.route('/api/interpret', methods=['POST'])
@login_required
def interpret_paper():
    """解读论文"""
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        # 获取输入内容
        text_input = data.get('text', '').strip()
        filename = data.get('filename', '')
        file_content = data.get('file_content', '')  # 前端已读取的文件内容
        
        if not text_input and not filename:
            return jsonify({'error': '请输入论文文本或上传文件'}), 400
        
        # 获取用户设置和问卷
        user_settings = settings_db.get(user_id, {})
        questionnaire = questionnaire_db.get(user_id, {})
        
        # 获取用户历史记录
        user_history = papers_db.get(user_id, [])
        
        # 准备发送给DeepSeek的内容
        prompt_data = {
            "role": "user",
            "content": f"""
用户是一位高中生，需要解读一篇自然科学学术论文。其具体个性化解读方式设置数据、过往阅读数据、个人自然科学知识框架问卷、本次解读的论文文件已经传送，请根据用户输入的论文，生成一篇符合所有个性化需求的解读内容。

用户设置:
{json.dumps(user_settings, ensure_ascii=False, indent=2)}

用户认知框架问卷:
{json.dumps(questionnaire, ensure_ascii=False, indent=2)}

用户历史阅读记录（最近5篇）:
{json.dumps(user_history[-5:], ensure_ascii=False, indent=2)}

需要解读的论文内容:
{text_input if text_input else f"论文文件: {filename}"}

要求：
1. 为了帮助完善用户的知识框架，可以在解读时注重用户知识框架的薄弱点，并发挥用户在自然科学方面的长处。
2. 解读时，句子不能冗长，要求简短、清晰。
3. 尽可能逻辑清晰地分出小标题，有条理地分开解读内容的各部分。
4. 尽可能在解读时，遵循论文本身的分段逻辑。
5. 只进行论文内容的解读，不需要额外生成其他内容。
6. 生成的解读内容需要是中文。
7. 在解读的最后请附上这篇论文的术语解读区。
"""
        }
        
        # 调用DeepSeek API
        deepseek_response = call_deepseek_api(prompt_data)
        
        if not deepseek_response:
            return jsonify({'error': 'AI解读服务暂时不可用'}), 500
        
        # 保存解读记录
        paper_record = {
            'id': hashlib.md5(str(datetime.now()).encode()).hexdigest()[:8],
            'title': filename or '文本输入',
            'content': text_input[:500] + '...' if text_input else f'文件: {filename}',
            'interpretation': deepseek_response,
            'created_at': datetime.now().isoformat(),
            'settings': user_settings
        }
        
        papers_db[user_id].append(paper_record)
        
        # 获取相关论文推荐
        recommendations = get_paper_recommendations(text_input, questionnaire)
        
        # 生成思维导图结构
        mindmap = generate_mindmap_structure(deepseek_response)
        
        return jsonify({
            'success': True,
            'interpretation': deepseek_response,
            'recommendations': recommendations,
            'mindmap': mindmap,
            'paper_id': paper_record['id']
        })
        
    except Exception as e:
        app.logger.error(f'解读论文错误: {str(e)}')
        return jsonify({'error': f'解读失败: {str(e)}'}), 500

def call_deepseek_api(prompt_data):
    """调用DeepSeek API"""
    try:
        api_key = app.config.get('DEEPSEEK_API_KEY')
        if not api_key:
            app.logger.warning('DeepSeek API密钥未配置')
            return "AI解读服务配置中，请稍后使用..."
        
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "model": "deepseek-chat",
            "messages": [prompt_data],
            "stream": False,
            "max_tokens": None  # 不限制长度
        }
        
        response = requests.post(
            'https://api.deepseek.com/chat/completions',
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content']
        else:
            app.logger.error(f'DeepSeek API错误: {response.status_code}, {response.text}')
            return None
            
    except Exception as e:
        app.logger.error(f'调用DeepSeek API错误: {str(e)}')
        return None

def get_paper_recommendations(text, questionnaire):
    """获取相关论文推荐（使用Springer API）"""
    try:
        springer_key = app.config.get('SPRINGER_API_KEY')
        if not springer_key:
            return []
        
        # 从问卷中提取用户兴趣关键词
        interests = []
        if 'subject_interests' in questionnaire:
            for subject, score in questionnaire['subject_interests'].items():
                if score >= 4:  # 兴趣度4分及以上
                    interests.append(subject)
        
        # 如果没有兴趣数据，使用默认关键词
        if not interests:
            interests = ['physics', 'biology', 'chemistry', 'astronomy', 'geology']
        
        # 构建搜索查询
        query = ' '.join(interests[:3])  # 使用前3个兴趣关键词
        
        # 调用Springer Open Access API
        params = {
            'q': query,
            'api_key': springer_key,
            'p': 5  # 返回5条结果
        }
        
        response = requests.get(
            'http://api.springernature.com/metadata/json',
            params=params,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            papers = []
            
            for record in data.get('records', [])[:5]:
                paper = {
                    'title': record.get('title', ''),
                    'authors': record.get('creators', []),
                    'journal': record.get('publicationName', ''),
                    'year': record.get('publicationDate', '')[:4],
                    'doi': record.get('doi', ''),
                    'url': f"https://link.springer.com/article/{record.get('doi', '')}",
                    'abstract': record.get('abstract', '')[:200] + '...'
                }
                papers.append(paper)
            
            return papers
            
    except Exception as e:
        app.logger.error(f'获取论文推荐错误: {str(e)}')
    
    return []

def generate_mindmap_structure(interpretation):
    """生成思维导图结构（简化的JSON结构）"""
    try:
        # 从解读内容中提取主要标题
        lines = interpretation.split('\n')
        sections = []
        current_section = None
        
        for line in lines:
            line = line.strip()
            if line.startswith('## '):
                if current_section:
                    sections.append(current_section)
                current_section = {
                    'name': line[3:],
                    'children': []
                }
            elif line.startswith('### ') and current_section:
                current_section['children'].append({
                    'name': line[4:],
                    'children': []
                })
            elif line.startswith('- ') and current_section and current_section['children']:
                current_section['children'][-1]['children'].append({
                    'name': line[2:],
                    'children': []
                })
        
        if current_section:
            sections.append(current_section)
        
        return {
            'name': '论文解读',
            'children': sections
        }
        
    except Exception as e:
        app.logger.error(f'生成思维导图错误: {str(e)}')
        return {
            'name': '论文解读',
            'children': []
        }

@app.route('/api/settings', methods=['GET', 'POST'])
@login_required
def user_settings():
    """获取或保存用户设置"""
    user_id = session['user_id']
    
    if request.method == 'GET':
        # 获取用户设置
        settings = settings_db.get(user_id, {})
        return jsonify({'success': True, 'settings': settings})
    
    else:  # POST
        try:
            data = request.get_json()
            setting_type = data.get('type')
            setting_data = data.get('data')
            
            if not setting_type or not setting_data:
                return jsonify({'error': '缺少设置类型或数据'}), 400
            
            # 更新设置
            if user_id not in settings_db:
                settings_db[user_id] = {}
            
            settings_db[user_id][setting_type] = setting_data
            
            # 立即应用到当前会话
            session['settings'] = settings_db[user_id]
            
            return jsonify({
                'success': True,
                'message': '设置已更新',
                'settings': settings_db[user_id]
            })
            
        except Exception as e:
            app.logger.error(f'保存设置错误: {str(e)}')
            return jsonify({'error': f'保存设置失败: {str(e)}'}), 500

@app.route('/api/history', methods=['GET'])
@login_required
def get_history():
    """获取用户历史记录"""
    user_id = session['user_id']
    history = papers_db.get(user_id, [])
    return jsonify({'success': True, 'history': history})

@app.route('/api/save_page', methods=['POST'])
@login_required
def save_page():
    """保存用户当前页面"""
    data = request.get_json()
    page = data.get('page', 'intro')
    session['last_page'] = page
    return jsonify({'success': True})

@app.route('/api/delete_account', methods=['POST'])
@login_required
def delete_account():
    """删除用户账户"""
    try:
        user_id = session['user_id']
        
        # 删除用户数据
        if user_id in users_db:
            del users_db[user_id]
        if user_id in settings_db:
            del settings_db[user_id]
        if user_id in questionnaire_db:
            del questionnaire_db[user_id]
        if user_id in papers_db:
            del papers_db[user_id]
        
        # 清除会话
        session.clear()
        
        return jsonify({
            'success': True,
            'message': '账户已删除'
        })
        
    except Exception as e:
        app.logger.error(f'删除账户错误: {str(e)}')
        return jsonify({'error': '删除账户失败'}), 500

@app.route('/api/check_auth', methods=['GET'])
def check_auth():
    """检查认证状态"""
    if 'user_id' in session:
        user_id = session['user_id']
        is_guest = session.get('guest', False)
        
        if is_guest:
            return jsonify({
                'authenticated': True,
                'user': {
                    'id': user_id,
                    'username': '游客',
                    'guest': True
                }
            })
        
        user = users_db.get(user_id)
        if user:
            return jsonify({
                'authenticated': True,
                'user': {
                    'id': user_id,
                    'username': user['username'],
                    'email': user['email']
                }
            })
    
    return jsonify({'authenticated': False})

@app.route('/api/save_questionnaire', methods=['POST'])
def save_questionnaire():
    """保存认知框架问卷"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': '用户未登录'}), 401
        
        data = request.get_json()
        questionnaire = data.get('questionnaire')
        
        if not questionnaire:
            return jsonify({'error': '问卷数据为空'}), 400
        
        questionnaire_db[user_id] = questionnaire
        return jsonify({'success': True, 'message': '问卷已保存'})
        
    except Exception as e:
        app.logger.error(f'保存问卷错误: {str(e)}')
        return jsonify({'error': '保存问卷失败'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000, debug=True)
