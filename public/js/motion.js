/* =========================================================
   AJIM // DIGITAL LAB — motion.js
   Animation engine: Anime.js v4 (vendor lokal: /js/vendor/)
   Tahap 1: intro global — navbar + hero
   Tahap 2: reveal on scroll — Stations + Profile
   Tahap 3: reveal on scroll — Artifacts + Skill Tree
   Aturan: progressive enhancement (konten tampil normal
   bila JS/Anime gagal), hormati Reduced Motion & Theme Lab.
   ========================================================= */
(function () {
  'use strict';

  var A = window.anime;
  if (!A || typeof A.animate !== 'function' || typeof A.createTimeline !== 'function') {
    return; /* tanpa Anime: seluruh konten tampil normal */
  }

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(pointer: fine)');
  var cbReduce = document.getElementById('reducedMotion');

  var tl = null;
  var loops = [];
  var sudahBangun = false;

  function reducedAktif() {
    return (
      mqReduce.matches ||
      document.body.classList.contains('reduced-motion') ||
      !!(cbReduce && cbReduce.checked)
    );
  }

  function $(sel) {
    return Array.prototype.slice.call(document.querySelectorAll(sel));
  }

  function bersihkanTransform(el) {
    if (!el || !el.style) return;
    el.style.transform = '';
    el.style.translate = '';
    el.style.rotate = '';
    el.style.scale = '';
  }

  /* ---------- Floating chips (menggantikan CSS keyframes saat Anime aktif) ---------- */
  function pasangFloatChips(delayDasar) {
    if (reducedAktif()) return;
    var chips = $('.float-chip');
    chips.forEach(function (chip, i) {
      var loop = A.animate(chip, {
        y: [0, -14],
        duration: 2400 + i * 300,
        delay: typeof delayDasar === 'number' ? delayDasar + i * 160 : 0,
        ease: 'inOut(2)',
        alternate: true,
        loop: true
      });
      loops.push(loop);
    });
  }

  function hentikanFloatChips() {
    loops.forEach(function (a) {
      try {
        a.revert();
        var el = a.target;
        if (el && el.style) {
          el.style.transform = '';
          el.style.translate = '';
          el.style.rotate = '';
          el.style.scale = '';
        }
      } catch (e) { /* abaikan */ }
    });
    loops = [];
  }

  /* ---------- Intro hero (setelah boot sequence selesai) ---------- */
  function bangunIntro() {
    if (sudahBangun) return;
    sudahBangun = true;
    if (reducedAktif()) return;

    document.documentElement.classList.add('anime-ready');
    document.body.classList.add('intro-run');

    tl = A.createTimeline({
      autoplay: false,
      defaults: { ease: 'out(3)', duration: 700 },
      onComplete: function () {
        document.body.classList.remove('intro-run');
        /* Lepas transform inline agar efek hover CSS (.btn, dst) berfungsi normal */
        $('.navbar, .hero-badge, .hero-nama, .hero-role, .hero-desc, .hero-visual, .stat-item')
          .forEach(bersihkanTransform);
      }
    });

    tl.add('.navbar', { opacity: [0, 1], y: [-28, 0], duration: 650 }, 0)
      .add('.hero-badge', { opacity: [0, 1], y: [18, 0] }, 120);

    var nama = document.querySelector('.hero-nama');
    if (nama) {
      var chars = null;
      if (typeof A.splitText === 'function') {
        try {
          chars = A.splitText(nama, { chars: true }).chars;
        } catch (e) {
          chars = null;
        }
      }
      if (chars && chars.length) {
        tl.add(chars, { opacity: [0, 1], y: ['0.55em', 0], duration: 850, delay: A.stagger(45) }, 240);
      } else {
        tl.add(nama, { opacity: [0, 1], y: [26, 0] }, 240);
      }
    }

    tl.add('.hero-role', { opacity: [0, 1], y: [16, 0], duration: 600 }, 620)
      .add('.hero-desc', { opacity: [0, 1], y: [16, 0], duration: 600 }, 740)
      /* tombol & ikon sosial: opacity saja (punya efek hover transform di CSS) */
      .add('.hero-actions .btn', { opacity: [0, 1], duration: 550, delay: A.stagger(110) }, 880)
      .add('.hero-social a', { opacity: [0, 1], duration: 500, delay: A.stagger(60) }, 1080)
      .add('.stat-item', { opacity: [0, 1], y: [18, 0], duration: 550, delay: A.stagger(120) }, 1240)
      .add('.hero-visual', { opacity: [0, 1], scale: [0.94, 1], duration: 900 }, 300)
      .add('.hero-scroll', { opacity: [0, 1], duration: 600 }, 1600);

    try {
      if (typeof tl.init === 'function') tl.init();
    } catch (e) { /* abaikan */ }
    tl.play();

    /* Chip: entrance dulu, lalu melayang */
    $('.float-chip').forEach(function (chip, i) {
      A.animate(chip, {
        opacity: [0, 1],
        y: [26, 0],
        duration: 700,
        delay: 1250 + i * 160,
        ease: 'out(3)',
        onComplete: function () {
          if (reducedAktif()) return;
          bersihkanTransformY(chip);
          var loop = A.animate(chip, {
            y: [0, -14],
            duration: 2400 + i * 300,
            ease: 'inOut(2)',
            alternate: true,
            loop: true
          });
          loops.push(loop);
        }
      });
    });
  }

  function bersihkanTransformY(el) {
    if (!el || !el.style) return;
    /* biarkan posisi akhir entrance (y=0) sebelum loop float ditumpuk */
    el.style.transform = '';
    el.style.translate = '';
  }

  /* ---------- Efek magnetik hover ---------- */
  function pasangMagnetik() {
    if (!mqFine.matches) return;
    $('.nav-cta, .hero-actions .btn').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        if (reducedAktif()) return;
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.32;
        el.classList.add('mag-moving');
        A.animate(el, {
          x: x,
          y: y,
          duration: 320,
          ease: 'out(3)',
          composition: 'replace'
        });
      });
      el.addEventListener('mouseleave', function () {
        A.animate(el, {
          x: 0,
          y: 0,
          duration: 480,
          ease: 'out(3)',
          composition: 'replace',
          onComplete: function () {
            bersihkanTransform(el);
            el.classList.remove('mag-moving');
          }
        });
      });
    });
  }

  /* =========================================================
     TAHAP 2 — reveal on scroll: Stations + Profile
     Elemen disembunyikan hanya bila Anime aktif; muncul saat
     masuk viewport (ScrollObserver), lalu transform dibersihkan
     agar efek hover CSS berfungsi normal.
     ========================================================= */
  var revealObservers = [];
  var revealTls = [];
  var revealTersimpan = [];

  function bersihkanReveal() {
    revealTersimpan.forEach(function (el) {
      el.style.opacity = '';
      bersihkanTransform(el);
    });
    revealTersimpan = [];
  }

  function grupReveal(hostSel, els, isiTl, onSelesai) {
    if (!hostSel || !els || !els.length) return;
    if (reducedAktif() || typeof A.onScroll !== 'function') return;
    var host = document.querySelector(hostSel);
    if (!host) return;

    els.forEach(function (el) {
      el.style.opacity = '0';
      revealTersimpan.push(el);
    });

    var tlR = A.createTimeline({
      autoplay: false,
      defaults: { ease: 'out(3)', duration: 650 },
      onComplete: function () {
        els.forEach(function (el) {
          bersihkanTransform(el);
          el.style.opacity = '';
        });
        revealTersimpan = revealTersimpan.filter(function (x) {
          return els.indexOf(x) === -1;
        });
        if (typeof onSelesai === 'function') {
          try { onSelesai(); } catch (e) { /* abaikan */ }
        }
      }
    });
    isiTl(tlR, els);
    revealTls.push(tlR);

    var sudah = false;
    var obs = null;
    try {
      obs = A.onScroll({
        target: hostSel,
        onEnter: function () {
          if (sudah) return;
          sudah = true;
          try { tlR.play(); } catch (e) { /* abaikan */ }
          try { if (obs) obs.revert(); } catch (e) { /* abaikan */ }
          var i = revealObservers.indexOf(obs);
          if (i > -1) revealObservers.splice(i, 1);
        }
      });
    } catch (e) {
      /* pendaftaran gagal: tampilkan kembali konten */
      els.forEach(function (el) { el.style.opacity = ''; });
      revealTersimpan = revealTersimpan.filter(function (x) {
        return els.indexOf(x) === -1;
      });
      return;
    }
    revealObservers.push(obs);
  }

  function isiSectionHead(tl, els) {
    if (els.length < 3) return;
    tl.add(els[0], { opacity: [0, 1], x: [-18, 0], duration: 550 }, 0)
      .add(els[1], { opacity: [0, 1], y: [30, 0] }, 120)
      .add(els[2], { opacity: [0, 1], y: [20, 0], duration: 600 }, 260);
  }

  function pasangPanelReveal(idSel) {
    var panel = document.querySelector(idSel);
    if (!panel) return;
    var inner = Array.prototype.slice.call(
      panel.querySelectorAll('.data-row, .education-item, .experience-item')
    );
    var els = [panel].concat(inner);
    grupReveal(idSel, els, function (tl, list) {
      tl.add(list[0], { opacity: [0, 1], y: [36, 0] }, 0);
      if (list.length > 1) {
        tl.add(list.slice(1), { opacity: [0, 1], x: [-12, 0], duration: 500, delay: A.stagger(45) }, 300);
      }
    });
  }

  function mulaiPulseStatus() {
    if (reducedAktif()) return;
    $('#profile .status-dot').forEach(function (dot, i) {
      var loop = A.animate(dot, {
        scale: [1, 1.45],
        opacity: [1, 0.5],
        duration: 900 + (i % 4) * 150,
        delay: i * 140,
        ease: 'inOut(2)',
        alternate: true,
        loop: true
      });
      loops.push(loop);
    });
  }

  function pasangSidebarReveal() {
    var cards = $('#profile .profile-sidebar .sidebar-card');
    var links = $('#profile .quick-link');
    var stats = $('#profile .status-item');
    var els = cards.concat(links, stats);
    if (!els.length) return;
    grupReveal('#profile .profile-sidebar', els, function (tl) {
      if (cards.length) {
        tl.add(cards, { opacity: [0, 1], y: [34, 0], delay: A.stagger(130) }, 0);
      }
      if (links.length) {
        tl.add(links, { opacity: [0, 1], x: [-14, 0], duration: 500, delay: A.stagger(60) }, 500);
      }
      if (stats.length) {
        tl.add(stats, { opacity: [0, 1], y: [14, 0], duration: 450, delay: A.stagger(70) }, 800);
      }
    }, mulaiPulseStatus);
  }

  function pasangTahap2() {
    if (reducedAktif()) return;
    if (typeof A.onScroll !== 'function') return;

    var headSt = $('#stations .section-label, #stations .section-title, #stations .section-desc');
    if (headSt.length >= 3) {
      grupReveal('#stations .section-head', headSt, isiSectionHead);
    }

    var cards = $('#stations .station-card');
    grupReveal('#stations .stations-grid', cards, function (tl, els) {
      tl.add(els, { opacity: [0, 1], y: [44, 0], scale: [0.96, 1], delay: A.stagger(90) }, 0);
    });

    var headPr = $('#profile .section-label, #profile .section-title, #profile .section-desc');
    if (headPr.length >= 3) {
      grupReveal('#profile .section-head', headPr, isiSectionHead);
    }

    var hdr = $('#profile .profile-avatar, #profile .profile-info h2, #profile .profile-handle, #profile .profile-tagline');
    if (hdr.length >= 4) {
      grupReveal('#profile .profile-header', hdr, function (tl, els) {
        tl.add(els[0], { opacity: [0, 1], scale: [0.9, 1], duration: 750 }, 0);
        tl.add(els.slice(1), { opacity: [0, 1], y: [18, 0], duration: 550, delay: A.stagger(90) }, 150);
      });
    }

    ['#panelIdentity', '#panelEducation', '#panelExperience'].forEach(pasangPanelReveal);
    pasangSidebarReveal();
  }

  /* =========================================================
     TAHAP 3 — reveal on scroll: Artifacts + Skill Tree
     ========================================================= */
  function pasangTahap3() {
    if (reducedAktif()) return;
    if (typeof A.onScroll !== 'function') return;

    var headAr = $('#proyek .section-label, #proyek .section-title, #proyek .section-desc');
    if (headAr.length >= 3) {
      grupReveal('#proyek .section-head', headAr, isiSectionHead);
    }

    grupReveal('#proyek .artifacts-grid', $('#proyek .artifact-card'), function (tl, els) {
      tl.add(els, { opacity: [0, 1], y: [48, 0], scale: [0.96, 1], duration: 700, delay: A.stagger(110) }, 0);
    });

    var headSk = $('#keahlian .section-label, #keahlian .section-title, #keahlian .section-desc');
    if (headSk.length >= 3) {
      grupReveal('#keahlian .section-head', headSk, isiSectionHead);
    }

    var branches = $('#keahlian .skill-branch');
    var leaves = $('#keahlian .leaf-node');
    var detail = $('#keahlian .skill-detail');
    var els = branches.concat(leaves, detail);
    grupReveal('#keahlian .skill-tree-container', els, function (tl, list) {
      var b = list.filter(function (el) { return el.classList.contains('skill-branch'); });
      var l = list.filter(function (el) { return el.classList.contains('leaf-node'); });
      var d = list.filter(function (el) { return el.classList.contains('skill-detail'); });
      if (d.length) tl.add(d, { opacity: [0, 1], y: [30, 0], duration: 700 }, 100);
      if (b.length) tl.add(b, { opacity: [0, 1], y: [40, 0], duration: 650, delay: A.stagger(140) }, 0);
      if (l.length) tl.add(l, { opacity: [0, 1], x: [-16, 0], duration: 500, delay: A.stagger(35) }, 450);
    });
  }

  /* ---------- Reduced Motion (Theme Lab / preferensi OS) ---------- */
  function matikanSemua() {
    hentikanFloatChips();
    revealObservers.forEach(function (o) {
      try { o.revert(); } catch (e) { /* abaikan */ }
    });
    revealObservers = [];
    revealTls.forEach(function (t) {
      try { t.complete(); } catch (e) { /* abaikan */ }
    });
    revealTls = [];
    bersihkanReveal();
    if (tl) {
      try {
        tl.complete();
      } catch (e) { /* abaikan */ }
      document.body.classList.remove('intro-run');
      $('.navbar, .hero-badge, .hero-nama, .hero-role, .hero-desc, .hero-visual, .stat-item')
        .forEach(bersihkanTransform);
    }
  }

  if (cbReduce) {
    cbReduce.addEventListener('change', function () {
      if (reducedAktif()) {
        matikanSemua();
      } else if (document.documentElement.classList.contains('anime-ready') && !loops.length) {
        pasangFloatChips(0);
      }
    });
  }

  /* ---------- Jalan: tunggu boot sequence selesai ---------- */
  function tungguBoot(cb) {
    var overlay = document.getElementById('bootOverlay');
    if (!overlay || overlay.classList.contains('hidden')) {
      cb();
      return;
    }
    var selesai = false;
    var akhir = function () {
      if (selesai) return;
      selesai = true;
      if (observer) observer.disconnect();
      cb();
    };
    var observer = null;
    if (typeof MutationObserver === 'function') {
      observer = new MutationObserver(function () {
        if (overlay.classList.contains('hidden')) akhir();
      });
      observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    }
    setTimeout(akhir, 12000); /* jaring pengaman bila boot tak pernah selesai */
  }

  tungguBoot(function () {
    bangunIntro();
    pasangMagnetik();
    pasangTahap2();
    pasangTahap3();
  });
})();
