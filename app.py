# app.py 顶部
import os
import json
import base64
import tempfile
import logging
import time
import uuid
from datetime import datetime

# Flask相关
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file
from flask_cors import CORS

# 工具库
import requests
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

# 初始化应用
app = Flask(__name__)

# 配置（确保在创建app之后）
def configure_app():
    app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB限制
    app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()
    app.config['TIMEOUT'] = 180  # 增加超时时间到180秒
    
    # API配置
    app.config['DEEPSEEK_API_KEY'] = os.environ.get('DEEPSEEK_API_KEY')
    app.config['SPRINGER_API_KEY'] = os.environ.get('SPRINGER_API_KEY', '')
    
    # API端点
    app.config['DEEPSEEK_CHAT_URL'] = "https://api.deepseek.com/v1/chat/completions"
    app.config['DEEPSEEK_FILES_URL'] = "https://api.deepseek.com/v1/files"
    
    # 用户数据文件路径
    app.config['USERS_FILE'] = 'data/users.json'

configure_app()
CORS(app)

# 创建logger
logger = logging.getLogger(__name__)

# 方便使用的变量
DEEPSEEK_API_KEY = app.config['DEEPSEEK_API_KEY']
DEEPSEEK_CHAT_URL = app.config['DEEPSEEK_CHAT_URL']
DEEPSEEK_FILES_URL = app.config['DEEPSEEK_FILES_URL']
USERS_FILE = app.config['USERS_FILE']

# ... 其他函数定义 ...

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
    if not DEEPSEEK_API_KEY:
        raise ValueError("DeepSeek API Key not configured")

    # 构建用户画像分析
    user_profile = analyze_user_profile(user_data)

    # 构建提示词
    system_prompt = """你是一位专业的自然科学论文解读助手，专门帮助高中生理解学术论文。请根据用户的个性化设置、知识框架问卷结果和用户画像，生成适合高中生的论文解读。"""
    
    user_prompt = f"""用户是一位高中生，需要解读一篇自然科学学术论文。请根据以下信息生成解读：

用户画像分析：
{json.dumps(user_profile, ensure_ascii=False, indent=2)}

用户个性化设置：
{json.dumps(user_settings, ensure_ascii=False, indent=2)}

用户知识框架问卷详细结果：
{json.dumps(user_data.get('questionnaire', {}), ensure_ascii=False, indent=2)}

过往阅读记录（最近5条）：
{json.dumps(history[:5], ensure_ascii=False, indent=2)}

需要解读的论文内容：
{paper_content}

解读要求：
1. 根据用户画像中的知识储备水平，调整解读的深度和广度
2. 根据用户的学习方式偏好，采用对应的解读方式
3. 根据用户的知识框架形式，组织解读内容的逻辑结构
4. 根据用户的各项能力评分，在解读中适当引导和提升薄弱能力
5. 根据用户的科学辨伪能力，在解读中强调批判性思维的重要性
6. 句子简短、清晰，避免冗长
7. 逻辑清晰地分出小标题，有条理地分开各部分
8. 遵循论文本身的分段逻辑
9. 只进行论文内容的解读，不生成其他内容
10. 注重用户知识框架的薄弱点，发挥用户的长处
11. 在解读的最后附上"术语解读区"
12. 所有内容使用中文
13. 不要对文本长度进行限制

请在解读的末尾添加："解读内容由DeepSeek AI生成，仅供参考"

请开始解读："""

    headers = {
        'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
        'Content-Type': 'application/json'
    }

    payload = {
        'model': 'deepseek-chat',
        'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_prompt}
        ],
        'temperature': 0.7,
        'max_tokens': 8000,
        'stream': False
    }

    try:
        response = requests.post(DEEPSEEK_API_URL, json=payload, headers=headers, timeout=180)
        response.raise_for_status()
        result = response.json()
        
        if 'choices' in result and len(result['choices']) > 0:
            return result['choices'][0]['message']['content']
        else:
            raise ValueError("No response from DeepSeek API")
            
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
        response = requests.get(SPRINGER_API_URL, params=params, timeout=30)
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

