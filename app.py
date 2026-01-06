import os
import json
import tempfile
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file
from flask_cors import CORS
import requests
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import uuid
import logging
import concurrent.futures
import time
import base64

# 配置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB限制
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

CORS(app)

# API配置
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY')
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
SPRINGER_API_KEY = os.environ.get('SPRINGER_API_KEY')
SPRINGER_API_URL = "https://api.springernature.com/meta/v2/json"

# 用户数据文件路径
USERS_FILE = 'data/users.json'

def load_users():
    """加载用户数据"""
    try:
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_users(users_data):
    """保存用户数据"""
    os.makedirs('data', exist_ok=True)
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users_data, f, ensure_ascii=False, indent=2)

def get_user_by_email(email):
    """通过邮箱获取用户"""
    users = load_users()
    return users.get(email)

def create_user(email, username, password, questionnaire=None):
    """创建新用户"""
    users = load_users()
    if email in users:
        return False, "邮箱已存在"
    
    user_id = str(uuid.uuid4())
    user_data = {
        'id': user_id,
        'email': email,
        'username': username,
        'password_hash': generate_password_hash(password),
        'questionnaire': questionnaire or {},
        'settings': {
            'reading': {
                'preparation': 'B',
                'purpose': 'B',
                'time': 'B',
                'style': 'C',
                'depth': 'B',
                'test_type': 'B',
                'chart_types': ['A']
            },
            'visual': {
                'theme': 'B',
                'font_size': '18',
                'font_family': 'Microsoft YaHei',
                'custom_background': None
            },
            'language': 'zh'
        },
        'reading_history': [],
        'created_at': datetime.now().isoformat(),
        'last_login': None
    }
    
    users[email] = user_data
    save_users(users)
    return True, user_data

def update_user_settings(email, settings):
    """更新用户设置"""
    users = load_users()
    if email in users:
        users[email]['settings'] = settings
        save_users(users)
        return True
    return False

def add_to_history(email, history_item):
    """添加阅读历史"""
    users = load_users()
    if email in users:
        if 'reading_history' not in users[email]:
            users[email]['reading_history'] = []
        
        history_item['id'] = str(uuid.uuid4())
        history_item['timestamp'] = datetime.now().isoformat()
        users[email]['reading_history'].insert(0, history_item)
        
        # 保持最多50条历史记录
        users[email]['reading_history'] = users[email]['reading_history'][:50]
        save_users(users)
        return True
    return False

def get_history(email):
    """获取用户阅读历史"""
    users = load_users()
    if email in users:
        return users[email].get('reading_history', [])
    return []

def call_deepseek_api(user_data, paper_content, user_settings, history):
    """调用DeepSeek API，包含完整的用户画像分析"""
    # 检查API密钥是否配置
    if not DEEPSEEK_API_KEY:
        raise ValueError("DeepSeek API Key not configured")
    
    # 限制paper_content长度，防止API超时
    max_content_length = 10000  # 限制为1万字
    if len(paper_content) > max_content_length:
        paper_content = paper_content[:max_content_length] + "\n\n[注：内容过长，已截断部分内容]"
    
    # 构建简化的提示词
    system_prompt = """你是一位专业的自然科学论文解读助手，专门帮助高中生理解学术论文。请根据用户的个性化设置，生成适合高中生的论文解读。"""
    
    user_prompt = f"""用户是一位高中生，需要解读一篇自然科学学术论文。

论文内容：
{paper_content[:8000]}  # 进一步限制输入长度

解读要求：
1. 用通俗易懂的语言解释专业术语
2. 分析研究方法和实验设计
3. 总结主要发现和意义
4. 联系高中自然科学知识
5. 指出可能的局限性和未来研究方向
6. 在解读的最后附上"术语解读区"
7. 所有内容使用中文

请在解读的末尾添加："解读内容由DeepSeek AI生成，仅供参考"

请开始解读："""
    
    # 构建消息
    messages = [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": user_prompt
        }
    ]
    
    headers = {
        'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'model': 'deepseek-chat',
        'messages': messages,
        'temperature': 0.7,
        'max_tokens': 3000,  # 减少输出token数量
        'stream': False
    }
    
    try:
        # 设置更长的超时时间
        response = requests.post(DEEPSEEK_API_URL, json=payload, headers=headers, timeout=10000)
        response.raise_for_status()
        result = response.json()
        
        if 'choices' in result and len(result['choices']) > 0:
            return result['choices'][0]['message']['content']
        else:
            raise ValueError("No response from DeepSeek API")
            
    except requests.exceptions.Timeout:
        logger.error("DeepSeek API请求超时")
        raise Exception("AI处理超时，请稍后重试或缩短文本长度")
    except requests.exceptions.RequestException as e:
        logger.error(f"DeepSeek API error: {e}")
        raise

