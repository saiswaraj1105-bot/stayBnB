// StayBNB - JavaScript Application
// AI-Powered Fashion Styling Advisor

// ============================================
// GLOBAL STATE
// ============================================
const state = {
  currentUser: null,
  isLoggedIn: false,
  wishlist: [],
  uploadedImage: null,
  analysisResults: null,
  carouselIndex: 0,
  galleryFilter: 'all'
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCarousel();
  initGallery();
  initFilters();
  initModals();
  initWishlist();
  initUpload();
  initAnimations();
  loadUserData();
  
  // Verify token with backend on load
  checkAuthStatus();
  
  // Hide page loader
  setTimeout(() => {
    const loader = document.querySelector('.page-loader');
    if (loader) {
      loader.classList.add('hidden');
    }
  }, 1000);
});

// ============================================
// AUTH CHECK
// ============================================
async function checkAuthStatus() {
  try {
    const token = localStorage.getItem('staybnb_token');
    if (!token) {
      return;
    }
    
    // Verify token with backend
    if (window.apiService) {
      const result = await window.apiService.verifyToken();
      if (result.valid && result.userId) {
        // Token is valid, get user profile
        try {
          const profile = await window.apiService.getProfile();
          state.isLoggedIn = true;
          state.currentUser = {
            id: profile.id,
            name: profile.name,
            email: profile.email
          };
          updateAuthUI();
        } catch (e) {
          console.error('Failed to get profile:', e);
        }
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('staybnb_token');
      }
    }
  } catch (error) {
    console.error('Auth check failed:', error);
  }
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(26, 26, 46, 0.95)';
      navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
    } else {
      navbar.style.background = 'rgba(26, 26, 46, 0.9)';
      navbar.style.boxShadow = 'none';
    }
  });

  // Mobile menu toggle (if needed)
  const mobileMenuBtn = document.createElement('button');
  mobileMenuBtn.className = 'mobile-menu-btn';
  mobileMenuBtn.innerHTML = '☰';
  mobileMenuBtn.style.cssText = 'display:none;background:none;border:none;color:white;font-size:24px;cursor:pointer;';
  
  // Add mobile styles
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .mobile-menu-btn { display: block !important; }
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// CAROUSEL
// ============================================
function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('carouselDots');
  if (!track) return;

  const cards = track.querySelectorAll('.carousel-card');
  if (cards.length === 0) return;

  // Create dots
  cards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
    dot.onclick = () => goToSlide(index);
    dotsContainer.appendChild(dot);
  });

  updateCarousel();
}

function rotateCarousel(direction) {
  const track = document.getElementById('carouselTrack');
  const cards = track.querySelectorAll('.carousel-card');
  
  state.carouselIndex += direction;
  
  if (state.carouselIndex < 0) {
    state.carouselIndex = cards.length - 1;
  } else if (state.carouselIndex >= cards.length) {
    state.carouselIndex = 0;
  }
  
  updateCarousel();
}

function goToSlide(index) {
  state.carouselIndex = index;
  updateCarousel();
}

function updateCarousel() {
  const track = document.getElementById('carouselTrack');
  const cards = track.querySelectorAll('.carousel-card');
  const dots = document.querySelectorAll('.carousel-dot');
  
  cards.forEach((card, index) => {
    card.classList.remove('active', 'prev', 'next');
    
    if (index === state.carouselIndex) {
      card.classList.add('active');
    } else if (index === (state.carouselIndex - 1 + cards.length) % cards.length) {
      card.classList.add('prev');
    } else if (index === (state.carouselIndex + 1) % cards.length) {
      card.classList.add('next');
    }
  });
  
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === state.carouselIndex);
  });
  
  // Auto-rotate
  setTimeout(() => {
    rotateCarousel(1);
  }, 5000);
}

// ============================================
// GALLERY
// ============================================
function initGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  // Sample gallery data
  const galleryItems = [
    { id: 1, category: 'formal', title: 'Classic Formal Suit', subtitle: 'Elegant navy blue formal wear', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400' },
    { id: 2, category: 'business', title: 'Business Casual', subtitle: 'Smart casual business look', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400' },
    { id: 3, category: 'casual', title: 'Weekend Casual', subtitle: 'Relaxed weekend outfit', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400' },
    { id: 4, category: 'party', title: 'Glam Party Wear', subtitle: 'Stunning party ensemble', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400' },
    { id: 5, category: 'accessories', title: 'Gold Accessories', subtitle: 'Elegant jewelry pieces', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400' },
    { id: 6, category: 'hairstyle', title: 'Modern Bob Cut', subtitle: 'Trendy hairstyle suggestion', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400' },
    { id: 7, category: 'formal', title: 'Traditional Indian', subtitle: 'Classic ethnic formal', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400' },
    { id: 8, category: 'business', title: 'Corporate Look', subtitle: 'Professional attire', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400' }
  ];

  // Render gallery items
  galleryItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-item';
    card.dataset.category = item.category;
    card.innerHTML = `
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <div class="gallery-overlay">
        <h4>${item.title}</h4>
        <p>${item.subtitle}</p>
      </div>
      <button class="wishlist-btn" onclick="toggleWishlist(event, ${item.id})">♥</button>
    `;
    grid.appendChild(card);
  });
}

function filterGallery(category) {
  state.galleryFilter = category;
  
  // Update active button
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Filter items
  const items = document.querySelectorAll('.gallery-item');
  items.forEach(item => {
    if (category === 'all' || item.dataset.category === category) {
      item.style.display = 'block';
      item.style.animation = 'fadeIn 0.5s ease';
    } else {
      item.style.display = 'none';
    }
  });
}

// ============================================
// ENHANCED FILTERS
// ============================================
function initFilters() {
  // Create enhanced filters section
  createEnhancedFilters();
  
  // Cloth type carousel
  createClothCarousel();
}

function createEnhancedFilters() {
  const stylesSection = document.getElementById('styles');
  if (!stylesSection) return;

  // Add enhanced filters before gallery
  const filterContainer = document.createElement('div');
  filterContainer.className = 'enhanced-filters glass-card';
  filterContainer.innerHTML = `
    <h3 style="margin-bottom: 24px; font-size: 20px;">🎯 Smart Filters</h3>
    
    <div class="filter-section">
      <h4>Skin Tone</h4>
      <div class="filter-options">
        <button class="filter-chip active" data-filter="skin" data-value="all">All</button>
        <button class="filter-chip" data-filter="skin" data-value="fair">Fair</button>
        <button class="filter-chip" data-filter="skin" data-value="medium">Medium</button>
        <button class="filter-chip" data-filter="skin" data-value="olive">Olive</button>
        <button class="filter-chip" data-filter="skin" data-value="brown">Brown</button>
        <button class="filter-chip" data-filter="skin" data-value="dark">Dark</button>
      </div>
    </div>

    <div class="filter-section">
      <h4>Body Shape</h4>
      <div class="filter-options">
        <button class="filter-chip active" data-filter="body" data-value="all">All</button>
        <button class="filter-chip" data-filter="body" data-value="hourglass">Hourglass</button>
        <button class="filter-chip" data-filter="body" data-value="pear">Pear</button>
        <button class="filter-chip" data-filter="body" data-value="apple">Apple</button>
        <button class="filter-chip" data-filter="body" data-value="rectangle">Rectangle</button>
        <button class="filter-chip" data-filter="body" data-value="inverted">Inverted Triangle</button>
      </div>
    </div>

    <div class="filter-section">
      <h4>Color Preference</h4>
      <div class="filter-options">
        <div class="color-swatch active" style="background: #E91E63;" data-color="all"></div>
        <div class="color-swatch" style="background: #FF5722;" data-color="warm"></div>
        <div class="color-swatch" style="background: #2196F3;" data-color="cool"></div>
        <div class="color-swatch" style="background: #4CAF50;" data-color="neutral"></div>
        <div class="color-swatch" style="background: #9C27B0;" data-color="pastel"></div>
        <div class="color-swatch" style="background: #000000;" data-color="dark"></div>
        <div class="color-swatch" style="background: #FFFFFF;" data-color="light"></div>
      </div>
    </div>

    <div class="filter-section">
      <h4>Height</h4>
      <div class="filter-options">
        <button class="filter-chip active" data-filter="height" data-value="all">All</button>
        <button class="filter-chip" data-filter="height" data-value="short">Short (Below 5'4")</button>
        <button class="filter-chip" data-filter="height" data-value="medium">Medium (5'4" - 5'8")</button>
        <button class="filter-chip" data-filter="height" data-value="tall">Tall (Above 5'8")</button>
      </div>
    </div>

    <div class="filter-section">
      <h4>Weight Range</h4>
      <div class="filter-options">
        <button class="filter-chip active" data-filter="weight" data-value="all">All</button>
        <button class="filter-chip" data-filter="weight" data-value="slim">Slim</button>
        <button class="filter-chip" data-filter="weight" data-value="athletic">Athletic</button>
        <button class="filter-chip" data-filter="weight" data-value="average">Average</button>
        <button class="filter-chip" data-filter="weight" data-value="plus">Plus Size</button>
      </div>
    </div>
  `;

  const galleryGrid = document.getElementById('galleryGrid');
  if (galleryGrid && galleryGrid.parentNode) {
    galleryGrid.parentNode.insertBefore(filterContainer, galleryGrid);
  }

  // Add event listeners for filters
  filterContainer.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const filterType = e.target.dataset.filter;
      const filterValue = e.target.dataset.value;
      
      // Update active state
      filterContainer.querySelectorAll(`.filter-chip[data-filter="${filterType}"]`).forEach(c => {
        c.classList.remove('active');
      });
      e.target.classList.add('active');
      
      applyFilters();
    });
  });

  // Color swatches
  filterContainer.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      filterContainer.querySelectorAll('.color-swatch').forEach(s => {
        s.classList.remove('active');
      });
      e.target.classList.add('active');
      applyFilters();
    });
  });
}

