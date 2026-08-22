document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     Theme Management (Dark / Light Mode)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');

  const getSavedTheme = () => localStorage.getItem('puzzroo-theme');
  const setSavedTheme = (theme) => localStorage.setItem('puzzroo-theme', theme);
  const getSystemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark-mode', theme === 'dark');
    document.body.classList.toggle('light-mode', theme === 'light');

    if (themeToggleBtn) {
      const isDark = theme === 'dark';
      themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggleBtn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');

      const toggleTextEl = themeToggleBtn.querySelector('.theme-toggle-text');
      if (toggleTextEl) {
        toggleTextEl.textContent = isDark ? 'Dark Mode' : 'Light Mode';
      }
    }
  };

  // Initialize theme based on saved preference or OS system preference
  const savedTheme = getSavedTheme();
  const initialTheme = savedTheme ? savedTheme : getSystemTheme();
  applyTheme(initialTheme);

  // Toggle theme listener
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme =
        document.documentElement.getAttribute('data-theme') ||
        (document.body.classList.contains('dark-mode') ? 'dark' : 'light');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      setSavedTheme(nextTheme);
    });
  }

  // Respond dynamically to system theme preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!getSavedTheme()) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  /* ==========================================================================
     Mobile Navigation Drawer Management
     ========================================================================== */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-btn-login, .mobile-btn-signup');

  const openMobileMenu = () => {
    if (mobileNavDrawer && mobileNavBackdrop) {
      mobileNavDrawer.classList.add('open');
      mobileNavBackdrop.classList.add('active');
      mobileNavDrawer.setAttribute('aria-hidden', 'false');
      if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeMobileMenu = () => {
    if (mobileNavDrawer && mobileNavBackdrop) {
      mobileNavDrawer.classList.remove('open');
      mobileNavBackdrop.classList.remove('active');
      mobileNavDrawer.setAttribute('aria-hidden', 'true');
      if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  };

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileNavDrawer && mobileNavDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }

  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', closeMobileMenu);
  }

  // Close menu when clicking links inside drawer
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Handle Escape key to close mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNavDrawer && mobileNavDrawer.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // Mobile Theme Toggle sync
  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener('click', () => {
      const currentTheme =
        document.documentElement.getAttribute('data-theme') ||
        (document.body.classList.contains('dark-mode') ? 'dark' : 'light');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      setSavedTheme(nextTheme);
    });
  }

  /* ==========================================================================
     FAQ Accordion Interactivity
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other open items for clean accordion effect
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const btn = otherItem.querySelector('.faq-question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle clicked item
      if (isActive) {
        item.classList.remove('active');
        questionBtn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ==========================================================================
     Authentication & Session Management System (Phase 1 Frontend)
     ========================================================================== */
  
  // 1. Get logged in user session and users database from localStorage
  const getSessionUser = () => JSON.parse(localStorage.getItem('puzzroo_logged_in_user'));
  const setSessionUser = (user) => localStorage.setItem('puzzroo_logged_in_user', JSON.stringify(user));
  const removeSessionUser = () => localStorage.removeItem('puzzroo_logged_in_user');
  
  const getUsersDB = () => JSON.parse(localStorage.getItem('puzzroo_users')) || [];
  const setUsersDB = (users) => localStorage.setItem('puzzroo_users', JSON.stringify(users));

  // 2. Inject Modal Templates dynamically to prevent duplication in HTML files
  const injectAuthModals = () => {
    if (document.getElementById('puzzroo-auth-modal')) return;

    const modalHTML = `
      <div class="puzzroo-modal-backdrop" id="puzzroo-auth-modal">
        <!-- Login Card -->
        <div class="puzzroo-modal-card" id="puzzroo-login-card">
          <button class="puzzroo-modal-close-btn" id="puzzroo-login-close" aria-label="Close modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <h3 class="puzzroo-modal-title">Welcome Back</h3>
          <p class="puzzroo-modal-subtitle">Log in to track your scores & play premium challenges</p>
          
          <form id="puzzroo-login-form" novalidate>
            <div class="puzzroo-form-group">
              <label class="puzzroo-form-label" for="login-identifier">Username or Email</label>
              <input class="puzzroo-form-input" type="text" id="login-identifier" required placeholder="Enter username or email">
              <div class="puzzroo-form-error" id="login-identifier-error"></div>
            </div>
            <div class="puzzroo-form-group">
              <label class="puzzroo-form-label" for="login-password">Password</label>
              <input class="puzzroo-form-input" type="password" id="login-password" required placeholder="••••••••">
              <div class="puzzroo-form-error" id="login-password-error"></div>
            </div>
            <button type="submit" class="puzzroo-modal-submit-btn">Log In</button>
          </form>
          
          <p class="puzzroo-modal-switch-text">
            Don't have an account? <a class="puzzroo-modal-switch-link" id="switch-to-signup">Sign Up</a>
          </p>
        </div>
        
        <!-- Signup Card -->
        <div class="puzzroo-modal-card" id="puzzroo-signup-card" style="display: none;">
          <button class="puzzroo-modal-close-btn" id="puzzroo-signup-close" aria-label="Close modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <h3 class="puzzroo-modal-title">Create Account</h3>
          <p class="puzzroo-modal-subtitle">Register to track progress & unlock free badges</p>
          
          <form id="puzzroo-signup-form" novalidate>
            <div class="puzzroo-form-group">
              <label class="puzzroo-form-label" for="signup-username">Username</label>
              <input class="puzzroo-form-input" type="text" id="signup-username" required placeholder="Choose username (min 3 chars)">
              <div class="puzzroo-form-error" id="signup-username-error"></div>
            </div>
            <div class="puzzroo-form-group">
              <label class="puzzroo-form-label" for="signup-email">Email Address</label>
              <input class="puzzroo-form-input" type="email" id="signup-email" required placeholder="you@example.com">
              <div class="puzzroo-form-error" id="signup-email-error"></div>
            </div>
            <div class="puzzroo-form-group">
              <label class="puzzroo-form-label" for="signup-password">Password</label>
              <input class="puzzroo-form-input" type="password" id="signup-password" required placeholder="Create password (min 6 chars)">
              <div class="puzzroo-form-error" id="signup-password-error"></div>
            </div>
            <button type="submit" class="puzzroo-modal-submit-btn">Create Account</button>
          </form>
          
          <p class="puzzroo-modal-switch-text">
            Already have an account? <a class="puzzroo-modal-switch-link" id="switch-to-login">Log In</a>
          </p>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupModalListeners();
  };

  // 3. Setup Modal Toggle and Switching Listeners
  const setupModalListeners = () => {
    const backdrop = document.getElementById('puzzroo-auth-modal');
    const loginCard = document.getElementById('puzzroo-login-card');
    const signupCard = document.getElementById('puzzroo-signup-card');
    const loginClose = document.getElementById('puzzroo-login-close');
    const signupClose = document.getElementById('puzzroo-signup-close');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginForm = document.getElementById('puzzroo-login-form');
    const signupForm = document.getElementById('puzzroo-signup-form');

    const openLoginModal = () => {
      resetFormErrors();
      loginCard.style.display = 'block';
      signupCard.style.display = 'none';
      backdrop.classList.add('open');
    };

    const openSignupModal = () => {
      resetFormErrors();
      loginCard.style.display = 'none';
      signupCard.style.display = 'block';
      backdrop.classList.add('open');
    };

    const closeModal = () => {
      backdrop.classList.remove('open');
    };

    const resetFormErrors = () => {
      loginForm.reset();
      signupForm.reset();
      document.querySelectorAll('.puzzroo-form-error').forEach(err => {
        err.textContent = '';
        err.style.display = 'none';
      });
    };

    // Close on close buttons or clicking background
    loginClose.addEventListener('click', closeModal);
    signupClose.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('open')) {
        closeModal();
      }
    });

    // Toggle views inside modal
    switchToSignup.addEventListener('click', () => {
      resetFormErrors();
      loginCard.style.display = 'none';
      signupCard.style.display = 'block';
    });

    switchToLogin.addEventListener('click', () => {
      resetFormErrors();
      loginCard.style.display = 'block';
      signupCard.style.display = 'none';
    });

    // Bind forms submission
    loginForm.addEventListener('submit', handleLoginSubmit);
    signupForm.addEventListener('submit', handleSignupSubmit);

    // Save modal handlers to global object for external activation
    window.puzzrooAuth = {
      openLogin: openLoginModal,
      openSignup: openSignupModal,
      close: closeModal
    };
  };

  // 4. Form Validation & Submissions
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const identifierInput = document.getElementById('login-identifier');
    const passwordInput = document.getElementById('login-password');
    const identifierError = document.getElementById('login-identifier-error');
    const passwordError = document.getElementById('login-password-error');

    // Reset previous errors
    identifierError.style.display = 'none';
    passwordError.style.display = 'none';

    const identifier = identifierInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!identifier) {
      identifierError.textContent = 'Username or email is required';
      identifierError.style.display = 'block';
      return;
    }
    if (!password) {
      passwordError.textContent = 'Password is required';
      passwordError.style.display = 'block';
      return;
    }

    const users = getUsersDB();
    const user = users.find(u => u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier);

    if (!user) {
      identifierError.textContent = 'Account not found';
      identifierError.style.display = 'block';
      return;
    }

    if (user.password !== password) {
      passwordError.textContent = 'Incorrect password';
      passwordError.style.display = 'block';
      return;
    }

    // Success login
    setSessionUser({
      username: user.username,
      email: user.email,
      stats: user.stats || { gamesPlayed: 0, bestScore: 0 }
    });

    window.puzzrooAuth.close();
    updateAuthUI();
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('signup-username');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const usernameError = document.getElementById('signup-username-error');
    const emailError = document.getElementById('signup-email-error');
    const passwordError = document.getElementById('signup-password-error');

    // Reset previous errors
    usernameError.style.display = 'none';
    emailError.style.display = 'none';
    passwordError.style.display = 'none';

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    // Validate inputs
    let hasError = false;

    if (username.length < 3) {
      usernameError.textContent = 'Username must be at least 3 characters';
      usernameError.style.display = 'block';
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      emailError.textContent = 'Please enter a valid email address';
      emailError.style.display = 'block';
      hasError = true;
    }

    if (password.length < 6) {
      passwordError.textContent = 'Password must be at least 6 characters';
      passwordError.style.display = 'block';
      hasError = true;
    }

    if (hasError) return;

    // Check unique email and username in mock DB
    const users = getUsersDB();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      usernameError.textContent = 'Username is already taken';
      usernameError.style.display = 'block';
      return;
    }
    if (users.some(u => u.email === email)) {
      emailError.textContent = 'Email address is already registered';
      emailError.style.display = 'block';
      return;
    }

    // Create user entry
    const newUser = {
      username: username,
      email: email,
      password: password,
      stats: { gamesPlayed: 0, bestScore: 0 }
    };

    users.push(newUser);
    setUsersDB(users);

    // Auto-login after successful registration
    setSessionUser({
      username: newUser.username,
      email: newUser.email,
      stats: newUser.stats
    });

    window.puzzrooAuth.close();
    updateAuthUI();
  };

  // 5. Update Navbar & Mobile Drawer UI according to login state
  const updateAuthUI = () => {
    const user = getSessionUser();
    const desktopContainers = document.querySelectorAll('.nav-desktop-buttons');
    const mobileContainers = document.querySelectorAll('.mobile-drawer-actions');

    if (user) {
      // LOGGED IN STATE
      
      // Update Desktop Navbars
      desktopContainers.forEach(container => {
        container.innerHTML = `
          <div class="puzzroo-profile-container">
            <button class="puzzroo-profile-trigger">
              <div class="puzzroo-profile-avatar">${user.username.charAt(0)}</div>
              <span>${user.username}</span>
              <svg class="puzzroo-profile-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="puzzroo-dropdown-menu">
              <div class="puzzroo-dropdown-header">
                <div class="puzzroo-dropdown-name">${user.username}</div>
                <div class="puzzroo-dropdown-email">${user.email}</div>
              </div>
              <div class="puzzroo-dropdown-stats">
                <div class="puzzroo-dropdown-stat-row">
                  <span>Games Played</span>
                  <span class="puzzroo-dropdown-stat-val">${user.stats.gamesPlayed}</span>
                </div>
                <div class="puzzroo-dropdown-stat-row">
                  <span>Best Score</span>
                  <span class="puzzroo-dropdown-stat-val">${user.stats.bestScore}</span>
                </div>
              </div>
              <div class="puzzroo-dropdown-item logout-action">Log Out</div>
            </div>
          </div>
        `;

        // Bind dropdown click behavior
        const trigger = container.querySelector('.puzzroo-profile-trigger');
        const dropdownWrap = container.querySelector('.puzzroo-profile-container');
        const logoutItem = container.querySelector('.logout-action');

        if (trigger && dropdownWrap) {
          trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownWrap.classList.toggle('open');
          });
        }

        if (logoutItem) {
          logoutItem.addEventListener('click', handleLogout);
        }
      });

      // Update Mobile Drawers
      mobileContainers.forEach(container => {
        container.innerHTML = `
          <div class="puzzroo-mobile-profile">
            <div class="puzzroo-mobile-avatar">${user.username.charAt(0)}</div>
            <div class="puzzroo-mobile-info">
              <span class="puzzroo-mobile-name">${user.username}</span>
              <span class="puzzroo-mobile-email">${user.email}</span>
            </div>
          </div>
          <button class="puzzroo-mobile-logout mobile-logout-action">Log Out</button>
        `;

        const mobileLogout = container.querySelector('.mobile-logout-action');
        if (mobileLogout) {
          mobileLogout.addEventListener('click', handleLogout);
        }
      });

      // Close dropdowns when clicking outside
      window.addEventListener('click', () => {
        document.querySelectorAll('.puzzroo-profile-container').forEach(c => c.classList.remove('open'));
      });

    } else {
      // LOGGED OUT STATE
      
      // Update Desktop Navbars
      desktopContainers.forEach(container => {
        container.innerHTML = `
          <a href="#signup" class="btn-signup">Sign up</a>
          <a href="#login" class="btn-login">Login</a>
        `;

        // Bind auth click triggers
        const loginBtn = container.querySelector('.btn-login');
        const signupBtn = container.querySelector('.btn-signup');

        if (loginBtn) loginBtn.addEventListener('click', (e) => { e.preventDefault(); window.puzzrooAuth.openLogin(); });
        if (signupBtn) signupBtn.addEventListener('click', (e) => { e.preventDefault(); window.puzzrooAuth.openSignup(); });
      });

      // Update Mobile Drawers
      mobileContainers.forEach(container => {
        container.innerHTML = `
          <a href="#login" class="mobile-btn-login">Login</a>
          <a href="#signup" class="mobile-btn-signup">Sign up</a>
        `;

        const mobileLoginBtn = container.querySelector('.mobile-btn-login');
        const mobileSignupBtn = container.querySelector('.mobile-btn-signup');

        if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', (e) => { e.preventDefault(); closeMobileMenu(); window.puzzrooAuth.openLogin(); });
        if (mobileSignupBtn) mobileSignupBtn.addEventListener('click', (e) => { e.preventDefault(); closeMobileMenu(); window.puzzrooAuth.openSignup(); });
      });
    }
  };

  const handleLogout = () => {
    removeSessionUser();
    updateAuthUI();
  };

  // 6. Global Helper to Record Gameplay Scores
  window.puzzrooSaveGameResult = (score) => {
    const user = getSessionUser();
    if (!user) return; // Ignore if user is guest

    // Increment games played
    user.stats.gamesPlayed += 1;
    
    // Update best score if higher
    if (score > user.stats.bestScore) {
      user.stats.bestScore = score;
    }

    // Save to session
    setSessionUser(user);

    // Save to users database
    const users = getUsersDB();
    const userIdx = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
    if (userIdx !== -1) {
      users[userIdx].stats = user.stats;
      setUsersDB(users);
    }

    // Refresh layout view
    updateAuthUI();
  };

  // 7. Track and render game played statuses
  const trackAndRenderGameStatus = () => {
    // Save status if on a game page
    const path = window.location.pathname;
    if (path.includes('game-ninja.html')) {
      localStorage.setItem('puzzroo_played_ninja', 'true');
    } else if (path.includes('game-crossword.html')) {
      localStorage.setItem('puzzroo_played_crossword', 'true');
    } else if (path.includes('game.html')) {
      localStorage.setItem('puzzroo_played_sudoku', 'true');
    } else if (path.includes('game-kakuro.html')) {
      localStorage.setItem('puzzroo_played_kakuro', 'true');
    } else if (path.includes('game-dotsmatch.html')) {
      localStorage.setItem('puzzroo_played_dotsmatch', 'true');
    } else if (path.includes('game-nonogram.html')) {
      localStorage.setItem('puzzroo_played_nonogram', 'true');
    }

    // Update index.html if we are on the homepage
    if (document.querySelector('.games-section')) {
      const games = [
        { id: 'ninja', link: 'lobby-ninja.html' },
        { id: 'crossword', link: 'lobby-crossword.html' },
        { id: 'sudoku', link: 'lobby.html' },
        { id: 'kakuro', link: 'lobby-kakuro.html' },
        { id: 'dotsmatch', link: 'lobby-dotsmatch.html' },
        { id: 'nonogram', link: 'lobby-nonogram.html' }
      ];

      games.forEach(g => {
        const isPlayed = localStorage.getItem(`puzzroo_played_${g.id}`) === 'true';
        // Find the card that has a link containing g.link
        const cardLink = document.querySelector(`.card-item a[href="${g.link}"]`);
        if (cardLink) {
          const cardItem = cardLink.closest('.card-item');
          if (cardItem) {
            const statusSpan = cardItem.querySelector('.game-status');
            if (statusSpan) {
              if (isPlayed) {
                statusSpan.className = 'game-status game-status-icon';
                statusSpan.innerHTML = `<img src="assets/images/Game.svg" alt="Game Icon" class="game-status-img" width="25" height="25">`;
              } else {
                statusSpan.className = 'game-status';
                statusSpan.textContent = 'Unplayed';
              }
            }
          }
        }
      });
    }
  };

  // Initialize Auth module: Inject templates & update current state UI
  injectAuthModals();
  updateAuthUI();
  trackAndRenderGameStatus();
});