def analyze_user_profile(user_data):
    """根据问卷数据分析用户画像"""
    questionnaire = user_data.get('questionnaire', {})
    profile = {
        '知识储备': {},
        '学习方式偏好': {},
        '知识框架形式': '',
        '能力水平': {},
        '科学辨伪能力': '',
        '阅读关注点': '',
        '探究倾向': ''
    }
    
    # 1. 分析知识储备
    profile['知识储备'] = analyze_knowledge_reserve(questionnaire)
    
    # 2. 分析学习方式偏好
    if 'learning_styles' in questionnaire:
        profile['学习方式偏好'] = questionnaire['learning_styles']
    
    # 3. 分析知识框架形式
    if 'knowledge_structure' in questionnaire:
        structure_map = {
            'A': '线性递进式（注重知识深度递进）',
            'B': '网络联系式（注重学科间联系）',
            'C': '独立存储式（注重学科独立性）',
            'D': '零散工具箱式（知识框架尚未建立）'
        }
        profile['知识框架形式'] = structure_map.get(questionnaire['knowledge_structure'], '未知')
    
    # 4. 分析能力水平
    if 'scientific_abilities' in questionnaire:
        abilities = questionnaire['scientific_abilities']
        profile['能力水平'] = {
            '科学思考力': int(abilities.get('thinking', 3)),
            '科学洞察力': int(abilities.get('insight', 3)),
            '科学现象敏感度': int(abilities.get('sensitivity', 3)),
            '跨学科联系能力': int(abilities.get('interdisciplinary', 3))
        }
    
    # 5. 分析科学辨伪能力
    if 'paper_evaluation_score' in questionnaire:
        score = int(questionnaire['paper_evaluation_score'])
        if score >= 4:
            profile['科学辨伪能力'] = '较弱（需要加强批判性思维培养）'
        elif score == 3:
            profile['科学辨伪能力'] = '一般'
        else:
            profile['科学辨伪能力'] = '较强（具有一定辨伪能力）'
    
    # 6. 分析阅读关注点
    if 'evaluation_criteria' in questionnaire:
        criteria = questionnaire.get('evaluation_criteria', [])
        if 'E' in criteria:
            profile['阅读关注点'] = '凭感觉判断（缺乏系统评价标准）'
        elif criteria:
            criteria_map = {
                'A': '学术语言表达',
                'B': '科学技术方法',
                'C': '实验数据',
                'D': '科学理论'
            }
            main_criteria = criteria[0] if criteria else 'E'
            profile['阅读关注点'] = criteria_map.get(main_criteria, '多样化的评价标准')
    
    # 7. 分析探究倾向
    if 'climate_question' in questionnaire:
        climate_map = {
            'A': '关注社会影响与后果',
            'B': '关注现象成因与机制',
            'C': '关注技术解决方案',
            'D': '关注理论推导与学科联系',
            'E': '关注类似现象对比'
        }
        profile['探究倾向'] = climate_map.get(questionnaire['climate_question'], '未知')
    
    return profile