function createClothCarousel() {
  // Create cloth types section
  const clothSection = document.createElement('section');
  clothSection.className = 'cloth-types';
  clothSection.innerHTML = `
    <div style="text-align:center;margin-bottom:40px;">
      <div class="section-tag">👗 Fabric Collection</div>
      <h2 class="section-title">Browse by <span class="gradient-text">Cloth Type</span></h2>
      <p class="section-sub" style="margin:0 auto;">Explore different fabric options for your style</p>
    </div>
    <div class="cloth-carousel" id="clothCarousel">
      <div class="cloth-item">
        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300" alt="Silk">
        <div class="cloth-overlay">
          <h4>Silk</h4>
          <span>Luxurious & Elegant</span>
        </div>
      </div>
      <div class="cloth-item">
        <img src="https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=300" alt="Cotton">
        <div class="cloth-overlay">
          <h4>Cotton</h4>
          <span>Comfortable & Breathable</span>
        </div>
      </div>
      <div class="cloth-item">
        <img src="https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=300" alt="Linen">
        <div class="cloth-overlay">
          <h4>Linen</h4>
          <span>Light & Breezy</span>
        </div>
      </div>
      <div class="cloth-item">
        <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300" alt="Velvet">
        <div class="cloth-overlay">
          <h4>Velvet</h4>
          <span>Rich & Royal</span>
        </div>
      </div>
      <div class="cloth-item">
        <img src="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=300" alt="Chiffon">
        <div class="cloth-overlay">
          <h4>Chiffon</h4>
          <span>Flowy & Feminine</span>
        </div>
      </div>
      <div class="cloth-item">
        <img src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300" alt="Denim">
        <div class="cloth-overlay">
          <h4>Denim</h4>
          <span>Casual & Classic</span>
        </div>
      </div>
      <div class="cloth-item">
        <img src="https://images.unsplash.com/photo-1612413156683-1628d390d9b9?w=300" alt="Wool">
        <div class="cloth-overlay">
          <h4>Wool</h4>
          <span>Warm & Cozy</span>
        </div>
      </div>
      <div class="cloth-item">
        <img src="https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=300" alt="Satin">
        <div class="cloth-overlay">
          <h4>Satin</h4>
          <span>Shiny & Smooth</span>
        </div>
      </div>
    </div>
  `;

  // Insert after styles section
  const stylesSection = document.getElementById('styles');
  if (stylesSection && stylesSection.parentNode) {
    stylesSection.parentNode.insertBefore(clothSection, stylesSection.nextSibling);
  }
}

function applyFilters() {
  showToast('Filters applied! Showing personalized results.', 'success');
}

