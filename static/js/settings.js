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
            
            <!-- 问题10：准备程度 -->
            <div class="form-group">
                <label>
                    <strong>10. 阅读一篇专业自然科学论文之前，您会在论文所在领域知识方面做什么程度的准备？</strong>
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
            
            <!-- 问题11：阅读原因 -->
            <div class="form-group">
                <label>
                    <strong>11. 您阅读自然科学论文的原因是？</strong>
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
            
            <!-- 问题12：阅读时长 -->
            <div class="form-group">
                <label>
                    <strong>12. 您愿意在多长时间内解读一篇自然科学论文？</strong>
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
            
            <!-- 问题13：解读风格 -->
            <div class="form-group">
                <label>
                    <strong>13. 您喜好的自然科学论文解读风格与方式是？</strong>
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
            
            <!-- 问题14：解读深度 -->
            <div class="form-group">
                <label>
                    <strong>14. 您喜好的自然科学论文解读深度是？</strong>
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
            
            <!-- 问题15：读后自测类型（多选） -->
            <div class="form-group">
                <label>
                    <strong>15. 您希望读后自测部分包含哪些内容？（可多选）</strong>
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
            
            <!-- 问题16：图表形式偏好（多选） -->
            <div class="form-group">
                <label>
                    <strong>16. 您偏好的图表形式是？（可多选）</strong>
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
        </div>
    `;
    
    // 加载当前设置
    loadCurrentReadingSettings();
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
