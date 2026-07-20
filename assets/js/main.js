/**
 * Puzzroo Landing Page Main Script
 * Vanilla JS Only - Mobile Nav, Header Scroll, Smooth Scroll, and Custom Center-Mode Slider
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. Mobile Navigation & Hamburger Menu Toggle
     -------------------------------------------------------------------------- */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const header = document.getElementById('header');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
      const newState = !isExpanded;

      hamburgerBtn.setAttribute('aria-expanded', newState ? 'true' : 'false');
      hamburgerBtn.classList.toggle('open', newState);
      navMenu.classList.toggle('open', newState);
    });

    // Close menu when clicking any nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('open')) {
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          hamburgerBtn.classList.remove('open');
          navMenu.classList.remove('open');
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     2. Sticky Header Scroll Effect & Active Link Scrollspy
     -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');

  const handleScroll = () => {
    // Header shadow on scroll
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scrollspy active section highlighting
    const scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  /* --------------------------------------------------------------------------
     3. Smooth Anchor Scroll with Sticky Header Offset
     -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  /* --------------------------------------------------------------------------
     4. Custom Center-Mode Carousel Slider
     -------------------------------------------------------------------------- */
  const sliderTrack = document.getElementById('slider-track');
  const prevBtn = document.getElementById('slider-prev-btn');
  const nextBtn = document.getElementById('slider-next-btn');
  
  if (sliderTrack) {
    const slides = Array.from(sliderTrack.querySelectorAll('.slide'));
    const totalSlides = slides.length;
    let currentIndex = 1; // Start with 2nd slide centered (0-indexed)
    let touchStartX = 0;
    let touchEndX = 0;

    // Calculate gap and slide dimensions based on CSS
    const updateSliderPosition = () => {
      if (totalSlides === 0) return;

      const containerWidth = sliderTrack.parentElement.offsetWidth;
      const windowWidth = window.innerWidth;
      let gap = 24; // 1.5rem gap
      let slideWidth;
      let offset = 0;

      if (windowWidth <= 480) {
        // Single slide view
        gap = 16;
        slideWidth = containerWidth;
        offset = -currentIndex * (slideWidth + gap);
      } else {
        // 3 slides view (middle slide centered)
        slideWidth = (containerWidth - 2 * gap) / 3;
        const centerTranslate = (containerWidth - slideWidth) / 2;
        offset = -currentIndex * (slideWidth + gap) + centerTranslate;
      }

      // Apply transform with smooth cubic-bezier
      sliderTrack.style.transform = `translateX(${offset}px)`;

      // Highlight active center slide
      slides.forEach((slide, idx) => {
        if (idx === currentIndex) {
          slide.classList.add('active');
          slide.setAttribute('aria-hidden', 'false');
        } else {
          slide.classList.remove('active');
          slide.setAttribute('aria-hidden', 'true');
        }
      });
    };

    // Navigation Handlers with Infinite Wrap-Around
    const goToNext = () => {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateSliderPosition();
    };

    const goToPrev = () => {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      updateSliderPosition();
    };

    if (nextBtn) nextBtn.addEventListener('click', goToNext);
    if (prevBtn) prevBtn.addEventListener('click', goToPrev);

    // Direct click on side slides shifts focus to that slide
    slides.forEach((slide, idx) => {
      slide.addEventListener('click', () => {
        if (currentIndex !== idx) {
          currentIndex = idx;
          updateSliderPosition();
        }
      });
    });

    // Touch Swipe Event Listeners (Mobile & Tablet)
    sliderTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderTrack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      const swipeDistance = touchEndX - touchStartX;
      const threshold = 40; // minimum 40px drag to trigger slide change

      if (swipeDistance < -threshold) {
        goToNext();
      } else if (swipeDistance > threshold) {
        goToPrev();
      }
    };

    // Keyboard Arrow Accessibility Support
    document.addEventListener('keydown', (e) => {
      const sliderSection = document.getElementById('puzzle-carousel');
      if (sliderSection) {
        const rect = sliderSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        if (isVisible) {
          if (e.key === 'ArrowRight') goToNext();
          if (e.key === 'ArrowLeft') goToPrev();
        }
      }
    });

    // Window Resize Recalculation
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateSliderPosition, 100);
    });

    // Initial positioning call
    updateSliderPosition();
  }
});
