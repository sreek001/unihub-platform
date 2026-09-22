/**
 * Centralized API Base URL Configuration
 * 
 * Priority:
 * 1. Explicit environment variable: VITE_API_URL
 * 2. If running on production (non-localhost) without env var, use relative path "" for same-domain deployment
 * 3. Default for local development: http://localhost:4000
 */
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? ''
    : 'http://localhost:4000');

export default API_BASE_URL;
