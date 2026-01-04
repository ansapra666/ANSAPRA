// 全局变量
let currentUser = null;
let currentSettings = null;

// 初始化函数
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkAuthStatus();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 加载使用说明
    loadInstructions();
    
    // 加载问卷
    loadQuestionnaire();
    
    // 加载设置表单
    loadSettingsForms();
});

// 检查认证状态
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/check_auth');
        const data = await response.json();
        
        if (data.authenticated && data.user) {
            currentUser = data.user;
            currentSettings = data.user;
            
            // 隐藏登录模态框，显示主应用
            document.getElementById('auth-modal').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
            
            // 更新用户名显示
            document.getElementById('username-display').textContent = `欢迎，${data.user.username}`;
            
            // 应用用户设置
            applyUserSettings(data.user);
        } else {
            // 显示登录模态框
            document.getElementById('auth-modal').style.display = 'flex';
        }
    } catch (error) {
        console.error('检查认证状态失败:', error);
        document.getElementById('auth-modal').style.display = 'flex';
    }
}

// 绑定事件监听器
function bindEventListeners() {
    // 登录表单提交
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // 注册表单提交
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // 导航链接点击
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
    
    // 设置标签页点击
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', handleSettingsTabClick);
    });
    
    // 底部链接点击
    document.querySelectorAll('.footer-link').forEach(link => {
        link.addEventListener('click', handleFooterLinkClick);
    });
    
    // 文件输入变化
    document.getElementById('file-input').addEventListener('change', handleFileUpload);
    
    // 论文文本输入
    document.getElementById('paper-text').addEventListener('input', updateCharCount);
    
    // 设置表单输入（实时保存）
    document.querySelectorAll('#settings-page input, #settings-page select').forEach(input => {
        input.addEventListener('change', handleSettingChange);
    });
    
    // 语言切换
    document.querySelectorAll('input[name="language"]').forEach(radio => {
        radio.addEventListener('change', handleLanguageChange);
    });
}

// 处理登录
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('登录成功', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showToast(data.error || '登录失败', 'error');
        }
    } catch (error) {
        showToast('网络错误，请稍后重试', 'error');
        console.error('登录错误:', error);
    }
}

// 处理注册
async function handleRegister(event) {
    event.preventDefault();
    
    // 验证问卷是否完成
    if (!validateQuestionnaire()) {
        showToast('请完成所有必填的问卷项目', 'warning');
        return;
    }
    
    const formData = {
        email: document.getElementById('register-email').value,
        username: document.getElementById('register-username').value,
        password: document.getElementById('register-password').value,
        questionnaire: collectQuestionnaireData()
    };
    
    // 验证密码
    if (formData.password !== document.getElementById('confirm-password').value) {
        showToast('两次输入的密码不一致', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('注册成功', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showToast(data.error || '注册失败', 'error');
        }
    } catch (error) {
        showToast('网络错误，请稍后重试', 'error');
        console.error('注册错误:', error);
    }
}

// 加载问卷
function loadQuestionnaire() {
    const questionnaireSection = document.getElementById('questionnaire');
    
    const questionnaireHTML = `
        <h3>认知框架调查问卷</h3>
        <p class="questionnaire-description">请填写以下问卷，帮助我们了解您的学习背景和偏好。</p>
        
        <!-- 问卷内容将在这里动态生成 -->
        <div id="questionnaire-content"></div>
    `;
    
    questionnaireSection.innerHTML = questionnaireHTML;
    
    // 加载问卷内容
    loadQuestionnaireContent();
}

// 加载问卷内容
function loadQuestionnaireContent() {
    const contentDiv = document.getElementById('questionnaire-content');
    
    // 这里是问卷的具体问题，根据文档中的问卷内容编写
    // 由于篇幅限制，这里只展示部分问题作为示例
    const questions = [
        {
            id: 'grade',
            question: '您所在的年级是？',
            type: 'radio',
            options: [
                { value: 'A', label: '9年级' },
                { value: 'B', label: '10年级' },
                { value: 'C', label: '11年级' },
                { value: 'D', label: '12年级' }
            ],
            required: true
        },
        {
            id: 'education_system',
            question: '您所处的教育体系是？',
            type: 'radio',
            options: [
                { value: 'A', label: '国际体系' },
                { value: 'B', label: '普高体系' }
            ],
            required: true
        },
        // 更多问题...
    ];
    
    let questionsHTML = '';
    
    questions.forEach((q, index) => {
        questionsHTML += `
            <div class="question-item" data-question-id="${q.id}">
                <h4>${index + 1}. ${q.question}</h4>
                <div class="options-group">
                    ${generateOptionsHTML(q)}
                </div>
            </div>
        `;
    });
    
    contentDiv.innerHTML = questionsHTML;
}

function generateOptionsHTML(question) {
    if (question.type === 'radio') {
        return question.options.map(opt => `
            <label class="option-label">
                <input type="radio" name="${question.id}" value="${opt.value}" required="${question.required}">
                <span>${opt.label}</span>
            </label>
        `).join('');
    }
    // 其他类型的处理...
    return '';
}

// 收集问卷数据
function collectQuestionnaireData() {
    const questionnaireData = {};
    const questionItems = document.querySelectorAll('.question-item');
    
    questionItems.forEach(item => {
        const questionId = item.dataset.questionId;
        const inputs = item.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'radio' && input.checked) {
                questionnaireData[questionId] = input.value;
            } else if (input.type === 'checkbox' && input.checked) {
                if (!questionnaireData[questionId]) {
                    questionnaireData[questionId] = [];
                }
                questionnaireData[questionId].push(input.value);
            } else if (input.type !== 'radio' && input.type !== 'checkbox' && input.value) {
                questionnaireData[questionId] = input.value;
            }
        });
    });
    
    return questionnaireData;
}

