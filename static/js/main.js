// 全局状态管理
const AppState = {
    user: null,
    currentPage: 'intro',
    isProcessing: false,
    language: 'zh',
    translations: {},
    chatHistory: [], // 新增：聊天历史
    currentPDFUrl: null, // 新增：当前PDF的URL
    currentPDFName: null, // 新增：当前PDF的文件名
    currentInterpretation: null, // 新增：当前解读内容
    currentChartsData: null, // 新增：当前图表数据
    currentOriginalContent: null // 新增：当前原文内容
};

// DOM 元素
let DOM = {};

// 保存页面状态
function savePageState(originalContent, interpretation, chartsData) {
    try {
        // 更新全局状态
        AppState.currentOriginalContent = originalContent;
        AppState.currentInterpretation = interpretation;
        AppState.currentChartsData = chartsData;
        
        // 保存到localStorage
        const pageState = {
            originalContent: originalContent,
            interpretation: interpretation,
            chartsData: chartsData,
            // 不保存 currentPDFUrl，因为它是临时的，刷新后会失效
            // currentPDFUrl: AppState.currentPDFUrl,
            timestamp: Date.now()
        };
        
        // 检查localStorage是否可用
        if (typeof Storage !== 'undefined') {
            // 检查存储空间是否足够
            try {
                localStorage.setItem('pageState', JSON.stringify(pageState));
                console.log('页面状态已保存');
            } catch (e) {
                // 存储空间不足，尝试清除旧数据
                if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    console.warn('localStorage存储空间不足，尝试清除旧数据');
                    // 清除旧的阅读记录
                    localStorage.removeItem('readingHistory');
                    localStorage.removeItem('searchHistory');
                    localStorage.removeItem('userSettings');
                    // 再次尝试保存
                    try {
                        localStorage.setItem('pageState', JSON.stringify(pageState));
                        console.log('页面状态已保存（清除旧数据后）');
                        // 显示提示信息
                        const currentLang = localStorage.getItem('language') || 'zh';
                        if (currentLang === 'en') {
                            showNotification('Storage space was limited, old data has been cleared to save current paper', 'info');
                        } else {
                            showNotification('存储空间有限，已清除旧数据以保存当前论文', 'info');
                        }
                    } catch (e2) {
                        console.error('保存页面状态失败（存储空间不足）:', e2);
                        // 显示错误提示
                        const currentLang = localStorage.getItem('language') || 'zh';
                        if (currentLang === 'en') {
                            showNotification('Failed to save paper due to storage limitations. Please try with a smaller file.', 'error');
                        } else {
                            showNotification('由于存储限制，无法保存论文。请尝试使用较小的文件。', 'error');
                        }
                    }
                } else {
                    console.error('保存页面状态失败:', e);
                }
            }
        } else {
            console.warn('浏览器不支持localStorage');
            // 显示错误提示
            const currentLang = localStorage.getItem('language') || 'zh';
            if (currentLang === 'en') {
                showNotification('Your browser does not support local storage. Paper data will not be saved.', 'error');
            } else {
                showNotification('您的浏览器不支持本地存储，论文数据将无法保存。', 'error');
            }
        }
    } catch (error) {
        console.error('保存页面状态失败:', error);
        // 显示错误提示
        const currentLang = localStorage.getItem('language') || 'zh';
        if (currentLang === 'en') {
            showNotification('Failed to save paper data. Please try again.', 'error');
        } else {
            showNotification('保存论文数据失败，请重试。', 'error');
        }
    }
}

// 加载页面状态
function loadPageState() {
    try {
        // 检查localStorage是否可用
        if (typeof Storage !== 'undefined') {
            const savedState = localStorage.getItem('pageState');
            if (savedState) {
                try {
                    const pageState = JSON.parse(savedState);
                    
                    // 恢复全局状态
                    AppState.currentOriginalContent = pageState.originalContent;
                    AppState.currentInterpretation = pageState.interpretation;
                    AppState.currentChartsData = pageState.chartsData;
                    // 不恢复 currentPDFUrl，因为它是临时的，刷新后会失效
                    // AppState.currentPDFUrl = pageState.currentPDFUrl;
                    
                    console.log('页面状态已加载');
                    return pageState;
                } catch (e) {
                    console.error('解析页面状态失败:', e);
                    // 清除损坏的状态
                    localStorage.removeItem('pageState');
                }
            }
        } else {
            console.warn('浏览器不支持localStorage');
        }
    } catch (error) {
        console.error('加载页面状态失败:', error);
    }
    return null;
}

