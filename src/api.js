const API_BASE = 'http://localhost:3000/api'; 


// Core network utility to handle global API requests //

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Handle unauthorized or expired tokens globally
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
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

/**
 * Authentication endpoint wrappers
 */
export const Auth = {
  login(username, password) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
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
    return apiRequest('/users/me', { 
      method: 'DELETE' 
    });
  }


};

  export const Parks = {
  // Fetches the entire collection of active park locations
  getAll() {
    return apiRequest('/parks', { method: 'GET' });
  },

  // Calls to backend proxy to get live weather
  getWeather(parkId) {
    return apiRequest(`/parks/${parkId}/weather`, { method: 'GET' });
  },

  updatePark(parkId, updatedParkData) {
    return apiRequest(`/parks/${parkId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedParkData),
    });
  },

  deletePark(parkId) {
    return apiRequest(`/parks/${parkId}`, {
      method: 'DELETE',
    });
  }
};
