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
import time
import io

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

def extract_text_from_pdf_advanced(file_bytes):
    """
    高级PDF解析：尝试多种方法提取文本
    返回：(success, text_or_error_message)
    """
    try:
        # 方法1：先尝试PyPDF2
        try:
            from PyPDF2 import PdfReader
            
            pdf_file = io.BytesIO(file_bytes)
            pdf_reader = PdfReader(pdf_file)
            
            # 检查PDF是否加密
            if pdf_reader.is_encrypted:
                try:
                    # 尝试用空密码解密
                    pdf_reader.decrypt('')
                except:
                    return False, "PDF文件已加密，无法读取内容。请上传未加密的PDF文件。"
            
            text_content = ""
            total_pages = len(pdf_reader.pages)
            max_pages = min(total_pages, 10)
            
            for page_num in range(max_pages):
                try:
                    page = pdf_reader.pages[page_num]
                    page_text = page.extract_text()
                    
                    if page_text and page_text.strip():
                        # 检查提取的文本是否包含可读字符（非乱码）
                        readable_chars = sum(1 for c in page_text if c.isprintable() or c.isspace())
                        if readable_chars / len(page_text) > 0.7:  # 70%以上是可读字符
                            text_content += f"第{page_num+1}页:\n{page_text}\n\n"
                except Exception as page_error:
                    continue
            
            if text_content.strip():
                logger.info(f"PyPDF2成功提取文本，长度: {len(text_content)}")
                return True, text_content
        except Exception as e:
            logger.warning(f"PyPDF2解析失败: {e}")
        
        # 方法2：尝试pdfplumber（如果安装）
        try:
            import pdfplumber
            
            pdf_file = io.BytesIO(file_bytes)
            text_content = ""
            
            with pdfplumber.open(pdf_file) as pdf:
                total_pages = len(pdf.pages)
                max_pages = min(total_pages, 10)
                
                for page_num in range(max_pages):
                    try:
                        page = pdf.pages[page_num]
                        page_text = page.extract_text()
                        
                        if page_text and page_text.strip():
                            text_content += f"第{page_num+1}页:\n{page_text}\n\n"
                    except:
                        continue
            
            if text_content.strip():
                logger.info(f"pdfplumber成功提取文本，长度: {len(text_content)}")
                return True, text_content
        except ImportError:
            logger.warning("pdfplumber未安装")
        except Exception as e:
            logger.warning(f"pdfplumber解析失败: {e}")
        
        # 方法3：尝试pdfminer.six（更强大的解析器）
        try:
            from pdfminer.high_level import extract_text as pdfminer_extract_text
            from pdfminer.pdfparser import PDFSyntaxError
            
            pdf_file = io.BytesIO(file_bytes)
            
            try:
                text_content = pdfminer_extract_text(pdf_file)
            except PDFSyntaxError:
                # 可能不是标准PDF，尝试其他方法
                text_content = ""
            
            if text_content and text_content.strip():
                logger.info(f"pdfminer成功提取文本，长度: {len(text_content)}")
                return True, text_content
        except ImportError:
            logger.warning("pdfminer未安装")
        except Exception as e:
            logger.warning(f"pdfminer解析失败: {e}")
        
        # 所有方法都失败，可能是扫描件
        return False, """
PDF文件解析失败，可能是以下原因：

1. **PDF是扫描件/图片**：文件由图片组成，需要OCR识别才能提取文字
2. **PDF使用特殊字体/编码**：使用了不常见的字体或编码方式
3. **PDF已损坏或加密**：文件可能已损坏或被加密

建议：
1. 上传可复制文字的PDF文件（非扫描件）
2. 或者直接复制PDF中的文字粘贴到文本框中
3. 或者将扫描件转换为可编辑的PDF（使用Adobe Acrobat等工具）

如果您确定PDF包含可复制文字但仍失败，请通过调试接口检查文件：/api/debug/pdf
"""
        
    except Exception as e:
        logger.error(f"PDF解析过程中发生未知错误: {e}")
        return False, f"PDF解析失败: {str(e)}"