// 显示保存的页面状态
function displaySavedPageState() {
    try {
        // 确保DOM元素已初始化
        if (!DOM.resultsSection || !DOM.originalContent || !DOM.interpretationContent) {
            console.error('DOM元素未初始化，延迟显示保存的页面状态');
            setTimeout(displaySavedPageState, 100);
            return;
        }
        
        // 检查是否有保存的页面状态
        if (AppState.currentOriginalContent && AppState.currentInterpretation) {
            console.log('显示保存的页面状态');
            
            // 切换到解读页面
            switchPage('interpretation');
            
            // 显示结果区域
            DOM.resultsSection.style.display = 'block';
            
            // 填充原文内容
            if (DOM.originalContent) {
                if (AppState.currentPDFUrl) {
                    // 直接在原文内容展示框中嵌入PDF查看器，中间没有空格
                    DOM.originalContent.innerHTML = '<div style="width: 100%; height: 100%; border-radius: 8px; overflow: hidden;"><iframe src="'+AppState.currentPDFUrl+'" style="width: 100%; height: 100%; border: none;"></iframe></div>';
                    // 设置PDF文件的原文展示为方形
                    DOM.originalContent.style.width = '100%';
                    DOM.originalContent.style.height = '90vw'; // 更接近方形的比例
                    DOM.originalContent.style.overflow = 'hidden';
                } else if (AppState.currentOriginalContent) {
                    // 对于非PDF文件，使用与startInterpretation函数中相同的HTML结构来显示原文内容
                    DOM.originalContent.innerHTML = `
                        <div style="width: 100%; min-height: 400px; padding: 15px; background: #f8f9fa; border-radius: 8px; overflow: auto;">
                            <div style="white-space: pre-wrap; word-break: break-all;">${AppState.currentOriginalContent}</div>
                        </div>
                    `;
                    // 设置非PDF文件的原文展示样式
                    DOM.originalContent.style.width = '100%';
                    DOM.originalContent.style.minHeight = '400px'; // 最小高度
                    DOM.originalContent.style.maxHeight = '80vh'; // 最大高度，防止过高
                    DOM.originalContent.style.overflow = 'auto';
                }
            }
            
            // 填充解读内容
            if (DOM.interpretationContent) {
                DOM.interpretationContent.innerHTML = formatInterpretation(AppState.currentInterpretation);
                // 设置解读内容的展示比例为16:9
                DOM.interpretationContent.style.width = '100%';
                DOM.interpretationContent.style.height = '56.25vw';
                DOM.interpretationContent.style.overflow = 'auto';
            }
            
            // 添加查看原文按钮（如果是PDF文件）
            if (AppState.currentPDFUrl) {
                addViewOriginalButton();
            }
            
            // 添加全屏解读按钮
            addFullScreenButton(AppState.currentOriginalContent, AppState.currentInterpretation);
            
            // 显示推荐论文搜索框
            const recommendationsSection = document.querySelector('.recommendations-section');
            if (recommendationsSection) {
                recommendationsSection.style.display = 'block';
            }
            
            // 显示保存的图表数据
            const mindmapContainer = document.getElementById('mindmap-container');
            if (mindmapContainer && AppState.currentChartsData) {
                console.log('显示保存的图表数据');
                // 清空容器
                mindmapContainer.innerHTML = '';
                
                // 创建图表容器
                const chartsContainer = document.createElement('div');
                chartsContainer.style.cssText = `
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    margin-top: 20px;
                `;
                
                // 获取当前语言
                const currentLang = localStorage.getItem('language') || 'zh';
                
                // 图表类型名称的中英文翻译
                const chartTypeNames = {
                    A: currentLang === 'en' ? 'Paper Structure Mind Map' : '论文结构思维导图',
                    B: currentLang === 'en' ? 'Research Process Flow Chart' : '研究流程逻辑图',
                    C: currentLang === 'en' ? 'Core Content Table' : '核心内容表格',
                    D: currentLang === 'en' ? 'Concept Relationship Diagram' : '概念关系图'
                };
                
                // 加载提示的中英文翻译
                const loadingTexts = {
                    A: currentLang === 'en' ? 'Mind map loading...' : '思维导图加载中...',
                    B: currentLang === 'en' ? 'Flow chart loading...' : '流程图加载中...',
                    C: currentLang === 'en' ? 'Table loading...' : '表格加载中...',
                    D: currentLang === 'en' ? 'Concept map loading...' : '概念图加载中...'
                };
                
                // 显示思维导图
                if (AppState.currentChartsData.A) {
                    const mindmapSection = document.createElement('div');
                    mindmapSection.style.cssText = `
                        flex: 1;
                        min-width: 300px;
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                    `;
                    mindmapSection.innerHTML = `
                        <h5><i class="fas fa-project-diagram"></i> ${chartTypeNames.A}</h5>
                        <div id="chart-container-A" style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; min-height: 400px;">
                            <p style="text-align: center; color: #666;">${loadingTexts.A}</p>
                        </div>
                    `;
                    chartsContainer.appendChild(mindmapSection);
                }
                
                // 显示流程图
                if (AppState.currentChartsData.B) {
                    const flowchartSection = document.createElement('div');
                    flowchartSection.style.cssText = `
                        flex: 1;
                        min-width: 300px;
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                    `;
                    flowchartSection.innerHTML = `
                        <h5><i class="fas fa-sitemap"></i> ${chartTypeNames.B}</h5>
                        <div id="chart-container-B" style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; min-height: 400px;">
                            <p style="text-align: center; color: #666;">${loadingTexts.B}</p>
                        </div>
                    `;
                    chartsContainer.appendChild(flowchartSection);
                }
                
                // 显示表格
                if (AppState.currentChartsData.C) {
                    const tableSection = document.createElement('div');
                    tableSection.style.cssText = `
                        flex: 1;
                        min-width: 300px;
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                    `;
                    tableSection.innerHTML = `
                        <h5><i class="fas fa-table"></i> ${chartTypeNames.C}</h5>
                        <div id="chart-container-C" style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; min-height: 400px;">
                            <p style="text-align: center; color: #666;">${loadingTexts.C}</p>
                        </div>
                    `;
                    chartsContainer.appendChild(tableSection);
                }
                
                // 显示概念图
                if (AppState.currentChartsData.D) {
                    const conceptmapSection = document.createElement('div');
                    conceptmapSection.style.cssText = `
                        flex: 1;
                        min-width: 300px;
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                    `;
                    conceptmapSection.innerHTML = `
                        <h5><i class="fas fa-connectdevelop"></i> ${chartTypeNames.D}</h5>
                        <div id="chart-container-D" style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; min-height: 400px;">
                            <p style="text-align: center; color: #666;">${loadingTexts.D}</p>
                        </div>
                    `;
                    chartsContainer.appendChild(conceptmapSection);
                }
                
                mindmapContainer.appendChild(chartsContainer);
                
                // 执行图表代码
                if (AppState.currentChartsData) {
                    for (const [chartType, chartCode] of Object.entries(AppState.currentChartsData)) {
                        const container = document.getElementById(`chart-container-${chartType}`);
                        if (container) {
                            try {
                                container.innerHTML = '';
                                if (chartType === 'C') {
                                    // 表格类型，直接显示
                                    const contentContainer = document.createElement('div');
                                    contentContainer.style.cssText = `
                                        padding: 15px;
                                        background: #f9f9f9;
                                        border-radius: 5px;
                                        font-size: 14px;
                                        line-height: 1.5;
                                        overflow-x: auto;
                                    `;
                                    // 简单的表格转换
                                    let htmlContent = chartCode;
                                    htmlContent = htmlContent.replace(/\|(.*?)\|\n\|(.*?)\|\n((?:\|.*?\|\n)*)/g, (match, headers, separator, rows) => {
                                        const headerCells = headers.split('|').map(cell => cell.trim()).filter(cell => cell);
                                        const rowCells = rows.split('\n').map(row => {
                                            return row.split('|').map(cell => cell.trim()).filter(cell => cell);
                                        }).filter(cells => cells.length > 0);
                                        
                                        let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
                                        
                                        // 表头
                                        tableHtml += '<thead><tr>';
                                        headerCells.forEach(cell => {
                                            tableHtml += `<th style="border: 1px solid #ddd; padding: 8px; text-align: left; background: #f2f2f2;">${cell}</th>`;
                                        });
                                        tableHtml += '</tr></thead>';
                                        
                                        // 表格内容
                                        tableHtml += '<tbody>';
                                        rowCells.forEach(row => {
                                            tableHtml += '<tr>';
                                            row.forEach(cell => {
                                                tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`;
                                            });
                                            tableHtml += '</tr>';
                                        });
                                        tableHtml += '</tbody></table>';
                                        
                                        return tableHtml;
                                    });
                                    contentContainer.innerHTML = htmlContent;
                                    container.appendChild(contentContainer);
                                } else {
                                    // 其他图表类型，使用mermaid
                                    const mermaidDiv = document.createElement('div');
                                    mermaidDiv.className = 'mermaid';
                                    // 处理markdown格式的mermaid代码块
                                    let mermaidCode = chartCode;
                                    const mermaidMatch = chartCode.match(/```mermaid[\s\S]*?```/);
                                    if (mermaidMatch) {
                                        mermaidCode = mermaidMatch[0].replace(/```mermaid\n?/, '').replace(/```$/, '').trim();
                                    }
                                    mermaidDiv.textContent = mermaidCode;
                                    container.appendChild(mermaidDiv);
                                    
                                    // 尝试渲染mermaid图表
                                    if (window.mermaid) {
                                        try {
                                            window.mermaid.init(undefined, mermaidDiv);
                                        } catch (err) {
                                            console.error(`渲染图表 ${chartType} 失败:`, err);
                                            container.innerHTML = `<p style="color: #dc3545; text-align: center;">图表渲染失败</p>`;
                                        }
                                    } else {
                                        console.error('mermaid库未加载');
                                        container.innerHTML = `<p style="color: #dc3545; text-align: center;">mermaid库未加载</p>`;
                                    }
                                }
                            } catch (err) {
                                console.error(`执行图表 ${chartType} 代码失败:`, err);
                                container.innerHTML = `<p style="color: #dc3545; text-align: center;">图表加载失败</p>`;
                            }
                        }
                    }
                }
            }
            
            // 滚动到结果区域
            DOM.resultsSection.scrollIntoView({ behavior: 'smooth' });
            
            console.log('保存的页面状态已显示');
        } else {
            console.log('没有保存的页面状态');
        }
    } catch (error) {
        console.error('显示保存的页面状态失败:', error);
    }
}

// 在DOM加载完成后添加
document.addEventListener('DOMContentLoaded', function() {
    // 1. 首先初始化DOM元素
    initializeDOM();
    
    // 2. 初始化语言管理器
    if (typeof initLanguageManager === 'function') {
        initLanguageManager();
    }
    
    // 3. 加载本地存储中的设置（无论用户是否已登录）
    try {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            console.log('从本地存储加载用户设置（页面加载时）');
            applySettings(settings);
        }
    } catch (error) {
        console.error('从本地存储加载设置失败:', error);
    }
    
    // 4. 加载页面状态
    loadPageState();
    
    // 5. 从localStorage恢复PDF文件
    try {
        const savedPDFBase64 = localStorage.getItem('currentPDFBase64');
        const savedPDFName = localStorage.getItem('currentPDFName');
        
        if (savedPDFBase64 && savedPDFName) {
            console.log('从localStorage恢复PDF文件:', savedPDFName);
            
            // 创建Blob对象
            const byteCharacters = atob(savedPDFBase64.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            // 创建URL并设置到AppState
            AppState.currentPDFUrl = URL.createObjectURL(blob);
            AppState.currentPDFName = savedPDFName;
            
            // 更新文件信息显示
            const currentLang = localStorage.getItem('language') || 'zh';
            const selectedText = currentLang === 'en' ? 'Selected: ' : '已选择: ';
            const fileInfo = document.getElementById('file-info');
            if (fileInfo) {
                fileInfo.textContent = `${selectedText}${savedPDFName}`;
                fileInfo.style.color = '#28a745';
            }
            
            console.log('PDF文件已成功恢复');
        } else {
            // 如果没有保存的PDF文件，确保AppState.currentPDFUrl为null
            AppState.currentPDFUrl = null;
            AppState.currentPDFName = null;
        }
    } catch (error) {
        console.error('恢复PDF文件失败:', error);
        // 清除损坏的PDF存储
        localStorage.removeItem('currentPDFBase64');
        localStorage.removeItem('currentPDFName');
        // 将AppState.currentPDFUrl设置为null，这样就会显示AppState.currentOriginalContent
        AppState.currentPDFUrl = null;
        AppState.currentPDFName = null;
    }
    
    // 6. 检查是否有已保存的问卷
    const savedQuestionnaire = localStorage.getItem('pendingQuestionnaire');
    if (savedQuestionnaire) {
        try {
            window.currentQuestionnaire = JSON.parse(savedQuestionnaire);
        } catch (e) {
            console.error('解析保存的问卷数据时出错:', e);
        }
    }
    
    // 7. 检查是否有待处理的注册信息
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
    
    // 8. 检查认证状态
    checkAuthentication();
    
    // 9. 加载其他数据
    loadQuestionnaire();
    loadInstructions();
    loadSettingsForms();
    
    // 10. 加载聊天历史（如果用户已登录）
    if (AppState.user && !AppState.user.is_guest) {
        loadChatHistory();
    }
    
    // 11. 设置事件监听器和其他初始化操作
    setupEventListeners();
    setupSearchKeybindings();
    
    // 12. 延迟更新表单元素，确保表单已加载
    setTimeout(() => {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                updateFormElementsWithSavedSettings(settings);
            } catch (error) {
                console.error('更新表单元素失败:', error);
            }
        }
        
        // 更新注册表单中的问卷显示
        if (window.currentQuestionnaire) {
            updateRegisterFormQuestionnaire();
        }
    }, 500);
    
    // 13. 显示保存的页面状态（延迟更长时间，确保所有DOM元素都已初始化）
    setTimeout(() => {
        displaySavedPageState();
    }, 800);
    
    // 14. 设置Cookie同意功能
    setupCookieConsent();
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
        pages: document.querySelectorAll('.page'),
        fullQuestionnaireModal: document.getElementById('full-questionnaire-modal'),
        fullQuestionnaireContainer: document.getElementById('full-questionnaire-container')
    };
}

// 认证相关
async function checkAuthentication() {
    try {
        const response = await fetch('/api/check-auth', {
            credentials: 'include'
        });
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
        } else {
            // 初次注册用户默认进入使用说明页面
            switchPage('instructions');
        }
        
        // 加载用户设置
        loadUserSettings();
        
        // 强制应用语言设置，确保所有元素都被正确翻译
        setTimeout(() => {
            const savedLang = localStorage.getItem('language') || 'zh';
            if (window.languageManager) {
                window.languageManager.applyLanguage(savedLang);
            }
        }, 100);
        
        // 显示保存的页面状态
        setTimeout(() => {
            displaySavedPageState();
        }, 1000);
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
    
    // 监听语言变化，更新动态添加的内容
    document.addEventListener('languageChanged', (e) => {
        console.log(`Language changed to: ${e.detail.language}`);
        // 重新加载使用说明，确保新添加的元素也能被翻译
        loadInstructions();
        // 重新加载设置表单，确保设置页面的元素也能被翻译
        loadSettingsForms();
        // 更新注册表单中的问卷信息框
        if (window.currentQuestionnaire) {
            updateRegisterFormQuestionnaire();
        }
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
    
    // 问卷验证设置
    setTimeout(() => {
        setupQuestionnaireValidation();
    }, 500);
}

// 加载聊天历史
async function loadChatHistory() {
    if (!AppState.user || AppState.user.is_guest) return;
    
    try {
        const response = await fetch('/api/chat/history', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            AppState.chatHistory = data.chat_history || [];
        }
    } catch (error) {
        console.error('加载聊天历史错误:', error);
    }
}

// 发送AI聊天消息
async function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatContainer = document.getElementById('chat-container');
    
    if (!chatInput || !chatContainer) return;
    
    const question = chatInput.value.trim();
    if (!question) return;
    
    // 获取当前语言
    const currentLang = localStorage.getItem('language') || 'zh';
    
    // 显示用户消息
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user-message';
    const youText = currentLang === 'en' ? 'You: ' : '您：';
    userMessage.innerHTML = `
        <div class="message-content">
            <strong>${youText}</strong> ${question}
        </div>
    `;
    chatContainer.appendChild(userMessage);
    
    // 显示加载指示器
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'chat-message ai-message loading';
    const aiText = currentLang === 'en' ? 'AI: ' : 'AI：';
    const thinkingText = currentLang === 'en' ? 'Thinking...' : '思考中...';
    loadingMessage.innerHTML = `
        <div class="message-content">
            <strong>${aiText}</strong> <i class="fas fa-spinner fa-spin"></i> ${thinkingText}
        </div>
    `;
    chatContainer.appendChild(loadingMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // 清空输入框
    chatInput.value = '';
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                question: question,
                chat_history: AppState.chatHistory
            })
        });
        
        const data = await response.json();
        
        // 移除加载指示器
        loadingMessage.remove();
        
        if (data.success) {
            // 显示AI回复
            const aiMessage = document.createElement('div');
            aiMessage.className = 'chat-message ai-message';
            const aiTextResponse = currentLang === 'en' ? 'AI: ' : 'AI：';
            aiMessage.innerHTML = `
                <div class="message-content">
                    <strong>${aiTextResponse}</strong> ${data.answer}
                </div>
            `;
            chatContainer.appendChild(aiMessage);
            
            // 添加到聊天历史
            if (data.chat_item) {
                AppState.chatHistory.push(data.chat_item);
            }
        } else {
            showNotification(data.message || 'AI回复失败', 'error');
        }
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
    } catch (error) {
        console.error('发送聊天消息错误:', error);
        loadingMessage.remove();
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 清空聊天历史
function clearChatHistory() {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
        chatContainer.innerHTML = '';
    }
    AppState.chatHistory = [];
    showNotification('聊天记录已清空', 'success');
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
    
    // 如果切换到设置页面，确保语言设置正确显示并加载用户设置
    if (pageName === 'settings') {
        updateLanguageSettingsTab();
        // 延迟调用，确保设置表单已加载
        setTimeout(() => {
            if (typeof loadCurrentReadingSettings === 'function') {
                loadCurrentReadingSettings();
            }
        }, 100);
    }
    
    // 滚动到顶部
    window.scrollTo(0, 0);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileSize = file.size / 1024 / 1024; // MB
    
    // 文件大小验证
    if (fileSize > 16) {
        showNotification('文件大小不能超过16MB', 'error');
        DOM.fileInput.value = '';
        return;
    }
    
    // 获取文件扩展名
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
        showNotification('不支持的文件格式。请上传PDF、DOCX或TXT文件。', 'error');
        DOM.fileInput.value = '';
        return;
    }
    
    // 对于PDF文件，创建本地URL以便在浏览器中打开，并存储为Base64以便刷新后使用
    if (fileName.endsWith('.pdf')) {
        // 创建临时URL用于当前会话
        AppState.currentPDFUrl = URL.createObjectURL(file);
        AppState.currentPDFName = file.name;
        
        // 将PDF文件转换为Base64并存储到localStorage
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // 获取Base64编码的文件内容
                const base64Data = e.target.result;
                
                // 存储到localStorage
                localStorage.setItem('currentPDFBase64', base64Data);
                localStorage.setItem('currentPDFName', file.name);
                console.log('PDF文件已存储到localStorage');
            } catch (error) {
                console.error('存储PDF文件失败:', error);
            }
        };
        reader.onerror = function(error) {
            console.error('读取PDF文件失败:', error);
        };
        reader.readAsDataURL(file);
    } else {
        AppState.currentPDFUrl = null;
        AppState.currentPDFName = null;
        // 清除之前存储的PDF文件
        localStorage.removeItem('currentPDFBase64');
        localStorage.removeItem('currentPDFName');
        
        // 对于非PDF文件，读取文本内容以便保存
        if (fileName.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    // 获取文本内容
                    const textContent = e.target.result;
                    // 存储到AppState，以便后续使用
                    AppState.currentOriginalContent = textContent;
                    console.log('文本文件内容已读取并存储到AppState');
                } catch (error) {
                    console.error('读取文本文件失败:', error);
                }
            };
            reader.onerror = function(error) {
                console.error('读取文本文件失败:', error);
            };
            reader.readAsText(file);
        }
    }
    
    // 获取当前语言
    const currentLang = localStorage.getItem('language') || 'zh';
    // 根据语言显示不同的提示文本
    const selectedText = currentLang === 'en' ? 'Selected: ' : '已选择: ';
    DOM.fileInfo.textContent = `${selectedText}${file.name} (${fileSize.toFixed(2)} MB)`;
    DOM.fileInfo.style.color = '#28a745';
    
    // 记录最近阅读记录
    recordReadingHistory(file);
}

// 记录最近阅读记录
function recordReadingHistory(file) {
    // 获取现有的阅读记录
    let readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    
    // 创建新的阅读记录
    const newRecord = {
        id: Date.now(),
        fileName: file.name,
        timestamp: new Date().toISOString(),
        fileSize: (file.size / 1024 / 1024).toFixed(2),
        fileType: file.type
    };
    
    // 添加到阅读记录的开头
    readingHistory.unshift(newRecord);
    
    // 限制记录数量为10条
    readingHistory = readingHistory.slice(0, 10);
    
    // 保存到localStorage
    localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
}

// 清空最近阅读记录
function clearReadingHistory() {
    if (confirm('确定要清空所有阅读记录吗？')) {
        localStorage.removeItem('readingHistory');
        showNotification('阅读记录已清空', 'success');
        // 重新加载页面或刷新设置部分
        location.reload();
    }
}

// 添加最近阅读记录到账户设置
function addReadingHistoryToSettings() {
    const readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    
    if (readingHistory.length > 0) {
        const accountSettings = document.getElementById('account-settings');
        if (accountSettings) {
            const historyHTML = `
                <div class="reading-history-section" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <h5><i class="fas fa-book"></i> <span data-i18n="recent-reading-history">最近阅读记录</span></h5>
                    <div style="max-height: 200px; overflow-y: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid #ddd;">
                                    <th style="padding: 8px; text-align: left;"><span data-i18n="paper-title">论文标题</span></th>
                                    <th style="padding: 8px; text-align: left;"><span data-i18n="time">时间</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${readingHistory.map(item => `
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px;">${item.fileName}</td>
                                        <td style="padding: 8px; font-size: 12px; color: #666;">
                                            ${new Date(item.timestamp).toLocaleDateString()}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <button class="btn btn-small btn-secondary" onclick="clearReadingHistory()" style="margin-top: 10px;">
                        <i class="fas fa-trash"></i> <span data-i18n="clear-reading-history">清空阅读记录</span>
                    </button>
                </div>
            `;
            
            accountSettings.insertAdjacentHTML('beforeend', historyHTML);
        }
    }
}

// 在加载用户设置时调用
addReadingHistoryToSettings();

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
            credentials: 'include',
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
    const modal = DOM.fullQuestionnaireModal;
    const container = DOM.fullQuestionnaireContainer;
    
    // 加载问卷内容 - 每次都重新加载确保内容完整
    loadFullQuestionnaire(container);
    
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
    const modal = DOM.fullQuestionnaireModal;
    modal.style.display = 'none';
}

// 加载完整问卷到容器
function loadFullQuestionnaire(container) {
    const currentLang = localStorage.getItem('language') || 'zh';
    // 清空容器
    container.innerHTML = '';
    
    // 创建问卷内容
    let questionnaireHTML = '';
    
    if (currentLang === 'en') {
        // 英文问卷模板
        questionnaireHTML = `
            <div class="questionnaire-section" style="max-width: 900px; margin: 0 auto; padding: 20px;">
                <div class="questionnaire-header" style="text-align: center; margin-bottom: 20px;">
                    <h3 style="color: #007bff; margin: 0 0 10px 0; font-size: 24px;">Knowledge Framework Questionnaire</h3>
                    <p style="color: #666; font-size: 16px;">Please fill out the following questionnaire to help us better provide personalized interpretations for you</p>
                </div>
                
                                <div class="question-group" style="margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #eee;">
                    <h4 style="color: #28a745; margin-bottom: 20px;">I. Basic Information</h4>
                    
                    <!-- Grade -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">1. What grade are you in?</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="grade" value="A" required style="margin-right: 10px;">
                                    <span>A. Grade 9</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="grade" value="B" style="margin-right: 10px;">
                                    <span>B. Grade 10</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="grade" value="C" style="margin-right: 10px;">
                                    <span>C. Grade 11</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="grade" value="D" style="margin-right: 10px;">
                                    <span>D. Grade 12</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Education System -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">2. What education system are you under?</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="education_system" value="A" required style="margin-right: 10px;">
                                    <span>A. International System</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="education_system" value="B" style="margin-right: 10px;">
                                    <span>B. General High School System</span>
                                </label>
                            </div>
                        </div>
                    </div>
                
                <!-- Subject Interest -->
                <div class="form-group" style="margin-bottom: 30px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 15px; color: #333;">3. How interested are you in each natural science subject? (Rate from 1-5)</label>
                    <p style="color: #666; font-size: 14px; margin-bottom: 15px; font-style: italic;">Drag the slider to select a score, 1 means not interested, 5 means very interested</p>
                    
                    <div class="rating-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                        <!-- Physics -->
                        <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                            <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">Physics:</label>
                            <div class="rating-control">
                                <input type="range" name="interest_physics" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                       style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                    <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                    <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                        <span class="star" data-value="1">☆</span>
                                        <span class="star" data-value="2">☆</span>
                                        <span class="star active" data-value="3">☆</span>
                                        <span class="star" data-value="4">☆</span>
                                        <span class="star" data-value="5">☆</span>
                                    </div>
                                </div>
                                <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                    <span>Not interested</span>
                                    <span>Neutral</span>
                                    <span>Very interested</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Biology -->
                        <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                            <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">Biology, Medicine, etc.:</label>
                            <div class="rating-control">
                                <input type="range" name="interest_biology" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                       style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                    <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                    <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                        <span class="star" data-value="1">☆</span>
                                        <span class="star" data-value="2">☆</span>
                                        <span class="star active" data-value="3">☆</span>
                                        <span class="star" data-value="4">☆</span>
                                        <span class="star" data-value="5">☆</span>
                                    </div>
                                </div>
                                <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                    <span>Not interested</span>
                                    <span>Neutral</span>
                                    <span>Very interested</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Chemistry -->
                        <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                            <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">Chemistry:</label>
                            <div class="rating-control">
                                <input type="range" name="interest_chemistry" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                       style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                    <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                    <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                        <span class="star" data-value="1">☆</span>
                                        <span class="star" data-value="2">☆</span>
                                        <span class="star active" data-value="3">☆</span>
                                        <span class="star" data-value="4">☆</span>
                                        <span class="star" data-value="5">☆</span>
                                    </div>
                                </div>
                                <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                    <span>Not interested</span>
                                    <span>Neutral</span>
                                    <span>Very interested</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Geography and Geology -->
                        <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                            <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">Geography and Geology:</label>
                            <div class="rating-control">
                                <input type="range" name="interest_geology" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                       style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                    <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                    <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                        <span class="star" data-value="1">☆</span>
                                        <span class="star" data-value="2">☆</span>
                                        <span class="star active" data-value="3">☆</span>
                                        <span class="star" data-value="4">☆</span>
                                        <span class="star" data-value="5">☆</span>
                                    </div>
                                </div>
                                <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                    <span>Not interested</span>
                                    <span>Neutral</span>
                                    <span>Very interested</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Astronomy and Astrophysics -->
                        <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                            <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">Astronomy and Astrophysics:</label>
                            <div class="rating-control">
                                <input type="range" name="interest_astronomy" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                       style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                    <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                    <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                        <span class="star" data-value="1">☆</span>
                                        <span class="star" data-value="2">☆</span>
                                        <span class="star active" data-value="3">☆</span>
                                        <span class="star" data-value="4">☆</span>
                                        <span class="star" data-value="5">☆</span>
                                    </div>
                                </div>
                                <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                    <span>Not interested</span>
                                    <span>Neutral</span>
                                    <span>Very interested</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Learning Frequency -->
                <div class="form-group" style="margin-bottom: 25px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">4. How often do you learn extracurricular knowledge of natural sciences?</label>
                    <div class="radio-group">
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="learning_frequency" value="A" required style="margin-right: 10px;">
                                <span>A. Once a week or more frequently</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="learning_frequency" value="B" style="margin-right: 10px;">
                                <span>B. 1-3 times a month</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="learning_frequency" value="C" style="margin-right: 10px;">
                                <span>C. Once every few months</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Physics Question -->
                <div class="form-group" style="margin-bottom: 25px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">5. In a double-slit interference experiment, monochromatic light with wavelength λ is used. If the entire experimental setup is moved from air into a transparent liquid with refractive index n, while keeping the distance D from the screen to the double slits and the slit spacing d unchanged, how will the distance Δx between adjacent bright fringes on the screen change?</label>
                    <div class="radio-group">
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="physics_question" value="A" required style="margin-right: 10px;">
                                <span>A. Become n times the original</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="physics_question" value="B" style="margin-right: 10px;">
                                <span>B. Become 1/n times the original</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="physics_question" value="C" style="margin-right: 10px;">
                                <span>C. Remain unchanged</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="physics_question" value="D" style="margin-right: 10px;">
                                <span>D. Cannot be determined because the frequency of light also changes</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Chemistry Question -->
                <div class="form-group" style="margin-bottom: 25px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">6. A small amount of solid sodium acetate (CH₃COONa) is added to a certain volume of dilute acetic acid (CH₃COOH) solution. Assuming the change in solution volume is negligible, this operation will cause which of the following in the solution:</label>
                    <div class="radio-group">
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="chemistry_question" value="A" required style="margin-right: 10px;">
                                <span>A. Significant decrease in pH value</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="chemistry_question" value="B" style="margin-right: 10px;">
                                <span>B. Increase in the ratio of acetate ion concentration to hydrogen ion concentration</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="chemistry_question" value="C" style="margin-right: 10px;">
                                <span>C. Significant decrease in the degree of ionization of acetic acid</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="chemistry_question" value="D" style="margin-right: 10px;">
                                <span>D. Increase in the ion product constant Kw of water</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Biology Question -->
                <div class="form-group" style="margin-bottom: 25px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">7. Reference Example Question: The aquatic plant Quillwort uses CAM metabolism when submerged, fixing CO₂ at night to produce malic acid and releasing CO₂ during the day for photosynthesis. This is thought to be due to the scarcity of CO₂ in water during the day caused by intense competition from other photosynthetic organisms.<br>Based on this logic, which of the following situations would most likely prompt terrestrial cacti to open their stomata at night (rather than during the day) to absorb CO₂?</label>
                    <div class="radio-group">
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="biology_question" value="A" required style="margin-right: 10px;">
                                <span>A. To more effectively carry out light reactions at night.</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="biology_question" value="B" style="margin-right: 10px;">
                                <span>B. To close stomata during the day to reduce water loss while still obtaining CO₂.</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="biology_question" value="C" style="margin-right: 10px;">
                                <span>C. Because there is more water in the soil at night, which facilitates CO₂ absorption.</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="biology_question" value="D" style="margin-right: 10px;">
                                <span>D. Because CO₂ solubility is higher at lower night temperatures.</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Exoplanet Question -->
                <div class="form-group" style="margin-bottom: 25px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">8. Suppose we can observe an exoplanet orbiting a Sun-like star. By measuring the Doppler shift of the star's spectrum, we obtain a periodic curve of the star's radial velocity changing over time. Based solely on this curve, which parameter of the exoplanet can we most reliably determine?</label>
                    <div class="radio-group">
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="astronomy_question" value="A" required style="margin-right: 10px;">
                                <span>A. The exact mass of the planet</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="astronomy_question" value="B" style="margin-right: 10px;">
                                <span>B. The minimum mass of the planet (M sin i) based on its orbital period</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="astronomy_question" value="C" style="margin-right: 10px;">
                                <span>C. The radius of the planet</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="astronomy_question" value="D" style="margin-right: 10px;">
                                <span>D. The composition of the planet's atmosphere</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Sediment Core Question -->
                <div class="form-group" style="margin-bottom: 25px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">9. When analyzing the sedimentary core of a river delta, scientists found that the average particle size of sediments showed a vertical variation sequence of "coarse → fine → coarse" from the bottom layer to the top layer. This most likely indicates that the area experienced during the sedimentary period:</label>
                    <div class="radio-group">
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="geology_question" value="A" required style="margin-right: 10px;">
                                <span>A. Sustained sea-level rise</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="geology_question" value="B" style="margin-right: 10px;">
                                <span>B. A sea-level drop followed by a rise</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="geology_question" value="C" style="margin-right: 10px;">
                                <span>C. A sea-level rise followed by a drop (a complete transgression-regression cycle)</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="radio" name="geology_question" value="D" style="margin-right: 10px;">
                                <span>D. Sustained tectonic uplift</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="question-group" style="margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #eee;">
                    <h4 style="color: #28a745; margin-bottom: 20px;">II. Scientific Perception</h4>
                    
                    <!-- Learning Methods Preference -->
                    <div class="form-group" style="margin-bottom: 30px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 15px; color: #333;">1. What is your preference and habit level for the following learning methods? [Rating] * Rated on a scale of 1 to 5, where 1 means extremely dislike/unaccustomed and 5 means extremely like/accustomed</label>
                        
                        <div class="rating-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                            <!-- Quantitative Learning -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">A. Quantitative learning: Numbers and formulas can better explain specific knowledge points</label>
                                <div class="rating-control">
                                    <input type="range" name="learning_style_quantitative" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                           style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>Dislike</span>
                                        <span>Neutral</span>
                                        <span>Like</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Textual Comprehension -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">B. Textual comprehension: Understanding knowledge points through clear and detailed language expressions</label>
                                <div class="rating-control">
                                    <input type="range" name="learning_style_textual" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                           style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>Dislike</span>
                                        <span>Neutral</span>
                                        <span>Like</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Visual Learning -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">C. Visual learning: Accustomed to using charts or even three-dimensional models to present specific knowledge points</label>
                                <div class="rating-control">
                                    <input type="range" name="learning_style_visual" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                           style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>Dislike</span>
                                        <span>Neutral</span>
                                        <span>Like</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Interactive Learning -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">D. Interactive learning: Relying on question-guided teaching, classroom interaction, or audio-visual teaching methods such as videos</label>
                                <div class="rating-control">
                                    <input type="range" name="learning_style_interactive" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                           style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>Dislike</span>
                                        <span>Neutral</span>
                                        <span>Like</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Practical Learning -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">E. Practical learning: Accustomed to understanding knowledge points through hands-on practice and rigorous experimental processes</label>
                                <div class="rating-control">
                                    <input type="range" name="learning_style_practical" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                           style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>Dislike</span>
                                        <span>Neutral</span>
                                        <span>Like</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Natural Science Knowledge State -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">2. Which of the following descriptions do you think best reflects the state of natural science knowledge (astronomy, biology, etc.) in your mind?</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="knowledge_state" value="A" required style="margin-right: 10px;">
                                    <span>A. A thick textbook, progressing from the elementary to the advanced</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="knowledge_state" value="B" style="margin-right: 10px;">
                                    <span>B. A complete spider web, with all parts interconnected and mutually supportive</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="knowledge_state" value="C" style="margin-right: 10px;">
                                    <span>C. Independent databases, where each discipline is a unique storage unit</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="knowledge_state" value="D" style="margin-right: 10px;">
                                    <span>D. An all-purpose but unorganized toolbox</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Scientific Thinking Ability -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">3. How would you rate your scientific thinking ability (the ability to think about problems using natural science methods)? (Rate from 1 to 5)</label>
                        <div class="rating-control">
                            <input type="range" name="scientific_thinking" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                   style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                            <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                    <span class="star" data-value="1">☆</span>
                                    <span class="star" data-value="2">☆</span>
                                    <span class="star active" data-value="3">☆</span>
                                    <span class="star" data-value="4">☆</span>
                                    <span class="star" data-value="5">☆</span>
                                </div>
                            </div>
                            <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                <span>Low</span>
                                <span>Average</span>
                                <span>High</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Scientific Insight Ability -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">4. How would you rate your scientific insight ability (the ability to grasp the essence from phenomena)? (Rate from 1 to 5)</label>
                        <div class="rating-control">
                            <input type="range" name="scientific_insight" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                   style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                            <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                    <span class="star" data-value="1">☆</span>
                                    <span class="star" data-value="2">☆</span>
                                    <span class="star active" data-value="3">☆</span>
                                    <span class="star" data-value="4">☆</span>
                                    <span class="star" data-value="5">☆</span>
                                </div>
                            </div>
                            <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                <span>Low</span>
                                <span>Average</span>
                                <span>High</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sensitivity to Scientific Phenomena -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">5. How would you rate your sensitivity to scientific phenomena (the ability to discover scientific problems in daily life)? (Rate from 1 to 5)</label>
                        <div class="rating-control">
                            <input type="range" name="scientific_sensitivity" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                   style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                            <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                    <span class="star" data-value="1">☆</span>
                                    <span class="star" data-value="2">☆</span>
                                    <span class="star active" data-value="3">☆</span>
                                    <span class="star" data-value="4">☆</span>
                                    <span class="star" data-value="5">☆</span>
                                </div>
                            </div>
                            <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                <span>Low</span>
                                <span>Average</span>
                                <span>High</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Interdisciplinary Connection Ability -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">6. How would you rate your interdisciplinary connection ability (the ability to connect knowledge from multiple disciplines to explain specific phenomena)? (Rate from 1 to 5)</label>
                        <div class="rating-control">
                            <input type="range" name="interdisciplinary_ability" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                   style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                            <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                    <span class="star" data-value="1">☆</span>
                                    <span class="star" data-value="2">☆</span>
                                    <span class="star active" data-value="3">☆</span>
                                    <span class="star" data-value="4">☆</span>
                                    <span class="star" data-value="5">☆</span>
                                </div>
                            </div>
                            <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                <span>Low</span>
                                <span>Average</span>
                                <span>High</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Academic Rigor and Logic Rating -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 15px; color: #333;">7. Please read the following scientific excerpt and answer the question. You can search for materials, but you are not allowed to consult AI:</label>
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #007bff;">
                            <p style="line-height: 1.6;">This study used advanced quantum coherent spectroscopy technology and found that water molecules treated with sound waves of a specific frequency (528Hz) form a stable "resonant memory structure". When volunteers drank this structured water, the intensity of their biophoton emission increased by an average of 47.3% (p<0.05), and the mitochondrial ATP synthesis efficiency was significantly improved. The experiment adopted a double-blind design, with 30 volunteers randomly divided into two groups: the experimental group drank structured water, and the control group drank ordinary distilled water. After one week, the scores of the experimental group on the Satisfaction with Life Scale (SWLS) were 62% higher than those of the control group, and the average length of their DNA telomeres was extended by 0.4 base pairs as detected by PCR. These results indicate that water molecules can directly optimize the quantum biological field of human cells through the mechanism of frequency information storage and transmission, opening up new avenues for energy medicine.</p>
                        </div>
                        <p style="margin-bottom: 10px;">Please rate this paper excerpt in terms of academic rigor and academic logic (Rate from 1 to 5). 1 = very poor, 5 = very good.</p>
                        <div class="rating-control">
                            <input type="range" name="paper_evaluation_score" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                   style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                            <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                    <span class="star" data-value="1">☆</span>
                                    <span class="star" data-value="2">☆</span>
                                    <span class="star active" data-value="3">☆</span>
                                    <span class="star" data-value="4">☆</span>
                                    <span class="star" data-value="5">☆</span>
                                </div>
                            </div>
                            <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                <span>Very poor</span>
                                <span>Average</span>
                                <span>Very good</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Rating Basis -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">8. On what basis did you make the rating judgment on the academic rigor and logic of the excerpt?</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="checkbox" name="evaluation_criteria" value="A" style="margin-right: 10px;">
                                    <span>A. The use of academic language in describing phenomena in the excerpt</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="checkbox" name="evaluation_criteria" value="B" style="margin-right: 10px;">
                                    <span>B. The scientific technologies mentioned in the excerpt for analyzing problems and conducting measurements</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="checkbox" name="evaluation_criteria" value="C" style="margin-right: 10px;">
                                    <span>C. The experimental data mentioned in the excerpt</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="checkbox" name="evaluation_criteria" value="D" style="margin-right: 10px;">
                                    <span>D. The scientific theories involved in the excerpt (phenomena and essence)</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="checkbox" name="evaluation_criteria" value="E" style="margin-right: 10px;">
                                    <span>E. Rated purely based on feeling</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Global Warming Question -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">9. When it comes to global warming and the greenhouse effect, what question are you most eager to explore?</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="climate_question" value="A" required style="margin-right: 10px;">
                                    <span>A. What direct or indirect consequences can global warming lead to?</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="climate_question" value="B" style="margin-right: 10px;">
                                    <span>B. What is the greenhouse effect? What are greenhouse gases? How do they cause global warming?</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="climate_question" value="C" style="margin-right: 10px;">
                                    <span>C. What related technologies can mitigate the greenhouse effect? What can we do to mitigate it?</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="climate_question" value="D" style="margin-right: 10px;">
                                    <span>D. What are the disciplinary fields behind the greenhouse effect? Which disciplines can help understand or mitigate the greenhouse effect?</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="climate_question" value="E" style="margin-right: 10px;">
                                    <span>E. Besides the greenhouse effect, what other factors can cause global warming?</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
                    <button type="button" class="btn btn-secondary" onclick="closeFullQuestionnaire()" 
                            style="padding: 8px 16px; background: rgba(108, 117, 125, 0.9); color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; transition: background-color 0.3s;">
                        <i class="fas fa-times"></i> ${currentLang === 'en' ? 'Close' : '关闭'}
                    </button>
                </div>
                <div class="questionnaire-buttons" style="display: flex; justify-content: space-between; margin-top: 40px; padding-top: 30px; border-top: 2px solid #eee;">
                    <button type="button" class="btn btn-secondary" onclick="closeFullQuestionnaire()" 
                            style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background-color 0.3s;">
                        <i class="fas fa-times"></i> ${currentLang === 'en' ? 'Cancel' : '取消'}
                    </button>
                    <button type="button" class="btn btn-primary" onclick="saveQuestionnaire()" 
                            style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background-color 0.3s;">
                        <i class="fas fa-save"></i> ${currentLang === 'en' ? 'Save Questionnaire' : '保存问卷'}
                    </button>
                </div>
            </div>
        `;
    } else {
        // 中文问卷模板
        questionnaireHTML = `
            <div class="questionnaire-section" style="max-width: 900px; margin: 0 auto; padding: 20px;">
                <div class="questionnaire-header" style="text-align: center; margin-bottom: 20px;">
                    <h3 style="color: #007bff; margin: 0 0 10px 0; font-size: 24px;">知识框架调查问卷</h3>
                    <p style="color: #666; font-size: 16px;">请填写以下问卷以帮助我们更好地为您提供个性化解读</p>
                </div>
                
                <div class="question-group" style="margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #eee;">
                    <h4 style="color: #28a745; margin-bottom: 20px;">一、基本情况</h4>
                    
                    <!-- 年级 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">1. 您所在的年级是？</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="grade" value="A" required style="margin-right: 10px;">
                                    <span>A. 9年级</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="grade" value="B" style="margin-right: 10px;">
                                    <span>B. 10年级</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="grade" value="C" style="margin-right: 10px;">
                                    <span>C. 11年级</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="grade" value="D" style="margin-right: 10px;">
                                    <span>D. 12年级</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 教育体系 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">2. 您所处的教育体系是？</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="education_system" value="A" required style="margin-right: 10px;">
                                    <span>A. 国际体系</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="education_system" value="B" style="margin-right: 10px;">
                                    <span>B. 普高体系</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 学科兴趣 -->
                    <div class="form-group" style="margin-bottom: 30px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 15px; color: #333;">3. 您对各个自然科学学科的感兴趣程度？（1-5打分）</label>
                        <p style="color: #666; font-size: 14px; margin-bottom: 15px; font-style: italic;">拖动滑块选择分数，1分表示不感兴趣，5分表示非常感兴趣</p>
                        
                        <div class="rating-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                            <!-- 物理学 -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">物理学：</label>
                                <div class="rating-control">
                                    <input type="range" name="interest_physics" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                        style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>不感兴趣</span>
                                        <span>一般</span>
                                        <span>非常感兴趣</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 生物学 -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">生物学、医学等：</label>
                                <div class="rating-control">
                                    <input type="range" name="interest_biology" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                        style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>不感兴趣</span>
                                        <span>一般</span>
                                        <span>非常感兴趣</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 化学 -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">化学：</label>
                                <div class="rating-control">
                                    <input type="range" name="interest_chemistry" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                        style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>不感兴趣</span>
                                        <span>一般</span>
                                        <span>非常感兴趣</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 地理地质学 -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">地理地质学：</label>
                                <div class="rating-control">
                                    <input type="range" name="interest_geology" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                        style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>不感兴趣</span>
                                        <span>一般</span>
                                        <span>非常感兴趣</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 天体天文学 -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">天体天文学：</label>
                                <div class="rating-control">
                                    <input type="range" name="interest_astronomy" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                        style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>不感兴趣</span>
                                        <span>一般</span>
                                        <span>非常感兴趣</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 学习频率 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">4. 您学习自然科学课外知识的频率是？</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="learning_frequency" value="A" required style="margin-right: 10px;">
                                    <span>A. 一周1次或更频繁</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="learning_frequency" value="B" style="margin-right: 10px;">
                                    <span>B. 一个月1-3次</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="learning_frequency" value="C" style="margin-right: 10px;">
                                    <span>C. 几个月1次</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 物理问题 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">5. 在双缝干涉实验中，使用波长为λ的单色光。如果将整个实验装置从空气移入折射率为n的透明液体中，同时将屏到双缝的距离D和双缝间距d保持不变，那么屏幕上相邻明条纹中心的间距Δx将如何变化？</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="physics_question" value="A" required style="margin-right: 10px;">
                                    <span>A. 变为原来的n倍</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="physics_question" value="B" style="margin-right: 10px;">
                                    <span>B. 变为原来的1/n</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="physics_question" value="C" style="margin-right: 10px;">
                                    <span>C. 保持不变</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="physics_question" value="D" style="margin-right: 10px;">
                                    <span>D. 无法确定，因为光的频率也改变了</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 化学问题 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">6. 将少量固体醋酸钠（CH₃COONa）加入到一定体积的稀醋酸（CH₃COOH）溶液中。假设溶液体积变化忽略不计，该操作会导致溶液中：</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="chemistry_question" value="A" required style="margin-right: 10px;">
                                    <span>A. pH值显著下降</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="chemistry_question" value="B" style="margin-right: 10px;">
                                    <span>B. 醋酸根离子浓度与氢离子浓度的比值增大</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="chemistry_question" value="C" style="margin-right: 10px;">
                                    <span>C. 醋酸的电离度显著降低</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="chemistry_question" value="D" style="margin-right: 10px;">
                                    <span>D. 水的离子积常数Kw增大</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 生物问题 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">7. 参考示例题型：水生植物Quillwort在 submerged 时采用CAM代谢，夜间固定CO₂生成苹果酸，白天释放CO₂进行光合作用。这被认为是由于白天水中CO₂被其他光合生物强烈竞争而导致稀缺。<br>据此逻辑，以下哪种情况最可能促使陆生仙人掌在夜间（而非白天）开放其气孔吸收CO₂？</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="biology_question" value="A" required style="margin-right: 10px;">
                                    <span>A. 为了在夜间更有效地进行光反应。</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="biology_question" value="B" style="margin-right: 10px;">
                                    <span>B. 为了在白天关闭气孔以减少水分散失，同时仍能获取CO₂。</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="biology_question" value="C" style="margin-right: 10px;">
                                    <span>C. 因为夜间土壤中水分更多，有利于CO₂吸收。</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="biology_question" value="D" style="margin-right: 10px;">
                                    <span>D. 因为夜间温度更低，CO₂溶解度更高。</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 天文问题 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">8. 假设我们可以观测到一颗围绕类太阳恒星运行的系外行星。通过测量恒星光谱的多普勒位移，我们得到了恒星视向速度随时间变化的周期性曲线。<strong>仅凭这条曲线</strong>，我们可以最可靠地确定该系外行星的哪个参数？</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="astronomy_question" value="A" required style="margin-right: 10px;">
                                    <span>A. 行星的精确质量</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="astronomy_question" value="B" style="margin-right: 10px;">
                                    <span>B. 行星轨道周期的最小质量（M sin i）</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="astronomy_question" value="C" style="margin-right: 10px;">
                                    <span>C. 行星的半径</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="astronomy_question" value="D" style="margin-right: 10px;">
                                    <span>D. 行星大气的成分</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 地质问题 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">9. 在分析某河流三角洲的沉积岩芯时，科学家发现从底层到顶层，沉积物颗粒的平均粒径有"粗 -> 细 -> 粗"的垂向变化序列。这最有可能指示了该区域在沉积期间经历了：</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="geology_question" value="A" required style="margin-right: 10px;">
                                    <span>A. 持续的海平面上升</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="geology_question" value="B" style="margin-right: 10px;">
                                    <span>B. 一次海平面下降，随后又上升</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="geology_question" value="C" style="margin-right: 10px;">
                                    <span>C. 一次海平面的上升，随后又下降（一个完整的海侵-海退旋回）</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="geology_question" value="D" style="margin-right: 10px;">
                                    <span>D. 持续的构造抬升</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="question-group" style="margin-bottom: 40px;">
                    <h4 style="color: #28a745; margin-bottom: 20px;">二、科学感知</h4>
                    
                    <!-- 学习方式偏好 -->
                    <div class="form-group" style="margin-bottom: 30px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 15px; color: #333;">1. 您认为您对以下学习方式的喜好与习惯程度是？【1-5评分】</label>
                        <p style="color: #666; font-size: 14px; margin-bottom: 15px; font-style: italic;">1为极其不喜欢/习惯，5为极其喜欢/习惯</p>
                        
                        <div class="rating-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                            <!-- 量化学习 -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">A. 量化学习，数字和公式更能解释清楚特定知识点：</label>
                                <div class="rating-control">
                                    <input type="range" name="learning_style_quantitative" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                        style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>不喜欢</span>
                                        <span>一般</span>
                                        <span>非常喜欢</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 文字理解 -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">B. 文字理解，通过清晰详细的语言表述知识点：</label>
                                <div class="rating-control">
                                    <input type="range" name="learning_style_textual" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                        style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>不喜欢</span>
                                        <span>一般</span>
                                        <span>非常喜欢</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 可视化学习 -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">C. 可视化学习，习惯借助图表甚至立体模型展现特定知识点：</label>
                                <div class="rating-control">
                                    <input type="range" name="learning_style_visual" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                        style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>不喜欢</span>
                                        <span>一般</span>
                                        <span>非常喜欢</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 互动性学习 -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">D. 互动性学习，依赖问题引导、课堂互动或视频等视听型教学方式：</label>
                                <div class="rating-control">
                                    <input type="range" name="learning_style_interactive" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                        style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>不喜欢</span>
                                        <span>一般</span>
                                        <span>非常喜欢</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 实践性学习 -->
                            <div class="rating-item" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                                <label style="font-weight: 500; margin-bottom: 15px; display: block; color: #333;">E. 实践性学习，习惯通过动手实践和严谨实验过程理解特定知识点：</label>
                                <div class="rating-control">
                                    <input type="range" name="learning_style_practical" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                        style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                                    <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                        <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3</span>
                                        <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                            <span class="star" data-value="1">☆</span>
                                            <span class="star" data-value="2">☆</span>
                                            <span class="star active" data-value="3">☆</span>
                                            <span class="star" data-value="4">☆</span>
                                            <span class="star" data-value="5">☆</span>
                                        </div>
                                    </div>
                                    <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                        <span>不喜欢</span>
                                        <span>一般</span>
                                        <span>非常喜欢</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 知识结构 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">2. 您觉得以下哪一个描述最符合自然科学（天文学，生物学等）知识在您大脑中的样子？</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="knowledge_structure" value="A" required style="margin-right: 10px;">
                                    <span>A. 一本厚重的教科书，由浅入深</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="knowledge_structure" value="B" style="margin-right: 10px;">
                                    <span>B. 一个完整的蜘蛛网，互相联系，互相支撑</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="knowledge_structure" value="C" style="margin-right: 10px;">
                                    <span>C. 独立的数据库，每个学科都是独一无二的存储</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="knowledge_structure" value="D" style="margin-right: 10px;">
                                    <span>D. 一个全能但是无序的工具箱</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 科学思考力 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 15px; color: #333;">3. 您觉得您的科学思考力（使用自然科学等方式思考问题）如何（1-5分）</label>
                        <div class="rating-control" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                            <input type="range" name="scientific_thinking" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                            <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3分（一般）</span>
                                <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                    <span class="star" data-value="1">☆</span>
                                    <span class="star" data-value="2">☆</span>
                                    <span class="star active" data-value="3">☆</span>
                                    <span class="star" data-value="4">☆</span>
                                    <span class="star" data-value="5">☆</span>
                                </div>
                            </div>
                            <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                <span>很差</span>
                                <span>较差</span>
                                <span>一般</span>
                                <span>较好</span>
                                <span>很好</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 科学洞察力 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 15px; color: #333;">4. 您觉得您的科学洞察力（从现象到本质的能力）如何（1-5分）</label>
                        <div class="rating-control" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                            <input type="range" name="scientific_insight" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                            <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3分（一般）</span>
                                <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                    <span class="star" data-value="1">☆</span>
                                    <span class="star" data-value="2">☆</span>
                                    <span class="star active" data-value="3">☆</span>
                                    <span class="star" data-value="4">☆</span>
                                    <span class="star" data-value="5">☆</span>
                                </div>
                            </div>
                            <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                <span>很差</span>
                                <span>较差</span>
                                <span>一般</span>
                                <span>较好</span>
                                <span>很好</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 科学现象敏感度 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 15px; color: #333;">5. 您觉得您的科学现象敏感度（从生活中发现科学问题）（1-5分）</label>
                        <div class="rating-control" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                            <input type="range" name="scientific_sensitivity" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                            <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3分（一般）</span>
                                <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                    <span class="star" data-value="1">☆</span>
                                    <span class="star" data-value="2">☆</span>
                                    <span class="star active" data-value="3">☆</span>
                                    <span class="star" data-value="4">☆</span>
                                    <span class="star" data-value="5">☆</span>
                                </div>
                            </div>
                            <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                <span>很差</span>
                                <span>较差</span>
                                <span>一般</span>
                                <span>较好</span>
                                <span>很好</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 跨学科联系能力 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 15px; color: #333;">6. 您觉得您的跨学科联系能力如何（针对特定现象联系多学科知识解答）（1-5分）</label>
                        <div class="rating-control" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                            <input type="range" name="interdisciplinary_ability" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                            <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3分（一般）</span>
                                <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                    <span class="star" data-value="1">☆</span>
                                    <span class="star" data-value="2">☆</span>
                                    <span class="star active" data-value="3">☆</span>
                                    <span class="star" data-value="4">☆</span>
                                    <span class="star" data-value="5">☆</span>
                                </div>
                            </div>
                            <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                <span>很差</span>
                                <span>较差</span>
                                <span>一般</span>
                                <span>较好</span>
                                <span>很好</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 论文评价 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 15px; color: #333;">7. 请阅读如下这个科学选段，回答问题，您可以搜索资料，但是不能询问AI：</label>
                        <div class="paper-excerpt" style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0; font-size: 14px; line-height: 1.6; color: #666;">
                            <p>本研究通过先进的量子相干光谱技术，发现经过特定频率（528Hz）声波处理的水分子会形成稳定的"谐振记忆结构"。当志愿者饮用这种结构化水后，其生物光子发射强度平均提升47.3%（p&lt;0.05），线粒体ATP合成效率显著改善。实验采用双盲设计，30名志愿者随机分为两组，实验组饮用结构化水，对照组饮用普通蒸馏水。一周后，实验组在主观幸福感量表（SWLS）上的得分比对照组高出62%，同时其DNA端粒长度经PCR检测显示平均延长0.4个碱基对。这些结果表明，水分子可以通过频率信息存储和传递机制，直接优化人类细胞的量子生物场，为能量医学开辟新途径。</p>
                        </div>
                        <label style="display: block; font-weight: 600; margin-bottom: 15px; color: #333;">请为这段论文选段从学术严谨性与学术逻辑性方面打分（1-5）1-很差，5-很好</label>
                        <div class="rating-control" style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef;">
                            <input type="range" name="paper_evaluation_score" min="1" max="5" value="3" step="1" class="rating-slider" data-rating="3" required 
                                style="width: 100%; height: 8px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #ff6b6b, #ffd166, #06d6a0); border-radius: 4px; outline: none; margin: 15px 0;">
                            <div class="rating-display" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                <span class="rating-value" style="font-size: 24px; font-weight: bold; color: #007bff;">3分（一般）</span>
                                <div class="rating-stars" style="display: flex; gap: 8px; font-size: 28px; cursor: pointer;">
                                    <span class="star" data-value="1">☆</span>
                                    <span class="star" data-value="2">☆</span>
                                    <span class="star active" data-value="3">☆</span>
                                    <span class="star" data-value="4">☆</span>
                                    <span class="star" data-value="5">☆</span>
                                </div>
                            </div>
                            <div class="rating-labels" style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                <span>很差</span>
                                <span>较差</span>
                                <span>一般</span>
                                <span>较好</span>
                                <span>很好</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 评价标准 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">8. 您刚才通过什么方面做出选段学术严谨性与逻辑性的评分判断？（可多选）</label>
                        <div class="checkbox-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="checkbox" name="evaluation_criteria" value="A" style="margin-right: 10px;">
                                    <span>A. 选段对现象描述的学术语言使用</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="checkbox" name="evaluation_criteria" value="B" style="margin-right: 10px;">
                                    <span>B. 选段中提及的分析问题、测量用到的科学技术</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="checkbox" name="evaluation_criteria" value="C" style="margin-right: 10px;">
                                    <span>C. 选段中提及的实验数据</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="checkbox" name="evaluation_criteria" value="D" style="margin-right: 10px;">
                                    <span>D. 选段中涉及的科学理论（现象和本质）</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="checkbox" name="evaluation_criteria" value="E" style="margin-right: 10px;">
                                    <span>E. 单纯凭感觉评分</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 气候问题 -->
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #333;">9. 提及全球变暖与温室效应，您最想探究的问题是什么？</label>
                        <div class="radio-group">
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="climate_question" value="A" required style="margin-right: 10px;">
                                    <span>A. 全球变暖能直接导致或者间接导致什么后果？</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="climate_question" value="B" style="margin-right: 10px;">
                                    <span>B. 温室效应是什么？什么是温室气体？它是怎么导致全球变暖的？</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="climate_question" value="C" style="margin-right: 10px;">
                                    <span>C. 有什么相关技术可以改善温室效应？我们可以做什么去改善温室效应？</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="climate_question" value="D" style="margin-right: 10px;">
                                    <span>D. 温室效应背后的学科领域是什么？哪些学科可以帮助理解或是改善温室效应？</span>
                                </label>
                            </div>
                            <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                                <label style="display: block; cursor: pointer; margin: 0;">
                                    <input type="radio" name="climate_question" value="E" style="margin-right: 10px;">
                                    <span>E. 除了温室效应，还有什么会导致全球变暖？</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                
                <div class="questionnaire-buttons" style="display: flex; justify-content: space-between; margin-top: 40px; padding-top: 30px; border-top: 2px solid #eee;">
                    <button type="button" class="btn btn-secondary" onclick="closeFullQuestionnaire()" 
                            style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background-color 0.3s;">
                        <i class="fas fa-times"></i> ${currentLang === 'en' ? 'Cancel' : '取消'}
                    </button>
                    <button type="button" class="btn btn-primary" onclick="saveQuestionnaire()" 
                            style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background-color 0.3s;">
                        <i class="fas fa-save"></i> ${currentLang === 'en' ? 'Save Questionnaire' : '保存问卷'}
                    </button>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = questionnaireHTML;
    
    // 初始化评分系统
    setTimeout(() => {
        initRatingSystem();
    }, 100);
}

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

// 加载问卷摘要
function loadQuestionnaireSummary() {
    if (!AppState.user || AppState.user.is_guest) {
        showNotification('请先登录以查看问卷', 'error');
        return;
    }
    
    fetch('/api/user/questionnaire', {
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const questionnaire = data.questionnaire;
                const summaryElement = document.getElementById('questionnaire-summary');
                if (summaryElement) {
                    const gradeMap = { A: '9年级', B: '10年级', C: '11年级', D: '12年级' };
                    const systemMap = { A: '国际体系', B: '普高体系' };
                    const grade = gradeMap[questionnaire.grade] || '未知';
                    const system = systemMap[questionnaire.education_system] || '未知';
                    
                    summaryElement.innerHTML = `
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">当前知识框架问卷</h5>
                            </div>
                            <div class="card-body">
                                <p><strong>年级：</strong>${grade}</p>
                                <p><strong>教育体系：</strong>${system}</p>
                                <p><strong>学习频率：</strong>${questionnaire.learning_frequency === 'A' ? '一周1次或更频繁' : questionnaire.learning_frequency === 'B' ? '一个月1-3次' : '几个月1次'}</p>
                                <button class="btn btn-primary mt-3" onclick="updateQuestionnaire()">
                                    <i class="fas fa-edit"></i> 修改问卷
                                </button>
                            </div>
                        </div>
                    `;
                }
            } else {
                showNotification('加载问卷失败', 'error');
            }
        })
        .catch(error => {
            console.error('加载问卷错误:', error);
            showNotification('网络错误，请稍后重试', 'error');
        });
}

// 更新问卷
function updateQuestionnaire() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        justify-content: center;
        align-items: center;
    `;
    
    // 获取当前语言
    const currentLang = localStorage.getItem('language') || 'zh';
    const modalTitle = currentLang === 'en' ? 'Modify Knowledge Framework Questionnaire' : '修改知识框架问卷';
    
    modal.innerHTML = `
        <div class="modal-content" style="background: white; border-radius: 10px; padding: 30px; max-width: 900px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                <h3 style="margin: 0; color: #007bff;"><i class="fas fa-edit"></i> ${modalTitle}</h3>
                <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-color, #333); transition: color 0.3s ease;">&times;</button>
            </div>
            <div id="update-questionnaire-container"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 加载问卷内容
    loadFullQuestionnaire(document.getElementById('update-questionnaire-container'));
}

// 提交更新的问卷
function submitUpdatedQuestionnaire() {
    const questionnaire = collectQuestionnaireData();
    
    if (!validateQuestionnaire(questionnaire)) {
        showNotification('问卷填写不完整，请完成所有必填项', 'error');
        return;
    }
    
    fetch('/api/user/questionnaire', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(questionnaire)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('问卷更新成功', 'success');
            document.querySelector('.modal').remove();
            loadQuestionnaireSummary();
        } else {
            showNotification('问卷更新失败', 'error');
        }
    })
    .catch(error => {
        console.error('更新问卷错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    });
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
        
        // 获取当前语言
        const currentLanguage = window.languageManager ? window.languageManager.getCurrentLanguage() : 'zh';
        
        // 根据语言选择对应的文本
        const gradeMap = currentLanguage === 'en' ? 
            { A: 'Grade 9', B: 'Grade 10', C: 'Grade 11', D: 'Grade 12' } : 
            { A: '9年级', B: '10年级', C: '11年级', D: '12年级' };
        
        const systemMap = currentLanguage === 'en' ? 
            { A: 'International System', B: 'General High School System' } : 
            { A: '国际体系', B: '普高体系' };
        
        const grade = gradeMap[window.currentQuestionnaire.grade] || (currentLanguage === 'en' ? 'Unknown' : '未知');
        const system = systemMap[window.currentQuestionnaire.education_system] || (currentLanguage === 'en' ? 'Unknown' : '未知');
        
        // 构建信息框内容
        const completedText = currentLanguage === 'en' ? 'Questionnaire Completed' : '问卷已完成';
        const basicInfoText = currentLanguage === 'en' ? 'Basic Information:' : '基本信息：';
        const frameworkText = currentLanguage === 'en' ? 
            `Knowledge framework questionnaire has been completed with ${Object.keys(window.currentQuestionnaire).length} items of data.` : 
            `知识框架问卷已完成填写，包含${Object.keys(window.currentQuestionnaire).length}项数据。`;
        const modifyText = currentLanguage === 'en' ? 'Modify Questionnaire' : '修改问卷';
        const useText = currentLanguage === 'en' ? 'Register with This Questionnaire' : '使用此问卷注册';
        
        summaryDiv.innerHTML = `
            <h5><i class="fas fa-check-circle" style="color: #28a745;"></i> ${completedText}</h5>
            <p><strong>${basicInfoText}</strong>${grade} | ${system}</p>
            <p>${frameworkText}</p>
            <button type="button" class="btn btn-small btn-secondary" onclick="showFullQuestionnaire()" style="margin-right: 10px;">
                <i class="fas fa-edit"></i> ${modifyText}
            </button>
            <button type="button" class="btn btn-small btn-success" onclick="useSavedQuestionnaire()">
                <i class="fas fa-check"></i> ${useText}
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
            credentials: 'include',
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

// 游客登录
async function enterAsGuest() {
    try {
        const response = await fetch('/api/guest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
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
            method: 'POST',
            credentials: 'include'
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

// Cookie同意功能
function setupCookieConsent() {
    // 检查用户是否已经同意Cookie
    if (!localStorage.getItem('cookieConsent')) {
        // 获取当前语言
        const currentLang = localStorage.getItem('language') || 'zh';
        
        // 根据语言获取翻译文本
        const getCookieText = () => {
            const translations = {
                zh: {
                    message: '我们使用Cookie来提升您的浏览体验。继续使用本网站即表示您同意我们的',
                    cookiePolicy: 'Cookie政策',
                    accept: '同意',
                    settings: '设置',
                    reject: '拒绝'
                },
                en: {
                    message: 'We use cookies to enhance your browsing experience. By continuing to use this website, you agree to our',
                    cookiePolicy: 'Cookie Policy',
                    accept: 'Accept',
                    settings: 'Settings',
                    reject: 'Reject'
                }
            };
            return translations[currentLang] || translations.zh;
        };
        
        const cookieText = getCookieText();
        
        const cookieBanner = document.createElement('div');
        cookieBanner.id = 'cookie-consent-banner';
        cookieBanner.innerHTML = `
            <div style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.9); color: white; padding: 20px; z-index: 9999;">
                <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                    <div style="flex: 1; min-width: 300px;">
                        <p style="margin: 0; font-size: 14px; line-height: 1.5;">
                            <i class="fas fa-cookie-bite" style="margin-right: 10px;"></i>
                            ${cookieText.message}
                            <a href="#" onclick="showModal('cookie'); return false;" style="color: #4dabf7; text-decoration: underline;">${cookieText.cookiePolicy}</a>。
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button id="cookie-accept" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">
                            <i class="fas fa-check"></i> ${cookieText.accept}
                        </button>
                        <button id="cookie-settings" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">
                            <i class="fas fa-cog"></i> ${cookieText.settings}
                        </button>
                        <button id="cookie-reject" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">
                            <i class="fas fa-times"></i> ${cookieText.reject}
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
        });
        
        document.getElementById('cookie-settings').addEventListener('click', () => {
            showModal('cookie');
        });
    }
}

// 修改文件处理逻辑，确保正确传递文件
async function startInterpretation() {
    if (AppState.isProcessing) return;
    
    const file = DOM.fileInput.files[0];
    const text = DOM.paperText.value.trim();
    
    if (!file && !text) {
        showNotification('请上传文件或输入文本', 'error');
        return;
    }
    
    // 重置解读相关状态
    AppState.isProcessing = true;
    // 只重置处理状态，保留其他状态直到新结果生成
    // 这样在处理过程中，旧的结果仍然可以显示
    
    // 显示加载状态
    DOM.resultsSection.style.display = 'none';
    DOM.loadingSection.style.display = 'block';
    
    // 清空之前的图表容器
    const mindmapContainer = document.getElementById('mindmap-container');
    if (mindmapContainer) {
        mindmapContainer.innerHTML = '';
    }
    
    // 保留之前的内容，直到新结果生成
    // 这样用户在等待新结果时仍然可以看到旧的内容
    // if (DOM.originalContent) {
    //     DOM.originalContent.innerHTML = '';
    // }
    // if (DOM.interpretationContent) {
    //     DOM.interpretationContent.innerHTML = '';
    // }
    
    try {
        const formData = new FormData();
        
        // 如果有文件，添加文件
        if (file) {
            formData.append('file', file);
            console.log('添加文件到FormData:', file.name, file.size);
            // 当有文件时，不添加文本，避免冲突
        } else if (text) {
            // 只有当没有文件时，才添加文本
            formData.append('text', text);
            console.log('添加文本到FormData:', text.substring(0, 50) + '...');
        }
        
        // 添加当前语言设置
        const currentLanguage = window.languageManager ? window.languageManager.getCurrentLanguage() : 'zh';
        formData.append('language', currentLanguage);
        console.log('发送到API的语言:', currentLanguage);
        
        // 显示上传进度
        const progressElement = document.createElement('div');
        progressElement.innerHTML = '<p>正在上传文件到DeepSeek API...</p>';
        DOM.loadingSection.appendChild(progressElement);
        
        // 发送请求（添加超时设置）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时
        
        try {
            console.log('开始发送请求到/api/interpret');
            const response = await fetch('/api/interpret', {
                method: 'POST',
                credentials: 'include',
                body: formData,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log('API响应状态:', response.status);
            console.log('API响应状态文本:', response.statusText);
            
            // 检查响应状态
            if (!response.ok) {
                // 尝试读取错误响应内容
                try {
                    const errorData = await response.json();
                    console.error('API错误响应:', errorData);
                    throw new Error(`API请求失败: ${response.status} ${response.statusText}\n${errorData.message || ''}`);
                } catch (jsonError) {
                    // 如果无法解析JSON，使用原始错误
                    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
                }
            }
            
            let data;
            try {
                data = await response.json();
                console.log('API响应数据:', data);
            } catch (jsonError) {
                console.error('JSON解析错误:', jsonError);
                // 尝试读取原始响应内容
                const rawText = await response.text();
                console.error('原始响应内容:', rawText);
                showNotification('服务器返回格式错误，请稍后重试', 'error');
                return;
            }
            
            if (data.success) {
                // 显示结果
                // 对于PDF文件，优化原文内容显示
                if (AppState.currentPDFUrl) {
                    // 直接在原文内容展示框中嵌入PDF查看器，中间没有空格
                    DOM.originalContent.innerHTML = '<div style="width: 100%; height: 100%; border-radius: 8px; overflow: hidden;"><iframe src="'+AppState.currentPDFUrl+'" style="width: 100%; height: 100%; border: none;"></iframe></div>';
                    // 设置PDF文件的原文展示为方形
                    DOM.originalContent.style.width = '100%';
                    DOM.originalContent.style.height = '90vw'; // 更接近方形的比例
                    DOM.originalContent.style.overflow = 'hidden';
                } else {
                    // 对于非PDF文件，直接显示原文内容
                    // 如果是文本输入，显示用户输入的文本；否则显示API返回的原文
                    const originalContent = text ? text : data.original_content;
                    DOM.originalContent.innerHTML = `
                        <div style="width: 100%; min-height: 400px; padding: 15px; background: #f8f9fa; border-radius: 8px; overflow: auto;">
                            <div style="white-space: pre-wrap; word-break: break-all;">${originalContent}</div>
                        </div>
                    `;
                    // 设置非PDF文件的原文展示样式
                    DOM.originalContent.style.width = '100%';
                    DOM.originalContent.style.minHeight = '400px'; // 最小高度
                    DOM.originalContent.style.maxHeight = '80vh'; // 最大高度，防止过高
                    DOM.originalContent.style.overflow = 'auto';
                }
                // 设置解读内容的展示比例为16:9
                DOM.interpretationContent.style.width = '100%';
                DOM.interpretationContent.style.height = '56.25vw';
                DOM.interpretationContent.style.overflow = 'auto';
                DOM.interpretationContent.innerHTML = formatInterpretation(data.interpretation);
                
                // 显示推荐论文
                displayRecommendations(data.recommendations || []);
                
                // 对于文本输入，使用用户输入的text作为原文内容；对于文件上传，使用API返回的data.original_content
                // 确保使用新的内容，而不是旧的内容
                let originalContentToSave;
                if (text) {
                    originalContentToSave = text;
                } else if (data.original_content) {
                    // 检查data.original_content是否包含旧的论文内容
                    const oldPaperKeywords = ['beauty', 'mammalian', 'vascular'];
                    const hasOldPaperContent = oldPaperKeywords.some(keyword => 
                        data.original_content.toLowerCase().includes(keyword)
                    );
                    
                    if (hasOldPaperContent && file) {
                        // 如果包含旧的论文内容且是文件上传，使用文件名作为临时内容
                        originalContentToSave = `File: ${file.name}`;
                        console.warn('API返回了旧的论文内容，使用文件名作为临时内容');
                    } else {
                        originalContentToSave = data.original_content;
                    }
                } else {
                    // 如果没有原文内容，使用文件名作为临时内容
                    originalContentToSave = file ? `File: ${file.name}` : 'No original content';
                    console.warn('没有原文内容，使用临时内容');
                }
                
                // 更新全局状态
                AppState.currentOriginalContent = originalContentToSave;
                AppState.currentInterpretation = data.interpretation;
                // 图表数据会在generatePaperCharts函数中更新
                
                // 保存页面状态（立即保存，确保即使不进入全屏解读也能保存）
                savePageState(originalContentToSave, data.interpretation, AppState.currentChartsData);
                
                DOM.resultsSection.style.display = 'block';
                showNotification('解读生成成功！', 'success');
                
                // 滚动到结果区域
                DOM.resultsSection.scrollIntoView({ behavior: 'smooth' });
                
                // 添加AI对话框到解读页面
                addAIConversationDialog(data.original_content, data.interpretation);
                
                // 添加全屏解读按钮
                addFullScreenButton(originalContentToSave, data.interpretation);
                
                // 生成论文相关图表，并在图表生成完成后显示全屏解读界面
                (async () => {
                    try {
                        // 生成图表
                        await generatePaperCharts(data.original_content, data.interpretation);
                        
                        // 等待一小段时间，确保图表完全渲染
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        // 更新页面状态（包含图表数据）
                        savePageState(originalContentToSave, data.interpretation, AppState.currentChartsData);
                        
                        // 显示全屏解读界面，传入最新的图表数据
                        showFullScreenInterpretation(originalContentToSave, data.interpretation, AppState.currentChartsData);
                    } catch (error) {
                        console.error('生成图表或显示全屏解读时出错:', error);
                        
                        // 即使图表生成失败，也要更新页面状态并显示全屏解读
                        savePageState(originalContentToSave, data.interpretation, AppState.currentChartsData);
                        showFullScreenInterpretation(originalContentToSave, data.interpretation, AppState.currentChartsData);
                    }
                })();
            } else {
                showNotification(data.message || '解读失败', 'error');
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.error('请求超时:', error);
                showNotification('请求超时，请稍后重试', 'error');
            } else {
                console.error('解读错误:', error);
                console.error('错误详情:', error.message);
                console.error('错误堆栈:', error.stack);
                showNotification('网络错误，请稍后重试', 'error');
            }
        }
    } finally {
        AppState.isProcessing = false;
        DOM.loadingSection.style.display = 'none';
    }
}

function formatInterpretation(text) {
    // 确保文本以提示语结尾
    const currentLang = localStorage.getItem('language') || 'zh';
    if (currentLang === 'en') {
        if (!text.includes('Interpretation content generated by DeepSeek AI, for reference only')) {
            text += '\n\n---\n\n*Interpretation content generated by DeepSeek AI, for reference only*';
        }
    } else {
        if (!text.includes('解读内容由DeepSeek AI生成，仅供参考')) {
            text += '\n\n---\n\n*解读内容由DeepSeek AI生成，仅供参考*';
        }
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
    try {
        let hasLoadedSettings = false;
        
        // 首先尝试从本地存储中加载设置
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            console.log('从本地存储加载用户设置');
            applySettings(settings);
            hasLoadedSettings = true;
        }
        
        // 如果用户已登录，从服务器加载最新的设置
        if (AppState.user && !AppState.user.is_guest) {
            const response = await fetch('/api/user/settings', {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success && data.settings) {
                console.log('从服务器加载用户设置');
                
                // 检查服务器返回的设置是否完整
                // 如果本地存储有设置，且服务器返回的设置不完整，保持本地存储的设置
                const hasLocalSettings = !!localStorage.getItem('userSettings');
                const isServerSettingsComplete = data.settings.reading || data.settings.visual || data.settings.language;
                
                if (!hasLocalSettings || isServerSettingsComplete) {
                    // 应用服务器设置
                    applySettings(data.settings);
                    hasLoadedSettings = true;
                } else {
                    console.log('服务器返回的设置不完整，保持本地存储的设置');
                }
            }
        }
        
        // 如果没有加载到任何设置（初次注册用户），应用默认视觉设置
        if (!hasLoadedSettings) {
            console.log('没有加载到设置，应用默认视觉设置');
            const defaultVisualSettings = {
                chinese_font: "'Microsoft YaHei', sans-serif",
                font_size: "18",
                line_height: "1.6",
                letter_spacing: "0px",
                theme: "E", // 白色背景
                text_color: "dark_gray" // 黑色文字
            };
            
            // 创建完整的默认设置对象
            const defaultSettings = {
                visual: defaultVisualSettings,
                language: "zh", // 默认中文
                reading: {
                    preparation: "B",
                    purpose: "B",
                    time: "B",
                    style: "C",
                    depth: "B",
                    test_type: ["B"],
                    chart_types: ["A"]
                }
            };
            
            // 应用默认设置
            applySettings(defaultSettings);
            
            // 保存默认设置到本地存储
            try {
                localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
                console.log('默认设置已保存到本地存储');
            } catch (error) {
                console.error('保存默认设置到本地存储失败:', error);
            }
        }
    } catch (error) {
        console.error('加载设置错误:', error);
        
        // 如果从服务器加载失败，尝试从本地存储中加载设置
        try {
            const savedSettings = localStorage.getItem('userSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                console.log('从本地存储加载用户设置（服务器加载失败）');
                applySettings(settings);
            } else {
                // 如果本地存储也没有设置，应用默认视觉设置
                console.log('没有加载到设置，应用默认视觉设置');
                const defaultVisualSettings = {
                    chinese_font: "'Microsoft YaHei', sans-serif",
                    font_size: "18",
                    line_height: "1.6",
                    letter_spacing: "0px",
                    theme: "E", // 白色背景
                    text_color: "dark_gray" // 黑色文字
                };
                
                // 创建完整的默认设置对象
                const defaultSettings = {
                    visual: defaultVisualSettings,
                    language: "zh", // 默认中文
                    reading: {
                        preparation: "B",
                        purpose: "B",
                        time: "B",
                        style: "C",
                        depth: "B",
                        test_type: ["B"],
                        chart_types: ["A"]
                    }
                };
                
                // 应用默认设置
                applySettings(defaultSettings);
                
                // 保存默认设置到本地存储
                try {
                    localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
                    console.log('默认设置已保存到本地存储');
                } catch (error) {
                    console.error('保存默认设置到本地存储失败:', error);
                }
            }
        } catch (localError) {
            console.error('从本地存储加载设置失败:', localError);
            
            // 如果所有加载都失败，应用默认视觉设置
            console.log('所有加载都失败，应用默认视觉设置');
            const defaultVisualSettings = {
                chinese_font: "'Microsoft YaHei', sans-serif",
                font_size: "18",
                line_height: "1.6",
                letter_spacing: "0px",
                theme: "E", // 白色背景
                text_color: "dark_gray" // 黑色文字
            };
            
            // 创建完整的默认设置对象
            const defaultSettings = {
                visual: defaultVisualSettings,
                language: "zh", // 默认中文
                reading: {
                    preparation: "B",
                    purpose: "B",
                    time: "B",
                    style: "C",
                    depth: "B",
                    test_type: ["B"],
                    chart_types: ["A"]
                }
            };
            
            // 应用默认设置
            applySettings(defaultSettings);
        }
    }
}

function applySettings(settings) {
    if (!settings) return;
    
    // 更新AppState中的设置
    if (AppState && AppState.user && AppState.user.settings) {
        AppState.user.settings = settings;
    } else if (AppState && AppState.user) {
        AppState.user.settings = settings;
    }
    
    // 保存设置到本地存储，确保刷新页面后设置不丢失
    try {
        localStorage.setItem('userSettings', JSON.stringify(settings));
        console.log('用户设置已保存到本地存储');
    } catch (error) {
        console.error('保存设置到本地存储失败:', error);
    }
    
    // 应用视觉设置
    if (settings.visual) {
        const { theme, font_size, chinese_font, english_font, line_height, letter_spacing, text_color } = settings.visual;
        
        // 应用主题
        if (theme) {
            applyTheme(theme);
        }
        
        // 应用字体
        if (font_size) {
            document.documentElement.style.fontSize = `${font_size}px`;
        }
        
        // 应用字体家族
        if (chinese_font && english_font) {
            const fontStack = `${chinese_font}, ${english_font}`;
            document.body.style.fontFamily = fontStack;
        } else if (chinese_font) {
            document.body.style.fontFamily = chinese_font;
        } else if (english_font) {
            document.body.style.fontFamily = english_font;
        }
        
        // 应用行高
        if (line_height) {
            document.body.style.lineHeight = line_height;
        }
        
        // 应用字间距
        if (letter_spacing) {
            document.body.style.letterSpacing = letter_spacing;
        }
        
        // 应用文字颜色
        if (text_color) {
            // 文字颜色映射
            const textColors = {
                dark_pink: '#8a5c73',  // 深粉色（更深）
                dark_blue: '#5c738a',  // 深蓝色（更深）
                dark_green: '#5c8a5c', // 深绿色（更深）
                dark_purple: '#735c8a', // 深紫色（更深）
                dark_gray: '#000000'   // 黑色（替换深灰色）
            };
            
            const selectedColor = textColors[text_color] || textColors.dark_purple;
            
            // 应用文字颜色到标题
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach(heading => {
                heading.style.color = selectedColor;
            });
            
            // 应用文字颜色到按钮
            const buttons = document.querySelectorAll('.btn, .settings-tab, .nav-link, .footer-link');
            buttons.forEach(button => {
                button.style.color = selectedColor;
            });
        }
    }
    
    // 应用语言设置
    if (settings.language) {
        AppState.language = settings.language;
        // 使用语言管理器应用语言设置，确保本地存储也被更新
        if (window.languageManager) {
            window.languageManager.applyLanguage(settings.language);
        }
    }
}

function applyTheme(theme) {
    const themes = {
        'A': { light: '#f8f0f6', dark: '#d1b3c7' }, // 柔和粉 -> 深粉
        'B': { light: '#f0f7ff', dark: '#b3c7e6' }, // 科技蓝 -> 深蓝
        'C': { light: '#f0f9f0', dark: '#b3d1b3' }, // 清新绿 -> 深绿
        'D': { light: '#f3f0f9', dark: '#c7b3d1' }, // 优雅紫 -> 深紫
        'E': { light: '#f8f9fa', dark: '#d1d1d1' }  // 简约白 -> 深灰
    };
    
    const themeColors = themes[theme] || themes['E'];
    const lightColor = themeColors.light;
    const darkColor = themeColors.dark;
    
    // 应用背景颜色
    document.body.style.backgroundColor = lightColor;
    
    // 应用footer标题背景颜色
    const footerHeadings = document.querySelectorAll('.footerpage h3, .footerpage h4');
    footerHeadings.forEach(heading => {
        heading.style.backgroundColor = lightColor;
    });
    
    // 应用页面标题背景颜色
    const pageHeaders = document.querySelectorAll('.page-header');
    pageHeaders.forEach(header => {
        header.style.backgroundColor = lightColor;
    });
    
    // 应用footer按钮背景颜色
    const footerButtons = document.querySelectorAll('.footer-link');
    footerButtons.forEach(button => {
        button.style.backgroundColor = lightColor;
        
        // 设置按钮hover效果
        button.onmouseover = function() {
            this.style.backgroundColor = darkColor;
        };
        
        button.onmouseout = function() {
            this.style.backgroundColor = lightColor;
        };
    });
    
    // 应用按钮点击框颜色
    const buttons = document.querySelectorAll('.btn, .settings-tab, .nav-link');
    buttons.forEach(button => {
        // 设置按钮的边框和背景颜色
        button.style.borderColor = darkColor;
        button.style.backgroundColor = lightColor;
        
        // 设置按钮hover效果
        button.onmouseover = function() {
            this.style.backgroundColor = darkColor;
        };
        
        button.onmouseout = function() {
            this.style.backgroundColor = lightColor;
        };
    });
    
    // 应用图标颜色
    const icons = document.querySelectorAll('.fas, .far');
    icons.forEach(icon => {
        icon.style.color = darkColor;
    });
    
    // 应用字体大小拖动条颜色
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.style.accentColor = darkColor;
    });
    
    // 应用选择框颜色
    const radioLabels = document.querySelectorAll('.radio-label');
    radioLabels.forEach(label => {
        const radio = label.querySelector('input[type="radio"]');
        if (radio) {
            // 使用CSS变量或直接设置样式
            label.style.setProperty('--radio-color', darkColor);
            radio.style.accentColor = darkColor;
        }
    });
    
    // 应用复选框颜色
    const checkboxLabels = document.querySelectorAll('.checkbox-label');
    checkboxLabels.forEach(label => {
        const checkbox = label.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.style.accentColor = darkColor;
        }
    });
    
    // 应用用户选择的文字颜色，确保文字颜色不随主题变化
    if (typeof updateFontPreview === 'function') {
        updateFontPreview();
    }
}

// 语言切换
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

// Language management is now handled by language.js
// This function is deprecated
function updateLanguage() {
    console.warn('updateLanguage() is deprecated, use languageManager instead');
}

// Language management is now handled by language.js
// This function is deprecated
function updateUIText(lang) {
    console.warn('updateUIText() is deprecated, use languageManager instead');
}

// Language management is now handled by language.js
// This function is deprecated
function updateNavigationText(translations) {
    console.warn('updateNavigationText() is deprecated, use languageManager instead');
    
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

// 更新设置页面的语言标签
function updateLanguageSettingsTab() {
    const langSettings = document.getElementById('language-settings');
    if (langSettings) {
        const labels = langSettings.querySelectorAll('.radio-label span');
        if (labels.length >= 2) {
            // 直接使用固定文本，因为这些是语言选项本身，不需要翻译
            labels[0].textContent = '中文';
            labels[1].textContent = 'English';
        }
    }
}

// 搜索Nature论文
function searchNature() {
    const input = document.getElementById('nature-search-input');
    if (!input) return;
    
    const keywords = input.value.trim();
    if (!keywords) {
        showNotification('请输入搜索关键词', 'error');
        return;
    }
    
    // 构建Nature搜索URL
    const natureUrl = `https://www.nature.com/search?q=${encodeURIComponent(keywords)}`;
    window.open(natureUrl, '_blank');
}

// 搜索Science论文
function searchScience() {
    const input = document.getElementById('science-search-input');
    if (!input) return;
    
    const keywords = input.value.trim();
    if (!keywords) {
        showNotification('请输入搜索关键词', 'error');
        return;
    }
    
    // 构建Science搜索URL
    const scienceUrl = `https://www.science.org/search?query=${encodeURIComponent(keywords)}`;
    window.open(scienceUrl, '_blank');
}

// 显示推荐论文（保留函数以避免兼容性问题）
function displayRecommendations(recommendations) {
    // 由于UI已更改为搜索框，此函数不再需要执行任何操作
    // 保留函数定义以避免JavaScript错误
}

// 生成论文相关图表
async function generatePaperCharts(originalContent, interpretation) {
    console.log('开始生成论文相关图表');
    
    const mindmapContainer = document.getElementById('mindmap-container');
    if (!mindmapContainer) {
        console.error('mindmap-container 元素不存在');
        return;
    }
    
    // 清空容器
    mindmapContainer.innerHTML = '';
    
    // 获取用户的图表形式偏好设置
    let chartTypes = ['A']; // 默认使用思维导图
    
    // 尝试从用户设置中获取图表形式偏好
    try {
        // 先尝试使用本地AppState
        if (AppState && AppState.user && AppState.user.settings && AppState.user.settings.reading) {
            chartTypes = AppState.user.settings.reading.chart_types || ['A'];
        } else if (window.AppState && window.AppState.user && window.AppState.user.settings && window.AppState.user.settings.reading) {
            // 再尝试使用window.AppState
            chartTypes = window.AppState.user.settings.reading.chart_types || ['A'];
        }
    } catch (error) {
        console.error('获取图表形式偏好失败:', error);
        // 使用默认值
        chartTypes = ['A'];
    }
    
    console.log('图表类型:', chartTypes);
    
    // 创建图表容器
    const chartsContainer = document.createElement('div');
    // 根据图表数量设置不同的布局
    if (chartTypes.length === 4) {
        // 四个图表时使用网格布局，两行两列
        chartsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-gap: 20px;
            margin-top: 20px;
        `;
    } else {
        // 其他情况使用弹性布局
        chartsContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 20px;
        `;
    }
    
    // 获取当前语言
    const currentLang = localStorage.getItem('language') || 'zh';
    
    // 图表类型名称的中英文翻译
    const chartTypeNames = {
        A: currentLang === 'en' ? 'Paper Structure Mind Map' : '论文结构思维导图',
        B: currentLang === 'en' ? 'Research Process Flow Chart' : '研究流程逻辑图',
        C: currentLang === 'en' ? 'Core Data Table' : '核心数据表格',
        D: currentLang === 'en' ? 'Research Results Statistics Chart' : '研究结果统计图'
    };
    
    // 生成提示的中英文翻译
    const generatingTexts = {
        A: currentLang === 'en' ? 'Generating mind map...' : '思维导图生成中...',
        B: currentLang === 'en' ? 'Generating flow chart...' : '流程图生成中...',
        C: currentLang === 'en' ? 'Generating table...' : '表格生成中...',
        D: currentLang === 'en' ? 'Generating statistics chart...' : '统计图生成中...'
    };
    
    // 为每种图表类型创建容器
    const chartContainers = {};
    
    if (chartTypes.includes('A')) {
        // 生成思维导图
        const mindmapSection = document.createElement('div');
        mindmapSection.style.cssText = `
            flex: 1;
            min-width: 300px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        `;
        mindmapSection.innerHTML = `
            <h5><i class="fas fa-project-diagram"></i> ${chartTypeNames.A}</h5>
            <div id="chart-container-A" style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; min-height: 400px;">
                <p style="text-align: center; color: #666;">${generatingTexts.A}</p>
            </div>
        `;
        chartsContainer.appendChild(mindmapSection);
        chartContainers['A'] = 'chart-container-A';
    }
    
    if (chartTypes.includes('B')) {
        // 生成流程图
        const flowchartSection = document.createElement('div');
        flowchartSection.style.cssText = `
            flex: 1;
            min-width: 300px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        `;
        flowchartSection.innerHTML = `
            <h5><i class="fas fa-sitemap"></i> ${chartTypeNames.B}</h5>
            <div id="chart-container-B" style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; min-height: 400px;">
                <p style="text-align: center; color: #666;">${generatingTexts.B}</p>
            </div>
        `;
        chartsContainer.appendChild(flowchartSection);
        chartContainers['B'] = 'chart-container-B';
    }
    
    if (chartTypes.includes('C')) {
        // 生成表格
        const tableSection = document.createElement('div');
        tableSection.style.cssText = `
            flex: 1;
            min-width: 300px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        `;
        tableSection.innerHTML = `
            <h5>${chartTypeNames.C}</h5>
            <div id="chart-container-C" style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; min-height: 400px;">
                <p style="text-align: center; color: #666;">${generatingTexts.C}</p>
            </div>
        `;
        chartsContainer.appendChild(tableSection);
        chartContainers['C'] = 'chart-container-C';
    }
    
    if (chartTypes.includes('D')) {
        // 生成统计图
        const chartSection = document.createElement('div');
        chartSection.style.cssText = `
            flex: 1;
            min-width: 300px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        `;
        chartSection.innerHTML = `
            <h5><i class="fas fa-chart-bar"></i> ${chartTypeNames.D}</h5>
            <div id="chart-container-D" style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; min-height: 400px;">
                <p style="text-align: center; color: #666;">${generatingTexts.D}</p>
            </div>
        `;
        chartsContainer.appendChild(chartSection);
        chartContainers['D'] = 'chart-container-D';
    }
    
    // 如果没有生成任何图表，显示默认提示
    if (chartsContainer.children.length === 0) {
        mindmapContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-chart-pie" style="font-size: 48px; margin-bottom: 15px;"></i>
                <p>根据您的设置，暂时没有生成图表</p>
                <p>您可以在设置中调整图表形式偏好</p>
            </div>
        `;
    } else {
        mindmapContainer.appendChild(chartsContainer);
        console.log('图表容器已添加到mindmap-container');
    }
    
    // 调用API生成图表数据
    try {
        // 获取当前语言
        let currentLanguage = 'zh';
        try {
            if (window.languageManager) {
                currentLanguage = window.languageManager.getCurrentLanguage();
            } else {
                // 尝试从localStorage获取
                currentLanguage = localStorage.getItem('language') || 'zh';
            }
        } catch (error) {
            console.error('获取当前语言失败:', error);
            currentLanguage = 'zh';
        }
        
        console.log('当前语言:', currentLanguage);
        console.log('论文内容长度:', originalContent ? originalContent.length : 0);
        
        // 发送请求到API
        const response = await fetch('/api/generate-charts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                paper_content: originalContent,
                chart_types: chartTypes,
                language: currentLanguage
            })
        });
        
        console.log('API响应状态:', response.status);
        
        const data = await response.json();
        console.log('API响应数据:', data);
        
        if (data.success) {
            // 更新图表内容
            if (data.charts) {
                console.log('图表数据:', data.charts);
                // 存储图表数据到全局状态
                AppState.currentChartsData = data.charts;
                // 为每种图表类型执行代码
                for (const [chartType, chartCode] of Object.entries(data.charts)) {
                    if (chartContainers[chartType]) {
                        try {
                            // 创建一个安全的执行环境
                            const containerId = chartContainers[chartType];
                            const container = document.getElementById(containerId);
                            
                            if (container) {
                                console.log(`更新图表 ${chartType} 内容`);
                                // 清空容器
                                container.innerHTML = '';
                                
                                // 解析图表代码，提取mermaid语法
                                let mermaidCode = chartCode;
                                
                                // 处理markdown格式的mermaid代码块
                                const mermaidMatch = chartCode.match(/```mermaid[\s\S]*?```/);
                                if (mermaidMatch) {
                                    mermaidCode = mermaidMatch[0].replace(/```mermaid\n?/, '').replace(/```$/, '').trim();
                                }
                                
                                // 对于表格类型，直接显示markdown表格
                                if (chartType === 'C') {
                                    // 创建一个内容容器
                                    const contentContainer = document.createElement('div');
                                    contentContainer.style.cssText = `
                                        padding: 15px;
                                        background: #f9f9f9;
                                        border-radius: 5px;
                                        font-size: 14px;
                                        line-height: 1.5;
                                        overflow-x: auto;
                                    `;
                                    
                                    // 转换markdown表格为HTML
                                    let htmlContent = chartCode;
                                    // 简单的表格转换
                                    htmlContent = htmlContent.replace(/\|(.*?)\|\n\|(.*?)\|\n((?:\|.*?\|\n)*)/g, (match, headers, separator, rows) => {
                                        const headerCells = headers.split('|').map(cell => cell.trim()).filter(cell => cell);
                                        const rowsArray = rows.trim().split('\n').map(row => {
                                            return row.split('|').map(cell => cell.trim()).filter(cell => cell);
                                        });
                                        
                                        let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">';
                                        // 表头
                                        tableHtml += '<thead><tr>';
                                        headerCells.forEach(cell => {
                                            tableHtml += `<th style="border: 1px solid #ddd; padding: 8px; text-align: left; background: #f2f2f2;">${cell}</th>`;
                                        });
                                        tableHtml += '</tr></thead>';
                                        // 表格内容
                                        tableHtml += '<tbody>';
                                        rowsArray.forEach(row => {
                                            tableHtml += '<tr>';
                                            row.forEach(cell => {
                                                tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`;
                                            });
                                            tableHtml += '</tr>';
                                        });
                                        tableHtml += '</tbody></table>';
                                        return tableHtml;
                                    });
                                    
                                    contentContainer.innerHTML = htmlContent;
                                    container.appendChild(contentContainer);
                                } else {
                                    // 对于其他类型，使用mermaid渲染
                                    try {
                                        // 创建图表控制工具栏
                                        const toolbar = document.createElement('div');
                                        toolbar.style.cssText = `
                                            display: flex;
                                            justify-content: space-between;
                                            align-items: center;
                                            margin-bottom: 10px;
                                            padding: 5px 10px;
                                            background: #f0f0f0;
                                            border-radius: 5px;
                                        `;
                                        toolbar.innerHTML = `
                                            <div style="display: flex; gap: 5px;">
                                                <button class="chart-zoom-in" style="padding: 3px 8px; background: #e0e0e0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">
                                                    <i class="fas fa-search-plus"></i>
                                                </button>
                                                <button class="chart-zoom-out" style="padding: 3px 8px; background: #e0e0e0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">
                                                    <i class="fas fa-search-minus"></i>
                                                </button>
                                                <span class="zoom-level" style="font-size: 12px;">100%</span>
                                            </div>
                                            <button class="chart-download" style="padding: 3px 8px; background: #e0e0e0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">
                                                <i class="fas fa-download"></i> 下载
                                            </button>
                                        `;
                                        container.appendChild(toolbar);
                                        
                                        // 创建缩放容器
                                        const zoomContainer = document.createElement('div');
                                        zoomContainer.className = 'zoom-container';
                                        zoomContainer.style.cssText = `
                                            transform-origin: top left;
                                            transition: transform 0.3s ease;
                                            transform: scale(1);
                                        `;
                                        
                                        // 创建mermaid容器
                                        const mermaidContainer = document.createElement('div');
                                        mermaidContainer.className = 'mermaid';
                                        mermaidContainer.style.cssText = `
                                            padding: 20px;
                                            background: white;
                                            border-radius: 5px;
                                            font-size: 14px;
                                            overflow: auto;
                                        `;
                                        mermaidContainer.textContent = mermaidCode;
                                        
                                        zoomContainer.appendChild(mermaidContainer);
                                        container.appendChild(zoomContainer);
                                        
                                        // 初始化mermaid
                                        if (window.mermaid) {
                                            window.mermaid.init(undefined, mermaidContainer);
                                            console.log(`Mermaid图表已初始化：${chartType}`);
                                        } else {
                                            console.error('Mermaid库未加载');
                                            container.innerHTML = '<p style="text-align: center; color: red;">图表渲染失败：Mermaid库未加载</p>';
                                        }
                                        
                                        // 添加缩放功能
                                        let zoomLevel = 1;
                                        const zoomInBtn = toolbar.querySelector('.chart-zoom-in');
                                        const zoomOutBtn = toolbar.querySelector('.chart-zoom-out');
                                        const zoomLevelDisplay = toolbar.querySelector('.zoom-level');
                                        
                                        zoomInBtn.addEventListener('click', function() {
                                            if (zoomLevel < 2) {
                                                zoomLevel += 0.1;
                                                updateZoom();
                                            }
                                        });
                                        
                                        zoomOutBtn.addEventListener('click', function() {
                                            if (zoomLevel > 0.5) {
                                                zoomLevel -= 0.1;
                                                updateZoom();
                                            }
                                        });
                                        
                                        function updateZoom() {
                                            zoomContainer.style.transform = `scale(${zoomLevel})`;
                                            zoomLevelDisplay.textContent = `${Math.round(zoomLevel * 100)}%`;
                                        }
                                        
                                        // 添加下载功能
                                        const downloadBtn = toolbar.querySelector('.chart-download');
                                        downloadBtn.addEventListener('click', function() {
                                            downloadChart(container, chartType);
                                        });
                                        
                                    } catch (error) {
                                        console.error(`渲染图表失败 (${chartType}):`, error);
                                        container.innerHTML = `<p style="text-align: center; color: red;">图表渲染失败: ${error.message}</p>`;
                                    }
                                }
                            } else {
                                console.error(`容器 ${containerId} 不存在`);
                            }
                        } catch (execError) {
                            console.error(`执行图表代码失败 (${chartType}):`, execError);
                            const container = document.getElementById(chartContainers[chartType]);
                            if (container) {
                                container.innerHTML = `<p style="text-align: center; color: red;">图表生成失败: ${execError.message}</p>`;
                            }
                        }
                    }
                }
            } else {
                console.error('API返回成功但没有图表数据');
                // 显示错误信息
                const errorMessage = document.createElement('div');
                errorMessage.style.cssText = `
                    width: 100%;
                    padding: 10px;
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                    border-radius: 5px;
                    margin-top: 10px;
                    text-align: center;
                `;
                errorMessage.textContent = '图表生成失败，请稍后重试';
                chartsContainer.appendChild(errorMessage);
            }
        } else {
            console.error('图表生成失败:', data.message);
            // 显示错误信息
            const errorMessage = document.createElement('div');
            errorMessage.style.cssText = `
                width: 100%;
                padding: 10px;
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
                border-radius: 5px;
                margin-top: 10px;
                text-align: center;
            `;
            errorMessage.textContent = data.message || '图表生成失败，请稍后重试';
            chartsContainer.appendChild(errorMessage);
        }
    } catch (error) {
        console.error('图表生成API调用失败:', error);
        // 显示错误信息
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            width: 100%;
            padding: 10px;
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            border-radius: 5px;
            margin-top: 10px;
            text-align: center;
        `;
        errorMessage.textContent = '网络错误，请稍后重试';
        chartsContainer.appendChild(errorMessage);
    }
    
    console.log('论文相关图表生成完成');
    resolve();
  };


// 下载图表函数
function downloadChart(container, chartType) {
    const chartName = {
        'A': '论文结构思维导图',
        'B': '研究流程逻辑图',
        'D': '研究结果统计图'
    }[chartType] || '图表';
    
    // 获取当前语言
    const currentLang = localStorage.getItem('language') || 'zh';
    const downloadText = currentLang === 'en' ? 'Downloading...' : '下载中...';
    
    try {
        // 显示下载中提示
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            border-radius: 5px;
        `;
        loadingDiv.innerHTML = `<div><i class="fas fa-spinner fa-spin"></i> ${downloadText}</div>`;
        container.style.position = 'relative';
        container.appendChild(loadingDiv);
        
        // 对于mermaid图表，我们可以下载为SVG或PNG
        const mermaidContainer = container.querySelector('.mermaid');
        if (mermaidContainer) {
            // 尝试获取渲染后的SVG
            const svgElement = mermaidContainer.querySelector('svg');
            if (svgElement) {
                // 下载为SVG
                const svgData = new XMLSerializer().serializeToString(svgElement);
                const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
                const svgUrl = URL.createObjectURL(svgBlob);
                
                const downloadLink = document.createElement('a');
                downloadLink.href = svgUrl;
                downloadLink.download = `${chartName}.svg`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(svgUrl);
                
                // 移除加载提示
                setTimeout(() => {
                    container.removeChild(loadingDiv);
                }, 500);
                return;
            }
        }
        
        // 如果没有SVG，尝试使用html2canvas（如果可用）
        if (window.html2canvas) {
            html2canvas(container).then(canvas => {
                const canvasUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = canvasUrl;
                downloadLink.download = `${chartName}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                // 移除加载提示
                container.removeChild(loadingDiv);
            }).catch(err => {
                console.error('html2canvas转换失败:', err);
                container.removeChild(loadingDiv);
                alert(currentLang === 'en' ? 'Failed to download chart' : '图表下载失败');
            });
        } else {
            // 移除加载提示
            container.removeChild(loadingDiv);
            // 如果没有html2canvas，提示用户
            alert(currentLang === 'en' ? 'Chart download requires html2canvas library' : '图表下载需要html2canvas库');
        }
    } catch (error) {
        console.error('下载图表失败:', error);
        alert(currentLang === 'en' ? 'Failed to download chart' : '图表下载失败');
    }
}

// 加载问卷数据
function loadQuestionnaire() {
    const container = document.getElementById('questionnaire');
    if (container) {
        container.innerHTML = `
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

function initRatingSystem() {
    // 为所有评分滑块添加事件监听
    document.querySelectorAll('.rating-slider').forEach(slider => {
        const ratingValue = slider.closest('.rating-control').querySelector('.rating-value');
        const stars = slider.closest('.rating-control').querySelectorAll('.rating-stars .star');
        
        // 滑块变化事件
        slider.addEventListener('input', function() {
            const value = this.value;
            updateRatingDisplay(this, value);
        });
        
        // 星星点击事件
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                slider.value = value;
                updateRatingDisplay(slider, value);
                slider.dispatchEvent(new Event('change'));
            });
        });
        
        // 初始化显示
        updateRatingDisplay(slider, slider.value);
    });
    
    // 为滑块添加颜色变化
    document.querySelectorAll('.rating-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            updateSliderColor(this);
        });
        // 初始化颜色
        updateSliderColor(slider);
    });
}

// 更新评分显示
function updateRatingDisplay(slider, value) {
    const ratingControl = slider.closest('.rating-control');
    const ratingValue = ratingControl.querySelector('.rating-value');
    const stars = ratingControl.querySelectorAll('.rating-stars .star');
    
    // 更新数字显示
    if (ratingValue) {
        ratingValue.textContent = value;
    }
    
    // 更新星星显示
    if (stars) {
        stars.forEach(star => {
            const starValue = parseInt(star.getAttribute('data-value'));
            if (starValue <= value) {
                star.classList.add('active');
                star.textContent = '★';
            } else {
                star.classList.remove('active');
                star.textContent = '☆';
            }
        });
    }
    
    // 更新滑块的自定义属性
    slider.setAttribute('data-rating', value);
}

// 更新滑块颜色
function updateSliderColor(slider) {
    const value = slider.value;
    const max = slider.max;
    const percentage = (value / max) * 100;
    
    // 根据值设置不同的颜色
    slider.style.background = `linear-gradient(to right, #ff6b6b 0%, #ffd166 50%, #06d6a0 100%)`;
}

// 收集问卷数据
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
        
        // 3. 学科兴趣 - 从滑块获取
        data.interests = {
            physics: document.querySelector('input[name="interest_physics"]')?.value || '3',
            biology: document.querySelector('input[name="interest_biology"]')?.value || '3',
            chemistry: document.querySelector('input[name="interest_chemistry"]')?.value || '3',
            geology: document.querySelector('input[name="interest_geology"]')?.value || '3',
            astronomy: document.querySelector('input[name="interest_astronomy"]')?.value || '3'
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
        
        // 1. 学习方式偏好 - 从滑块获取
        data.learning_styles = {
            quantitative: document.querySelector('input[name="learning_style_quantitative"]')?.value || '3',
            textual: document.querySelector('input[name="learning_style_textual"]')?.value || '3',
            visual: document.querySelector('input[name="learning_style_visual"]')?.value || '3',
            interactive: document.querySelector('input[name="learning_style_interactive"]')?.value || '3',
            practical: document.querySelector('input[name="learning_style_practical"]')?.value || '3'
        };
        
        // 2. 知识结构
        const knowledgeStructure = document.querySelector('input[name="knowledge_structure"]:checked');
        if (knowledgeStructure) data.knowledge_structure = knowledgeStructure.value;
        
        // 3-6. 能力自评 - 从滑块获取
        data.scientific_abilities = {
            thinking: document.querySelector('input[name="scientific_thinking"]')?.value || '3',
            insight: document.querySelector('input[name="scientific_insight"]')?.value || '3',
            sensitivity: document.querySelector('input[name="scientific_sensitivity"]')?.value || '3',
            interdisciplinary: document.querySelector('input[name="interdisciplinary_ability"]')?.value || '3'
        };
        
        // 7. 论文评价分数 - 从滑块获取
        const paperScore = document.querySelector('input[name="paper_evaluation_score"]')?.value || '3';
        data.paper_evaluation_score = paperScore;
        
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

// 改进的验证问卷函数
function validateQuestionnaire(questionnaire) {
    if (!questionnaire) return false;
    
    // 检查基本信息部分（真正必填的字段）
    const requiredFields = [
        'grade',
        'education_system',
        'learning_frequency'
    ];
    
    for (const field of requiredFields) {
        if (!questionnaire[field]) {
            console.log(`缺少必填字段: ${field}`);
            return false;
        }
    }
    
    // 检查学科兴趣（如果存在）
    if (questionnaire.interests) {
        const interestFields = ['physics', 'biology', 'chemistry', 'geology', 'astronomy'];
        for (const field of interestFields) {
            const value = questionnaire.interests[field];
            if (value) {
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue < 1 || numValue > 5) {
                    console.log(`学科兴趣无效: ${field} = ${value}`);
                    return false;
                }
            }
            // 如果value不存在，使用默认值3
        }
    } else {
        console.log('缺少interests对象，使用默认值');
    }
    
    // 学科问题是可选的，不强制要求
    // const questionFields = [
    //     'physics_question',
    //     'chemistry_question', 
    //     'biology_question',
    //     'astronomy_question',
    //     'geology_question'
    // ];
    
    // for (const field of questionFields) {
    //     if (!questionnaire[field]) {
    //         console.log(`缺少学科问题: ${field}`);
    //         return false;
    //     }
    // }
    
    // 检查学习方式偏好（如果存在）
    if (questionnaire.learning_styles) {
        const styleFields = ['quantitative', 'textual', 'visual', 'interactive', 'practical'];
        for (const field of styleFields) {
            const value = questionnaire.learning_styles[field];
            if (value) {
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue < 1 || numValue > 5) {
                    console.log(`学习方式偏好无效: ${field} = ${value}`);
                    return false;
                }
            }
            // 如果value不存在，使用默认值3
        }
    } else {
        console.log('缺少learning_styles对象，使用默认值');
    }
    
    // 检查能力自评（如果存在）
    if (questionnaire.scientific_abilities) {
        const abilityFields = ['thinking', 'insight', 'sensitivity', 'interdisciplinary'];
        for (const field of abilityFields) {
            const value = questionnaire.scientific_abilities[field];
            if (value) {
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue < 1 || numValue > 5) {
                    console.log(`能力自评无效: ${field} = ${value}`);
                    return false;
                }
            }
            // 如果value不存在，使用默认值3
        }
    } else {
        console.log('缺少scientific_abilities对象，使用默认值');
    }
    
    // 知识结构是可选的，不强制要求
    // if (!questionnaire.knowledge_structure) {
    //     console.log('缺少knowledge_structure');
    //     return false;
    // }
    
    // 论文评价分数是可选的，不强制要求
    // const paperScore = questionnaire.paper_evaluation_score;
    // if (paperScore) {
    //     const numPaperScore = parseInt(paperScore);
    //     if (isNaN(numPaperScore) || numPaperScore < 1 || numPaperScore > 5) {
    //         console.log(`论文评价分数无效: ${paperScore}`);
    //         return false;
    //     }
    // }
    
    // 气候问题是可选的，不强制要求
    // if (!questionnaire.climate_question) {
    //     console.log('缺少climate_question');
    //     return false;
    // }

    
    return true;
}


// 滚动到对应问题的辅助函数
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

// 设置问卷验证
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
                this.style.borderColor = '#92e0a4ff';
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

// 加载设置表单
function loadSettingsForms() {
    // 这里可以加载设置表单
}

// 使用说明加载
function loadInstructions() {
    const container = document.querySelector('#instructions-page .page-content');
    if (container) {
        container.innerHTML = `
            <style>
                .content-section ul {
                    list-style-position: outside;
                    padding-left: 40px;
                    margin-left: 0;
                }
                .content-section h3 {
                    position: relative;
                    padding-left: 30px;
                }
                .content-section h3 i {
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                }
                .content-section h4 {
                    position: relative;
                    padding-left: 20px;
                    margin-top: 20px;
                }
                .content-section h4:before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 10px;
                    height: 10px;
                    background-color: var(--theme-color, #8bb9e9ff);
                    border-radius: 50%;
                }
            </style>
            <div class="content-section">
                <h3><span data-i18n="technical-description">技术说明</span></h3>
                <ul>
                    <li><strong><span data-i18n="backend-framework">后端框架：</span></strong><span data-i18n="backend-framework-desc">基于Flask、Python、Web框架构建</span></li>
                    <li><strong><span data-i18n="frontend-technology">前端技术：</span></strong><span data-i18n="frontend-technology-desc">HTML5 + CSS3 + JavaScript响应式设计</span></li>
                    <li><strong><span data-i18n="file-processing">文件处理：</span></strong><span data-i18n="file-processing-desc">集成专业解析库处理PDF和DOCX文件</span></li>
                    <li><strong><span data-i18n="api-interface">API接口：</span></strong><span data-i18n="api-interface-desc">调用DeepSeek-V1 API，支持前后端分离</span></li>
                </ul>
            </div>
            
            <div class="content-section">
                <h3><span data-i18n="usage-steps">使用步骤</span></h3>
                <h4><span data-i18n="step-1-title">1. 阅读产品介绍与使用说明</span></h4>
                <ul>
                    <li><strong><span data-i18n="understand-features">了解功能：</span></strong><span data-i18n="understand-features-desc">详细阅读首页功能介绍，了解我们的核心开发理念</span></li>
                    <li><strong><span data-i18n="watch-tutorial">观看使用说明：</span></strong><span data-i18n="watch-tutorial-desc">详细阅读本页使用说明部分，了解网页基本使用方法</span></li>
                </ul>
                
                <h4><span data-i18n="step-2-title">2. 进入 "用户设置"页面，进行参数配置</span></h4>
                <ul>
                                        <li><strong><span data-i18n="reading-habit-settings"></span></strong><span data-i18n="reading-habit-settings-desc">对您个人的论文解读的偏好和特质进行个性化设置</span></li>
                    <li><strong><span data-i18n="visual-settings">视觉设置：</span></strong><span data-i18n="visual-settings-desc">选择不同颜色的背景主题，调节字体形式与大小</span></li>
                    <li><strong><span data-i18n="language-settings">语言设置：</span></strong><span data-i18n="language-settings-desc">切换网页语言为中文/英文</span></li>
                    <li><strong><span data-i18n="account-settings">账户设置：</span></strong><span data-i18n="account-settings-desc">退出登录</span></li>
                </ul>
                
                <h4><span data-i18n="step-3-title">3. 进行论文解读</span></h4>
                <ul>
                    <li><strong><span data-i18n="upload-papers">上传论文：</span></strong><span data-i18n="upload-papers-desc">支持拖拽上传或文件选择，最大支持16MB文件；pdf、docx文件均可接受</span></li>
                    <li><strong><span data-i18n="text-input">文本输入：</span></strong><span data-i18n="text-input-desc">直接粘贴论文摘要或关键段落（最长支持5000字符）</span></li>
                    <li><strong><span data-i18n="generate-analysis">生成解读：</span></strong><span data-i18n="generate-analysis-desc">点击"开始解读"按钮，等待AI生成详细分析</span></li>
                </ul>
            </div>
            
            <div class="content-section">
                <h3><span data-i18n="feature-introduction">功能介绍</span></h3>
                <h4><span data-i18n="core-interpretation-features">A. 解读核心功能</span></h4>
                <ul>
                    <li><strong><span data-i18n="intelligent-interpretation">智能解读：</span></strong><span data-i18n="intelligent-interpretation-desc">将复杂学术语言转换为通俗易懂、自适应的解释</span></li>
                    <li><strong><span data-i18n="terminology-explanation">术语解释：</span></strong><span data-i18n="terminology-explanation-desc">对专业术语提供详细定义和背景说明</span></li>
                    <li><strong><span data-i18n="chart-understanding">图表理解：</span></strong><span data-i18n="chart-understanding-desc">分析论文中的图表数据，生成用户喜欢的图表，提供直观解读</span></li>
                    <li><strong><span data-i18n="personalized-settings">个性化设置：</span></strong><span data-i18n="personalized-settings-desc">注重用户知识框架、阅读偏好差异性，提供设置功能</span></li>
                    <li><strong><span data-i18n="adaptive-algorithm">自适应算法：</span></strong><span data-i18n="adaptive-algorithm-desc">通过用户的阅读记录，自动更新、调整解读内容，支持相关论文搜索，直达nature、sci官网</span></li>
                </ul>
                
                <h4><span data-i18n="visual-settings-features">B. 视觉设置功能</span></h4>
                <ul>
                    <li><strong><span data-i18n="background-switching">背景切换：</span></strong><span data-i18n="background-switching-desc">支持不同文字与背景颜色调节，以及自定义主题设置</span></li>
                    <li><strong><span data-i18n="font-adjustment">字体调节：</span></strong><span data-i18n="font-adjustment-desc">可调整网页文本的字体大小、字体间距和行间距</span></li>
                </ul>
                
                <h4><span data-i18n="feedback-contact-features">C. 反馈与联系功能</span></h4>
                <p><span data-i18n="feedback-contact-desc">     您可以在页面底部的"联系我们"中找到开发团队的联系方式</span></p>
                
                <h4><span data-i18n="other-useful-features">D. 其他实用功能</span></h4>
                <ul>
                    <li><strong><span data-i18n="multilingual-support">多语言支持：</span></strong><span data-i18n="multilingual-support-desc">支持中英双语解读界面</span></li>
                    <li><strong><span data-i18n="progress-saving">进度保存功能：</span></strong><span data-i18n="progress-saving-desc">同一用户登录时自动打开上次退出时的阅读界面</span></li>
                    <li><strong><span data-i18n="share-function">知识框架问卷修改功能：</span></strong><span data-i18n="share-function-desc">用户可对注册时期填写的知识框架问卷进行修改</span></li>
                </ul>
            </div>
            
            <div class="content-section">
                <h3><span data-i18n="friendly-reminder">温馨提示</span></h3>
                <p><span data-i18n="friendly-reminder-desc">本服务旨在辅助学术理解，不替代专业学术指导。开发者鼓励用户以原文阅读为主，解读内容仅供参考。重要项目请结合专家意见。我们持续优化网站，欢迎您在使用过程中提供宝贵反馈，共同打造更好的学术辅助工具！</span></p>
            </div>
        `;
    }
}

// 模态框显示
function showModal(type) {
    const currentLang = localStorage.getItem('language') || 'zh';
    let title = '';
    let content = '';
    
    switch(type) {
        case 'privacy':
            if (currentLang === 'en') {
                title = 'Privacy Policy';
                title = title.replace(/./g, m => `<span style="color:var(--text-color, #333)">${m}</span>`);
                content = `
                    <h4>Last Updated: January 1, 2026</h4>
                    
                    <p><strong>ANSAPRA</strong> (hereinafter referred to as "we" or "our platform") respects and protects the privacy of all users. This policy aims to explain how we collect, use, store, and protect your personal information.</p>
                    
                    <h5>1. Information We Collect</h5>
                    <ul>
                        <li><strong>Information you provide</strong>: When you register an account, we may collect your email address, username, and questionnaire data.</li>
                        <li><strong>Automatically collected information</strong>: To optimize your reading experience, we may anonymously collect your device information, browser type, access time, etc. through technologies like cookies.</li>
                    </ul>
                    
                    <h5>2. How We Use Information</h5>
                    <ul>
                        <li>To provide and optimize an adaptive paper reading experience for you.</li>
                        <li>To conduct anonymous, aggregate data analysis to continuously improve website functionality.</li>
                    </ul>
                    
                    <h5>3. Information Sharing and Disclosure</h5>
                    <p>We <strong>do not</strong> sell, trade, or rent your personal information to any third party.</p>
                    
                    <h5>4. Data Security</h5>
                    <p>We take reasonable technical measures to protect data security.</p>
                    
                    <h5>5. Your Rights</h5>
                    <p>You can view or update your provided personal information at any time in your account settings.</p>
                    
                    <h5>6. About Minors</h5>
                    <p>Our services are primarily aimed at high school students. We encourage minor users to use this platform under the guidance of their parents or guardians.</p>
                `;
            } else {
                title = '隐私政策 (Privacy Policy)';
                title = title.replace(/./g, m => `<span style="color:var(--text-color, #333)">${m}</span>`);
                content = `
                    <h4>最后更新日期：2026年1月1日</h4>
                    
                    <p><strong>ANSAPRA</strong>（以下简称"我们"或"本平台"）尊重并保护所有用户的隐私。本政策旨在说明我们如何收集、使用、存储和保护您的个人信息。</p>
                    
                    <h5>1. 我们收集的信息</h5>
                    <ul>
                        <li><strong>您主动提供的信息</strong>：当您注册账户时，我们可能会收集您的邮箱地址、用户名以及问卷数据。</li>
                        <li><strong>自动收集的信息</strong>：为优化阅读体验，我们可能通过Cookie等技术匿名收集您的设备信息、浏览器类型、访问时间等。</li>
                    </ul>
                    
                    <h5>2. 我们如何使用信息</h5>
                    <ul>
                        <li>为您提供和优化自适应的论文阅读体验。</li>
                        <li>进行匿名的、聚合性的数据分析，以持续改进网站功能。</li>
                    </ul>
                    
                    <h5>3. 信息共享与披露</h5>
                    <p>我们<strong>不会</strong>出售、交易或出租您的个人信息给任何第三方。</p>
                    
                    <h5>4. 数据安全</h5>
                    <p>我们采取合理的技术措施保护数据安全。</p>
                    
                    <h5>5. 您的权利</h5>
                    <p>您可以随时在账户设置中查看或更新您提供的个人信息。</p>
                    
                    <h5>6. 关于未成年人</h5>
                    <p>我们的服务主要面向高中生。我们鼓励未成年用户在父母或监护人的指导下使用本平台。</p>
                `;
            }
            break;
            
        case 'terms':
            if (currentLang === 'en') {
                title = 'Terms of Service';
                title = title.replace(/./g, m => `<span style="color:var(--text-color, #333)">${m}</span>`);
                content = `
                    <h4>Effective Date: January 1, 2026</h4>
                    
                    <p>Welcome to <strong>ANSAPRA</strong>. This platform is a tool developed by a team of high school students designed to help peers read natural science papers.</p>
                    
                    <h5>1. Service Description</h5>
                    <p>This platform aims to provide personalized recommendations and assist in reading natural science papers based on high school students' cognitive frameworks by calling the official API of the DeepSeek artificial intelligence large language model.</p>
                    
                    <h5>2. Usage Rules</h5>
                    <ul>
                        <li>You must comply with all applicable laws and regulations.</li>
                        <li>You may not use this platform for any activities that interfere with the normal operation of services or harm the rights and interests of others.</li>
                    </ul>
                    
                    <h5>3. Disclaimer</h5>
                    <ul>
                        <li>The paper interpretation content provided by this platform is AI-generated content, <strong>only for learning assistance and reference</strong>, and does not constitute professional academic advice.</li>
                        <li>We strive to ensure service stability but do not guarantee the continuity, uninterrupted nature, or absolute security of the service.</li>
                    </ul>
                    
                    <h5>4. Intellectual Property</h5>
                    <p>The website's design, logo, and original content are owned by the <strong>ANSAPRA Development Team</strong>.</p>
                `;
            } else {
                title = '服务条款 (Terms of Service)';
                title = title.replace(/./g, m => `<span style="color:var(--text-color, #333)">${m}</span>`);
                content = `
                    <h4>生效日期：2026年1月1日</h4>
                    
                    <p>欢迎使用 <strong>ANSAPRA</strong>。本平台是一个由高中生团队开发的、旨在帮助同龄人阅读自然科学论文的工具。</p>
                    
                    <h5>1. 服务描述</h5>
                    <p>本平台通过调用DeepSeek人工智能大语言模型官方API，旨在根据高中生的认知框架，个性化推荐和辅助阅读自然科学论文。</p>
                    
                    <h5>2. 使用规则</h5>
                    <ul>
                        <li>您必须遵守所有适用的法律和法规。</li>
                        <li>您不得利用本平台进行任何干扰服务正常运行或损害他人权益的行为。</li>
                    </ul>
                    
                    <h5>3. 免责声明</h5>
                    <ul>
                        <li>本平台提供的论文解读内容为AI生成内容，<strong>仅作为学习辅助和参考</strong>，不构成专业的学术建议。</li>
                        <li>我们尽力确保服务稳定，但不对服务的持续性、无中断性或绝对安全性作任何担保。</li>
                    </ul>
                    
                    <h5>4. 知识产权</h5>
                    <p>网站的设计、Logo、原创内容归<strong>ANSAPRA开发团队</strong>所有。</p>
                `;
            }
            break;
            
        case 'cookie':
            if (currentLang === 'en') {
                title = 'Cookie Policy';
                title = title.replace(/./g, m => `<span style="color:var(--text-color, #333)">${m}</span>`);
                content = `
                    <h4>Cookie Policy Explanation</h4>
                    
                    <p>We use cookies (small text files) to enhance your browsing experience.</p>
                    
                    <h5>1. Purpose of Cookies</h5>
                    <ul>
                        <li><strong>Necessary Cookies</strong>：Used to maintain basic website functions, such as keeping login status.</li>
                        <li><strong>Analytical Cookies</strong>：Used for anonymously analyzing website traffic and page usage.</li>
                        <li><strong>Preference Cookies</strong>：Remember your personalized settings.</li>
                    </ul>
                    
                    <h5>2. Cookie Control</h5>
                    <p>You can refuse or manage cookies through browser settings. However, please note that disabling certain cookies may affect the normal use of some website functions.</p>
                    
                    <h5>3. Third-party Cookies</h5>
                    <p>We currently do not use any third-party cookies for tracking or advertising.</p>
                `;
            } else {
                title = 'Cookie 政策 (Cookie Policy)';
                title = title.replace(/./g, m => `<span style="color:var(--text-color, #333)">${m}</span>`);
                content = `
                    <h4>Cookie政策说明</h4>
                    
                    <p>我们使用Cookie（小型文本文件）来提升您的浏览体验。</p>
                    
                    <h5>1. Cookie的用途</h5>
                    <ul>
                        <li><strong>必要Cookie</strong>：用于维持网站的基本功能，如保持登录状态等。</li>
                        <li><strong>分析Cookie</strong>：用于匿名分析网站流量和页面使用情况。</li>
                        <li><strong>偏好Cookie</strong>：记住您的个性化设置。</li>
                    </ul>
                    
                    <h5>2. Cookie控制</h5>
                    <p>您可以通过浏览器设置拒绝或管理Cookie。但请注意，禁用某些Cookie可能影响部分网站功能的正常使用。</p>
                    
                    <h5>3. 第三方Cookie</h5>
                    <p>我们目前未使用任何用于跟踪或广告的第三方Cookie。</p>
                `;
            }
            break;
            
        case 'copyright':
            if (currentLang === 'en') {
                title = 'Copyright Notice';
                title = title.replace(/./g, m => `<span style="color:var(--text-color, #333)">${m}</span>`);
                content = `
                    <h4>Copyright Declaration</h4>
                    
                    <p><strong>ANSAPRA</strong> is an educational non-profit project.</p>
                    
                    <h5>1. Website Copyright</h5>
                    <ul>
                        <li>The overall design, user interface, specific function code, and original text content of this website are protected by copyright, owned by the <strong>ANSAPRA Development Team</strong>, © 2026.</li>
                    </ul>
                    
                    <h5>2. Copyright of Cited Content</h5>
                    <ul>
                        <li>The copyright of paper information cited on the website for reading assistance belongs to the original copyright holders.</li>
                        <li>We strictly follow academic norms for citations, aiming to provide research and learning convenience for high school students.</li>
                    </ul>
                    
                    <h5>3. Infringement Reporting</h5>
                    <p>If you believe that the content of this website infringes your copyright, please contact us through the following methods:</p>
                    <ul>
                        <li>Email: 1182332400@qq.com or biokoala@outlook.com</li>
                    </ul>
                `;
            } else {
                title = '版权说明 (Copyright Notice)';
                title = title.replace(/./g, m => `<span style="color:var(--text-color, #333)">${m}</span>`);
                content = `
                    <h4>版权声明</h4>
                    
                    <p><strong>ANSAPRA</strong>是一个教育性质的非营利项目。</p>
                    
                    <h5>1. 本网站的版权</h5>
                    <ul>
                        <li>本网站的整体设计、用户界面、特定功能代码及原创文本内容受版权保护，版权归 <strong>ANSAPRA开发团队</strong> 所有，© 2026。</li>
                    </ul>
                    
                    <h5>2. 引用内容的版权</h5>
                    <ul>
                        <li>网站内为辅助阅读而引用的论文信息，其版权归原著作权人所有。</li>
                        <li>我们严格遵守学术规范进行引用，旨在为高中生提供研究学习便利。</li>
                    </ul>
                    
                    <h5>3. 侵权举报</h5>
                    <p>如果您认为本网站的内容侵犯了您的版权，请通过以下方式联系我们：</p>
                    <ul>
                        <li>电子邮件：1182332400@qq.com 或 biokoala@outlook.com</li>
                    </ul>
                `;
            }
            break;
            
        case 'contact':
            if (currentLang === 'en') {
                title = 'Contact Us';
                title = title.replace(/./g, m => `<span style="color:var(--text-color, #333)">${m}</span>`);
                content = `
                    <h4><i class="fas fa-envelope"></i> Contact Us</h4>
                    
                    <p>We are a development team composed of high school students. This website, from its inception to optimization, is inseparable from user support. Therefore, we attach great importance to your feedback.</p>
                    
                    <h5><i class="fas fa-comment-dots"></i> Matters You Can Contact Us About</h5>
                    <ul>
                        <li><strong>Website function suggestions or error reports</strong></li>
                        <li><strong>Questions about privacy policy</strong></li>
                        <li><strong>Cooperation intentions</strong></li>
                        <li><strong>Copyright-related issues</strong></li>
                        <li><strong>Other related questions</strong></li>
                    </ul>
                    
                    <h5><i class="fas fa-envelope-open-text"></i> Contact Methods</h5>
                    <div class="contact-methods" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                        <div class="contact-method" style="text-align: center;">
                            <i class="fas fa-envelope fa-2x" style="color: #007bff;"></i>
                            <h6>Main Email</h6>
                            <p><a href="mailto:biokoala@outlook.com">biokoala@outlook.com</a></p>
                        </div>
                        <div class="contact-method" style="text-align: center;">
                            <i class="fas fa-envelope fa-2x" style="color: #28a745;"></i>
                            <h6>Backup Email</h6>
                            <p><a href="mailto:1182332400@qq.com">1182332400@qq.com</a></p>
                        </div>
                    </div>
                    
                    <div class="response-time" style="background: #e8f4ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h6><i class="fas fa-clock"></i> Response Time</h6>
                        <p>We will try our best to reply to your email within <strong>10 working days</strong>. Since we are a student team, replies may be during after-school hours. Thank you for your understanding.</p>
                    </div>
                `;
            } else {
                title = '联系我们 (Contact Us)';
                title = title.replace(/./g, m => `<span style="color:var(--text-color, #333)">${m}</span>`);
                content = `
                    <h4><i class="fas fa-envelope"></i> 联系我们</h4>
                    
                    <p>我们是一个由高中生组成的开发团队。本网站从诞生到优化，都离不开用户的支持。因此，我们非常重视您的反馈。</p>
                    
                    <h5><i class="fas fa-comment-dots"></i> 您可以联系我们的事项</h5>
                    <ul>
                        <li><strong>网站功能建议或错误报告</strong></li>
                        <li><strong>隐私政策的疑问</strong></li>
                        <li><strong>合作意向</strong></li>
                        <li><strong>版权相关问题</strong></li>
                        <li><strong>其他相关问题</strong></li>
                    </ul>
                    
                    <h5><i class="fas fa-envelope-open-text"></i> 联系方式</h5>
                    <div class="contact-methods" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                        <div class="contact-method" style="text-align: center;">
                            <i class="fas fa-envelope fa-2x" style="color: #007bff;"></i>
                            <h6>主要邮箱</h6>
                            <p><a href="mailto:biokoala@outlook.com">biokoala@outlook.com</a></p>
                        </div>
                        <div class="contact-method" style="text-align: center;">
                            <i class="fas fa-envelope fa-2x" style="color: #28a745;"></i>
                            <h6>备用邮箱</h6>
                            <p><a href="mailto:1182332400@qq.com">1182332400@qq.com</a></p>
                        </div>
                    </div>
                    
                    <div class="response-time" style="background: #e8f4ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h6><i class="fas fa-clock"></i> 响应时间</h6>
                        <p>我们会在<strong>10个工作日内</strong>尽力回复您的邮件。由于我们是学生团队，回复可能会在课后时间，敬请谅解。</p>
                    </div>
                `;
            }
            break;
            
        default:
            title = type;
            content = currentLang === 'en' ? 'Content loading...' : '内容加载中...';
    }
    
    // 获取当前主题颜色
    let lightColor = '#f8f9fa'; // 默认白色
    let themeColor = '#007bff'; // 默认主题颜色
    let textColor = '#333333'; // 默认文字颜色
    const savedSettings = localStorage.getItem('visualSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            if (settings.theme) {
                const themes = {
                    'A': { light: '#f8f0f6', color: '#d63384', text: '#d63384' }, // 柔和粉
                    'B': { light: '#f0f7ff', color: '#007bff', text: '#007bff' }, // 科技蓝
                    'C': { light: '#f0f9f0', color: '#28a745', text: '#28a745' }, // 清新绿
                    'D': { light: '#f3f0f9', color: '#6f42c1', text: '#6f42c1' }, // 优雅紫
                    'E': { light: '#f8f9fa', color: '#007bff', text: '#007bff' }  // 简约白
                };
                if (themes[settings.theme]) {
                    lightColor = themes[settings.theme].light;
                    themeColor = themes[settings.theme].color;
                    textColor = themes[settings.theme].text;
                }
            }
            // 优先使用用户设置的文字颜色
            if (settings.text_color) {
                const textColors = {
                    dark_pink: '#8a5c73',  // 深粉色（更深）
                    dark_blue: '#5c738a',  // 深蓝色（更深）
                    dark_green: '#5c8a5c', // 深绿色（更深）
                    dark_purple: '#735c8a', // 深紫色（更深）
                    dark_gray: '#000000'   // 黑色（替换深灰色）
                };
                const selectedColor = textColors[settings.text_color] || textColors.dark_purple;
                textColor = selectedColor;
            }
        } catch (error) {
            console.error('解析主题设置失败:', error);
        }
    }
    
    // 获取当前body的实际背景颜色，确保模态框头部跟随系统主题背景
    const bodyBgColor = document.body.style.backgroundColor || lightColor;
    
    const readButtonText = currentLang === 'en' ? 'I have read and understood' : '我已阅读并理解';
    const printButtonText = currentLang === 'en' ? 'Print' : '打印';
    
    const modalHTML = `
        <div class="modal" id="info-modal">
            <div class="modal-content" style="max-width: 800px; max-height: 85vh; background: white;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid ${themeColor}; padding-bottom: 10px; background: ${bodyBgColor};">
                    <h3 style="margin: 0; color: ${textColor};">${title}</h3>
                    <button onclick="closeModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-color, #333); transition: color 0.3s ease;">&times;</button>
                </div>
                
                <div class="modal-body" style="max-height: 65vh; overflow-y: auto; padding-right: 10px;">
                    <div class="modal-content-inner" style="line-height: 1.6; font-size: 15px;">
                        ${content}
                    </div>
                </div>
                
                <div class="modal-footer" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #0d0202ff; text-align: center;">
                    <button class="btn btn-primary" onclick="closeModal()" style="background-color: ${themeColor}; border-color: ${themeColor};">
                        <i class="fas fa-check"></i> ${readButtonText}
                    </button>
                    <button class="btn btn-secondary" onclick="printModalContent()" style="margin-left: 10px;">
                        <i class="fas fa-print"></i> ${printButtonText}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.innerHTML = modalHTML;
        
        const modal = document.getElementById('info-modal');
        const closeBtn = modal.querySelector('button[onclick="closeModal()"]');
        if (closeBtn) {
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.color = '#dc3545';
            });
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.color = '#666';
            });
        }
        
        modal.style.display = 'flex';
        
        // 使用系统设置的文字颜色
        const h4Elements = modal.querySelectorAll('h4');
        h4Elements.forEach(h4 => {
            h4.style.color = textColor;
        });
        
        const h5Elements = modal.querySelectorAll('h5');
        h5Elements.forEach(h5 => {
            h5.style.color = textColor;
        });
        
        // 添加滚动条样式
        addModalScrollbarStyles();
    }
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
                        <p>来源：ANSAPRA 高中生自然科学论文自适应阅读智能体</p>
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
// Nature 搜索函数
function searchNature() {
    const input = document.getElementById('nature-search-input');
    const keyword = input.value.trim();
    
    if (!keyword) {
        showNotification('请输入搜索关键词', 'error');
        input.focus();
        return;
    }
    
    // 编码关键词
    const encodedKeyword = encodeURIComponent(keyword);
    // Nature 搜索URL - 只搜索研究论文
    const natureUrl = `https://www.nature.com/search?q=${encodedKeyword}&article_type=research`;
    
    // 在新标签页中打开
    window.open(natureUrl, '_blank');
    
    // 记录搜索历史
    logSearchHistory('Nature', keyword);
    
    // 可选：清空输入框
    // input.value = '';
}

