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
        <form id="reading-settings-form">
        <div class="settings-group">
            <h4></h4>

            
            <!-- 问题：准备程度 -->
            <div class="form-group">
                <label>
                    <strong><span data-i18n="preparation-question"></span></strong>
                </label>
                <div class="radio-group vertical">
                    <label class="radio-label">
                        <input type="radio" name="preparation" value="A">
                        <span data-i18n="preparation-option-A"></span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="preparation" value="B" checked>
                        <span data-i18n="preparation-option-B"></span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="preparation" value="C">
                        <span data-i18n="preparation-option-C"></span>
                    </label>
                </div>
                <p class="setting-hint" data-i18n="preparation-tip"></p>
            </div>
            
            <!-- 问题：阅读原因 -->
            <div class="form-group">
                <label>
                    <strong><span data-i18n="purpose-question"></span></strong>
                </label>
                <div class="radio-group vertical">
                    <label class="radio-label">
                        <input type="radio" name="purpose" value="A">
                        <span data-i18n="purpose-option-A"></span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="purpose" value="B" checked>
                        <span data-i18n="purpose-option-B"></span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="purpose" value="C">
                        <span data-i18n="purpose-option-C"></span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="purpose" value="D">
                        <span data-i18n="purpose-option-D"></span>
                    </label>
                </div>
                <p class="setting-hint" data-i18n="purpose-tip"></p>
            </div>
            
            <!-- 问题：阅读时长 -->
            <div class="form-group">
                <label>
                    <strong><span data-i18n="time-question"></span></strong>
                </label>
                <div class="radio-group vertical">
                    <label class="radio-label">
                        <input type="radio" name="time" value="A">
                        <span data-i18n="time-option-A"></span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="time" value="B" checked>
                        <span data-i18n="time-option-B"></span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="time" value="C">
                        <span data-i18n="time-option-C"></span>
                    </label>
                </div>
                <p class="setting-hint" data-i18n="time-tip"></p>
            </div>
            
            <!-- 问题：解读风格 -->
            <div class="form-group">
                <label>
                    <strong><span data-i18n="style-question"></span></strong>
                </label>
                <div class="radio-group vertical">
                    <label class="radio-label">
                        <input type="radio" name="style" value="A">
                        <span data-i18n="style-option-A"></span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="style" value="B">
                        <span data-i18n="style-option-B"></span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="style" value="C" checked>
                        <span data-i18n="style-option-C"></span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="style" value="D">
                        <span data-i18n="style-option-D"></span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="style" value="E">
                        <span data-i18n="style-option-E"></span>
                    </label>
                </div>
                <p class="setting-hint" data-i18n="style-tip"></p>
            </div>
            
            <!-- 问题：解读深度 -->
            <div class="form-group">
                <label>
                    <strong><span data-i18n="depth-question"></span></strong>
                </label>
                <div class="radio-group vertical">
                    <label class="radio-label">
                        <input type="radio" name="depth" value="A">
                        <span data-i18n="depth-option-A"></span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="depth" value="B" checked>
                        <span data-i18n="depth-option-B"></span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="depth" value="C">
                        <span data-i18n="depth-option-C"></span>
                    </label>
                </div>
                <p class="setting-hint" data-i18n="depth-tip"></p>
            </div>
            
            <!-- 问题：读后自测类型（多选） -->
            <div class="form-group">
                <label>
                    <strong><span data-i18n="test-type-question"></span></strong>
                </label>
                <div class="checkbox-group vertical">
                    <label class="checkbox-label">
                        <input type="checkbox" name="test_type" value="A" checked>
                        <span data-i18n="test-type-option-A"></span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="test_type" value="B">
                        <span data-i18n="test-type-option-B"></span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="test_type" value="C">
                        <span data-i18n="test-type-option-C"></span>
                    </label>
                </div>
                <p class="setting-hint" data-i18n="test-type-tip"></p>
            </div>
            
            <!-- 问题：图表形式偏好（多选） -->
            <div class="form-group">
                <label>
                    <strong><span data-i18n="chart-type-question"></span></strong>
                </label>
                <div class="checkbox-group vertical">
                    <label class="checkbox-label">
                        <input type="checkbox" name="chart_types" value="A" checked>
                        <span data-i18n="chart-type-option-A"></span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="chart_types" value="B">
                        <span data-i18n="chart-type-option-B"></span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="chart_types" value="C">
                        <span data-i18n="chart-type-option-C"></span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="chart_types" value="D">
                        <span data-i18n="chart-type-option-D"></span>
                    </label>
                </div>
                <p class="setting-hint" data-i18n="chart-type-tip"></p>
            </div>
            
            <div class="settings-note" style="background: #e8f4ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h5><i class="fas fa-info-circle"></i> <span data-i18n="settings-description">Settings Description</span></h5>
                <p data-i18n="settings-impact">These settings will directly affect the AI-generated interpretation content:</p>
                <ul style="margin: 10px 0 0 20px;">
                    <li data-i18n="setting-term-explanation">Difficulty and number of terminology explanations</li>
                    <li data-i18n="setting-focus-detail">Focus and level of detail of the interpretation</li>
                    <li data-i18n="setting-style-expression">Interpretation style and language expression</li>
                    <li data-i18n="setting-test-types">Types of self-test questions</li>
                    <li data-i18n="setting-mindmap-format">Presentation format of mind maps</li>
                </ul>
            </div>
        </div>
        </form>
    `;
    
    // 加载当前设置
    loadCurrentReadingSettings();
}

// 加载当前阅读习惯设置
function loadCurrentReadingSettings() {
    // 检查AppState是否存在
    if (!window.AppState || !window.AppState.user || window.AppState.user.is_guest) return;
    
    fetch('/api/user/settings')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.settings && data.settings.reading) {
                const settings = data.settings.reading;
                console.log('加载的阅读设置:', settings);
                
                // 设置单选按钮
                const radioFields = ['preparation', 'purpose', 'time', 'style', 'depth'];
                radioFields.forEach(field => {
                    const element = document.querySelector(`input[name="${field}"][value="${settings[field]}"]`);
                    if (element) {
                        element.checked = true;
                        console.log(`设置单选按钮 ${field} 为 ${settings[field]}`);
                    } else {
                        console.warn(`未找到单选按钮 ${field} 为 ${settings[field]}`);
                    }
                });
                
                // 设置复选框（读后自测类型）
                const testTypeCheckboxes = document.querySelectorAll('input[name="test_type"]');
                if (settings.test_type && Array.isArray(settings.test_type)) {
                    testTypeCheckboxes.forEach(checkbox => {
                        checkbox.checked = settings.test_type.includes(checkbox.value);
                        console.log(`设置复选框 test_type ${checkbox.value} 为 ${settings.test_type.includes(checkbox.value)}`);
                    });
                }
                
                // 设置复选框（图表形式）
                const chartTypeCheckboxes = document.querySelectorAll('input[name="chart_types"]');
                if (settings.chart_types && Array.isArray(settings.chart_types)) {
                    chartTypeCheckboxes.forEach(checkbox => {
                        checkbox.checked = settings.chart_types.includes(checkbox.value);
                        console.log(`设置复选框 chart_types ${checkbox.value} 为 ${settings.chart_types.includes(checkbox.value)}`);
                    });
                }
            } else {
                console.warn('未找到阅读设置数据:', data);
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
                <label><span data-i18n="background-themes">1. Background Themes</span></label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="theme" value="A">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #f8f0f6; border-radius: 4px;"></div>
                            <span data-i18n="soft-pink">Soft Pink</span>
                        </div>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="theme" value="B">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #f0f7ff; border-radius: 4px;"></div>
                            <span data-i18n="tech-blue">Tech Blue</span>
                        </div>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="theme" value="C">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #f0f9f0; border-radius: 4px;"></div>
                            <span data-i18n="fresh-green">Fresh Green</span>
                        </div>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="theme" value="D">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #f3f0f9; border-radius: 4px;"></div>
                            <span data-i18n="elegant-purple">Elegant Purple</span>
                        </div>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="theme" value="E">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px;"></div>
                            <span data-i18n="minimal-white">Minimal White</span>
                        </div>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label><span data-i18n="text-colors">2. Text Colors</span></label>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="text_color" value="dark_pink">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #a67c91; border-radius: 4px;"></div>
                            <span data-i18n="dark-pink">Dark Pink</span>
                        </div>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="text_color" value="dark_blue">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #7c91a6; border-radius: 4px;"></div>
                            <span data-i18n="dark-blue">Dark Blue</span>
                        </div>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="text_color" value="dark_green">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #7ca67c; border-radius: 4px;"></div>
                            <span data-i18n="dark-green">Dark Green</span>
                        </div>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="text_color" value="dark_purple" checked>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #917ca6; border-radius: 4px;"></div>
                            <span data-i18n="dark-purple">Dark Purple</span>
                        </div>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="text_color" value="dark_gray">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 20px; height: 20px; background-color: #000000; border-radius: 4px;"></div>
                            <span data-i18n="black">Black</span>
                        </div>
                    </label>
                </div>
                <p class="setting-hint" style="font-size: 12px; color: #666; margin-top: 5px;"><span data-i18n="choose-dark-text-color">Choose a dark text color that matches the theme to ensure good readability.</span></p>
            </div>
            
            <div class="form-group">
                <label><span data-i18n="font-settings">3. Font Settings</span></label>
                <div class="form-group">
                    <label><span data-i18n="font-size">Font Size:</span></label>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <input type="range" id="font-size-slider" min="14" max="24" value="18" step="1" style="flex: 1;">
                        <span id="font-size-value" style="min-width: 50px; font-weight: bold;">18px</span>
                        <button type="button" class="btn btn-small" onclick="resetFontSize()" style="margin-left: 10px;">
                            <i class="fas fa-undo"></i> <span data-i18n="reset">Reset</span>
                        </button>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                        <span data-i18n="small">Small</span>
                        <span data-i18n="standard">Standard</span>
                        <span data-i18n="large">Large</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label><span data-i18n="chinese-fonts">Chinese Fonts:</span></label>
                    <div class="font-family-grid">
                        <label class="font-option">
                            <input type="radio" name="chinese_font" value="'Microsoft YaHei', sans-serif">
                            <div class="font-preview">
                                <div class="font-name" data-i18n="microsoft-yahei">Microsoft YaHei</div>
                                <div class="font-sample" style="font-family: 'Microsoft YaHei', sans-serif;">
                                    <span data-i18n="chinese-font-sample">这是一段示例文字，展示字体效果。Microsoft YaHei is clear and easy to read.</span>
                                </div>
                                <div class="font-description" data-i18n="microsoft-yahei-desc">Open-source Handwritten KaiTi, artistic and fresh style</div>
                            </div>
                        </label>
                        <label class="font-option">
                            <input type="radio" name="chinese_font" value="'STKaiti', 'KaiTi', serif">
                            <div class="font-preview">
                                <div class="font-name" data-i18n="stkaiti">STKaiti</div>
                                <div class="font-sample" style="font-family: 'STKaiti', 'KaiTi', serif;">
                                    <span data-i18n="chinese-font-sample-2">这是一段示例文字，展示字体效果。STKaiti is elegant and traditional.</span>
                                </div>
                                <div class="font-description" data-i18n="stkaiti-desc">System standard KaiTi, classical and graceful</div>
                            </div>
                        </label>
                        <label class="font-option">
                            <input type="radio" name="chinese_font" value="'Noto Serif SC', serif">
                            <div class="font-preview">
                                <div class="font-name" data-i18n="source-han-serif">Source Han Serif</div>
                                <div class="font-sample" style="font-family: 'Noto Serif SC', serif;">
                                    <span data-i18n="chinese-font-sample-3">这是一段示例文字，展示字体效果。Source Han Serif is dignified and clear.</span>
                                </div>
                                <div class="font-description" data-i18n="source-han-serif-desc">Google open-source serif, suitable for formal documents</div>
                            </div>
                        </label>
                    </div>
                </div>
                

                
                <div class="form-group">
                    <label><span data-i18n="line-height">Line Height:</span></label>
                    <select id="line-height-select" class="form-control">
                        <option value="1.4" data-i18n="compact">Compact (1.4)</option>
                        <option value="1.6" selected data-i18n="standard-line-height">Standard (1.6)</option>
                        <option value="1.8" data-i18n="loose">Loose (1.8)</option>
                        <option value="2.0" data-i18n="very-loose">Very Loose (2.0)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label><span data-i18n="letter-spacing">Letter Spacing:</span></label>
                    <select id="letter-spacing-select" class="form-control">
                        <option value="-0.5px" data-i18n="tight">Tight (-0.5px)</option>
                        <option value="0px" selected data-i18n="standard-letter-spacing">Standard (0px)</option>
                        <option value="0.5px" data-i18n="loose-spacing">Loose (0.5px)</option>
                        <option value="1px" data-i18n="very-loose-spacing">Very Loose (1px)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <div class="preview-section">
                        <label><span data-i18n="live-preview">Live Preview:</span></label>
                        <div class="preview-box" id="font-preview-box">
                            <p style="margin: 0; line-height: 1.6;"><span data-i18n="preview-text">This is preview text showing the current font settings.</span></p>
                        </div>
                        <p class="preview-info" id="font-info" style="font-size: 12px; color: #666; margin-top: 8px;"></p>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label><span data-i18n="custom-background-image">Custom Background Image</span></label>
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                    <input type="file" id="background-upload" accept="image/*" style="display: none;">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('background-upload').click()">
                        <i class="fas fa-upload"></i> <span data-i18n="select-image">Select Image</span>
                    </button>
                    <button type="button" class="btn btn-outline-secondary" onclick="removeBackground()" id="remove-bg-btn" style="display: none;">
                        <i class="fas fa-trash"></i> <span data-i18n="remove-background">Remove Background</span>
                    </button>
                </div>
                <p class="help-text" data-i18n="background-image-support">Supports JPG, PNG formats, recommended size 1920x1080, file size not exceeding 5MB</p>
                <div id="background-preview" style="margin-top: 10px;"></div>
            </div>
            
            <div class="form-group">
                <label><span data-i18n="reset-all-visual-settings">Reset All Visual Settings</span></label>
                <button type="button" class="btn btn-danger" onclick="resetAllVisualSettings()">
                    <i class="fas fa-redo"></i> <span data-i18n="reset-to-default">Reset to Default Settings</span>
                </button>
                <p class="warning-text" style="font-size: 12px; color: #dc3545; margin-top: 5px;" data-i18n="reset-warning">
                    Note: This will reset all visual settings, including fonts, background, and themes
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
    

    
    // 文字颜色选择事件
    const textColorRadios = document.querySelectorAll('input[name="text_color"]');
    textColorRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                updateFontPreview();
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
    
    // 延迟加载保存的设置，确保表单控件已经完全创建
    setTimeout(() => {
        loadSavedVisualSettings();
    }, 100);
}

// 更新字体预览
function updateFontPreview() {
    const previewBox = document.getElementById('font-preview-box');
    if (!previewBox) return;
    
    // 获取中文字体
    const chineseFont = document.querySelector('input[name="chinese_font"]:checked')?.value || "'Microsoft YaHei', sans-serif";
    
    // 获取字体大小
    const fontSize = document.getElementById('font-size-slider')?.value || "18";
    
    // 计算实际应用的字体大小（华文楷体大2px）
    let actualFontSize = parseInt(fontSize);
    if (chineseFont.includes('STKaiti') || chineseFont.includes('KaiTi')) {
        actualFontSize += 2;
    }
    
    // 获取行高
    const lineHeight = document.getElementById('line-height-select')?.value || "1.6";
    
    // 获取字间距
    const letterSpacing = document.getElementById('letter-spacing-select')?.value || "0px";
    
    // 获取文字颜色
    const textColor = document.querySelector('input[name="text_color"]:checked')?.value || "dark_purple";
    
    // 文字颜色映射
    const textColors = {
        dark_pink: '#8a5c73',  // 深粉色（更深）
        dark_blue: '#5c738a',  // 深蓝色（更深）
        dark_green: '#5c8a5c', // 深绿色（更深）
        dark_purple: '#735c8a', // 深紫色（更深）
        dark_gray: '#000000'   // 黑色（替换深灰色）
    };
    
    const selectedColor = textColors[textColor] || textColors.dark_purple;
    
    // 应用预览样式
    previewBox.style.fontFamily = chineseFont;
    previewBox.style.fontSize = `${actualFontSize}px`;
    previewBox.style.lineHeight = lineHeight;
    previewBox.style.letterSpacing = letterSpacing;
    previewBox.style.color = selectedColor;
    
    // 同时更新整个页面的字体（实时效果）
    document.body.style.fontFamily = chineseFont;
    document.body.style.fontSize = `${actualFontSize}px`;
    document.body.style.lineHeight = lineHeight;
    document.body.style.letterSpacing = letterSpacing;
    
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

// 更新字体信息
function updateFontInfo() {
    const infoElement = document.getElementById('font-info');
    if (!infoElement) return;
    
    const chineseFont = document.querySelector('input[name="chinese_font"]:checked')?.value;
    
    let chineseName = "微软雅黑";
    if (chineseFont?.includes('LXGW WenKai TC')) chineseName = "霞鹜文楷";
    if (chineseFont?.includes('STKaiti')) chineseName = "华文楷体";
    if (chineseFont?.includes('Noto Serif SC')) chineseName = "思源宋体";
    
    const fontSize = document.getElementById('font-size-slider')?.value || "18";
    const lineHeight = document.getElementById('line-height-select')?.value || "1.6";
    const letterSpacing = document.getElementById('letter-spacing-select')?.value || "0px";
    
    infoElement.textContent = `当前设置：${chineseName} | 字号：${fontSize}px | 行高：${lineHeight} | 字间距：${letterSpacing}`;
}

// 应用主题
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
    
    // 如果有自定义背景，先清除
    document.body.style.backgroundImage = '';
    const preview = document.getElementById('background-preview');
    if (preview) preview.innerHTML = '';
    
    const removeBtn = document.getElementById('remove-bg-btn');
    if (removeBtn) removeBtn.style.display = 'none';
    
    // 应用用户选择的文字颜色，确保文字颜色不随主题变化
    updateFontPreview();
}

// 保存视觉设置
function saveVisualSettings() {
    const settings = collectVisualSettings();
    localStorage.setItem('visualSettings', JSON.stringify(settings));
    
    // 更新用户设置（如果已登录）
    if (window.AppState && window.AppState.user && !window.AppState.user.is_guest) {
        updateUserVisualSettings(settings);
    }
    
    // 显示保存成功通知
    const message = window.languageManager ? window.languageManager.translate('settings.updated') : '设置保存成功';
    showNotification(message, 'success');
}

// 收集视觉设置数据
function collectVisualSettings() {
    const chineseFont = document.querySelector('input[name="chinese_font"]:checked')?.value || "'Microsoft YaHei', sans-serif";
    const fontSize = document.getElementById('font-size-slider')?.value || "18";
    const lineHeight = document.getElementById('line-height-select')?.value || "1.6";
    const letterSpacing = document.getElementById('letter-spacing-select')?.value || "0px";
    const theme = document.querySelector('input[name="theme"]:checked')?.value || "B";
    const textColor = document.querySelector('input[name="text_color"]:checked')?.value || "dark_purple";
    
    return {
        chinese_font: chineseFont,
        font_size: fontSize,
        line_height: lineHeight,
        letter_spacing: letterSpacing,
        theme: theme,
        text_color: textColor
    };
}

// 加载保存的视觉设置
function loadSavedVisualSettings() {
    const savedSettings = localStorage.getItem('visualSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        applyVisualSettings(settings);
    } else if (window.AppState && window.AppState.user && window.AppState.user.settings?.visual) {
        applyVisualSettings(window.AppState.user.settings.visual);
    }
    
    // 立即应用字体大小设置
    const fontSize = document.getElementById('font-size-slider')?.value || '18';
    const chineseFont = document.querySelector('input[name="chinese_font"]:checked')?.value || "'Microsoft YaHei', sans-serif";
    
    // 计算实际应用的字体大小（华文楷体大2px）
    let actualFontSize = parseInt(fontSize);
    if (chineseFont.includes('STKaiti') || chineseFont.includes('KaiTi')) {
        actualFontSize += 2;
    }
    
    document.body.style.fontSize = `${actualFontSize}px`;
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
    }
    
    // 中文字体
    if (settings.chinese_font) {
        const chineseFontRadios = document.querySelectorAll('input[name="chinese_font"]');
        chineseFontRadios.forEach(radio => {
            if (radio.value === settings.chinese_font) {
                radio.checked = true;
            }
        });
    }
    

    
    // 行高
    const lineHeightSelect = document.getElementById('line-height-select');
    if (lineHeightSelect && settings.line_height) {
        lineHeightSelect.value = settings.line_height;
    }
    
    // 字间距
    const letterSpacingSelect = document.getElementById('letter-spacing-select');
    if (letterSpacingSelect && settings.letter_spacing) {
        letterSpacingSelect.value = settings.letter_spacing;
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
    
    // 文字颜色
    if (settings.text_color) {
        const textColorRadios = document.querySelectorAll('input[name="text_color"]');
        textColorRadios.forEach(radio => {
            if (radio.value === settings.text_color) {
                radio.checked = true;
            }
        });
    }
    
    // 应用自定义背景
    if (settings.custom_background) {
        document.body.style.backgroundImage = `url(${settings.custom_background})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundPosition = 'center';
    }
    
    // 更新字体预览和应用
    updateFontPreview();
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
            chinese_font: "'Microsoft YaHei', sans-serif",
            font_size: "18",
            line_height: "1.6",
            letter_spacing: "0px",
            theme: "E", // 白色背景
            text_color: "dark_gray" // 黑色文字
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
            font_size: document.getElementById('font-size-slider')?.value || '18',
            chinese_font: document.querySelector('input[name="chinese_font"]:checked')?.value || "'Microsoft YaHei', sans-serif",
            line_height: document.getElementById('line-height-select')?.value || '1.6',
            letter_spacing: document.getElementById('letter-spacing-select')?.value || '0px',
            text_color: document.querySelector('input[name="text_color"]:checked')?.value || 'dark_purple',
            custom_background: JSON.parse(localStorage.getItem('visualSettings') || '{}').custom_background || null
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
            const message = window.languageManager ? window.languageManager.translate('settings.updated') : '设置保存成功';
            showNotification(message, 'success');
            
            // 保存到本地存储
            localStorage.setItem('userSettings', JSON.stringify(settings));
            
            // 应用新设置
            applySettings(settings);
            
            // 直接更新表单元素，确保显示最新保存的选项
            updateFormElementsWithSavedSettings(settings);
            
            // 显示设置应用效果说明
            showSettingsAppliedNotice(settings.reading);
        } else {
            // 即使服务器保存失败，也保存到本地存储
            localStorage.setItem('userSettings', JSON.stringify(settings));
            showNotification('设置已保存到本地', 'info');
        }
    } catch (error) {
        console.error('保存设置错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 显示设置应用效果说明
function showSettingsAppliedNotice(readingSettings) {
    // 不再显示冗长的提示，使用统一的设置保存提示
    const message = window.languageManager ? window.languageManager.translate('settings.updated') : '设置已更新';
    showNotification(message, 'info');
}

// 在settings.js中添加问卷修改功能
async function loadQuestionnaireSettings() {
    if (!window.AppState || !window.AppState.user || window.AppState.user.is_guest) return;
    
    try {
        const response = await fetch('/api/user/settings');
        const data = await response.json();
        
        if (data.success && data.settings) {
            // 检查是否有问卷数据
            const userResponse = await fetch('/api/user/questionnaire');
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
    `;
    
    accountSettings.appendChild(questionnaireSection);
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
            <div class="modal-content" style="max-width: 95vw; max-height: 95vh; padding: 10px;">
                <button onclick="closeQuestionnaireModal()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-color, #333); transition: color 0.3s ease; z-index: 10;">&times;</button>
                <div id="modal-questionnaire-container" style="height: 90vh; overflow-y: auto;">
                    加载中...
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
        // 使用main.js中已经定义的loadFullQuestionnaire函数来加载问卷
        loadFullQuestionnaire(container);
        
        // 修改保存按钮的行为，使其调用submitUpdatedQuestionnaire函数
        setTimeout(() => {
            const saveButton = container.querySelector('.questionnaire-buttons .btn-primary');
            if (saveButton) {
                saveButton.onclick = submitUpdatedQuestionnaire;
                saveButton.innerHTML = '<i class="fas fa-save"></i> Save Questionnaire';
            }
            
            // 修改取消按钮的行为，使其调用closeQuestionnaireModal函数
            const cancelButton = container.querySelector('.questionnaire-buttons .btn-secondary');
            if (cancelButton) {
                cancelButton.onclick = closeQuestionnaireModal;
            }
        }, 500);
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
    
    // 验证问卷数据
    if (!validateQuestionnaire(questionnaire)) {
        showNotification('问卷填写不完整，请完成所有必填项', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/user/questionnaire', {
            method: 'PUT',
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
  const message = window.languageManager ? window.languageManager.translate('settings.updated') : '语言设置已更新';
  showNotification(message, 'success');
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
  const savedLang = localStorage.getItem('language') || 'zh';
  // 使用languageManager来管理语言设置
  if (window.languageManager) {
      window.languageManager.applyLanguage(savedLang);
  } else {
      // 后备方案
      const langRadio = document.querySelector(`input[name="language"][value="${savedLang}"]`);
      if (langRadio) langRadio.checked = true;
  }
});
// 直接更新表单元素，确保显示最新保存的设置
function updateFormElementsWithSavedSettings(settings) {
    if (!settings) return;
    
    // 更新阅读习惯设置
    if (settings.reading) {
        const readingForm = document.getElementById('reading-settings-form');
        if (readingForm) {
            // 更新单选按钮
            const radioFields = ['preparation', 'purpose', 'time', 'style', 'depth'];
            radioFields.forEach(field => {
                const value = settings.reading[field];
                if (value) {
                    const radio = readingForm.querySelector(`input[name="${field}"][value="${value}"]`);
                    if (radio) {
                        radio.checked = true;
                        console.log(`更新单选按钮 ${field} 为 ${value}`);
                    }
                }
            });
            
            // 更新多选框
            const checkboxFields = ['test_type', 'chart_types'];
            checkboxFields.forEach(field => {
                const values = settings.reading[field];
                if (values && Array.isArray(values)) {
                    const checkboxes = readingForm.querySelectorAll(`input[name="${field}"]`);
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = values.includes(checkbox.value);
                        console.log(`更新复选框 ${field}[${checkbox.value}] 为 ${values.includes(checkbox.value)}`);
                    });
                }
            });
        }
    }
    
    // 更新视觉设置
    if (settings.visual) {
        // 视觉设置已经有loadSavedVisualSettings函数处理
        loadSavedVisualSettings();
    }
    
    // 更新语言设置
    if (settings.language) {
        const languageRadios = document.querySelectorAll('input[name="language"]');
        languageRadios.forEach(radio => {
            if (radio.value === settings.language) {
                radio.checked = true;
            }
        });
    }
}

// 暴露函数到全局作用域
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.deleteAccount = deleteAccount;
window.removeBackground = removeBackground;
window.updateFormElementsWithSavedSettings = updateFormElementsWithSavedSettings;