def is_pdf_scanned(file_bytes):
    """简单判断PDF是否为扫描件"""
    try:
        # 检查文件头是否是PDF
        if len(file_bytes) < 5 or file_bytes[:5] != b'%PDF-':
            return True, "不是有效的PDF文件"
        
        # 尝试提取文本
        from PyPDF2 import PdfReader
        
        pdf_file = io.BytesIO(file_bytes)
        pdf_reader = PdfReader(pdf_file)
        
        if len(pdf_reader.pages) == 0:
            return True, "PDF没有页面"
        
        # 检查第一页是否有文本
        try:
            first_page = pdf_reader.pages[0]
            text = first_page.extract_text()
            
            if not text or not text.strip():
                return True, "PDF第一页没有提取到文字，可能是扫描件"
            
            # 检查提取的文本质量
            readable_chars = sum(1 for c in text if c.isprintable() or c.isspace())
            if readable_chars / len(text) < 0.3:  # 可读字符少于30%
                return True, "提取的文字大多是乱码，可能是扫描件或特殊编码"
            
            return False, "可能是文本型PDF"
            
        except:
            return True, "无法提取PDF文字"
            
    except Exception as e:
        return True, f"PDF检查失败: {str(e)}"

def call_deepseek_api(user_data, paper_content, user_settings, history, questionnaire=None, chat_history=None):
    """调用DeepSeek API，根据用户画像、历史记录和问卷数据生成个性化解读"""
    if not DEEPSEEK_API_KEY:
        raise ValueError("DeepSeek API Key not configured")
    
    # 限制paper_content长度，防止API超时
    max_content_length = 5000
    if len(paper_content) > max_content_length:
        paper_content = paper_content[:max_content_length] + "\n\n[注：内容过长，已截断部分内容]"
    
    # 获取用户问卷数据
    if questionnaire is None and user_data:
        questionnaire = user_data.get('questionnaire', {})
    
    # 分析用户画像
    profile_analysis = analyze_user_profile(user_data) if user_data else {}
    
    # 构建详细提示词
    language = user_settings.get('language', 'zh') if user_settings else 'zh'
    
    if language == 'en':
        system_prompt = """You are a professional natural science paper interpretation assistant, specially designed to help high school students understand academic papers. Please generate paper interpretations according to the user's personalized needs."""
    else:
        system_prompt = """你是一位专业的自然科学论文解读助手，专门帮助高中生理解学术论文。请根据用户的个性化需求生成论文解读。"""
    
    # 构建用户画像和历史记录描述
    user_context = ""
    if user_data and questionnaire:
        if language == 'en':
            user_context = f"""
User Profile Analysis:
1. Knowledge Reserve: {profile_analysis.get('知识储备', {})}
2. Learning Style Preferences: {profile_analysis.get('学习方式偏好', {})}
3. Knowledge Framework Form: {profile_analysis.get('知识框架形式', '')}
4. Ability Level: {profile_analysis.get('能力水平', {})}
5. Scientific Discrimination Ability: {profile_analysis.get('科学辨伪能力', '')}
6. Reading Focus: {profile_analysis.get('阅读关注点', '')}
7. Inquiry Tendency: {profile_analysis.get('探究倾向', '')}
"""
        else:
            user_context = f"""
用户画像分析：
1. 知识储备：{profile_analysis.get('知识储备', {})}
2. 学习方式偏好：{profile_analysis.get('学习方式偏好', {})}
3. 知识框架形式：{profile_analysis.get('知识框架形式', '')}
4. 能力水平：{profile_analysis.get('能力水平', {})}
5. 科学辨伪能力：{profile_analysis.get('科学辨伪能力', '')}
6. 阅读关注点：{profile_analysis.get('阅读关注点', '')}
7. 探究倾向：{profile_analysis.get('探究倾向', '')}
"""
    
    # 构建历史记录描述
    history_context = ""
    if history and len(history) > 0:
        if language == 'en':
            history_context = "Previous reading history (especially paper subjects and keywords) can help illustrate the user's reading interests and preferences:\n"
            for i, item in enumerate(history[:3]):  # 取最近3条
                history_context += f"{i+1}. {item.get('paper_content', '')[:100]}...\n"
        else:
            history_context = "过往阅读历史（尤其是论文的科目和关键词）可以帮助说明用户的阅读兴趣和阅读类型偏好：\n"
            for i, item in enumerate(history[:3]):  # 取最近3条
                history_context += f"{i+1}. {item.get('paper_content', '')[:100]}...\n"
    
    # 构建完整的用户提示
    if language == 'en':
        user_prompt = f"""
a) The user is a high school student who needs to interpret a natural science academic paper.
b) The specific personalized interpretation settings, past reading data, personal natural science knowledge framework questionnaire, and the paper file for this interpretation have been transmitted. Please generate an interpretation that meets all personalized needs based on the user's input paper.
c) To help improve the user's knowledge framework, focus on the weak points of the user's knowledge framework during interpretation, leverage the user's strengths in natural sciences, and focus on cultivating the user's interest in natural sciences.
d) The user's past reading history, especially the subjects and keywords of papers, can help illustrate the user's reading interests and preferences.
e) When interpreting, sentences should not be lengthy; they should be short and clear.
f) Divide the interpretation content into logical sections with clear subtitles. The final output should be divided into: Paper Core Overview (Research Background and Purpose, Research Methods and Theory, Research Findings and Significance), Terminology Interpretation Section (do not be brief, explain high-difficulty terms in detail), Self-Assessment Questions, and Post-Reading Thinking Questions.
g) Only interpret the paper content; no additional content needs to be generated.
h) The generated interpretation must be in English.
i) The interpretation must end with the reference: "Interpretation content generated by DeepSeek AI, for reference only."

User Context:
{user_context}

{history_context}

Paper Content:
{paper_content[:3000]}

Please generate the interpretation:
"""
    else:
        user_prompt = f"""
a) 用户是一位高中生，需要解读一篇自然科学学术论文。
b) 其具体个性化解读方式设置数据、过往阅读数据、个人自然科学知识框架问卷、本次解读的论文文件已经传送，请根据用户输入的论文，生成一篇符合所有个性化需求的解读内容。
c) 为了帮助完善用户的知识框架，可以在解读时注重用户知识框架的薄弱点，并发挥用户在自然科学方面的长处，着重引导培养用户在自然科学方面的兴趣。
d) 用户的过往阅读历史，尤其是论文的科目和关键词，可以帮助说明用户的阅读兴趣和阅读类型偏好。
e) 解读时，句子不能冗长，要求简短、清晰。
f) 尽可能逻辑清晰地分出小标题，有条理地分开解读内容的各部分。最终输出的内容要分为论文核心概述（研究背景与目的、研究方法与理论、研究发现与意义）、术语解读部分（不要简短，多解释一些高难度术语）、自测小问题、读后思考问题。
g) 只进行论文内容的解读，不需要额外生成其他内容。
h) 生成的解读内容需要是中文。
i) 解读的末尾必须有参考字样：解读内容由DeepSeek AI生成，仅供参考。

用户画像：
{user_context}

{history_context}

论文内容：
{paper_content[:3000]}

请开始生成解读：
"""
    
    # 如果有聊天历史，添加到消息中
    messages = [{"role": "system", "content": system_prompt}]
    
    # 如果是聊天模式，添加历史对话
    if chat_history:
        for chat in chat_history[-6:]:  # 只保留最近6条对话
            messages.append({"role": "user", "content": chat.get("question", "")})
            messages.append({"role": "assistant", "content": chat.get("answer", "")})
    
    messages.append({"role": "user", "content": user_prompt})
    
    headers = {
        'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'model': 'deepseek-chat',
        'messages': messages,
        'temperature': 0.7,
        'max_tokens': 2500,  # 增加输出token数量
        'stream': False
    }
    
    try:
        response = requests.post(DEEPSEEK_API_URL, json=payload, headers=headers, timeout=60)
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
        file_info = {}
        is_scanned_pdf = False
        pdf_warning = ""
        
        if file and file.filename:
            filename = secure_filename(file.filename)
            file_ext = os.path.splitext(filename)[1].lower()
            
            # 重置文件指针
            file.seek(0)
            file_bytes = file.read()
            file_info = {
                'filename': filename,
                'size': len(file_bytes),
                'extension': file_ext
            }
            
            if file_ext == '.pdf':
                # 先检查PDF是否是扫描件
                is_scanned, scan_message = is_pdf_scanned(file_bytes)
                
                if is_scanned:
                    is_scanned_pdf = True
                    pdf_warning = f"检测到可能是扫描件: {scan_message}"
                    logger.warning(f"扫描件警告: {pdf_warning}")
                
                # 使用高级PDF解析
                success, result = extract_text_from_pdf_advanced(file_bytes)
                
                if success:
                    paper_content = result
                    logger.info(f"PDF解析成功，提取文本长度: {len(paper_content)}")
                else:
                    # 解析失败
                    logger.error(f"PDF解析失败: {result}")
                    
                    if is_scanned_pdf:
                        # 如果是扫描件，提供更详细的建议
                        paper_content = f"""
{pdf_warning}

扫描件PDF无法直接提取文字，因为它们是图片格式。

解决方法：
1. **使用OCR软件**：如Adobe Acrobat Pro、ABBYY FineReader等将扫描PDF转换为可编辑PDF
2. **在线OCR工具**：使用在线服务转换
3. **直接输入文本**：复制PDF中的文字（如果可以选中）粘贴到文本框中
4. **重新上传**：上传可复制文字的PDF版本

如果您有可编辑的PDF版本，请重新上传。
"""
                    else:
                        paper_content = result
                    
            elif file_ext == '.docx':
                try:
                    # 使用python-docx读取DOCX文件
                    from io import BytesIO
                    import docx
                    
                    docx_file = BytesIO(file_bytes)
                    doc = docx.Document(docx_file)
                    
                    for paragraph in doc.paragraphs:
                        if paragraph.text.strip():
                            paper_content += paragraph.text + "\n"
                    
                    if not paper_content.strip():
                        paper_content = "DOCX文件已上传，但未能提取到文本内容。"
                        
                except Exception as docx_error:
                    logger.error(f"DOCX解析错误: {docx_error}")
                    paper_content = f"DOCX文件处理失败: {str(docx_error)}"
                    
            elif file_ext == '.txt':
                # 尝试多种编码读取文本文件
                encodings = ['utf-8', 'gbk', 'gb2312', 'latin-1', 'iso-8859-1']
                for encoding in encodings:
                    try:
                        paper_content = file_bytes.decode(encoding)
                        logger.info(f"文本文件使用 {encoding} 编码成功解码")
                        break
                    except UnicodeDecodeError:
                        continue
                
                if not paper_content:
                    paper_content = "无法解码文本文件，请确保文件编码为UTF-8或GBK"
                    
            else:
                # 对于其他格式，尝试作为文本读取
                encodings = ['utf-8', 'gbk', 'gb2312', 'latin-1']
                for encoding in encodings:
                    try:
                        paper_content = file_bytes.decode(encoding, errors='ignore')
                        if len(paper_content) > 100:  # 有足够内容才认为成功
                            logger.info(f"文件使用 {encoding} 编码解码成功")
                            break
                    except:
                        continue
                
                if not paper_content or len(paper_content) < 100:
                    paper_content = f"不支持的文件格式: {file_ext}。请上传PDF、DOCX或TXT文件。文件名: {filename}"
        
        else:
            paper_content = text

        # 记录文件信息
        if file_info:
            logger.info(f"文件信息: {file_info}")

        # 检查是否是需要直接返回的错误信息
        if "PDF解析失败" in paper_content or "不支持的文件格式" in paper_content or "无法解码" in paper_content:
            logger.warning(f"文件处理失败: {paper_content[:100]}")
            return jsonify({
                'success': False, 
                'message': paper_content,
                'file_info': file_info,
                'is_scanned': is_scanned_pdf
            }), 400

        # 如果是扫描件提示信息，直接返回给用户
        if "扫描件PDF无法直接提取文字" in paper_content or "检测到可能是扫描件" in paper_content:
            return jsonify({
                'success': False,
                'message': paper_content,
                'file_info': file_info,
                'is_scanned': True,
                'suggestion': '请上传可编辑的PDF或使用OCR工具转换扫描件'
            }), 400

        # 限制文本长度，防止过长的请求
        max_text_length = 5000  # 减少到5000字
        if len(paper_content) > max_text_length:
            paper_content = paper_content[:max_text_length] + "\n\n[注：文本过长，已截断部分内容]"

        if not paper_content or paper_content.strip() == "":
            return jsonify({
                'success': False, 
                'message': '文件内容为空或无法读取',
                'file_info': file_info,
                'is_scanned': is_scanned_pdf
            }), 400

        user_settings = user.get('settings', {})
        history = user.get('reading_history', [])

        # 调用DeepSeek API
        # 调用DeepSeek API
        try:
            start_time = time.time()
            # 传递问卷数据和用户设置
            interpretation = call_deepseek_api(
                user, 
                paper_content, 
                user_settings, 
                history,
                questionnaire=user.get('questionnaire', {})
            )
            logger.info(f"DeepSeek API调用完成，耗时: {time.time() - start_time:.2f}秒")
        except Exception as api_error:
            logger.error(f"DeepSeek API调用失败: {api_error}")
            return jsonify({'success': False, 'message': f'AI处理失败: {str(api_error)}'}), 500
        
        history_item = {
            'paper_content': paper_content[:500] + '...' if len(paper_content) > 500 else paper_content,
            'interpretation': interpretation[:1000] + '...' if len(interpretation) > 1000 else interpretation,
            'file_info': file_info,
            'is_scanned': is_scanned_pdf,
            'timestamp': datetime.now().isoformat()
        }
        
        add_to_history(session['user_email'], history_item)

        # 简化推荐搜索
        recommendations = []

        return jsonify({
            'success': True,
            'interpretation': interpretation,
            'original_content': paper_content[:1000] + '...' if len(paper_content) > 1000 else paper_content,
            'file_info': file_info,
            'is_scanned': is_scanned_pdf,
            'pdf_warning': pdf_warning if is_scanned_pdf else None,
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

@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    """实时与AI对话"""
    if 'user_email' not in session:
        return jsonify({'success': False, 'message': '未登录'}), 401
    
    data = request.json
    question = data.get('question', '').strip()
    chat_history = data.get('chat_history', [])
    
    if not question:
        return jsonify({'success': False, 'message': '问题不能为空'}), 400
    
    user = get_user_by_email(session['user_email'])
    if not user:
        return jsonify({'success': False, 'message': '用户不存在'}), 404
    
    try:
        # 获取用户设置
        user_settings = user.get('settings', {})
        language = user_settings.get('language', 'zh')
        
        # 构建系统提示
        if language == 'en':
            system_prompt = "You are a helpful assistant for high school students learning natural sciences. Answer questions clearly and concisely."
            user_prompt = f"Question: {question}\n\nPlease provide a clear and helpful answer:"
        else:
            system_prompt = "你是帮助高中生学习自然科学的助手。请清晰简洁地回答用户的问题。"
            user_prompt = f"问题：{question}\n\n请提供清晰有用的回答："
        
        # 构建消息
        messages = [{"role": "system", "content": system_prompt}]
        
        # 如果有聊天历史，添加历史对话
        if chat_history and len(chat_history) > 0:
            for chat in chat_history[-4:]:  # 只保留最近4条对话
                if chat.get('question') and chat.get('answer'):
                    messages.append({"role": "user", "content": chat['question']})
                    messages.append({"role": "assistant", "content": chat['answer']})
        
        messages.append({"role": "user", "content": user_prompt})
        
        headers = {
            'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'deepseek-chat',
            'messages': messages,
            'temperature': 0.7,
            'max_tokens': 1000,
            'stream': False
        }
        
        response = requests.post(DEEPSEEK_API_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        if 'choices' in result and len(result['choices']) > 0:
            answer = result['choices'][0]['message']['content']
            
            # 记录到聊天历史
            chat_item = {
                'question': question,
                'answer': answer,
                'timestamp': datetime.now().isoformat()
            }
            
            # 如果用户已登录且不是游客，可以保存聊天历史
            if 'user_email' in session and not session.get('is_guest'):
                users = load_users()
                email = session['user_email']
                if email in users:
                    if 'chat_history' not in users[email]:
                        users[email]['chat_history'] = []
                    users[email]['chat_history'].append(chat_item)
                    # 保持最近50条聊天记录
                    if len(users[email]['chat_history']) > 50:
                        users[email]['chat_history'] = users[email]['chat_history'][-50:]
                    save_users(users)
            
            return jsonify({
                'success': True,
                'answer': answer,
                'chat_item': chat_item
            })
        else:
            raise ValueError("No response from AI")
            
    except requests.exceptions.Timeout:
        logger.error("AI聊天请求超时")
        return jsonify({'success': False, 'message': 'AI响应超时，请稍后重试'}), 500
    except Exception as e:
        logger.error(f"AI聊天错误: {e}")
        return jsonify({'success': False, 'message': f'AI处理失败: {str(e)}'}), 500

@app.route('/api/chat/history', methods=['GET'])
def get_chat_history():
    """获取用户聊天历史"""
    if 'user_email' not in session or session.get('is_guest'):
        return jsonify({'success': False, 'message': '未登录或游客模式'}), 401
    
    users = load_users()
    email = session['user_email']
    
    if email in users:
        chat_history = users[email].get('chat_history', [])
        return jsonify({'success': True, 'chat_history': chat_history})
    
    return jsonify({'success': False, 'message': '用户不存在'}), 404

@app.route('/api/user/questionnaire', methods=['PUT'])
def update_user_questionnaire():
    """更新用户问卷数据"""
    if 'user_email' not in session:
        return jsonify({'success': False, 'message': '未登录'}), 401
    
    data = request.json
    questionnaire = data.get('questionnaire', {})
    
    users = load_users()
    email = session['user_email']
    
    if email in users:
        users[email]['questionnaire'] = questionnaire
        save_users(users)
        
        # 重新分析用户画像
        user_data = users[email]
        profile_analysis = analyze_user_profile(user_data)
        
        return jsonify({
            'success': True,
            'message': '问卷更新成功',
            'profile_analysis': profile_analysis
        })
    
    return jsonify({'success': False, 'message': '用户不存在'}), 404

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

# 调试端点：详细分析PDF
@app.route('/api/debug/pdf', methods=['POST'])
def debug_pdf():
    """详细分析PDF文件"""
    file = request.files.get('file')
    
    if not file:
        return jsonify({'error': '没有文件'}), 400
    
    try:
        # 读取文件
        file.seek(0)
        file_bytes = file.read()
        
        # 检查文件头
        file_header = file_bytes[:100]
        
        # 检查是否是PDF
        is_pdf = file_header[:5] == b'%PDF-'
        
        # 检查PDF版本
        pdf_version = "未知"
        if is_pdf:
            # 提取版本号，如 %PDF-1.4
            version_start = file_bytes.find(b'%PDF-')
            if version_start != -1:
                version_end = file_bytes.find(b'\n', version_start)
                if version_end != -1:
                    pdf_version = file_bytes[version_start:version_end].decode('ascii', errors='ignore')
        
        # 检查文件大小和结构
        file_size = len(file_bytes)
        
        # 尝试解析PDF基本信息
        pdf_info = {
            'is_pdf': is_pdf,
            'pdf_version': pdf_version,
            'file_size': file_size,
            'header_hex': file_header.hex(),
            'header_preview': file_header.decode('ascii', errors='ignore')[:200],
        }
        
        if is_pdf:
            # 使用PyPDF2获取更多信息
            try:
                from PyPDF2 import PdfReader
                
                pdf_file = io.BytesIO(file_bytes)
                pdf_reader = PdfReader(pdf_file)
                
                pdf_info.update({
                    'page_count': len(pdf_reader.pages),
                    'is_encrypted': pdf_reader.is_encrypted,
                    'metadata': pdf_reader.metadata,
                })
                
                # 检查是否是扫描件
                is_scanned, scan_reason = is_pdf_scanned(file_bytes)
                pdf_info['is_scanned'] = is_scanned
                pdf_info['scan_reason'] = scan_reason
                
                # 尝试提取第一页文字
                if len(pdf_reader.pages) > 0:
                    try:
                        first_page = pdf_reader.pages[0]
                        extracted_text = first_page.extract_text()
                        pdf_info['extracted_text'] = extracted_text[:500] + '...' if len(extracted_text) > 500 else extracted_text
                        pdf_info['extracted_text_length'] = len(extracted_text)
                        
                        # 分析提取的文本质量
                        if extracted_text:
                            printable_chars = sum(1 for c in extracted_text if c.isprintable())
                            space_chars = sum(1 for c in extracted_text if c.isspace())
                            total_chars = len(extracted_text)
                            
                            pdf_info['text_quality'] = {
                                'printable_ratio': printable_chars / total_chars if total_chars > 0 else 0,
                                'space_ratio': space_chars / total_chars if total_chars > 0 else 0,
                                'readable_chars': printable_chars,
                                'total_chars': total_chars
                            }
                    except Exception as e:
                        pdf_info['extraction_error'] = str(e)
                
                # 尝试高级解析
                success, advanced_text = extract_text_from_pdf_advanced(file_bytes)
                pdf_info['advanced_extraction_success'] = success
                if success:
                    pdf_info['advanced_text_length'] = len(advanced_text)
                    pdf_info['advanced_text_preview'] = advanced_text[:500] + '...' if len(advanced_text) > 500 else advanced_text
                else:
                    pdf_info['advanced_extraction_error'] = advanced_text
                    
            except Exception as e:
                pdf_info['pdf_analysis_error'] = str(e)
        
        return jsonify({
            'filename': file.filename,
            'success': True,
            'analysis': pdf_info
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=True)