// Science 搜索函数
function searchScience() {
    const input = document.getElementById('science-search-input');
    const keyword = input.value.trim();
    
    if (!keyword) {
        showNotification('请输入搜索关键词', 'error');
        input.focus();
        return;
    }
    
    // 编码关键词
    const encodedKeyword = encodeURIComponent(keyword);
    // Science 搜索URL
    const scienceUrl = `https://www.science.org/action/doSearch?AllField=${encodedKeyword}`;
    
    // 在新标签页中打开
    window.open(scienceUrl, '_blank');
    
    // 记录搜索历史
    logSearchHistory('Science', keyword);
    
    // 可选：清空输入框
    // input.value = '';
}

// 记录搜索历史（可选）
function logSearchHistory(platform, keyword) {
    if (!AppState.user) return;
    
    const searchHistory = {
        platform: platform,
        keyword: keyword,
        timestamp: new Date().toISOString(),
        user: AppState.user.email
    };
    
    // 保存到 localStorage
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    history.unshift(searchHistory);
    // 只保留最近的50条记录
    history = history.slice(0, 50);
    localStorage.setItem('searchHistory', JSON.stringify(history));
    
    showNotification(`${platform} 搜索已打开`, 'success');
}

// 设置AI工具栏
function setupAIToolbar() {
    // 检查是否已存在AI工具栏容器
    let toolbarContainer = document.getElementById('ai-toolbar');
    if (!toolbarContainer) {
        toolbarContainer = document.createElement('div');
        toolbarContainer.id = 'ai-toolbar';
        toolbarContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            overflow: hidden;
        `;
        
        toolbarContainer.innerHTML = `
            <div class="toolbar-header" style="background: #007bff; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                <h4 style="margin: 0;"><i class="fas fa-robot"></i> AI 助手</h4>
                <button id="toggle-chat" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">↑</button>
            </div>
            <div class="chat-container" id="chat-container" style="height: 300px; overflow-y: auto; padding: 15px; background: #f8f9fa;">
                <div class="welcome-message" style="text-align: center; color: #666; padding: 20px;">
                    <p>欢迎使用AI助手！</p>
                    <p>您可以随时向我提问关于论文的问题</p>
                </div>
            </div>
            <div class="chat-input-container" style="padding: 10px; border-top: 1px solid #eee;">
                <input type="text" id="chat-input" placeholder="输入您的问题..." style="width: 250px; padding: 10px; border: 1px solid #ddd; border-radius: 20px; margin-right: 10px;">
                <button id="send-message" style="background: #007bff; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer;">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(toolbarContainer);
        
        // 添加滚动条样式
        addChatScrollbarStyles();
    }
    
    // 设置事件监听
    const toggleButton = document.getElementById('toggle-chat');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');
    
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            if (chatContainer.style.display === 'none') {
                chatContainer.style.display = 'block';
                this.textContent = '↑';
            } else {
                chatContainer.style.display = 'none';
                this.textContent = '↓';
            }
        });
    }
    
    if (sendButton) {
        sendButton.addEventListener('click', sendAIMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAIMessage();
            }
        });
    }
}

