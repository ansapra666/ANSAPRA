class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'zh';
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.applyLanguage(this.currentLang);
        this.setupEventListeners();
    }

    async loadTranslations() {
        try {
            // 尝试使用相对路径加载翻译文件
            const response = await fetch('static/lang/translations.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
            console.log('Translations loaded successfully');
        } catch (error) {
            console.error('Failed to load translations:', error);
            // 使用默认翻译作为后备
            this.translations = {
                en: {},
                zh: {}
            };
        }
    }

    applyLanguage(lang) {
        if (!this.translations[lang]) {
            console.warn(`Language ${lang} not available, defaulting to en`);
            lang = 'en';
        }

        this.currentLang = lang;
        localStorage.setItem('language', lang);
        
        // 更新 HTML lang 属性
        document.documentElement.lang = lang;
        
        // 切换字体设置
        this.switchFonts(lang);
        
        // 强制应用字体设置到所有元素，确保按钮、文本框等也能正确显示
        this.forceFontApplication();
        
        // 强制重新加载使用说明和设置表单，确保所有内容都被翻译
        if (typeof loadInstructions === 'function') {
            loadInstructions();
        }
        // 直接调用settings.js中的函数，确保正确重新加载设置表单
        if (typeof loadReadingSettings === 'function') {
            loadReadingSettings();
        }
        if (typeof loadVisualSettings === 'function') {
            loadVisualSettings();
        }
        
        // 延迟更新文本内容，确保DOM完全更新
        setTimeout(() => {
            // 更新所有带有 data-i18n 属性的元素（包括新添加的元素）
            this.updateTextContent();
        }, 100);
        
        // 更新语言切换按钮状态
        this.updateLanguageButtons();
        
        // 触发自定义事件
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
        
        // 重新显示cookie提示（如果用户还没有同意）
        if (!localStorage.getItem('cookieConsent')) {
            // 移除现有的cookie提示
            const existingBanner = document.getElementById('cookie-consent-banner');
            if (existingBanner) {
                existingBanner.remove();
            }
            // 重新显示cookie提示
            if (typeof setupCookieConsent === 'function') {
                setupCookieConsent();
            }
        }
        
        console.log(`Language applied: ${lang}`);
        console.log('Number of translated elements:', document.querySelectorAll('[data-i18n]').length);
    }

    // 切换字体
    switchFonts(lang) {
        // 首先直接应用字体设置
        this.applyFontSettings(lang);
        
        // 始终使用中文字体
        const chineseFontRadios = document.querySelectorAll('input[name="chinese_font"]');
        if (chineseFontRadios.length > 0) {
            // 检查是否有已选中的中文字体
            let selectedFont = document.querySelector('input[name="chinese_font"]:checked');
            if (!selectedFont) {
                // 如果没有选中的，激活第一个选项
                selectedFont = chineseFontRadios[0];
                selectedFont.checked = true;
            }
            // 强制应用选中的中文字体
            const fontValue = selectedFont.value;
            document.body.style.fontFamily = fontValue;
            console.log(`Applied Chinese font: ${fontValue}`);
        }
    }
    
    // 应用字体设置
    applyFontSettings(lang) {
        // 获取保存的字体设置
        const savedSettings = localStorage.getItem('visualSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                
                // 获取字体大小
                const fontSize = settings.font_size || '18';
                
                // 计算实际应用的字体大小（华文楷体大2px）
                let actualFontSize = parseInt(fontSize);
                if (settings.chinese_font && (settings.chinese_font.includes('STKaiti') || settings.chinese_font.includes('KaiTi'))) {
                    actualFontSize += 2;
                }
                
                // 获取行高
                const lineHeight = settings.line_height || '1.6';
                
                // 获取字间距
                const letterSpacing = settings.letter_spacing || '0px';
                
                // 应用字体大小、行高和字间距
                document.body.style.fontSize = `${actualFontSize}px`;
                document.body.style.lineHeight = lineHeight;
                document.body.style.letterSpacing = letterSpacing;
                
                // 始终使用中文字体
                if (settings.chinese_font) {
                    document.body.style.fontFamily = settings.chinese_font;
                } else {
                    // 如果没有保存的中文字体设置，使用默认中文字体
                    document.body.style.fontFamily = "'Microsoft YaHei', sans-serif";
                }
            } catch (error) {
                console.error('解析字体设置失败:', error);
                // 解析失败时，使用默认中文字体
                this.applyDefaultFont(lang);
            }
        } else {
            // 如果没有保存的字体设置，使用默认中文字体
            this.applyDefaultFont(lang);
        }
    }

    // 应用默认字体
    applyDefaultFont(lang) {
        // 始终使用默认的中文字体
        const fontFamily = '"Microsoft YaHei", sans-serif';
        
        // 应用字体到整个页面
        document.body.style.fontFamily = fontFamily;
        console.log(`Applied default Chinese font: ${fontFamily}`);
    }

    updateTextContent() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation !== undefined) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else if (element.tagName === 'OPTION') {
                    element.textContent = translation;
                } else {
                    // 检查翻译内容是否包含HTML标签
                    if (translation.includes('<') && translation.includes('>')) {
                        element.innerHTML = translation;
                    } else {
                        element.textContent = translation;
                    }
                }
            }
        });

        // 更新标题
        const title = this.getTranslation('header.title');
        if (title) {
            document.title = title + ' - ' + this.getTranslation('header.subtitle');
        }
    }

    getTranslation(key) {
        // 首先尝试直接查找键
        if (this.translations[this.currentLang] && key in this.translations[this.currentLang]) {
            return this.translations[this.currentLang][key];
        }
        
        // 然后尝试使用点号分割的键查找（向后兼容）
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined;
            }
        }
        
        return value;
    }

    updateLanguageButtons() {
        const buttons = document.querySelectorAll('[data-language]');
        buttons.forEach(button => {
            const lang = button.getAttribute('data-language');
            if (lang === this.currentLang) {
                button.classList.add('active');
                button.disabled = true;
            } else {
                button.classList.remove('active');
                button.disabled = false;
            }
        });

        // 更新所有语言选择按钮的显示文本
        const labels = document.querySelectorAll('.radio-label span');
        labels.forEach(label => {
            if (label.textContent === '中文' || label.textContent === 'Chinese') {
                label.textContent = '中文';
            } else if (label.textContent === 'English' || label.textContent === '英文') {
                label.textContent = 'English';
            }
        });
    }

    setupEventListeners() {
        // 语言切换按钮
        document.addEventListener('click', (e) => {
            const button = e.target.closest('[data-language]');
            if (button) {
                e.preventDefault();
                const lang = button.getAttribute('data-language');
                this.applyLanguage(lang);
            }
        });

        // 监听语言变化，更新页面
        document.addEventListener('languageChanged', (e) => {
            console.log(`Language changed to: ${e.detail.language}`);
        });

        // 监听语言选择变化
        document.addEventListener('change', (e) => {
            if (e.target.name === 'language') {
                this.applyLanguage(e.target.value);
            }
        });

        // 监听语言应用按钮点击
        document.addEventListener('click', (e) => {
            if (e.target.closest('#language-settings .btn-primary')) {
                const selectedLang = document.querySelector('input[name="language"]:checked');
                if (selectedLang) {
                    this.applyLanguage(selectedLang.value);
                }
            }
        });

        // 为语言设置面板中的单选按钮添加点击事件
        document.addEventListener('click', (e) => {
            if (e.target.type === 'radio' && e.target.name === 'language') {
                this.applyLanguage(e.target.value);
            }
        });
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLang;
    }

    // 动态翻译文本
    translate(key) {
        return this.getTranslation(key) || key;
    }
    
    // 强制应用字体设置到所有元素
    forceFontApplication() {
        // 获取保存的字体设置
        const savedSettings = localStorage.getItem('visualSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                
                // 获取字体设置
                const chineseFont = settings.chinese_font || '"Microsoft YaHei", sans-serif';
                
                // 只应用字体家族到所有元素，字体大小让子元素继承
                const allElements = document.querySelectorAll('*');
                allElements.forEach(element => {
                    // 只应用字体家族
                    element.style.fontFamily = chineseFont;
                });
                
                console.log('Font family force applied to all elements');
            } catch (error) {
                console.error('解析字体设置失败:', error);
            }
        }
    }
}