// ============================================
// MODALS (Sign In / Sign Up)
// ============================================
function initModals() {
  const overlay = document.getElementById('modalOverlay');
  if (!overlay) return;

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

function openModal(type) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  if (!overlay || !content) return;

  let html = '';

  if (type === 'signin') {
    html = `
      <div class="auth-header">
        <h2>Welcome Back! 👋</h2>
        <p>Sign in to continue your style journey</p>
      </div>
      <form class="auth-form" onsubmit="handleSignIn(event)">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" placeholder="Enter your password" required>
        </div>
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox">
            <span>Remember me</span>
          </label>
          <a href="#" onclick="openModal('forgot')">Forgot Password?</a>
        </div>
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Sign In</button>
      </form>
      <div class="social-login">
        <p>Or continue with</p>
        <div class="social-buttons">
          <button class="social-btn" onclick="socialLogin('google')">
            <span>🔵</span> Google
          </button>
          <button class="social-btn" onclick="socialLogin('facebook')">
            <span>🔵</span> Facebook
          </button>
        </div>
      </div>
      <p class="auth-switch">Don't have an account? <a href="#" onclick="openModal('signup')">Sign Up</a></p>
    `;
  } else if (type === 'signup') {
    html = `
      <div class="auth-header">
        <h2>Join StayBNB! 🎉</h2>
        <p>Create an account for personalized fashion advice</p>
      </div>
      <form class="auth-form" onsubmit="handleSignUp(event)">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" placeholder="Enter your full name" required>
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" placeholder="Create a password" required>
        </div>
        <div class="form-group">
          <label>Gender</label>
          <select style="padding:14px 18px;border-radius:8px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:white;width:100%;">
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Create Account</button>
      </form>
      <div class="social-login">
        <p>Or continue with</p>
        <div class="social-buttons">
          <button class="social-btn" onclick="socialLogin('google')">
            <span>🔵</span> Google
          </button>
          <button class="social-btn" onclick="socialLogin('facebook')">
            <span>🔵</span> Facebook
          </button>
        </div>
      </div>
      <p class="auth-switch">Already have an account? <a href="#" onclick="openModal('signin')">Sign In</a></p>
    `;
  } else if (type === 'forgot') {
    html = `
      <div class="auth-header">
        <h2>Reset Password 🔐</h2>
        <p>Enter your email to reset your password</p>
      </div>
      <form class="auth-form" onsubmit="handleForgotPassword(event)">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" placeholder="Enter your email" required>
        </div>
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Send Reset Link</button>
      </form>
      <p class="auth-switch"><a href="#" onclick="openModal('signin')">Back to Sign In</a></p>
    `;
  }

  content.innerHTML = html;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

async function handleSignIn(e) {
  e.preventDefault();
  
  // Get form data
  const form = e.target;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;
  
  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Signing in...';
  submitBtn.disabled = true;
  
  try {
    // Call backend API
    const data = await window.apiService.signin(email, password);
    
    // Update state with user data
    state.isLoggedIn = true;
    state.currentUser = data.user;
    
    // Save to localStorage
    saveUserData();
    
    closeModal();
    showToast(`Welcome back, ${data.user.name}!`, 'success');
    updateAuthUI();
  } catch (error) {
    showToast(error.message || 'Sign in failed. Please try again.', 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

async function handleSignUp(e) {
  e.preventDefault();
  
  // Get form data
  const form = e.target;
  const name = form.querySelector('input[type="text"]').value;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;
  
  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Creating account...';
  submitBtn.disabled = true;
  
  try {
    // Call backend API
    const data = await window.apiService.signup(name, email, password);
    
    // Update state with user data
    state.isLoggedIn = true;
    state.currentUser = data.user;
    
    // Save to localStorage
    saveUserData();
    
    closeModal();
    showToast(`Welcome to StayBNB, ${data.user.name}! 🎉`, 'success');
    updateAuthUI();
  } catch (error) {
    showToast(error.message || 'Signup failed. Please try again.', 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

function handleForgotPassword(e) {
  e.preventDefault();
  closeModal();
  showToast('Password reset link sent to your email!', 'success');
}

function socialLogin(provider) {
  state.isLoggedIn = true;
  state.currentUser = { name: 'Social User', email: 'social@example.com' };
  saveUserData();
  closeModal();
  showToast(`Signed in with ${provider}!`, 'success');
  updateAuthUI();
}

function updateAuthUI() {
  const navAuth = document.querySelector('.nav-auth');
  if (!navAuth) return;

  if (state.isLoggedIn) {
    const userInitial = state.currentUser?.name?.charAt(0).toUpperCase() || 'U';
    navAuth.innerHTML = `
      <button class="btn btn-ghost" onclick="showWishlist()">❤️ Wishlist (${state.wishlist.length})</button>
      <button class="profile-btn" onclick="showProfile()">
        <div class="profile-btn-avatar">${userInitial}</div>
        <span class="profile-btn-name">${state.currentUser?.name || 'Profile'}</span>
      </button>
    `;
  } else {
    navAuth.innerHTML = `
      <button class="btn btn-ghost" onclick="openModal('signin')">Sign In</button>
      <button class="btn btn-primary" onclick="openModal('signup')">Get Started</button>
    `;
  }
}

// ============================================
// WISHLIST
// ============================================
function initWishlist() {
  // Check for saved wishlist
  const saved = localStorage.getItem('staybnb_wishlist');
  if (saved) {
    state.wishlist = JSON.parse(saved);
  }
}

function toggleWishlist(event, productId) {
  event.stopPropagation();
  
  const index = state.wishlist.indexOf(productId);
  if (index > -1) {
    state.wishlist.splice(index, 1);
    showToast('Removed from wishlist', 'success');
  } else {
    state.wishlist.push(productId);
    showToast('Added to wishlist! ❤️', 'success');
  }
  
  // Save to localStorage
  localStorage.setItem('staybnb_wishlist', JSON.stringify(state.wishlist));
  
  // Update button state
  const btn = event.target;
  btn.classList.toggle('active', state.wishlist.includes(productId));
  
  // Update auth UI if needed
  updateAuthUI();
}

function showWishlist() {
  if (!state.isLoggedIn) {
    openModal('signin');
    return;
  }
  
  showToast(`You have ${state.wishlist.length} items in your wishlist!`, 'success');
  // Could navigate to wishlist page
}

// ============================================
// UPLOAD
// ============================================
function initUpload() {
  // Upload area functionality
  const uploadArea = document.querySelector('.upload-area');
  if (!uploadArea) return;

  uploadArea.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleImageUpload;
    input.click();
  });

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  });
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) {
    processImage(file);
  }
}

function processImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    state.uploadedImage = e.target.result;
    
    // Show preview
    const preview = document.querySelector('.upload-preview');
    if (preview) {
      preview.classList.add('active');
      const img = preview.querySelector('.preview-image');
      if (img) {
        img.src = e.target.result;
      }
    }
    
    showToast('Image uploaded! Select your preferences and analyze.', 'success');
  };
  reader.readAsDataURL(file);
}

// ============================================
// ANIMATIONS
// ============================================
function initAnimations() {
  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('loaded');
      }
    });
  }, { threshold: 0.1 });

  // Observe elements
  document.querySelectorAll('.step-card, .feature-card, .gallery-item, .testimonial-card').forEach(el => {
    el.classList.add('page-transition');
    observer.observe(el);
  });
}

// ============================================
// USER DATA
// ============================================
function loadUserData() {
  const saved = localStorage.getItem('staybnb_user');
  if (saved) {
    const userData = JSON.parse(saved);
    state.currentUser = userData.user;
    state.isLoggedIn = userData.isLoggedIn;
    updateAuthUI();
  }
}

function saveUserData() {
  localStorage.setItem('staybnb_user', JSON.stringify({
    user: state.currentUser,
    isLoggedIn: state.isLoggedIn
  }));
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'success') {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) {
    existing.remove();
  }

  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
    <span class="toast-message">${message}</span>
  `;

  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// ============================================
// PROFILE - Show Profile Modal
// ============================================
function showProfile() {
  if (!state.isLoggedIn) {
    openModal('signin');
    return;
  }
  
  const profileModal = document.createElement('div');
  profileModal.className = 'modal-overlay';
  profileModal.id = 'profileModal';
  profileModal.onclick = function(e) {
    if (e.target === this) closeProfileModal();
  };
  
  profileModal.innerHTML = `
    <div class="profile-modal glass-card" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="closeProfileModal()">✕</button>
      
      <div class="profile-header">
        <div class="profile-avatar">
          ${state.currentUser?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h2>${state.currentUser?.name || 'User'}</h2>
        <p>${state.currentUser?.email || 'user@example.com'}</p>
      </div>
      
      <div class="profile-stats">
        <div class="stat-box">
          <span class="stat-number">${state.wishlist.length}</span>
          <span class="stat-label">Wishlist</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">0</span>
          <span class="stat-label">Analyses</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">0</span>
          <span class="stat-label">Styles</span>
        </div>
      </div>
      
      <div class="profile-menu">
        <button class="profile-menu-item" onclick="startAIAnalysis()">
          <span class="menu-icon">🔍</span>
          <span>AI Style Analysis</span>
        </button>
        <button class="profile-menu-item" onclick="showStyleProfile()">
          <span class="menu-icon">🎨</span>
          <span>Style Profile</span>
        </button>
        <button class="profile-menu-item" onclick="showGenderRecommendations()">
          <span class="menu-icon">👔</span>
          <span>Gender Recommendations</span>
        </button>
        <button class="profile-menu-item" onclick="showColorScience()">
          <span class="menu-icon">🌈</span>
          <span>Color Science</span>
        </button>
        <button class="profile-menu-item" onclick="showClothTypes()">
          <span class="menu-icon">👗</span>
          <span>Browse Cloth Types</span>
        </button>
        <button class="profile-menu-item" onclick="showReelsWithSound()">
          <span class="menu-icon">🎬</span>
          <span>Fashion Reels</span>
        </button>
      </div>
      
      <div class="profile-actions">
        <button class="btn btn-primary" onclick="closeProfileModal()">Continue Exploring</button>
        <button class="btn btn-ghost" onclick="handleSignOut()">Sign Out</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(profileModal);
  document.body.style.overflow = 'hidden';
  addProfileModalStyles();
}

