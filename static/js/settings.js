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

// 加载阅读习惯设置表单
function loadReadingSettings() {
    const container = document.getElementById('reading-settings');
    if (!container) return;
    
    container.innerHTML = `
        <div class="settings-group">
            <h4><i class="fas fa-book-reader"></i> 阅读习惯设置</h4>
            <p style="color: #666; margin-bottom: 20px;">根据您的阅读偏好个性化调整论文解读内容</p>
            
            <!-- 问题1：准备程度 -->
            <div class="form-group">
                <label>
                    <strong>1. 阅读一篇专业自然科学论文之前，您会在论文所在领域知识方面做什么程度的准备？</strong>
                </label>
                <div class="radio-group vertical">
                    <label class="radio-label">
                        <input type="radio" name="preparation" value="A">
                        <span>A. 几乎不做准备</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="preparation" value="B" checked>
                        <span>B. 做一些准备</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="preparation" value="C">
                        <span>C. 做较为深入的准备</span>
                    </label>
                </div>
                <p class="setting-hint">提示：准备程度越高，解读时将去除基础术语解释，只解释高难度术语</p>
            </div>
            
            <!-- 问题2：阅读原因 -->
            <div class="form-group">
                <label>
                    <strong>2. 您阅读自然科学论文的原因是？</strong>
                </label>
                <div class="radio-group vertical">
                    <label class="radio-label">
                        <input type="radio" name="purpose" value="A">
                        <span>A. 目标驱动者：为完成特定任务（如作业、比赛）而阅读，追求高效和直接</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="purpose" value="B" checked>
                        <span>B. 知识探索者：受学科兴趣驱动，希望拓宽知识面，不急于求成，不追求深入理解</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="purpose" value="C">
                        <span>C. 深度学习者：为了深入理解并研究某一领域知识，论文知识之外，同时重视研究方法和应用</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="purpose" value="D">
                        <span>D. 科学了解者：希望通过论文解读提升个人科学素养和整体科学感知能力</span>
                    </label>
                </div>
                <p class="setting-hint">提示：系统将根据您的选择调整解读内容的侧重点</p>
            </div>
            
            <!-- 问题3：阅读时长 -->
            <div class="form-group">
                <label>
                    <strong>3. 您愿意在多长时间内解读一篇自然科学论文？</strong>
                </label>
                <div class="radio-group vertical">
                    <label class="radio-label">
                        <input type="radio" name="time" value="A">
                        <span>A. 10分钟内</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="time" value="B" checked>
                        <span>B. 10-30分钟内</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="time" value="C">
                        <span>C. 30分钟及以上</span>
                    </label>
                </div>
                <p class="setting-hint">提示：阅读时长越长，解读内容越详细</p>
            </div>
            
            <!-- 问题4：解读风格 -->
            <div class="form-group">
                <label>
                    <strong>4. 您喜好的自然科学论文解读风格与方式是？</strong>
                </label>
                <div class="radio-group vertical">
                    <label class="radio-label">
                        <input type="radio" name="style" value="A">
                        <span>A. 生动形象，语言偏口语化，能联系生活中最简单的例子和类比解读论文</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="style" value="B">
                        <span>B. 量化解读，尽量通过数据和公式解读论文</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="style" value="C" checked>
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
                <p class="setting-hint">提示：系统将根据您的选择调整解读风格</p>
            </div>
            
            <!-- 问题5：解读深度 -->
            <div class="form-group">
                <label>
                    <strong>5. 您喜好的自然科学论文解读深度是？</strong>
                </label>
                <div class="radio-group vertical">
                    <label class="radio-label">
                        <input type="radio" name="depth" value="A">
                        <span>A. 简洁概括（约1000字概述）</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="depth" value="B" checked>
                        <span>B. 平衡详细（约2000字概述）</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="depth" value="C">
                        <span>C. 详细深入（约3000字概述）</span>
                    </label>
                </div>
                <p class="setting-hint">提示：深度选择将影响论文概述部分的详细程度</p>
            </div>
            
            <!-- 问题6：读后自测类型（多选） -->
            <div class="form-group">
                <label>
                    <strong>6. 您希望读后自测部分包含哪些内容？（可多选）</strong>
                </label>
                <div class="checkbox-group vertical">
                    <label class="checkbox-label">
                        <input type="checkbox" name="test_type" value="A" checked>
                        <span>A. 相关定义填空题</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="test_type" value="B">
                        <span>B. 易错易混选择题</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="test_type" value="C">
                        <span>C. 公式逻辑默写题</span>
                    </label>
                </div>
                <p class="setting-hint">提示：自测小问题将根据您的选择生成相应题型</p>
            </div>
            
            <!-- 问题7：图表形式偏好（多选） -->
            <div class="form-group">
                <label>
                    <strong>7. 您偏好的图表形式是？（可多选）</strong>
                </label>
                <div class="checkbox-group vertical">
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
                <p class="setting-hint">提示：思维导图将根据您的偏好生成相应类型的图表</p>
            </div>
            
            <div class="settings-note" style="background: #e8f4ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h5><i class="fas fa-info-circle"></i> 设置说明</h5>
                <p>这些设置将直接影响AI生成的解读内容：</p>
                <ul style="margin: 10px 0 0 20px;">
                    <li>术语解释的难度和数量</li>
                    <li>解读内容的侧重点和详细程度</li>
                    <li>解读风格和语言表达方式</li>
                    <li>自测小问题的题型</li>
                    <li>思维导图的呈现形式</li>
                </ul>
            </div>

            <!-- 认知框架问卷修改部分 -->
            <div class="questionnaire-update-section" style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee;">
                <h4><i class="fas fa-clipboard-list"></i> 知识框架问卷</h4>
                <p style="color: #666; margin-bottom: 15px;">您可以重新填写知识框架问卷，更新您的学习画像。</p>
                
                <div id="questionnaire-summary" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <p><i class="fas fa-info-circle"></i> 当前问卷摘要加载中...</p>
                </div>
                
                <button class="btn btn-primary" onclick="updateQuestionnaire()">
                    <i class="fas fa-edit"></i> 修改知识框架问卷
                </button>
                
                <p style="font-size: 12px; color: #666; margin-top: 10px;">
                    提示：更新问卷会影响后续的个性化解读效果
                </p>
            </div>
        </div>
    `;
    
    // 加载当前设置
    loadCurrentReadingSettings();
    loadQuestionnaireSummary();
}

