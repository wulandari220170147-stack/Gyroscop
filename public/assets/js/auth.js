// Authentication utilities

// Use var instead of const for better compatibility
var API_BASE = '/api/v1';
var WS_URL = 'ws://' + window.location.hostname + ':8080/ws';

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function removeUser() {
    localStorage.removeItem('user');
}

function isAuthenticated() {
    return getToken() !== null;
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

function logout() {
    removeToken();
    removeUser();
    window.location.href = '/login.html';
}

// Check auth on page load (except login page)
if (!window.location.pathname.includes('login.html')) {
    if (!requireAuth()) {
        // Redirect will happen
    }
}

