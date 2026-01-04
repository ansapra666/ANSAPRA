/**
 * ANSAPRA - API管理JavaScript文件（修复版）
 * 集中管理所有API调用，修复网络连接问题
 */

const API_BASE_URL = window.location.origin; // 使用当前域名

// API配置
const API_CONFIG = {
    endpoints: {
        register: '/api/register',
        login: '/api/login',
        logout: '/api/logout',
        guest: '/api/guest',
        uploadPaper: '/api/upload_paper',
        interpret: '/api/interpret',
        settings: '/api/settings',
        history: '/api/history',
        savePage: '/api/save_page',
        deleteAccount: '/api/delete_account',
        checkAuth: '/api/check_auth',
        saveQuestionnaire: '/api/save_questionnaire',
        test: '/api/test'  // 添加测试端点
    }
};

// 调试模式
const DEBUG_MODE = true;

// 日志函数
function logDebug(...args) {
    if (DEBUG_MODE) {
        console.log('[ANSAPRA API]', ...args);
    }
}

// 通用API请求函数（修复版）
async function apiRequest(endpoint, method = 'GET', data = null, isFormData = false) {
    const url = API_BASE_URL + endpoint;
    
    logDebug(`请求: ${method} ${url}`, data ? '有数据' : '无数据');
    
    const headers = {};
    
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    
    // 确保包含凭据
    const credentials = 'include';
    
    const options = {
        method,
        headers,
        credentials,
        mode: 'cors'  // 明确指定CORS模式
    };
    
    if (data) {
        if (isFormData) {
            options.body = data;
        } else {
            options.body = JSON.stringify(data);
        }
    }
    
    try {
        logDebug('发送请求:', options);
        
        // 添加超时处理
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
        options.signal = controller.signal;
        
        const response = await fetch(url, options);
        clearTimeout(timeoutId);
        
        logDebug('收到响应:', response.status, response.statusText);
        
        // 检查响应状态
        if (!response.ok) {
            let errorText;
            try {
                errorText = await response.text();
                logDebug('错误响应文本:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: errorText || `HTTP ${response.status}` };
                }
                
                throw new Error(errorData.error || `请求失败: ${response.status}`);
            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error('请求超时，请检查网络连接');
                }
                throw error;
            }
        }
        
        // 解析响应数据
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            logDebug('响应数据:', result);
            return result;
        } else {
            const text = await response.text();
            logDebug('响应文本:', text);
            return text;
        }
        
    } catch (error) {
        logDebug(`API请求失败 (${endpoint}):`, error);
        
        // 提供更友好的错误信息
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('网络连接失败，请检查网络设置或服务器状态');
        } else if (error.name === 'AbortError') {
            throw new Error('请求超时，请检查网络连接');
        } else if (error.message.includes('Failed to fetch')) {
            throw new Error('无法连接到服务器，请检查网络连接');
        }
        
        throw error;
    }
}

// 测试API连接
async function testConnection() {
    try {
        logDebug('测试API连接...');
        const result = await apiRequest(API_CONFIG.endpoints.test, 'GET');
        logDebug('API连接测试结果:', result);
        return result;
    } catch (error) {
        logDebug('API连接测试失败:', error);
        throw error;
    }
}

