/* =========================================================
   Modern Developer Portfolio — main.js
   Tema, navbar, menu, scrollspy, reveal, modal, efek ketik
   ========================================================= */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Tema (dark default / light toggle) ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');

  function setTheme(tema) {
    root.setAttribute('data-theme', tema);
    if (themeToggle) {
      themeToggle.innerHTML = tema === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    try {
      localStorage.setItem('tema', tema);
    } catch (e) { /* abaikan */ }
  }

  var temaTersimpan = null;
  try {
    temaTersimpan = localStorage.getItem('tema');
  } catch (e) { /* abaikan */ }

  if (temaTersimpan === 'dark' || temaTersimpan === 'light') {
    setTheme(temaTersimpan);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    setTheme('light');
  } else {
    setTheme('dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- Navbar: latar saat scroll ---------- */
  var navbar = document.getElementById('navbar');
  var scrolled = false;

  function cekScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (y > 24 && !scrolled) {
      navbar.classList.add('scrolled');
      scrolled = true;
    } else if (y <= 24 && scrolled) {
      navbar.classList.remove('scrolled');
      scrolled = false;
    }
  }
  cekScroll();
  window.addEventListener('scroll', cekScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  function tutupMenu() {
    navMenu.classList.remove('buka');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var buka = navMenu.classList.toggle('buka');
      navToggle.setAttribute('aria-expanded', buka ? 'true' : 'false');
      navToggle.innerHTML = buka ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', tutupMenu);
    });

    document.addEventListener('click', function (e) {
      if (navMenu.classList.contains('buka') && !navMenu.contains(e.target) && e.target !== navToggle && !navToggle.contains(e.target)) {
        tutupMenu();
      }
    });
  }

  /* ---------- Scrollspy: highlight link aktif ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var sections = navLinks
    .map(function (l) {
      var id = l.getAttribute('href');
      return id ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  var spyTimer = null;
  function cekScrollspy() {
    if (spyTimer) return;
    spyTimer = setTimeout(function () {
      var pos = (window.scrollY || 0) + 140;
      var aktifId = 'beranda';
      sections.forEach(function (s) {
        if (s.offsetTop <= pos) aktifId = s.getAttribute('id');
      });
      navLinks.forEach(function (l) {
        l.classList.toggle('active', l.getAttribute('href') === '#' + aktifId);
      });
      spyTimer = null;
    }, 80);
  }
  window.addEventListener('scroll', cekScrollspy, { passive: true });
  cekScrollspy();

  /* ---------- Tahun otomatis footer ---------- */
  var tahunEl = document.getElementById('tahun');
  if (tahunEl) tahunEl.textContent = new Date().getFullYear();

  /* ---------- Efek ketik (hero) ---------- */
  var heroType = document.getElementById('heroType');
  if (heroType && !prefersReduced) {
    var teksLengkap = heroType.textContent.trim();
    var idx = 0;
    heroType.textContent = '';
    var ketik = setInterval(function () {
      idx++;
      heroType.textContent = teksLengkap.slice(0, idx);
      if (idx >= teksLengkap.length) clearInterval(ketik);
    }, 40);
  }

  /* ---------- Reveal saat scroll ---------- */
  var targetReveal = document.querySelectorAll(
    '.section-head, .bento-card, .stat-card, .tech-card, .skill-group, .proj-row, .mycelia-banner, .tl-item, .contact-card, .form-card'
  );
  if ('IntersectionObserver' in window && !prefersReduced) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('muncul');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    targetReveal.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4) * 0.06 + 's';
      revealObserver.observe(el);
    });
  }

  /* ---------- Modal detail proyek ---------- */
  var modal = document.getElementById('proyekModal');
  var modalDataEl = document.getElementById('proyek-data');
  var proyekData = [];
  if (modalDataEl) {
    try {
      proyekData = JSON.parse(modalDataEl.textContent);
    } catch (e) { /* abaikan */ }
  }

  var terakhirFokus = null;

  function isiModal(idx) {
    var p = proyekData[idx];
    if (!p) return;

    document.getElementById('modalIkon').className = p.ikon;
    document.getElementById('modalKategori').textContent = (p.kategori === 'Mycelia' ? 'Mycelia Ecosystem' : p.kategori);
    document.getElementById('modalTitle').textContent = p.nama;
    document.getElementById('modalDesk').textContent = p.deskripsi;

    var techEl = document.getElementById('modalTech');
    techEl.innerHTML = '';
    (p.teknologi || []).forEach(function (t) {
      var s = document.createElement('span');
      s.className = 'tag';
      s.textContent = t;
      techEl.appendChild(s);
    });

    var linksEl = document.getElementById('modalLinks');
    linksEl.innerHTML = '';
    if (p.download) {
      var aDl = document.createElement('a');
      aDl.className = 'btn btn-primary btn-sm';
      aDl.href = p.link;
      aDl.setAttribute('download', '');
      aDl.innerHTML = '<i class="fas fa-download"></i> Download APK';
      linksEl.appendChild(aDl);
    }
    if (p.link && p.link !== '#') {
      var aLi = document.createElement('a');
      aLi.className = 'btn btn-ghost btn-sm';
      aLi.href = p.link;
      aLi.target = '_blank';
      aLi.rel = 'noopener';
      aLi.innerHTML = '<i class="fas fa-arrow-right"></i> Kunjungi';
      linksEl.appendChild(aLi);
    }
  }

  function bukaModal(idx) {
    if (!modal || !proyekData.length) return;
    isiModal(idx);
    terakhirFokus = document.activeElement;
    modal.classList.add('buka');
    document.body.style.overflow = 'hidden';
    var closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function tutupModal() {
    if (!modal) return;
    modal.classList.remove('buka');
    document.body.style.overflow = '';
    if (terakhirFokus && terakhirFokus.focus) terakhirFokus.focus();
  }

  document.querySelectorAll('.btn-detail, .proj-media').forEach(function (el) {
    el.addEventListener('click', function () {
      bukaModal(parseInt(el.getAttribute('data-proyek'), 10));
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        bukaModal(parseInt(el.getAttribute('data-proyek'), 10));
      }
    });
  });

  if (modal) {
    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', tutupModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') tutupModal();
    });
  }
})();
