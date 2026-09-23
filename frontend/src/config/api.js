// 🌟 Centralized API Base URL Configuration
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:4000'
    : 'https://unihub-platform-kf9y.onrender.com');

export default API_BASE_URL;
