// 语言翻译配置
const Translations = {
    zh: {
        // 通用
        app_name: "ANSAPRA",
        app_subtitle: "高中生自然科学论文自适应阅读程序",
        
        // 导航栏
        nav_intro: "网站介绍",
        nav_instructions: "使用说明",
        nav_interpretation: "论文解读",
        nav_settings: "用户设置",
        
        // 页脚
        footer_contact: "联系我们",
        footer_copyright: "版权说明",
        footer_terms: "服务条款",
        footer_privacy: "隐私政策",
        footer_cookie: "Cookie政策",
        footer_copyright_text: "© 2025 ANSAPRA开发团队 | 高中生自然科学论文自适应阅读程序",
        
        // 设置页面
        settings_title: "用户设置",
        settings_reading: "阅读习惯",
        settings_visual: "视觉设置",
        settings_language: "语言设置",
        settings_account: "账户设置",
        settings_language_zh: "中文",
        settings_language_en: "英文",
        
        // 按钮
        btn_save: "保存设置",
        btn_reset: "恢复默认",
        btn_logout: "退出登录",
        
        // 模态框标题
        modal_contact: "联系我们",
        modal_copyright: "版权说明",
        modal_terms: "服务条款",
        modal_privacy: "隐私政策",
        modal_cookie: "Cookie政策"
    },
    
    en: {
        // 通用
        app_name: "ANSAPRA",
        app_subtitle: "Adaptive Natural Science Academic Paper Reading Program for High School Students",
        
        // 导航栏
        nav_intro: "Introduction",
        nav_instructions: "Instructions",
        nav_interpretation: "Paper Interpretation",
        nav_settings: "User Settings",
        
        // 页脚
        footer_contact: "Contact Us",
        footer_copyright: "Copyright Notice",
        footer_terms: "Terms of Service",
        footer_privacy: "Privacy Policy",
        footer_cookie: "Cookie Policy",
        footer_copyright_text: "© 2025 ANSAPRA Development Team | Adaptive Natural Science Academic Paper Reading Program",
        
        // 设置页面
        settings_title: "User Settings",
        settings_reading: "Reading Habits",
        settings_visual: "Visual Settings",
        settings_language: "Language Settings",
        settings_account: "Account Settings",
        settings_language_zh: "Chinese",
        settings_language_en: "English",
        
        // 按钮
        btn_save: "Save Settings",
        btn_reset: "Reset to Default",
        btn_logout: "Logout",
        
        // 模态框标题
        modal_contact: "Contact Us",
        modal_copyright: "Copyright Notice",
        modal_terms: "Terms of Service",
        modal_privacy: "Privacy Policy",
        modal_cookie: "Cookie Policy"
    }
};

// 语言管理类
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'zh';
    }
    
    setLanguage(lang) {
        if (Translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            this.applyLanguage();
            return true;
        }
        return false;
    }
    
    getTranslation(key) {
        const keys = key.split('.');
        let value = Translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                // 回退到中文
                let zhValue = Translations['zh'];
                for (const k2 of keys) {
                    zhValue = zhValue[k2];
                }
                return zhValue || key;
            }
        }
        return value || key;
    }
    
    applyLanguage() {
        // 更新导航栏
        this.updateTextByClass('nav-intro', 'nav_intro');
        this.updateTextByClass('nav-instructions', 'nav_instructions');
        this.updateTextByClass('nav-interpretation', 'nav_interpretation');
        this.updateTextByClass('nav-settings', 'nav_settings');
        
        // 更新页脚
        this.updateTextByClass('footer-contact', 'footer_contact');
        this.updateTextByClass('footer-copyright', 'footer_copyright');
        this.updateTextByClass('footer-terms', 'footer_terms');
        this.updateTextByClass('footer-privacy', 'footer_privacy');
        this.updateTextByClass('footer-cookie', 'footer_cookie');
        
        // 更新设置页面
        this.updateTextByClass('settings-title', 'settings_title');
        this.updateTextByClass('settings-reading', 'settings_reading');
        this.updateTextByClass('settings-visual', 'settings_visual');
        this.updateTextByClass('settings-language', 'settings_language');
        this.updateTextByClass('settings-account', 'settings_account');
        
        // 更新按钮
        this.updateTextByClass('btn-save', 'btn_save');
        this.updateTextByClass('btn-reset', 'btn_reset');
        this.updateTextByClass('btn-logout', 'btn_logout');
        
        // 更新页面标题
        document.title = this.getTranslation('app_name') + ' - ' + this.getTranslation('app_subtitle');
        
        // 触发自定义事件
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: this.currentLanguage }
        }));
    }
    
    updateTextByClass(className, translationKey) {
        const elements = document.getElementsByClassName(className);
        for (let element of elements) {
            element.textContent = this.getTranslation(translationKey);
        }
    }
    
    updateElementText(element, translationKey) {
        if (element) {
            element.textContent = this.getTranslation(translationKey);
        }
    }
}

// 创建全局语言管理器
window.languageManager = new LanguageManager();
