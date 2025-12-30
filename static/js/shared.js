// shared.js - 共享的功能和设置

// API调用函数
async function callAPI(endpoint, data) {
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
        throw new Error('请先设置API密钥 / Please set your API key first');
    }
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`API请求失败 / API request failed: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API调用错误 / API call error:', error);
        throw error;
    }
}

// 文件验证函数
function validateFile(file) {
    if (!file) {
        return { valid: false, message: '请选择文件 / Please select a file' };
    }
    
    if (file.type !== 'application/pdf') {
        return { valid: false, message: '仅支持PDF格式 / Only PDF format is supported' };
    }
    
    if (file.size > 10 * 1024 * 1024) {
        return { valid: false, message: '文件大小不能超过10MB / File size must be less than 10MB' };
    }
    
    return { valid: true };
}

// 共享的设置同步
function syncSettings() {
    return JSON.parse(localStorage.getItem('siteSettings') || '{}');
}
