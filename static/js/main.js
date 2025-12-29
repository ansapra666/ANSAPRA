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
            showApp