// 用户认证API（修复版）
const authAPI = {
    register: async (userData) => {
        try {
            logDebug('注册请求数据:', userData);
            
            // 确保问卷数据存在
            if (!userData.questionnaire || Object.keys(userData.questionnaire).length === 0) {
                // 创建默认问卷数据
                userData.questionnaire = {
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
            
            const result = await apiRequest(API_CONFIG.endpoints.register, 'POST', userData);
            logDebug('注册结果:', result);
            return result;
        } catch (error) {
            logDebug('注册失败:', error);
            throw error;
        }
    },
    
    login: async (credentials) => {
        try {
            logDebug('登录请求数据:', credentials);
            const result = await apiRequest(API_CONFIG.endpoints.login, 'POST', credentials);
            logDebug('登录结果:', result);
            return result;
        } catch (error) {
            logDebug('登录失败:', error);
            throw error;
        }
    },
    
    logout: async () => {
        try {
            const result = await apiRequest(API_CONFIG.endpoints.logout, 'POST');
            logDebug('退出结果:', result);
            return result;
        } catch (error) {
            logDebug('退出失败:', error);
            throw error;
        }
    },
    
    guest: async () => {
        try {
            const result = await apiRequest(API_CONFIG.endpoints.guest, 'POST');
            logDebug('游客登录结果:', result);
            return result;
        } catch (error) {
            logDebug('游客登录失败:', error);
            throw error;
        }
    },
    
    checkAuth: async () => {
        try {
            const result = await apiRequest(API_CONFIG.endpoints.checkAuth, 'GET');
            logDebug('认证检查结果:', result);
            return result;
        } catch (error) {
            logDebug('认证检查失败:', error);
            throw error;
        }
    }
};

// 论文处理API
const paperAPI = {
    upload: async (formData) => {
        try {
            logDebug('上传文件:', formData.get('file')?.name);
            const result = await apiRequest(API_CONFIG.endpoints.uploadPaper, 'POST', formData, true);
            logDebug('上传结果:', result);
            return result;
        } catch (error) {
            logDebug('上传失败:', error);
            throw error;
        }
    },
    
    interpret: async (data) => {
        try {
            logDebug('解读请求数据:', data);
            const result = await apiRequest(API_CONFIG.endpoints.interpret, 'POST', data);
            logDebug('解读结果:', result);
            return result;
        } catch (error) {
            logDebug('解读失败:', error);
            throw error;
        }
    }
};

// 用户设置API
const settingsAPI = {
    getSettings: async () => {
        try {
            const result = await apiRequest(API_CONFIG.endpoints.settings, 'GET');
            logDebug('获取设置结果:', result);
            return result;
        } catch (error) {
            logDebug('获取设置失败:', error);
            throw error;
        }
    },
    
    saveSettings: async (settings) => {
        try {
            logDebug('保存设置数据:', settings);
            const result = await apiRequest(API_CONFIG.endpoints.settings, 'POST', settings);
            logDebug('保存设置结果:', result);
            return result;
        } catch (error) {
            logDebug('保存设置失败:', error);
            throw error;
        }
    }
};

// 历史记录API
const historyAPI = {
    getHistory: async () => {
        try {
            const result = await apiRequest(API_CONFIG.endpoints.history, 'GET');
            logDebug('获取历史结果:', result);
            return result;
        } catch (error) {
            logDebug('获取历史失败:', error);
            throw error;
        }
    }
};

// 其他API
const miscAPI = {
    savePage: async (pageData) => {
        try {
            const result = await apiRequest(API_CONFIG.endpoints.savePage, 'POST', pageData);
            logDebug('保存页面结果:', result);
            return result;
        } catch (error) {
            logDebug('保存页面失败:', error);
            throw error;
        }
    },
    
    deleteAccount: async () => {
        try {
            const result = await apiRequest(API_CONFIG.endpoints.deleteAccount, 'POST');
            logDebug('删除账户结果:', result);
            return result;
        } catch (error) {
            logDebug('删除账户失败:', error);
            throw error;
        }
    },
    
    saveQuestionnaire: async (questionnaireData) => {
        try {
            logDebug('保存问卷数据:', questionnaireData);
            const result = await apiRequest(API_CONFIG.endpoints.saveQuestionnaire, 'POST', questionnaireData);
            logDebug('保存问卷结果:', result);
            return result;
        } catch (error) {
            logDebug('保存问卷失败:', error);
            throw error;
        }
    }
};

// 导出API
window.ANSAPRA_API = {
    auth: authAPI,
    paper: paperAPI,
    settings: settingsAPI,
    history: historyAPI,
    misc: miscAPI,
    test: testConnection,
    request: apiRequest,
    config: API_CONFIG
};

// 初始化时测试连接
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const testResult = await testConnection();
        logDebug('应用启动，API连接正常:', testResult);
    } catch (error) {
        logDebug('应用启动，API连接异常:', error);
        // 显示连接错误提示
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'connection-error';
            errorDiv.innerHTML = `
                <div style="background: #f8d7da; color: #721c24; padding: 10px; margin: 10px; border-radius: 5px; border: 1px solid #f5c6cb;">
                    <strong>网络连接问题:</strong> ${error.message}<br>
                    <small>请检查网络连接，然后刷新页面重试。</small>
                </div>
            `;
            authModal.querySelector('.modal-content').prepend(errorDiv);
        }
    }
});