// 验证问卷
function validateQuestionnaire() {
    const requiredQuestions = document.querySelectorAll('.question-item [required]');
    
    for (const input of requiredQuestions) {
        if (input.type === 'radio') {
            const name = input.name;
            const checked = document.querySelector(`input[name="${name}"]:checked`);
            if (!checked) {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return false;
            }
        } else if (!input.value.trim()) {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
        }
    }
    
    return true;
}

// 导航点击处理
function handleNavClick(event) {
    event.preventDefault();
    
    const target = event.target.closest('.nav-link');
    const pageId = target.dataset.page + '-page';
    
    // 更新导航状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    target.classList.add('active');
    
    // 切换页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// 设置标签页点击
function handleSettingsTabClick(event) {
    const tab = event.target.closest('.settings-tab');
    const tabId = tab.dataset.tab + '-settings';
    
    // 更新标签状态
    document.querySelectorAll('.settings-tab').forEach(t => {
        t.classList.remove('active');
    });
    tab.classList.add('active');
    
    // 切换设置面板
    document.querySelectorAll('.settings-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}

// 加载设置表单
function loadSettingsForms() {
    // 阅读习惯设置
    const readingSettings = document.getElementById('reading-settings');
    
    readingSettings.innerHTML = `
        <form id="reading-settings-form">
            <div class="form-group">
                <label>阅读一篇专业自然科学论文之前，您会在论文所在领域知识方面做什么程度的准备？</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="reading_prep" value="A">
                        <span>A、几乎不做准备</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="reading_prep" value="B">
                        <span>B、做一些准备</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="reading_prep" value="C">
                        <span>C、做较为深入的准备</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>您阅读自然科学论文的原因是？</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="reading_purpose" value="A">
                        <span>A、目标驱动者：为完成特定任务（如作业、比赛）而阅读，追求高效和直接</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="reading_purpose" value="B">
                        <span>B、知识探索者：受学科兴趣驱动，希望拓宽知识面，不急于求成，不追求深入理解</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="reading_purpose" value="C">
                        <span>C、深度学习者：为了深入理解并研究某一领域知识，论文知识之外，同时重视研究方法和应用</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="reading_purpose" value="D">
                        <span>D、科学了解者：希望通过论文解读提升个人科学素养和整体科学感知能力</span>
                    </label>
                </div>
            </div>
            
            <!-- 更多设置项... -->
        </form>
    `;
    
    // 视觉设置
    const visualSettings = document.getElementById('visual-settings');
    
    visualSettings.innerHTML = `
        <form id="visual-settings-form">
            <div class="form-group">
                <label>背景主题</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="theme" value="light-pink">
                        <span>浅粉色</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="theme" value="light-blue">
                        <span>浅蓝色</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="theme" value="light-green">
                        <span>浅绿色</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="theme" value="light-purple">
                        <span>浅紫色</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="theme" value="custom">
                        <span>自定义（支持图片上传）</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group" id="custom-background" style="display: none;">
                <label>上传背景图片</label>
                <input type="file" id="background-image" accept="image/*">
                <button type="button" class="btn btn-small" onclick="uploadBackgroundImage()">上传</button>
            </div>
            
            <div class="form-group">
                <label>字体大小</label>
                <input type="range" id="font-size-slider" min="14" max="24" step="2" value="16">
                <span id="font-size-value">16px</span>
            </div>
            
            <div class="form-group">
                <label>字体家族</label>
                <select id="font-family-select">
                    <option value="Microsoft YaHei">微软雅黑</option>
                    <option value="Noto Serif SC">思源宋体</option>
                    <option value="LXGW WenKai TC">霞鹜文楷 TC</option>
                    <option value="Eczar">Eczar（英文衬线体）</option>
                    <option value="Cabin">Cabin（英文无衬线体）</option>
                    <option value="Arial">Arial（英文字体）</option>
                </select>
            </div>
        </form>
    `;
    
    // 绑定视觉设置事件
    document.getElementById('font-size-slider').addEventListener('input', function() {
        document.getElementById('font-size-value').textContent = this.value + 'px';
        handleSettingChange();
    });
    
    document.getElementById('font-family-select').addEventListener('change', handleSettingChange);
    
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const customBg = document.getElementById('custom-background');
            customBg.style.display = this.value === 'custom' ? 'block' : 'none';
            handleSettingChange();
        });
    });
}

