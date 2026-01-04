from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # User settings
    language = db.Column(db.String(10), default='zh')
    theme = db.Column(db.String(20), default='light-blue')
    font_size = db.Column(db.Integer, default=16)
    font_family = db.Column(db.String(50), default='Microsoft YaHei')
    
    # Reading preferences
    reading_prep = db.Column(db.String(20), default='B')
    reading_purpose = db.Column(db.String(20), default='B')
    reading_time = db.Column(db.String(20), default='B')
    reading_style = db.Column(db.String(20), default='A')
    reading_depth = db.Column(db.String(20), default='B')
    test_preferences = db.Column(db.String(100), default='A,B')
    chart_preferences = db.Column(db.String(100), default='A,B,C,D')
    
    # Questionnaire data (stored as JSON)
    questionnaire_data = db.Column(db.Text, default='{}')
    
    # Relationships
    reading_history = db.relationship('ReadingHistory', backref='user', lazy=True, cascade='all, delete-orphan')
    user_settings = db.relationship('UserSetting', backref='user', lazy=True, uselist=False, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'language': self.language,
            'theme': self.theme,
            'font_size': self.font_size,
            'font_family': self.font_family,
            'reading_prep': self.reading_prep,
            'reading_purpose': self.reading_purpose,
            'reading_time': self.reading_time,
            'reading_style': self.reading_style,
            'reading_depth': self.reading_depth,
            'test_preferences': self.test_preferences,
            'chart_preferences': self.chart_preferences,
            'questionnaire_data': self.questionnaire_data
        }

class UserSetting(db.Model):
    __tablename__ = 'user_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    
    # Visual settings
    background_color = db.Column(db.String(20), default='#f0f8ff')
    background_image = db.Column(db.String(255))
    custom_css = db.Column(db.Text)
    
    # Reading interface settings
    show_sidebar = db.Column(db.Boolean, default=True)
    split_view = db.Column(db.Boolean, default=True)
    auto_save = db.Column(db.Boolean, default=True)
    
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ReadingHistory(db.Model):
    __tablename__ = 'reading_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Paper info
    paper_title = db.Column(db.String(255))
    paper_filename = db.Column(db.String(255))
    paper_content = db.Column(db.Text)
    
    # Interpretation results
    interpretation = db.Column(db.Text)
    terms_section = db.Column(db.Text)
    mindmap_data = db.Column(db.Text)
    
    # Metadata
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_viewed = db.Column(db.DateTime, default=datetime.utcnow)
    view_count = db.Column(db.Integer, default=1)
    
    # Annotations (stored as JSON)
    annotations = db.Column(db.Text, default='[]')
    
    def to_dict(self):
        return {
            'id': self.id,
            'paper_title': self.paper_title,
            'paper_filename': self.paper_filename,
            'interpretation': self.interpretation,
            'terms_section': self.terms_section,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'last_viewed': self.last_viewed.isoformat() if self.last_viewed else None,
            'view_count': self.view_count
        }

class PaperRecommendation(db.Model):
    __tablename__ = 'paper_recommendations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Recommendation data
    title = db.Column(db.String(500))
    authors = db.Column(db.String(500))
    journal = db.Column(db.String(200))
    url = db.Column(db.String(500))
    doi = db.Column(db.String(100))
    abstract = db.Column(db.Text)
    
    # Metadata
    recommended_at = db.Column(db.DateTime, default=datetime.utcnow)
    clicked = db.Column(db.Boolean, default=False)
    clicked_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'authors': self.authors,
            'journal': self.journal,
            'url': self.url,
            'doi': self.doi,
            'abstract': self.abstract[:300] + '...' if self.abstract and len(self.abstract) > 300 else self.abstract,
            'recommended_at': self.recommended_at.isoformat() if self.recommended_at else None
        }