// 添加聊天滚动条样式
function addChatScrollbarStyles() {
    const styleId = 'chat-scrollbar-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #chat-container::-webkit-scrollbar {
                width: 8px;
            }
            
            #chat-container::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 4px;
            }
            
            #chat-container::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 4px;
            }
            
            #chat-container::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }
        `;
        document.head.appendChild(style);
    }
}

// 发送AI消息
function sendAIMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // 显示用户消息
    showChatMessage('user', message);
    chatInput.value = '';
    
    // 发送消息到AI
    sendChatMessageToAI(message);
}

// 显示聊天消息
function showChatMessage(type, message) {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;
    
    // 移除欢迎消息
    const welcomeMessage = chatContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;
    messageDiv.style.cssText = `
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 8px;
        max-width: 80%;
    `;
    
    if (type === 'user') {
        messageDiv.style.cssText += `
            background: #007bff;
            color: white;
            margin-left: auto;
        `;
        messageDiv.innerHTML = `<strong>您：</strong> ${message}`;
    } else {
        messageDiv.style.cssText += `
            background: #e9ecef;
            color: #333;
            margin-right: auto;
        `;
        messageDiv.innerHTML = `<strong>AI：</strong> ${message}`;
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 发送聊天消息到AI
function sendChatMessageToAI(message) {
    // 显示加载状态
    const chatContainer = document.getElementById('chat-container');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message ai-message loading';
    loadingDiv.style.cssText = `
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 8px;
        max-width: 80%;
        background: #e9ecef;
        color: #333;
        margin-right: auto;
    `;
    loadingDiv.innerHTML = `<strong>AI：</strong> <i class="fas fa-spinner fa-spin"></i> 思考中...`;
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // 发送请求到后端
    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            question: userQuestion,
            chat_history: chatHistory
        })
    })
    .then(response => response.json())
    .then(data => {
        // 移除加载状态
        loadingDiv.remove();
        
        if (data.success) {
            // 显示AI回复
            showChatMessage('ai', data.answer);
            
            // 更新聊天历史
            if (data.chat_item) {
                AppState.chatHistory.push(data.chat_item);
            }
        } else {
            showChatMessage('ai', '抱歉，我无法回答您的问题。请稍后重试。');
        }
    })
    .catch(error => {
        console.error('发送聊天消息错误:', error);
        loadingDiv.remove();
        showChatMessage('ai', '网络错误，请稍后重试。');
    });
}

// 显示原始论文
function renderPDFViewer(pdfUrl, showLoading = true, containerElement = null) {
    // 获取PDF查看器容器
    const originalContent = containerElement || document.getElementById('original-content');
    if (!originalContent) return;
    
    // 清空查看器
    originalContent.innerHTML = '';
    
    // 设置original-content的样式，确保它完全填充父容器
    originalContent.style.width = '100%';
    originalContent.style.height = '100%';
    originalContent.style.padding = '0';
    originalContent.style.margin = '0';
    originalContent.style.overflow = 'hidden';
    
    // 创建PDF.js查看器容器
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'relative';
    originalContent.appendChild(container);
    
    // 创建画布容器
    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'pdf-canvas-container';
    canvasContainer.style.width = '100%';
    canvasContainer.style.height = '100%';
    canvasContainer.style.overflow = 'auto';
    container.appendChild(canvasContainer);
    
    // 创建工具栏
    const toolbar = document.createElement('div');
    toolbar.style.position = 'absolute';
    toolbar.style.top = '0';
    toolbar.style.left = '0';
    toolbar.style.right = '0';
    toolbar.style.background = 'rgba(255, 255, 255, 0.95)';
    toolbar.style.padding = '2px 5px';
    toolbar.style.borderBottom = '1px solid #ddd';
    toolbar.style.zIndex = '10';
    toolbar.style.height = '24px';
    toolbar.style.display = 'flex';
    toolbar.style.alignItems = 'center';
    toolbar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 5px; font-size: 10px;">
            <button id="pdf-prev" style="padding: 2px 4px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 2px; cursor: pointer; font-size: 10px;">
                <i class="fas fa-chevron-left"></i> 上
            </button>
            <button id="pdf-next" style="padding: 2px 4px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 2px; cursor: pointer; font-size: 10px;">
                下 <i class="fas fa-chevron-right"></i>
            </button>
            <span id="pdf-page-info" style="margin-left: 5px; font-size: 10px;">1 / 1</span>
            <button id="pdf-zoom-in" style="padding: 2px 4px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 2px; cursor: pointer; font-size: 10px;">
                <i class="fas fa-search-plus"></i>
            </button>
            <button id="pdf-zoom-out" style="padding: 2px 4px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 2px; cursor: pointer; font-size: 10px;">
                <i class="fas fa-search-minus"></i>
            </button>
        </div>
    `;
    container.appendChild(toolbar);
    
    // 加载PDF.js
    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    let scale = 1.0;
    
    // 设置PDF.js工作器路径
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // 加载PDF文件
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise.then(function(pdf) {
        console.log('PDF加载成功');
        pdfDoc = pdf;
        document.getElementById('pdf-page-info').textContent = `${pageNum} / ${pdfDoc.numPages}`;
        
        // 渲染第一页
        renderPage(pageNum);
        
        // 添加事件监听器
        document.getElementById('pdf-prev').addEventListener('click', function() {
            if (pageNum <= 1) return;
            pageNum--;
            queueRenderPage(pageNum);
        });
        
        document.getElementById('pdf-next').addEventListener('click', function() {
            if (pageNum >= pdfDoc.numPages) return;
            pageNum++;
            queueRenderPage(pageNum);
        });
        
        document.getElementById('pdf-zoom-in').addEventListener('click', function() {
            scale *= 1.2;
            queueRenderPage(pageNum);
        });
        
        document.getElementById('pdf-zoom-out').addEventListener('click', function() {
            scale /= 1.2;
            queueRenderPage(pageNum);
        });
        
    }, function(error) {
        console.error('PDF加载失败:', error);
        canvasContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: red;">
                <p>PDF加载失败</p>
                <p>${error.message}</p>
            </div>
        `;
    });
    
    // 渲染PDF页面
    function renderPage(num) {
        pageRendering = true;
        
        // 获取页面
        pdfDoc.getPage(num).then(function(page) {
            const viewport = page.getViewport({ scale: scale });
            
            // 创建画布
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // 清空容器并添加画布
            canvasContainer.innerHTML = '';
            canvasContainer.appendChild(canvas);
            
            // 渲染页面
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            const renderTask = page.render(renderContext);
            
            renderTask.promise.then(function() {
                pageRendering = false;
                if (pageNumPending !== null) {
                    // 有等待渲染的页面
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
                
                // 更新页面信息
                if (pdfDoc) {
                    document.getElementById('pdf-page-info').textContent = `${num} / ${pdfDoc.numPages}`;
                }
            });
        });
    }
    
    // 队列渲染页面
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }
}


function showOriginalPaper() {
    if (!AppState.currentPDFUrl) {
        // 如果没有PDF URL，说明是文字内容，不做任何反应
        return;
    }
    
    // 在新标签页打开PDF文件
    window.open(AppState.currentPDFUrl, '_blank');
}

// 全屏解读界面
function showFullScreenInterpretation(originalContent, interpretation, chartsData) {
    // 确保参数有效
    if (!originalContent || !interpretation) {
        console.error('全屏解读缺少必要参数');
        return;
    }
    
    // 保存当前页面状态
    savePageState(originalContent, interpretation, chartsData);
    
    // 创建全屏模态框
    const modal = document.createElement('div');
    modal.className = 'fullscreen-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        z-index: 9999;
        display: flex;
        flex-direction: row;
        overflow: hidden;
    `;
    
    // 创建左半边：原文内容展示
    const leftPanel = document.createElement('div');
    leftPanel.style.cssText = `
        width: 50%;
        height: 100%;
        background: #f8f9fa;
        padding: 20px;
        overflow-y: auto;
        border-right: 2px solid #dee2e6;
    `;
    
    // 根据是否有PDF文件来决定显示方式
    if (AppState.currentPDFUrl) {
        // 直接使用PDF URL创建新的PDF查看器，中间没有空格
        leftPanel.innerHTML = '<h2 style="color: #007bff; margin-bottom: 0;">原文内容</h2><div id="original-content" style="border: 1px solid #ddd; border-radius: 5px; overflow: hidden; height: calc(100vh - 100px);"><iframe src="'+AppState.currentPDFUrl+'" style="width: 100%; height: 100%; border: none;"></iframe></div>';
    } else {
        // 显示文本内容
        leftPanel.innerHTML = `
            <h2 style="color: #007bff; margin-bottom: 20px;">原文内容</h2>
            <div style="white-space: pre-wrap; word-break: break-all; font-size: 14px; line-height: 1.6;">
                ${originalContent}
            </div>
        `;
    }
    
    // 创建右半边：解读和图表
    const rightPanel = document.createElement('div');
    rightPanel.style.cssText = `
        width: 50%;
        height: 100%;
        display: flex;
        flex-direction: column;
    `;
    
    // 右上角：AI解读内容
    const interpretationPanel = document.createElement('div');
    interpretationPanel.style.cssText = `
        height: 50%;
        padding: 20px;
        overflow-y: auto;
        border-bottom: 2px solid #dee2e6;
    `;
    interpretationPanel.innerHTML = `
        <h2 style="color: #28a745; margin-bottom: 20px;">AI解读</h2>
        <div style="font-size: 14px; line-height: 1.6;">
            ${formatInterpretation(interpretation)}
        </div>
    `;
    
    // 右下角：相关图表
    const chartsPanel = document.createElement('div');
    chartsPanel.style.cssText = `
        height: 50%;
        padding: 20px;
        overflow-y: auto;
    `;
    chartsPanel.innerHTML = `
        <h2 style="color: #dc3545; margin-bottom: 20px;">相关图表</h2>
        <div id="charts-container" style="display: flex; flex-wrap: wrap; gap: 15px;">
            <!-- 图表将在这里动态生成 -->
        </div>
    `;
    
    // 组装界面
    rightPanel.appendChild(interpretationPanel);
    rightPanel.appendChild(chartsPanel);
    modal.appendChild(leftPanel);
    modal.appendChild(rightPanel);
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px 15px;
        font-size: 16px;
        cursor: pointer;
        z-index: 10000;
    `;
    closeButton.innerHTML = '<i class="fas fa-times"></i> 关闭';
    closeButton.addEventListener('click', () => {
        modal.remove();
    });
    modal.appendChild(closeButton);
    
    // 添加到页面
    document.body.appendChild(modal);
    
    // 生成图表 - 优先使用传入的chartsData参数
    if (chartsData) {
        // 直接使用传入的已生成图表数据
        console.log('使用传入的已生成图表数据');
        displayChartsForFullScreen(chartsData);
    } else if (AppState.currentChartsData) {
        // 如果没有传入图表数据，尝试使用AppState中的图表数据
        console.log('使用AppState中已生成的图表数据');
        displayChartsForFullScreen(AppState.currentChartsData);
    } else {
        // 如果没有图表数据，显示提示信息
        console.log('没有可用的图表数据');
        const container = document.getElementById('charts-container');
        if (container) {
            container.innerHTML = '<p>没有可用的图表数据</p>';
        }
    }
}

// 为全屏界面显示已生成的图表
function displayChartsForFullScreen(chartsData) {
    const container = document.getElementById('charts-container');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建图表容器
    const chartsContainer = document.createElement('div');
    // 根据图表数量设置不同的布局
    if (Object.keys(chartsData).length === 4) {
        // 四个图表时使用网格布局，两行两列
        chartsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-gap: 20px;
            margin-top: 20px;
        `;
    } else {
        // 其他情况使用弹性布局
        chartsContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 20px;
        `;
    }
    
    // 显示每种图表
    for (const [chartType, chartData] of Object.entries(chartsData)) {
        let chartTitle = '';
        let chartIcon = '';
        
        switch (chartType) {
            case 'A':
                chartTitle = '论文结构思维导图';
                chartIcon = 'fas fa-project-diagram';
                break;
            case 'B':
                chartTitle = '研究方法流程图';
                chartIcon = 'fas fa-sitemap';
                break;
            case 'C':
                chartTitle = '核心概念关系图';
                chartIcon = 'fas fa-connections';
                break;
            case 'D':
                chartTitle = '研究结论总结图';
                chartIcon = 'fas fa-chart-line';
                break;
            default:
                chartTitle = '图表';
                chartIcon = 'fas fa-chart-bar';
        }
        
        // 创建图表区域
        const chartSection = document.createElement('div');
        chartSection.style.cssText = `
            flex: 1;
            min-width: 300px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        `;
        
        // 创建图表容器
        const chartContainer = document.createElement('div');
        chartContainer.id = `fullscreen-chart-${chartType}`;
        chartContainer.style.cssText = `margin-top: 15px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; min-height: 400px;`;
        
        // 处理图表数据
        if (chartType === 'C') {
            // 表格类型，直接显示
            const contentContainer = document.createElement('div');
            contentContainer.style.cssText = `
                padding: 15px;
                background: #f9f9f9;
                border-radius: 5px;
                font-size: 14px;
                line-height: 1.5;
                overflow-x: auto;
            `;
            // 简单的表格转换
            let htmlContent = chartData;
            htmlContent = htmlContent.replace(/\|(.*?)\|\n\|(.*?)\|\n((?:\|.*?\|\n)*)/g, (match, headers, separator, rows) => {
                const headerCells = headers.split('|').map(cell => cell.trim()).filter(cell => cell);
                const rowCells = rows.split('\n').map(row => {
                    return row.split('|').map(cell => cell.trim()).filter(cell => cell);
                }).filter(cells => cells.length > 0);
                
                let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
                
                // 表头
                tableHtml += '<thead><tr>';
                headerCells.forEach(cell => {
                    tableHtml += `<th style="border: 1px solid #ddd; padding: 8px; text-align: left; background: #f2f2f2;">${cell}</th>`;
                });
                tableHtml += '</tr></thead>';
                
                // 表格内容
                tableHtml += '<tbody>';
                rowCells.forEach(row => {
                    tableHtml += '<tr>';
                    row.forEach(cell => {
                        tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`;
                    });
                    tableHtml += '</tr>';
                });
                tableHtml += '</tbody></table>';
                
                return tableHtml;
            });
            contentContainer.innerHTML = htmlContent;
            chartContainer.appendChild(contentContainer);
        } else {
            // 其他图表类型，使用mermaid
            const mermaidDiv = document.createElement('div');
            mermaidDiv.className = 'mermaid';
            // 处理markdown格式的mermaid代码块
            let mermaidCode = chartData;
            const mermaidMatch = chartData.match(/```mermaid[\s\S]*?```/);
            if (mermaidMatch) {
                mermaidCode = mermaidMatch[0].replace(/```mermaid\n?/, '').replace(/```$/, '').trim();
            }
            mermaidDiv.textContent = mermaidCode;
            chartContainer.appendChild(mermaidDiv);
            
            // 尝试渲染mermaid图表
            if (window.mermaid) {
                try {
                    window.mermaid.init(undefined, mermaidDiv);
                } catch (err) {
                    console.error(`渲染图表 ${chartType} 失败:`, err);
                    chartContainer.innerHTML = `<p style="color: #dc3545; text-align: center;">图表渲染失败</p>`;
                }
            } else {
                console.error('mermaid库未加载');
                chartContainer.innerHTML = `<p style="color: #dc3545; text-align: center;">mermaid库未加载</p>`;
            }
        }
        
        // 组装图表区域
        chartSection.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h5><i class="${chartIcon}"></i> ${chartTitle}</h5>
                <button onclick="zoomChart('${chartType}', '${chartTitle}', this)" style="background: #007bff; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                    <i class="fas fa-search-plus"></i> 放大
                </button>
            </div>
        `;
        chartSection.appendChild(chartContainer);
        
        chartsContainer.appendChild(chartSection);
    }
    
    container.appendChild(chartsContainer);
}

// 图表放大功能
function zoomChart(chartType, chartTitle, button) {
    // 获取图表数据
    const chartData = AppState.currentChartsData?.[chartType];
    if (!chartData) {
        showNotification('图表数据不存在', 'error');
        return;
    }
    
    // 创建全屏模态框
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        z-index: 9999;
        display: flex;
        flex-direction: column;
    `;
    
    // 创建头部
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 20px;
        background: #f8f9fa;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    header.innerHTML = `
        <h2 style="margin: 0; color: #007bff;">${chartTitle} (放大)</h2>
        <button onclick="this.parentElement.parentElement.remove()" style="background: #dc3545; color: white; border: none; border-radius: 5px; padding: 10px 20px; font-size: 16px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
            <i class="fas fa-times"></i> 关闭
        </button>
    `;
    modal.appendChild(header);
    
    // 创建内容区域
    const content = document.createElement('div');
    content.style.cssText = `
        flex: 1;
        padding: 30px;
        overflow: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #f8f9fa;
    `;
    
    // 创建图表容器
    const chartContainer = document.createElement('div');
    chartContainer.style.cssText = `
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        padding: 30px;
        max-width: 90vw;
        max-height: 80vh;
        overflow: auto;
    `;
    
    // 处理图表数据
    if (chartType === 'C') {
        // 表格类型，直接显示
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            padding: 20px;
            background: #f9f9f9;
            border-radius: 5px;
            font-size: 16px;
            line-height: 1.6;
            overflow-x: auto;
        `;
        // 简单的表格转换
        let htmlContent = chartData;
        htmlContent = htmlContent.replace(/\|(.*?)\|\n\|(.*?)\|\n((?:\|.*?\|\n)*)/g, (match, headers, separator, rows) => {
            const headerCells = headers.split('|').map(cell => cell.trim()).filter(cell => cell);
            const rowCells = rows.split('\n').map(row => {
                return row.split('|').map(cell => cell.trim()).filter(cell => cell);
            }).filter(cells => cells.length > 0);
            
            let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 16px;">';
            
            // 表头
            tableHtml += '<thead><tr>';
            headerCells.forEach(cell => {
                tableHtml += `<th style="border: 2px solid #ddd; padding: 12px; text-align: left; background: #f2f2f2; font-size: 18px;">${cell}</th>`;
            });
            tableHtml += '</tr></thead>';
            
            // 表格内容
            tableHtml += '<tbody>';
            rowCells.forEach(row => {
                tableHtml += '<tr>';
                row.forEach(cell => {
                    tableHtml += `<td style="border: 2px solid #ddd; padding: 12px; font-size: 16px;">${cell}</td>`;
                });
                tableHtml += '</tr>';
            });
            tableHtml += '</tbody></table>';
            
            return tableHtml;
        });
        contentContainer.innerHTML = htmlContent;
        chartContainer.appendChild(contentContainer);
    } else {
        // 其他图表类型，使用mermaid
        const mermaidDiv = document.createElement('div');
        mermaidDiv.className = 'mermaid';
        // 处理markdown格式的mermaid代码块
        let mermaidCode = chartData;
        const mermaidMatch = chartData.match(/```mermaid[\s\S]*?```/);
        if (mermaidMatch) {
            mermaidCode = mermaidMatch[0].replace(/```mermaid\n?/, '').replace(/```$/, '').trim();
        }
        mermaidDiv.textContent = mermaidCode;
        chartContainer.appendChild(mermaidDiv);
        
        // 尝试渲染mermaid图表
        if (window.mermaid) {
            try {
                window.mermaid.init(undefined, mermaidDiv);
                // 为渲染后的图表添加缩放样式
                const svgElement = mermaidDiv.querySelector('svg');
                if (svgElement) {
                    svgElement.style.maxWidth = '100%';
                    svgElement.style.height = 'auto';
                }
            } catch (err) {
                console.error(`渲染放大图表 ${chartType} 失败:`, err);
                chartContainer.innerHTML = `<p style="color: #dc3545; text-align: center; font-size: 16px;">图表渲染失败</p>`;
            }
        } else {
            console.error('mermaid库未加载');
            chartContainer.innerHTML = `<p style="color: #dc3545; text-align: center; font-size: 16px;">mermaid库未加载</p>`;
        }
    }
    
    content.appendChild(chartContainer);
    modal.appendChild(content);
    
    // 添加到页面
    document.body.appendChild(modal);
    
    // 添加键盘事件，按ESC键关闭
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    
    // 添加点击事件，点击模态框外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.removeEventListener('keydown', handleKeyDown);
        }
    });
}