def analyze_knowledge_reserve(questionnaire):
    """分析用户的知识储备水平"""
    knowledge_reserve = {
        '课内知识': {},
        '课外知识': {},
        '本科预备水平': {}
    }
    
    # 1. 课内知识储备（根据教育体系和年级）
    if 'education_system' in questionnaire and 'grade' in questionnaire:
        system = questionnaire['education_system']
        grade = questionnaire['grade']
        
        if system == 'A':  # 国际体系
            knowledge_reserve['课内知识']['体系'] = '国际课程体系'
            # 根据年级推断课程内容
            grade_levels = {'A': '9年级', 'B': '10年级', 'C': '11年级', 'D': '12年级'}
            knowledge_reserve['课内知识']['年级'] = grade_levels.get(grade, '未知')
            knowledge_reserve['课内知识']['说明'] = '参考AP/AL/DSE/IGCSE等国际课程自然科学考纲'
        else:  # 普高体系
            knowledge_reserve['课内知识']['体系'] = '国内普高体系'
            grade_levels = {'A': '高一', 'B': '高二', 'C': '高三', 'D': '高三'}
            knowledge_reserve['课内知识']['年级'] = grade_levels.get(grade, '未知')
            knowledge_reserve['课内知识']['说明'] = '参考人教版教材自然科学课程内容'
    
    # 2. 课外知识储备（根据兴趣程度和学习频率）
    if 'interests' in questionnaire:
        interests = questionnaire['interests']
        learning_freq = questionnaire.get('learning_frequency', 'C')
        
        # 兴趣程度影响课外知识储备
        for subject, score in interests.items():
            if score and int(score) >= 4:  # 4-5分表示高兴趣
                subject_cn = {
                    'physics': '物理学',
                    'biology': '生物学/医学',
                    'chemistry': '化学',
                    'geology': '地理地质学',
                    'astronomy': '天体天文学'
                }.get(subject, subject)
                knowledge_reserve['课外知识'][subject_cn] = '较高（兴趣浓厚）'
        
        # 学习频率影响整体课外知识储备
        freq_map = {
            'A': '较高（经常学习课外知识）',
            'B': '中等（偶尔学习）',
            'C': '基础（较少学习）'
        }
        knowledge_reserve['课外知识']['整体水平'] = freq_map.get(learning_freq, '未知')
    
    # 3. 本科预备水平（根据学科问题正确率）
    correct_answers = {
        'physics_question': 'B',
        'chemistry_question': 'B',
        'biology_question': 'B',
        'astronomy_question': 'B',
        'geology_question': 'C'
    }
    
    for question, correct_answer in correct_answers.items():
        user_answer = questionnaire.get(question)
        subject = question.split('_')[0]
        subject_cn = {
            'physics': '物理学',
            'chemistry': '化学',
            'biology': '生物学',
            'astronomy': '天文学',
            'geology': '地球科学'
        }.get(subject, subject)
        
        if user_answer == correct_answer:
            knowledge_reserve['本科预备水平'][subject_cn] = '达到本科预备水平'
        elif user_answer:
            knowledge_reserve['本科预备水平'][subject_cn] = '未达本科预备水平'
        else:
            knowledge_reserve['本科预备水平'][subject_cn] = '未回答'
    
    return knowledge_reserve

def search_springer_papers(query, count=5):
    """搜索Springer论文"""
    if not SPRINGER_API_KEY:
        return []
    
    params = {
        'q': query,
        'api_key': SPRINGER_API_KEY,
        'p': count,
        's': 1
    }
    
    try:
        response = requests.get(SPRINGER_API_URL, params=params, timeout=150)
        response.raise_for_status()
        data = response.json()
        papers = []
        
        if 'records' in data:
            for record in data['records'][:count]:
                paper = {
                    'title': record.get('title', ''),
                    'authors': ', '.join([creator.get('creator', '') for creator in record.get('creators', [])]),
                    'publication': record.get('publicationName', ''),
                    'year': record.get('publicationDate', '')[:4] if record.get('publicationDate') else '',
                    'url': record.get('url', [{}])[0].get('value', '') if record.get('url') else '',
                    'abstract': record.get('abstract', '')[:200] + '...' if record.get('abstract') else ''
                }
                papers.append(paper)
        
        return papers
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Springer API error: {e}")
        return []

# 路由定义
@app.route('/')
def index():
    if 'user_email' in session:
        return render_template('index.html')
    else:
        return redirect(url_for('login_page'))

