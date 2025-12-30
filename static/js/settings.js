// 设置页面功能

// 设置标签切换
document.addEventListener('DOMContentLoaded', function() {
    setupSettingsTabs();
    loadSettingsForms();
});

function setupSettingsTabs() {
    const tabButtons = document.querySelectorAll('.settings-tab');
    const tabPanels = document.querySelectorAll('.settings-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // 移除所有active类
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // 激活当前标签
            this.classList.add('active');
            const targetPanel = document.getElementById(`${tabName}-settings`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

function loadSettingsForms() {
    loadReadingSettings();
    loadVisualSettings();
}

function loadReadingSettings() {
    const container = document.getElementById('reading-settings');
    if (!container) return;
    
    container.innerHTML = `
        <form id="reading-settings-form">
            <div class="form-group">
                <label>1. 阅读一篇专业自然科学论文之前，您会在论文所在领域知识方面做什么程度的准备？</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="preparation" value="A">
                        <span>A. 几乎不做准备</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="preparation" value="B">
                        <span>B. 做一些准备</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="preparation" value="C">
                        <span>C. 做较为深入的准备</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>2. 您阅读自然科学论文的原因是？</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="purpose" value="A">
                        <span>A. 目标驱动者: 为完成特定任务（如作业、比赛）而阅读，追求高效和直接</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="purpose" value="B">
                        <span>B. 知识探索者: 受学科兴趣驱动，希望拓宽知识面，不急于求成，不追求深入理解</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="purpose" value="C">
                        <span>C. 深度学习者: 为了深入理解并研究某一领域知识，论文知识之外，同时重视研究方法和应用；希望通过本论文</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="purpose" value="D">
                        <span>D. 科学了解者：希望通过论文解读提升个人科学素养和整体科学感知能力</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>3. 您愿意在多长时间内解读一篇自然科学论文？</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="time" value="A">
                        <span>A. 10分钟内</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="time" value="B">
                        <span>B. 10-30分钟内（默认设置）</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="time" value="C">
                        <span>C. 30分钟及以上</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>4. 您喜好的自然科学论文解读风格与方式是？</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="style" value="A">
                        <span>A. 生动形象，语言偏口语化，能联系生活中最简单的例子和类比解读论文</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="style" value="B">
                        <span>B. 量化解读，尽量通过数据和公式解读论文</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="style" value="C">
                        <span>C. 专业解读，通过较为正式的语言和专业严谨的表达解读论文，对论文内容稍作调整</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="style" value="D">
                        <span>D. 原汁原味，保留原文的表达风格和表述方式，接受长难句、专业术语解读方式</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="style" value="E">
                        <span>E. 逐步推导，通过问题引入的方式，类似于课堂教学的方式逐步介绍知识，强调互动性</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>5. 您喜好的自然科学论文解读深度是？</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="depth" value="A">
                        <span>A. 简洁概括</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="depth" value="B">
                        <span>B. 平衡详细</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="depth" value="C">
                        <span>C. 详细深入</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>6. 您希望读后自测部分包含哪些内容？</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="test_type" value="A">
                        <span>A. 相关定义填空题</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="test_type" value="B">
                        <span>B. 易错易混选择题（默认设置）</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="test_type" value="C">
                        <span>C. 公式逻辑默写题</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>7. 您偏好的图表形式是？（可多选）</label>
                <div class="checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="chart_types" value="A" checked>
                        <span>A. 思维导图（树状）</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="chart_types" value="B">
                        <span>B. 流程图与逻辑图</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="chart_types" value="C">
                        <span>C. 表格</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="chart_types" value="D">
                        <span>D. 统计图（折线图、柱状图等）</span>
                    </label>
                </div>
            </div>
        </form>
    `;
    
    // 加载保存的设置
    loadSavedSettings();
}

function loadVisualSettings() {
    const container = document.getElementById('visual-settings');
    if (!container) return;
    
    container.innerHTML = `
        <form id="visual-settings-form">
            <div class="form-group">
                <label>1. 背景主题</label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="theme" value="A">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #ffe6f2; border-radius: 4px;"></div>
                            <span>粉色</span>
                        </div>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="theme" value="B">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #e6f7ff; border-radius: 4px;"></div>
                            <span>浅蓝色</span>
                        </div>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="theme" value="C">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #e6ffe6; border-radius: 4px;"></div>
                            <span>浅绿色</span>
                        </div>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="theme" value="D">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #f2e6ff; border-radius: 4px;"></div>
                            <span>浅紫色</span>
                        </div>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="theme" value="E">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 4px;"></div>
                            <span>自定义（白色）</span>
                        </div>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>2. 字体设置</label>
                <div class="form-group">
                    <label>字体大小：</label>
                    <input type="range" id="font-size-slider" min="16" max="30" value="18" step="1">
                    <span id="font-size-value">18px</span>
                </div>
                
                <div class="form-group">
                    <label>字体家族：</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="font_family" value="Microsoft YaHei">
                            <span>微软雅黑</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="font_family" value="KaiTi">
                            <span>华文楷体</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="font_family" value="SongTi">
                            <span>华文宋体</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="font_family" value="Roboto">
                            <span>Roboto</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label>自定义背景图片</label>
                <input type="file" id="background-upload" accept="image/*" style="display: none;">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('background-upload').click()">
                    上传背景图片
                </button>
                <p class="help-text">支持JPG、PNG格式，建议尺寸1920x1080</p>
                <div id="background-preview" style="margin-top: 10px;"></div>
            </div>
        </form>
    `;
    
    // 字体大小滑块事件
    const slider = document.getElementById('font-size-slider');
    const valueDisplay = document.getElementById('font-size-value');
    if (slider && valueDisplay) {
        slider.addEventListener('input', function() {
            valueDisplay.textContent = `${this.value}px`;
            document.documentElement.style.fontSize = `${this.value}px`;
        });
    }
    
    // 背景图片上传
    const uploadInput = document.getElementById('background-upload');
    if (uploadInput) {
        uploadInput.addEventListener('change', handleBackgroundUpload);
    }
}

function handleBackgroundUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('background-preview');
        preview.innerHTML = `
            <div style="position: relative; margin-top: 10px;">
                <img src="${e.target.result}" style="max-width: 300px; max-height: 150px; border-radius: 8px;">
                <button type="button" onclick="removeBackground()" style="position: absolute; top: 5px; right: 5px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">×</button>
            </div>
        `;
        
        // 应用背景
        document.body.style.backgroundImage = `url(${e.target.result})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
    };
    
    reader.readAsDataURL(file);
}

function removeBackground() {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = '#f8f9fa';
    const preview = document.getElementById('background-preview');
    if (preview) preview.innerHTML = '';
}

async function loadSavedSettings() {
    try {
        const response = await fetch('/api/user/settings');
        const data = await response.json();
        
        if (data.success && data.settings) {
            applyFormSettings(data.settings);
        }
    } catch (error) {
        console.error('加载设置失败:', error);
    }
}

function applyFormSettings(settings) {
    // 阅读设置
    if (settings.reading) {
        const readingForm = document.getElementById('reading-settings-form');
        if (readingForm) {
            for (const [key, value] of Object.entries(settings.reading)) {
                if (key === 'chart_types') {
                    // 处理多选框
                    const checkboxes = readingForm.querySelectorAll(`input[name="${key}"]`);
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = Array.isArray(value) && value.includes(checkbox.value);
                    });
                } else {
                    // 处理单选框
                    const radio = readingForm.querySelector(`input[name="${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                }
            }
        }
    }
    
    // 视觉设置
    if (settings.visual) {
        const visualForm = document.getElementById('visual-settings-form');
        if (visualForm) {
            for (const [key, value] of Object.entries(settings.visual)) {
                if (key === 'font_size') {
                    const slider = document.getElementById('font-size-slider');
                    const valueDisplay = document.getElementById('font-size-value');
                    if (slider) {
                        slider.value = value;
                        if (valueDisplay) valueDisplay.textContent = `${value}px`;
                        document.documentElement.style.fontSize = `${value}px`;
                    }
                } else {
                    const input = visualForm.querySelector(`input[name="${key}"][value="${value}"]`);
                    if (input) input.checked = true;
                }
            }
        }
    }
    
    // 语言设置
    if (settings.language) {
        const languageRadios = document.querySelectorAll('input[name="language"]');
        languageRadios.forEach(radio => {
            if (radio.value === settings.language) {
                radio.checked = true;
            }
        });
    }
}

