// RAMAD Construction Company – script.js

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

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = menuToggle.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '1';
    spans[2].style.transform = '';
  }
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const spans = menuToggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '1';
    spans[2].style.transform = '';
  });
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

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersStarted) {
      countersStarted = true;
      counterEls.forEach(el => animateCounter(el));
    }
  });
}, { threshold: 0.5 });

if (counterEls.length) {
  counterObserver.observe(counterEls[0].closest('.hero-stats') || counterEls[0]);
}

/* ============= PROJECT FILTER ============= */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      if (filter === 'all' || card.dataset.cat === filter) {
        card.classList.remove('hidden');
        card.style.animation = 'fadeInUp 0.5s ease both';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* ============= TESTIMONIAL DOTS ============= */
const testiDots = document.getElementById('testiDots');
const testiCards = document.querySelectorAll('.testi-card');

if (testiDots && testiCards.length) {
  testiCards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
    testiDots.appendChild(dot);
  });
}

/* ============= SCROLL REVEAL ============= */
const revealEls = document.querySelectorAll(
  '.service-card, .project-card, .why-card, .testi-card, .about-content, .about-visuals, .contact-info, .contact-form-wrap, .section-header'
);

revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  const delay = (i % 5);
  if (delay > 0) el.classList.add(`reveal-delay-${delay}`);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

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
        document.querySelectorAll('.nav-links a').forEach(a => a.style.color = '');
        navLink.style.color = 'var(--blue)';
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
        countersStarted = true;
        counterEls.forEach(el => animateCounter(el));
      }
    }, 1200);
  }
});
