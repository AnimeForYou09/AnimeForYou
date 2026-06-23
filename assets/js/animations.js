// AnimeForYou — Modern Animations (Optimized)
(function(){
  // Scroll Reveal with performance optimization
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  function initReveal() {
    document.querySelectorAll('.anime-card, .feature-card, .team-card, .faq-item, .dl-card, .dl-server').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${(i % 8) * 0.06}s`;
      revealObserver.observe(el);
    });
  }

  // Smooth header shadow on scroll - throttled
  const header = document.getElementById('siteHeader') || document.querySelector('.header');
  let ticking = false;
  if (header) {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          header.classList.toggle('scrolled', window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Press feedback - passive event listeners
  document.addEventListener('mousedown', (e) => {
    const btn = e.target.closest('.btn, .admin-tab, .menu-btn, .quick-btn');
    if (btn) btn.style.transform = 'scale(0.96)';
  }, { passive: true });
  document.addEventListener('mouseup', () => {
    document.querySelectorAll('.btn, .admin-tab, .menu-btn, .quick-btn').forEach(b => b.style.transform = '');
  }, { passive: true });

  // 3D tilt on cards - optimized with transform3d for GPU
  let tiltCard = null;
  let rafId = null;
  document.addEventListener('mousemove', (e) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const card = e.target.closest('.anime-card');
      if (!card) { if (tiltCard) { tiltCard.style.transform = ''; tiltCard = null; } rafId = null; return; }
      tiltCard = card;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 25;
      const rotateY = (centerX - x) / 25;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;
      rafId = null;
    });
  }, { passive: true });

  document.addEventListener('mouseleave', (e) => {
    if (e.target.closest && e.target.closest('.anime-card')) {
      document.querySelectorAll('.anime-card').forEach(c => c.style.transform = '');
      tiltCard = null;
    }
  }, true);

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }

  window.AnimeAnimations = { initReveal };
})();