// 🌟 FIXED: Updated production fallback to target active Railway service architecture directly
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://unihub-platform-production.up.railway.app';
export default API_BASE_URL;