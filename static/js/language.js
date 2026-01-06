// 语言切换模块
const LanguageManager = {
    currentLang: 'zh',
    translations: {},
    
    // 初始化
    async init() {
        await this.loadTranslations();
        this.loadSavedLanguage();
        this.applyLanguage();
        this.setupEventListeners();
    },
    
    // 加载翻译文件
    async loadTranslations() {
        try {
            const response = await fetch('/static/lang/translations.json');
            this.translations = await response.json();
        } catch (error) {
            console.error('Failed to load translations:', error);
            this.translations = { zh: {}, en: {} };
        }
    },
    
    // 加载保存的语言设置
    loadSavedLanguage() {
        const saved = localStorage.getItem('userLanguage');
        if (saved && (saved === 'zh' || saved === 'en')) {
            this.currentLang = saved;
        }
        
        // 更新语言选择按钮
        const langRadios = document.querySelectorAll('input[name="language"]');
        langRadios.forEach(radio => {
            radio.checked = radio.value === this.currentLang;
        });
    },
    
    // 切换语言
    switchLanguage(lang) {
        if (lang !== 'zh' && lang !== 'en') return;
        
        this.currentLang = lang;
        localStorage.setItem('userLanguage', lang);
        
        // 更新所有语言选择按钮
        document.querySelectorAll('input[name="language"]').forEach(radio => {
            radio.checked = radio.value === lang;
        });
        
        this.applyLanguage();
        
        // 保存到服务器（如果已登录）
        this.saveLanguageToServer();
        
        showNotification(
            this.getTranslation('languageChanged', lang === 'zh' ? '语言已切换' : 'Language changed'),
            'success'
        );
    },
    
    // 应用语言到界面
    applyLanguage() {
        // 设置HTML语言属性
        document.documentElement.lang = this.currentLang;
        
        // 更新页面标题
        document.title = this.getTranslation('appName');
        
        // 更新所有可翻译的元素
        this.updateAllElements();
        
        // 更新语言选择按钮的文本
        this.updateLanguageButtons();
    },
    
    getTranslation(key) {
        return translations?.[key] || key;
    }
    
    // 导出函数供其他模块使用
    window.translationService = {
        loadTranslations,
        getTranslation,
        currentLang: () => currentLang
    };
    
    // 更新所有界面元素
    updateAllElements() {
        // 1. 更新导航栏
        this.updateNavigation();
        
        // 2. 更新登录/注册页面
        this.updateAuthPages();
        
        // 3. 更新论文解读页面
        this.updateInterpretationPage();
        
        // 4. 更新设置页面
        this.updateSettingsPage();
        
        // 5. 更新页脚
        this.updateFooter();
        
        // 6. 更新模态框
        this.updateModals();
    },
    
    // 更新导航栏
    updateNavigation() {
        // 网站标题
        const logo = document.querySelector('.logo');
        if (logo) logo.textContent = 'ANSAPRA';
        
        const tagline = document.querySelector('.tagline');
        if (tagline) tagline.textContent = this.getTranslation('appName').split(' - ')[1] || '';
        
        // 导航链接
        const navLinks = document.querySelectorAll('.nav-link');
        const navTexts = ['websiteIntro', 'usageInstructions', 'paperInterpretation', 'userSettings'];
        navLinks.forEach((link, index) => {
            if (index < navTexts.length) {
                link.textContent = this.getTranslation(navTexts[index]);
            }
        });
        
        // 用户信息
        const logoutBtn = document.querySelector('.user-info .btn-small');
        if (logoutBtn) logoutBtn.textContent = this.getTranslation('logout');
    },
    
    // 更新登录/注册页面
    updateAuthPages() {
        // 标签页按钮
        const tabBtns = document.querySelectorAll('.auth-tabs .tab-btn');
        const tabTexts = ['login', 'register', 'guest'];
        tabBtns.forEach((btn, index) => {
            if (index < tabTexts.length) {
                btn.textContent = this.getTranslation(tabTexts[index]);
            }
        });
        
        // 登录页面
        const loginTitle = document.querySelector('#login-tab h3');
        if (loginTitle) loginTitle.textContent = this.getTranslation('loginToAnsapra');
        
        const loginLabels = document.querySelectorAll('#login-form label');
        loginLabels.forEach((label, index) => {
            if (index === 0) label.textContent = this.getTranslation('email');
            else if (index === 1) label.textContent = this.getTranslation('password');
        });
        
        const loginBtn = document.querySelector('#login-form button');
        if (loginBtn) loginBtn.textContent = this.getTranslation('login');
        
        // 注册页面
        const registerTitle = document.querySelector('#register-tab h3');
        if (registerTitle) registerTitle.textContent = this.getTranslation('registerAnsapraAccount');
        
        const registerLabels = document.querySelectorAll('#register-form label');
        registerLabels.forEach((label, index) => {
            const texts = ['email', 'username', 'password', 'confirmPassword'];
            if (index < texts.length) {
                label.textContent = this.getTranslation(texts[index]);
            }
        });
        
        const registerBtn = document.querySelector('#register-form button');
        if (registerBtn) registerBtn.textContent = this.getTranslation('register');
        
        // 游客页面
        const guestTitle = document.querySelector('#guest-tab h3');
        if (guestTitle) guestTitle.textContent = this.getTranslation('guestExperience');
        
        const guestText = document.querySelector('#guest-tab p');
        if (guestText) guestText.textContent = this.currentLang === 'zh' ? 
            '以游客身份体验基本功能，部分功能可能受限。' : 
            'Experience basic features as a guest, some functions may be limited.';
        
        const guestBtn = document.querySelector('#guest-tab button');
        if (guestBtn) guestBtn.textContent = this.getTranslation('startExperience');
    },
    
    // 更新论文解读页面
    updateInterpretationPage() {
        // 页面标题
        const pageTitles = document.querySelectorAll('.page-header h2');
        pageTitles.forEach(title => {
            if (title.textContent.includes('论文解读')) {
                title.textContent = this.getTranslation('paperInterpretation');
            }
        });
        
        // 上传区域
        const uploadTitle = document.querySelector('.upload-box h3');
        if (uploadTitle) uploadTitle.textContent = this.getTranslation('uploadPaper');
        
        const uploadText = document.querySelector('.upload-box p');
        if (uploadText) {
            uploadText.textContent = this.currentLang === 'zh' ? 
                '支持PDF、DOCX、TXT格式，最大16MB' : 
                'Supports PDF, DOCX, TXT formats, max 16MB';
        }
        
        const uploadBtn = document.querySelector('.upload-box button');
        if (uploadBtn) uploadBtn.textContent = this.currentLang === 'zh' ? '选择文件' : 'Choose File';
        
        // 文本输入区域
        const textInputTitle = document.querySelector('.text-input-section h3');
        if (textInputTitle) textInputTitle.textContent = this.getTranslation('orInputText');
        
        const textarea = document.querySelector('#paper-text');
        if (textarea) {
            textarea.placeholder = this.currentLang === 'zh' ? 
                '粘贴论文摘要或关键段落...' : 
                'Paste paper abstract or key paragraphs...';
        }
        
        // 操作按钮
        const startBtn = document.querySelector('.action-buttons .btn-large');
        if (startBtn) {
            startBtn.innerHTML = `<i class="fas fa-play"></i> ${this.getTranslation('startInterpretation')}`;
        }
        
        const clearBtn = document.querySelector('.action-buttons .btn-secondary');
        if (clearBtn) {
            clearBtn.innerHTML = `<i class="fas fa-trash"></i> ${this.getTranslation('clear')}`;
        }
        
        // 结果区域
        const resultsTitle = document.querySelector('.results-header h3');
        if (resultsTitle) resultsTitle.textContent = this.getTranslation('interpretationResults');
        
        const downloadBtn = document.querySelector('.result-actions button:nth-child(1)');
        if (downloadBtn) downloadBtn.innerHTML = `<i class="fas fa-download"></i> ${this.getTranslation('download')}`;
        
        const saveBtn = document.querySelector('.result-actions button:nth-child(2)');
        if (saveBtn) saveBtn.innerHTML = `<i class="fas fa-save"></i> ${this.getTranslation('save')}`;
        
        const originalTitle = document.querySelector('.original-paper h4');
        if (originalTitle) originalTitle.textContent = this.getTranslation('originalContent');
        
        const aiTitle = document.querySelector('.interpretation-result h4');
        if (aiTitle) aiTitle.textContent = this.getTranslation('aiInterpretation');
        
        const relatedTitle = document.querySelector('.recommendations-section h4');
        if (relatedTitle) {
            relatedTitle.innerHTML = `<i class="fas fa-book"></i> ${this.getTranslation('relatedPapers')}`;
        }
    },
    
    // 更新设置页面
    updateSettingsPage() {
        // 页面标题
        const settingsTitle = document.querySelector('#settings-page .page-header h2');
        if (settingsTitle) settingsTitle.textContent = this.getTranslation('userSettings');
        
        // 标签页
        const tabBtns = document.querySelectorAll('.settings-tab');
        const tabTexts = ['readingPreferences', 'visualSettings', 'languageSettings', 'accountSettings'];
        tabBtns.forEach((btn, index) => {
            if (index < tabTexts.length) {
                btn.textContent = this.getTranslation(tabTexts[index]);
            }
        });
        
        // 语言设置页面
        const languageLabel = document.querySelector('#language-settings label');
        if (languageLabel) languageLabel.textContent = this.getTranslation('interfaceLanguage');
        
        const languageSpans = document.querySelectorAll('#language-settings .radio-label span');
        languageSpans.forEach((span, index) => {
            if (index === 0) span.textContent = this.getTranslation('chinese');
            else if (index === 1) span.textContent = this.getTranslation('english');
        });
        
        const applyBtn = document.querySelector('#language-settings .btn-primary');
        if (applyBtn) {
            applyBtn.innerHTML = `<i class="fas fa-check"></i> ${this.getTranslation('applyLanguage')}`;
        }
        
        const helpText = document.querySelector('#language-settings .help-text');
        if (helpText) {
            helpText.textContent = this.currentLang === 'zh' ? 
                '点击应用按钮立即切换界面语言' : 
                'Click apply button to switch interface language immediately';
        }
        
        // 保存和重置按钮
        const saveBtn = document.querySelector('.settings-actions .btn-primary');
        if (saveBtn) saveBtn.innerHTML = `<i class="fas fa-save"></i> ${this.getTranslation('saveSettings')}`;
        
        const resetBtn = document.querySelector('.settings-actions .btn-secondary');
        if (resetBtn) resetBtn.innerHTML = `<i class="fas fa-undo"></i> ${this.getTranslation('resetToDefault')}`;
        
        // 账户设置
        const deleteBtn = document.querySelector('#account-settings .btn-danger');
        if (deleteBtn) deleteBtn.innerHTML = `<i class="fas fa-trash"></i> ${this.getTranslation('deleteAccount')}`;
        
        const warningText = document.querySelector('#account-settings .warning-text');
        if (warningText) {
            warningText.textContent = this.currentLang === 'zh' ? 
                '注意：删除账户将永久清除所有数据，包括解读历史和个性化设置。' : 
                'Note: Deleting account will permanently remove all data, including interpretation history and personalized settings.';
        }
    },
    
    // 更新页脚
    updateFooter() {
        const footerLinks = document.querySelectorAll('.footer-link');
        const linkTexts = ['contactUs', 'copyrightNotice', 'termsOfService', 'privacyPolicy', 'cookiePolicy'];
        footerLinks.forEach((link, index) => {
            if (index < linkTexts.length) {
                link.textContent = this.getTranslation(linkTexts[index]);
            }
        });
        
        const copyrightTexts = document.querySelectorAll('.footer-copyright p');
        if (copyrightTexts.length >= 2) {
            copyrightTexts[1].textContent = this.getTranslation('developedBy');
        }
    },
    
    // 更新模态框
    updateModals() {
        // 这个函数可以在模态框打开时动态更新
        // 模态框内容通常是动态生成的，所以在这里不预先更新
    },
    
    // 更新语言选择按钮
    updateLanguageButtons() {
        // 更新所有语言选择按钮的显示文本
        const labels = document.querySelectorAll('.radio-label span');
        labels.forEach(label => {
            if (label.textContent === '中文' || label.textContent === 'Chinese') {
                label.textContent = this.getTranslation('chinese');
            } else if (label.textContent === 'English' || label.textContent === '英文') {
                label.textContent = this.getTranslation('english');
            }
        });
    },
    
    // 设置事件监听器
    setupEventListeners() {
        // 监听语言选择变化
        document.addEventListener('change', (e) => {
            if (e.target.name === 'language') {
                this.switchLanguage(e.target.value);
            }
        });
        
        // 监听语言应用按钮点击
        document.addEventListener('click', (e) => {
            if (e.target.closest('#language-settings .btn-primary')) {
                const selectedLang = document.querySelector('input[name="language"]:checked');
                if (selectedLang) {
                    this.switchLanguage(selectedLang.value);
                }
            }
        });
    },
    
    // 保存语言设置到服务器
    async saveLanguageToServer() {
        if (!AppState.user || AppState.user.is_guest) return;
        
        try {
            // 获取当前设置
            const response = await fetch('/api/user/settings');
            const data = await response.json();
            
            if (data.success && data.settings) {
                const newSettings = {
                    ...data.settings,
                    language: this.currentLang
                };
                
                // 保存到服务器
                await fetch('/api/user/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ settings: newSettings })
                });
            }
        } catch (error) {
            console.error('Failed to save language to server:', error);
        }
    }
};

// 初始化语言管理器
document.addEventListener('DOMContentLoaded', () => {
    LanguageManager.init();
});
