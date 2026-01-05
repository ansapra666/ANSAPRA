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

// 在DOM加载完成后添加
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
    
    // 检查是否有已保存的问卷
    const savedQuestionnaire = localStorage.getItem('pendingQuestionnaire');
    if (savedQuestionnaire) {
        try {
            window.currentQuestionnaire = JSON.parse(savedQuestionnaire);
            updateRegisterFormQuestionnaire();
        } catch (e) {
            console.error('解析保存的问卷数据时出错:', e);
        }
    }
    
    // 检查是否有待处理的注册信息
    const savedRegistration = localStorage.getItem('pendingRegistration');
    if (savedRegistration) {
        try {
            window.pendingRegistration = JSON.parse(savedRegistration);
            
            // 自动填充注册表单
            const emailInput = document.getElementById('register-email');
            const usernameInput = document.getElementById('register-username');
            const passwordInput = document.getElementById('register-password');
            const confirmPasswordInput = document.getElementById('confirm-password');
            
            if (emailInput && window.pendingRegistration.email) emailInput.value = window.pendingRegistration.email;
            if (usernameInput && window.pendingRegistration.username) usernameInput.value = window.pendingRegistration.username;
            if (passwordInput && window.pendingRegistration.password) passwordInput.value = window.pendingRegistration.password;
            if (confirmPasswordInput && window.pendingRegistration.password) confirmPasswordInput.value = window.pendingRegistration.password;
            
        } catch (e) {
            console.error('解析保存的注册信息时出错:', e);
        }
    }
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

    // 底部链接点击事件 - 确保使用事件委托
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('footer-link')) {
            e.preventDefault();
            const modalType = e.target.dataset.modal;
            if (modalType) {
                showModal(modalType);
            }
        }
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

