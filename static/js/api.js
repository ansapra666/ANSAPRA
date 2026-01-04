/**
 * ANSAPRA - API管理JavaScript文件
 * 集中管理所有API调用
 */

const API_BASE_URL = '';

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
        saveQuestionnaire: '/api/save_questionnaire'
    },
    
    headers: {
        'Content-Type': 'application/json'
    }
};

// 通用API请求函数
async function apiRequest(endpoint, method = 'GET', data = null, headers = {}) {
    const url = API_BASE_URL + endpoint;
    const options = {
        method,
        headers: {
            ...API_CONFIG.headers,
            ...headers
        },
        credentials: 'include' // 包含cookies
    };
    
    if (data) {
        if (data instanceof FormData) {
            // 如果是FormData，删除Content-Type让浏览器自动设置
            delete options.headers['Content-Type'];
            options.body = data;
        } else {
            options.body = JSON.stringify(data);
        }
    }
    
    try {
        const response = await fetch(url, options);
        
        // 检查响应状态
        if (!response.ok) {
            if (response.status === 401) {
                // 未授权，跳转到登录
                localStorage.setItem('last_page', window.location.pathname);
                window.location.reload();
                return null;
            }
            
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { error: errorText };
            }
            
            throw new Error(errorData.error || `请求失败: ${response.status}`);
        }
        
        // 解析响应数据
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
        
    } catch (error) {
        console.error(`API请求失败 (${endpoint}):`, error);
        throw error;
    }
}

// 用户认证API
const authAPI = {
    register: (userData) => apiRequest(API_CONFIG.endpoints.register, 'POST', userData),
    login: (credentials) => apiRequest(API_CONFIG.endpoints.login, 'POST', credentials),
    logout: () => apiRequest(API_CONFIG.endpoints.logout, 'POST'),
    guest: () => apiRequest(API_CONFIG.endpoints.guest, 'POST'),
    checkAuth: () => apiRequest(API_CONFIG.endpoints.checkAuth, 'GET')
};

// 论文处理API
const paperAPI = {
    upload: (formData) => apiRequest(API_CONFIG.endpoints.uploadPaper, 'POST', formData),
    interpret: (data) => apiRequest(API_CONFIG.endpoints.interpret, 'POST', data)
};

// 用户设置API
const settingsAPI = {
    getSettings: () => apiRequest(API_CONFIG.endpoints.settings, 'GET'),
    saveSettings: (settings) => apiRequest(API_CONFIG.endpoints.settings, 'POST', settings)
};

// 历史记录API
const historyAPI = {
    getHistory: () => apiRequest(API_CONFIG.endpoints.history, 'GET')
};

// 其他API
const miscAPI = {
    savePage: (pageData) => apiRequest(API_CONFIG.endpoints.savePage, 'POST', pageData),
    deleteAccount: () => apiRequest(API_CONFIG.endpoints.deleteAccount, 'POST'),
    saveQuestionnaire: (questionnaireData) => apiRequest(API_CONFIG.endpoints.saveQuestionnaire, 'POST', questionnaireData)
};

// 导出API
window.ANSAPRA_API = {
    auth: authAPI,
    paper: paperAPI,
    settings: settingsAPI,
    history: historyAPI,
    misc: miscAPI,
    request: apiRequest
};