// 加载当前阅读习惯设置
function loadCurrentReadingSettings() {
    if (!AppState.user || AppState.user.is_guest) return;
    
    fetch('/api/user/settings')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.settings && data.settings.reading) {
                const settings = data.settings.reading;
                
                // 设置单选按钮
                const radioFields = ['preparation', 'purpose', 'time', 'style', 'depth'];
                radioFields.forEach(field => {
                    const element = document.querySelector(`input[name="${field}"][value="${settings[field]}"]`);
                    if (element) {
                        element.checked = true;
                    }
                });
                
                // 设置复选框（读后自测类型）
                const testTypeCheckboxes = document.querySelectorAll('input[name="test_type"]');
                if (settings.test_type && Array.isArray(settings.test_type)) {
                    testTypeCheckboxes.forEach(checkbox => {
                        checkbox.checked = settings.test_type.includes(checkbox.value);
                    });
                }
                
                // 设置复选框（图表形式）
                const chartTypeCheckboxes = document.querySelectorAll('input[name="chart_types"]');
                if (settings.chart_types && Array.isArray(settings.chart_types)) {
                    chartTypeCheckboxes.forEach(checkbox => {
                        checkbox.checked = settings.chart_types.includes(checkbox.value);
                    });
                }
            }
        })
        .catch(error => {
            console.error('加载阅读习惯设置失败:', error);
        });
}

// 加载问卷摘要
async function loadQuestionnaireSummary() {
    if (!AppState.user || AppState.user.is_guest) return;
    
    try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        
        if (data.success && data.questionnaire) {
            const questionnaire = data.questionnaire;
            const summaryDiv = document.getElementById('questionnaire-summary');
            
            const gradeMap = { A: '9年级', B: '10年级', C: '11年级', D: '12年级' };
            const systemMap = { A: '国际体系', B: '普高体系' };
            const freqMap = { A: '一周1次或更频繁', B: '一个月1-3次', C: '几个月1次' };
            
            const grade = gradeMap[questionnaire.grade] || '未填写';
            const system = systemMap[questionnaire.education_system] || '未填写';
            const frequency = freqMap[questionnaire.learning_frequency] || '未填写';
            
            summaryDiv.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div>
                        <strong>年级：</strong> ${grade}
                    </div>
                    <div>
                        <strong>教育体系：</strong> ${system}
                    </div>
                    <div>
                        <strong>学习频率：</strong> ${frequency}
                    </div>
                </div>
                <p style="margin-top: 10px; font-size: 14px; color: #666;">
                    问卷包含${Object.keys(questionnaire).length}项数据
                </p>
            `;
        }
    } catch (error) {
        console.error('加载问卷摘要失败:', error);
    }
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
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <input type="range" id="font-size-slider" min="14" max="24" value="18" step="1" style="flex: 1;">
                        <span id="font-size-value" style="min-width: 50px; font-weight: bold;">18px</span>
                        <button type="button" class="btn btn-small" onclick="resetFontSize()" style="margin-left: 10px;">
                            <i class="fas fa-undo"></i> 重置
                        </button>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                        <span>小</span>
                        <span>标准</span>
                        <span>大</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>中文字体：</label>
                    <div class="font-family-grid">
                        <label class="font-option">
                            <input type="radio" name="chinese_font" value="'Microsoft YaHei', sans-serif">
                            <div class="font-preview">
                                <div class="font-name">微软雅黑</div>
                                <div class="font-sample" style="font-family: 'Microsoft YaHei', sans-serif;">
                                    这是一段示例文字，展示字体效果。微软雅黑清晰易读。
                                </div>
                                <div class="font-description">开源手写楷体，文艺清新风格</div>
                            </div>
                        </label>
                        <label class="font-option">
                            <input type="radio" name="chinese_font" value="'STKaiti', 'KaiTi', serif">
                            <div class="font-preview">
                                <div class="font-name">华文楷体</div>
                                <div class="font-sample" style="font-family: 'STKaiti', 'KaiTi', serif;">
                                    这是一段示例文字，展示字体效果。华文楷体典雅传统。
                                </div>
                                <div class="font-description">系统标准楷体，古典优雅</div>
                            </div>
                        </label>
                        <label class="font-option">
                            <input type="radio" name="chinese_font" value="'Noto Serif SC', serif">
                            <div class="font-preview">
                                <div class="font-name">思源宋体</div>
                                <div class="font-sample" style="font-family: 'Noto Serif SC', serif;">
                                    这是一段示例文字，展示字体效果。思源宋体端庄清晰。
                                </div>
                                <div class="font-description">谷歌开源宋体，适合正式文档</div>
                            </div>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>英文字体：</label>
                    <div class="font-family-grid">
                        <label class="font-option">
                            <input type="radio" name="english_font" value="'Eczar', serif">
                            <div class="font-preview">
                                <div class="font-name">Eczar (衬线体)</div>
                                <div class="font-sample" style="font-family: 'Eczar', serif;">
                                    This is sample text showing Eczar font. Elegant serif for English.
                                </div>
                                <div class="font-description">优雅的衬线字体，适合学术文本</div>
                            </div>
                        </label>
                        <label class="font-option">
                            <input type="radio" name="english_font" value="'Cabin', sans-serif">
                            <div class="font-preview">
                                <div class="font-name">Cabin (无衬线体)</div>
                                <div class="font-sample" style="font-family: 'Cabin', sans-serif;">
                                    This is sample text showing Cabin font. Modern sans-serif for English.
                                </div>
                                <div class="font-description">现代无衬线字体，适合科技内容</div>
                            </div>
                        </label>
                        <label class="font-option">
                            <input type="radio" name="english_font" value="'Arial', sans-serif">
                            <div class="font-preview">
                                <div class="font-name">Arial (系统默认)</div>
                                <div class="font-sample" style="font-family: 'Arial', sans-serif;">
                                    This is sample text showing Arial font. System default English font.
                                </div>
                                <div class="font-description">系统默认字体，兼容性好</div>
                            </div>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>行高设置：</label>
                    <select id="line-height-select" class="form-control">
                        <option value="1.4">紧凑 (1.4)</option>
                        <option value="1.6" selected>标准 (1.6)</option>
                        <option value="1.8">宽松 (1.8)</option>
                        <option value="2.0">很宽松 (2.0)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>字间距设置：</label>
                    <select id="letter-spacing-select" class="form-control">
                        <option value="-0.5px">紧密 (-0.5px)</option>
                        <option value="0px" selected>标准 (0px)</option>
                        <option value="0.5px">宽松 (0.5px)</option>
                        <option value="1px">很宽松 (1px)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <div class="preview-section">
                        <label>实时预览：</label>
                        <div class="preview-box" id="font-preview-box">
                            <p style="margin: 0; line-height: 1.6;">这是一段预览文字，展示当前字体设置的效果。This is preview text showing the current font settings.</p>
                        </div>
                        <p class="preview-info" id="font-info" style="font-size: 12px; color: #666; margin-top: 8px;"></p>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label>自定义背景图片</label>
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                    <input type="file" id="background-upload" accept="image/*" style="display: none;">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('background-upload').click()">
                        <i class="fas fa-upload"></i> 选择图片
                    </button>
                    <button type="button" class="btn btn-outline-secondary" onclick="removeBackground()" id="remove-bg-btn" style="display: none;">
                        <i class="fas fa-trash"></i> 移除背景
                    </button>
                </div>
                <p class="help-text">支持JPG、PNG格式，建议尺寸1920x1080，文件大小不超过5MB</p>
                <div id="background-preview" style="margin-top: 10px;"></div>
            </div>
            
            <div class="form-group">
                <label>重置所有视觉设置</label>
                <button type="button" class="btn btn-danger" onclick="resetAllVisualSettings()">
                    <i class="fas fa-redo"></i> 重置为默认设置
                </button>
                <p class="warning-text" style="font-size: 12px; color: #dc3545; margin-top: 5px;">
                    注意：这将重置所有视觉设置，包括字体、背景和主题
                </p>
            </div>
        </form>
    `;
    
    // 字体大小滑块事件
    const slider = document.getElementById('font-size-slider');
    const valueDisplay = document.getElementById('font-size-value');
    if (slider && valueDisplay) {
        slider.addEventListener('input', function() {
            valueDisplay.textContent = `${this.value}px`;
            updateFontPreview();
            saveVisualSettings();
        });
    }
    
    // 行高选择事件
    const lineHeightSelect = document.getElementById('line-height-select');
    if (lineHeightSelect) {
        lineHeightSelect.addEventListener('change', function() {
            updateFontPreview();
            saveVisualSettings();
        });
    }
    
    // 字间距选择事件
    const letterSpacingSelect = document.getElementById('letter-spacing-select');
    if (letterSpacingSelect) {
        letterSpacingSelect.addEventListener('change', function() {
            updateFontPreview();
            saveVisualSettings();
        });
    }
    
    // 中文字体选择事件
    const chineseFontRadios = document.querySelectorAll('input[name="chinese_font"]');
    chineseFontRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                updateFontPreview();
                updateFontInfo();
                saveVisualSettings();
            }
        });
    });
    
    // 英文字体选择事件
    const englishFontRadios = document.querySelectorAll('input[name="english_font"]');
    englishFontRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                updateFontPreview();
                updateFontInfo();
                saveVisualSettings();
            }
        });
    });
    
    // 主题选择事件
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                applyTheme(this.value);
                saveVisualSettings();
            }
        });
    });
    
    // 背景图片上传
    const uploadInput = document.getElementById('background-upload');
    if (uploadInput) {
        uploadInput.addEventListener('change', handleBackgroundUpload);
    }
    
    // 加载保存的设置
    loadSavedVisualSettings();
}