// 全屏问卷显示
function showFullQuestionnaire() {
    const modal = document.getElementById('full-questionnaire-modal');
    const container = document.getElementById('full-questionnaire-container');
    
    // 加载问卷内容
    if (container.innerHTML.trim() === '') {
        loadQuestionnaireToContainer(container);
    }
    
    modal.style.display = 'flex';
    
    // 添加ESC键关闭支持
    const escHandler = function(e) {
        if (e.key === 'Escape') {
            closeFullQuestionnaire();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function closeFullQuestionnaire() {
    const modal = document.getElementById('full-questionnaire-modal');
    modal.style.display = 'none';
}

function loadQuestionnaireToContainer(container) {
    // 这里可以加载与注册时间相同的问卷HTML
    // 暂时使用现有的问卷HTML
    const questionnaireContent = document.getElementById('questionnaire');
    if (questionnaireContent) {
        container.innerHTML = questionnaireContent.innerHTML;
    }
}

// 保存问卷数据
// 保存问卷数据
function saveQuestionnaire() {
    const questionnaire = collectQuestionnaireData();
    
    // 保存问卷数据
    window.currentQuestionnaire = questionnaire;
    localStorage.setItem('pendingQuestionnaire', JSON.stringify(questionnaire));
    
    showNotification('问卷已保存', 'success');
    closeFullQuestionnaire();
    
    // 检查是否有待处理的注册
    if (window.pendingRegistration) {
        // 验证问卷完整性
        if (validateQuestionnaire(questionnaire)) {
            // 问卷完整，提交注册
            submitRegistration(
                window.pendingRegistration.email,
                window.pendingRegistration.username,
                window.pendingRegistration.password,
                questionnaire
            );
        } else {
            showNotification('问卷填写不完整，请完成所有必填项', 'warning');
        }
    } else {
        // 更新注册表单中的问卷显示
        updateRegisterFormQuestionnaire();
    }
}

// 更新注册表单中的问卷显示
function updateRegisterFormQuestionnaire() {
    const registerTab = document.getElementById('register-tab');
    if (registerTab && window.currentQuestionnaire) {
        // 查找或创建问卷摘要区域
        let summaryDiv = registerTab.querySelector('.questionnaire-summary');
        if (!summaryDiv) {
            summaryDiv = document.createElement('div');
            summaryDiv.className = 'questionnaire-summary';
            summaryDiv.style.cssText = 'padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;';
            
            // 插入到注册表单的适当位置
            const form = registerTab.querySelector('form');
            if (form) {
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    form.insertBefore(summaryDiv, submitButton);
                } else {
                    form.appendChild(summaryDiv);
                }
            }
        }
        
        const gradeMap = { A: '9年级', B: '10年级', C: '11年级', D: '12年级' };
        const systemMap = { A: '国际体系', B: '普高体系' };
        const grade = gradeMap[window.currentQuestionnaire.grade] || '未知';
        const system = systemMap[window.currentQuestionnaire.education_system] || '未知';
        
        summaryDiv.innerHTML = `
            <h5><i class="fas fa-check-circle" style="color: #28a745;"></i> 问卷已完成</h5>
            <p><strong>基本信息：</strong>${grade} | ${system}</p>
            <p>知识框架问卷已完成填写，包含${Object.keys(window.currentQuestionnaire).length}项数据。</p>
            <button type="button" class="btn btn-small btn-secondary" onclick="showFullQuestionnaire()" style="margin-right: 10px;">
                <i class="fas fa-edit"></i> 修改问卷
            </button>
            <button type="button" class="btn btn-small btn-success" onclick="useSavedQuestionnaire()">
                <i class="fas fa-check"></i> 使用此问卷注册
            </button>
        `;
    }
}

// 使用已保存的问卷注册
function useSavedQuestionnaire() {
    if (!window.currentQuestionnaire) {
        showNotification('请先填写问卷', 'error');
        return;
    }
    
    // 验证问卷完整性
    if (!validateQuestionnaire(window.currentQuestionnaire)) {
        showNotification('问卷填写不完整，请修改', 'warning');
        showFullQuestionnaire();
        return;
    }
    
    // 获取注册表单数据
    const email = document.getElementById('register-email').value;
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // 验证基本信息
    if (!email || !username || !password || !confirmPassword) {
        showNotification('请填写所有注册信息', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }
    
    // 提交注册
    submitRegistration(email, username, password, window.currentQuestionnaire);
}

async function handleRegister() {
    const email = document.getElementById('register-email').value;
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // 基本验证
    if (!email || !username || !password || !confirmPassword) {
        showNotification('请填写所有必填项', 'error');
        return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('请输入有效的邮箱地址', 'error');
        return;
    }

    // 密码验证
    if (password.length < 6) {
        showNotification('密码长度至少6位', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }

    // 检查是否有保存的问卷数据
    let questionnaire = null;
    const savedQuestionnaire = localStorage.getItem('pendingQuestionnaire');
    
    if (savedQuestionnaire) {
        questionnaire = JSON.parse(savedQuestionnaire);
        
        // 验证问卷数据完整性
        if (validateQuestionnaire(questionnaire)) {
            // 问卷完整，直接提交注册
            await submitRegistration(email, username, password, questionnaire);
        } else {
            // 问卷不完整，显示问卷
            showNotification('问卷填写不完整，请完成问卷后再注册', 'warning');
            saveBasicInfo(email, username, password);
            showFullQuestionnaire();
        }
    } else {
        // 没有问卷数据，先保存基本信息，然后显示问卷
        saveBasicInfo(email, username, password);
        showFullQuestionnaire();
        showNotification('请先完成知识框架问卷', 'info');
    }
}

// 保存基本信息
function saveBasicInfo(email, username, password) {
    window.pendingRegistration = {
        email,
        username,
        password,
        timestamp: new Date().getTime()
    };
    
    // 保存到localStorage（可选）
    localStorage.setItem('pendingRegistration', JSON.stringify({
        email,
        username,
        password
    }));
}

// 验证问卷数据
function validateQuestionnaire(questionnaire) {
    if (!questionnaire) return false;
    
    // 检查基本信息部分
    const requiredFields = [
        'grade',
        'education_system',
        'learning_frequency'
    ];
    
    for (const field of requiredFields) {
        if (!questionnaire[field]) {
            return false;
        }
    }
    
    // 检查学科兴趣
    if (questionnaire.interests) {
        const interestFields = ['physics', 'biology', 'chemistry', 'geology', 'astronomy'];
        for (const field of interestFields) {
            if (!questionnaire.interests[field]) {
                return false;
            }
        }
    } else {
        return false;
    }
    
    // 检查学科问题
    const questionFields = [
        'physics_question',
        'chemistry_question', 
        'biology_question',
        'astronomy_question',
        'geology_question'
    ];
    
    for (const field of questionFields) {
        if (!questionnaire[field]) {
            return false;
        }
    }
    
    return true;
}

// 提交注册
async function submitRegistration(email, username, password, questionnaire) {
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
            
            // 清除临时数据
            localStorage.removeItem('pendingQuestionnaire');
            localStorage.removeItem('pendingRegistration');
            delete window.pendingRegistration;
            delete window.currentQuestionnaire;
            
            showNotification('注册成功！', 'success');
            
            // 显示欢迎信息
            setTimeout(() => {
                const gradeMap = { A: '9年级', B: '10年级', C: '11年级', D: '12年级' };
                const systemMap = { A: '国际体系', B: '普高体系' };
                const grade = gradeMap[questionnaire.grade] || '未知';
                const system = systemMap[questionnaire.education_system] || '未知';
                
                const welcomeMsg = `欢迎${username}！\n\n` +
                    `系统已记录您的学习画像：\n` +
                    `- 年级：${grade}\n` +
                    `- 教育体系：${system}\n` +
                    `- 问卷数据已保存，将用于个性化解读`;
                
                alert(welcomeMsg);
            }, 1000);
        } else {
            showNotification(data.message || '注册失败', 'error');
        }
    } catch (error) {
        console.error('注册错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 添加修改注册表单中的问卷部分
document.addEventListener('DOMContentLoaded', function() {
    // 在注册标签页中添加问卷按钮
    const registerTab = document.getElementById('register-tab');
    if (registerTab) {
        const existingQuestionnaire = document.getElementById('questionnaire');
        if (existingQuestionnaire) {
            existingQuestionnaire.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h4><i class="fas fa-clipboard-list"></i> 知识框架调查问卷</h4>
                    <p>请填写问卷以帮助我们更好地为您提供个性化解读</p>
                    <button type="button" class="btn btn-primary" onclick="showFullQuestionnaire()">
                        <i class="fas fa-pen"></i> 开始填写问卷
                    </button>
                    <p style="margin-top: 10px; font-size: 14px; color: #666;">
                        问卷完成后即可注册
                    </p>
                </div>
            `;
        }
    }
});
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

// 在main.js中添加Cookie同意功能
function setupCookieConsent() {
    // 检查用户是否已经同意Cookie
    if (!localStorage.getItem('cookieConsent')) {
        const cookieBanner = document.createElement('div');
        cookieBanner.id = 'cookie-consent-banner';
        cookieBanner.innerHTML = `
            <div style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.9); color: white; padding: 20px; z-index: 9999;">
                <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                    <div style="flex: 1; min-width: 300px;">
                        <p style="margin: 0; font-size: 14px; line-height: 1.5;">
                            <i class="fas fa-cookie-bite" style="margin-right: 10px;"></i>
                            我们使用Cookie来提升您的浏览体验。继续使用本网站即表示您同意我们的
                            <a href="#" onclick="showModal('cookie'); return false;" style="color: #4dabf7; text-decoration: underline;">Cookie政策</a>。
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button id="cookie-accept" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">
                            <i class="fas fa-check"></i> 同意
                        </button>
                        <button id="cookie-settings" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">
                            <i class="fas fa-cog"></i> 设置
                        </button>
                        <button id="cookie-reject" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">
                            <i class="fas fa-times"></i> 拒绝
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(cookieBanner);
        
        // 添加事件监听
        document.getElementById('cookie-accept').addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieBanner.style.display = 'none';
        });
        
        document.getElementById('cookie-reject').addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'rejected');
            cookieBanner.style.display = 'none';
            // 这里可以添加拒绝Cookie后的逻辑
        });
        
        document.getElementById('cookie-settings').addEventListener('click', () => {
            showModal('cookie');
        });
    }
}

// 在DOM加载完成后调用
document.addEventListener('DOMContentLoaded', function() {
    // ... 其他初始化代码 ...
    setupCookieConsent();
});

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
// 更新loadTranslations函数
async function loadTranslations() {
  try {
    const response = await fetch('/static/lang/translations.json');
    AppState.translations = await response.json();
  } catch (error) {
    console.error('加载翻译错误:', error);
    // 设置默认翻译
    AppState.translations = {
      zh: {},
      en: {}
    };
  }
}

// 更新updateLanguage函数
function updateLanguage() {
  const lang = AppState.language;
  document.documentElement.lang = lang;
  
  // 更新界面文本
  updateUIText(lang);
}

// 新增：更新界面文本的函数
function updateUIText(lang) {
  const translations = AppState.translations[lang] || AppState.translations.zh;
  
  // 更新标题
  document.title = translations.appName || 'ANSAPRA';
  
  // 更新导航栏
  updateNavigationText(translations);
  
  // 更新按钮文本
  updateButtonsText(translations);
  
  // 更新表单标签
  updateFormLabels(translations);
}

function updateNavigationText(translations) {
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = {
    'intro': '网站介绍',
    'instructions': '使用说明',
    'interpretation': '论文解读',
    'settings': '用户设置'
  };
  
  // 这里可以根据翻译对象更新导航文本
  // 暂时保留中文，可以根据需要扩展
}

function updateButtonsText(translations) {
  // 更新登录注册页面的按钮
  const loginBtn = document.querySelector('#login-form button[type="submit"]');
  if (loginBtn) loginBtn.textContent = translations.login || '登录';
  
  const registerBtn = document.querySelector('#register-form button[type="submit"]');
  if (registerBtn) registerBtn.textContent = translations.register || '注册';
  
  // 更新解读页面的按钮
  const startBtn = document.querySelector('.action-buttons .btn-large');
  if (startBtn) {
    const icon = startBtn.querySelector('i');
    startBtn.innerHTML = '';
    if (icon) startBtn.appendChild(icon);
    startBtn.appendChild(document.createTextNode(' ' + (translations.startInterpretation || '开始解读')));
  }
  
  const clearBtn = document.querySelector('.action-buttons .btn-secondary');
  if (clearBtn) clearBtn.innerHTML = '<i class="fas fa-trash"></i> ' + (translations.clear || '清空');
}

// 在switchPage函数中添加语言更新
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
  
  // 如果切换到设置页面，确保语言设置正确显示
  if (pageName === 'settings') {
    updateLanguageSettingsTab();
  }
  
  // 滚动到顶部
  window.scrollTo(0, 0);
}