function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

function addProfileModalStyles() {
  if (document.getElementById('profileModalStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'profileModalStyles';
  style.textContent = `
    .profile-modal {
      max-width: 450px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 40px;
      position: relative;
    }
    .profile-header { text-align: center; margin-bottom: 30px; }
    .profile-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      font-weight: bold;
      margin: 0 auto 20px;
    }
    .profile-header h2 { margin: 0 0 8px; font-size: 28px; }
    .profile-header p { margin: 0; opacity: 0.7; }
    .profile-stats {
      display: flex;
      justify-content: space-around;
      margin-bottom: 30px;
      padding: 20px;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
    }
    .stat-box { text-align: center; }
    .stat-number { display: block; font-size: 24px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 12px; opacity: 0.7; }
    .profile-menu { margin-bottom: 30px; }
    .profile-menu-item {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 16px;
      background: rgba(255,255,255,0.05);
      border: none;
      border-radius: 12px;
      margin-bottom: 10px;
      color: white;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 16px;
    }
    .profile-menu-item:hover {
      background: rgba(255,255,255,0.1);
      transform: translateX(5px);
    }
    .menu-icon { margin-right: 15px; font-size: 20px; }
    .profile-actions { display: flex; flex-direction: column; gap: 10px; }
  `;
  document.head.appendChild(style);
}

function handleSignOut() {
  state.isLoggedIn = false;
  state.currentUser = null;
  localStorage.removeItem('staybnb_token');
  localStorage.removeItem('staybnb_user');
  closeProfileModal();
  updateAuthUI();
  showToast('Signed out successfully!', 'success');
}

// ============================================
// CAMERA UPLOAD
// ============================================
function openCamera() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';
  input.onchange = handleImageUpload;
  input.click();
}

// ============================================
// AI ANALYSIS - Random Results
// ============================================
async function startAIAnalysis() {
  closeProfileModal();
  
  const analysisModal = document.createElement('div');
  analysisModal.className = 'modal-overlay';
  analysisModal.id = 'analysisModal';
  analysisModal.innerHTML = `
    <div class="analysis-modal glass-card" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="closeAnalysisModal()">✕</button>
      <div class="analysis-header">
        <h2>🔍 AI Style Analysis</h2>
        <p>Upload a photo or use camera for instant AI analysis</p>
      </div>
      <div class="upload-options">
        <div class="upload-option" onclick="openCamera()">
          <div class="option-icon">📷</div>
          <h3>Take Photo</h3>
          <p>Use your camera</p>
        </div>
        <div class="upload-option" onclick="triggerFileUpload()">
          <div class="option-icon">📁</div>
          <h3>Upload Photo</h3>
          <p>From gallery</p>
        </div>
      </div>
      <div class="analysis-preview" id="analysisPreview" style="display:none;">
        <img id="previewImage" src="" alt="Preview">
        <div class="analyzing-overlay" id="analyzingOverlay">
          <div class="analyzing-spinner"></div>
          <p>Analyzing your features...</p>
        </div>
      </div>
      <div class="analysis-results" id="analysisResults" style="display:none;"></div>
    </div>
  `;
  
  document.body.appendChild(analysisModal);
  document.body.style.overflow = 'hidden';
  addAnalysisModalStyles();
}

function triggerFileUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) processAnalysisImage(file);
  };
  input.click();
}

function processAnalysisImage(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const preview = document.getElementById('analysisPreview');
    const previewImg = document.getElementById('previewImage');
    const overlay = document.getElementById('analyzingOverlay');
    
    preview.style.display = 'block';
    previewImg.src = e.target.result;
    overlay.style.display = 'flex';
    
    setTimeout(() => {
      overlay.style.display = 'none';
      showRandomAnalysisResults();
    }, 2000);
  };
  reader.readAsDataURL(file);
}

function closeAnalysisModal() {
  const modal = document.getElementById('analysisModal');
  if (modal) { modal.remove(); document.body.style.overflow = ''; }
}

function showRandomAnalysisResults() {
  const resultsContainer = document.getElementById('analysisResults');
  const preview = document.getElementById('analysisPreview');
  
  preview.style.display = 'none';
  resultsContainer.style.display = 'block';
  
  const faceShapes = ['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Long'];
  const skinTones = ['Fair', 'Light', 'Medium', 'Olive', 'Brown', 'Dark'];
  const undertones = ['Warm', 'Cool', 'Neutral'];
  const bodyShapes = ['Hourglass', 'Pear', 'Apple', 'Rectangle', 'Inverted Triangle'];
  
  const randomFaceShape = faceShapes[Math.floor(Math.random() * faceShapes.length)];
  const randomSkinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
  const randomUndertone = undertones[Math.floor(Math.random() * undertones.length)];
  const randomBodyShape = bodyShapes[Math.floor(Math.random() * bodyShapes.length)];
  
  const colorPalettes = [
    { name: 'Autumn Warm', colors: ['#8B4513', '#D2691E', '#CD853F', '#DEB887'] },
    { name: 'Spring Fresh', colors: ['#98FB98', '#F0E68C', '#FFB6C1', '#E6E6FA'] },
    { name: 'Winter Cool', colors: ['#000080', '#4169E1', '#708090', '#FFFFFF'] },
    { name: 'Summer Soft', colors: ['#87CEEB', '#D8BFD8', '#FFDAB9', '#F5F5DC'] }
  ];
  const randomPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  
  const hairstyles = [
    { name: 'Layered Bob', desc: 'Flatters your face shape perfectly' },
    { name: 'Long Waves', desc: 'Adds softness and volume' },
    { name: 'Textured Pixie', desc: 'Modern and chic look' },
    { name: 'Side Swept Bangs', desc: 'Sophisticated and elegant' },
    { name: 'Beachy Waves', desc: 'Casual and effortless style' }
  ];
  const randomHairstyle = hairstyles[Math.floor(Math.random() * hairstyles.length)];
  
  const outfits = [
    { outfit: 'Navy blazer with cream trousers', occasion: 'Business' },
    { outfit: 'Rust midi dress with leather jacket', occasion: 'Casual' },
    { outfit: 'Burgundy formal suit', occasion: 'Formal' },
    { outfit: 'Denim on denim with statement belt', occasion: 'Weekend' }
  ];
  
  resultsContainer.innerHTML = `
    <div class="results-header"><h3>✨ Your AI Analysis Results</h3></div>
    <div class="result-section">
      <h4>👤 Facial Analysis</h4>
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Face Shape</span><span class="result-value">${randomFaceShape}</span></div>
        <div class="result-item"><span class="result-label">Skin Tone</span><span class="result-value">${randomSkinTone}</span></div>
        <div class="result-item"><span class="result-label">Undertone</span><span class="result-value">${randomUndertone}</span></div>
        <div class="result-item"><span class="result-label">Body Shape</span><span class="result-value">${randomBodyShape}</span></div>
      </div>
    </div>
    <div class="result-section">
      <h4>🎨 Color Science</h4>
      <p class="palette-name">Recommended: ${randomPalette.name}</p>
      <div class="color-palette">${randomPalette.colors.map(c => `<div class="palette-color" style="background:${c}"></div>`).join('')}</div>
    </div>
    <div class="result-section">
      <h4>💇 Hairstyle Suggestion</h4>
      <div class="hairstyle-recommendation"><strong>${randomHairstyle.name}</strong><p>${randomHairstyle.desc}</p></div>
    </div>
    <div class="result-section">
      <h4>👗 Outfit Suggestions</h4>
      ${outfits.map(o => `<div class="outfit-suggestion"><span class="outfit-name">${o.outfit}</span><span class="outfit-occasion">${o.occasion}</span></div>`).join('')}
    </div>
    <div class="result-actions">
      <button class="btn btn-primary" onclick="closeAnalysisModal()">Done</button>
      <button class="btn btn-ghost" onclick="startAIAnalysis()">Analyze Again</button>
    </div>
  `;
}