// 更新字体预览
function updateFontPreview() {
    const previewBox = document.getElementById('font-preview-box');
    if (!previewBox) return;
    
    // 获取中文字体
    const chineseFont = document.querySelector('input[name="chinese_font"]:checked')?.value || "'Microsoft YaHei', sans-serif";
    
    // 获取英文字体
    const englishFont = document.querySelector('input[name="english_font"]:checked')?.value || "'Eczar', serif";
    
    // 获取字体大小
    const fontSize = document.getElementById('font-size-slider')?.value || "18";
    
    // 获取行高
    const lineHeight = document.getElementById('line-height-select')?.value || "1.6";
    
    // 获取字间距
    const letterSpacing = document.getElementById('letter-spacing-select')?.value || "0px";
    
    // 构建字体堆栈（优先使用中文字体，英文字体作为后备）
    const fontStack = `${chineseFont}, ${englishFont}`;
    
    // 应用预览样式
    previewBox.style.fontFamily = fontStack;
    previewBox.style.fontSize = `${fontSize}px`;
    previewBox.style.lineHeight = lineHeight;
    previewBox.style.letterSpacing = letterSpacing;
    
    // 同时更新整个页面的字体（实时效果）
    document.body.style.fontFamily = fontStack;
    document.body.style.fontSize = `${fontSize}px`;
    document.body.style.lineHeight = lineHeight;
    document.body.style.letterSpacing = letterSpacing;
}