// 更新设置页面的语言标签
function updateLanguageSettingsTab() {
  const langSettings = document.getElementById('language-settings');
  if (langSettings) {
    const labels = langSettings.querySelectorAll('.radio-label span');
    if (labels.length >= 2) {
      const translations = AppState.translations[AppState.language] || AppState.translations.zh;
      labels[0].textContent = translations.zh || '中文';
      labels[1].textContent = translations.en || 'English';
    }
  }
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
                    <h5>一、基本情况</h5>
                    
                    <div class="form-group">
                        <label>1. 您所在的年级是？</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="grade" value="A" required>
                                <span>A. 9年级</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="grade" value="B">
                                <span>B. 10年级</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="grade" value="C">
                                <span>C. 11年级</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="grade" value="D">
                                <span>D. 12年级</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>2. 您所处的教育体系是？</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="education_system" value="A" required>
                                <span>A. 国际体系</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="education_system" value="B">
                                <span>B. 普高体系</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>3. 您对各个自然科学学科的感兴趣程度？（1-5打分）</label>
                        <div class="interest-grid">
                            <div class="interest-item">
                                <label>物理学：</label>
                                <select name="interest_physics" required>
                                    <option value="">请选择</option>
                                    <option value="1">1分（不感兴趣）</option>
                                    <option value="2">2分</option>
                                    <option value="3">3分（一般）</option>
                                    <option value="4">4分</option>
                                    <option value="5">5分（非常感兴趣）</option>
                                </select>
                            </div>
                            <div class="interest-item">
                                <label>生物学、医学等：</label>
                                <select name="interest_biology" required>
                                    <option value="">请选择</option>
                                    <option value="1">1分（不感兴趣）</option>
                                    <option value="2">2分</option>
                                    <option value="3">3分（一般）</option>
                                    <option value="4">4分</option>
                                    <option value="5">5分（非常感兴趣）</option>
                                </select>
                            </div>
                            <div class="interest-item">
                                <label>化学：</label>
                                <select name="interest_chemistry" required>
                                    <option value="">请选择</option>
                                    <option value="1">1分（不感兴趣）</option>
                                    <option value="2">2分</option>
                                    <option value="3">3分（一般）</option>
                                    <option value="4">4分</option>
                                    <option value="5">5分（非常感兴趣）</option>
                                </select>
                            </div>
                            <div class="interest-item">
                                <label>地理地质学：</label>
                                <select name="interest_geology" required>
                                    <option value="">请选择</option>
                                    <option value="1">1分（不感兴趣）</option>
                                    <option value="2">2分</option>
                                    <option value="3">3分（一般）</option>
                                    <option value="4">4分</option>
                                    <option value="5">5分（非常感兴趣）</option>
                                </select>
                            </div>
                            <div class="interest-item">
                                <label>天体天文学：</label>
                                <select name="interest_astronomy" required>
                                    <option value="">请选择</option>
                                    <option value="1">1分（不感兴趣）</option>
                                    <option value="2">2分</option>
                                    <option value="3">3分（一般）</option>
                                    <option value="4">4分</option>
                                    <option value="5">5分（非常感兴趣）</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>4. 您学习自然科学课外知识的频率是？</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="learning_frequency" value="A" required>
                                <span>A. 一周1次或更频繁</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="learning_frequency" value="B">
                                <span>B. 一个月1-3次</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="learning_frequency" value="C">
                                <span>C. 几个月1次</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>5. 在双缝干涉实验中，使用波长为λ的单色光。如果将整个实验装置从空气移入折射率为n的透明液体中，同时将屏到双缝的距离D和双缝间距d保持不变，那么屏幕上相邻明条纹中心的间距Δx将如何变化？</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="physics_question" value="A" required>
                                <span>A. 变为原来的n倍</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="physics_question" value="B">
                                <span>B. 变为原来的1/n</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="physics_question" value="C">
                                <span>C. 保持不变</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="physics_question" value="D">
                                <span>D. 无法确定，因为光的频率也改变了</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>6. 将少量固体醋酸钠（CH₃COONa）加入到一定体积的稀醋酸（CH₃COOH）溶液中。假设溶液体积变化忽略不计，该操作会导致溶液中：</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="chemistry_question" value="A" required>
                                <span>A. pH值显著下降</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="chemistry_question" value="B">
                                <span>B. 醋酸根离子浓度与氢离子浓度的比值增大</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="chemistry_question" value="C">
                                <span>C. 醋酸的电离度显著降低</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="chemistry_question" value="D">
                                <span>D. 水的离子积常数Kw增大</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>7. 参考示例题型：水生植物Quillwort在 submerged 时采用CAM代谢，夜间固定CO₂生成苹果酸，白天释放CO₂进行光合作用。这被认为是由于白天水中CO₂被其他光合生物强烈竞争而导致稀缺。<br>
                        据此逻辑，以下哪种情况最可能促使陆生仙人掌在夜间（而非白天）开放其气孔吸收CO₂？</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="biology_question" value="A" required>
                                <span>A. 为了在夜间更有效地进行光反应。</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="biology_question" value="B">
                                <span>B. 为了在白天关闭气孔以减少水分散失，同时仍能获取CO₂。</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="biology_question" value="C">
                                <span>C. 因为夜间土壤中水分更多，有利于CO₂吸收。</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="biology_question" value="D">
                                <span>D. 因为夜间温度更低，CO₂溶解度更高。</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>8. 假设我们可以观测到一颗围绕类太阳恒星运行的系外行星。通过测量恒星光谱的多普勒位移，我们得到了恒星视向速度随时间变化的周期性曲线。<strong>仅凭这条曲线</strong>，我们可以最可靠地确定该系外行星的哪个参数？</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="astronomy_question" value="A" required>
                                <span>A. 行星的精确质量</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="astronomy_question" value="B">
                                <span>B. 行星轨道周期的最小质量（M sin i）</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="astronomy_question" value="C">
                                <span>C. 行星的半径</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="astronomy_question" value="D">
                                <span>D. 行星大气的成分</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>9. 在分析某河流三角洲的沉积岩芯时，科学家发现从底层到顶层，沉积物颗粒的平均粒径有"粗 -> 细 -> 粗"的垂向变化序列。这最有可能指示了该区域在沉积期间经历了：</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="geology_question" value="A" required>
                                <span>A. 持续的海平面上升</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="geology_question" value="B">
                                <span>B. 一次海平面下降，随后又上升</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="geology_question" value="C">
                                <span>C. 一次海平面的上升，随后又下降（一个完整的海侵-海退旋回）</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="geology_question" value="D">
                                <span>D. 持续的构造抬升</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="question-group">
                    <h5>二、科学感知</h5>
                    
                    <div class="form-group">
                        <label>1. 您认为您对以下学习方式的喜好与习惯程度是？【打分】*1-5评分，1为极其不喜欢/习惯，5为极其喜欢/习惯</label>
                        <div class="learning-style-grid">
                            <div class="learning-style-item">
                                <label>A. 量化学习，数字和公式更能解释清楚特定知识点：</label>
                                <select name="learning_style_quantitative" required>
                                    <option value="">请选择</option>
                                    <option value="1">1分</option>
                                    <option value="2">2分</option>
                                    <option value="3">3分</option>
                                    <option value="4">4分</option>
                                    <option value="5">5分</option>
                                </select>
                            </div>
                            <div class="learning-style-item">
                                <label>B. 文字理解，通过清晰详细的语言表述知识点：</label>
                                <select name="learning_style_textual" required>
                                    <option value="">请选择</option>
                                    <option value="1">1分</option>
                                    <option value="2">2分</option>
                                    <option value="3">3分</option>
                                    <option value="4">4分</option>
                                    <option value="5">5分</option>
                                </select>
                            </div>
                            <div class="learning-style-item">
                                <label>C. 可视化学习，习惯借助图表甚至立体模型展现特定知识点：</label>
                                <select name="learning_style_visual" required>
                                    <option value="">请选择</option>
                                    <option value="1">1分</option>
                                    <option value="2">2分</option>
                                    <option value="3">3分</option>
                                    <option value="4">4分</option>
                                    <option value="5">5分</option>
                                </select>
                            </div>
                            <div class="learning-style-item">
                                <label>D. 互动性学习，依赖问题引导、课堂互动或视频等视听型教学方式：</label>
                                <select name="learning_style_interactive" required>
                                    <option value="">请选择</option>
                                    <option value="1">1分</option>
                                    <option value="2">2分</option>
                                    <option value="3">3分</option>
                                    <option value="4">4分</option>
                                    <option value="5">5分</option>
                                </select>
                            </div>
                            <div class="learning-style-item">
                                <label>E. 实践性学习，习惯通过动手实践和严谨实验过程理解特定知识点：</label>
                                <select name="learning_style_practical" required>
                                    <option value="">请选择</option>
                                    <option value="1">1分</option>
                                    <option value="2">2分</option>
                                    <option value="3">3分</option>
                                    <option value="4">4分</option>
                                    <option value="5">5分</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>2. 您觉得以下哪一个描述最符合自然科学（天文学，生物学等）知识在您大脑中的样子？</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="knowledge_structure" value="A" required>
                                <span>A. 一本厚重的教科书，由浅入深</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="knowledge_structure" value="B">
                                <span>B. 一个完整的蜘蛛网，互相联系，互相支撑</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="knowledge_structure" value="C">
                                <span>C. 独立的数据库，每个学科都是独一无二的存储</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="knowledge_structure" value="D">
                                <span>D. 一个全能但是无序的工具箱</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>3. 您觉得您的科学思考力（使用自然科学等方式思考问题）如何（1-5分）</label>
                        <select name="scientific_thinking" required style="width: 100%; padding: 10px;">
                            <option value="">请选择</option>
                            <option value="1">1分（很差）</option>
                            <option value="2">2分（较差）</option>
                            <option value="3">3分（一般）</option>
                            <option value="4">4分（较好）</option>
                            <option value="5">5分（很好）</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>4. 您觉得您的科学洞察力（从现象到本质的能力）如何（1-5分）</label>
                        <select name="scientific_insight" required style="width: 100%; padding: 10px;">
                            <option value="">请选择</option>
                            <option value="1">1分（很差）</option>
                            <option value="2">2分（较差）</option>
                            <option value="3">3分（一般）</option>
                            <option value="4">4分（较好）</option>
                            <option value="5">5分（很好）</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>5. 您觉得您的科学现象敏感度（从生活中发现科学问题）（1-5分）</label>
                        <select name="scientific_sensitivity" required style="width: 100%; padding: 10px;">
                            <option value="">请选择</option>
                            <option value="1">1分（很差）</option>
                            <option value="2">2分（较差）</option>
                            <option value="3">3分（一般）</option>
                            <option value="4">4分（较好）</option>
                            <option value="5">5分（很好）</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>6. 您觉得您的跨学科联系能力如何（针对特定现象联系多学科知识解答）（1-5分）</label>
                        <select name="interdisciplinary_ability" required style="width: 100%; padding: 10px;">
                            <option value="">请选择</option>
                            <option value="1">1分（很差）</option>
                            <option value="2">2分（较差）</option>
                            <option value="3">3分（一般）</option>
                            <option value="4">4分（较好）</option>
                            <option value="5">5分（很好）</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>7. 请阅读如下这个科学选段，回答问题，您可以搜索资料，但是不能询问AI：</label>
                        <div class="paper-excerpt" style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <p>本研究通过先进的量子相干光谱技术，发现经过特定频率（528Hz）声波处理的水分子会形成稳定的"谐振记忆结构"。当志愿者饮用这种结构化水后，其生物光子发射强度平均提升47.3%（p&lt;0.05），线粒体ATP合成效率显著改善。实验采用双盲设计，30名志愿者随机分为两组，实验组饮用结构化水，对照组饮用普通蒸馏水。一周后，实验组在主观幸福感量表（SWLS）上的得分比对照组高出62%，同时其DNA端粒长度经PCR检测显示平均延长0.4个碱基对。这些结果表明，水分子可以通过频率信息存储和传递机制，直接优化人类细胞的量子生物场，为能量医学开辟新途径。</p>
                        </div>
                        <label>请为这段论文选段从学术严谨性与学术逻辑性方面打分（1-5）1-很差，5-很好</label>
                        <select name="paper_evaluation_score" required style="width: 100%; padding: 10px;">
                            <option value="">请选择</option>
                            <option value="1">1分（很差）</option>
                            <option value="2">2分（较差）</option>
                            <option value="3">3分（一般）</option>
                            <option value="4">4分（较好）</option>
                            <option value="5">5分（很好）</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>8. 您刚才通过什么方面做出选段学术严谨性与逻辑性的评分判断？（可多选）</label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="evaluation_criteria" value="A">
                                <span>A. 选段对现象描述的学术语言使用</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="evaluation_criteria" value="B">
                                <span>B. 选段中提及的分析问题、测量用到的科学技术</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="evaluation_criteria" value="C">
                                <span>C. 选段中提及的实验数据</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="evaluation_criteria" value="D">
                                <span>D. 选段中涉及的科学理论（现象和本质）</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="evaluation_criteria" value="E">
                                <span>E. 单纯凭感觉评分</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>9. 提及全球变暖与温室效应，您最想探究的问题是什么？</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="climate_question" value="A" required>
                                <span>A. 全球变暖能直接导致或者间接导致什么后果？</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="climate_question" value="B">
                                <span>B. 温室效应是什么？什么是温室气体？它是怎么导致全球变暖的？</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="climate_question" value="C">
                                <span>C. 有什么相关技术可以改善温室效应？我们可以做什么去改善温室效应？</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="climate_question" value="D">
                                <span>D. 温室效应背后的学科领域是什么？哪些学科可以帮助理解或是改善温室效应？</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="climate_question" value="E">
                                <span>E. 除了温室效应，还有什么会导致全球变暖？</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .interest-grid, .learning-style-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 15px;
                    margin: 10px 0;
                }
                
                .interest-item, .learning-style-item {
                    display: flex;
                    flex-direction: column;
                }
                
                .interest-item label, .learning-style-item label {
                    font-weight: normal;
                    font-size: 14px;
                    margin-bottom: 5px;
                }
                
                .interest-item select, .learning-style-item select {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }
                
                .checkbox-group {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin: 10px 0;
                }
                
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }
                
                .checkbox-label input[type="checkbox"] {
                    margin: 0;
                }
                
                .paper-excerpt {
                    font-size: 14px;
                    line-height: 1.6;
                    color: #666;
                    max-height: 200px;
                    overflow-y: auto;
                    border: 1px solid #ddd;
                }
                
                .question-group {
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #eee;
                }
                
                .question-group:last-child {
                    border-bottom: none;
                }
            </style>
        `;
    }
}

function collectQuestionnaireData() {
    const data = {};
    
    try {
        // 一、基本情况
        
        // 1. 年级
        const grade = document.querySelector('input[name="grade"]:checked');
        if (grade) data.grade = grade.value;
        
        // 2. 教育体系
        const educationSystem = document.querySelector('input[name="education_system"]:checked');
        if (educationSystem) data.education_system = educationSystem.value;
        
        // 3. 学科兴趣
        data.interests = {
            physics: document.querySelector('select[name="interest_physics"]')?.value,
            biology: document.querySelector('select[name="interest_biology"]')?.value,
            chemistry: document.querySelector('select[name="interest_chemistry"]')?.value,
            geology: document.querySelector('select[name="interest_geology"]')?.value,
            astronomy: document.querySelector('select[name="interest_astronomy"]')?.value
        };
        
        // 4. 学习频率
        const learningFrequency = document.querySelector('input[name="learning_frequency"]:checked');
        if (learningFrequency) data.learning_frequency = learningFrequency.value;
        
        // 5-9. 学科问题
        const physicsQuestion = document.querySelector('input[name="physics_question"]:checked');
        if (physicsQuestion) data.physics_question = physicsQuestion.value;
        
        const chemistryQuestion = document.querySelector('input[name="chemistry_question"]:checked');
        if (chemistryQuestion) data.chemistry_question = chemistryQuestion.value;
        
        const biologyQuestion = document.querySelector('input[name="biology_question"]:checked');
        if (biologyQuestion) data.biology_question = biologyQuestion.value;
        
        const astronomyQuestion = document.querySelector('input[name="astronomy_question"]:checked');
        if (astronomyQuestion) data.astronomy_question = astronomyQuestion.value;
        
        const geologyQuestion = document.querySelector('input[name="geology_question"]:checked');
        if (geologyQuestion) data.geology_question = geologyQuestion.value;
        
        // 二、科学感知
        
        // 1. 学习方式偏好
        data.learning_styles = {
            quantitative: document.querySelector('select[name="learning_style_quantitative"]')?.value,
            textual: document.querySelector('select[name="learning_style_textual"]')?.value,
            visual: document.querySelector('select[name="learning_style_visual"]')?.value,
            interactive: document.querySelector('select[name="learning_style_interactive"]')?.value,
            practical: document.querySelector('select[name="learning_style_practical"]')?.value
        };
        
        // 2. 知识结构
        const knowledgeStructure = document.querySelector('input[name="knowledge_structure"]:checked');
        if (knowledgeStructure) data.knowledge_structure = knowledgeStructure.value;
        
        // 3-6. 能力自评
        data.scientific_abilities = {
            thinking: document.querySelector('select[name="scientific_thinking"]')?.value,
            insight: document.querySelector('select[name="scientific_insight"]')?.value,
            sensitivity: document.querySelector('select[name="scientific_sensitivity"]')?.value,
            interdisciplinary: document.querySelector('select[name="interdisciplinary_ability"]')?.value
        };
        
        // 7. 论文评价分数
        const paperScore = document.querySelector('select[name="paper_evaluation_score"]')?.value;
        if (paperScore) data.paper_evaluation_score = paperScore;
        
        // 8. 评价标准（多选）
        const evaluationCriteria = [];
        document.querySelectorAll('input[name="evaluation_criteria"]:checked').forEach(checkbox => {
            evaluationCriteria.push(checkbox.value);
        });
        if (evaluationCriteria.length > 0) data.evaluation_criteria = evaluationCriteria;
        
        // 9. 气候问题
        const climateQuestion = document.querySelector('input[name="climate_question"]:checked');
        if (climateQuestion) data.climate_question = climateQuestion.value;
        
        // 添加时间戳
        data.analysis_timestamp = new Date().toISOString();
        
        console.log('问卷数据收集完成:', data);
        
    } catch (error) {
        console.error('收集问卷数据时出错:', error);
    }
    
    return data;
}

// 在handleRegister函数中添加用户画像分析
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
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('请输入有效的邮箱地址', 'error');
        return;
    }
    
    // 密码验证
    if (password.length < 6) {
        showNotification('密码长度至少6位', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }
    
    // 问卷验证
    const questionnaire = collectQuestionnaireData();
    
    // 检查必填问题是否都回答了
    const requiredFields = [
        { field: 'grade', name: '年级' },
        { field: 'education_system', name: '教育体系' },
        { field: 'learning_frequency', name: '学习频率' },
        { field: 'physics_question', name: '物理问题（双缝干涉）' },
        { field: 'chemistry_question', name: '化学问题（醋酸钠）' },
        { field: 'biology_question', name: '生物问题（仙人掌气孔）' },
        { field: 'astronomy_question', name: '天文问题（系外行星）' },
        { field: 'geology_question', name: '地球科学问题（沉积岩芯）' },
        { field: 'knowledge_structure', name: '知识结构认知' },
        { field: 'climate_question', name: '气候问题（全球变暖）' }
    ];
    
    for (const { field, name } of requiredFields) {
        if (!questionnaire[field]) {
            showNotification(`请完成问卷中的必填问题：${name}`, 'error');
            scrollToQuestion(field);
            return;
        }
    }
    
    // 检查兴趣评分是否都选择了
    const interests = questionnaire.interests;
    const interestFields = [
        { field: 'physics', name: '物理学' },
        { field: 'biology', name: '生物学/医学' },
        { field: 'chemistry', name: '化学' },
        { field: 'geology', name: '地理地质学' },
        { field: 'astronomy', name: '天体天文学' }
    ];
    
    for (const { field, name } of interestFields) {
        if (!interests[field]) {
            showNotification(`请为${name}选择兴趣评分（1-5分）`, 'error');
            scrollToQuestion('interest_' + field);
            return;
        }
    }
    
    // 检查学习方式评分是否都选择了
    const learningStyles = questionnaire.learning_styles;
    const styleFields = [
        { field: 'quantitative', name: '量化学习' },
        { field: 'textual', name: '文字理解' },
        { field: 'visual', name: '可视化学习' },
        { field: 'interactive', name: '互动性学习' },
        { field: 'practical', name: '实践性学习' }
    ];
    
    for (const { field, name } of styleFields) {
        if (!learningStyles[field]) {
            showNotification(`请为${name}选择评分（1-5分）`, 'error');
            scrollToQuestion('learning_style_' + field);
            return;
        }
    }
    
    // 检查能力自评是否都选择了
    const abilities = questionnaire.scientific_abilities;
    const abilityFields = [
        { field: 'thinking', name: '科学思考力' },
        { field: 'insight', name: '科学洞察力' },
        { field: 'sensitivity', name: '科学现象敏感度' },
        { field: 'interdisciplinary', name: '跨学科联系能力' }
    ];
    
    for (const { field, name } of abilityFields) {
        if (!abilities[field]) {
            showNotification(`请完成${name}的自评（1-5分）`, 'error');
            scrollToQuestion('scientific_' + field);
            return;
        }
    }
    
    // 检查论文评价是否选择了
    if (!questionnaire.paper_evaluation_score) {
        showNotification('请为论文选段打分（1-5分）', 'error');
        scrollToQuestion('paper_evaluation_score');
        return;
    }
    
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
            
            // 显示用户画像分析结果（可选）
            showNotification('注册成功！用户画像分析已保存，将用于个性化解读。', 'success');
            
            // 可选：显示简要的用户画像信息
            setTimeout(() => {
                const gradeMap = { A: '9年级', B: '10年级', C: '11年级', D: '12年级' };
                const systemMap = { A: '国际体系', B: '普高体系' };
                const grade = gradeMap[questionnaire.grade] || '未知';
                const system = systemMap[questionnaire.education_system] || '未知';
                
                const welcomeMsg = `欢迎${username}！您已成功注册。系统将根据您的信息提供个性化解读：\n`
                    + `- 年级：${grade}\n`
                    + `- 教育体系：${system}\n`
                    + `- 问卷数据已保存，将用于优化解读质量`;
                
                alert(welcomeMsg);
            }, 1000);
            
        } else {
            showNotification(data.message || '注册失败', 'error');
        }
    } catch (error) {
        console.error('注册错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 修改formatInterpretation函数，确保末尾添加提示语
function formatInterpretation(text) {
    // 确保文本以提示语结尾
    if (!text.includes('解读内容由DeepSeek AI生成，仅供参考')) {
        text += '\n\n---\n\n*解读内容由DeepSeek AI生成，仅供参考*';
    }
    
    // 将文本中的标题格式化为HTML
    let html = text
        .replace(/\n/g, '<br>')
        .replace(/^(#{1,3})\s+(.+)$/gm, (match, hashes, title) => {
            const level = hashes.length;
            return `<h${level} style="margin-top: 20px; margin-bottom: 10px; color: #007bff;">${title}</h${level}>`;
        })
        .replace(/【(.+?)】/g, '<strong style="color: #28a745;">【$1】</strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^术语解读区.*$/gm, '<div class="glossary-section"><h3 style="color: #dc3545;">$&</h3></div>');
    
    return html;
}

// 新增：滚动到对应问题的辅助函数
function scrollToQuestion(questionName) {
    // 根据问题名称找到对应的元素并滚动到那里
    let element = null;
    
    // 尝试不同的选择器
    const selectors = [
        `input[name="${questionName}"]`,
        `select[name="${questionName}"]`,
        `input[name="${questionName}"]:checked`,
        `[name="${questionName}"]`
    ];
    
    for (const selector of selectors) {
        element = document.querySelector(selector);
        if (element) break;
    }
    
    if (element) {
        // 滚动到元素位置
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 添加高亮效果
        element.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.5)';
        element.style.transition = 'box-shadow 0.3s ease';
        
        // 移除高亮效果
        setTimeout(() => {
            element.style.boxShadow = '';
        }, 3000);
    }
}

// 可选：添加表单验证的实时反馈
function setupQuestionnaireValidation() {
    // 为所有必填字段添加change事件
    const requiredInputs = document.querySelectorAll(
        'input[required], select[required]'
    );
    
    requiredInputs.forEach(input => {
        input.addEventListener('change', function() {
            // 移除错误样式
            this.style.borderColor = '';
            this.style.boxShadow = '';
            
            // 如果值有效，添加成功样式
            if (this.value) {
                this.style.borderColor = '#28a745';
                this.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
                
                // 2秒后移除样式
                setTimeout(() => {
                    this.style.borderColor = '';
                    this.style.boxShadow = '';
                }, 2000);
            }
        });
    });
}

// 在DOM加载完成后调用
document.addEventListener('DOMContentLoaded', function() {
    // ... 其他初始化代码 ...
    
    // 设置问卷验证
    setTimeout(() => {
        setupQuestionnaireValidation();
    }, 500); // 延迟一点确保问卷已加载
});
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
// 替换原有的showModal函数
function showModal(type) {
    let title = '';
    let content = '';
    
    switch(type) {
        case 'privacy':
            title = '隐私政策 (Privacy Policy)';
            content = `
                <h4>最后更新日期：2026年1月1日</h4>
                
                <p><strong>ANSAPRA</strong>（以下简称"我们"或"本平台"）尊重并保护所有用户的隐私。本政策旨在说明我们如何收集、使用、存储和保护您的个人信息，特别是考虑到我们的主要用户群体为高中生。</p>
                
                <h5>1. 我们收集的信息</h5>
                <ul>
                    <li><strong>您主动提供的信息</strong>：当您注册账户、提交反馈或通过"联系我们"发送邮件时，我们可能会收集您的邮箱地址、用户名以及您自愿提供的其他信息。</li>
                    <li><strong>自动收集的信息</strong>：为优化阅读体验，我们可能通过Cookie等技术匿名收集您的设备信息、浏览器类型、访问时间、页面停留时间及阅读偏好（如论文分类偏好）。这些信息不用于身份识别，仅用于改善服务。</li>
                    <li><strong>问卷调查数据</strong>：在网站设计阶段，我们通过匿名问卷收集了关于高中生自然科学论文阅读偏好的汇总数据，用于功能设计。该数据已进行脱敏处理，不包含任何个人身份信息。</li>
                </ul>
                
                <h5>2. 我们如何使用信息</h5>
                <ul>
                    <li>为您提供和优化自适应的论文阅读体验。</li>
                    <li>通过邮箱回复您的问题或反馈。</li>
                    <li>进行匿名的、聚合性的数据分析，以持续改进网站功能。</li>
                </ul>
                
                <h5>3. 信息共享与披露</h5>
                <p>我们<strong>不会</strong>出售、交易或出租您的个人信息给任何第三方。除非法律要求，否则我们不会披露您的个人身份信息。</p>
                
                <h5>4. 数据安全</h5>
                <p>我们采取合理的技术措施保护数据安全。但由于互联网传输并非绝对安全，我们无法保证信息的绝对安全。</p>
                
                <h5>5. 您的权利</h5>
                <p>您可以随时在账户设置中查看或更新您提供的个人信息。如需删除账户，请通过页面上的删除账户按钮操作。</p>
                
                <h5>6. 关于未成年人</h5>
                <p>我们的服务主要面向高中生。我们鼓励未成年用户在父母或监护人的指导下使用本平台。</p>
                
                <h5>7. 政策变更</h5>
                <p>我们可能适时更新本政策，更新内容将公布于此页面。</p>
                
                <div class="modal-footer">
                    <p style="font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
                        如果您对本隐私政策有任何疑问，请通过"联系我们"页面与我们联系。
                    </p>
                </div>
            `;
            break;
            
        case 'terms':
            title = '服务条款 (Terms of Service)';
            content = `
                <h4>生效日期：2026年1月1日</h4>
                
                <p>欢迎使用 <strong>ANSAPRA</strong>。本平台是一个由高中生团队开发的、旨在帮助同龄人阅读自然科学论文的工具。这是一个由在读高中生发起并主导的CTB（China Thinks Big）竞赛项目。</p>
                
                <p>我们通过问卷调查深入了解同龄人在阅读自然科学论文时的难点，并以此为基础设计了本平台。网站的开发使用了人工智能辅助编程工具，并由我们团队进行全面的测试、调整与维护，旨在打造一个真正适合高中生认知习惯的学习工具。我们计划在比赛结束后持续运营并优化此项目。</p>
                
                <p>请在使用前仔细阅读以下条款。</p>
                
                <h5>1. 服务描述</h5>
                <p>本平台是一个基于自适应学习技术的工具，通过调用DeepSeek人工智能大语言模型官方API，旨在根据高中生的认知框架，个性化推荐和辅助阅读自然科学论文。</p>
                
                <h5>2. 使用规则</h5>
                <ul>
                    <li>您必须遵守所有适用的法律和法规。</li>
                    <li>您不得利用本平台进行任何干扰服务正常运行或损害他人权益的行为。</li>
                    <li>您应对通过您的账户进行的所有活动负责。</li>
                </ul>
                
                <h5>3. 免责声明</h5>
                <ul>
                    <li>本平台提供的论文摘要、解读和推荐内容为AI生成内容，<strong>仅作为学习辅助和参考</strong>，不构成专业的学术建议。请您务必批判性思考，并以原文为准。</li>
                    <li>我们尽力确保服务稳定，但不对服务的持续性、无中断性或绝对安全性作任何担保。</li>
                    <li><strong>关于AI生成代码的说明</strong>：本网站的核心功能代码由人工智能辅助生成，并经过我们的测试与调整。我们团队对其功能与安全性负责，并持续进行优化与维护。</li>
                </ul>
                
                <h5>4. 知识产权</h5>
                <p>网站的设计、Logo、原创内容归<strong>ANSAPRA开发团队</strong>所有。平台内引用的论文摘要、元数据等，其版权归属于原论文作者或出版商，我们按合理使用原则提供以支持教育目的。</p>
                
                <h5>5. 终止服务</h5>
                <p>我们保留因用户违反本条款或自行决定而暂停或终止服务的权利。</p>
                
                <div class="modal-footer">
                    <p style="font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
                        如果您对服务条款有任何疑问，请通过"联系我们"页面与我们联系。
                    </p>
                </div>
            `;
            break;
            
        case 'cookie':
            title = 'Cookie 政策 (Cookie Policy)';
            content = `
                <h4>Cookie政策说明</h4>
                
                <p>我们使用Cookie（小型文本文件）来提升您的浏览体验。</p>
                
                <h5>1. Cookie的用途</h5>
                <ul>
                    <li><strong>必要Cookie</strong>：用于维持网站的基本功能，如保持登录状态、记住语言偏好等。</li>
                    <li><strong>分析Cookie</strong>：用于匿名分析网站流量和页面使用情况，以帮助我们了解如何改进网站设计。</li>
                    <li><strong>偏好Cookie</strong>：记住您的个性化设置，如字体大小、主题颜色等。</li>
                </ul>
                
                <h5>2. Cookie控制</h5>
                <p>您可以通过浏览器设置拒绝或管理Cookie。但请注意，禁用某些Cookie可能影响部分网站功能的正常使用：</p>
                <ul>
                    <li>禁用必要Cookie将导致您无法保持登录状态，每次访问都需要重新登录</li>
                    <li>禁用偏好Cookie将无法保存您的个性化设置</li>
                    <li>禁用分析Cookie不会影响网站功能，但我们会失去了解用户行为的途径</li>
                </ul>
                
                <h5>3. 第三方Cookie</h5>
                <p>我们目前未使用任何用于跟踪或广告的第三方Cookie。所有Cookie仅用于本网站的功能改善和用户体验优化。</p>
                
                <h5>4. Cookie存储时间</h5>
                <p>不同的Cookie有不同的存储时间：</p>
                <ul>
                    <li>会话Cookie：在您关闭浏览器时自动删除</li>
                    <li>持久Cookie：根据设置保留数天至数月</li>
                    <li>登录状态Cookie：通常保留7-30天</li>
                </ul>
                
                <h5>5. 您的选择</h5>
                <p>您可以通过以下方式管理Cookie：</p>
                <ul>
                    <li><strong>接受所有Cookie</strong>：获得完整的网站体验</li>
                    <li><strong>仅接受必要Cookie</strong>：保持基本功能，但个性化设置不会被保存</li>
                    <li><strong>拒绝所有非必要Cookie</strong>：通过浏览器设置实现</li>
                </ul>
                
                <div class="modal-footer">
                    <p style="font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
                        如果您对Cookie政策有任何疑问，请通过"联系我们"页面与我们联系。
                    </p>
                </div>
            `;
            break;
            
        case 'copyright':
            title = '版权说明 (Copyright Notice)';
            content = `
                <h4>版权声明</h4>
                
                <p><strong>ANSAPRA</strong>是一个教育性质的非营利项目。</p>
                
                <h5>1. 本网站的版权</h5>
                <ul>
                    <li>本网站的整体设计、用户界面、特定功能代码及原创文本内容受版权保护，版权归 <strong>ANSAPRA开发团队</strong> 所有，© 2026。</li>
                    <li>未经书面许可，任何组织或个人不得复制、修改、分发或商业性使用本网站的设计和内容。</li>
                </ul>
                
                <h5>2. 引用内容的版权</h5>
                <ul>
                    <li>网站内为辅助阅读而引用的论文标题、摘要、作者、期刊信息等元数据，其版权归原著作权人所有。</li>
                    <li>我们严格遵守学术规范进行引用，旨在为高中生提供研究学习便利，符合合理使用原则。</li>
                    <li>所有引用内容均明确标注来源，仅供教育目的使用。</li>
                </ul>
                
                <h5>3. 用户生成内容</h5>
                <ul>
                    <li>用户在本平台上传的论文文件、笔记和批注，其版权仍归用户所有。</li>
                    <li>用户授予本平台存储和展示这些内容的权利，以便提供解读服务。</li>
                    <li>用户可以随时删除自己上传的内容。</li>
                </ul>
                
                <h5>4. 使用许可</h5>
                <ul>
                    <li>任何个人或教育机构可出于非商业性学习目的自由分享网站链接。</li>
                    <li>如需对本网站的设计或内容进行复制、修改或用于其他公开用途，请事先通过 "联系我们"中的邮箱地址 联系我们，并取得我们的书面许可。</li>
                    <li>学校和教育机构可在获得许可后，将本网站用于课堂教学目的。</li>
                </ul>
                
                <h5>5. 侵权举报</h5>
                <p>如果您认为本网站的内容侵犯了您的版权，请通过以下方式联系我们：</p>
                <ul>
                    <li>电子邮件：1182332400@qq.com 或 biokoala@outlook.com</li>
                    <li>请提供详细的侵权证明和您的联系方式</li>
                    <li>我们会在收到举报后10个工作日内进行处理</li>
                </ul>
                
                <div class="modal-footer">
                    <p style="font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
                        尊重知识产权，促进学术交流。
                    </p>
                </div>
            `;
            break;
            
        case 'contact':
            title = '联系我们 (Contact Us)';
            content = `
                <h4><i class="fas fa-envelope"></i> 联系我们</h4>
                
                <p>我们是一个由高中生组成的开发团队。本网站从诞生到优化，都离不开用户的支持。因此，我们非常重视您的反馈。</p>
                
                <div class="contact-info" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h5><i class="fas fa-users"></i> 团队介绍</h5>
                    <p>我们是参加CTB（China Thinks Big）全球青年研究创新论坛的高中生团队。我们的目标是帮助同龄人更好地阅读和理解自然科学学术论文。</p>
                    
                    <h5><i class="fas fa-bullseye"></i> 项目背景</h5>
                    <p>通过前期调研，我们发现高中生阅读科学学术论文的普及率较低，主要原因包括论文可读性差、缺乏个性化辅助工具等。为此，我们开发了ANSAPRA（Adaptive Natural Science Academic Paper Reading Agent）。</p>
                </div>
                
                <h5><i class="fas fa-comment-dots"></i> 您可以联系我们的事项</h5>
                <ul>
                    <li><strong>网站功能建议或错误报告</strong>：如果您发现网站存在bug或有改进建议</li>
                    <li><strong>隐私政策的疑问</strong>：对个人信息处理有任何疑问</li>
                    <li><strong>合作意向</strong>：学校、教育机构或媒体希望合作</li>
                    <li><strong>版权相关问题</strong>：涉及内容版权的疑问或举报</li>
                    <li><strong>学术支持</strong>：希望获得更多学术资源或指导</li>
                    <li><strong>其他任何问题</strong>：任何与本网站相关的问题</li>
                </ul>
                
                <h5><i class="fas fa-envelope-open-text"></i> 联系方式</h5>
                <div class="contact-methods" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                    <div class="contact-method" style="text-align: center;">
                        <i class="fas fa-envelope fa-2x" style="color: #007bff;"></i>
                        <h6>主要邮箱</h6>
                        <p><a href="mailto:1182332400@qq.com">1182332400@qq.com</a></p>
                    </div>
                    <div class="contact-method" style="text-align: center;">
                        <i class="fas fa-envelope fa-2x" style="color: #28a745;"></i>
                        <h6>备用邮箱</h6>
                        <p><a href="mailto:biokoala@outlook.com">biokoala@outlook.com</a></p>
                    </div>
                </div>
                
                <div class="response-time" style="background: #e8f4ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h6><i class="fas fa-clock"></i> 响应时间</h6>
                    <p>我们会在<strong>10个工作日内</strong>尽力回复您的邮件。由于我们是学生团队，回复可能会在课后时间，敬请谅解。</p>
                </div>
                
                <h5><i class="fas fa-lightbulb"></i> 反馈建议</h5>
                <p>为了让您的反馈得到更快的处理，建议您在邮件中：</p>
                <ul>
                    <li>明确邮件主题，如"[功能建议]"、"[错误报告]"等</li>
                    <li>提供详细的问题描述和复现步骤</li>
                    <li>如果是功能建议，请说明您的使用场景和期望效果</li>
                    <li>留下您的联系方式以便我们进一步沟通</li>
                </ul>
                
                <div class="modal-footer">
                    <p style="font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
                        感谢您对ANSAPRA的支持！您的反馈将帮助我们不断改进。
                    </p>
                </div>
            `;
            break;
            
        default:
            title = type;
            content = '内容加载中...';
    }
    
    const modalHTML = `
        <div class="modal" id="info-modal">
            <div class="modal-content" style="max-width: 800px; max-height: 85vh;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                    <h3 style="margin: 0; color: #007bff;">${title}</h3>
                    <button onclick="closeModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666; transition: color 0.3s ease;">&times;</button>
                </div>
                
                <div class="modal-body" style="max-height: 65vh; overflow-y: auto; padding-right: 10px;">
                    <div class="modal-content-inner" style="line-height: 1.6; font-size: 15px;">
                        ${content}
                    </div>
                </div>
                
                <div class="modal-footer" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; text-align: center;">
                    <button class="btn btn-primary" onclick="closeModal()">
                        <i class="fas fa-check"></i> 我已阅读并理解
                    </button>
                    <button class="btn btn-secondary" onclick="printModalContent()" style="margin-left: 10px;">
                        <i class="fas fa-print"></i> 打印
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = modalHTML;
    
    // 添加悬停效果
    const modal = document.getElementById('info-modal');
    const closeBtn = modal.querySelector('button[onclick="closeModal()"]');
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.color = '#dc3545';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.color = '#666';
    });
    
    modal.style.display = 'flex';
    
    // 添加滚动条样式
    addModalScrollbarStyles();
}