// 应用用户设置
function applyUserSettings(settings) {
    // 应用主题
    document.body.className = '';
    document.body.classList.add(`theme-${settings.theme || 'light-blue'}`);
    
    // 应用字体大小
    document.body.classList.add(`font-${getFontSizeClass(settings.font_size)}`);
    
    // 应用字体家族
    document.body.classList.add(`font-${getFontFamilyClass(settings.font_family)}`);
    
    // 填充设置表单
    if (settings) {
        // 阅读习惯设置
        if (settings.reading_prep) {
            document.querySelector(`input[name="reading_prep"][value="${settings.reading_prep}"]`).checked = true;
        }
        if (settings.reading_purpose) {
            document.querySelector(`input[name="reading_purpose"][value="${settings.reading_purpose}"]`).checked = true;
        }
        // 更多设置...
        
        // 视觉设置
        if (settings.theme) {
            document.querySelector(`input[name="theme"][value="${settings.theme}"]`).checked = true;
        }
        if (settings.font_size) {
            document.getElementById('font-size-slider').value = settings.font_size;
            document.getElementById('font-size-value').textContent = settings.font_size + 'px';
        }
        if (settings.font_family) {
            document.getElementById('font-family-select').value = settings.font_family;
        }
        
        // 语言设置
        if (settings.language) {
            document.querySelector(`input[name="language"][value="${settings.language}"]`).checked = true;
        }
    }
}

function getFontSizeClass(size) {
    if (size <= 14) return 'small';
    if (size <= 16) return 'medium';
    if (size <= 18) return 'large';
    return 'xlarge';
}

function getFontFamilyClass(font) {
    const map = {
        'Microsoft YaHei': 'microsoft-yahei',
        'Noto Serif SC': 'noto-serif',
        'LXGW WenKai TC': 'lxgw-wenkai',
        'Eczar': 'eczar',
        'Cabin': 'cabin',
        'Arial': 'arial'
    };
    return map[font] || 'microsoft-yahei';
}

// 设置变更处理
async function handleSettingChange() {
    const settings = collectSettings();
    
    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentSettings = data.settings;
            applyUserSettings(data.settings);
        }
    } catch (error) {
        console.error('保存设置失败:', error);
    }
}