function addAnalysisModalStyles() {
  if (document.getElementById('analysisModalStyles')) return;
  const style = document.createElement('style');
  style.id = 'analysisModalStyles';
  style.textContent = `
    .analysis-modal { max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 40px; position: relative; }
    .analysis-header { text-align: center; margin-bottom: 30px; }
    .analysis-header h2 { margin: 0 0 10px; }
    .analysis-header p { margin: 0; opacity: 0.7; }
    .upload-options { display: flex; gap: 20px; margin-bottom: 30px; }
    .upload-option { flex: 1; padding: 30px; background: rgba(255,255,255,0.05); border: 2px dashed rgba(255,255,255,0.2); border-radius: 16px; text-align: center; cursor: pointer; transition: all 0.3s; }
    .upload-option:hover { background: rgba(255,255,255,0.1); border-color: #667eea; }
    .option-icon { font-size: 48px; margin-bottom: 15px; }
    .upload-option h3 { margin: 0 0 8px; }
    .upload-option p { margin: 0; opacity: 0.7; font-size: 14px; }
    .analysis-preview { margin-bottom: 30px; position: relative; }
    .analysis-preview img { width: 100%; border-radius: 12px; }
    .analyzing-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 12px; }
    .analyzing-spinner { width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.3); border-top-color: #667eea; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .result-section { margin-bottom: 25px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px; }
    .result-section h4 { margin: 0 0 15px; color: #667eea; }
    .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .result-item { text-align: center; }
    .result-label { display: block; font-size: 12px; opacity: 0.7; margin-bottom: 5px; }
    .result-value { font-size: 18px; font-weight: bold; }
    .palette-name { margin: 0 0 15px; font-weight: bold; }
    .color-palette { display: flex; gap: 10px; }
    .palette-color { width: 50px; height: 50px; border-radius: 50%; border: 2px solid white; }
    .hairstyle-recommendation { text-align: center; }
    .hairstyle-recommendation strong { display: block; font-size: 18px; margin-bottom: 5px; }
    .hairstyle-recommendation p { margin: 0; opacity: 0.7; }
    .outfit-suggestion { display: flex; justify-content: space-between; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 10px; }
    .outfit-occasion { background: #667eea; padding: 2px 10px; border-radius: 12px; font-size: 12px; }
    .result-actions { display: flex; gap: 10px; }
    .result-actions .btn { flex: 1; }
  `;
  document.head.appendChild(style);
}

// ============================================
// STYLE PROFILE
// ============================================
function showStyleProfile() {
  closeProfileModal();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.onclick = function(e) { if (e.target === this) { this.remove(); document.body.style.overflow = ''; } };
  
  modal.innerHTML = `
    <div class="style-profile-modal glass-card" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="this.parentElement.parentElement.remove();document.body.style.overflow='';">✕</button>
      <h2>🎨 Your Style Profile</h2>
      <div class="style-form">
        <div class="form-group"><label>Gender</label><select id="styleGender"><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
        <div class="form-group"><label>Face Shape</label><select id="styleFaceShape"><option value="">Select face shape</option><option value="oval">Oval</option><option value="round">Round</option><option value="square">Square</option><option value="heart">Heart</option><option value="diamond">Diamond</option></select></div>
        <div class="form-group"><label>Skin Tone</label><select id="styleSkinTone"><option value="">Select skin tone</option><option value="fair">Fair</option><option value="light">Light</option><option value="medium">Medium</option><option value="olive">Olive</option><option value="brown">Brown</option><option value="dark">Dark</option></select></div>
        <div class="form-group"><label>Body Shape</label><select id="styleBodyShape"><option value="">Select body shape</option><option value="hourglass">Hourglass</option><option value="pear">Pear</option><option value="apple">Apple</option><option value="rectangle">Rectangle</option><option value="inverted">Inverted Triangle</option></select></div>
        <button class="btn btn-primary" style="width:100%" onclick="saveStyleProfile()">Save Profile</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

async function saveStyleProfile() {
  showToast('Style profile saved!', 'success');
  document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
  document.body.style.overflow = '';
}

// ============================================
// GENDER RECOMMENDATIONS
// ============================================
function showGenderRecommendations() {
  closeProfileModal();
  const recommendations = {
    male: { formal: ['Classic suits', 'Oxford shirts', 'Leather belts'], business: ['Blazers', 'Dress pants', 'Leather shoes'], casual: ['Polo shirts', 'Chinos', 'Sneakers'], party: ['Smart casual', 'Statement watches'] },
    female: { formal: ['Evening gowns', 'Silk blouses', 'Diamond jewelry'], business: ['Pencil skirts', 'Blazers', 'Professional dresses'], casual: ['Maxi dresses', 'Denim', 'Ballet flats'], party: ['Cocktail dresses', 'Statement jewelry'] },
    other: { formal: ['Tailored outfits', 'Statement pieces'], business: ['Smart casual', 'Layered looks'], casual: ['Mix and match', 'Comfortable fits'], party: ['Bold choices', 'Unique combinations'] }
  };
  const genders = ['male', 'female', 'other'];
  const randomGender = genders[Math.floor(Math.random() * genders.length)];
  const recs = recommendations[randomGender];
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.onclick = function(e) { if (e.target === this) { this.remove(); document.body.style.overflow = ''; } };
  
  modal.innerHTML = `
    <div class="gender-rec-modal glass-card" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="this.parentElement.parentElement.remove();document.body.style.overflow='';">✕</button>
      <h2>👔 Gender-Based Recommendations</h2>
      <p class="subtitle">Personalized suggestions for ${randomGender}</p>
      <div class="rec-categories">
        ${Object.entries(recs).map(([category, items]) => `<div class="rec-category"><h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3><ul>${items.map(item => `<li>${item}</li>`).join('')}</ul></div>`).join('')}
      </div>
      <button class="btn btn-primary" style="width:100%" onclick="this.parentElement.parentElement.remove();document.body.style.overflow='';">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  const style = document.createElement('style');
  style.textContent = `.gender-rec-modal { max-width: 500px; width: 90%; padding: 40px; position: relative; } .gender-rec-modal .subtitle { text-align: center; opacity: 0.7; margin-bottom: 30px; } .rec-categories { margin-bottom: 30px; } .rec-category { margin-bottom: 20px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px; } .rec-category h3 { margin: 0 0 15px; color: #667eea; } .rec-category ul { margin: 0; padding-left: 20px; } .rec-category li { margin-bottom: 8px; opacity: 0.8; }`;
  document.head.appendChild(style);
}

