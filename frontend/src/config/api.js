// 🌟 FIXED: Changes base URL connection parameters globally to hit the production API cluster
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://unihub-platform-production.up.railway.app';
export default API_BASE_URL;