# 修改原有的interpret函数，支持文件上传到DeepSeek
import base64

def upload_file_to_deepseek(file_path, filename, purpose="assistants"):
    """上传文件到DeepSeek API并返回文件ID"""
    if not DEEPSEEK_API_KEY:
        raise Exception("DeepSeek API密钥未配置")
    
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
    }
    
    try:
        with open(file_path, 'rb') as file:
            files = {
                'purpose': (None, purpose),
                'file': (filename, file, 'application/octet-stream')
            }
            
            logger.info(f"开始上传文件到DeepSeek: {filename}")
            response = requests.post(
                DEEPSEEK_FILES_URL, 
                headers=headers, 
                files=files,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                file_id = result.get('id')
                logger.info(f"文件上传成功，文件ID: {file_id}")
                return file_id
            else:
                logger.error(f"DeepSeek文件上传失败: {response.status_code} - {response.text}")
                raise Exception(f"文件上传失败: {response.status_code}")
                
    except requests.exceptions.Timeout:
        logger.error("文件上传超时")
        raise Exception("文件上传超时，请稍后重试")
    except Exception as e:
        logger.error(f"文件上传异常: {str(e)}")
        raise Exception(f"文件上传失败: {str(e)}")

def call_deepseek_api_with_files(messages, file_ids=None, max_tokens=4000):
    """调用DeepSeek API，支持文件"""
    if not DEEPSEEK_API_KEY:
        raise Exception("DeepSeek API密钥未配置")
    
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # 如果有文件ID，添加到消息中
    if file_ids and len(file_ids) > 0:
        for message in messages:
            if message['role'] == 'user':
                message['file_ids'] = file_ids
                break
    
    data = {
        "model": "deepseek-chat",
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.7,
        "stream": False
    }
    
    try:
        logger.info(f"调用DeepSeek API，消息数量: {len(messages)}")
        response = requests.post(
            DEEPSEEK_CHAT_URL, 
            headers=headers, 
            json=data, 
            timeout=60
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"DeepSeek API调用失败: {response.status_code} - {response.text}")
            raise Exception(f"API调用失败: {response.status_code}")
            
    except requests.exceptions.Timeout:
        logger.error("DeepSeek API调用超时")
        raise Exception("API调用超时，请稍后重试")
    except Exception as e:
        logger.error(f"DeepSeek API调用异常: {str(e)}")
        raise Exception(f"API调用失败: {str(e)}")

@app.route('/api/interpret', methods=['POST'])
def interpret():
    start_time = time.time()
    try:
        file = request.files.get('file')
        text = request.form.get('text', '')
        
        logger.info(f"收到解读请求，文件: {file.filename if file else '无'}, 文本长度: {len(text)}")
        
        if not file and not text:
            return jsonify({"success": False, "message": "请上传文件或输入文本"})
        
        # 检查API密钥
        if not DEEPSEEK_API_KEY:
            logger.error("DeepSeek API密钥未配置")
            return jsonify({"success": False, "message": "API配置错误，请联系管理员"})
        
        file_ids = []
        
        # 处理文件上传
        if file:
            filename = secure_filename(file.filename)
            file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
            
            # 检查文件类型
            allowed_extensions = ['pdf', 'docx', 'txt']
            if file_ext not in allowed_extensions:
                return jsonify({"success": False, "message": f"只支持{', '.join(allowed_extensions)}格式"})
            
            # 检查文件大小
            file.seek(0, 2)  # 移动到文件末尾
            file_size = file.tell()  # 获取文件大小
            file.seek(0)  # 重置文件指针
            
            max_size = 16 * 1024 * 1024  # 16MB
            if file_size > max_size:
                return jsonify({"success": False, "message": f"文件大小不能超过{max_size//1024//1024}MB"})
            
            try:
                # 保存临时文件
                import tempfile
                temp_dir = tempfile.gettempdir()
                temp_path = os.path.join(temp_dir, f"upload_{uuid.uuid4().hex}.{file_ext}")
                file.save(temp_path)
                logger.info(f"文件保存到临时路径: {temp_path}, 大小: {file_size}字节")
                
                # 上传文件到DeepSeek
                file_id = upload_file_to_deepseek(temp_path, filename)
                file_ids.append(file_id)
                
                # 清理临时文件
                try:
                    os.remove(temp_path)
                except:
                    pass
                
            except Exception as e:
                logger.error(f"文件处理失败: {str(e)}")
                # 如果文件上传失败，尝试备选方案
                if text:
                    # 如果有文本输入，继续使用文本
                    logger.info("文件上传失败，使用文本输入")
                else:
                    return jsonify({"success": False, "message": f"文件处理失败: {str(e)}"})
        
        # 构建消息
        messages = [
            {
                "role": "system",
                "content": """你是一个自然科学论文解读助手，专门帮助高中生理解复杂的学术论文。
                
                解读要求：
                1. 用通俗易懂的语言解释专业术语
                2. 分析研究方法和实验设计
                3. 总结主要发现和意义
                4. 联系高中自然科学知识
                5. 指出可能的局限性和未来研究方向
                
                请使用中文回复，结构清晰，层次分明。"""
            }
        ]
        
        user_content = ""
        if text:
            user_content = text
        elif file:
            user_content = f"请解读我上传的这篇自然科学论文文件"
        else:
            user_content = "请解读这篇论文"
        
        messages.append({
            "role": "user",
            "content": user_content
        })
        
        # 调用DeepSeek API
        logger.info(f"调用DeepSeek API，文件ID数量: {len(file_ids)}")
        result = call_deepseek_api_with_files(messages, file_ids if file_ids else None)
        
        # 提取回复内容
        if result and 'choices' in result and len(result['choices']) > 0:
            interpretation = result['choices'][0]['message']['content']
            
            # 构建原始内容预览
            original_preview = ""
            if text:
                original_preview = text[:500] + "..." if len(text) > 500 else text
            elif file:
                original_preview = f"文件: {filename} (已上传至DeepSeek进行直接处理)"
            
            # 构建返回结果
            response_data = {
                "success": True,
                "original_content": original_preview,
                "interpretation": interpretation,
                "recommendations": get_recommendations(interpretation),
                "processing_time": round(time.time() - start_time, 2)
            }
            
            # 保存到用户历史
            if 'user' in session:
                add_to_history(session['user'], {
                    "original": original_preview[:200],
                    "interpretation": interpretation[:200],
                    "timestamp": datetime.now().isoformat(),
                    "file": file.filename if file else None
                })
            
            logger.info(f"解读成功，处理时间: {response_data['processing_time']}秒")
            return jsonify(response_data)
        else:
            logger.error("DeepSeek API返回格式错误")
            return jsonify({"success": False, "message": "API返回格式错误"})
            
    except Exception as e:
        logger.error(f"解读失败: {str(e)}", exc_info=True)
        return jsonify({"success": False, "message": f"解读失败: {str(e)}"})

def get_recommendations(interpretation):
    """获取相关论文推荐"""
    # 这里可以调用Springer API或其他学术数据库API
    # 简化版本，返回静态数据
    return [
        {
            "title": "Climate Change Impacts on Marine Ecosystems: A Comprehensive Review",
            "authors": "Smith, J., Johnson, A., Williams, R.",
            "publication": "Nature Climate Change",
            "year": "2023",
            "abstract": "This review synthesizes current knowledge on the multifaceted impacts of climate change on marine ecosystems...",
            "url": "https://www.nature.com/articles/s41558-023-01614-7"
        },
        {
            "title": "Adaptive Responses of Coral Reefs to Ocean Acidification",
            "authors": "Chen, L., Wang, Y., Tanaka, K.",
            "publication": "Science",
            "year": "2022",
            "abstract": "Investigating the physiological and genetic adaptations of coral species to changing ocean chemistry...",
            "url": "https://www.science.org/doi/10.1126/science.abo0393"
        }
    ]

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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=True)

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
        'profile_analysis': analyze_user_profile(user)  # 返回用户画像分析
    })