// ============================================
// COLOR SCIENCE
// ============================================
function showColorScience() {
  closeProfileModal();
  const palettes = [
    { name: 'Spring Fresh', desc: 'Bright and warm colors', colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'] },
    { name: 'Summer Soft', desc: 'Cool and muted tones', colors: ['#A8D8EA', '#AA96DA', '#FCBAD3', '#FFFFD2'] },
    { name: 'Autumn Warm', desc: 'Rich and earthy tones', colors: ['#8B4513', '#D2691E', '#CD853F', '#DEB887'] },
    { name: 'Winter Cool', desc: 'Bold and contrast', colors: ['#000080', '#4169E1', '#DC143C', '#FFFFFF'] }
  ];
  const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.onclick = function(e) { if (e.target === this) { this.remove(); document.body.style.overflow = ''; } };
  
  modal.innerHTML = `
    <div class="color-science-modal glass-card" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="this.parentElement.parentElement.remove();document.body.style.overflow='';">✕</button>
      <h2>🌈 Color Science</h2>
      <p class="subtitle">Your perfect color palette</p>
      <div class="palette-display">
        <h3>${randomPalette.name}</h3>
        <p>${randomPalette.desc}</p>
        <div class="palette-colors">${randomPalette.colors.map(c => `<div class="color-swatch" style="background:${c}"><span>${c}</span></div>`).join('')}</div>
      </div>
      <div class="color-tips"><h4>Tips for You</h4><ul><li>Choose colors that complement your skin undertone</li><li>Mix and match from your palette for cohesive outfits</li><li>Use neutral colors as base and accent with bold colors</li></ul></div>
      <button class="btn btn-primary" style="width:100%" onclick="this.parentElement.parentElement.remove();document.body.style.overflow='';">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  const style = document.createElement('style');
  style.textContent = `.color-science-modal { max-width: 500px; width: 90%; padding: 40px; position: relative; } .color-science-modal .subtitle { text-align: center; opacity: 0.7; margin-bottom: 30px; } .palette-display { text-align: center; margin-bottom: 30px; } .palette-display h3 { margin: 0 0 10px; font-size: 24px; } .palette-display p { margin: 0 0 20px; opacity: 0.7; } .palette-colors { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; } .color-swatch { width: 70px; height: 70px; border-radius: 12px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; font-size: 10px; font-weight: bold; cursor: pointer; transition: transform 0.3s; } .color-swatch:hover { transform: scale(1.1); } .color-tips { padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 30px; } .color-tips h4 { margin: 0 0 15px; } .color-tips ul { margin: 0; padding-left: 20px; } .color-tips li { margin-bottom: 8px; opacity: 0.8; }`;
  document.head.appendChild(style);
}

// ============================================
// CLOTH TYPES
// ============================================
function showClothTypes() {
  closeProfileModal();
  const clothTypes = [
    { name: 'Silk', category: 'luxury', desc: 'Luxurious & elegant', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300' },
    { name: 'Cotton', category: 'casual', desc: 'Comfortable & breathable', image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=300' },
    { name: 'Linen', category: 'summer', desc: 'Light & breezy', image: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=300' },
    { name: 'Velvet', category: 'luxury', desc: 'Rich & royal', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300' },
    { name: 'Chiffon', category: 'formal', desc: 'Flowy & feminine', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=300' },
    { name: 'Denim', category: 'casual', desc: 'Casual & classic', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300' },
    { name: 'Wool', category: 'winter', desc: 'Warm & cozy', image: 'https://images.unsplash.com/photo-1612413156683-1628d390d9b9?w=300' },
    { name: 'Satin', category: 'luxury', desc: 'Shiny & smooth', image: 'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=300' }
  ];
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.onclick = function(e) { if (e.target === this) { this.remove(); document.body.style.overflow = ''; } };
  
  modal.innerHTML = `
    <div class="cloth-types-modal glass-card" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="this.parentElement.parentElement.remove();document.body.style.overflow='';">✕</button>
      <h2>👗 Browse Cloth Types</h2>
      <p class="subtitle">Explore different fabric options</p>
      <div class="cloth-search"><input type="text" id="clothSearch" placeholder="Search cloth types..." oninput="filterClothTypes(this.value)"></div>
      <div class="cloth-grid" id="clothGrid">
        ${clothTypes.map((cloth) => `<div class="cloth-card" data-name="${cloth.name.toLowerCase()}" data-category="${cloth.category}"><img src="${cloth.image}" alt="${cloth.name}"><div class="cloth-info"><h4>${cloth.name}</h4><p>${cloth.desc}</p><span class="cloth-category">${cloth.category}</span></div></div>`).join('')}
      </div>
      <button class="btn btn-primary" style="width:100%" onclick="this.parentElement.parentElement.remove();document.body.style.overflow='';">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  const style = document.createElement('style');
  style.textContent = `.cloth-types-modal { max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 40px; position: relative; } .cloth-types-modal .subtitle { text-align: center; opacity: 0.7; margin-bottom: 20px; } .cloth-search { margin-bottom: 25px; } .cloth-search input { width: 100%; padding: 14px 18px; border-radius: 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; font-size: 16px; } .cloth-search input::placeholder { color: rgba(255,255,255,0.5); } .cloth-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px; } .cloth-card { border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.3s; } .cloth-card:hover { transform: scale(1.02); } .cloth-card img { width: 100%; height: 120px; object-fit: cover; } .cloth-info { padding: 15px; background: rgba(255,255,255,0.05); } .cloth-info h4 { margin: 0 0 5px; } .cloth-info p { margin: 0 0 10px; font-size: 12px; opacity: 0.7; } .cloth-category { font-size: 10px; background: #667eea; padding: 3px 10px; border-radius: 10px; }`;
  document.head.appendChild(style);
}

function filterClothTypes(query) {
  const cards = document.querySelectorAll('.cloth-card');
  query = query.toLowerCase();
  cards.forEach(card => {
    const name = card.dataset.name;
    const category = card.dataset.category;
    if (name.includes(query) || category.includes(query)) card.style.display = 'block';
    else card.style.display = 'none';
  });
}

// ============================================
// FASHION REELS WITH SOUND
// ============================================
function showReelsWithSound() {
  closeProfileModal();
  const reels = [
    { id: 1, title: 'Summer Style Trends', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', likes: '12.5K', comments: '234' },
    { id: 2, title: 'Office Wear Essentials', thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400', likes: '8.2K', comments: '156' },
    { id: 3, title: 'Party Wear Guide', thumbnail: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400', likes: '15.8K', comments: '412' },
    { id: 4, title: 'Casual Weekend Looks', thumbnail: 'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=400', likes: '9.1K', comments: '189' },
    { id: 5, title: 'Wedding Guest Outfits', thumbnail: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', likes: '22.3K', comments: '567' },
    { id: 6, title: 'Date Night Style', thumbnail: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400', likes: '18.7K', comments: '345' }
  ];
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay reels-modal';
  modal.onclick = function(e) { if (e.target === this) { this.remove(); document.body.style.overflow = ''; } };
  
  modal.innerHTML = `
    <div class="reels-container glass-card" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="this.parentElement.parentElement.remove();document.body.style.overflow='';">✕</button>
      <h2>🎬 Fashion Reels</h2>
      <p class="subtitle">Watch trending fashion videos with sound</p>
      <div class="reels-list" id="reelsList">
        ${reels.map((reel) => `
          <div class="reel-item" onclick="playReel(${reel.id}, '${reel.title}', '${reel.thumbnail}')">
            <div class="reel-thumb">
              <img src="${reel.thumbnail}" alt="${reel.title}">
              <div class="play-overlay"><span>▶</span></div>
              <div class="reel-sound-badge">🔊 Sound On</div>
            </div>
            <div class="reel-details">
              <h4>${reel.title}</h4>
              <div class="reel-stats"><span>❤️ ${reel.likes}</span><span>💬 ${reel.comments}</span></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  const style = document.createElement('style');
  style.textContent = `.reels-modal { background: rgba(0,0,0,0.9); } .reels-container { max-width: 450px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 40px; position: relative; } .reels-container .subtitle { text-align: center; opacity: 0.7; margin-bottom: 25px; } .reels-list { display: flex; flex-direction: column; gap: 20px; } .reel-item { border-radius: 16px; overflow: hidden; cursor: pointer; transition: transform 0.3s; } .reel-item:hover { transform: scale(1.02); } .reel-thumb { position: relative; height: 200px; } .reel-thumb img { width: 100%; height: 100%; object-fit: cover; } .play-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; } .reel-item:hover .play-overlay { opacity: 1; } .play-overlay span { font-size: 50px; color: white; } .reel-sound-badge { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); padding: 5px 12px; border-radius: 20px; font-size: 12px; } .reel-details { padding: 15px; background: rgba(255,255,255,0.05); } .reel-details h4 { margin: 0 0 10px; } .reel-stats { display: flex; gap: 15px; font-size: 14px; opacity: 0.7; }`;
  document.head.appendChild(style);
}

function playReel(id, title, thumbnail) {
  showToast(`Playing: ${title} 🔊`, 'success');
  const playModal = document.createElement('div');
  playModal.className = 'modal-overlay';
  playModal.innerHTML = `
    <div class="video-player" onclick="event.stopPropagation()">
      <button class="close-video" onclick="this.parentElement.remove();document.body.style.overflow='';">✕</button>
      <div class="video-placeholder">
        <img src="${thumbnail}" alt="${title}">
        <div class="video-overlay">
          <div class="video-controls">
            <button class="control-btn" onclick="this.classList.toggle('active');toggleReelSound()"><span id="soundIcon">🔊</span></button>
            <div class="progress-bar"><div class="progress"></div></div>
            <button class="control-btn" onclick="this.parentElement.parentElement.parentElement.remove();document.body.style.overflow=''">❚❚</button>
          </div>
        </div>
      </div>
      <div class="video-info">
        <h3>${title}</h3>
        <p>Fashion Reel #${id}</p>
        <div class="video-actions">
          <button class="action-btn" onclick="likeReel(${id})">❤️ <span>Like</span></button>
          <button class="action-btn" onclick="shareReel(${id})">📤 <span>Share</span></button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(playModal);
  document.body.style.overflow = 'hidden';
  
  const style = document.createElement('style');
  style.textContent = `.video-player { max-width: 400px; width: 90%; background: #000; border-radius: 16px; overflow: hidden; position: relative; } .close-video { position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(0,0,0,0.5); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 18px; } .video-placeholder { position: relative; height: 500px; } .video-placeholder img { width: 100%; height: 100%; object-fit: cover; } .video-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); } .video-controls { display: flex; align-items: center; gap: 15px; } .control-btn { background: none; border: none; color: white; font-size: 24px; cursor: pointer; } .control-btn.active { color: #667eea; } .progress-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; } .progress { width: 30%; height: 100%; background: white; border-radius: 2px; } .video-info { padding: 20px; } .video-info h3 { margin: 0 0 5px; } .video-info p { margin: 0 0 15px; opacity: 0.7; } .video-actions { display: flex; gap: 15px; } .action-btn { flex: 1; padding: 12px; background: rgba(255,255,255,0.1); border: none; border-radius: 8px; color: white; cursor: pointer; } .action-btn span { margin-left: 8px; }`;
  document.head.appendChild(style);
}

function toggleReelSound() {
  const icon = document.getElementById('soundIcon');
  if (icon) icon.textContent = icon.textContent === '🔊' ? '🔇' : '🔊';
}

function likeReel(id) { showToast('Liked! ❤️', 'success'); }
function shareReel(id) { showToast('Share link copied! 📤', 'success'); }

// ============================================
// INFLUENCER SECTION
// ============================================
// Create influencer section dynamically
document.addEventListener('DOMContentLoaded', () => {
  createInfluencerSection();
  createShoppingSection();
});

function createInfluencerSection() {
  const testimonials = document.getElementById('testimonials');
  if (!testimonials) return;

  const influencerSection = document.createElement('section');
  influencerSection.className = 'influencer-section';
  influencerSection.innerHTML = `
    <div style="text-align:center;margin-bottom:40px;">
      <div class="section-tag">📱 Fashion Reels</div>
      <h2 class="section-title">Stay <span class="gradient-text">Trendy</span></h2>
      <p class="section-sub" style="margin:0 auto;">Watch trending fashion reels from top influencers</p>
    </div>
    <div class="reels-grid" id="reelsGrid">
      <div class="reel-card">
        <div class="reel-thumbnail">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300" alt="Fashion Reel">
          <div class="reel-play">▶</div>
        </div>
        <div class="reel-info">
          <h4>Summer Style Trends 2024</h4>
          <div class="reel-stats">
            <span>❤️ 12.5K</span>
            <span>💬 234</span>
            <span>📤 1.2K</span>
          </div>
          <div class="reel-comments">
            <div class="comment">
              <div class="comment-avatar">A</div>
              <div class="comment-text">
                <strong>Arshi</strong>
                Love this look! Where can I get this dress? 😍
              </div>
            </div>
            <div class="comment">
              <div class="comment-avatar">P</div>
              <div class="comment-text">
                <strong>Priya</strong>
                Perfect for summer parties!
              </div>
            </div>
            <div class="comment-input">
              <input type="text" placeholder="Add a comment...">
              <button onclick="postComment(this)">Post</button>
            </div>
          </div>
        </div>
      </div>
      <div class="reel-card">
        <div class="reel-thumbnail">
          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300" alt="Fashion Reel">
          <div class="reel-play">▶</div>
        </div>
        <div class="reel-info">
          <h4>Office Wear Essentials</h4>
          <div class="reel-stats">
            <span>❤️ 8.2K</span>
            <span>💬 156</span>
            <span>📤 890</span>
          </div>
          <div class="reel-comments">
            <div class="comment">
              <div class="comment-avatar">M</div>
              <div class="comment-text">
                <strong>Meera</strong>
                These combinations are amazing!
              </div>
            </div>
            <div class="comment-input">
              <input type="text" placeholder="Add a comment...">
              <button onclick="postComment(this)">Post</button>
            </div>
          </div>
        </div>
      </div>
      <div class="reel-card">
        <div class="reel-thumbnail">
          <img src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300" alt="Fashion Reel">
          <div class="reel-play">▶</div>
        </div>
        <div class="reel-info">
          <h4>Party Wear Guide</h4>
<div class="reel-stats">
            <span>❤️ 15.8K</span>
            <span>💬 412</span>
            <span>📤 2.1K</span>
          </div>
          <div class="reel-comments">
            <div class="comment">
              <div class="comment-avatar">S</div>
              <div class="comment-text">
                <strong>Sonia</strong>
                Need this for my friend's sangeet! 💃
              </div>
            </div>
            <div class="comment-input">
              <input type="text" placeholder="Add a comment...">
              <button onclick="postComment(this)">Post</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (testimonials.parentNode) {
    testimonials.parentNode.insertBefore(influencerSection, testimonials.nextSibling);
  }
}

function postComment(btn) {
  const input = btn.previousElementSibling;
  const comment = input.value.trim();
  
  if (comment) {
    showToast('Comment posted! 💬', 'success');
    input.value = '';
  } else {
    showToast('Please write a comment first', 'error');
  }
}

// ============================================
// SHOPPING SECTION
// ============================================
function createShoppingSection() {
  const influencerSection = document.querySelector('.influencer-section');
  if (!influencerSection) return;

  const shoppingSection = document.createElement('section');
  shoppingSection.className = 'shopping-section';
  shoppingSection.innerHTML = `
    <div style="text-align:center;margin-bottom:40px;">
      <div class="section-tag">🛍️ Shop Now</div>
      <h2 class="section-title">Curated <span class="gradient-text">For You</span></h2>
      <p class="section-sub" style="margin:0 auto;">Best fashion picks from top Indian retailers</p>
    </div>
    <div class="product-grid" id="productGrid">
      <div class="product-card">
        <div class="product-image">
          <img src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300" alt="Product">
          <span class="product-badge badge-trending">Trending</span>
          <div class="product-actions">
            <button class="product-action-btn" onclick="toggleWishlist(event, 1)">♥</button>
            <button class="product-action-btn" onclick="quickView()">👁️</button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-brand">Zara</div>
          <div class="product-name">Classic Denim Jacket</div>
          <div class="product-price">
            <span class="current-price">₹4,999</span>
            <span class="original-price">₹7,999</span>
            <span class="discount">-37%</span>
          </div>
          <div class="product-retailers">
            <button class="retailer-btn" onclick="shopAt('amazon')">Amazon</button>
            <button class="retailer-btn" onclick="shopAt('myntra')">Myntra</button>
            <button class="retailer-btn" onclick="shopAt('zara')">Zara</button>
          </div>
        </div>
      </div>
      <div class="product-card">
        <div class="product-image">
          <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300" alt="Product">
          <span class="product-badge badge-new">New</span>
          <div class="product-actions">
            <button class="product-action-btn" onclick="toggleWishlist(event, 2)">♥</button>
            <button class="product-action-btn" onclick="quickView()">👁️</button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-brand">Myntra</div>
          <div class="product-name">Silk Evening Gown</div>
          <div class="product-price">
            <span class="current-price">₹8,499</span>
            <span class="original-price">₹12,999</span>
            <span class="discount">-35%</span>
          </div>
          <div class="product-retailers">
            <button class="retailer-btn" onclick="shopAt('amazon')">Amazon</button>
            <button class="retailer-btn" onclick="shopAt('myntra')">Myntra</button>
            <button class="retailer-btn" onclick="shopAt('zara')">Zara</button>
          </div>
        </div>
      </div>
      <div class="product-card">
        <div class="product-image">
          <img src="https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=300" alt="Product">
          <span class="product-badge badge-sale">Sale</span>
          <div class="product-actions">
            <button class="product-action-btn" onclick="toggleWishlist(event, 3)">♥</button>
            <button class="product-action-btn" onclick="quickView()">👁️</button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-brand">Amazon</div>
          <div class="product-name">Casual Cotton Shirt</div>
          <div class="product-price">
            <span class="current-price">₹1,299</span>
            <span class="original-price">₹2,499</span>
            <span class="discount">-48%</span>
          </div>
          <div class="product-retailers">
            <button class="retailer-btn" onclick="shopAt('amazon')">Amazon</button>
            <button class="retailer-btn" onclick="shopAt('myntra')">Myntra</button>
            <button class="retailer-btn" onclick="shopAt('zara')">Zara</button>
          </div>
        </div>
      </div>
      <div class="product-card">
        <div class="product-image">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300" alt="Product">
          <div class="product-actions">
            <button class="product-action-btn" onclick="toggleWishlist(event, 4)">♥</button>
            <button class="product-action-btn" onclick="quickView()">👁️</button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-brand">Zara</div>
          <div class="product-name">Floral Summer Dress</div>
          <div class="product-price">
            <span class="current-price">₹3,599</span>
            <span class="original-price">₹5,999</span>
            <span class="discount">-40%</span>
          </div>
          <div class="product-retailers">
            <button class="retailer-btn" onclick="shopAt('amazon')">Amazon</button>
            <button class="retailer-btn" onclick="shopAt('myntra')">Myntra</button>
            <button class="retailer-btn" onclick="shopAt('zara')">Zara</button>
          </div>
        </div>
      </div>
    </div>
  `;

  if (influencerSection.parentNode) {
    influencerSection.parentNode.insertBefore(shoppingSection, influencerSection.nextSibling);
  }
}

function shopAt(retailer) {
  const urls = {
    amazon: 'https://www.amazon.in',
    myntra: 'https://www.myntra.com',
    zara: 'https://www.zara.com/in'
  };
  
  showToast(`Opening ${retailer.charAt(0).toUpperCase() + retailer.slice(1)}...`, 'success');
  // In production, would open the actual product URL
  // window.open(urls[retailer], '_blank');
}

function quickView() {
  showToast('Quick view coming soon!', 'success');
}

// ============================================
// PAGE LOADER (Add to HTML if not present)
// ============================================
function addPageLoader() {
  if (document.querySelector('.page-loader')) return;
  
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.innerHTML = `
    <div class="loader-logo">StayBNB</div>
    <div class="loader-spinner"></div>
  `;
  document.body.appendChild(loader);
}

// Add page loader
addPageLoader();

// ============================================
// EXPORT GLOBAL FUNCTIONS
// ============================================
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleWishlist = toggleWishlist;
window.filterGallery = filterGallery;
window.rotateCarousel = rotateCarousel;
window.goToSlide = goToSlide;
window.showWishlist = showWishlist;
window.showProfile = showProfile;
window.handleSignIn = handleSignIn;
window.handleSignUp = handleSignUp;
window.handleForgotPassword = handleForgotPassword;
window.socialLogin = socialLogin;
window.postComment = postComment;
window.shopAt = shopAt;
window.quickView = quickView;
window.closeProfileModal = closeProfileModal;
window.handleSignOut = handleSignOut;
window.openCamera = openCamera;
window.startAIAnalysis = startAIAnalysis;
window.triggerFileUpload = triggerFileUpload;
window.closeAnalysisModal = closeAnalysisModal;
window.showStyleProfile = showStyleProfile;
window.saveStyleProfile = saveStyleProfile;
window.showGenderRecommendations = showGenderRecommendations;
window.showColorScience = showColorScience;
window.showClothTypes = showClothTypes;
window.filterClothTypes = filterClothTypes;
window.showReelsWithSound = showReelsWithSound;
window.playReel = playReel;
window.toggleReelSound = toggleReelSound;
window.likeReel = likeReel;
window.shareReel = shareReel;