// 为全屏界面生成图表
async function generatePaperChartsForFullScreen(originalContent, interpretation) {
    const container = document.getElementById('charts-container');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '<p>正在生成图表...</p>';
    
    // 获取用户的图表形式偏好设置
    let chartTypes = ['A']; // 默认使用思维导图
    
    // 尝试从用户设置中获取图表形式偏好
    try {
        // 先尝试使用本地AppState
        if (AppState && AppState.user && AppState.user.settings && AppState.user.settings.reading) {
            chartTypes = AppState.user.settings.reading.chart_types || ['A'];
        } else if (window.AppState && window.AppState.user && window.AppState.user.settings && window.AppState.user.settings.reading) {
            // 再尝试使用window.AppState
            chartTypes = window.AppState.user.settings.reading.chart_types || ['A'];
        }
    } catch (error) {
        console.error('获取图表形式偏好失败:', error);
        // 使用默认值
        chartTypes = ['A'];
    }
    
    console.log('全屏界面图表类型:', chartTypes);
    
    // 创建图表容器
    const chartsContainer = document.createElement('div');
    // 根据图表数量设置不同的布局
    if (chartTypes.length === 4) {
        // 四个图表时使用网格布局，两行两列
        chartsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-gap: 20px;
            margin-top: 20px;
        `;
    } else {
        // 其他情况使用弹性布局
        chartsContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 20px;
        `;
    }
    
    // 为每种图表类型创建容器
    const chartContainers = {};
    
    if (chartTypes.includes('A')) {
        // 生成思维导图
        const mindmapSection = document.createElement('div');
        mindmapSection.style.cssText = `
            flex: 1;
            min-width: 300px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        `;
        mindmapSection.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h5><i class="fas fa-project-diagram"></i> 论文结构思维导图</h5>
                <button onclick="zoomChart('A', '论文结构思维导图', this)" style="background: #007bff; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                    <i class="fas fa-search-plus"></i> 放大
                </button>
            </div>
            <div id="fullscreen-chart-A" style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; min-height: 400px;">
                <p style="text-align: center; color: #666;">思维导图生成中...</p>
            </div>
        `;
        chartsContainer.appendChild(mindmapSection);
        chartContainers['A'] = 'fullscreen-chart-A';
    }
    
    if (chartTypes.includes('B')) {
        // 生成流程图
        const flowchartSection = document.createElement('div');
        flowchartSection.style.cssText = `
            flex: 1;
            min-width: 300px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        `;
        flowchartSection.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h5><i class="fas fa-sitemap"></i> 研究流程逻辑图</h5>
                <button onclick="zoomChart('B', '研究流程逻辑图', this)" style="background: #007bff; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                    <i class="fas fa-search-plus"></i> 放大
                </button>
            </div>
            <div id="fullscreen-chart-B" style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; min-height: 400px;">
                <p style="text-align: center; color: #666;">流程图生成中...</p>
            </div>
        `;
        chartsContainer.appendChild(flowchartSection);
        chartContainers['B'] = 'fullscreen-chart-B';
    }
    
    if (chartTypes.includes('C')) {
        // 生成表格
        const tableSection = document.createElement('div');
        tableSection.style.cssText = `
            flex: 1;
            min-width: 300px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        `;
        tableSection.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h5>核心数据表格</h5>
                <button onclick="zoomChart('C', '核心数据表格', this)" style="background: #007bff; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                    <i class="fas fa-search-plus"></i> 放大
                </button>
            </div>
            <div id="fullscreen-chart-C" style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; min-height: 400px;">
                <p style="text-align: center; color: #666;">表格生成中...</p>
            </div>
        `;
        chartsContainer.appendChild(tableSection);
        chartContainers['C'] = 'fullscreen-chart-C';
    }
    
    if (chartTypes.includes('D')) {
        // 生成统计图
        const chartSection = document.createElement('div');
        chartSection.style.cssText = `
            flex: 1;
            min-width: 300px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        `;
        chartSection.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h5><i class="fas fa-chart-bar"></i> 研究结果统计图</h5>
                <button onclick="zoomChart('D', '研究结果统计图', this)" style="background: #007bff; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                    <i class="fas fa-search-plus"></i> 放大
                </button>
            </div>
            <div id="fullscreen-chart-D" style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; min-height: 400px;">
                <p style="text-align: center; color: #666;">统计图生成中...</p>
            </div>
        `;
        chartsContainer.appendChild(chartSection);
        chartContainers['D'] = 'fullscreen-chart-D';
    }
    
    // 如果没有生成任何图表，显示默认提示
    if (chartsContainer.children.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-chart-pie" style="font-size: 48px; margin-bottom: 15px;"></i>
                <p>根据您的设置，暂时没有生成图表</p>
                <p>您可以在设置中调整图表形式偏好</p>
            </div>
        `;
    } else {
        container.innerHTML = '';
        container.appendChild(chartsContainer);
    }
    
    // 调用API生成图表数据
    try {
        // 获取当前语言
        let currentLanguage = 'zh';
        try {
            if (window.languageManager) {
                currentLanguage = window.languageManager.getCurrentLanguage();
            } else {
                // 尝试从localStorage获取
                currentLanguage = localStorage.getItem('language') || 'zh';
            }
        } catch (error) {
            console.error('获取当前语言失败:', error);
            currentLanguage = 'zh';
        }
        
        // 发送请求到API
        const response = await fetch('/api/generate-charts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                paper_content: originalContent,
                chart_types: chartTypes,
                language: currentLanguage
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 更新图表内容
            if (data.charts) {
                // 为每种图表类型执行代码
                for (const [chartType, chartCode] of Object.entries(data.charts)) {
                    if (chartContainers[chartType]) {
                        try {
                            // 创建一个安全的执行环境
                            const containerId = chartContainers[chartType];
                            const chartContainer = document.getElementById(containerId);
                            
                            if (chartContainer) {
                                // 清空容器
                                chartContainer.innerHTML = '';
                                
                                // 解析图表代码，提取mermaid语法
                                let mermaidCode = chartCode;
                                
                                // 处理markdown格式的mermaid代码块
                                const mermaidMatch = chartCode.match(/```mermaid[\s\S]*?```/);
                                if (mermaidMatch) {
                                    mermaidCode = mermaidMatch[0].replace(/```mermaid\n?/, '').replace(/```$/, '').trim();
                                }
                                
                                // 对于表格类型，直接显示markdown表格
                                if (chartType === 'C') {
                                    // 创建一个内容容器
                                    const contentContainer = document.createElement('div');
                                    contentContainer.style.cssText = `
                                        padding: 15px;
                                        background: #f9f9f9;
                                        border-radius: 5px;
                                        font-size: 14px;
                                        line-height: 1.5;
                                        overflow-x: auto;
                                    `;
                                    
                                    // 转换markdown表格为HTML
                                    let htmlContent = chartCode;
                                    // 简单的表格转换
                                    htmlContent = htmlContent.replace(/\|(.*?)\|\n\|(.*?)\|\n((?:\|.*?\|\n)*)/g, (match, headers, separator, rows) => {
                                        const headerCells = headers.split('|').map(cell => cell.trim()).filter(cell => cell);
                                        const rowsArray = rows.trim().split('\n').map(row => {
                                            return row.split('|').map(cell => cell.trim()).filter(cell => cell);
                                        });
                                        
                                        let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">';
                                        // 表头
                                        tableHtml += '<thead><tr>';
                                        headerCells.forEach(cell => {
                                            tableHtml += `<th style="border: 1px solid #ddd; padding: 8px; text-align: left; background: #f2f2f2;">${cell}</th>`;
                                        });
                                        tableHtml += '</tr></thead>';
                                        // 表格内容
                                        tableHtml += '<tbody>';
                                        rowsArray.forEach(row => {
                                            tableHtml += '<tr>';
                                            row.forEach(cell => {
                                                tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`;
                                            });
                                            tableHtml += '</tr>';
                                        });
                                        tableHtml += '</tbody></table>';
                                        return tableHtml;
                                    });
                                    
                                    contentContainer.innerHTML = htmlContent;
                                    chartContainer.appendChild(contentContainer);
                                } else {
                                    // 对于其他类型，使用mermaid渲染
                                    try {
                                        // 创建图表控制工具栏
                                        const toolbar = document.createElement('div');
                                        toolbar.style.cssText = `
                                            display: flex;
                                            justify-content: space-between;
                                            align-items: center;
                                            margin-bottom: 10px;
                                            padding: 5px 10px;
                                            background: #f0f0f0;
                                            border-radius: 5px;
                                        `;
                                        toolbar.innerHTML = `
                                            <div style="display: flex; gap: 5px;">
                                                <button class="chart-zoom-in" style="padding: 3px 8px; background: #e0e0e0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">
                                                    <i class="fas fa-search-plus"></i>
                                                </button>
                                                <button class="chart-zoom-out" style="padding: 3px 8px; background: #e0e0e0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">
                                                    <i class="fas fa-search-minus"></i>
                                                </button>
                                            </div>
                                            <div style="font-size: 12px; color: #666;">
                                                图表类型: ${chartType === 'A' ? '思维导图' : chartType === 'B' ? '流程图' : '统计图'}
                                            </div>
                                        `;
                                        chartContainer.appendChild(toolbar);
                                        
                                        // 创建mermaid图表容器
                                        const mermaidContainer = document.createElement('div');
                                        mermaidContainer.className = 'mermaid';
                                        mermaidContainer.style.cssText = `
                                            font-size: 14px;
                                            line-height: 1.5;
                                            overflow-x: auto;
                                        `;
                                        mermaidContainer.textContent = mermaidCode;
                                        chartContainer.appendChild(mermaidContainer);
                                        
                                        // 初始化mermaid
                                        if (window.mermaid) {
                                            window.mermaid.init(undefined, mermaidContainer);
                                        }
                                    } catch (mermaidError) {
                                        console.error('Mermaid渲染错误:', mermaidError);
                                        chartContainer.innerHTML = `<p style="color: #dc3545;">图表渲染失败: ${mermaidError.message}</p>`;
                                    }
                                }
                            }
                        } catch (error) {
                            console.error(`更新图表 ${chartType} 时出错:`, error);
                        }
                    }
                }
            }
        } else {
            container.innerHTML = `<p style="color: #dc3545;">图表生成失败: ${data.message || '未知错误'}</p>`;
        }
    } catch (error) {
        console.error('图表生成API调用错误:', error);
        container.innerHTML = `<p style="color: #dc3545;">图表生成失败: ${error.message}</p>`;
    }
}