@app.route('/login', methods=['GET'])
def login_page():
    return render_template('index.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    questionnaire = data.get('questionnaire', {})
    
    if not all([email, username, password]):
        return jsonify({'success': False, 'message': '请填写所有必填项'}), 400
    
    success, result = create_user(email, username, password, questionnaire)
    
    if success:
        session['user_email'] = email
        session['user_id'] = result['id']
        return jsonify({'success': True, 'user': {
            'email': email,
            'username': username,
            'settings': result['settings']
        }})
    else:
        return jsonify({'success': False, 'message': result}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({'success': False, 'message': '请填写邮箱和密码'}), 400
    
    user = get_user_by_email(email)
    
    if user and check_password_hash(user['password_hash'], password):
        session['user_email'] = email
        session['user_id'] = user['id']
        
        # 更新最后登录时间
        users = load_users()
        if email in users:
            users[email]['last_login'] = datetime.now().isoformat()
            save_users(users)
        
        return jsonify({'success': True, 'user': {
            'email': email,
            'username': user['username'],
            'settings': user['settings']
        }})
    else:
        return jsonify({'success': False, 'message': '邮箱或密码错误'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/guest', methods=['POST'])
def guest_login():
    """游客登录"""
    guest_id = f"guest_{uuid.uuid4().hex[:8]}"
    session['user_email'] = guest_id
    session['user_id'] = guest_id
    session['is_guest'] = True
    
    return jsonify({'success': True, 'user': {
        'email': guest_id,
        'username': '访客用户',
        'is_guest': True
    }})

@app.route('/api/user/settings', methods=['GET'])
def get_settings():
    if 'user_email' not in session or session.get('is_guest'):
        return jsonify({'success': False, 'message': '未登录'}), 401
    
    user = get_user_by_email(session['user_email'])
    if not user:
        return jsonify({'success': False, 'message': '用户不存在'}), 404
    
    return jsonify({'success': True, 'settings': user['settings']})

@app.route('/api/user/settings', methods=['POST'])
def update_settings():
    if 'user_email' not in session or session.get('is_guest'):
        return jsonify({'success': False, 'message': '未登录'}), 401
    
    data = request.json
    if update_user_settings(session['user_email'], data.get('settings', {})):
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': '更新失败'}), 400

@app.route('/api/interpret', methods=['POST'])
def interpret():
    if 'user_email' not in session:
        return jsonify({'success': False, 'message': '未登录'}), 401

    file = request.files.get('file')
    text = request.form.get('text', '')

    if not file and not text.strip():
        return jsonify({'success': False, 'message': '请上传文件或输入文本'}), 400

    user = get_user_by_email(session['user_email'])
    if not user:
        return jsonify({'success': False, 'message': '用户不存在'}), 404

    try:
        paper_content = ""
        
        if file:
            # 获取文件名
            filename = secure_filename(file.filename) if file.filename else "uploaded_file"
            
            # 重置文件指针到开始位置
            file.seek(0)
            
            # 尝试读取文件内容
            try:
                # 读取原始字节
                file_bytes = file.read()
                
                # 尝试用不同编码解码文本
                encodings = ['utf-8', 'gbk', 'gb2312', 'latin-1', 'iso-8859-1']
                
                for encoding in encodings:
                    try:
                        paper_content = file_bytes.decode(encoding)
                        logger.info(f"成功使用 {encoding} 编码解码文件")
                        break
                    except UnicodeDecodeError:
                        continue
                
                # 如果所有编码都失败，将文件作为二进制发送给AI
                if not paper_content:
                    # 将二进制内容编码为base64
                    base64_content = base64.b64encode(file_bytes).decode('ascii')
                    paper_content = f"这是一个二进制文件，无法解码为文本。文件名: {filename}，文件大小: {len(file_bytes)} 字节，Base64编码内容的前1000字符: {base64_content[:1000]}..."
                    logger.info(f"无法解码文件，使用base64编码发送二进制数据")
            except Exception as read_error:
                logger.error(f"文件读取错误: {read_error}")
                paper_content = f"文件读取失败: {str(read_error)}。文件名: {filename}"
        else:
            paper_content = text

        # 限制文本长度，防止过长的请求
        max_text_length = 15000  # 增加到15000字
        if len(paper_content) > max_text_length:
            paper_content = paper_content[:max_text_length] + "\n\n[注：文本过长，已截断部分内容]"

        user_settings = user.get('settings', {})
        history = user.get('reading_history', [])

        # 调用DeepSeek API，添加超时处理
        try:
            start_time = time.time()
            interpretation = call_deepseek_api(user, paper_content, user_settings, history)
            logger.info(f"DeepSeek API调用完成，耗时: {time.time() - start_time:.2f}秒")
        except Exception as api_error:
            logger.error(f"DeepSeek API调用失败: {api_error}")
            return jsonify({'success': False, 'message': f'AI处理失败: {str(api_error)}'}), 500
        
        history_item = {
            'paper_content': paper_content[:500] + '...' if len(paper_content) > 500 else paper_content,
            'interpretation': interpretation[:1000] + '...' if len(interpretation) > 1000 else interpretation,
            'timestamp': datetime.now().isoformat()
        }
        
        add_to_history(session['user_email'], history_item)

        # 简化推荐搜索，使用简单的方法
        recommendations = []
        try:
            search_query = "natural science"
            if paper_content and len(paper_content) > 50:
                words = paper_content.split()[:3]  # 减少关键词数量
                search_query = ' '.join(words)
            
            # 直接调用搜索，设置超时
            recommendations = search_springer_papers(search_query, 2)
                    
        except Exception as search_error:
            logger.error(f"搜索论文失败: {search_error}")
            recommendations = []

        return jsonify({
            'success': True,
            'interpretation': interpretation,
            'original_content': paper_content[:1000] + '...' if len(paper_content) > 1000 else paper_content,
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Interpretation error: {e}")
        return jsonify({'success': False, 'message': f'处理失败: {str(e)}'}), 500

@app.route('/api/history', methods=['GET'])
def get_reading_history():
    if 'user_email' not in session or session.get('is_guest'):
        return jsonify({'success': False, 'message': '未登录'}), 401
    
    history = get_history(session['user_email'])
    return jsonify({'success': True, 'history': history})

@app.route('/api/delete-account', methods=['POST'])
def delete_account():
    if 'user_email' not in session or session.get('is_guest'):
        return jsonify({'success': False, 'message': '未登录'}), 401
    
    email = session['user_email']
    users = load_users()
    
    if email in users:
        del users[email]
        save_users(users)
        session.clear()
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'message': '用户不存在'}), 404

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    if 'user_email' in session:
        user = get_user_by_email(session['user_email'])
        if user:
            return jsonify({
                'success': True,
                'user': {
                    'email': session['user_email'],
                    'username': user.get('username', ''),
                    'is_guest': session.get('is_guest', False)
                }
            })
    return jsonify({'success': False}), 401

# 健康检查端点
@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/user/update-questionnaire', methods=['POST'])
def update_questionnaire():
    if 'user_email' not in session:
        return jsonify({'success': False, 'message': '未登录'}), 401
    
    data = request.json
    questionnaire = data.get('questionnaire', {})
    users = load_users()
    
    if session['user_email'] in users:
        users[session['user_email']]['questionnaire'] = questionnaire
        save_users(users)
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'message': '用户不存在'}), 404

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    if 'user_email' not in session:
        return jsonify({'success': False, 'message': '未登录'}), 401
    
    user = get_user_by_email(session['user_email'])
    if not user:
        return jsonify({'success': False, 'message': '用户不存在'}), 404
    
    return jsonify({
        'success': True,
        'user': {
            'email': user['email'],
            'username': user['username']
        },
        'questionnaire': user.get('questionnaire', {}),
        'profile_analysis': analyze_user_profile(user)
    })

@app.route('/static/lang/translations.json')
def get_translations():
    # 确保语言文件存在
    import os
    translations_path = os.path.join(app.static_folder, 'lang', 'translations.json')
    
    if os.path.exists(translations_path):
        return send_file(translations_path)
    else:
        # 返回默认翻译
        return jsonify({
            "zh": {"appName": "ANSAPRA - 高中生自然科学论文自适应阅读程序"},
            "en": {"appName": "ANSAPRA - Adaptive Natural Science Academic Paper Reading Agent"}
        })

# 调试端点，查看上传的文件信息
@app.route('/api/debug-upload', methods=['POST'])
def debug_upload():
    """调试用上传接口，显示文件详细信息"""
    file = request.files.get('file')
    
    if not file:
        return jsonify({'error': '没有文件'}), 400
    
    # 获取文件信息
    file.seek(0, 2)  # 移动到文件末尾
    file_size = file.tell()
    file.seek(0)  # 回到文件开头
    
    # 读取部分内容
    content_preview = file.read(200)
    file.seek(0)
    
    # 尝试解码
    encodings = ['utf-8', 'gbk', 'gb2312', 'latin-1', 'iso-8859-1']
    decoded_content = None
    
    for encoding in encodings:
        try:
            decoded_content = content_preview.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
    
    return jsonify({
        'filename': file.filename,
        'size': file_size,
        'content_type': file.content_type,
        'content_preview_hex': content_preview.hex()[:100],
        'content_preview_ascii': content_preview.decode('ascii', errors='ignore')[:100],
        'decoded_content': decoded_content,
        'success': True
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=True)
