/**
 * ANSAPRA - 主JavaScript文件
 * 处理页面导航、认证、论文解读等功能
 */

// 全局变量
let currentUser = null;
let currentPaperContent = '';
let currentInterpretation = null;
let userSettings = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
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
});

// 检查认证状态
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/check_auth');
        const data = await response.json();
        
        if (data.authenticated) {
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
            showAuthModal();
        }
    } catch (error) {
        console.error('检查认证状态失败:', error);
        showAuthModal();
    }
}

// 显示认证模态框
function showAuthModal() {
    document.getElementById('auth-modal').classList.add('active');
    document.getElementById('app-container').style.display = 'none';
}

// 隐藏认证模态框
function hideAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

// 显示主应用容器
function showAppContainer() {
    document.getElementById('auth-modal').classList.remove('active');
    document.getElementById('app-container').style.display = 'block';
    
    if (currentUser) {
        document.getElementById('username-display').textContent = currentUser.username;
    }
}

// 切换选项卡
function showTab(tabName) {
    // 隐藏所有选项卡
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有按钮的活动状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示目标选项卡
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // 激活目标按钮
    event.target.classList.add('active');
}

// 用户注册
async function registerUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('register-email').value;
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // 获取问卷数据
    const questionnaire = collectQuestionnaireData();
    
    if (!questionnaire || Object.keys(questionnaire).length === 0) {
        alert('请填写完整的认知框架调查问卷');
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
                confirm_password: confirmPassword,
                questionnaire
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            showAppContainer();
            hideAuthModal();
            
            // 保存问卷数据
            await saveQuestionnaire(questionnaire);
            
            // 加载用户设置
            await loadUserSettings();
            
            alert('注册成功！');
        } else {
            alert(data.error || '注册失败');
        }
    } catch (error) {
        console.error('注册失败:', error);
        alert('注册失败，请检查网络连接');
    }
}

// 用户登录
async function loginUser(event) {
    event.preventDefault();
    
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
        
        if (response.ok) {
            currentUser = data.user;
            showAppContainer();
            hideAuthModal();
            
            // 跳转到上次访问的页面
            if (data.last_page) {
                switchPage(data.last_page);
            }
            
            // 加载用户设置
            await loadUserSettings();
            
            alert('登录成功！');
        } else {
            alert(data.error || '登录失败');
        }
    } catch (error) {
        console.error('登录失败:', error);
        alert('登录失败，请检查网络连接');
    }
}

// 游客体验
async function enterAsGuest() {
    try {
        const response = await fetch('/api/guest', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            showAppContainer();
            hideAuthModal();
            
            // 使用默认设置
            userSettings = getDefaultSettings();
            applyUserSettings();
            
            alert('已进入游客模式');
        }
    } catch (error) {
        console.error('游客模式失败:', error);
        alert('无法进入游客模式');
    }
}

// 用户退出
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            sessionStorage.clear();
            localStorage.removeItem('last_page');
            currentUser = null;
            userSettings = null;
            location.reload();
        }
    } catch (error) {
        console.error('退出失败:', error);
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
    fetch('/api/save_page', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page: pageName })
    }).catch(console.error);
}

