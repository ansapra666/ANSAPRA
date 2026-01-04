// 设置相关功能

// 保存设置
async function saveSettings() {
    const settings = collectAllSettings();
    
    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('设置保存成功', 'success');
            currentSettings = data.settings;
            applyUserSettings(data.settings);
        } else {
            showToast(data.error || '保存失败', 'error');
        }
    } catch (error) {
        showToast('网络错误，请稍后重试', 'error');
        console.error('保存设置错误:', error);
    }
}

// 恢复默认设置
function resetSettings() {
    if (!confirm('确定要恢复默认设置吗？')) {
        return;
    }
    
    const defaultSettings = {
        language: 'zh',
        theme: 'light-blue',
        font_size: 16,
        font_family: 'Microsoft YaHei',
        reading_prep: 'B',
        reading_purpose: 'B',
        reading_time: 'B',
        reading_style: 'A',
        reading_depth: 'B',
        test_preferences: 'A,B',
        chart_preferences: 'A,B,C,D'
    };
    
    // 更新表单
    applyUserSettings(defaultSettings);
    
    showToast('已恢复默认设置', 'info');
}

// 收集所有设置
function collectAllSettings() {
    const settings = {};
    
    // 阅读习惯设置
    const readingForm = document.getElementById('reading-settings-form');
    if (readingForm) {
        const formData = new FormData(readingForm);
        for (let [key, value] of formData.entries()) {
            settings[key] = value;
        }
    }
    
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

// 语言切换处理
async function handleLanguageChange(event) {
    const language = event.target.value;
    
    const settings = {
        language: language
    };
    
    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('语言设置已更新', 'success');
            // 可以在这里添加页面翻译功能
            if (language === 'en') {
                translateToEnglish();
            } else {
                translateToChinese();
            }
        }
    } catch (error) {
        console.error('语言切换错误:', error);
    }
}

// 上传背景图片
async function uploadBackgroundImage() {
    const fileInput = document.getElementById('background-image');
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('请选择图片文件', 'warning');
        return;
    }
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        showToast('请上传图片文件', 'error');
        return;
    }
    
    // 检查文件大小
    if (file.size > 5 * 1024 * 1024) {
        showToast('图片大小不能超过5MB', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('background', file);
    
    try {
        const response = await fetch('/api/upload_background', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('背景图片上传成功', 'success');
            // 应用背景图片
            document.body.style.backgroundImage = `url(${data.url})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundAttachment = 'fixed';
        } else {
            showToast(data.error || '上传失败', 'error');
        }
    } catch (error) {
        showToast('上传失败，请检查网络连接', 'error');
        console.error('上传背景图片错误:', error);
    }
}

// 翻译到英文
function translateToEnglish() {
    // 这里可以添加页面内容的英文翻译
    const translations = {
        '网站介绍': 'Website Introduction',
        '使用说明': 'Instructions',
        '论文解读': 'Paper Interpretation',
        '用户设置': 'User Settings',
        'ANSAPRA': 'ANSAPRA',
        '高中生自然科学论文自适应阅读程序': 'Adaptive Natural Science Academic Paper Reading Agent for High School Students'
        // 更多翻译...
    };
    
    // 更新页面文本
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.dataset.translate;
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
}

// 翻译到中文
function translateToChinese() {
    // 恢复中文文本
    const translations = {
        'Website Introduction': '网站介绍',
        'Instructions': '使用说明',
        'Paper Interpretation': '论文解读',
        'User Settings': '用户设置'
        // 更多翻译...
    };
    
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.dataset.translate;
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
}

// 下载解读结果
function downloadResult() {
    const interpretationContent = document.getElementById('interpretation-content').innerText;
    const originalContent = document.getElementById('original-content').innerText;
    
    const content = `论文解读报告\n\n原文内容：\n${originalContent}\n\n解读内容：\n${interpretationContent}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paper_interpretation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 保存到历史记录
async function saveToHistory() {
    const interpretationContent = document.getElementById('interpretation-content').innerText;
    const originalContent = document.getElementById('original-content').innerText;
    
    try {
        const response = await fetch('/api/save_history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                interpretation: interpretationContent,
                original_content: originalContent
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('已保存到阅读历史', 'success');
        } else {
            showToast(data.error || '保存失败', 'error');
        }
    } catch (error) {
        showToast('保存失败，请检查网络连接', 'error');
        console.error('保存历史错误:', error);
    }
}

// 从PDF提取文本（客户端）
async function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async function(event) {
            try {
                const pdfData = new Uint8Array(event.target.result);
                // 使用PDF.js或其他库提取文本
                // 这里简化处理，实际应用中需要集成PDF解析库
                resolve('PDF内容提取需要服务器端处理，请直接上传文件。');
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// 从DOCX提取文本（客户端）
async function extractTextFromDOCX(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async function(event) {
            try {
                // 简化处理，实际应用中需要集成DOCX解析库
                resolve('DOCX内容提取需要服务器端处理，请直接上传文件。');
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}