// 收集设置数据
function collectSettings() {
    const settings = {};
    
    // 阅读习惯
    const readingPrep = document.querySelector('input[name="reading_prep"]:checked');
    if (readingPrep) settings.reading_prep = readingPrep.value;
    
    const readingPurpose = document.querySelector('input[name="reading_purpose"]:checked');
    if (readingPurpose) settings.reading_purpose = readingPurpose.value;
    
    // 视觉设置
    const theme = document.querySelector('input[name="theme"]:checked');
    if (theme) settings.theme = theme.value;
    
    settings.font_size = parseInt(document.getElementById('font-size-slider').value);
    settings.font_family = document.getElementById('font-family-select').value;
    
    // 语言设置
    const language = document.querySelector('input[name="language"]:checked');
    if (language) settings.language = language.value;
    
    return settings;
}

// 文件上传处理
async function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // 检查文件大小
    if (file.size > 16 * 1024 * 1024) {
        showToast('文件大小不能超过16MB', 'error');
        return;
    }
    
    // 显示文件信息
    const fileInfo = document.getElementById('file-info');
    fileInfo.textContent = `已选择：${file.name} (${formatFileSize(file.size)})`;
    
    // 上传文件
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('文件上传成功', 'success');
            
            // 显示原文内容预览
            document.getElementById('original-content').textContent = 
                data.content_preview || '文件内容预览...';
        } else {
            showToast(data.error || '上传失败', 'error');
        }
    } catch (error) {
        showToast('上传失败，请检查网络连接', 'error');
        console.error('上传错误:', error);
    }
}

