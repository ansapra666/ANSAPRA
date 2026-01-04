"""
配置文件
"""

import os
from datetime import timedelta

class Config:
    """基础配置"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Session配置
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_COOKIE_SECURE = False  # 开发环境为False，生产环境应为True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # 文件上传
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    UPLOAD_FOLDER = 'uploads'
    
    # API密钥
    DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY')
    SPRINGER_API_KEY = os.environ.get('SPRINGER_API_KEY')
    
    # 数据库配置
    DATABASE_URL = os.environ.get('DATABASE_URL')
