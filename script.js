// RAMAD Construction Company – script.js

import { createMenuController } from './menu-controller.mjs';
import { createGalleryFilter } from './gallery-filter.mjs';
import { activateWhenVisible } from './viewport-observer.mjs';

const reducedMotion = typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============= NAVBAR SCROLL ============= */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* ============= MOBILE MENU ============= */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
createMenuController({
  toggle: menuToggle,
  menu: navLinks,
  mobileQuery: window.matchMedia('(max-width: 768px)'),
});

/* ============= ANIMATED COUNTERS ============= */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current);
  }, 16);
}

let countersStarted = false;
const counterEls = document.querySelectorAll('.stat-num');
const startCounters = () => {
  if (countersStarted) return;
  countersStarted = true;
  counterEls.forEach((el) => {
    if (reducedMotion) el.textContent = parseInt(el.dataset.target);
    else animateCounter(el);
  });
};
const counterTarget = counterEls[0]?.closest('.hero-stats') || counterEls[0];

activateWhenVisible({
  elements: counterTarget ? [counterTarget] : [],
  onVisible: startCounters,
  Observer: reducedMotion ? null : window.IntersectionObserver,
  options: { threshold: 0.5 },
});

/* ============= PROJECT FILTER ============= */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const filterStatus = document.getElementById('filterStatus');
createGalleryFilter({
  buttons: filterBtns,
  cards: projectCards,
  status: filterStatus,
});

/* ============= SCROLL REVEAL ============= */
const revealEls = document.querySelectorAll(
  '.service-card, .project-card, .why-card, .about-content, .about-visuals, .contact-info, .contact-form-wrap, .section-header'
);

revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  const delay = (i % 5);
  if (delay > 0) el.classList.add(`reveal-delay-${delay}`);
});

activateWhenVisible({
  elements: document.querySelectorAll('.reveal'),
  onVisible: element => element.classList.add('visible'),
  Observer: reducedMotion ? null : window.IntersectionObserver,
  options: { threshold: 0.1, rootMargin: '0px 0px -60px 0px' },
});

/* ============= CONTACT FORM ============= */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Previewing...';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = 'Preview Message →';
      btn.disabled = false;
      formSuccess.style.display = 'block';
      contactForm.reset();
      setTimeout(() => { formSuccess.style.display = 'none'; }, 5000);
    }, 1500);
  });
}

/* ============= SMOOTH ACTIVE NAV ============= */
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  const scrollY = window.pageYOffset;
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
    if (navLink) {
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-links a').forEach(a => {
          a.style.color = '';
          a.removeAttribute('aria-current');
        });
        navLink.style.color = 'var(--blue)';
        navLink.setAttribute('aria-current', 'location');
      }
    }
  });
}, { passive: true });

/* ============= HERO BADGE ANIMATION ============= */
document.addEventListener('DOMContentLoaded', () => {
  // Trigger counters immediately if hero is visible
  if (window.scrollY < 100) {
    setTimeout(() => {
      if (!countersStarted) {
        startCounters();
      }
    }, 1200);
  }
});