// 更新字体信息
function updateFontInfo() {
    const infoElement = document.getElementById('font-info');
    if (!infoElement) return;
    
    const chineseFont = document.querySelector('input[name="chinese_font"]:checked')?.value;
    const englishFont = document.querySelector('input[name="english_font"]:checked')?.value;
    
    let chineseName = "微软雅黑";
    if (chineseFont?.includes('LXGW WenKai TC')) chineseName = "霞鹜文楷";
    if (chineseFont?.includes('STKaiti')) chineseName = "华文楷体";
    if (chineseFont?.includes('Noto Serif SC')) chineseName = "思源宋体";
    
    let englishName = "Eczar";
    if (englishFont?.includes('Cabin')) englishName = "Cabin";
    if (englishFont?.includes('Arial')) englishName = "Arial";
    
    const fontSize = document.getElementById('font-size-slider')?.value || "18";
    const lineHeight = document.getElementById('line-height-select')?.value || "1.6";
    const letterSpacing = document.getElementById('letter-spacing-select')?.value || "0px";
    
    infoElement.textContent = `当前设置：${chineseName} / ${englishName} | 字号：${fontSize}px | 行高：${lineHeight} | 字间距：${letterSpacing}`;
}

// 应用主题
function applyTheme(theme) {
    const themes = {
        'A': '#ffe6f2', // 粉色
        'B': '#e6f7ff', // 浅蓝色
        'C': '#e6ffe6', // 浅绿色
        'D': '#f2e6ff', // 浅紫色
        'E': '#ffffff'  // 白色
    };
    
    const color = themes[theme] || '#f8f9fa';
    document.body.style.backgroundColor = color;
    
    // 如果有自定义背景，先清除
    document.body.style.backgroundImage = '';
    const preview = document.getElementById('background-preview');
    if (preview) preview.innerHTML = '';
    
    const removeBtn = document.getElementById('remove-bg-btn');
    if (removeBtn) removeBtn.style.display = 'none';
}

// 保存视觉设置
function saveVisualSettings() {
    const settings = collectVisualSettings();
    localStorage.setItem('visualSettings', JSON.stringify(settings));
    
    // 更新用户设置（如果已登录）
    if (AppState.user && !AppState.user.is_guest) {
        updateUserVisualSettings(settings);
    }
}

// 收集视觉设置数据
function collectVisualSettings() {
    const fontFamily = document.querySelector('input[name="font_family"]:checked')?.value || "'Microsoft YaHei', sans-serif";
    const fontSize = document.getElementById('font-size-slider')?.value || "18";
    const lineHeight = document.getElementById('line-height-select')?.value || "1.6";
    const theme = document.querySelector('input[name="theme"]:checked')?.value || "B";
    
    return {
        font_family: fontFamily,
        font_size: fontSize,
        line_height: lineHeight,
        theme: theme
    };
}

// 加载保存的视觉设置
function loadSavedVisualSettings() {
    const savedSettings = localStorage.getItem('visualSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        applyVisualSettings(settings);
    } else if (AppState.user && AppState.user.settings?.visual) {
        applyVisualSettings(AppState.user.settings.visual);
    }
}

// 应用视觉设置
function applyVisualSettings(settings) {
    if (!settings) return;
    
    // 字体大小
    const slider = document.getElementById('font-size-slider');
    const valueDisplay = document.getElementById('font-size-value');
    if (slider && valueDisplay && settings.font_size) {
        slider.value = settings.font_size;
        valueDisplay.textContent = `${settings.font_size}px`;
        document.documentElement.style.fontSize = `${settings.font_size}px`;
    }
    
    // 字体家族
    if (settings.font_family) {
        const fontRadios = document.querySelectorAll('input[name="font_family"]');
        fontRadios.forEach(radio => {
            if (radio.value === settings.font_family) {
                radio.checked = true;
                document.body.style.fontFamily = settings.font_family;
            }
        });
    }
    
    // 行高
    const lineHeightSelect = document.getElementById('line-height-select');
    if (lineHeightSelect && settings.line_height) {
        lineHeightSelect.value = settings.line_height;
        document.body.style.lineHeight = settings.line_height;
    }
    
    // 主题
    if (settings.theme) {
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        themeRadios.forEach(radio => {
            if (radio.value === settings.theme) {
                radio.checked = true;
                applyTheme(settings.theme);
            }
        });
    }
}

// 更新用户设置的视觉部分
async function updateUserVisualSettings(visualSettings) {
    try {
        const response = await fetch('/api/user/settings');
        const data = await response.json();
        
        if (data.success && data.settings) {
            const newSettings = {
                ...data.settings,
                visual: {
                    ...data.settings.visual,
                    ...visualSettings
                }
            };
            
            await fetch('/api/user/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ settings: newSettings })
            });
        }
    } catch (error) {
        console.error('更新视觉设置失败:', error);
    }
}

// 重置字体大小
function resetFontSize() {
    const slider = document.getElementById('font-size-slider');
    const valueDisplay = document.getElementById('font-size-value');
    if (slider && valueDisplay) {
        slider.value = "18";
        valueDisplay.textContent = "18px";
        document.documentElement.style.fontSize = "18px";
        saveVisualSettings();
        showNotification('字体大小已重置为默认值', 'success');
    }
}

// 重置所有视觉设置
function resetAllVisualSettings() {
    if (confirm('确定要重置所有视觉设置吗？这将恢复为默认设置。')) {
        const defaultSettings = {
            font_family: "'Microsoft YaHei', sans-serif",
            font_size: "18",
            line_height: "1.6",
            theme: "B"
        };
        
        applyVisualSettings(defaultSettings);
        localStorage.setItem('visualSettings', JSON.stringify(defaultSettings));
        
        // 清除自定义背景
        removeBackground();
        
        showNotification('视觉设置已重置为默认值', 'success');
    }
}

// 处理背景图片上传
function handleBackgroundUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
        showNotification('图片大小不能超过5MB', 'error');
        return;
    }
    
    // 检查文件类型
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        showNotification('只支持JPG和PNG格式的图片', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('background-preview');
        const removeBtn = document.getElementById('remove-bg-btn');
        
        preview.innerHTML = `
            <div style="position: relative; margin-top: 10px;">
                <img src="${e.target.result}" style="max-width: 300px; max-height: 150px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 5px;">
                    <button type="button" onclick="setAsBackground('${e.target.result}')" style="background: #28a745; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer;">
                        <i class="fas fa-check"></i> 应用
                    </button>
                </div>
            </div>
        `;
        
        if (removeBtn) removeBtn.style.display = 'inline-block';
    };
    
    reader.readAsDataURL(file);
}