// 初始化语言管理器
let languageManager;

// 确保在main.js加载后初始化语言管理器
function initLanguageManager() {
    if (typeof window.languageManager === 'undefined') {
        languageManager = new LanguageManager();
        
        // 添加语言切换器到页面（如果不存在）
        if (!document.querySelector('.language-switcher')) {
            const languageSwitcher = document.createElement('div');
            languageSwitcher.className = 'language-switcher';
            languageSwitcher.style.cssText = 'display: flex; gap: 10px; margin-left: 20px;';
            languageSwitcher.innerHTML = `
                <button data-language="en" class="lang-btn ${localStorage.getItem('language') === 'en' ? 'active' : ''}" style="padding: 5px 10px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer;">English</button>
                <button data-language="zh" class="lang-btn ${localStorage.getItem('language') === 'zh' ? 'active' : ''}" style="padding: 5px 10px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer;">中文</button>
            `;
            
            const headerContent = document.querySelector('.header-content');
            if (headerContent) {
                headerContent.appendChild(languageSwitcher);
            } else {
                const header = document.querySelector('header');
                if (header) {
                    header.appendChild(languageSwitcher);
                } else {
                    document.body.insertBefore(languageSwitcher, document.body.firstChild);
                }
            }
        }
        
        // 导出语言管理器供其他脚本使用
        window.languageManager = languageManager;
        console.log('Language manager initialized');
    }
}

// 当DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageManager);
} else {
    initLanguageManager();
}

// 导出初始化函数供其他脚本调用
window.initLanguageManager = initLanguageManager;