// 添加查看原文按钮
function addViewOriginalButton() {
    // 检查是否已存在查看原文按钮
    if (document.getElementById('view-original-button')) {
        return;
    }
    
    // 获取当前语言
    const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : (localStorage.getItem('language') || 'zh');
    
    // 创建按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        text-align: center;
        margin: 20px 0;
    `;
    
    // 创建按钮
    const viewButton = document.createElement('button');
    viewButton.id = 'view-original-button';
    // 根据语言显示不同的按钮文本
    const buttonText = currentLang === 'en' ? 'View Original' : '查看原文';
    viewButton.innerHTML = `<i class="fas fa-file-pdf"></i> ${buttonText}`;
    viewButton.style.cssText = `
        background: #28a745;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-right: 10px;
    `;
    
    // 添加点击事件
    viewButton.addEventListener('click', showOriginalPaper);
    
    // 添加到结果区域
    buttonContainer.appendChild(viewButton);
    
    // 找到合适的位置插入按钮
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        // 插入到结果区域的顶部
        const firstChild = resultsSection.firstChild;
        if (firstChild) {
            resultsSection.insertBefore(buttonContainer, firstChild);
        } else {
            resultsSection.appendChild(buttonContainer);
        }
    }
}

// 更新语言相关按钮的文本
function updateLanguageButtons() {
    // 获取当前语言
    const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : (localStorage.getItem('language') || 'zh');
    
    // 更新查看原文按钮
    const viewOriginalButton = document.getElementById('view-original-button');
    if (viewOriginalButton) {
        const buttonText = currentLang === 'en' ? 'View Original' : '查看原文';
        viewOriginalButton.innerHTML = `<i class="fas fa-file-pdf"></i> ${buttonText}`;
    }
    
    // 更新全屏解读按钮
    const fullscreenButton = document.getElementById('fullscreen-button');
    if (fullscreenButton) {
        const buttonText = currentLang === 'en' ? 'Fullscreen Interpretation' : '全屏解读';
        fullscreenButton.innerHTML = `<i class="fas fa-expand"></i> ${buttonText}`;
    }
}

// 添加全屏解读按钮
function addFullScreenButton(originalContent, interpretation) {
    // 检查是否已存在全屏解读按钮
    if (document.getElementById('fullscreen-button')) {
        return;
    }
    
    // 获取当前语言
    const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : (localStorage.getItem('language') || 'zh');
    
    // 创建按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        text-align: center;
        margin: 20px 0;
    `;
    
    // 创建按钮
    const fullscreenButton = document.createElement('button');
    fullscreenButton.id = 'fullscreen-button';
    // 根据语言显示不同的按钮文本
    const buttonText = currentLang === 'en' ? 'Fullscreen Interpretation' : '全屏解读';
    fullscreenButton.innerHTML = `<i class="fas fa-expand"></i> ${buttonText}`;
    fullscreenButton.style.cssText = `
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    `;
    
    // 添加点击事件
    fullscreenButton.addEventListener('click', function() {
        showFullScreenInterpretation(originalContent, interpretation, AppState.currentChartsData);
    });
    
    // 添加到结果区域
    buttonContainer.appendChild(fullscreenButton);
    
    // 找到合适的位置插入按钮
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        // 插入到结果区域的顶部
        const firstChild = resultsSection.firstChild;
        if (firstChild) {
            resultsSection.insertBefore(buttonContainer, firstChild);
        } else {
            resultsSection.appendChild(buttonContainer);
        }
    }
}