// 设置背景图片
function setAsBackground(imageUrl) {
    document.body.style.backgroundImage = `url(${imageUrl})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundPosition = 'center';
    
    // 保存到localStorage
    const visualSettings = JSON.parse(localStorage.getItem('visualSettings') || '{}');
    visualSettings.custom_background = imageUrl;
    localStorage.setItem('visualSettings', JSON.stringify(visualSettings));
    
    showNotification('背景图片已应用', 'success');
}

// 移除背景图片
function removeBackground() {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = '';
    
    // 恢复主题颜色
    const theme = document.querySelector('input[name="theme"]:checked')?.value || 'B';
    applyTheme(theme);
    
    const preview = document.getElementById('background-preview');
    if (preview) preview.innerHTML = '';
    
    const removeBtn = document.getElementById('remove-bg-btn');
    if (removeBtn) removeBtn.style.display = 'none';
    
    // 清除localStorage中的背景设置
    const visualSettings = JSON.parse(localStorage.getItem('visualSettings') || '{}');
    delete visualSettings.custom_background;
    localStorage.setItem('visualSettings', JSON.stringify(visualSettings));
    
    showNotification('背景图片已移除', 'success');
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

// 保存设置
async function saveSettings() {
    if (!AppState.user || AppState.user.is_guest) {
        showNotification('游客模式无法保存设置', 'error');
        return;
    }
    
    try {
        // 收集阅读习惯设置
        const readingSettings = {
            preparation: document.querySelector('input[name="preparation"]:checked')?.value || 'B',
            purpose: document.querySelector('input[name="purpose"]:checked')?.value || 'B',
            time: document.querySelector('input[name="time"]:checked')?.value || 'B',
            style: document.querySelector('input[name="style"]:checked')?.value || 'C',
            depth: document.querySelector('input[name="depth"]:checked')?.value || 'B'
        };
        
        // 收集读后自测类型（多选）
        const testTypeCheckboxes = document.querySelectorAll('input[name="test_type"]:checked');
        readingSettings.test_type = Array.from(testTypeCheckboxes).map(cb => cb.value);
        if (readingSettings.test_type.length === 0) {
            readingSettings.test_type = ['A']; // 默认值
        }
        
        // 收集图表形式偏好（多选）
        const chartTypeCheckboxes = document.querySelectorAll('input[name="chart_types"]:checked');
        readingSettings.chart_types = Array.from(chartTypeCheckboxes).map(cb => cb.value);
        if (readingSettings.chart_types.length === 0) {
            readingSettings.chart_types = ['A']; // 默认值
        }
        
        // 收集视觉设置
        const visualSettings = {
            theme: document.querySelector('input[name="theme"]:checked')?.value || 'B',
            font_size: document.querySelector('input[name="font_size"]')?.value || '16',
            font_family: document.querySelector('select[name="font_family"]')?.value || 'Microsoft YaHei',
            custom_background: document.querySelector('input[name="custom_background"]')?.value || null
        };
        
        // 收集语言设置
        const language = document.querySelector('input[name="language"]:checked')?.value || 'zh';
        
        const settings = {
            reading: readingSettings,
            visual: visualSettings,
            language: language
        };
        
        const response = await fetch('/api/user/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ settings })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('设置保存成功', 'success');
            
            // 应用新设置
            applySettings(settings);
            
            // 显示设置应用效果说明
            showSettingsAppliedNotice(settings.reading);
        } else {
            showNotification(data.message || '保存失败', 'error');
        }
    } catch (error) {
        console.error('保存设置错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 显示设置应用效果说明
function showSettingsAppliedNotice(readingSettings) {
    const notices = [];
    
    // 根据准备程度
    if (readingSettings.preparation === 'C') {
        notices.push('由于您选择了"做较为深入的准备"，解读中将只解释高难度术语');
    } else if (readingSettings.preparation === 'A') {
        notices.push('由于您选择了"几乎不做准备"，解读中将包含基础术语的解释');
    }
    
    // 根据阅读原因
    const purposeNotices = {
        'A': '解读将专注于核心概念和关键知识点',
        'B': '解读将多联系相关知识和实际应用举例',
        'C': '解读将侧重于最前沿技术和详细分析',
        'D': '解读将注重科学素养和感知能力的培养'
    };
    notices.push(purposeNotices[readingSettings.purpose] || '');
    
    // 根据阅读时长
    const timeNotices = {
        'A': '解读内容将简短精炼，适合10分钟内阅读',
        'B': '解读内容长度适中，适合10-30分钟阅读',
        'C': '解读内容详细全面，适合30分钟以上深入阅读'
    };
    notices.push(timeNotices[readingSettings.time] || '');
    
    // 过滤空通知
    const validNotices = notices.filter(notice => notice.trim() !== '');
    
    if (validNotices.length > 0) {
        const noticeText = validNotices.join('；');
        showNotification(`设置已应用：${noticeText}`, 'info');
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
    
    // 检查是否已存在问卷部分
    if (document.querySelector('.questionnaire-settings')) {
        return;
    }
    
    const questionnaireSection = document.createElement('div');
    questionnaireSection.className = 'questionnaire-settings';
    questionnaireSection.innerHTML = `
        <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h4><i class="fas fa-edit"></i> 修改知识框架问卷</h4>
            <p>您可以重新填写知识框架问卷，更新您的学习画像。</p>
            <button class="btn btn-secondary" onclick="showQuestionnaireModal()">
                <i class="fas fa-redo"></i> 重新填写问卷
            </button>
            <div class="current-questionnaire-summary" style="margin-top: 15px; padding: 15px; background: white; border-radius: 5px; border: 1px solid #ddd;">
                <h5>当前问卷摘要：</h5>
                <p>年级：${getGradeText(questionnaire.grade)}</p>
                <p>教育体系：${getSystemText(questionnaire.education_system)}</p>
                <p>学习频率：${getFrequencyText(questionnaire.learning_frequency)}</p>
            </div>
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

// 修改认知框架问卷的完整功能
function showQuestionnaireModal() {
    // 先获取当前用户问卷数据（如果存在）
    const currentQuestionnaire = AppState.user?.questionnaire || {};
    
    const modalHTML = `
    <div class="modal" id="questionnaire-modal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1000;">
        <div class="modal-content" style="background: white; border-radius: 10px; padding: 20px; max-width: 1000px; width: 95%; max-height: 90vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #eee;">
                <h3 style="margin: 0; color: #007bff;">
                    <i class="fas fa-clipboard-list"></i> 修改知识框架问卷
                </h3>
                <button onclick="closeQuestionnaireModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">×</button>
            </div>
            
            <div id="modal-questionnaire-container">
                <!-- 问卷内容将通过JS加载 -->
            </div>
        </div>
    </div>`;
    
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = modalHTML;
    
    // 加载问卷内容
    loadQuestionnaireContent(currentQuestionnaire);
    
    // 显示模态框
    setTimeout(() => {
        document.getElementById('questionnaire-modal').style.display = 'flex';
    }, 10);
}

function closeQuestionnaireModal() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = '';
}

