const API_BASE = 'http://localhost:3000/api';

// Centralized API request function with token handling and error management
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  // Expired or missing token — redirect to login globally
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

//Auth requests /auth/...
export const Auth = {
  login(email, password) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(userData) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser() {
    return apiRequest('/auth/me', { method: 'GET' });
  },

  updateProfile(profileData) {
    return apiRequest('/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  deleteAccount() {
    return apiRequest('/users/me', { method: 'DELETE' });
  },
};

//Park requests /parks/...
export const Parks = {
  getAll() {
    return apiRequest('/parks', { method: 'GET' });
  },

  getOne(parkId) {
    return apiRequest(`/parks/${parkId}`, { method: 'GET' });
  },

  getWeather(parkId) {
    return apiRequest(`/parks/${parkId}/weather`, { method: 'GET' });
  },

  getReviews(parkId) {
    return apiRequest(`/parks/${parkId}/reviews`, { method: 'GET' });
  },

  updatePark(parkId, updatedParkData) {
    return apiRequest(`/parks/${parkId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedParkData),
    });
  },

  deletePark(parkId) {
    return apiRequest(`/parks/${parkId}`, { method: 'DELETE' });
  },
};
