/* =========================================================
   AJIM // DIGITAL LAB — motion.js
   Animation engine: Anime.js v4 (vendor lokal: /js/vendor/)
   Tahap 1: intro global — navbar + hero
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

  /* ---------- Reduced Motion (Theme Lab / preferensi OS) ---------- */
  function matikanSemua() {
    hentikanFloatChips();
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
  });
})();
