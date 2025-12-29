// 全局状态管理
const AppState = {
    user: null,
    currentPage: 'intro',
    isProcessing: false,
    language: 'zh',
    translations: {}
};

// DOM 元素
let DOM = {};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeDOM();
    checkAuthentication();
    loadTranslations();
    setupEventListeners();
    
    // 加载问卷数据
    loadQuestionnaire();
    
    // 加载使用说明
    loadInstructions();
    
    // 加载设置表单
    loadSettingsForms();
});

function initializeDOM() {
    DOM = {
        authModal: document.getElementById('auth-modal'),
        appContainer: document.getElementById('app-container'),
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        fileInput: document.getElementById('file-input'),
        fileInfo: document.getElementById('file-info'),
        paperText: document.getElementById('paper-text'),
        charCount: document.getElementById('char-count'),
        resultsSection: document.getElementById('results-section'),
        loadingSection: document.getElementById('loading-section'),
        originalContent: document.getElementById('original-content'),
        interpretationContent: document.getElementById('interpretation-content'),
        recommendationsList: document.getElementById('recommendations-list'),
        usernameDisplay: document.getElementById('username-display'),
        navLinks: document.querySelectorAll('.nav-link'),
        pages: document.querySelectorAll('.page')
    };
}

// 认证相关
async function checkAuthentication() {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        
        if (data.success && data.user) {
            AppState.user = data.user;
            showApp();
        } else {
            showAuthModal();
        }
    } catch (error) {
        console.error('认证检查失败:', error);
        showAuthModal();
    }
}

function showAuthModal() {
    DOM.authModal.style.display = 'flex';
    DOM.appContainer.style.display = 'none';
}

function showApp() {
    DOM.authModal.style.display = 'none';
    DOM.appContainer.style.display = 'block';
    
    if (AppState.user) {
        DOM.usernameDisplay.textContent = AppState.user.username || AppState.user.email;
        
        // 恢复上次查看的页面
        const savedPage = localStorage.getItem('lastPage');
        if (savedPage && document.querySelector(`[data-page="${savedPage}"]`)) {
            switchPage(savedPage);
        }
        
        // 加载用户设置
        loadUserSettings();
    }
}

// 标签页切换
function showTab(tabName) {
    // 隐藏所有标签页
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有标签按钮的active类
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签页
    const tab = document.getElementById(`${tabName}-tab`);
    if (tab) {
        tab.classList.add('active');
    }
    
    // 激活对应的标签按钮
    const btn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
    if (btn) {
        btn.classList.add('active');
    }
}

// 页面切换
function setupEventListeners() {
    // 导航链接点击事件
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            switchPage(page);
        });
    });
    
    // 文件上传事件
    DOM.fileInput.addEventListener('change', handleFileSelect);
    
    // 文本输入字符计数
    DOM.paperText.addEventListener('input', updateCharCount);
    
    // 登录表单提交
    if (DOM.loginForm) {
        DOM.loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleLogin();
        });
    }
    
    // 注册表单提交
    if (DOM.registerForm) {
        DOM.registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleRegister();
        });
    }
    
    // 底部链接点击事件
    document.querySelectorAll('.footer-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const modalType = this.dataset.modal;
            showModal(modalType);
        });
    });
}

function switchPage(pageName) {
    AppState.currentPage = pageName;
    localStorage.setItem('lastPage', pageName);
    
    // 更新导航链接状态
    DOM.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
    
    // 切换页面显示
    DOM.pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === `${pageName}-page`) {
            page.classList.add('active');
        }
    });
    
    // 滚动到顶部
    window.scrollTo(0, 0);
}

// 文件处理
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileSize = file.size / 1024 / 1024; // MB
    if (fileSize > 16) {
        alert('文件大小不能超过16MB');
        DOM.fileInput.value = '';
        return;
    }
    
    DOM.fileInfo.textContent = `已选择: ${file.name} (${fileSize.toFixed(2)} MB)`;
    DOM.fileInfo.style.color = '#28a745';
}

function updateCharCount() {
    const count = DOM.paperText.value.length;
    DOM.charCount.textContent = count;
    
    if (count > 5000) {
        DOM.charCount.style.color = '#dc3545';
    } else if (count > 4500) {
        DOM.charCount.style.color = '#ffc107';
    } else {
        DOM.charCount.style.color = '#28a745';
    }
}

