/* =========================================================
   AJIM // DIGITAL LAB — main.js
   Interactive Personal Portfolio / Digital Experience
   ========================================================= */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Root & Theme ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');

  function setTheme(tema) {
    root.setAttribute('data-theme', tema);
    if (themeToggle) {
      themeToggle.innerHTML = tema === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    try { localStorage.setItem('tema', tema); } catch (e) { /* abaikan */ }
  }

  var temaTersimpan = null;
  try { temaTersimpan = localStorage.getItem('tema'); } catch (e) { /* abaikan */ }

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

  /* ---------- Boot Sequence ---------- */
  function bootSequence() {
    var bootOverlay = document.getElementById('bootOverlay');
    var bootText1 = document.getElementById('bootText1');
    var bootText2 = document.getElementById('bootText2');
    var bootText3 = document.getElementById('bootText3');
    var bootText4 = document.getElementById('bootText4');
    var bootText5 = document.getElementById('bootText5');
    var bootBar = document.getElementById('bootBar');
    var bootPercent = document.getElementById('bootPercent');
    var bootSkip = document.getElementById('bootSkip');

    if (!bootOverlay) return;

    var texts = [
      'SYSTEM INITIALIZING...',
      'LOADING NEURAL INTERFACE...',
      'ACCESSING MEMORY BANKS...',
      'ESTABLISHING SECURE CONNECTION...',
      'WELCOME TO AJIM\'S DIGITAL WORLD'
    ];

    var steps = [
      { el: bootText1, text: texts[0], delay: 300 },
      { el: bootText2, text: texts[1], delay: 300 },
      { el: bootText3, text: texts[2], delay: 300 },
      { el: bootText4, text: texts[3], delay: 300 },
      { el: bootText5, text: texts[4], delay: 300 }
    ];

    var progressStep = 0;
    var progressInterval = setInterval(function () {
      progressStep++;
      var percent = Math.min(100, Math.round((progressStep / 5) * 100));
      if (bootBar) bootBar.style.width = percent + '%';
      if (bootPercent) bootPercent.textContent = percent + '%';
    }, 400);

    var textIdx = 0;
    var charIdx = 0;
    var isDeleting = false;
    var currentText = '';

    function typeText() {
      if (textIdx >= steps.length) {
        if (bootOverlay) {
          bootOverlay.classList.add('hidden');
          setTimeout(function () { bootOverlay.style.display = 'none'; }, 600);
        }
        clearInterval(progressInterval);
        clearInterval(typeInterval);
        return;
      }

      var step = steps[textIdx];
      var targetEl = step.el;

      if (!targetEl) { textIdx++; return; }

      if (!isDeleting) {
        currentText = currentText + step.text.charAt(charIdx);
        targetEl.textContent = currentText;
        charIdx++;
        if (charIdx >= step.text.length) {
          isDeleting = true;
        }
      } else {
        currentText = currentText.substring(0, charIdx - 1);
        targetEl.textContent = currentText;
        charIdx--;
        if (charIdx <= 0) {
          isDeleting = false;
          textIdx++;
        }
      }
    }

    var typeInterval = setInterval(typeText, 50);
    bootSkip.addEventListener('click', function () {
      clearInterval(progressInterval);
      clearInterval(typeInterval);
      if (bootOverlay) {
        bootOverlay.classList.add('hidden');
        setTimeout(function () { bootOverlay.style.display = 'none'; }, 300);
      }
    });
  }

  /* ---------- Particles Canvas ---------- */
  function initParticles() {
    var canvas = document.getElementById('particlesCanvas');
    var overlay = document.getElementById('bootOverlay');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var animationId = null;
    var active = true;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var colors = ['#3b82f6', '#60a5fa', '#0891b2', '#06b6d4', '#93c5fd'];

    function createParticles() {
      var count = Math.max(1, Math.min(50, Math.floor((canvas.width * canvas.height) / 15000)));
      particles = [];

      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    }

    createParticles();

    function draw() {
      if (!active) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      // Draw connections
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.15;
      particles.forEach(function (pa) {
        particles.forEach(function (pb) {
          var dx = pa.x - pb.x;
          var dy = pa.y - pb.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(draw);
    }

    if (!prefersReduced) {
      draw();
    }

    // Toggle particles on boot skip / theme change
    document.addEventListener('click', function (e) {
      if (e.target.closest('#bootSkip') || e.target.closest('.theme-toggle')) {
        if (active) {
          cancelAnimationFrame(animationId);
          active = false;
          if (particlesCanvas.style.opacity !== '0') {
            particlesCanvas.style.transition = 'opacity 0.5s ease';
            particlesCanvas.style.opacity = '0';
          }
        } else {
          createParticles();
          active = true;
          if (particlesCanvas.style.opacity !== '1') {
            particlesCanvas.style.transition = 'opacity 0.5s ease';
            particlesCanvas.style.opacity = '1';
          }
          draw();
        }
      }
    });
  }

  /* ---------- Counter Animation ---------- */
  function animateCounters() {
    var counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;

    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-count'));
      var duration = 1500;
      var start = 0;
      var startTime = null;

      if (prefersReduced) { counter.textContent = target; return; }

      function updateCounter(time) {
        if (!startTime) startTime = time;
        var elapsed = time - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var ease = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(start + (target - start) * ease);
        counter.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  /* ---------- Skill Tree Interactions ---------- */
  function initSkillTree() {
    var skillNodes = document.querySelectorAll('.skill-branch .node-content, .skill-branch .leaf-node .node-content');
    var skillDetail = document.getElementById('skillDetail');
    var skillTree = document.getElementById('skillTree');

    if (!skillNodes.length || !skillDetail) return;

    // Skill data based on profil.keahlian
    var skillData = {
      'Flutter / Dart': {
        kategori: 'Mobile Development',
        level: 85,
        teknologi: ['Flutter', 'Dart', 'Android'],
        desc: 'Aplikasi mobile lintas platform dengan UI yang expressif dan performa tinggi'
      },
      'Firebase (Auth, Realtime DB)': {
        kategori: 'Backend & Database',
        level: 80,
        teknologi: ['Firebase Auth', 'Realtime DB', 'Cloud Functions'],
        desc: 'Autentikasi, database realtime, dan serverless functions'
      },
      'IoT (ESP32, Sensor, Mqtt)': {
        kategori: 'IoT & Hardware',
        level: 75,
        teknologi: ['ESP32', 'Sensor', 'MQTT'],
        desc: 'Monitoring suhu, kelembaban, penyiraman otomatis dan IoT devices'
      },
      'Node.js (Express)': {
        kategori: 'Backend & Database',
        level: 70,
        teknologi: ['Node.js', 'Express', 'REST API'],
        desc: 'Backend server, API development, dan microservices'
      },
      'Jaringan (Dasar)': {
        kategori: 'IoT & Hardware',
        level: 65,
        teknologi: ['Jaringan Komputer', 'Dasar'],
        desc: 'Konfigurasi jaringan, routing, dan infrastruktur dasar'
      },
      'Linux (Dasar)': {
        kategori: 'IoT & Hardware',
        level: 60,
        teknologi: ['Linux Command', 'Shell Scripting'],
        desc: 'Operasi sistem Dasar, terminal, dan pengelolaan paket'
      },
      'MySQL / SQLite': {
        kategori: 'Backend & Database',
        level: 60,
        teknologi: ['MySQL', 'SQLite', 'Query Optimization'],
        desc: 'Database management, querying, dan optimasi performa'
      },
      'UI/UX Design': {
        kategori: 'Design',
        level: 55,
        teknologi: ['Figma', 'UI Design', 'UX Research'],
        desc: 'Desain antarmuka, alur pengguna, dan prototyping'
      }
    };

    function showSkillDetail(skillName) {
      var data = skillData[skillName] || {
        kategori: '-',
        level: '0%',
        teknologi: [],
        desc: 'Skill tersedia di portfolio ini'
      };

      skillDetail.innerHTML = [
        '<div class="skill-detail-content">',
        '<div class="skill-detail-header">',
        '<h4>' + (skillName || 'Skill') + '</h4>',
        '<span class="skill-detail-category">' + (data.kategori || '') + '</span>',
        '</div>',
        '<div class="skill-detail-body">',
        '<p>' + (data.desc || '') + '</p>',
        '</div>',
        '<div class="skill-detail-footer">',
        '<span class="skill-detail-level">' + (data.level || '0%') + '</span>',
        '</div>',
        '</div>'
      ].join('\n');

      // Add tech tags
      if (data.teknologi && data.teknologi.length > 0) {
        var techTags = '<div class="skill-tech-tags">';
        data.teknologi.forEach(function(t) {
          techTags += '<span class="tech-chip">' + t + '</span>';
        });
        techTags += '</div>';
        skillDetail.innerHTML += techTags;
      }
    }

    function hideSkillDetail() {
      skillDetail.innerHTML = [
        '<div class="detail-placeholder">',
        '<i class="fas fa-mouse-pointer"></i>',
        '<p>Klik node skill untuk detail</p>',
        '</div>'
      ].join('\n');
    }

    skillNodes.forEach(function (node) {
      node.addEventListener('click', function () {
        var skillName = this.getAttribute('data-skill');

        // Close any open nodes
        skillNodes.forEach(function (n) { n.classList.remove('active'); });

        // Open clicked node
        this.classList.add('active');

        // Show detail
        showSkillDetail(skillName);
      });
    });

    // Close detail when clicking outside
    document.addEventListener('click', function (e) {
      var diDalamNode = Array.prototype.slice.call(skillNodes).some(function (n) {
        return n === e.target || n.contains(e.target);
      });
      if (!skillDetail.contains(e.target) && !diDalamNode) {
        hideSkillDetail();
        skillNodes.forEach(function (n) { n.classList.remove('active'); });
      }
    });

    // Keyboard accessibility (Escape to close)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hideSkillDetail();
        skillNodes.forEach(function (n) { n.classList.remove('active'); });
      }
    });
  }

  /* ---------- Theme Lab Controls ---------- */
  function initThemeLab() {
    var accentIntensity = document.getElementById('accentIntensity');
    var accentValue = document.getElementById('accentValue');
    var particleDensity = document.getElementById('particleDensity');
    var particleValue = document.getElementById('particleValue');
    var glowIntensity = document.getElementById('glowIntensity');
    var glowValue = document.getElementById('glowValue');
    var reducedMotion = document.getElementById('reducedMotion');
    var highContrast = document.getElementById('highContrast');
    var resetTheme = document.getElementById('resetTheme');

    if (!accentIntensity) return;

    function applyTheme() {
      var intensity = parseInt(accentIntensity.value);
      var particlePct = parseInt(particleDensity.value);
      var glowPct = parseInt(glowIntensity.value);

      document.documentElement.style.setProperty('--accent-grad', 'linear-gradient(135deg, rgba(59, 130, 246, ' + (intensity / 100) + '), rgba(96, 165, 250, ' + ((intensity + 30) / 100 > 1 ? 1 : (intensity + 30) / 100) + ')');
      document.documentElement.style.setProperty('--glow', '0 0 ' + (20 + glowPct * 0.35) + 'px rgba(59, 130, 246, ' + (intensity / 100) + ')');
      document.documentElement.style.setProperty('--grid-line', 'rgba(59, 130, 246, ' + (intensity * 0.5 / 100 + 0.02) + ')');

      if (particlesCanvas) {
        particlesCanvas.style.opacity = particlePct / 100;
      }

      if (reducedMotion && reducedMotion.checked) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }

      if (accentValue) accentValue.textContent = intensity + '%';
      if (particleValue) particleValue.textContent = particlePct + '%';
      if (glowValue) glowValue.textContent = glowPct + '%';
    }

    if (accentIntensity) {
      accentIntensity.addEventListener('input', applyTheme);
    }
    if (particleDensity) {
      particleDensity.addEventListener('input', applyTheme);
    }
    if (glowIntensity) {
      glowIntensity.addEventListener('input', applyTheme);
    }
    if (reducedMotion) {
      reducedMotion.addEventListener('change', applyTheme);
    }
    if (resetTheme) {
      resetTheme.addEventListener('click', function () {
        if (accentIntensity) accentIntensity.value = '50';
        if (particleDensity) particleDensity.value = '30';
        if (glowIntensity) glowIntensity.value = '60';
        applyTheme();
      });
    }

    applyTheme();
  }

  /* ---------- Network Lab Visualization ---------- */
  function initNetworkLab() {
    var networkCanvas = document.getElementById('networkCanvas');
    var nodes = [
      { x: 200, y: 100, label: 'CLIENT', color: '#3b82f6' },
      { x: 600, y: 150, label: 'ROUTER', color: '#f59e0b' },
      { x: 300, y: 350, label: 'SERVER', color: '#10b981' },
      { x: 700, y: 350, label: 'DATABASE', color: '#8b5cf6' }
    ];

    if (!networkCanvas) return;

    if (typeof networkCanvas.getContext !== 'function') {
      var canvasEl2 = document.createElement('canvas');
      canvasEl2.style.display = 'block';
      canvasEl2.style.width = '100%';
      canvasEl2.style.height = '100%';
      networkCanvas.appendChild(canvasEl2);
      networkCanvas = canvasEl2;
    }

    var canvas = networkCanvas.getContext('2d');
    var canvasEl = networkCanvas.parentNode;
    var resizeTimeout = null;
    var warnaLabel = (getComputedStyle(document.documentElement).getPropertyValue('--text') || '#0e1a26').trim() || '#0e1a26';

    function resizeCanvas() {
      var rect = canvasEl.getBoundingClientRect();
      networkCanvas.width = rect.width;
      networkCanvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    });

    function draw() {
      var w = networkCanvas.width;
      var h = networkCanvas.height;
      canvas.clearRect(0, 0, w, h);

      var sx = w / 800;
      var sy = h / 450;
      var s = Math.min(sx, sy);

      function titik(n) {
        return { x: n.x * sx, y: n.y * sy };
      }

      canvas.strokeStyle = '#94a3b8';
      canvas.lineWidth = 1;
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = titik(nodes[i]);
          var b = titik(nodes[j]);
          canvas.beginPath();
          canvas.moveTo(a.x, a.y);
          canvas.lineTo(b.x, b.y);
          canvas.stroke();
        }
      }

      nodes.forEach(function (n) {
        var p = titik(n);
        var r = Math.max(8, 20 * s);

        canvas.beginPath();
        canvas.arc(p.x, p.y, r, 0, Math.PI * 2);
        canvas.fillStyle = n.color;
        canvas.shadowColor = n.color;
        canvas.shadowBlur = 15;
        canvas.fill();
        canvas.shadowBlur = 0;

        canvas.beginPath();
        canvas.arc(p.x, p.y, r * 0.8, 0, Math.PI * 2);
        canvas.strokeStyle = '#fff';
        canvas.lineWidth = 3;
        canvas.stroke();

        canvas.fillStyle = warnaLabel;
        canvas.font = 'bold ' + Math.max(10, Math.round(12 * s)) + 'px sans-serif';
        canvas.textAlign = 'center';
        canvas.textBaseline = 'middle';
        canvas.fillText(n.label, p.x, p.y + r + 12 * s);
      });

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  /* ---------- AJIM_AI Interface ---------- */
  function initAIImpl() {
    var aiInput = document.getElementById('aiInput');
    var aiSend = document.getElementById('aiSend');
    var aiChat = document.getElementById('aiChat');

    if (!aiInput || !aiSend || !aiChat) return;

    function addMessage(content, isUser) {
      var msgEl = document.createElement('div');
      msgEl.className = 'ai-message ' + (isUser ? 'user' : 'system');
      msgEl.innerHTML = [
        '<div class="msg-content">' + content + '</div>'
      ].join('\n');
      aiChat.insertBefore(msgEl, aiChat.lastElementChild);
      aiChat.scrollTop = aiChat.scrollHeight;
    }

    function simulateResponse(userInput) {
      var lower = userInput.toLowerCase();
      var response;

      if (lower.includes('project')) {
        response = 'Saya memiliki 4 proyek utama: Panen Jamur, Mycelia Smart Farming, Sistem Penyiraman Otomatis, dan Website Profil Pribadi. Setiap proyek menggunakan teknologi berbeda seperti Flutter, Firebase, IoT, ESP32, Node.js, dan Express.';
      } else if (lower.includes('skill')) {
        response = 'Saya memiliki 8 teknologi yang dikuasai: Flutter/Dart, Firebase, IoT/ESP32, Node.js, Jaringan dasar, Linux, MySQL/SQLite, dan UI/UX Design. Setiap skill memiliki level kemahiran yang berbeda mulai dari 55% hingga 85%.';
      } else if (lower.includes('ai')) {
        response = 'AI integration untuk portfolio ini masih dalam fase placeholder. Sistem ini berjalan secara lokal tanpa API eksternal. Fitur AI sepenuhnya siap dikembangkan nanti dengan OpenAI, Anthropic, atau Firebase AI.';
      } else if (lower.includes('about') || lower.includes('tentang')) {
        response = 'Saya adalah Muhamad Hidayat, biasa dipanggil Ajim. Saya mahasiswa Teknik Informatika di Politeknik Hasnur dan sedang magang di Dinas Komunikasi dan Informatika Barito Kuala. Saya memiliki 5 tahun pengalaman membudidayakan jamur tiram putih dan proyek IoT yang melibatkan ESP32 dan Firebase.';
      } else if (lower.includes('help')) {
        response = 'Anda bisa bertanya tentang: project saya, skill saya, tentang saya, atau AI integration. Saya juga memiliki playground terminal yang bisa Anda eksplorasi dengan mengetik command seperti help, about, projects, skills, atau clear.';
      } else {
        response = 'Maaf, saya tidak mengerti maksud Anda. Coba ketik "help" untuk melihat command yang tersedia, atau tanyakan tentang project, skill, atau tentang saya.';
      }

      addMessage(response, false);
      setTimeout(function () { addMessage('', true); }, 3000);
    }

    function handleInput() {
      var value = aiInput.value.trim();
      if (!value) return;

      addMessage(value, true);
      simulateResponse(value);
      aiInput.value = '';
    }

    if (aiSend) {
      aiSend.addEventListener('click', handleInput);
    }

    if (aiInput) {
      aiInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          handleInput();
        }
      });
    }
  }

  /* ---------- Cursor Glow Effect ---------- */
  function initCursorGlow() {
    var cursorGlow = document.querySelector('.cursor-glow');
    if (!cursorGlow) return;

    var mouseX = 0, mouseY = 0;
    var glowX = 0, glowY = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      glowX += (mouseX - glowX) * 0.15;
      glowY += (mouseY - glowY) * 0.15;

      cursorGlow.style.left = glowX - 150 + 'px';
      cursorGlow.style.top = glowY - 150 + 'px';
    });

    // Add hover effect to interactive elements
    var interactiveElements = document.querySelectorAll('a, button, .station-card, .tech-card, .skill-node, .artifact-card');
    interactiveElements.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursorGlow.classList.add('active');
      });
      el.addEventListener('mouseleave', function () {
        cursorGlow.classList.remove('active');
      });
    });
  }

  /* ---------- Easter Egg: Matrix Rain ---------- */
  function initMatrixEasterEgg() {
    var matrixCanvas = document.createElement('canvas');
    matrixCanvas.id = 'matrixCanvas';
    matrixCanvas.className = 'matrix-canvas';
    matrixCanvas.style.cssText = 'position: fixed; inset: 0; z-index: 50; pointer-events: none; opacity: 0; visibility: hidden;';
    document.body.appendChild(matrixCanvas);

    var matrixText = '0123456789ABCDEF';
    var columns = [];
    var drops = [];
    var fontsSize = 16;

    function resizeMatrix() {
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;
      fontsSize = Math.max(10, Math.floor(window.innerWidth / 50));
      columns = [];
      drops = [];

      for (var i = 0; i < matrixCanvas.width / fontsSize; i++) {
        columns[i] = 1;
        drops[i] = 1;
      }
    }
    resizeMatrix();
    window.addEventListener('resize', resizeMatrix);

    function drawMatrix() {
      if (!document.body.classList.contains('matrix-active')) return;
      var ctx = matrixCanvas.getContext('2d');
      ctx.fillStyle = 'rgba(3, 8, 12, 0.05)';
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

      ctx.fillStyle = '#3b82f6';
      ctx.font = fontsSize + 'px monospace';

      columns.forEach(function (i, index) {
        var text = matrixText[Math.floor(Math.random() * matrixText.length)];
        ctx.fillText(text, index * fontsSize, drops[i] * fontsSize);

        if (drops[i] * fontsSize > matrixCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      });
    }

    var matrixInterval = setInterval(drawMatrix, 30);

    // Toggle matrix on double-click
    var lastClick = 0;
    document.addEventListener('click', function (e) {
      var now = new Date().getTime();
      if (now - lastClick < 300) {
        document.body.classList.toggle('matrix-active');
        if (document.body.classList.contains('matrix-active')) {
          matrixCanvas.style.opacity = '0.15';
          matrixCanvas.style.visibility = 'visible';
        } else {
          matrixCanvas.style.opacity = '0';
          matrixCanvas.style.visibility = 'hidden';
        }
      }
      lastClick = now;
    });
  }

  /* ---------- Initialize Everything ---------- */
  bootSequence();
  initParticles();
  animateCounters();
  initSkillTree();
  initThemeLab();
  initNetworkLab();
  initAIImpl();
  initCursorGlow();
  initMatrixEasterEgg();

})();