// Profile Dashboard JavaScript

const API_BASE = 'http://localhost:3000/api'; // Adjust based on your backend
let currentUser = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const token = localStorage.getItem('staybnb_token');
  if (!token) {
    window.location.href = 'ai.html';
    return;
  }

  // Load user profile
  await loadUserProfile();

  // Hide page loader
  setTimeout(() => {
    const loader = document.getElementById('pageLoader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 300);
    }
  }, 500);

  // Setup event listeners
  setupEventListeners();
});

// ==================== FETCH USER PROFILE ====================
async function loadUserProfile() {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = 'ai.html';
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    currentUser = await response.json();
    populateProfileUI();
  } catch (error) {
    console.error('Error loading profile:', error);
    showToast('Failed to load profile. Please refresh the page.', 'error');
  }
}

// ==================== POPULATE UI ====================
function populateProfileUI() {
  if (!currentUser) return;

  // Header Section
  document.getElementById('userName').textContent = currentUser.name || 'User';
  document.getElementById('userEmail').textContent = currentUser.email || 'No email';
  document.getElementById('detailName').textContent = currentUser.name || 'Not set';
  document.getElementById('detailEmail').textContent = currentUser.email || 'Not set';
  document.getElementById('detailSkinTone').textContent = currentUser.skin_tone || 'Not specified';
  document.getElementById('detailBodyShape').textContent = currentUser.body_shape || 'Not specified';

  // Badges
  const skinToneBadge = document.getElementById('skinToneBadge');
  const bodyShapeBadge = document.getElementById('bodyShapeBadge');

  if (currentUser.skin_tone) {
    skinToneBadge.textContent = `🎨 ${currentUser.skin_tone}`;
  } else {
    skinToneBadge.textContent = '🎨 No skin tone set';
    skinToneBadge.style.opacity = '0.6';
  }

  if (currentUser.body_shape) {
    bodyShapeBadge.textContent = `👗 ${currentUser.body_shape}`;
  } else {
    bodyShapeBadge.textContent = '👗 No body shape set';
    bodyShapeBadge.style.opacity = '0.6';
  }

  // Created Date
  if (currentUser.created_at) {
    document.getElementById('detailCreatedAt').textContent = formatDate(currentUser.created_at);
    document.getElementById('memberSince').textContent = getMonthYear(currentUser.created_at);
  }

  // Preferences
  populatePreferences();

  // Avatar (using initials)
  updateAvatar();

  // Stats
  updateStats();

  // Form fields
  document.getElementById('inputName').value = currentUser.name || '';
  document.getElementById('inputEmail').value = currentUser.email || '';
  document.getElementById('inputSkinTone').value = currentUser.skin_tone || '';
  document.getElementById('inputBodyShape').value = currentUser.body_shape || '';

  if (currentUser.preferences) {
    if (typeof currentUser.preferences === 'string') {
      document.getElementById('inputPreferences').value = currentUser.preferences;
    } else if (Array.isArray(currentUser.preferences)) {
      document.getElementById('inputPreferences').value = currentUser.preferences.join(', ');
    }
  }
}

// ==================== PREFERENCES ====================
function populatePreferences() {
  const preferencesContent = document.getElementById('preferencesContent');

  if (!currentUser.preferences) {
    preferencesContent.innerHTML = '<p class="empty-state">No style preferences set yet. Edit your profile to add them!</p>';
    return;
  }

  let preferences = [];
  if (typeof currentUser.preferences === 'string') {
    preferences = currentUser.preferences.split(',').map(p => p.trim()).filter(p => p);
  } else if (Array.isArray(currentUser.preferences)) {
    preferences = currentUser.preferences;
  }

  if (preferences.length === 0) {
    preferencesContent.innerHTML = '<p class="empty-state">No style preferences set yet. Edit your profile to add them!</p>';
    return;
  }

  const prefsHTML = preferences.map(pref => `<div class="pref-tag">✨ ${pref}</div>`).join('');
  preferencesContent.innerHTML = `<div class="preferences-list">${prefsHTML}</div>`;
}

// ==================== UPDATE AVATAR ====================
function updateAvatar() {
  const initials = currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const seed = currentUser.id || currentUser.email || 'default';
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

  document.getElementById('profileAvatar').src = avatarUrl;
}

// ==================== UPDATE STATS ====================
function updateStats() {
  // Profile Completion Percentage
  let completionCount = 0;
  if (currentUser.name) completionCount++;
  if (currentUser.email) completionCount++;
  if (currentUser.skin_tone) completionCount++;
  if (currentUser.body_shape) completionCount++;
  if (currentUser.preferences) completionCount++;

  const completionPercent = Math.round((completionCount / 5) * 100);
  document.getElementById('completionPercent').textContent = completionPercent + '%';

  // Mock data for other stats (in real app, fetch from backend)
  document.getElementById('recommendationCount').textContent = Math.floor(Math.random() * 50) + 5;
  document.getElementById('wishlistCount').textContent = Math.floor(Math.random() * 30) + 0;
}

// ==================== MODAL FUNCTIONS ====================
function openEditProfileModal() {
  document.getElementById('editProfileModal').classList.add('active');
}

function openChangePasswordModal() {
  document.getElementById('changePasswordModal').classList.add('active');
}

function openNotificationsModal() {
  document.getElementById('notificationsModal').classList.add('active');
}

function openPrivacyModal() {
  document.getElementById('privacyModal').classList.add('active');
}

