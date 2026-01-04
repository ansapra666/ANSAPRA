import os
import uuid
import fitz  # PyMuPDF
from docx import Document
from werkzeug.utils import secure_filename
from config import Config

def allowed_file(filename):
    """检查文件扩展名是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def save_uploaded_file(file):
    """保存上传的文件"""
    if not allowed_file(file.filename):
        return None
    
    filename = secure_filename(file.filename)
    # 添加唯一标识符防止文件名冲突
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    
    # 确保上传目录存在
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    
    filepath = os.path.join(Config.UPLOAD_FOLDER, unique_filename)
    file.save(filepath)
    
    return {
        'original_filename': filename,
        'saved_filename': unique_filename,
        'filepath': filepath
    }

def extract_text_from_pdf(filepath):
    """从PDF提取文本"""
    try:
        text = ""
        with fitz.open(filepath) as doc:
            for page in doc:
                text += page.get_text()
        return text
    except Exception as e:
        print(f"PDF提取错误: {e}")
        return ""

def extract_text_from_docx(filepath):
    """从DOCX提取文本"""
    try:
        doc = Document(filepath)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        print(f"DOCX提取错误: {e}")
        return ""

def extract_text_from_file(filepath, extension):
    """根据文件类型提取文本"""
    if extension == 'pdf':
        return extract_text_from_pdf(filepath)
    elif extension == 'docx':
        return extract_text_from_docx(filepath)
    elif extension == 'txt':
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        return ""

def create_default_user_settings():
    """创建默认用户设置"""
    return {
        'language': 'zh',
        'theme': 'light-blue',
        'font_size': 16,
        'font_family': 'Microsoft YaHei',
        'reading_prep': 'B',
        'reading_purpose': 'B',
        'reading_time': 'B',
        'reading_style': 'A',
        'reading_depth': 'B',
        'test_preferences': 'A,B',
        'chart_preferences': 'A,B,C,D',
        'background_color': '#f0f8ff',
        'show_sidebar': True,
        'split_view': True,
        'auto_save': True
    }

def validate_email(email):
    """简单验证邮箱格式"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def format_file_size(size_in_bytes):
    """格式化文件大小"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_in_bytes < 1024.0:
            return f"{size_in_bytes:.2f} {unit}"
        size_in_bytes /= 1024.0
    return f"{size_in_bytes:.2f} TB"