// 完善搜索框回车键支持
function setupSearchKeybindings() {
    // Nature 搜索框回车键支持
    const natureInput = document.getElementById('nature-search-input');
    if (natureInput) {
        natureInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchNature();
            }
        });
    }
    
    // Science 搜索框回车键支持
    const scienceInput = document.getElementById('science-search-input');
    if (scienceInput) {
        scienceInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchScience();
            }
        });
    }
}
// 智能提取关键词用于搜索建议
function extractKeywordsForSearch(paperContent) {
    if (!paperContent || paperContent.length < 50) {
        return null;
    }
    
    // 简单的关键词提取逻辑
    const lines = paperContent.split('\n').slice(0, 5);
    const firstFewLines = lines.join(' ');
    
    // 提取可能的专业术语
    const terms = firstFewLines.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g) || [];
    
    // 返回前3个可能的术语
    return terms.slice(0, 3).join(', ');
}

// 在解读完成后自动填充搜索框
function autoFillSearchKeywords(keywords) {
    if (keywords) {
        const natureInput = document.getElementById('nature-search-input');
        const scienceInput = document.getElementById('science-search-input');
        
        if (natureInput && !natureInput.value) {
            natureInput.value = keywords;
        }
        if (scienceInput && !scienceInput.value) {
            scienceInput.value = keywords;
        }
    }
}