// 加载问卷内容并填充现有数据
function loadQuestionnaireContent(currentData = {}) {
    const container = document.getElementById('modal-questionnaire-container');
    if (!container) return;
    
    // 使用你提供的问卷HTML
    container.innerHTML = `
    <form id="update-questionnaire-form">
        <div class="questionnaire-section" style="max-width: 900px; margin: 0 auto; padding: 20px;">
            <div class="questionnaire-header" style="text-align: center; margin-bottom: 30px;">
                <h3 style="color: #007bff; margin-bottom: 10px;">知识框架调查问卷</h3>
                <p style="color: #666; font-size: 16px;">请填写以下问卷以帮助我们更好地为您提供个性化解读</p>
            </div>
            
            <!-- 第一部分：基本情况 -->
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
                
                <!-- 学科兴趣评分部分 - 这里只显示物理学的示例，其他学科类似 -->
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
                                        <span class="star" data-value="1" data-for="interest_physics">☆</span>
                                        <span class="star" data-value="2" data-for="interest_physics">☆</span>
                                        <span class="star active" data-value="3" data-for="interest_physics">☆</span>
                                        <span class="star" data-value="4" data-for="interest_physics">☆</span>
                                        <span class="star" data-value="5" data-for="interest_physics">☆</span>
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
                                        <span class="star" data-value="1" data-for="interest_biology">☆</span>
                                        <span class="star" data-value="2" data-for="interest_biology">☆</span>
                                        <span class="star active" data-value="3" data-for="interest_biology">☆</span>
                                        <span class="star" data-value="4" data-for="interest_biology">☆</span>
                                        <span class="star" data-value="5" data-for="interest_biology">☆</span>
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
                                        <span class="star" data-value="1" data-for="interest_chemistry">☆</span>
                                        <span class="star" data-value="2" data-for="interest_chemistry">☆</span>
                                        <span class="star active" data-value="3" data-for="interest_chemistry">☆</span>
                                        <span class="star" data-value="4" data-for="interest_chemistry">☆</span>
                                        <span class="star" data-value="5" data-for="interest_chemistry">☆</span>
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
                                        <span class="star" data-value="1" data-for="interest_geology">☆</span>
                                        <span class="star" data-value="2" data-for="interest_geology">☆</span>
                                        <span class="star active" data-value="3" data-for="interest_geology">☆</span>
                                        <span class="star" data-value="4" data-for="interest_geology">☆</span>
                                        <span class="star" data-value="5" data-for="interest_geology">☆</span>
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
                                        <span class="star" data-value="1" data-for="interest_astronomy">☆</span>
                                        <span class="star" data-value="2" data-for="interest_astronomy">☆</span>
                                        <span class="star active" data-value="3" data-for="interest_astronomy">☆</span>
                                        <span class="star" data-value="4" data-for="interest_astronomy">☆</span>
                                        <span class="star" data-value="5" data-for="interest_astronomy">☆</span>
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
            
            <!-- 第二部分：科学感知 -->
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
                                        <span class="star" data-value="1" data-for="learning_style_quantitative">☆</span>
                                        <span class="star" data-value="2" data-for="learning_style_quantitative">☆</span>
                                        <span class="star active" data-value="3" data-for="learning_style_quantitative">☆</span>
                                        <span class="star" data-value="4" data-for="learning_style_quantitative">☆</span>
                                        <span class="star" data-value="5" data-for="learning_style_quantitative">☆</span>
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
                                        <span class="star" data-value="1" data-for="learning_style_textual">☆</span>
                                        <span class="star" data-value="2" data-for="learning_style_textual">☆</span>
                                        <span class="star active" data-value="3" data-for="learning_style_textual">☆</span>
                                        <span class="star" data-value="4" data-for="learning_style_textual">☆</span>
                                        <span class="star" data-value="5" data-for="learning_style_textual">☆</span>
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
                                        <span class="star" data-value="1" data-for="learning_style_visual">☆</span>
                                        <span class="star" data-value="2" data-for="learning_style_visual">☆</span>
                                        <span class="star active" data-value="3" data-for="learning_style_visual">☆</span>
                                        <span class="star" data-value="4" data-for="learning_style_visual">☆</span>
                                        <span class="star" data-value="5" data-for="learning_style_visual">☆</span>
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
                                        <span class="star" data-value="1" data-for="learning_style_interactive">☆</span>
                                        <span class="star" data-value="2" data-for="learning_style_interactive">☆</span>
                                        <span class="star active" data-value="3" data-for="learning_style_interactive">☆</span>
                                        <span class="star" data-value="4" data-for="learning_style_interactive">☆</span>
                                        <span class="star" data-value="5" data-for="learning_style_interactive">☆</span>
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
                                        <span class="star" data-value="1" data-for="learning_style_practical">☆</span>
                                        <span class="star" data-value="2" data-for="learning_style_practical">☆</span>
                                        <span class="star active" data-value="3" data-for="learning_style_practical">☆</span>
                                        <span class="star" data-value="4" data-for="learning_style_practical">☆</span>
                                        <span class="star" data-value="5" data-for="learning_style_practical">☆</span>
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
                                <span class="star" data-value="1" data-for="scientific_thinking">☆</span>
                                <span class="star" data-value="2" data-for="scientific_thinking">☆</span>
                                <span class="star active" data-value="3" data-for="scientific_thinking">☆</span>
                                <span class="star" data-value="4" data-for="scientific_thinking">☆</span>
                                <span class="star" data-value="5" data-for="scientific_thinking">☆</span>
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
                                <span class="star" data-value="1" data-for="scientific_insight">☆</span>
                                <span class="star" data-value="2" data-for="scientific_insight">☆</span>
                                <span class="star active" data-value="3" data-for="scientific_insight">☆</span>
                                <span class="star" data-value="4" data-for="scientific_insight">☆</span>
                                <span class="star" data-value="5" data-for="scientific_insight">☆</span>
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
                                <span class="star" data-value="1" data-for="scientific_sensitivity">☆</span>
                                <span class="star" data-value="2" data-for="scientific_sensitivity">☆</span>
                                <span class="star active" data-value="3" data-for="scientific_sensitivity">☆</span>
                                <span class="star" data-value="4" data-for="scientific_sensitivity">☆</span>
                                <span class="star" data-value="5" data-for="scientific_sensitivity">☆</span>
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
                                <span class="star" data-value="1" data-for="interdisciplinary_ability">☆</span>
                                <span class="star" data-value="2" data-for="interdisciplinary_ability">☆</span>
                                <span class="star active" data-value="3" data-for="interdisciplinary_ability">☆</span>
                                <span class="star" data-value="4" data-for="interdisciplinary_ability">☆</span>
                                <span class="star" data-value="5" data-for="interdisciplinary_ability">☆</span>
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
                                <span class="star" data-value="1" data-for="paper_evaluation_score">☆</span>
                                <span class="star" data-value="2" data-for="paper_evaluation_score">☆</span>
                                <span class="star active" data-value="3" data-for="paper_evaluation_score">☆</span>
                                <span class="star" data-value="4" data-for="paper_evaluation_score">☆</span>
                                <span class="star" data-value="5" data-for="paper_evaluation_score">☆</span>
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
                                <input type="checkbox" name="evaluation_criteria[]" value="A" style="margin-right: 10px;">
                                <span>A. 选段对现象描述的学术语言使用</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="checkbox" name="evaluation_criteria[]" value="B" style="margin-right: 10px;">
                                <span>B. 选段中提及的分析问题、测量用到的科学技术</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="checkbox" name="evaluation_criteria[]" value="C" style="margin-right: 10px;">
                                <span>C. 选段中提及的实验数据</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="checkbox" name="evaluation_criteria[]" value="D" style="margin-right: 10px;">
                                <span>D. 选段中涉及的科学理论（现象和本质）</span>
                            </label>
                        </div>
                        <div class="option-item" style="margin-bottom: 8px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                            <label style="display: block; cursor: pointer; margin: 0;">
                                <input type="checkbox" name="evaluation_criteria[]" value="E" style="margin-right: 10px;">
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
            
            <!-- 提交按钮 -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; text-align: center;">
                <button type="button" class="btn btn-secondary" onclick="closeQuestionnaireModal()" style="margin-right: 15px;">
                    <i class="fas fa-times"></i> 取消
                </button>
                <button type="button" class="btn btn-primary" onclick="submitUpdatedQuestionnaire()">
                    <i class="fas fa-save"></i> 保存更新
                </button>
            </div>
        </div>
    </form>`;
    
    // 填充现有数据
    fillExistingQuestionnaireData(currentData);
    
    // 初始化评分系统
    initQuestionnaireRatingSystem();
}