from flask import request, jsonify
import os
from werkzeug.utils import secure_filename

# 配置文件上传
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # 确保上传目录存在
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        file.save(file_path)
        
        # 这里可以添加文件处理逻辑
        # process_file(file_path)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'message': 'File uploaded successfully'
        }), 200
    
    return jsonify({'error': 'File type not allowed'}), 400
    
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file, send_from_directory
import os
import json

# 语言文件路由 - 修复版本
@app.route('/api/language/translations')
def get_translations():
    """获取翻译文件"""
    try:
        # 根据请求参数确定语言
        lang = request.args.get('lang', 'en')
        file_path = os.path.join(app.root_path, 'static', 'lang', f'translations_{lang}.json')
        
        # 如果指定语言的翻译文件不存在，使用默认的英语文件
        if not os.path.exists(file_path):
            file_path = os.path.join(app.root_path, 'static', 'lang', 'translations_en.json')
        
        # 检查文件是否存在
        if not os.path.exists(file_path):
            return jsonify({'error': 'Translations file not found'}), 404
        
        # 读取并返回JSON文件
        with open(file_path, 'r', encoding='utf-8') as f:
            translations = json.load(f)
        
        return jsonify(translations)
    
    except Exception as e:
        app.logger.error(f"Error loading translations: {str(e)}")
        return jsonify({'error': str(e)}), 500

