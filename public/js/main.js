document.addEventListener('DOMContentLoaded', function () {
  // Tahun otomatis di footer
  var tahunEl = document.getElementById('tahun');
  if (tahunEl) {
    tahunEl.textContent = new Date().getFullYear();
  }

  // Toggle menu mobile
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('buka');
    });
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('buka');
      });
    });
  }

  // =========================================================
  // Background partikel jaringan IoT (canvas)
  // =========================================================
  var canvas = document.getElementById('bg-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var partikel = [];
    var jumlahPartikel = window.innerWidth < 700 ? 40 : 80;
    var mouse = { x: null, y: null };

    function ukurCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = document.body.scrollHeight;
    }

    function sembunyikanKursor() {
      var style = getComputedStyle(document.body);
      var pointer = style.getPropertyValue('--pointer');
    }

    function buatPartikel() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2 + 1,
      };
    }

    function inisialisasi() {
      ukurCanvas();
      partikel = [];
      for (var i = 0; i < jumlahPartikel; i++) {
        partikel.push(buatPartikel());
      }
    }

    function gambar() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#4da3ff';
      for (var i = 0; i < partikel.length; i++) {
        var p = partikel[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Garis penghubung antar partikel yang berdekatan (seperti jaringan sensor IoT)
      ctx.strokeStyle = '#2f80ed';
      ctx.globalAlpha = 0.18;
      ctx.lineWidth = 1;
      for (var i = 0; i < partikel.length; i++) {
        for (var j = i + 1; j < partikel.length; j++) {
          var a = partikel[i];
          var b = partikel[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var jarak = dx * dx + dy * dy;
          if (jarak < 12000) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Garis dari mouse ke partikel terdekat
      if (mouse.x !== null) {
        for (var i = 0; i < partikel.length; i++) {
          var p = partikel[i];
          var dx = p.x - mouse.x;
          var dy = p.y - mouse.y;
          var jarak = dx * dx + dy * dy;
          if (jarak < 20000) {
            ctx.globalAlpha = 0.35;
            ctx.strokeStyle = '#4da3ff';
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(gambar);
    }

    canvas.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY + window.scrollY;
    });

    canvas.addEventListener('mouseleave', function () {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', function () {
      inisialisasi();
    });

    inisialisasi();
    gambar();
  }

  // =========================================================
  // Glow mengikuti mouse
  // =========================================================
  var glow = document.createElement('div');
  glow.id = 'mouse-glow';
  document.body.appendChild(glow);

  document.addEventListener('mousemove', function (e) {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });

  // =========================================================
  // Efek ketik (typewriter) pada hero-role
  // =========================================================
  var roleEl = document.querySelector('.hero-role');
  if (roleEl) {
    var teksLengkap = roleEl.textContent.trim();
    var idx = 0;
    roleEl.textContent = '';
    roleEl.classList.add('teks-ketik');

    var ketik = setInterval(function () {
      idx++;
      roleEl.textContent = teksLengkap.slice(0, idx);
      if (idx >= teksLengkap.length) clearInterval(ketik);
    }, 45);
  }

  // =========================================================
  // Skill bar menyala saat terlihat
  // =========================================================
  var skillBars = document.querySelectorAll('.skill-fill');
  if ('IntersectionObserver' in window && skillBars.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.getAttribute('style') || '0%';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    skillBars.forEach(function (bar) {
      var lebarAsli = (bar.getAttribute('style') || '0%');
      bar.style.width = '0%';
      observer.observe(bar);
    });
  }

  // =========================================================
  // Animasi muncul saat scroll (reveal)
  // =========================================================
  var revealTargets = document.querySelectorAll('.kartu, .timeline-item, .skill-item, .about-teks, .kontak-info');
  if ('IntersectionObserver' in window && revealTargets.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('muncul');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealTargets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 3) * 0.08 + 's';
      revealObserver.observe(el);
    });

    // Fallback: jika observer tidak memicu dalam 2.5 detik, tampilkan semua.
    setTimeout(function () {
      revealTargets.forEach(function (el) {
        el.classList.add('muncul');
      });
      skillBars.forEach(function (bar) {
        bar.style.width = bar.getAttribute('style') || '0%';
      });
    }, 2500);
  }
});