// 填充现有问卷数据
function fillExistingQuestionnaireData(questionnaireData) {
    if (!questionnaireData || Object.keys(questionnaireData).length === 0) {
        return;
    }
    
    // 填充单选按钮
    Object.keys(questionnaireData).forEach(key => {
        const value = questionnaireData[key];
        
        // 处理单选按钮
        const radioInputs = document.querySelectorAll(`input[name="${key}"][value="${value}"]`);
        radioInputs.forEach(input => {
            input.checked = true;
        });
        
        // 处理滑块
        const sliderInput = document.querySelector(`input[name="${key}"][type="range"]`);
        if (sliderInput) {
            sliderInput.value = value;
            sliderInput.setAttribute('data-rating', value);
            
            // 更新显示
            const ratingValue = sliderInput.closest('.rating-control')?.querySelector('.rating-value');
            if (ratingValue) {
                ratingValue.textContent = value;
                ratingValue.style.fontSize = '24px';
                ratingValue.style.fontWeight = 'bold';
                ratingValue.style.color = '#007bff';
            }
            
            // 更新星星
            const stars = sliderInput.closest('.rating-control')?.querySelectorAll('.rating-stars .star');
            if (stars) {
                stars.forEach(star => {
                    const starValue = star.getAttribute('data-value');
                    if (parseInt(starValue) <= parseInt(value)) {
                        star.textContent = '★';
                        star.style.color = '#ffc107';
                    } else {
                        star.textContent = '☆';
                        star.style.color = '#ccc';
                    }
                });
            }
        }
        
        // 处理复选框（多选题）
        if (key === 'evaluation_criteria' && Array.isArray(value)) {
            value.forEach(criteriaValue => {
                const checkbox = document.querySelector(`input[name="evaluation_criteria[]"][value="${criteriaValue}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    });
}

// 初始化问卷评分系统
function initQuestionnaireRatingSystem() {
    // 为所有评分滑块添加事件监听
    document.querySelectorAll('.rating-slider').forEach(slider => {
        const ratingValue = slider.closest('.rating-control')?.querySelector('.rating-value');
        const stars = slider.closest('.rating-control')?.querySelectorAll('.rating-stars .star');
        
        if (ratingValue && stars) {
            // 滑块变化事件
            slider.addEventListener('input', function() {
                const value = this.value;
                updateQuestionnaireRatingDisplay(this, value);
            });
            
            // 星星点击事件
            stars.forEach(star => {
                star.addEventListener('click', function() {
                    const value = this.getAttribute('data-value');
                    const sliderName = this.getAttribute('data-for');
                    const slider = document.querySelector(`input[name="${sliderName}"]`);
                    if (slider) {
                        slider.value = value;
                        updateQuestionnaireRatingDisplay(slider, value);
                    }
                });
            });
            
            // 初始化显示
            updateQuestionnaireRatingDisplay(slider, slider.value);
        }
    });
}

// 更新问卷评分显示
function updateQuestionnaireRatingDisplay(slider, value) {
    const ratingControl = slider.closest('.rating-control');
    if (!ratingControl) return;
    
    const ratingValue = ratingControl.querySelector('.rating-value');
    const stars = ratingControl.querySelectorAll('.rating-stars .star');
    
    if (ratingValue) {
        ratingValue.textContent = value;
        ratingValue.style.fontSize = '24px';
        ratingValue.style.fontWeight = 'bold';
        ratingValue.style.color = '#007bff';
    }
    
    if (stars) {
        stars.forEach(star => {
            const starValue = star.getAttribute('data-value');
            if (parseInt(starValue) <= parseInt(value)) {
                star.textContent = '★';
                star.style.color = '#ffc107';
            } else {
                star.textContent = '☆';
                star.style.color = '#ccc';
            }
        });
    }
}



// 提交更新的问卷数据
async function submitUpdatedQuestionnaire() {
    try {
        // 收集表单数据
        const form = document.getElementById('update-questionnaire-form');
        const formData = new FormData(form);
        
        // 转换FormData为对象
        const data = {};
        for (let [key, value] of formData.entries()) {
            // 处理复选框数组
            if (key.endsWith('[]')) {
                const cleanKey = key.replace('[]', '');
                if (!data[cleanKey]) {
                    data[cleanKey] = [];
                }
                data[cleanKey].push(value);
            } else {
                data[key] = value;
            }
        }
        
        // 验证必填项
        const requiredFields = [
            'grade', 'education_system', 'interest_physics', 'interest_biology',
            'interest_chemistry', 'interest_geology', 'interest_astronomy',
            'learning_frequency', 'physics_question', 'chemistry_question',
            'biology_question', 'astronomy_question', 'geology_question',
            'learning_style_quantitative', 'learning_style_textual',
            'learning_style_visual', 'learning_style_interactive',
            'learning_style_practical', 'knowledge_structure',
            'scientific_thinking', 'scientific_insight',
            'scientific_sensitivity', 'interdisciplinary_ability',
            'paper_evaluation_score', 'climate_question'
        ];
        
        const missingFields = [];
        requiredFields.forEach(field => {
            if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
                missingFields.push(field);
            }
        });
        
        if (missingFields.length > 0) {
            alert(`请完成以下必填项：${missingFields.join(', ')}`);
            return;
        }
        
        // 显示加载提示
        const submitBtn = document.querySelector('button[onclick="submitUpdatedQuestionnaire()"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
        submitBtn.disabled = true;
        
        // 发送API请求
        const response = await fetch('/api/user/update-questionnaire', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                questionnaire: data
            }),
            credentials: 'include'
        });
        
        const result = await response.json();
        
        // 恢复按钮状态
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (result.success) {
            // 更新本地用户数据
            if (AppState.user) {
                AppState.user.questionnaire = data;
            }
            
            alert('问卷已成功更新！');
            closeQuestionnaireModal();
            
            // 刷新设置页面显示
            if (typeof loadReadingSettings === 'function') {
                loadReadingSettings();
            }
        } else {
            alert(`更新失败：${result.message || '未知错误'}`);
        }
        
    } catch (error) {
        console.error('提交问卷失败:', error);
        
        // 恢复按钮状态
        const submitBtn = document.querySelector('button[onclick="submitUpdatedQuestionnaire()"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> 保存更新';
            submitBtn.disabled = false;
        }
        
        alert('提交问卷时发生网络错误，请检查网络连接后重试。');
    }
}
}

function closeQuestionnaireModal() {
    const modal = document.getElementById('questionnaire-modal');
    if (modal) {
        modal.style.display = 'none';
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

// 添加语言切换功能
function setupLanguageSettings() {
  const languageRadios = document.querySelectorAll('input[name="language"]');
  languageRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.checked) {
        AppState.language = this.value;
        updateLanguage();
        saveLanguageSetting();
      }
    });
  });
}

function applyLanguageChange() {
  const selectedLang = document.querySelector('input[name="language"]:checked').value;
  AppState.language = selectedLang;
  updateLanguage();
  saveLanguageSetting();
  showNotification('语言设置已更新，部分页面可能需要刷新才能完全生效', 'success');
}

async function saveLanguageSetting() {
  if (!AppState.user || AppState.user.is_guest) {
    localStorage.setItem('userLanguage', AppState.language);
    return;
  }
  
  try {
    const response = await fetch('/api/user/settings');
    const data = await response.json();
    
    if (data.success && data.settings) {
      const newSettings = {
        ...data.settings,
        language: AppState.language
      };
      
      await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: newSettings })
      });
    }
  } catch (error) {
    console.error('保存语言设置失败:', error);
    localStorage.setItem('userLanguage', AppState.language);
  }
}

// 在DOMContentLoaded中添加
document.addEventListener('DOMContentLoaded', function() {
  // ... 其他初始化代码 ...
  setupLanguageSettings();
  
  // 加载保存的语言设置
  const savedLang = localStorage.getItem('userLanguage') || 'zh';
  AppState.language = savedLang;
  const langRadio = document.querySelector(`input[name="language"][value="${savedLang}"]`);
  if (langRadio) langRadio.checked = true;
  updateLanguage();
});
// 暴露函数到全局作用域
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.deleteAccount = deleteAccount;
window.removeBackground = removeBackground;