// 处理文件上传
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
        alert('只支持PDF、DOCX、TXT格式的文件');
        event.target.value = '';
        return;
    }
    
    // 验证文件大小 (16MB)
    if (file.size > 16 * 1024 * 1024) {
        alert('文件太大，最大支持16MB');
        event.target.value = '';
        return;
    }
    
    // 显示文件信息
    document.getElementById('file-info').textContent = 
        `已选择: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    
    // 读取文件内容
    const reader = new FileReader();
    reader.onload = function(e) {
        currentPaperContent = e.target.result;
    };
    
    if (file.type === 'text/plain') {
        reader.readAsText(file);
    } else {
        // 对于PDF和DOCX，我们只发送文件，不读取内容
        currentPaperContent = file;
    }
}

// 更新字符计数
function updateCharCount() {
    const textarea = document.getElementById('paper-text');
    const charCount = document.getElementById('char-count');
    const count = textarea.value.length;
    charCount.textContent = count;
    
    if (count > 5000) {
        charCount.style.color = 'var(--danger-color)';
    } else {
        charCount.style.color = '';
    }
}

// 开始解读
async function startInterpretation() {
    const textInput = document.getElementById('paper-text').value;
    const hasFile = currentPaperContent && document.getElementById('file-input').files.length > 0;
    
    if (!textInput && !hasFile) {
        alert('请输入论文文本或上传文件');
        return;
    }
    
    // 显示加载状态
    document.getElementById('loading-section').style.display = 'block';
    document.getElementById('upload-section').style.display = 'none';
    
    try {
        let interpretationData;
        
        if (hasFile) {
            // 如果有文件上传，先上传文件
            const formData = new FormData();
            formData.append('file', document.getElementById('file-input').files[0]);
            
            const uploadResponse = await fetch('/api/upload_paper', {
                method: 'POST',
                body: formData
            });
            
            const uploadData = await uploadResponse.json();
            
            if (!uploadResponse.ok) {
                throw new Error(uploadData.error || '文件上传失败');
            }
            
            // 使用文件进行解读
            interpretationData = {
                filename: uploadData.filename,
                file_content: currentPaperContent
            };
        } else {
            // 使用文本输入进行解读
            interpretationData = {
                text: textInput
            };
        }
        
        // 发送解读请求
        const response = await fetch('/api/interpret', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(interpretationData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentInterpretation = data;
            displayResults(data);
        } else {
            throw new Error(data.error || '解读失败');
        }
    } catch (error) {
        console.error('解读失败:', error);
        alert(`解读失败: ${error.message}`);
    } finally {
        // 隐藏加载状态
        document.getElementById('loading-section').style.display = 'none';
        document.getElementById('upload-section').style.display = 'block';
    }
}

// 显示结果
function displayResults(data) {
    // 显示结果区域
    document.getElementById('results-section').style.display = 'block';
    
    // 显示原文内容
    const originalContent = document.getElementById('original-content');
    const textInput = document.getElementById('paper-text').value;
    
    if (textInput) {
        originalContent.textContent = textInput;
    } else {
        originalContent.textContent = '已上传文件内容，如需查看原文请下载原文件。';
    }
    
    // 显示解读内容
    const interpretationContent = document.getElementById('interpretation-content');
    interpretationContent.innerHTML = formatInterpretation(data.interpretation);
    
    // 显示推荐论文
    displayRecommendations(data.recommendations);
    
    // 生成思维导图
    generateMindmap(data.mindmap);
}

// 格式化解读内容
function formatInterpretation(text) {
    // 将Markdown格式的标题转换为HTML
    let html = text
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        .replace(/^# (.+)$/gm, '<h2>$1</h2>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    return '<p>' + html + '</p>';
}

// 显示推荐论文
function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations-list');
    
    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = '<p class="no-recommendations">暂无相关论文推荐</p>';
        return;
    }
    
    container.innerHTML = recommendations.map(paper => `
        <div class="recommendation-card">
            <div class="recommendation-title">${paper.title || '无标题'}</div>
            <div class="recommendation-authors">${paper.authors?.join(', ') || '作者未知'}</div>
            <div class="recommendation-journal">${paper.journal || ''} ${paper.year || ''}</div>
            <div class="recommendation-abstract">${paper.abstract || '无摘要'}</div>
            ${paper.url ? `<a href="${paper.url}" target="_blank" class="recommendation-link">查看原文 →</a>` : ''}
        </div>
    `).join('');
}

// 生成思维导图
function generateMindmap(mindmapData) {
    const container = document.getElementById('mindmap-container');
    
    if (!mindmapData || !mindmapData.children || mindmapData.children.length === 0) {
        container.innerHTML = '<p>无法生成思维导图</p>';
        return;
    }
    
    // 简单的文本格式思维导图
    let html = '<div class="mindmap-text">';
    
    function buildTree(node, depth = 0) {
        if (!node.name) return '';
        
        const indent = '&nbsp;&nbsp;'.repeat(depth * 2);
        let nodeHtml = `<div style="margin-left: ${depth * 20}px; margin-top: 5px;">${indent}• ${node.name}</div>`;
        
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                nodeHtml += buildTree(child, depth + 1);
            });
        }
        
        return nodeHtml;
    }
    
    html += buildTree(mindmapData);
    html += '</div>';
    
    container.innerHTML = html;
}

// 清空输入
function clearInput() {
    document.getElementById('paper-text').value = '';
    document.getElementById('file-input').value = '';
    document.getElementById('file-info').textContent = '';
    document.getElementById('char-count').textContent = '0';
    currentPaperContent = '';
    
    // 隐藏结果区域
    document.getElementById('results-section').style.display = 'none';
}

// 下载结果
function downloadResult() {
    if (!currentInterpretation) {
        alert('没有可下载的内容');
        return;
    }
    
    const content = `
