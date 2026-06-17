import axios from 'axios';

// Helper to convert snake_case to camelCase
export function toCamel(obj) {
  if (Array.isArray(obj)) {
    return obj.map(toCamel);
  }
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamel(obj[key]);
    }
    
    // Custom mappings for frontend compatibility
    if (result.id !== undefined && result._id === undefined) {
      result._id = String(result.id);
    }
    if (result.lastDonatedDate !== undefined) {
      result.lastDonated = result.lastDonatedDate;
      result.lastDonationDate = result.lastDonatedDate;
    }
    if (result.mobile !== undefined) {
      result.mobileNumber = result.mobile;
    }
    if (result.compatibilityScore !== undefined) {
      result.matchScore = result.compatibilityScore;
    } else if (result.matchScore !== undefined) {
      result.compatibilityScore = result.matchScore;
    } else if (result.role === 'donor') {
      // Assign mock compatibility scores if absent
      result.matchScore = Math.floor(Math.random() * 25) + 75; // 75 - 99
      result.compatibilityScore = result.matchScore;
    }
    
    // Assign mock distances if absent (since distance depends on live coordinates not in basic DB)
    if (result.distance === undefined && result.role === 'donor') {
      result.distance = Math.round((Math.random() * 5 + 0.5) * 10) / 10;
    }
    
    return result;
  }
  return obj;
}

// Helper to convert camelCase to snake_case
export function toSnake(obj) {
  if (Array.isArray(obj)) {
    return obj.map(toSnake);
  }
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      let snakeKey = key;
      // Handle custom specific manual mappings
      if (key === 'lastDonated' || key === 'lastDonatedDate' || key === 'lastDonationDate') {
        snakeKey = 'last_donated_date';
      } else if (key === 'mobileNumber') {
        snakeKey = 'mobile';
      } else if (key === '_id') {
        snakeKey = 'id';
      } else {
        snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      }
      result[snakeKey] = toSnake(obj[key]);
    }
    return result;
  }
  return obj;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://mindful-exploration-production-8f55.up.railway.app/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jeevalink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Map outgoing data to snake_case
    if (config.data && !(config.data instanceof FormData)) {
      config.data = toSnake(config.data);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to convert incoming data to camelCase
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data) {
      response.data.data = toCamel(response.data.data);
    }
    return response;
  },
  (error) => {
    // If we get an authentication error, clean up token
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('jeevalink_token');
      localStorage.removeItem('jeevalink_user');
    }
    return Promise.reject(error);
  }
);

export default api;
