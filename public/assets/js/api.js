// API client - Define in correct order
// Note: API_BASE is already defined in auth.js, so we use it directly

// API Request function - MUST be defined first
async function apiRequest(endpoint, options) {
    options = options || {};
    // Use API_BASE from auth.js (already loaded before this script)
    var apiBase = (typeof API_BASE !== 'undefined') ? API_BASE : '/api/v1';
    var url = apiBase + endpoint;
    
    var defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    // Get token safely (check if getToken exists)
    if (typeof getToken === 'function') {
        var token = getToken();
        if (token) {
            defaultOptions.headers['Authorization'] = 'Bearer ' + token;
        }
    }
    
    // Merge options
    var config = {
        method: options.method || 'GET',
        headers: {}
    };
    
    // Copy default headers
    for (var key in defaultOptions.headers) {
        config.headers[key] = defaultOptions.headers[key];
    }
    
    // Copy option headers
    if (options.headers) {
        for (var key in options.headers) {
            config.headers[key] = options.headers[key];
        }
    }
    
    // Handle body
    if (options.body) {
        if (typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        } else {
            config.body = options.body;
        }
    }
    
    try {
        console.log('API Request:', url, config);
        var response = await fetch(url, config);
        
        // Check if response is actually JSON
        var contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            var text = await response.text();
            console.error('Non-JSON response:', text.substring(0, 500));
            var errorMsg = 'Server error: ' + (text.substring(0, 100) || 'Invalid response format');
            throw new Error(errorMsg);
        }
        
        var data = await response.json();
        console.log('API Response:', data);
        
        if (!response.ok) {
            var errorMsg = data.error || data.message || 'Request failed';
            console.error('API Error Response:', errorMsg);
            throw new Error(errorMsg);
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        // If it's already an Error with message, throw it as is
        if (error instanceof Error) {
            throw error;
        }
        // Otherwise wrap it
        throw new Error(error.message || 'Network error. Please check if server is running.');
    }
}

// Auth API - Define AFTER apiRequest
window.authAPI = {
    login: function(email, password) {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: { email: email, password: password }
        });
    },
    
    register: function(name, email, password) {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: { name: name, email: email, password: password }
        });
    }
};

// Also as var for compatibility
var authAPI = window.authAPI;

// Device API
var deviceAPI = {
    list: function() {
        return apiRequest('/devices');
    },
    
    register: function(deviceId, name) {
        return apiRequest('/devices/register', {
            method: 'POST',
            body: { device_id: deviceId, name: name }
        });
    }
};

// History API
var historyAPI = {
    get: function(deviceId, from, to, limit) {
        var params = [];
        if (deviceId) params.push('device_id=' + encodeURIComponent(deviceId));
        if (from) params.push('from=' + encodeURIComponent(from));
        if (to) params.push('to=' + encodeURIComponent(to));
        if (limit) params.push('limit=' + encodeURIComponent(limit));
        
        var query = params.length > 0 ? '?' + params.join('&') : '';
        return apiRequest('/history' + query);
    },
    
    save: function(deviceId, startTs, endTs, label, confidence) {
        return apiRequest('/history/save', {
            method: 'POST',
            body: {
                device_id: deviceId,
                start_ts: startTs,
                end_ts: endTs,
                label: label,
                confidence: confidence
            }
        });
    }
};

// Settings API
var settingsAPI = {
    get: function() {
        return apiRequest('/settings');
    },
    
    update: function(data) {
        return apiRequest('/settings', {
            method: 'POST',
            body: data
        });
    }
};

// Debug: Log that API is loaded
console.log('API.js loaded - authAPI:', typeof window.authAPI);