async function saveSettings() {
    if (!AppState.user || AppState.user.is_guest) {
        showNotification('游客模式无法保存设置', 'warning');
        return;
    }
    
    // 收集设置数据
    const settings = collectSettings();
    
    try {
        const response = await fetch('/api/user/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ settings })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('设置保存成功！', 'success');
            
            // 应用设置
            applySettings(settings);
        } else {
            showNotification(data.message || '保存失败', 'error');
        }
    } catch (error) {
        console.error('保存设置失败:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 在settings.js中添加问卷修改功能
async function loadQuestionnaireSettings() {
    if (!AppState.user || AppState.user.is_guest) return;
    
    try {
        const response = await fetch('/api/user/settings');
        const data = await response.json();
        
        if (data.success && data.settings) {
            // 检查是否有问卷数据
            const userResponse = await fetch('/api/user/profile');
            const userData = await userResponse.json();
            
            if (userData.success && userData.questionnaire) {
                // 在设置页面显示问卷修改选项
                addQuestionnaireToSettings(userData.questionnaire);
            }
        }
    } catch (error) {
        console.error('加载问卷设置失败:', error);
    }
}

function addQuestionnaireToSettings(questionnaire) {
    const accountSettings = document.getElementById('account-settings');
    if (!accountSettings) return;
    
    const questionnaireSection = document.createElement('div');
    questionnaireSection.className = 'questionnaire-settings';
    questionnaireSection.innerHTML = `
        <h4><i class="fas fa-edit"></i> 修改知识框架问卷</h4>
        <p>您可以重新填写知识框架问卷，更新您的学习画像。</p>
        <button class="btn btn-secondary" onclick="updateQuestionnaire()">
            <i class="fas fa-redo"></i> 重新填写问卷
        </button>
        <div class="current-questionnaire-summary" style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h5>当前问卷摘要：</h5>
            <p>年级：${getGradeText(questionnaire.grade)}</p>
            <p>教育体系：${getSystemText(questionnaire.education_system)}</p>
            <!-- 可以添加更多摘要信息 -->
        </div>
    `;
    
    accountSettings.appendChild(questionnaireSection);
}

function getGradeText(grade) {
    const gradeMap = { A: '9年级', B: '10年级', C: '11年级', D: '12年级' };
    return gradeMap[grade] || '未知';
}

function getSystemText(system) {
    const systemMap = { A: '国际体系', B: '普高体系' };
    return systemMap[system] || '未知';
}

async function updateQuestionnaire() {
    if (!confirm('确定要重新填写知识框架问卷吗？这会影响后续的个性化解读。')) {
        return;
    }
    
    // 显示问卷模态框
    showQuestionnaireModal();
}

function showQuestionnaireModal() {
    const modalHTML = `
        <div class="modal" id="questionnaire-modal">
            <div class="modal-content" style="max-width: 800px; max-height: 90vh;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3><i class="fas fa-clipboard-list"></i> 更新知识框架问卷</h3>
                    <button onclick="closeQuestionnaireModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
                </div>
                <div id="modal-questionnaire-container" style="max-height: 70vh; overflow-y: auto;">
                    加载中...
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <button class="btn btn-primary" onclick="submitUpdatedQuestionnaire()">
                        <i class="fas fa-save"></i> 保存更新
                    </button>
                    <button class="btn btn-secondary" onclick="closeQuestionnaireModal()" style="margin-left: 10px;">
                        取消
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = modalHTML;
    
    // 加载问卷到模态框
    setTimeout(() => {
        loadQuestionnaireToModal();
    }, 100);
}

function loadQuestionnaireToModal() {
    const container = document.getElementById('modal-questionnaire-container');
    if (container) {
        // 这里可以加载与注册时间相同的问卷HTML
        container.innerHTML = document.getElementById('questionnaire').innerHTML;
    }
}

function closeQuestionnaireModal() {
    const modal = document.getElementById('questionnaire-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function submitUpdatedQuestionnaire() {
    // 收集问卷数据
    const questionnaire = collectQuestionnaireData();
    
    try {
        const response = await fetch('/api/user/update-questionnaire', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questionnaire })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('问卷已更新！新的学习画像将应用于后续解读。', 'success');
            closeQuestionnaireModal();
            // 刷新页面或重新加载设置
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            showNotification(data.message || '更新失败', 'error');
        }
    } catch (error) {
        console.error('更新问卷失败:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}
function collectSettings() {
    const settings = {
        reading: {},
        visual: {},
        language: 'zh'
    };
    
    // 收集阅读设置
    const readingForm = document.getElementById('reading-settings-form');
    if (readingForm) {
        const formData = new FormData(readingForm);
        
        // 单选按钮
        settings.reading.preparation = readingForm.querySelector('input[name="preparation"]:checked')?.value || 'B';
        settings.reading.purpose = readingForm.querySelector('input[name="purpose"]:checked')?.value || 'B';
        settings.reading.time = readingForm.querySelector('input[name="time"]:checked')?.value || 'B';
        settings.reading.style = readingForm.querySelector('input[name="style"]:checked')?.value || 'C';
        settings.reading.depth = readingForm.querySelector('input[name="depth"]:checked')?.value || 'B';
        settings.reading.test_type = readingForm.querySelector('input[name="test_type"]:checked')?.value || 'B';
        
        // 多选框
        const chartTypes = [];
        readingForm.querySelectorAll('input[name="chart_types"]:checked').forEach(checkbox => {
            chartTypes.push(checkbox.value);
        });
        settings.reading.chart_types = chartTypes.length > 0 ? chartTypes : ['A'];
    }
    
    // 收集视觉设置
    const visualForm = document.getElementById('visual-settings-form');
    if (visualForm) {
        settings.visual.theme = visualForm.querySelector('input[name="theme"]:checked')?.value || 'B';
        settings.visual.font_size = document.getElementById('font-size-slider')?.value || '18';
        settings.visual.font_family = visualForm.querySelector('input[name="font_family"]:checked')?.value || 'Microsoft YaHei';
        // 背景图片处理需要额外的存储逻辑
    }
    
    // 收集语言设置
    const languageRadio = document.querySelector('input[name="language"]:checked');
    if (languageRadio) {
        settings.language = languageRadio.value;
    }
    
    return settings;
}

function resetSettings() {
    if (confirm('确定要恢复默认设置吗？')) {
        // 加载默认设置
        const defaultSettings = {
            reading: {
                preparation: 'B',
                purpose: 'B',
                time: 'B',
                style: 'C',
                depth: 'B',
                test_type: 'B',
                chart_types: ['A']
            },
            visual: {
                theme: 'B',
                font_size: '18',
                font_family: 'Microsoft YaHei',
                custom_background: null
            },
            language: 'zh'
        };
        
        applyFormSettings(defaultSettings);
        showNotification('已恢复默认设置', 'success');
    }
}

async function deleteAccount() {
    if (!confirm('确定要删除账户吗？此操作不可撤销，将永久删除所有数据。')) {
        return;
    }
    
    try {
        const response = await fetch('/api/delete-account', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('账户已删除', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showNotification(data.message || '删除失败', 'error');
        }
    } catch (error) {
        console.error('删除账户失败:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 暴露函数到全局作用域
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.deleteAccount = deleteAccount;
window.removeBackground = removeBackground;