ANSAPRA 论文解读报告
====================

原文摘要:
${document.getElementById('original-content').textContent}

解读内容:
${currentInterpretation.interpretation}

生成时间: ${new Date().toLocaleString()}
用户: ${currentUser?.username || '游客'}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ansapra_interpretation_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 保存到历史记录
async function saveToHistory() {
    if (!currentInterpretation) {
        alert('没有可保存的内容');
        return;
    }
    
    try {
        const response = await fetch('/api/save_to_history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                paper_id: currentInterpretation.paper_id,
                interpretation: currentInterpretation.interpretation
            })
        });
        
        if (response.ok) {
            alert('已保存到历史记录');
        } else {
            alert('保存失败');
        }
    } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败');
    }
}

// 初始化模态框
function initModals() {
    // 底部链接点击事件
    document.querySelectorAll('.footer-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const modalType = e.target.dataset.modal;
            showPolicyModal(modalType);
        });
    });
}

// 显示政策模态框
function showPolicyModal(type) {
    const modalContent = getPolicyContent(type);
    if (!modalContent) return;
    
    const modalTemplate = document.getElementById('modal-template');
    const modalClone = modalTemplate.content.cloneNode(true);
    const modal = modalClone.querySelector('.modal');
    const modalBody = modalClone.querySelector('.modal-body');
    const closeBtn = modalClone.querySelector('.close-modal');
    
    modalBody.innerHTML = modalContent;
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.getElementById('modal-container').appendChild(modal);
}