// 登录处理
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            AppState.user = data.user;
            showApp();
            showNotification('登录成功！', 'success');
        } else {
            showNotification(data.message || '登录失败', 'error');
        }
    } catch (error) {
        console.error('登录错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 注册处理
async function handleRegister() {
    const email = document.getElementById('register-email').value;
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // 基本验证
    if (!email || !username || !password) {
        showNotification('请填写所有必填项', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }
    
    // 收集问卷数据
    const questionnaire = collectQuestionnaireData();
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                username,
                password,
                questionnaire
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            AppState.user = data.user;
            showApp();
            showNotification('注册成功！', 'success');
        } else {
            showNotification(data.message || '注册失败', 'error');
        }
    } catch (error) {
        console.error('注册错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 游客登录
async function enterAsGuest() {
    try {
        const response = await fetch('/api/guest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            AppState.user = data.user;
            showApp();
            showNotification('欢迎使用游客模式！', 'success');
        } else {
            showNotification('进入游客模式失败', 'error');
        }
    } catch (error) {
        console.error('游客登录错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 登出
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            AppState.user = null;
            showAuthModal();
            showNotification('已成功登出', 'success');
        }
    } catch (error) {
        console.error('登出错误:', error);
    }
}

// 论文解读
async function startInterpretation() {
    if (AppState.isProcessing) return;
    
    const file = DOM.fileInput.files[0];
    const text = DOM.paperText.value.trim();
    
    if (!file && !text) {
        showNotification('请上传文件或输入文本', 'error');
        return;
    }
    
    if (text.length > 5000) {
        showNotification('文本内容不能超过5000字符', 'error');
        return;
    }
    
    AppState.isProcessing = true;
    DOM.resultsSection.style.display = 'none';
    DOM.loadingSection.style.display = 'block';
    
    try {
        const formData = new FormData();
        if (file) {
            formData.append('file', file);
        }
        if (text) {
            formData.append('text', text);
        }
        
        const response = await fetch('/api/interpret', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 显示结果
            DOM.originalContent.textContent = data.original_content;
            DOM.interpretationContent.innerHTML = formatInterpretation(data.interpretation);
            
            // 显示推荐论文
            displayRecommendations(data.recommendations || []);
            
            DOM.resultsSection.style.display = 'block';
            showNotification('解读生成成功！', 'success');
            
            // 滚动到结果区域
            DOM.resultsSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            showNotification(data.message || '解读失败', 'error');
        }
    } catch (error) {
        console.error('解读错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    } finally {
        AppState.isProcessing = false;
        DOM.loadingSection.style.display = 'none';
    }
}

function formatInterpretation(text) {
    // 将文本中的标题格式化为HTML
    let html = text
        .replace(/\n/g, '<br>')
        .replace(/^(#{1,3})\s+(.+)$/gm, (match, hashes, title) => {
            const level = hashes.length;
            return `<h${level} style="margin-top: 20px; margin-bottom: 10px; color: #007bff;">${title}</h${level}>`;
        })
        .replace(/【(.+?)】/g, '<strong style="color: #28a745;">【$1】</strong>');
    
    return html;
}

function displayRecommendations(recommendations) {
    const container = DOM.recommendationsList;
    container.innerHTML = '';
    
    if (recommendations.length === 0) {
        container.innerHTML = '<p class="no-recommendations">暂无相关论文推荐</p>';
        return;
    }
    
    recommendations.forEach(paper => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        
        item.innerHTML = `
            <h5>${paper.title || '无标题'}</h5>
            <p><strong>作者:</strong> ${paper.authors || '未知'}</p>
            <p><strong>期刊:</strong> ${paper.publication || '未知'} (${paper.year || '未知年份'})</p>
            ${paper.abstract ? `<p><strong>摘要:</strong> ${paper.abstract}</p>` : ''}
            ${paper.url ? `<a href="${paper.url}" target="_blank" class="btn btn-small" style="margin-top: 10px;">查看原文</a>` : ''}
        `;
        
        container.appendChild(item);
    });
}

// 清空输入
function clearInput() {
    DOM.fileInput.value = '';
    DOM.fileInfo.textContent = '';
    DOM.paperText.value = '';
    DOM.charCount.textContent = '0';
    DOM.charCount.style.color = '#28a745';
    DOM.resultsSection.style.display = 'none';
}

// 下载结果
function downloadResult() {
    const content = DOM.interpretationContent.textContent;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `解读结果_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 保存到历史
async function saveToHistory() {
    const content = DOM.interpretationContent.textContent;
    const original = DOM.originalContent.textContent;
    
    try {
        // 这里可以添加保存到后端的逻辑
        showNotification('已保存到阅读历史', 'success');
    } catch (error) {
        console.error('保存历史错误:', error);
        showNotification('保存失败', 'error');
    }
}

// 加载用户设置
async function loadUserSettings() {
    if (!AppState.user || AppState.user.is_guest) return;
    
    try {
        const response = await fetch('/api/user/settings');
        const data = await response.json();
        
        if (data.success) {
            // 应用设置
            applySettings(data.settings);
        }
    } catch (error) {
        console.error('加载设置错误:', error);
    }
}

function applySettings(settings) {
    if (!settings) return;
    
    // 应用视觉设置
    if (settings.visual) {
        const { theme, font_size, font_family } = settings.visual;
        
        // 应用主题
        if (theme) {
            applyTheme(theme);
        }
        
        // 应用字体
        if (font_size) {
            document.documentElement.style.fontSize = `${font_size}px`;
        }
        
        if (font_family) {
            document.body.style.fontFamily = font_family;
        }
    }
    
    // 应用语言设置
    if (settings.language) {
        AppState.language = settings.language;
        updateLanguage();
    }
}

function applyTheme(theme) {
    const themes = {
        'A': '#ffe6f2', // 粉色
        'B': '#e6f7ff', // 浅蓝色
        'C': '#e6ffe6', // 浅绿色
        'D': '#f2e6ff', // 浅紫色
        'E': '#ffffff'  // 自定义（白色）
    };
    
    const color = themes[theme] || '#f8f9fa';
    document.body.style.backgroundColor = color;
}

// 语言切换
async function loadTranslations() {
    try {
        // 这里可以加载语言包
        AppState.translations = {
            zh: {},
            en: {}
        };
    } catch (error) {
        console.error('加载翻译错误:', error);
    }
}

function updateLanguage() {
    // 更新页面语言
    document.documentElement.lang = AppState.language;
    
    // 这里可以添加具体的语言切换逻辑
}

// 问卷处理
function loadQuestionnaire() {
    // 这里可以动态加载问卷HTML
    const container = document.getElementById('questionnaire');
    if (container) {
        container.innerHTML = `
            <div class="questionnaire-section">
                <h4>知识框架调查问卷</h4>
                <p>请填写以下问卷以帮助我们更好地为您提供个性化解读</p>
                <div class="question-group">
                    <h5>1. 您所在的年级是？</h5>
                    <label><input type="radio" name="grade" value="A"> 9年级</label><br>
                    <label><input type="radio" name="grade" value="B"> 10年级</label><br>
                    <label><input type="radio" name="grade" value="C"> 11年级</label><br>
                    <label><input type="radio" name="grade" value="D"> 12年级</label>
                </div>
                <!-- 更多问题可以在这里添加 -->
                <p class="warning-text">注册后可以在设置中修改问卷答案</p>
            </div>
        `;
    }
}

function collectQuestionnaireData() {
    const data = {};
    
    // 收集问卷答案
    const grade = document.querySelector('input[name="grade"]:checked');
    if (grade) data.grade = grade.value;
    
    // 这里可以收集更多问卷数据
    
    return data;
}

// 使用说明
function loadInstructions() {
    const container = document.querySelector('#instructions-page .page-content');
    if (container) {
        container.innerHTML = `
            <div class="content-section">
                <h3><i class="fas fa-code"></i> 技术说明</h3>
                <ul>
                    <li><strong>后端框架：</strong>基于Flask、Python、Web框架构建</li>
                    <li><strong>前端技术：</strong>HTML5 + CSS3 + JavaScript响应式设计</li>
                    <li><strong>文件处理：</strong>集成专业解析库处理PDF和DOCX文件</li>
                    <li><strong>API接口：</strong>调用DeepSeek-V1 API，支持前后端分离</li>
                </ul>
            </div>
            
            <div class="content-section">
                <h3><i class="fas fa-list-ol"></i> 使用步骤</h3>
                <h4>1. 阅读产品介绍与使用说明</h4>
                <ul>
                    <li><strong>了解功能：</strong>详细阅读首页功能介绍，了解我们的核心开发理念</li>
                    <li><strong>观看使用说明：</strong>详细阅读本页使用说明部分，了解网页基本使用方法</li>
                </ul>
                
                <h4>2. 进入 "用户设置"页面，进行参数配置</h4>
                <ul>
                    <li><strong>视觉设置：</strong>选择不同颜色的背景主题，调节字体形式与大小</li>
                    <li><strong>阅读习惯设置：</strong>对您个人的论文解读的偏好和特质进行个性化设置</li>
                    <li><strong>语言设置：</strong>切换网页语言为中文/英文</li>
                    <li><strong>账户设置：</strong>退出登录</li>
                </ul>
                
                <h4>3. 进行论文解读</h4>
                <ul>
                    <li><strong>上传论文：</strong>支持拖拽上传或文件选择，最大支持16MB文件；pdf、docx文件均可接受</li>
                    <li><strong>文本输入：</strong>直接粘贴论文摘要或关键段落（最长支持5000字符）</li>
                    <li><strong>生成解读：</strong>点击"开始解读"按钮，等待AI生成详细分析</li>
                </ul>
            </div>
            
            <div class="content-section">
                <h3><i class="fas fa-cogs"></i> 功能介绍</h3>
                <h4>A. 解读核心功能</h4>
                <ul>
                    <li><strong>智能解读：</strong>将复杂学术语言转换为通俗易懂的解释</li>
                    <li><strong>术语解释：</strong>对专业术语提供详细定义和背景说明</li>
                    <li><strong>图表理解：</strong>分析论文中的图表数据，生成用户喜欢的图表，提供直观解读</li>
                    <li><strong>个性化设置：</strong>注重用户知识框架、阅读偏好差异性，提供设置功能</li>
                    <li><strong>自适应算法：</strong>通过用户的阅读记录，自动更新、调整解读内容，推送相关论文</li>
                </ul>
                
                <h4>B. 视觉设置功能</h4>
                <ul>
                    <li><strong>背景切换：</strong>支持不同颜色主题调节以及自定义主题设置</li>
                    <li><strong>字体调节：</strong>可调整解读内容的字体大小和行间距</li>
                    <li><strong>高亮显示：</strong>重要内容支持批注，支持自定义颜色标记</li>
                </ul>
                
                <h4>C. 反馈与联系功能</h4>
                <p>您可以在页面底部的"联系我们"中找到开发团队的联系方式</p>
                
                <h4>D. 其他实用功能</h4>
                <ul>
                    <li><strong>多语言支持：</strong>支持中英双语解读界面</li>
                    <li><strong>进度保存功能：</strong>同一用户登录时自动打开上次退出时的阅读界面</li>
                </ul>
            </div>
            
            <div class="content-section">
                <h3><i class="fas fa-lightbulb"></i> 温馨提示</h3>
                <p>本服务旨在辅助学术理解，不替代专业学术评审。重要研究决策请结合专家意见。我们持续优化AI模型，欢迎您在使用过程中提供宝贵反馈，共同打造更好的学术辅助工具！</p>
            </div>
        `;
    }
}

// 模态框显示
function showModal(type) {
    let title = '';
    let content = '';
    
    switch(type) {
        case 'privacy':
            title = '隐私政策';
            content = `
                <h4>最后更新日期：2026年1月1日</h4>
                <p><strong>ANSAPRA</strong>（以下简称"我们"或"本平台"）尊重并保护所有用户的隐私...</p>
                <!-- 更多隐私政策内容 -->
            `;
            break;
        case 'terms':
            title = '服务条款';
            content = `
                <h4>生效日期：2026年1月1日</h4>
                <p>欢迎使用<strong>ANSAPRA</strong>。本平台是一个由高中生团队开发的、旨在帮助同龄人阅读自然科学论文的工具...</p>
                <!-- 更多服务条款内容 -->
            `;
            break;
        case 'contact':
            title = '联系我们';
            content = `
                <p>我们是一个由高中生组成的开发团队。本网站从诞生到优化，都离不开用户的支持。</p>
                <p>如果您有任何问题，请通过以下邮箱联系我们：</p>
                <ul>
                    <li>1182332400@qq.com</li>
                    <li>biokoala@outlook.com</li>
                </ul>
                <p>我们会在10个工作日内尽力回复。</p>
            `;
            break;
        default:
            title = type;
            content = '内容加载中...';
    }
    
    const modalHTML = `
        <div class="modal" id="info-modal">
            <div class="modal-content" style="max-width: 600px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>${title}</h3>
                    <button onclick="closeModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
                </div>
                <div style="max-height: 400px; overflow-y: auto;">
                    ${content}
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <button class="btn btn-primary" onclick="closeModal()">关闭</button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = modalHTML;
    document.getElementById('info-modal').style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('info-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 通知功能
function showNotification(message, type = 'info') {
    // 移除现有的通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// 添加CSS动画
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}
