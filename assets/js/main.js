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
});