// 开始解读
async function startInterpretation() {
    const fileInput = document.getElementById('file-input');
    const textInput = document.getElementById('paper-text');
    
    let content = '';
    
    // 获取论文内容
    if (fileInput.files.length > 0) {
        // 已上传文件
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        if (file.type === 'application/pdf') {
            // PDF文件
            content = await extractTextFromPDF(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // DOCX文件
            content = await extractTextFromDOCX(file);
        } else {
            // 文本文件
            content = await file.text();
        }
    } else if (textInput.value.trim()) {
        // 文本输入
        content = textInput.value;
    } else {
        showToast('请上传文件或输入论文内容', 'warning');
        return;
    }
    
    if (!content.trim()) {
        showToast('无法提取论文内容，请重试', 'error');
        return;
    }
    
    // 显示加载状态
    document.getElementById('loading-section').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';
    
    try {
        const response = await fetch('/api/interpret', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 显示结果
            displayInterpretationResults(data);
            showToast('解读生成成功', 'success');
        } else {
            showToast(data.error || '解读失败', 'error');
        }
    } catch (error) {
        showToast('网络错误，请稍后重试', 'error');
        console.error('解读错误:', error);
    } finally {
        document.getElementById('loading-section').style.display = 'none';
    }
}

// 显示解读结果
function displayInterpretationResults(data) {
    const resultsSection = document.getElementById('results-section');
    const interpretationContent = document.getElementById('interpretation-content');
    const recommendationsList = document.getElementById('recommendations-list');
    const mindmapContainer = document.getElementById('mindmap-container');
    
    // 显示解读内容
    interpretationContent.innerHTML = formatInterpretation(data.interpretation);
    
    // 显示推荐论文
    if (data.recommendations && data.recommendations.length > 0) {
        recommendationsList.innerHTML = data.recommendations.map(rec => `
            <div class="recommendation-item">
                <h5>${rec.title || '无标题'}</h5>
                <p>${rec.authors || '未知作者'}</p>
                <p>${rec.journal || ''} ${rec.year || ''}</p>
                <p class="abstract">${rec.abstract || '无摘要'}</p>
                ${rec.url ? `<a href="${rec.url}" target="_blank" rel="noopener">查看原文 →</a>` : ''}
            </div>
        `).join('');
    } else {
        recommendationsList.innerHTML = '<p>论文推送功能受到限制，部分情况下推送失败</p>';
    }
    
    // 显示思维导图
    if (data.mindmap && data.mindmap.nodes) {
        mindmapContainer.innerHTML = renderMindmap(data.mindmap);
    } else {
        mindmapContainer.innerHTML = '<p>思维导图生成失败</p>';
    }
    
    // 显示结果区域
    resultsSection.style.display = 'block';
}

// 格式化解读内容
function formatInterpretation(text) {
    // 简单的Markdown格式转换
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/### (.*?)\n/g, '<h3>$1</h3>')
        .replace(/## (.*?)\n/g, '<h2>$1</h2>')
        .replace(/# (.*?)\n/g, '<h1>$1</h1>')
        .replace(/\n/g, '<br>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
}

// 渲染思维导图
function renderMindmap(mindmap) {
    let html = '<div class="mindmap">';
    
    function renderNode(node, level = 0) {
        const indent = level * 20;
        html += `
            <div class="mindmap-node" style="margin-left: ${indent}px">
                <div class="node-content">${node.label || '节点'}</div>
        `;
        
        if (node.children && node.children.length > 0) {
            html += '<div class="node-children">';
            node.children.forEach(child => renderNode(child, level + 1));
            html += '</div>';
        }
        
        html += '</div>';
    }
    
    mindmap.nodes.forEach(node => renderNode(node));
    html += '</div>';
    
    return html;
}

// 字符计数更新
function updateCharCount() {
    const textarea = document.getElementById('paper-text');
    const charCount = document.getElementById('char-count');
    charCount.textContent = textarea.value.length;
}

// 清空输入
function clearInput() {
    document.getElementById('file-input').value = '';
    document.getElementById('paper-text').value = '';
    document.getElementById('file-info').textContent = '';
    document.getElementById('char-count').textContent = '0';
    document.getElementById('results-section').style.display = 'none';
}

// 游客体验
function enterAsGuest() {
    // 设置游客会话
    currentUser = {
        username: '游客',
        isGuest: true
    };
    
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('username-display').textContent = '游客模式';
    
    showToast('已进入游客模式，部分功能可能受限', 'info');
}

// 登出
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('已退出登录', 'success');
            setTimeout(() => location.reload(), 1000);
        }
    } catch (error) {
        console.error('登出错误:', error);
        location.reload();
    }
}

// 删除账户
async function deleteAccount() {
    if (!confirm('确定要删除账户吗？此操作不可撤销，所有数据将被永久删除。')) {
        return;
    }
    
    try {
        const response = await fetch('/api/account/delete', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('账户已删除', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showToast(data.error || '删除失败', 'error');
        }
    } catch (error) {
        showToast('网络错误，请稍后重试', 'error');
        console.error('删除账户错误:', error);
    }
}

// 底部链接点击
function handleFooterLinkClick(event) {
    event.preventDefault();
    
    const link = event.target.closest('.footer-link');
    const modalType = link.dataset.modal;
    
    showModal(modalType);
}

// 显示模态框
function showModal(modalType) {
    const modalContainer = document.getElementById('modal-container');
    
    const modals = {
        'contact': {
            title: '联系我们',
            content: `
                <p>我们是一个由高中生组成的开发团队。本网站从诞生到优化，都离不开用户的支持。因此，我们非常重视您的反馈。</p>
                <p>如果您有任何关于：</p>
                <ul>
                    <li>网站功能建议或错误报告</li>
                    <li>隐私政策的疑问</li>
                    <li>合作意向</li>
                    <li>或其他任何问题</li>
                </ul>
                <p>请通过以下邮箱联系我们：</p>
                <p><strong>1182332400@qq.com</strong></p>
                <p><strong>biokoala@outlook.com</strong></p>
                <p>我们会在10个工作日内尽力回复。</p>
            `
        },
        'copyright': {
            title: '版权说明',
            content: `
                <p><strong>ANSAPRA</strong>是一个教育性质的非营利项目。</p>
                <ul>
                    <li>本网站的整体设计、用户界面、特定功能代码及原创文本内容受版权保护，版权归 <strong>ANSAPRA开发团队</strong>所有，©2026。</li>
                    <li>网站内为辅助阅读而引用的论文标题、摘要、作者、期刊信息等元数据，其版权归原著作权人所有。我们严格遵守学术规范进行引用，旨在为高中生提供研究学习便利。</li>
                    <li>任何个人或教育机构可出于非商业性学习目的自由分享网站链接。如需对本网站的设计或内容进行复制、修改或用于其他公开用途，请事先通过 <strong>"联系我们"中的邮箱地址</strong>联系我们，并取得我们的书面许可。</li>
                </ul>
            `
        },
        'terms': {
            title: '服务条款',
            content: `
                <p><strong>生效日期：</strong>2026年1月1日</p>
                <p>欢迎使用 <strong>ANSAPRA</strong>。本平台是一个由高中生团队开发的、旨在帮助同龄人阅读自然科学论文的工具。这是一个由在读高中生发起并主导的CTB（China Thinks Big）竞赛项目。</p>
                <p>请在使用前仔细阅读以下条款。</p>
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
                <h4>4. 知识产权</h4>
                <p>网站的设计、Logo、原创内容归<strong>ANSAPRA开发团队</strong>所有。平台内引用的论文摘要、元数据等，其版权归属于原论文作者或出版商，我们按合理使用原则提供以支持教育目的。</p>
                <h4>5. 终止服务</h4>
                <p>我们保留因用户违反本条款或自行决定而暂停或终止服务的权利。</p>
            `
        },
        'privacy': {
            title: '隐私政策',
            content: `
                <p><strong>最后更新日期：</strong>2025年1月1日</p>
                <p><strong>ANSAPRA</strong>（以下简称"我们"或"本平台"）尊重并保护所有用户的隐私。本政策旨在说明我们如何收集、使用、存储和保护您的个人信息，特别是考虑到我们的主要用户群体为高中生。</p>
                <h4>1. 我们收集的信息</h4>
                <ul>
                    <li><strong>您主动提供的信息</strong>：当您注册账户、提交反馈或通过"联系我们"发送邮件时，我们可能会收集您的邮箱地址、用户名以及您自愿提供的其他信息。</li>
                    <li><strong>自动收集的信息</strong>：为优化阅读体验，我们可能通过Cookie等技术匿名收集您的设备信息、浏览器类型、访问时间、页面停留时间及阅读偏好（如论文分类偏好）。这些信息不用于身份识别，仅用于改善服务。</li>
                </ul>
                <h4>2. 我们如何使用信息</h4>
                <ul>
                    <li>为您提供和优化自适应的论文阅读体验。</li>
                    <li>通过邮箱回复您的问题或反馈。</li>
                    <li>进行匿名的、聚合性的数据分析，以持续改进网站功能。</li>
                </ul>
                <h4>3. 信息共享与披露</h4>
                <p>我们<strong>不会</strong>出售、交易或出租您的个人信息给任何第三方。除非法律要求，否则我们不会披露您的个人身份信息。</p>
                <h4>4. 数据安全</h4>
                <p>我们采取合理的技术措施保护数据安全。但由于互联网传输并非绝对安全，我们无法保证信息的绝对安全。</p>
                <h4>5. 您的权利</h4>
                <p>您可以随时在账户设置中查看或更新您提供的个人信息。如需删除账户，请点击按钮并确认删除。</p>
                <h4>6. 关于未成年人</h4>
                <p>我们的服务主要面向高中生。我们鼓励未成年用户在父母或监护人的指导下使用本平台。</p>
                <h4>7. 政策变更</h4>
                <p>我们可能适时更新本政策，更新内容将公布于此页面。</p>
            `
        },
        'cookie': {
            title: 'Cookie政策',
            content: `
                <p>我们使用Cookie（小型文本文件）来提升您的浏览体验。</p>
                <h4>用途</h4>
                <ul>
                    <li>Cookie用于记住您的语言偏好、登录状态（如果您注册），并匿名分析网站流量和页面使用情况，以帮助我们了解如何改进网站设计。</li>
                </ul>
                <h4>控制</h4>
                <ul>
                    <li>您可以通过浏览器设置拒绝或管理Cookie。但请注意，禁用某些Cookie可能影响部分网站功能的正常使用。</li>
                </ul>
                <h4>第三方Cookie</h4>
                <ul>
                    <li>我们目前未使用任何用于跟踪或广告的第三方Cookie。</li>
                </ul>
            `
        }
    };
    
    const modal = modals[modalType];
    if (!modal) return;
    
    modalContainer.innerHTML = `
        <div class="modal active" id="info-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${modal.title}</h2>
                    <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${modal.content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeModal()">关闭</button>
                </div>
            </div>
        </div>
    `;
}

// 关闭模态框
function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = '';
}

// 显示通知
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getToastColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // 自动消失
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

function getToastColor(type) {
    const colors = {
        'success': '#28a745',
        'error': '#dc3545',
        'warning': '#ffc107',
        'info': '#17a2b8'
    };
    return colors[type] || '#17a2b8';
}

// 加载使用说明
function loadInstructions() {
    const instructionsContent = document.querySelector('#instructions-page .page-content');
    
    instructionsContent.innerHTML = `
        <div class="content-section">
            <h3><i class="fas fa-cogs"></i> 技术说明</h3>
            <ul>
                <li><strong>后端框架</strong>：基于Flask、Python、Web框架构建</li>
                <li><strong>前端技术</strong>：HTML5 + CSS3 + JavaScript响应式设计</li>
                <li><strong>文件处理</strong>：集成pdfplumber、python-docx等专业解析库</li>
                <li><strong>API接口</strong>：调用DeepSeek-V1 API，支持前后端分离</li>
            </ul>
        </div>
        
        <div class="content-section">
            <h3><i class="fas fa-list-ol"></i> 使用步骤</h3>
            <h4>1. 阅读产品介绍与使用说明</h4>
            <ul>
                <li><strong>了解功能</strong>：详细阅读首页功能介绍，了解我们的核心开发理念</li>
                <li><strong>观看使用说明</strong>：详细阅读本页使用说明部分，了解网页基本使用方法</li>
            </ul>
            
            <h4>2. 进入 "用户设置"页面，进行参数配置</h4>
            <ul>
                <li><strong>视觉设置</strong>：选择不同颜色的背景主题，调节字体形式与大小</li>
                <li><strong>阅读习惯设置</strong>：对您个人的论文解读的偏好和特质进行个性化设置</li>
                <li><strong>语言设置</strong>：切换网页语言为中文/英文</li>
                <li><strong>账户设置</strong>：退出登录</li>
            </ul>
            
            <h4>3. 进行论文解读</h4>
            <ul>
                <li><strong>上传论文</strong>：支持拖拽上传或文件选择，最大支持16MB文件；pdf、docx文件均可接受</li>
                <li><strong>文本输入</strong>：直接粘贴论文摘要或关键段落</li>
                <li><strong>生成解读</strong>：点击"开始解读"按钮，等待AI生成详细分析</li>
            </ul>
        </div>
        
        <div class="content-section">
            <h3><i class="fas fa-star"></i> 使用小建议</h3>
            <ul>
                <li><strong>协作学习</strong>：邀请同学一起使用，组成学习小组讨论解读结果</li>
                <li><strong>教学辅助</strong>：教师可将我们的解读作为教学材料，帮助学生理解难点</li>
                <li><strong>写作参考</strong>：参考专业学术论文的解读逻辑和表达方式，提升自己的学术写作水平</li>
                <li><strong>知识整理</strong>：将解读结果整理成个人笔记，构建系统化的知识体系</li>
                <li><strong>研究规划</strong>：通过解读多篇相关论文，快速了解研究领域现状</li>
                <li><strong>原文理解</strong>：多注重论文原文内容展示界面，避免依赖AI解读导致论文内容误解</li>
                <li><strong>动手实践</strong>：论文阅读并不是科学学习的全部，科研与动手实践同样重要</li>
            </ul>
        </div>
        
        <div class="content-section">
            <h3><i class="fas fa-info-circle"></i> 温馨提示</h3>
            <p>本服务旨在辅助学术理解，不替代专业学术评审。重要研究决策请结合专家意见。我们持续优化AI模型，欢迎您在使用过程中提供宝贵反馈，共同打造更好的学术辅助工具！</p>
        </div>
    `;
}

// 工具函数：格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 标签页切换
function showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`.tab-btn[onclick="showTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .toast-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 15px;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid var(--border-color);
    }
    
    .modal-header h2 {
        margin: 0;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #666;
    }
    
    .modal-body {
        margin-bottom: 20px;
        max-height: 60vh;
        overflow-y: auto;
    }
    
    .modal-footer {
        text-align: right;
    }
`;
document.head.appendChild(style);
