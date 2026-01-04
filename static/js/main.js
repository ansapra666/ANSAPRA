/**
 * ANSAPRA - 主JavaScript文件（修复版）
 * 处理页面导航、认证、论文解读等功能
 */

// 全局变量
let currentUser = null;
let currentPaperContent = '';
let currentInterpretation = null;
let userSettings = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('页面加载完成，开始初始化...');
    
    // 首先测试API连接
    try {
        console.log('测试API连接...');
        await ANSAPRA_API.test();
        console.log('API连接正常');
    } catch (error) {
        console.error('API连接测试失败:', error);
        showConnectionError(error.message);
    }
    
    // 检查用户认证状态
    await checkAuthStatus();
    
    // 初始化页面切换
    initPageNavigation();
    
    // 初始化模态框
    initModals();
    
    // 初始化设置
    initSettings();
    
    // 加载使用说明
    loadInstructions();
    
    // 加载问卷
    loadQuestionnaire();
    
    console.log('初始化完成');
});

// 显示连接错误
function showConnectionError(message) {
    const errorHtml = `
        <div class="connection-error" style="
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #f8d7da;
            color: #721c24;
            padding: 15px 20px;
            border-radius: 5px;
            border: 1px solid #f5c6cb;
            z-index: 9999;
            max-width: 80%;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        ">
            <strong>网络连接错误:</strong> ${message}<br>
            <small>请检查网络连接或稍后重试。如果问题持续，请联系管理员。</small>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: #721c24;
                font-size: 20px;
                cursor: pointer;
                position: absolute;
                right: 10px;
                top: 10px;
            ">×</button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', errorHtml);
}

// 检查认证状态（修复版）
async function checkAuthStatus() {
    try {
        console.log('检查认证状态...');
        const data = await ANSAPRA_API.auth.checkAuth();
        
        if (data.authenticated) {
            console.log('用户已认证:', data.user);
            currentUser = data.user;
            showAppContainer();
            
            // 加载用户设置
            await loadUserSettings();
            
            // 应用用户设置
            applyUserSettings();
            
            // 恢复上次访问的页面
            const lastPage = localStorage.getItem('last_page') || 'intro';
            switchPage(lastPage);
        } else {
            console.log('用户未认证，显示登录模态框');
            showAuthModal();
        }
    } catch (error) {
        console.error('检查认证状态失败:', error);
        showAuthModal();
    }
}

// 显示认证模态框
function showAuthModal() {
    console.log('显示认证模态框');
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.add('active');
        authModal.style.display = 'flex';
    }
    
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.style.display = 'none';
    }
}

// 隐藏认证模态框
function hideAuthModal() {
    console.log('隐藏认证模态框');
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.remove('active');
        authModal.style.display = 'none';
    }
}

// 显示主应用容器
function showAppContainer() {
    console.log('显示主应用容器');
    hideAuthModal();
    
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.style.display = 'block';
    }
    
    if (currentUser) {
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = currentUser.username;
        }
    }
}

// 切换选项卡
function showTab(tabName) {
    console.log('切换到选项卡:', tabName);
    
    // 隐藏所有选项卡
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有按钮的活动状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示目标选项卡
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // 激活目标按钮
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// 用户注册（修复版）
async function registerUser(event) {
    if (event) event.preventDefault();
    
    console.log('开始用户注册...');
    
    const email = document.getElementById('register-email')?.value || '';
    const username = document.getElementById('register-username')?.value || '';
    const password = document.getElementById('register-password')?.value || '';
    const confirmPassword = document.getElementById('confirm-password')?.value || '';
    
    // 基本验证
    if (!email || !username || !password || !confirmPassword) {
        alert('请填写所有必填字段');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    
    if (password.length < 6) {
        alert('密码至少需要6个字符');
        return;
    }
    
    // 获取问卷数据
    const questionnaire = collectQuestionnaireData();
    console.log('收集到的问卷数据:', questionnaire);
    
    try {
        const userData = {
            email,
            username,
            password,
            confirm_password: confirmPassword,
            questionnaire
        };
        
        console.log('发送注册请求:', userData);
        
        const result = await ANSAPRA_API.auth.register(userData);
        
        if (result.success) {
            console.log('注册成功:', result.user);
            currentUser = result.user;
            showAppContainer();
            hideAuthModal();
            
            // 保存问卷数据
            await saveQuestionnaire(questionnaire);
            
            // 加载用户设置
            await loadUserSettings();
            
            alert('注册成功！欢迎使用ANSAPRA');
        } else {
            alert(result.error || '注册失败，请重试');
        }
    } catch (error) {
        console.error('注册失败:', error);
        alert(`注册失败: ${error.message || '请检查网络连接后重试'}`);
    }
}

// 用户登录（修复版）
async function loginUser(event) {
    if (event) event.preventDefault();
    
    console.log('开始用户登录...');
    
    const email = document.getElementById('login-email')?.value || '';
    const password = document.getElementById('login-password')?.value || '';
    
    if (!email || !password) {
        alert('请输入邮箱和密码');
        return;
    }
    
    try {
        const credentials = { email, password };
        console.log('发送登录请求:', credentials);
        
        const result = await ANSAPRA_API.auth.login(credentials);
        
        if (result.success) {
            console.log('登录成功:', result.user);
            currentUser = result.user;
            showAppContainer();
            hideAuthModal();
            
            // 跳转到上次访问的页面
            if (result.last_page) {
                switchPage(result.last_page);
            }
            
            // 加载用户设置
            await loadUserSettings();
            
            alert('登录成功！');
        } else {
            alert(result.error || '登录失败，请重试');
        }
    } catch (error) {
        console.error('登录失败:', error);
        alert(`登录失败: ${error.message || '请检查邮箱和密码后重试'}`);
    }
}

// 游客体验
async function enterAsGuest() {
    console.log('进入游客模式...');
    
    try {
        const result = await ANSAPRA_API.auth.guest();
        
        if (result.success) {
            console.log('游客模式成功:', result.user);
            currentUser = result.user;
            showAppContainer();
            hideAuthModal();
            
            // 使用默认设置
            userSettings = getDefaultSettings();
            applyUserSettings();
            
            alert('已进入游客模式。部分功能可能受限。');
        }
    } catch (error) {
        console.error('游客模式失败:', error);
        alert(`游客模式失败: ${error.message || '请重试'}`);
    }
}

// 用户退出
async function logout() {
    console.log('用户退出...');
    
    if (!confirm('确定要退出登录吗？')) {
        return;
    }
    
    try {
        await ANSAPRA_API.auth.logout();
        
        // 清除本地数据
        sessionStorage.clear();
        localStorage.removeItem('last_page');
        currentUser = null;
        userSettings = null;
        
        // 重新加载页面
        location.reload();
    } catch (error) {
        console.error('退出失败:', error);
        alert('退出失败，请重试');
    }
}

// 初始化页面导航
function initPageNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            switchPage(page);
        });
    });
}

// 切换页面
function switchPage(pageName) {
    console.log('切换页面到:', pageName);
    
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 移除所有导航链接的活动状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 激活目标导航链接
    const targetLink = document.querySelector(`.nav-link[data-page="${pageName}"]`);
    if (targetLink) {
        targetLink.classList.add('active');
    }
    
    // 保存当前页面
    localStorage.setItem('last_page', pageName);
    
    // 发送到后端保存
    if (currentUser && !currentUser.guest) {
        ANSAPRA_API.misc.savePage({ page: pageName }).catch(console.error);
    }
}

// 收集问卷数据（修复版）
function collectQuestionnaireData() {
    const questionnaire = {};
    
    try {
        // 基本信息
        questionnaire.grade = document.querySelector('input[name="grade"]:checked')?.value || '10';
        questionnaire.education_system = document.querySelector('input[name="education_system"]:checked')?.value || 'regular';
        questionnaire.learning_frequency = document.querySelector('input[name="learning_frequency"]:checked')?.value || 'monthly';
        
        // 学科兴趣 - 使用默认值如果未选择
        questionnaire.subject_interests = {};
        ['physics', 'biology', 'chemistry', 'geology', 'astronomy'].forEach(subject => {
            const activeBtn = document.querySelector(`.rating-btn[data-subject="${subject}"].active`);
            if (activeBtn) {
                questionnaire.subject_interests[subject] = parseInt(activeBtn.dataset.rating);
            } else {
                questionnaire.subject_interests[subject] = 3; // 默认值
            }
        });
        
        // 学科问题
        questionnaire.physics_question = document.querySelector('input[name="physics_question"]:checked')?.value || '';
        questionnaire.chemistry_question = document.querySelector('input[name="chemistry_question"]:checked')?.value || '';
        questionnaire.biology_question = document.querySelector('input[name="biology_question"]:checked')?.value || '';
        questionnaire.astronomy_question = document.querySelector('input[name="astronomy_question"]:checked')?.value || '';
        questionnaire.geology_question = document.querySelector('input[name="geology_question"]:checked')?.value || '';
        
        // 学习风格
        questionnaire.learning_styles = {};
        for (let i = 0; i < 5; i++) {
            const activeBtn = document.querySelector(`.rating-btn[data-style="${i}"].active`);
            if (activeBtn) {
                questionnaire.learning_styles[`style_${i}`] = parseInt(activeBtn.dataset.rating);
            } else {
                questionnaire.learning_styles[`style_${i}`] = 3; // 默认值
            }
        }
        
        // 知识结构
        questionnaire.knowledge_structure = document.querySelector('input[name="knowledge_structure"]:checked')?.value || 'B';
        
        // 能力评估
        ['thinking', 'insight', 'sensitivity', 'interdisciplinary'].forEach(skill => {
            const activeBtn = document.querySelector(`.rating-btn[data-skill="${skill}"].active`);
            if (activeBtn) {
                questionnaire[`${skill}_ability`] = parseInt(activeBtn.dataset.rating);
            } else {
                questionnaire[`${skill}_ability`] = 3; // 默认值
            }
        });
        
        // 论文质量评估
        const paperQualityBtn = document.querySelector('.rating-btn[data-assessment="paper_quality"].active');
        if (paperQualityBtn) {
            questionnaire.paper_quality_assessment = parseInt(paperQualityBtn.dataset.rating);
        } else {
            questionnaire.paper_quality_assessment = 3; // 默认值
        }
        
        // 评估标准
        const criteria = document.querySelectorAll('input[name="assessment_criteria"]:checked');
        questionnaire.assessment_criteria = Array.from(criteria).map(cb => cb.value);
        if (questionnaire.assessment_criteria.length === 0) {
            questionnaire.assessment_criteria = ['A', 'B']; // 默认值
        }
        
        // 全球变暖问题
        questionnaire.global_warming_question = document.querySelector('input[name="global_warming_question"]:checked')?.value || 'B';
        
    } catch (error) {
        console.error('收集问卷数据时出错:', error);
        // 返回一个基本问卷
        return {
            grade: '10',
            education_system: 'regular',
            learning_frequency: 'monthly',
            subject_interests: {
                physics: 3,
                biology: 3,
                chemistry: 3,
                geology: 3,
                astronomy: 3
            }
        };
    }
    
    return questionnaire;
}

// 保存问卷
async function saveQuestionnaire(questionnaire) {
    try {
        if (!questionnaire || Object.keys(questionnaire).length === 0) {
            console.warn('问卷数据为空，跳过保存');
            return;
        }
        
        await ANSAPRA_API.misc.saveQuestionnaire({ questionnaire });
        console.log('问卷保存成功');
    } catch (error) {
        console.error('保存问卷失败:', error);
    }
}

// 添加测试按钮到页面（调试用）
function addTestButton() {
    const testButton = document.createElement('button');
    testButton.textContent = '测试API';
    testButton.style.position = 'fixed';
    testButton.style.bottom = '10px';
    testButton.style.right = '10px';
    testButton.style.zIndex = '9999';
    testButton.style.padding = '5px 10px';
    testButton.style.background = '#3498db';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '3px';
    testButton.style.cursor = 'pointer';
    
    testButton.onclick = async () => {
        try {
            const result = await ANSAPRA_API.test();
            alert(`API测试成功: ${JSON.stringify(result)}`);
        } catch (error) {
            alert(`API测试失败: ${error.message}`);
        }
    };
    
    document.body.appendChild(testButton);
}

// 在页面加载完成后添加测试按钮（仅调试）
if (DEBUG_MODE) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(addTestButton, 1000);
    });
}

// 其他函数保持不变...
