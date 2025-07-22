// src/polyfills.js
window.process = window.process || {};
window.process.browser = true;
window.process.env = window.process.env || {};
window.process.env.NODE_ENV = process.env.NODE_ENV || 'development';
