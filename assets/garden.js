/**
 * Dasrams Digital Garden — Client Interactions & Motion Controller
 */
(() => {
  'use strict';

  // Elements
  const html = document.documentElement;
  const motionToggle = document.getElementById('motion-toggle');
  const menuToggle = document.getElementById('menu-toggle');
  const siteNav = document.getElementById('site-nav');
  const searchInput = document.getElementById('project-search');
  const filterButtons = document.querySelectorAll('.filters button');
  const projectRows = document.querySelectorAll('.project-row');
  const resultCount = document.getElementById('result-count');
  const emptyState = document.getElementById('empty-state');
  const resetBtn = document.getElementById('reset-search');
  const copyEmailBtn = document.getElementById('copy-email');
  const toast = document.getElementById('toast');
  const yearEl = document.getElementById('year');

  // Year
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 1. Motion Preference Controller
  const MOTION_STORAGE_KEY = 'dasrams_motion_pref';
  const systemPrefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const storedMotion = localStorage.getItem(MOTION_STORAGE_KEY);

  function applyMotion(isEnabled) {
    html.setAttribute('data-motion', isEnabled ? 'on' : 'off');
    if (motionToggle) {
      motionToggle.setAttribute('aria-pressed', isEnabled ? 'true' : 'false');
      const icon = motionToggle.querySelector('.motion-icon');
      const label = motionToggle.querySelector('.motion-label');
      if (icon) icon.textContent = isEnabled ? 'Ⅱ' : '▶';
      if (label) label.textContent = isEnabled ? 'Animasi' : 'Jeda';
      motionToggle.setAttribute('aria-label', isEnabled ? 'Matikan animasi' : 'Aktifkan animasi');
    }
  }

  // Initial Motion state
  let motionActive = storedMotion !== null ? (storedMotion === 'on') : !systemPrefersReduced;
  applyMotion(motionActive);

  if (motionToggle) {
    motionToggle.addEventListener('click', () => {
      motionActive = !motionActive;
      localStorage.setItem(MOTION_STORAGE_KEY, motionActive ? 'on' : 'off');
      applyMotion(motionActive);
      showToast(motionActive ? 'Animasi aktif' : 'Animasi dijeda');
    });
  }

  // 2. Mobile Nav Toggle
  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    siteNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 3. Search and Category Filter
  let activeFilter = 'all';
  let searchQuery = '';

  function updateDirectory() {
    let visibleCount = 0;
    const query = searchQuery.trim().toLowerCase();

    projectRows.forEach(row => {
      const category = row.getAttribute('data-category');
      const text = row.textContent.toLowerCase();
      const matchesCat = activeFilter === 'all' || category === activeFilter;
      const matchesSearch = !query || text.includes(query);

      if (matchesCat && matchesSearch) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    if (resultCount) {
      resultCount.textContent = `${visibleCount} proyek`;
    }

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      activeFilter = btn.getAttribute('data-filter') || 'all';
      updateDirectory();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value;
      updateDirectory();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      activeFilter = 'all';
      filterButtons.forEach(b => {
        b.setAttribute('aria-pressed', b.getAttribute('data-filter') === 'all' ? 'true' : 'false');
      });
      updateDirectory();
      if (searchInput) searchInput.focus();
    });
  }

  // Keyboard Shortcuts
  window.addEventListener('keydown', e => {
    // Focus search on '/'
    if (e.key === '/' && document.activeElement !== searchInput) {
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    }
    // Escape closes menus or clears search
    if (e.key === 'Escape') {
      if (siteNav && siteNav.classList.contains('open')) {
        siteNav.classList.remove('open');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      } else if (searchInput && document.activeElement === searchInput) {
        if (searchInput.value) {
          searchInput.value = '';
          searchQuery = '';
          updateDirectory();
        } else {
          searchInput.blur();
        }
      }
    }
  });

  // 4. Toast Notifications
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // 5. Copy Email
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = 'admin@dasrams.biz.id';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
        } else {
          const ta = document.createElement('textarea');
          ta.value = email;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        showToast('Email disalin ke clipboard');
      } catch (err) {
        showToast(`Email: ${email}`);
      }
    });
  }

  // 6. Scroll Reveal Observer
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('in-view');
    });
  }

  // Initial update
  updateDirectory();
})();
