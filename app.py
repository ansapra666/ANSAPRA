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

# API配置 - 确保这些变量已定义
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY')
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"  # 确保这行存在
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
    
    # 构建消息 - 这是您要求的消息模板
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

# 添加PDF处理的辅助函数
def extract_text_from_pdf(file):
    """提取PDF文件中的文本"""
    try:
        from PyPDF2 import PdfReader
        
        # 确保文件指针在开头
        file.seek(0)
        
        # 创建内存中的PDF读取器
        pdf_reader = PdfReader(file)
        text_content = ""
        
        for i, page in enumerate(pdf_reader.pages):
            try:
                page_text = page.extract_text()
                if page_text:
                    text_content += f"第{i+1}页:\n{page_text}\n\n"
                else:
                    text_content += f"第{i+1}页: [无文本内容]\n\n"
            except Exception as page_error:
                logger.warning(f"第{i+1}页提取失败: {page_error}")
                text_content += f"第{i+1}页: [提取失败]\n\n"
        
        return text_content
        
    except Exception as e:
        logger.error(f"PDF提取失败: {e}")
        raise Exception(f"PDF文件解析失败: {str(e)}")

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
        
        if file and file.filename:
            filename = secure_filename(file.filename)
            file_ext = os.path.splitext(filename)[1].lower()
            
            # 只支持PDF、DOCX、TXT格式
            if file_ext not in ['.pdf', '.docx', '.txt']:
                return jsonify({'success': False, 'message': f'不支持的文件格式: {file_ext}，请上传PDF、DOCX或TXT文件'}), 400

            if file_ext == '.txt':
                # 直接读取文本文件
                paper_content = file.read().decode('utf-8', errors='ignore')
                
            elif file_ext == '.pdf':
                try:
                    # 重置文件指针
                    file.seek(0)
                    
                    # 读取PDF文件内容到内存
                    pdf_bytes = file.read()
                    
                    # 使用BytesIO创建内存中的文件对象
                    from io import BytesIO
                    pdf_file = BytesIO(pdf_bytes)
                    
                    # 使用PyPDF2解析PDF
                    from PyPDF2 import PdfReader
                    pdf_reader = PdfReader(pdf_file)
                    paper_content = ""
                    
                    for page_num in range(len(pdf_reader.pages)):
                        page = pdf_reader.pages[page_num]
                        page_text = page.extract_text()
                        if page_text:
                            paper_content += f"第{page_num+1}页:\n{page_text}\n\n"
                    
                    if not paper_content.strip():
                        paper_content = "PDF文件已上传，但未能提取到文本内容。这可能是因为PDF是扫描件或包含图像文字。"
                        
                except Exception as pdf_error:
                    logger.error(f"PDF解析错误: {pdf_error}")
                    paper_content = f"PDF文件处理失败: {str(pdf_error)}\n"
                    paper_content += "文件已上传，将尝试使用原始字节进行处理。"
                    
                    # 如果解析失败，至少返回文件信息
                    file.seek(0)
                    file_size = len(file.read())
                    paper_content += f"\n文件名: {filename}\n"
                    paper_content += f"文件大小: {file_size} 字节\n"
                    paper_content += "注：请确保PDF文件包含可提取的文本（非扫描件）。"
                    
            elif file_ext == '.docx':
                try:
                    # 重置文件指针
                    file.seek(0)
                    
                    # 使用python-docx读取DOCX文件
                    from io import BytesIO
                    import docx
                    
                    docx_file = BytesIO(file.read())
                    doc = docx.Document(docx_file)
                    paper_content = ""
                    
                    for paragraph in doc.paragraphs:
                        if paragraph.text.strip():
                            paper_content += paragraph.text + "\n"
                    
                    if not paper_content.strip():
                        paper_content = "DOCX文件已上传，但未能提取到文本内容。"
                        
                except Exception as docx_error:
                    logger.error(f"DOCX解析错误: {docx_error}")
                    paper_content = f"DOCX文件处理失败: {str(docx_error)}\n"
                    paper_content += "文件已上传，请检查文件格式。"
                    
        else:
            paper_content = text

        if not paper_content or paper_content.strip() == "":
            return jsonify({'success': False, 'message': '文件内容为空或无法读取'}), 400

        user_settings = user.get('settings', {})
        history = user.get('reading_history', [])

        # 调用DeepSeek API
        interpretation = call_deepseek_api(user, paper_content, user_settings, history)
        
        history_item = {
            'paper_content': paper_content[:500] + '...' if len(paper_content) > 500 else paper_content,
            'interpretation': interpretation[:1000] + '...' if len(interpretation) > 1000 else interpretation,
            'timestamp': datetime.now().isoformat()
        }
        
        add_to_history(session['user_email'], history_item)

        search_query = "natural science"
        if paper_content:
            words = paper_content.split()[:10]
            search_query = ' '.join(words)

        recommendations = search_springer_papers(search_query, 3)

        return jsonify({
            'success': True,
            'interpretation': interpretation,
            'original_content': paper_content,
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
        'profile_analysis': analyze_user_profile(user)  # 返回用户画像分析
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=True)