function editDetailsModal() {
  openEditProfileModal();
  document.querySelector('.modal-body').scrollTop = 0;
}

function editPreferencesModal() {
  openEditProfileModal();
  const prefInput = document.getElementById('inputPreferences');
  setTimeout(() => prefInput.focus(), 100);
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Close modal on outside click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }
});

// ==================== SAVE PROFILE ====================
async function saveProfile() {
  const name = document.getElementById('inputName').value.trim();
  const skinTone = document.getElementById('inputSkinTone').value;
  const bodyShape = document.getElementById('inputBodyShape').value;
  const preferencesInput = document.getElementById('inputPreferences').value.trim();

  // Validation
  if (!name) {
    showToast('Please enter your full name', 'error');
    return;
  }

  // Parse preferences
  const preferences = preferencesInput
    .split(',')
    .map(p => p.trim())
    .filter(p => p);

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        skin_tone: skinTone || null,
        body_shape: bodyShape || null,
        preferences: preferences.length > 0 ? preferences : null
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedUser = await response.json();
    currentUser = updatedUser;
    populateProfileUI();
    closeModal('editProfileModal');
    showToast('Profile updated successfully!', 'success');
  } catch (error) {
    console.error('Error saving profile:', error);
    showToast('Failed to save profile. Please try again.', 'error');
  }
}

// ==================== CHANGE PASSWORD ====================
async function changePassword() {
  const currentPwd = document.getElementById('currentPassword').value;
  const newPwd = document.getElementById('newPassword').value;
  const confirmPwd = document.getElementById('confirmPassword').value;

  // Validation
  if (!currentPwd || !newPwd || !confirmPwd) {
    showToast('Please fill in all password fields', 'error');
    return;
  }

  if (newPwd !== confirmPwd) {
    showToast('New passwords do not match', 'error');
    return;
  }

  if (newPwd.length < 6) {
    showToast('New password must be at least 6 characters', 'error');
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword: currentPwd,
        newPassword: newPwd
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }

    // Clear form and close modal
    document.getElementById('changePasswordForm').reset();
    closeModal('changePasswordModal');
    showToast('Password changed successfully!', 'success');
  } catch (error) {
    console.error('Error changing password:', error);
    showToast(error.message || 'Failed to change password', 'error');
  }
}

// ==================== SAVE NOTIFICATIONS ====================
function saveNotifications() {
  const settings = {
    emailNotifications: document.getElementById('emailNotif').checked,
    styleRecommendations: document.getElementById('recommendNotif').checked,
    newCollections: document.getElementById('collectionNotif').checked,
    wishlistUpdates: document.getElementById('wishlistNotif').checked
  };

  // Save to localStorage or send to backend
  localStorage.setItem('notificationSettings', JSON.stringify(settings));
  closeModal('notificationsModal');
  showToast('Notification settings saved!', 'success');
}

// ==================== SAVE PRIVACY ====================
function savePrivacy() {
  const settings = {
    publicProfile: document.getElementById('publicProfile').checked,
    showEmail: document.getElementById('showEmail').checked,
    allowMessages: document.getElementById('allowMessages').checked
  };

  // Save to localStorage or send to backend
  localStorage.setItem('privacySettings', JSON.stringify(settings));
  closeModal('privacyModal');
  showToast('Privacy settings saved!', 'success');
}

// ==================== AVATAR UPLOAD ====================
function triggerAvatarUpload() {
  document.getElementById('avatarInput').click();
}

document.getElementById('avatarInput')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file', 'error');
    return;
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    showToast('Image must be less than 5MB', 'error');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/users/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    // Create a local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      document.getElementById('profileAvatar').src = event.target.result;
    };
    reader.readAsDataURL(file);

    showToast('Avatar updated successfully!', 'success');
    document.getElementById('avatarInput').value = '';
  } catch (error) {
    console.error('Error uploading avatar:', error);
    showToast('Failed to upload avatar', 'error');
  }
});

// ==================== LOGOUT ====================
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('authToken');
    window.location.href = 'ai.html';
  }
}

// ==================== UTILITY FUNCTIONS ====================
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function getMonthYear(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());

  if (monthsDiff === 0) return 'This month';
  if (monthsDiff === 1) return '1 month ago';
  if (monthsDiff < 12) return `${monthsDiff} months ago`;

  const yearsDiff = Math.floor(monthsDiff / 12);
  return `${yearsDiff} year${yearsDiff > 1 ? 's' : ''} ago`;
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show';

  // Style based on type
  if (type === 'error') {
    toast.style.background = '#f44336';
  } else if (type === 'warning') {
    toast.style.background = '#ff9800';
  } else {
    toast.style.background = 'var(--primary)';
  }

  // Auto hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ==================== SETUP EVENT LISTENERS ====================
function setupEventListeners() {
  // Enter key to submit forms
  document.getElementById('editProfileForm')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveProfile();
  });

  document.getElementById('changePasswordForm')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') changePassword();
  });

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.style.setProperty('--bg-opacity', '0.95');
    } else {
      navbar?.style.setProperty('--bg-opacity', '0.9');
    }
  });
}

// ==================== LOADING STATES ====================
function setLoadingState(elementId, isLoading) {
  const element = document.getElementById(elementId);
  if (isLoading) {
    element.disabled = true;
    element.style.opacity = '0.6';
  } else {
    element.disabled = false;
    element.style.opacity = '1';
  }
}
