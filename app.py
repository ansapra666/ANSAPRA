from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_from_directory
from flask_session import Session
from flask_cors import CORS
import json
import os
from datetime import datetime
from functools import wraps

from config import Config
from models import db, User, ReadingHistory, UserSetting, PaperRecommendation
from deepseek_api import DeepSeekAPI
from springer_api import SpringerAPI
from utils import save_uploaded_file, extract_text_from_file, create_default_user_settings, validate_email

# 初始化Flask应用
app = Flask(__name__)
app.config.from_object(Config)

# 初始化扩展
db.init_app(app)
Session(app)
CORS(app)

# 确保上传目录存在
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

# 初始化API
deepseek_api = DeepSeekAPI()
springer_api = SpringerAPI()

def login_required(f):
    """登录装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': '请先登录'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    """主页面"""
    return render_template('index.html')

@app.route('/api/register', methods=['POST'])
def register():
    """用户注册"""
    data = request.json
    
    # 验证必需字段
    required_fields = ['email', 'username', 'password', 'questionnaire']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'error': f'缺少{field}字段'}), 400
    
    # 验证邮箱格式
    if not validate_email(data['email']):
        return jsonify({'success': False, 'error': '邮箱格式不正确'}), 400
    
    # 检查邮箱是否已存在
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'error': '邮箱已被注册'}), 400
    
    # 创建新用户
    new_user = User(
        email=data['email'],
        username=data['username']
    )
    new_user.set_password(data['password'])
    new_user.questionnaire_data = json.dumps(data['questionnaire'])
    
    try:
        db.session.add(new_user)
        db.session.commit()
        
        # 创建用户设置
        user_setting = UserSetting(user_id=new_user.id)
        db.session.add(user_setting)
        db.session.commit()
        
        # 设置会话
        session['user_id'] = new_user.id
        session['username'] = new_user.username
        
        return jsonify({
            'success': True,
            'message': '注册成功',
            'user': new_user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.json
    
    if 'email' not in data or 'password' not in data:
        return jsonify({'success': False, 'error': '缺少邮箱或密码'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'success': False, 'error': '邮箱或密码不正确'}), 401
    
    # 更新最后登录时间
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # 设置会话
    session['user_id'] = user.id
    session['username'] = user.username
    
    return jsonify({
        'success': True,
        'message': '登录成功',
        'user': user.to_dict()
    })

@app.route('/api/logout', methods=['POST'])
def logout():
    """用户登出"""
    session.clear()
    return jsonify({'success': True, 'message': '已退出登录'})

@app.route('/api/upload', methods=['POST'])
@login_required
def upload_paper():
    """上传论文文件"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': '没有文件上传'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'error': '没有选择文件'}), 400
    
    # 保存文件
    file_info = save_uploaded_file(file)
    if not file_info:
        return jsonify({'success': False, 'error': '文件类型不支持'}), 400
    
    # 提取文本内容（仅用于展示，不用于分析）
    extension = file_info['original_filename'].rsplit('.', 1)[1].lower()
    text_content = extract_text_from_file(file_info['filepath'], extension)
    
    # 保存到阅读历史
    reading_history = ReadingHistory(
        user_id=session['user_id'],
        paper_title=file_info['original_filename'],
        paper_filename=file_info['saved_filename'],
        paper_content=text_content[:5000]  # 只保存部分内容用于展示
    )
    
    db.session.add(reading_history)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'file_info': file_info,
        'content_preview': text_content[:1000],
        'history_id': reading_history.id
    })