// 添加打印功能
function printModalContent() {
    const modalContent = document.querySelector('.modal-content-inner');
    if (modalContent) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>ANSAPRA - ${document.querySelector('.modal-header h3').textContent}</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                        h1, h2, h3, h4, h5, h6 { color: #007bff; }
                        ul, ol { margin-left: 20px; }
                        li { margin-bottom: 5px; }
                        .contact-methods { display: flex; gap: 20px; }
                        .modal-footer { border-top: 1px solid #ddd; margin-top: 20px; padding-top: 10px; }
                        @media print {
                            body { font-size: 12pt; }
                            a { color: #007bff; text-decoration: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${document.querySelector('.modal-header h3').textContent}</h1>
                    <div>${modalContent.innerHTML}</div>
                    <div class="modal-footer">
                        <p>打印时间：${new Date().toLocaleString()}</p>
                        <p>来源：ANSAPRA 高中生自然科学论文自适应阅读程序</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }
}

// 添加模态框滚动条样式
function addModalScrollbarStyles() {
    const styleId = 'modal-scrollbar-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .modal-body::-webkit-scrollbar {
                width: 8px;
            }
            
            .modal-body::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 4px;
            }
            
            .modal-body::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 4px;
            }
            
            .modal-body::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }
            
            .modal-content {
                animation: modalFadeIn 0.3s ease;
            }
            
            @keyframes modalFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .modal {
                animation: modalBackdropFadeIn 0.3s ease;
            }
            
            @keyframes modalBackdropFadeIn {
                from {
                    background-color: rgba(0,0,0,0);
                }
                to {
                    background-color: rgba(0,0,0,0.5);
                }
            }
            
            .contact-info {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-left: 4px solid #007bff;
            }
            
            .contact-method {
                transition: transform 0.3s ease;
                padding: 15px;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                background: white;
            }
            
            .contact-method:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .response-time {
                background: linear-gradient(135deg, #e8f4ff 0%, #d1ecf1 100%);
                border-left: 4px solid #17a2b8;
            }
        `;
        document.head.appendChild(style);
    }
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