// 获取政策内容
function getPolicyContent(type) {
    const policies = {
        'contact': `
            <h3>联系我们</h3>
            <p>我们是一个由高中生组成的开发团队。本网站从诞生到优化，都离不开用户的支持。因此，我们非常重视您的反馈。</p>
            <p>如果您有任何关于：</p>
            <ul>
                <li>网站功能建议或错误报告</li>
                <li>隐私政策的疑问</li>
                <li>合作意向</li>
                <li>或其他任何问题</li>
            </ul>
            <p>请通过以下邮箱联系我们：</p>
            <p><strong>1. 1182332400@qq.com</strong></p>
            <p><strong>2. biokoala@outlook.com</strong></p>
            <p>我们会在10个工作日内尽力回复。</p>
        `,
        'copyright': `
            <h3>版权说明</h3>
            <p><strong>ANSAPRA</strong>是一个教育性质的非营利项目。</p>
            <ul>
                <li>本网站的整体设计、用户界面、特定功能代码及原创文本内容受版权保护，版权归 <strong>ANSAPRA开发团队</strong>所有，©2026。</li>
                <li>网站内为辅助阅读而引用的论文标题、摘要、作者、期刊信息等元数据，其版权归原著作权人所有。我们严格遵守学术规范进行引用，旨在为高中生提供研究学习便利。</li>
                <li>任何个人或教育机构可出于非商业性学习目的自由分享网站链接。如需对本网站的设计或内容进行复制、修改或用于其他公开用途，请事先通过 <strong>"联系我们"中的邮箱地址</strong>联系我们，并取得我们的书面许可。</li>
            </ul>
        `,
        'terms': `
            <h3>服务条款</h3>
            <p><strong>生效日期：</strong>2026年1月1日</p>
            <p>欢迎使用 <strong>ANSAPRA</strong>。本平台是一个由高中生团队开发的、旨在帮助同龄人阅读自然科学论文的工具。这是一个由在读高中生发起并主导的CTB（China Thinks Big）竞赛项目。</p>
            
            <h4>1. 服务描述</h4>
            <p>本平台是一个基于自适应学习技术的工具，通过调用DeepSeek人工智能大语言模型官方API，旨在根据高中生的认知框架，个性化推荐和辅助阅读自然科学论文。</p>
            
            <h4>2. 使用规则</h4>
            <ul>
                <li>您必须遵守所有适用的法律和法规。</li>
                <li>您不得利用本平台进行任何干扰服务正常运行或损害他人权益的行为。</li>
                <li>您应对通过您的账户进行的所有活动负责。</li>
            </ul>
            
            <h4>3. 免责声明</h4>
            <ul>
                <li>本平台提供的论文摘要、解读和推荐内容为AI生成内容，<strong>仅作为学习辅助和参考</strong>，不构成专业的学术建议。请您务必批判性思考，并以原文为准。</li>
                <li>我们尽力确保服务稳定，但不对服务的持续性、无中断性或绝对安全性作任何担保。</li>
            </ul>
        `,
        'privacy': `
            <h3>隐私政策</h3>
            <p><strong>最后更新日期：</strong>2025年1月1日</p>
            
            <h4>1. 我们收集的信息</h4>
            <ul>
                <li><strong>您主动提供的信息：</strong>当您注册账户、提交反馈或通过"联系我们"发送邮件时，我们可能会收集您的邮箱地址、用户名以及您自愿提供的其他信息。</li>
                <li><strong>自动收集的信息：</strong>为优化阅读体验，我们可能通过Cookie等技术匿名收集您的设备信息、浏览器类型、访问时间、页面停留时间及阅读偏好。</li>
                <li><strong>问卷调查数据：</strong>在网站设计阶段，我们通过匿名问卷收集了关于高中生自然科学论文阅读偏好的汇总数据，用于功能设计。</li>
            </ul>
            
            <h4>2. 我们如何使用信息</h4>
            <ul>
                <li>为您提供和优化自适应的论文阅读体验。</li>
                <li>通过邮箱回复您的问题或反馈。</li>
                <li>进行匿名的、聚合性的数据分析，以持续改进网站功能。</li>
            </ul>
            
            <h4>3. 信息共享与披露</h4>
            <p>我们<strong>不会</strong>出售、交易或出租您的个人信息给任何第三方。除非法律要求，否则我们不会披露您的个人身份信息。</p>
        `,
        'cookie': `
            <h3>Cookie政策</h3>
            <p>我们使用Cookie（小型文本文件）来提升您的浏览体验。</p>
            
            <h4>用途</h4>
            <ul>
                <li>Cookie用于记住您的语言偏好、登录状态（如果您注册）</li>
                <li>匿名分析网站流量和页面使用情况，以帮助我们了解如何改进网站设计</li>
            </ul>
            
            <h4>控制</h4>
            <p>您可以通过浏览器设置拒绝或管理Cookie。但请注意，禁用某些Cookie可能影响部分网站功能的正常使用。</p>
            
            <h4>第三方Cookie</h4>
            <p>我们目前未使用任何用于跟踪或广告的第三方Cookie。</p>
        `
    };
    
    return policies[type] || '';
}