# 或者使用单个翻译文件的方式
@app.route('/static/lang/translations.json')
def serve_translations():
    """提供翻译文件"""
    translations_path = os.path.join(app.static_folder, 'lang', 'translations.json')
    
    # 检查文件是否存在
    if not os.path.exists(translations_path):
        # 创建默认的翻译文件
        default_translations = {
            'en': {
                'ANSAPRA': 'ANSAPRA',
                'Adaptive Natural Science Academic Paper Reading Agent for High School Students': 'Adaptive Natural Science Academic Paper Reading Agent for High School Students',
                'Website Introduction': 'Website Introduction',
                'User Guide': 'User Guide',
                'Paper Interpretation': 'Paper Interpretation',
                'User Settings': 'User Settings',
                'Login': 'Login',
                'Register': 'Register',
                'Email Address': 'Email Address',
                'Password': 'Password',
                'Upload Paper': 'Upload Paper',
                'Start Interpretation': 'Start Interpretation',
                # 添加更多翻译...
            },
            'zh': {
                'ANSAPRA': 'ANSAPRA',
                'Adaptive Natural Science Academic Paper Reading Agent for High School Students': '面向高中生的自适应自然科学学术论文阅读助手',
                'Website Introduction': '网站介绍',
                'User Guide': '用户指南',
                'Paper Interpretation': '论文解读',
                'User Settings': '用户设置',
                'Login': '登录',
                'Register': '注册',
                'Email Address': '邮箱地址',
                'Password': '密码',
                'Upload Paper': '上传论文',
                'Start Interpretation': '开始解读',
                # 添加更多翻译...
            }
        }
        
        # 创建目录
        os.makedirs(os.path.dirname(translations_path), exist_ok=True)
        
        # 写入默认翻译文件
        with open(translations_path, 'w', encoding='utf-8') as f:
            json.dump(default_translations, f, ensure_ascii=False, indent=2)
    
    return send_from_directory(os.path.dirname(translations_path), 
                               os.path.basename(translations_path))
