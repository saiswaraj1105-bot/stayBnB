// StayBNB API Service
// Handles all backend communication

// ============================================
// CONFIGURATION
// ============================================
// Change this to your backend URL
const API_BASE_URL = 'http://localhost:3000/api';

// ============================================
// API HELPERS
// ============================================

/**
 * Get stored JWT token
 */
function getToken() {
  return localStorage.getItem('staybnb_token');
}

/**
 * Set JWT token
 */
function setToken(token) {
  localStorage.setItem('staybnb_token', token);
}

/**
 * Remove JWT token (logout)
 */
function removeToken() {
  localStorage.removeItem('staybnb_token');
}

/**
 * Make API request with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header if token exists
  const token = getToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============================================
// AUTH API
// ============================================

/**
 * Sign up new user
 */
async function signup(name, email, password) {
  const data = await apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  
  // Store token on successful signup
  if (data.token) {
    setToken(data.token);
  }
  
  return data;
}

/**
 * Sign in existing user
 */
async function signin(email, password) {
  const data = await apiRequest('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Store token on successful signin
  if (data.token) {
    setToken(data.token);
  }
  
  return data;
}

/**
 * Verify JWT token
 */
async function verifyToken() {
  const token = getToken();
  if (!token) {
    return { valid: false };
  }
  
  try {
    const data = await apiRequest('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    return data;
  } catch (error) {
    return { valid: false };
  }
}

/**
 * Sign out user
 */
function signout() {
  removeToken();
  localStorage.removeItem('staybnb_user');
  localStorage.removeItem('staybnb_wishlist');
}

// ============================================
// USER API
// ============================================

/**
 * Get user profile
 */
async function getProfile() {
  return apiRequest('/users/profile', {
    method: 'GET',
  });
}

/**
 * Update user profile
 */
async function updateProfile(profileData) {
  return apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

/**
 * Get analysis history
 */
async function getAnalysisHistory() {
  return apiRequest('/users/analysis-history', {
    method: 'GET',
  });
}

// ============================================
// ANALYSIS API
// ============================================

/**
 * Analyze image
 */
async function analyzeImage(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/analysis/analyze`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Analysis failed');
  }
  
  return data;
}

/**
 * Get analysis by ID
 */
async function getAnalysis(analysisId) {
  return apiRequest(`/analysis/${analysisId}`, {
    method: 'GET',
  });
}

// ============================================
// WISHLIST API
// ============================================

/**
 * Get user wishlist
 */
async function getWishlist() {
  return apiRequest('/wishlist', {
    method: 'GET',
  });
}

/**
 * Add item to wishlist
 */
async function addToWishlist(item) {
  return apiRequest('/wishlist/add', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

/**
 * Remove item from wishlist
 */
async function removeFromWishlist(itemId) {
  return apiRequest(`/wishlist/${itemId}`, {
    method: 'DELETE',
  });
}

// ============================================
// REELS API
// ============================================

/**
 * Get all reels
 */
async function getReels() {
  return apiRequest('/reels', {
    method: 'GET',
  });
}

/**
 * Get reel by ID
 */
async function getReel(reelId) {
  return apiRequest(`/reels/${reelId}`, {
    method: 'GET',
  });
}

/**
 * Like a reel
 */
async function likeReel(reelId) {
  return apiRequest(`/reels/${reelId}/like`, {
    method: 'POST',
  });
}

/**
 * Search reels by cloth type
 */
async function searchReelsByCloth(clothType) {
  return apiRequest(`/reels/search/cloth/${clothType}`, {
    method: 'GET',
  });
}

// ============================================
// CLOTH TYPES API
// ============================================

/**
 * Get all cloth types
 */
async function getClothTypes() {
  return apiRequest('/cloth', {
    method: 'GET',
  });
}

/**
 * Get cloth type by ID
 */
async function getClothType(clothId) {
  return apiRequest(`/cloth/${clothId}`, {
    method: 'GET',
  });
}

/**
 * Search cloth types
 */
async function searchClothTypes(query) {
  return apiRequest(`/cloth/search/${query}`, {
    method: 'GET',
  });
}

// ============================================
// STYLE PROFILE API
// ============================================

/**
 * Get user style profile
 */
async function getStyleProfile() {
  return apiRequest('/style-profile', {
    method: 'GET',
  });
}

/**
 * Update user style profile
 */
async function updateStyleProfile(profileData) {
  return apiRequest('/style-profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

/**
 * Get gender-specific recommendations
 */
async function getGenderRecommendations(gender) {
  return apiRequest(`/style-profile/recommendations/${gender}`, {
    method: 'GET',
  });
}

// ============================================
// EXPORT
// ============================================
window.apiService = {
  // Auth
  signup,
  signin,
  verifyToken,
  signout,
  getToken,
  setToken,
  
  // User
  getProfile,
  updateProfile,
  getAnalysisHistory,
  
  // Analysis
  analyzeImage,
  getAnalysis,
  
  // Wishlist
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  
  // Reels
  getReels,
  getReel,
  likeReel,
  searchReelsByCloth,
  
  // Cloth Types
  getClothTypes,
  getClothType,
  searchClothTypes,
  
  // Style Profile
  getStyleProfile,
  updateStyleProfile,
  getGenderRecommendations,
};