@app.route('/api/interpret', methods=['POST'])
@login_required
def interpret_paper():
    """解读论文"""
    data = request.json
    
    if 'content' not in data or not data['content'].strip():
        return jsonify({'success': False, 'error': '没有论文内容'}), 400
    
    user = User.query.get(session['user_id'])
    
    # 准备用户数据
    user_data = {
        'reading_prep': user.reading_prep,
        'reading_purpose': user.reading_purpose,
        'reading_time': user.reading_time,
        'reading_style': user.reading_style,
        'reading_depth': user.reading_depth,
        'test_preferences': user.test_preferences,
        'chart_preferences': user.chart_preferences,
        'questionnaire_data': user.questionnaire_data
    }
    
    # 获取用户阅读历史
    recent_history = ReadingHistory.query.filter_by(user_id=user.id)\
        .order_by(ReadingHistory.uploaded_at.desc())\
        .limit(5)\
        .all()
    
    user_data['reading_history'] = [h.to_dict() for h in recent_history]
    
    # 调用DeepSeek API生成解读
    result = deepseek_api.generate_interpretation(user_data, data['content'])
    
    if not result['success']:
        return jsonify(result), 500
    
    # 生成思维导图
    mindmap_result = deepseek_api.generate_mindmap(data['content'])
    
    # 获取论文推荐
    recommendations = springer_api.get_recommendations(
        user.questionnaire_data,
        user_data['reading_history']
    )
    
    # 保存推荐到数据库
    for rec in recommendations[:3]:
        paper_rec = PaperRecommendation(
            user_id=user.id,
            title=rec.get('title', ''),
            authors=rec.get('authors', ''),
            journal=rec.get('journal', ''),
            url=rec.get('url', ''),
            doi=rec.get('doi', ''),
            abstract=rec.get('abstract', '')
        )
        db.session.add(paper_rec)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'interpretation': result['interpretation'],
        'mindmap': mindmap_result.get('mindmap') if mindmap_result['success'] else {},
        'recommendations': recommendations,
        'usage': result.get('usage', {})
    })

@app.route('/api/settings', methods=['GET', 'POST'])
@login_required
def user_settings():
    """获取或更新用户设置"""
    user = User.query.get(session['user_id'])
    
    if request.method == 'GET':
        return jsonify({
            'success': True,
            'settings': user.to_dict()
        })
    
    # POST请求：更新设置
    data = request.json
    
    # 更新用户设置
    updatable_fields = [
        'language', 'theme', 'font_size', 'font_family',
        'reading_prep', 'reading_purpose', 'reading_time',
        'reading_style', 'reading_depth', 'test_preferences',
        'chart_preferences'
    ]
    
    for field in updatable_fields:
        if field in data:
            setattr(user, field, data[field])
    
    # 更新用户设置表
    user_setting = UserSetting.query.filter_by(user_id=user.id).first()
    if not user_setting:
        user_setting = UserSetting(user_id=user.id)
        db.session.add(user_setting)
    
    if 'background_color' in data:
        user_setting.background_color = data['background_color']
    
    user_setting.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': '设置已更新',
            'settings': user.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/history', methods=['GET'])
@login_required
def get_history():
    """获取阅读历史"""
    user_id = session['user_id']
    history = ReadingHistory.query.filter_by(user_id=user_id)\
        .order_by(ReadingHistory.uploaded_at.desc())\
        .all()
    
    return jsonify({
        'success': True,
        'history': [h.to_dict() for h in history]
    })

@app.route('/api/history/<int:history_id>', methods=['GET', 'DELETE'])
@login_required
def manage_history(history_id):
    """获取或删除单个历史记录"""
    history = ReadingHistory.query.get_or_404(history_id)
    
    # 检查权限
    if history.user_id != session['user_id']:
        return jsonify({'success': False, 'error': '无权访问'}), 403
    
    if request.method == 'GET':
        # 更新查看次数和时间
        history.view_count += 1
        history.last_viewed = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'history': history.to_dict(),
            'content': history.paper_content,
            'interpretation': history.interpretation,
            'annotations': json.loads(history.annotations) if history.annotations else []
        })
    
    # DELETE请求：删除记录
    db.session.delete(history)
    db.session.commit()
    
    return jsonify({'success': True, 'message': '已删除'})

@app.route('/api/account/delete', methods=['POST'])
@login_required
def delete_account():
    """删除用户账户"""
    user = User.query.get(session['user_id'])
    
    try:
        # 删除用户及相关数据
        db.session.delete(user)
        db.session.commit()
        
        session.clear()
        
        return jsonify({
            'success': True,
            'message': '账户已删除'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/check_auth', methods=['GET'])
def check_auth():
    """检查认证状态"""
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        return jsonify({
            'authenticated': True,
            'user': user.to_dict() if user else None
        })
    return jsonify({'authenticated': False})

@app.route('/uploads/<filename>')
@login_required
def uploaded_file(filename):
    """访问上传的文件"""
    return send_from_directory(Config.UPLOAD_FOLDER, filename)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': '资源不存在'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': '服务器内部错误'}), 500

def init_db():
    """初始化数据库"""
    with app.app_context():
        db.create_all()
        print("数据库已初始化")

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=10000, debug=app.config.get('DEBUG', False))