// 在 startInterpretation 函数的结果处理部分添加：
// 在显示结果后添加
// This code was incorrectly placed here and has been moved to the appropriate function
// const keywords = extractKeywordsForSearch(data.original_content);
// if (keywords) {
//     autoFillSearchKeywords(keywords);
// }

// 在设置页面添加搜索历史查看功能
function addSearchHistoryToSettings() {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    if (history.length > 0) {
        const accountSettings = document.getElementById('account-settings');
        if (accountSettings) {
            const historyHTML = `
                <div class="search-history-section" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <h5><i class="fas fa-history"></i> <span data-i18n="recent-search-history">最近搜索记录</span></h5>
                    <div style="max-height: 200px; overflow-y: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid #ddd;">
                                    <th style="padding: 8px; text-align: left;"><span data-i18n="platform">平台</span></th>
                                    <th style="padding: 8px; text-align: left;"><span data-i18n="keyword">关键词</span></th>
                                    <th style="padding: 8px; text-align: left;"><span data-i18n="time">时间</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${history.slice(0, 10).map(item => `
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px;">${item.platform}</td>
                                        <td style="padding: 8px;">${item.keyword}</td>
                                        <td style="padding: 8px; font-size: 12px; color: #666;">
                                            ${new Date(item.timestamp).toLocaleDateString()}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <button class="btn btn-small btn-secondary" onclick="clearSearchHistory()" style="margin-top: 10px;">
                        <i class="fas fa-trash"></i> <span data-i18n="clear-search-history">清空搜索记录</span>
                    </button>
                </div>
            `;
            
            accountSettings.insertAdjacentHTML('beforeend', historyHTML);
        }
    }
}

function clearSearchHistory() {
    if (confirm(getTranslation('confirm-clear-history'))) {
        localStorage.removeItem('searchHistory');
        showNotification(getTranslation('search-history-cleared'), 'success');
        // 重新加载页面或刷新设置部分
        location.reload();
    }
}

// 在加载用户设置时调用
// 在 loadUserSettings 函数末尾添加
addSearchHistoryToSettings();

// 设置选项卡切换
function initSettingsTabs() {
    const tabs = document.querySelectorAll('.settings-tab');
    const panels = document.querySelectorAll('.settings-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            
            // 移除所有活动状态
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // 添加当前活动状态
            tab.classList.add('active');
            const panel = document.getElementById(`${tabId}-settings`);
            if (panel) {
                panel.classList.add('active');
            }
        });
    });
}

// 在DOM加载完成后初始化设置选项卡
document.addEventListener('DOMContentLoaded', function() {
    // 其他初始化代码...
    
    // 初始化设置选项卡
    setTimeout(() => {
        initSettingsTabs();
    }, 500);
});

// 生成思维导图
function generateMindMap(interpretationContent, chartPreferences) {
    const container = document.getElementById('mindmap-container');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    // 根据用户偏好选择图表类型
    const chartTypes = chartPreferences || ['A']; // 默认思维导图
    
    // 解析解读内容，提取主要部分
    const sections = parseInterpretationSections(interpretationContent);
    
    // 生成图表
    chartTypes.forEach(chartType => {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        
        switch(chartType) {
            case 'A': // 思维导图（树状）
                chartContainer.innerHTML = generateMindMapHTML(sections);
                chartContainer.style.border = '2px solid #007bff';
                break;
            case 'B': // 流程图与逻辑图
                chartContainer.innerHTML = generateFlowchartHTML(sections);
                chartContainer.style.border = '2px solid #28a745';
                break;
            case 'C': // 表格
                chartContainer.innerHTML = generateTableHTML(sections);
                chartContainer.style.border = '2px solid #ffc107';
                break;
            case 'D': // 统计图
                chartContainer.innerHTML = generateChartHTML(sections);
                chartContainer.style.border = '2px solid #dc3545';
                break;
        }
        
        container.appendChild(chartContainer);
    });
}

// 解析解读内容的主要部分
function parseInterpretationSections(content) {
    // 这里实现内容解析逻辑
    // 返回包含主要章节的结构化数据
    return {
        overview: '论文核心概述',
        methods: '研究方法',
        findings: '研究发现',
        significance: '研究意义',
        glossary: '术语解释',
        questions: '自测问题'
    };
}

// 生成思维导图HTML
function generateMindMapHTML(sections) {
    return `
        <div class="mindmap">
            <div class="mindmap-center">
                <div class="center-node">论文解读</div>
                <div class="mindmap-branches">
                    ${Object.entries(sections).map(([key, value]) => `
                        <div class="branch">
                            <div class="branch-line"></div>
                            <div class="branch-node">${value}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// 添加AI对话对话框到解读页面
function addAIConversationDialog(originalContent, interpretation) {
    const resultsSection = document.getElementById('results-section');
    if (!resultsSection) return;
    
    // 检查是否已存在AI对话框
    let aiDialogContainer = document.getElementById('ai-conversation-dialog');
    if (aiDialogContainer) {
        // 如果已存在，清空内容
        aiDialogContainer.innerHTML = '';
    } else {
        // 创建AI对话框容器
        aiDialogContainer = document.createElement('div');
        aiDialogContainer.id = 'ai-conversation-dialog';
        aiDialogContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            max-height: 400px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 999;
            overflow: hidden;
        `;
        
        resultsSection.appendChild(aiDialogContainer);
    }
    
    // 获取当前语言
    const currentLang = localStorage.getItem('language') || 'zh';
    
    // 根据语言设置不同的文本
    const dialogTitle = currentLang === 'en' ? 'AI Chat' : 'AI 对话';
    const welcomeMessage1 = currentLang === 'en' ? 'I am your AI assistant, I can answer questions about this paper' : '我是您的AI助手，可以回答关于这篇论文的问题';
    const welcomeMessage2 = currentLang === 'en' ? 'You can ask about paper details, concept explanations, etc.' : '您可以询问论文的细节、概念解释等';
    const placeholderText = currentLang === 'en' ? 'Enter your question...' : '输入您的问题...';
    
    // 获取系统主题颜色
    const getThemeColor = () => {
        const themes = {
            'A': { light: '#f8f0f6', dark: '#d1b3c7' }, // 柔和粉 -> 深粉
            'B': { light: '#f0f7ff', dark: '#b3c7e6' }, // 科技蓝 -> 深蓝
            'C': { light: '#f0f9f0', dark: '#b3d1b3' }, // 清新绿 -> 深绿
            'D': { light: '#f3f0f9', dark: '#c7b3d1' }, // 优雅紫 -> 深紫
            'E': { light: '#f8f9fa', dark: '#d1d1d1' }  // 简约白 -> 深灰
        };
        
        try {
            const savedSettings = localStorage.getItem('visualSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                const theme = settings.theme || 'E';
                return themes[theme] || themes['E'];
            }
        } catch (error) {
            console.error('获取主题设置失败:', error);
        }
        return themes['E']; // 默认主题
    };
    
    const themeColors = getThemeColor();
    const headerBackgroundColor = themeColors.dark;
    
    // 对话框内容
    aiDialogContainer.innerHTML = `
        <div class="dialog-header" style="background: ${headerBackgroundColor}; color: white; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
            <h5 style="margin: 0;"><i class="fas fa-robot"></i> ${dialogTitle}</h5>
            <button id="toggle-ai-dialog" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer;">↑</button>
        </div>
        <div class="dialog-body" id="ai-chat-container" style="height: 300px; overflow-y: auto; padding: 10px; background: #f8f9fa;">
            <div class="welcome-message" style="text-align: center; color: #666; padding: 20px;">
                <p>${welcomeMessage1}</p>
                <p>${welcomeMessage2}</p>
            </div>
        </div>
        <div class="dialog-footer" style="padding: 10px; border-top: 1px solid #eee;">
            <input type="text" id="ai-chat-input" placeholder="${placeholderText}" style="width: 200px; padding: 8px; border: 1px solid #ddd; border-radius: 15px; margin-right: 8px;">
            <button id="ai-send-button" style="background: #007bff; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    `;
    
    // 添加滚动条样式
    addAIChatScrollbarStyles();
    
    // 设置事件监听
    const toggleButton = document.getElementById('toggle-ai-dialog');
    const chatContainer = document.getElementById('ai-chat-container');
    const chatInput = document.getElementById('ai-chat-input');
    const sendButton = document.getElementById('ai-send-button');
    
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            if (chatContainer.style.display === 'none') {
                chatContainer.style.display = 'block';
                this.textContent = '↑';
            } else {
                chatContainer.style.display = 'none';
                this.textContent = '↓';
            }
        });
    }
    
    if (sendButton) {
        sendButton.addEventListener('click', function() {
            const message = chatInput.value.trim();
            if (!message) return;
            
            // 显示用户消息
            showAIChatMessage('user', message);
            chatInput.value = '';
            
            // 发送消息到AI
            sendAIChatMessageToAI(message, originalContent, interpretation);
        });
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const message = this.value.trim();
                if (!message) return;
                
                // 显示用户消息
                showAIChatMessage('user', message);
                this.value = '';
                
                // 发送消息到AI
                sendAIChatMessageToAI(message, originalContent, interpretation);
            }
        });
    }
}

// 添加AI聊天滚动条样式
function addAIChatScrollbarStyles() {
    const styleId = 'ai-chat-scrollbar-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #ai-chat-container::-webkit-scrollbar {
                width: 6px;
            }
            
            #ai-chat-container::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
            }
            
            #ai-chat-container::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 3px;
            }
            
            #ai-chat-container::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }
        `;
        document.head.appendChild(style);
    }
}

// 显示AI聊天消息
function showAIChatMessage(type, message) {
    const chatContainer = document.getElementById('ai-chat-container');
    if (!chatContainer) return;
    
    // 移除欢迎消息
    const welcomeMessage = chatContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    // 获取当前语言
    const currentLang = localStorage.getItem('language') || 'zh';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-chat-message ${type}-message`;
    messageDiv.style.cssText = `
        margin-bottom: 8px;
        padding: 8px;
        border-radius: 6px;
        max-width: 80%;
        font-size: 14px;
    `;
    
    if (type === 'user') {
        messageDiv.style.cssText += `
            background: #007bff;
            color: white;
            margin-left: auto;
        `;
        const userLabel = currentLang === 'en' ? 'You: ' : '您：';
        messageDiv.innerHTML = `<strong>${userLabel}</strong> ${message}`;
    } else {
        messageDiv.style.cssText += `
            background: #e9ecef;
            color: #333;
            margin-right: auto;
        `;
        const aiLabel = currentLang === 'en' ? 'AI: ' : 'AI：';
        messageDiv.innerHTML = `<strong>${aiLabel}</strong> ${message}`;
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 发送AI聊天消息到后端
function sendAIChatMessageToAI(message, originalContent, interpretation) {
    const chatContainer = document.getElementById('ai-chat-container');
    if (!chatContainer) return;
    
    // 获取当前语言
    const currentLang = localStorage.getItem('language') || 'zh';
    
    // 显示加载状态
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'ai-chat-message ai-message loading';
    loadingDiv.style.cssText = `
        margin-bottom: 8px;
        padding: 8px;
        border-radius: 6px;
        max-width: 80%;
        background: #e9ecef;
        color: #333;
        margin-right: auto;
        font-size: 14px;
    `;
    const aiLabel = currentLang === 'en' ? 'AI: ' : 'AI：';
    const thinkingText = currentLang === 'en' ? 'Thinking...' : '思考中...';
    loadingDiv.innerHTML = `<strong>${aiLabel}</strong> <i class="fas fa-spinner fa-spin"></i> ${thinkingText}`;
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // 发送请求到后端
    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            question: message,
            original_content: originalContent,
            interpretation: interpretation,
            chat_history: AppState.chatHistory || []
        })
    })
    .then(response => response.json())
    .then(data => {
        // 移除加载状态
        loadingDiv.remove();
        
        if (data.success) {
            // 显示AI回复
            showAIChatMessage('ai', data.answer);
            
            // 更新聊天历史
            if (data.chat_item) {
                if (!AppState.chatHistory) {
                    AppState.chatHistory = [];
                }
                AppState.chatHistory.push(data.chat_item);
            }
        } else {
            showAIChatMessage('ai', '抱歉，我无法回答您的问题。请稍后重试。');
        }
    })
    .catch(error => {
        console.error('发送聊天消息错误:', error);
        loadingDiv.remove();
        showAIChatMessage('ai', '网络错误，请稍后重试。');
    });
}
