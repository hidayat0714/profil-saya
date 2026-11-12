/* =========================================================
   AJIM // DIGITAL LAB — games.js
   Terminal interaktif + Arcade (SNAKE & BALON)
   ========================================================= */
(function () {
  'use strict';

  var PROMPT = 'ajim@digital-lab:~$';
  var panel = document.getElementById('terminal');
  if (!panel) return;

  var winEl = panel.querySelector('.terminal-window');
  var body = document.getElementById('terminalBody');
  var input = document.getElementById('terminalInput');
  var helpEl = panel.querySelector('.terminal-help');
  if (!winEl || !body || !input) return;

  var inputLine = input.parentNode;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Playground tabs ---------- */
  var tabRoot = panel.closest('.playground-tabs') || panel.parentNode;
  var tabBtns = Array.prototype.slice.call(tabRoot.querySelectorAll('.tab-btn'));
  var tabPanels = Array.prototype.slice.call(tabRoot.querySelectorAll('.tab-panel'));

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-tab');
      if (game.active && id !== 'terminal') exitGame();
      tabBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      tabPanels.forEach(function (p) {
        p.classList.toggle('active', p.id === id);
      });
      window.dispatchEvent(new Event('resize'));
    });
  });

  /* ---------- Output terminal ---------- */
  function scrollBottom() {
    body.scrollTop = body.scrollHeight;
  }

  function printOutput(html) {
    var line = document.createElement('div');
    line.className = 'terminal-line';
    var p = document.createElement('span');
    p.className = 'terminal-prompt';
    p.textContent = PROMPT;
    var t = document.createElement('span');
    t.className = 'terminal-text';
    t.innerHTML = html;
    line.appendChild(p);
    line.appendChild(t);
    body.insertBefore(line, inputLine);
    scrollBottom();
  }

  function printBlock(html) {
    var line = document.createElement('div');
    line.className = 'terminal-line terminal-block';
    var t = document.createElement('span');
    t.className = 'terminal-text';
    t.innerHTML = html;
    line.appendChild(t);
    body.insertBefore(line, inputLine);
    scrollBottom();
  }

  function printRows(rows) {
    rows.forEach(printOutput);
  }

  function echo(cmd) {
    var line = document.createElement('div');
    line.className = 'terminal-line';
    var p = document.createElement('span');
    p.className = 'terminal-prompt';
    p.textContent = PROMPT;
    var t = document.createElement('span');
    t.className = 'terminal-text';
    t.textContent = cmd;
    line.appendChild(p);
    line.appendChild(t);
    body.insertBefore(line, inputLine);
    scrollBottom();
  }

  function focusInput() {
    if (finePointer && game.active === false) input.focus();
  }

  function clearTerminal() {
    Array.prototype.slice.call(body.children).forEach(function (child) {
      if (child !== inputLine) body.removeChild(child);
    });
    scrollBottom();
  }

  /* ---------- Data command ---------- */
  function ambilProyek() {
    var el = document.getElementById('proyek-data');
    if (!el) return [];
    try { return JSON.parse(el.textContent) || []; } catch (e) { return []; }
  }

  function ambilSkill() {
    var nodes = document.querySelectorAll('[data-skill]');
    var names = [];
    nodes.forEach(function (n) {
      var nme = n.getAttribute('data-skill');
      if (nme && names.indexOf(nme) === -1) names.push(nme);
    });
    return names;
  }

  var COMMANDS = {
    help: function () {
      printRows([
        '<span class="cmd">help</span> — daftar perintah',
        '<span class="cmd">about</span> — info profil',
        '<span class="cmd">projects</span> — daftar proyek',
        '<span class="cmd">skills</span> — daftar keahlian',
        '<span class="cmd">contact</span> — cara menghubungi',
        '<span class="cmd">whoami</span> — identitas sesi',
        '<span class="cmd">neofetch</span> — info sistem',
        '<span class="cmd">matrix</span> — toggle matrix rain',
        '<span class="cmd">clear</span> — bersihkan terminal',
        '<span class="cmd">games</span> — <b>menu arcade</b>',
        '<span class="cmd">snake</span> — <b>main game ular</b>',
        '<span class="cmd">balon</span> — <b>main game balon udara</b>',
        '<span class="cmd">hs</span> — highscore tersimpan'
      ]);
    },

    about: function () {
      printRows([
        '<b>Muhamad Hidayat</b> (@ajim)',
        'Mahasiswa Teknik Informatika &amp; Smart Farming Developer',
        'Politeknik Hasnur D4 TI (Semester 5) • Magang di Diskominfo Barito Kuala',
        'Fokus: IoT, Flutter, Firebase — budidaya jamur tiram'
      ]);
    },

    projects: function () {
      var proyek = ambilProyek();
      if (!proyek.length) { printOutput('Belum ada data proyek.'); return; }
      proyek.forEach(function (p, i) {
        printOutput('<span class="cmd">' + (i + 1) + '.</span> <b>' + p.nama + '</b> — ' + (p.teknologi || []).join(', '));
      });
    },

    skills: function () {
      var skills = ambilSkill();
      if (!skills.length) { printOutput('Belum ada data skill.'); return; }
      printOutput(skills.join(' <span class="cmd">•</span> '));
    },

    contact: function () {
      printRows([
        'Email&nbsp;&nbsp;: <span class="cmd">garudalangit72@gmail.com</span>',
        'WA&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <span class="cmd">+62 838-4486-3295</span>',
        'GitHub&nbsp;: <span class="cmd">github.com/hidayat0714</span>',
        'Lokasi&nbsp;: Barito Kuala, Kalimantan Selatan'
      ]);
    },

    whoami: function () {
      printOutput('guest@digital-lab — pengunjung portofolio (level: explorer)');
    },

    neofetch: function () {
      printRows([
        '<span class="cmd">ajim@digital-lab</span>──────────────────',
        'OS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Digital Lab v1.0 (web)',
        'Host&nbsp;&nbsp;&nbsp;&nbsp;: Portfolio ' + window.location.host,
        'Kernel&nbsp;&nbsp;: Node.js + Express + EJS',
        'Shell&nbsp;&nbsp;&nbsp;: ajim-sh 1.0',
        'Tema&nbsp;&nbsp;&nbsp;&nbsp;: ' + (document.documentElement.getAttribute('data-theme') || 'dark'),
        'Layar&nbsp;&nbsp;&nbsp;: ' + window.innerWidth + 'x' + window.innerHeight,
        'Arcade&nbsp;&nbsp;: snake.exe, balon.exe'
      ]);
    },

    matrix: function () {
      var canvas = document.getElementById('matrixCanvas');
      var on = document.body.classList.toggle('matrix-active');
      if (canvas) {
        canvas.style.opacity = on ? '0.15' : '0';
        canvas.style.visibility = on ? 'visible' : 'hidden';
      }
      printOutput('matrix rain: <span class="cmd">' + (on ? 'ON' : 'OFF') + '</span>');
    },

    clear: function () {
      clearTerminal();
    },

    games: function () {
      printOutput('<b>┌─ ARCADE ──────────────────────────┐</b>');
      printOutput('<b>│</b> <span class="cmd">snake</span> — ular klasik&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>│</b>');
      printOutput('<b>│</b> <span class="cmd">balon</span> — balon hindari rintangan <b>│</b>');
      printOutput('<b>└───────────────────────────────────┘</b>');
      printOutput('ketik <span class="cmd">snake</span> atau <span class="cmd">balon</span> untuk mulai');
    },

    snake: function () {
      startGame('snake');
    },

    ular: function () {
      startGame('snake');
    },

    balon: function () {
      startGame('balon');
    },

    balloon: function () {
      startGame('balon');
    },

    hs: function () {
      printRows([
        'SNAKE&nbsp;: <span class="cmd">' + getBest('snake') + '</span>',
        'BALON&nbsp;: <span class="cmd">' + getBest('balon') + '</span>'
      ]);
    },

    stop: function () { printOutput('belum ada game yang berjalan.'); },
    exit: function () { printOutput('belum ada game yang berjalan.'); },
    quit: function () { printOutput('belum ada game yang berjalan.'); },
    keluar: function () { printOutput('belum ada game yang berjalan.'); }
  };

  /* ---------- Riwayat perintah ---------- */
  var history = [];
  var histIdx = -1;

  function runCommand(raw) {
    var cmd = raw.trim();
    echo(cmd);
    if (!cmd) return;
    history.push(cmd);
    histIdx = history.length;

    var name = cmd.split(/\s+/)[0].toLowerCase();
    if (COMMANDS[name]) {
      COMMANDS[name]();
    } else {
      printOutput('perintah tidak dikenal: <span class="cmd">' + escapeHtml(name) + '</span> — ketik <span class="cmd">help</span>');
    }
    if (finePointer) input.focus();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var v = input.value;
      input.value = '';
      runCommand(v);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
      else { histIdx = history.length; input.value = ''; }
    }
  });

  body.addEventListener('click', function (e) {
    if (!game.active && !e.target.closest('button')) focusInput();
  });

  /* =========================================================
     GAME SHELL
     ========================================================= */
  var game = {
    active: false,
    name: null,
    score: 0,
    stage: null,
    canvas: null,
    ctx: null,
    viewport: null,
    controls: null,
    overlay: null,
    destroy: null
  };

  var META = {
    snake: { label: 'SNAKE', icon: 'fa-worm' },
    balon: { label: 'BALON', icon: 'fa-cloud' }
  };

  function storageKey(name) {
    return 'ds_high_' + name;
  }

  function getBest(name) {
    try { return parseInt(localStorage.getItem(storageKey(name)), 10) || 0; } catch (e) { return 0; }
  }

  function setBest(name, nilai) {
    try { localStorage.setItem(storageKey(name), String(nilai)); } catch (e) { /* abaikan */ }
  }

  function setScore(nilai) {
    game.score = nilai;
    var el = game.stage && game.stage.querySelector('.js-score');
    if (el) el.textContent = nilai;
  }

  function updateBest() {
    var el = game.stage && game.stage.querySelector('.js-best');
    if (el) el.textContent = getBest(game.name);
  }

  function hideTerminal(sembunyi) {
    panel.classList.toggle('game-active', sembunyi);
    if (sembunyi) {
      winEl.setAttribute('hidden', '');
      if (helpEl) helpEl.setAttribute('hidden', '');
    } else {
      winEl.removeAttribute('hidden');
      if (helpEl) helpEl.removeAttribute('hidden');
    }
  }

  function buildStage(name) {
    var meta = META[name];
    var stage = document.createElement('div');
    stage.className = 'game-stage';
    stage.innerHTML = [
      '<div class="game-hud">',
      '<span class="game-chip game-chip-title"><i class="fas ' + meta.icon + '"></i> ' + meta.label + '</span>',
      '<span class="game-chip">SKOR <b class="js-score">0</b></span>',
      '<span class="game-chip">BEST <b class="js-best">0</b></span>',
      '<button type="button" class="game-chip game-exit js-exit"><i class="fas fa-times"></i> KELUAR</button>',
      '</div>',
      '<div class="game-viewport js-viewport">',
      '<canvas class="game-canvas js-canvas"></canvas>',
      '<div class="game-overlay js-overlay"></div>',
      '</div>',
      '<div class="game-controls js-controls"></div>',
      '<div class="game-hint js-hint"></div>'
    ].join('');

    panel.insertBefore(stage, helpEl);

    game.stage = stage;
    game.canvas = stage.querySelector('.js-canvas');
    game.ctx = game.canvas.getContext('2d');
    game.viewport = stage.querySelector('.js-viewport');
    game.controls = stage.querySelector('.js-controls');
    game.overlay = stage.querySelector('.js-overlay');

    stage.querySelector('.js-exit').addEventListener('click', function () {
      exitGame();
    });
  }

  function overlayVisible() {
    return game.overlay && !game.overlay.classList.contains('hidden');
  }

  function primaryAction() {
    if (!overlayVisible()) return;
    var btn = game.overlay.querySelector('.btn-game.primary');
    if (btn) btn.click();
  }

  function showOverlay(jenis, opts) {
    opts = opts || {};
    var ov = game.overlay;
    ov.classList.remove('hidden');
    var aksi = '';

    if (jenis === 'start') {
      aksi = '<button type="button" class="btn-game primary js-primary">' + (opts.label || 'MULAI') + '</button>';
    } else {
      aksi = '<button type="button" class="btn-game primary js-primary">MAIN LAGI</button>' +
        '<button type="button" class="btn-game js-keluar">KELUAR</button>';
    }

    ov.innerHTML = [
      '<div class="game-overlay-title">' + (opts.title || META[game.name].label) + '</div>',
      '<div class="game-overlay-msg">' + (opts.msg || '') + '</div>',
      opts.skor !== undefined ? '<div class="game-overlay-score">SKOR ' + opts.skor + ' &nbsp;•&nbsp; BEST ' + getBest(game.name) + '</div>' : '',
      '<div class="game-overlay-actions">' + aksi + '</div>'
    ].join('');

    var primary = ov.querySelector('.js-primary');
    if (primary) {
      primary.addEventListener('click', function (e) {
        e.stopPropagation();
        if (jenis === 'start' && opts.onStart) opts.onStart();
        else if (jenis !== 'start') restartGame();
      });
    }
    var keluar = ov.querySelector('.js-keluar');
    if (keluar) {
      keluar.addEventListener('click', function (e) {
        e.stopPropagation();
        exitGame();
      });
    }
    if (jenis === 'start') {
      ov.addEventListener('click', function handler(e) {
        if (e.target === primary) return;
        ov.removeEventListener('click', handler);
        if (opts.onStart) opts.onStart();
      });
    }
  }

  function hideOverlay() {
    if (game.overlay) game.overlay.classList.add('hidden');
  }

  function setHint(html) {
    var el = game.stage && game.stage.querySelector('.js-hint');
    if (el) el.innerHTML = html;
  }

  function gameOver(judul, pesan) {
    var terbaik = getBest(game.name);
    if (game.score > terbaik) {
      terbaik = game.score;
      setBest(game.name, terbaik);
    }
    updateBest();
    showOverlay('over', { title: judul || 'GAME OVER', msg: pesan || '' });
  }

  function makeApi() {
    return {
      canvas: game.canvas,
      ctx: game.ctx,
      viewport: game.viewport,
      controls: game.controls,
      setScore: setScore,
      showOverlay: showOverlay,
      hideOverlay: hideOverlay,
      gameOver: gameOver,
      setHint: setHint,
      getBest: getBest
    };
  }

  function startGame(name) {
    if (game.active) destroyGame();
    game.active = true;
    game.name = name;
    game.score = 0;

    buildStage(name);
    hideTerminal(true);
    updateBest();
    setScore(0);

    game.destroy = (name === 'snake' ? jalankanSnake : jalankanBalon)(makeApi());

    window.addEventListener('keydown', onGlobalKey, true);
    printOutput('memuat <span class="cmd">' + name + '.exe</span> ...');
  }

  function destroyGame() {
    window.removeEventListener('keydown', onGlobalKey, true);
    if (typeof game.destroy === 'function') {
      try { game.destroy(); } catch (e) { /* abaikan */ }
    }
    game.destroy = null;
    if (game.stage && game.stage.parentNode) game.stage.parentNode.removeChild(game.stage);
    game.stage = null;
    game.canvas = null;
    game.ctx = null;
    game.overlay = null;
    game.controls = null;
    game.viewport = null;
    game.active = false;
    hideTerminal(false);
  }

  function exitGame() {
    if (!game.active) return;
    var nama = game.name;
    var skor = game.score;
    destroyGame();
    printOutput('<span class="cmd">' + nama + '</span> dihentikan — skor: <b>' + skor + '</b>, best: <b>' + getBest(nama) + '</b>');
    if (finePointer) input.focus();
  }

  function restartGame() {
    if (!game.active) return;
    startGame(game.name);
  }

  function onGlobalKey(e) {
    if (!game.active) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      exitGame();
      return;
    }

    if (e.code === 'Space' || e.key === 'Enter') {
      if (overlayVisible()) {
        var ae = document.activeElement;
        if (ae && ae.tagName === 'BUTTON' && game.overlay.contains(ae)) return;
        e.preventDefault();
        e.stopPropagation();
        primaryAction();
      } else if (e.code === 'Space') {
        e.preventDefault();
      }
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) !== -1) {
      e.preventDefault();
    }
  }

  /* =========================================================
     SNAKE
     ========================================================= */
  function jalankanSnake(api) {
    var canvas = api.canvas;
    var ctx = api.ctx;
    var COLS = 15;
    var ROWS = 15;
    var cell = 20;
    var size = 300;

    var snake = [];
    var dir = { x: 1, y: 0 };
    var queue = [];
    var makanan = { x: 0, y: 0 };
    var hidup = true;
    var mulai = false;
    var acc = 0;
    var last = 0;
    var raf = null;

    function fit() {
      var vw = api.viewport.clientWidth || 320;
      var batas = Math.max(200, Math.min(440, Math.round(window.innerHeight * 0.5)));
      size = Math.max(200, Math.min(440, vw, batas));
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = size / COLS;
    }

    function taruhMakanan() {
      var bebas = [];
      for (var x = 0; x < COLS; x++) {
        for (var y = 0; y < ROWS; y++) {
          var kena = snake.some(function (s) { return s.x === x && s.y === y; });
          if (!kena) bebas.push({ x: x, y: y });
        }
      }
      makanan = bebas[Math.floor(Math.random() * bebas.length)] || { x: 0, y: 0 };
    }

    function reset() {
      var cx = Math.floor(COLS / 2);
      var cy = Math.floor(ROWS / 2);
      snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
      dir = { x: 1, y: 0 };
      queue = [];
      hidup = true;
      mulai = false;
      acc = 0;
      last = 0;
      api.setScore(0);
      taruhMakanan();
      api.setHint('SWIPE layar / tombol panah untuk belok • <span class="cmd">Esc</span> keluar');
      api.showOverlay('start', {
        title: 'SNAKE',
        msg: 'Makan makanan, jangan nabrak diri sendiri atau tembok',
        onStart: function () {
          mulai = true;
          api.hideOverlay();
          last = 0;
          acc = 0;
        }
      });
    }

    function mati(pesan) {
      hidup = false;
      mulai = false;
      api.gameOver('GAME OVER', pesan || '');
    }

    function tick() {
      if (queue.length) {
        var nd = queue.shift();
        if (!(nd.x === -dir.x && nd.y === -dir.y)) dir = nd;
      }

      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
        return mati('Nabrak tembok');
      }
      for (var i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          return mati('Nabrak badan sendiri');
        }
      }

      snake.unshift(head);
      if (head.x === makanan.x && head.y === makanan.y) {
        api.setScore(game.score + 1);
        taruhMakanan();
      } else {
        snake.pop();
      }
    }

    function arahkan(d) {
      if (!hidup) return;
      if (!mulai) {
        mulai = true;
        api.hideOverlay();
        last = 0;
        acc = 0;
      }
      var target = queue.length ? queue[queue.length - 1] : dir;
      if (d.x === -target.x && d.y === -target.y) return;
      if (d.x === target.x && d.y === target.y) return;
      if (queue.length >= 2) return;
      queue.push(d);
    }

    function gambar(now) {
      ctx.clearRect(0, 0, size, size);

      ctx.fillStyle = '#05070f';
      ctx.fillRect(0, 0, size, size);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
      ctx.lineWidth = 1;
      for (var i = 1; i < COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cell, 0);
        ctx.lineTo(i * cell, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cell);
        ctx.lineTo(size, i * cell);
        ctx.stroke();
      }

      var denyut = 1 + Math.sin((now || 0) / 180) * 0.12;
      var fx = makanan.x * cell + cell / 2;
      var fy = makanan.y * cell + cell / 2;
      ctx.save();
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(fx, fy, (cell * 0.32) * denyut, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(fx - cell * 0.1, fy - cell * 0.08, cell * 0.07, 0, Math.PI * 2);
      ctx.arc(fx + cell * 0.1, fy - cell * 0.08, cell * 0.07, 0, Math.PI * 2);
      ctx.fill();

      snake.forEach(function (s, idx) {
        var head = idx === 0;
        var pad = head ? 1.5 : 2.5;
        var x = s.x * cell + pad;
        var y = s.y * cell + pad;
        var w = cell - pad * 2;
        var r = Math.min(7, w / 3);

        ctx.save();
        if (head) {
          ctx.shadowColor = '#67e8f9';
          ctx.shadowBlur = 12;
        }
        var grad = ctx.createLinearGradient(x, y, x + w, y + w);
        if (head) {
          grad.addColorStop(0, '#67e8f9');
          grad.addColorStop(1, '#22d3ee');
        } else {
          var t = 1 - Math.min(idx / Math.max(snake.length, 1), 1);
          grad.addColorStop(0, 'rgba(139, 92, 246,' + (0.55 + t * 0.4) + ')');
          grad.addColorStop(1, 'rgba(103, 232, 249,' + (0.35 + t * 0.4) + ')');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + w, r);
        ctx.arcTo(x + w, y + w, x, y + w, r);
        ctx.arcTo(x, y + w, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        if (head) {
          ctx.fillStyle = '#04121a';
          var ex = dir.x === 0 ? 0 : dir.x * cell * 0.16;
          var ey = dir.y === 0 ? 0 : dir.y * cell * 0.16;
          ctx.beginPath();
          ctx.arc(x + w / 2 + ex - cell * 0.12, y + w / 2 + ey, cell * 0.08, 0, Math.PI * 2);
          ctx.arc(x + w / 2 + ex + cell * 0.12, y + w / 2 + ey, cell * 0.08, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (mulai && hidup) {
        if (!last) last = now;
        acc += now - last;
        last = now;
        var step = Math.max(75, 150 - game.score * 4);
        var pengaman = 0;
        while (acc >= step && hidup && pengaman < 4) {
          acc -= step;
          pengaman++;
          tick();
        }
      }
      gambar(now);
    }

    /* kontrol */
    var petaTombol = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
    };

    function onKey(e) {
      if (overlayVisible()) return;
      var d = petaTombol[e.key] || petaTombol[String(e.key).toLowerCase()];
      if (d) {
        e.preventDefault();
        arahkan(d);
      }
    }

    var sx = 0, sy = 0, sentuh = false;

    function onTouchStart(e) {
      if (overlayVisible()) return;
      var t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
      sentuh = true;
      e.preventDefault();
    }

    function onTouchEnd(e) {
      if (!sentuh || overlayVisible()) return;
      sentuh = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - sx;
      var dy = t.clientY - sy;
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) {
        if (!mulai) {
          mulai = true;
          api.hideOverlay();
          last = 0;
          acc = 0;
        }
        return;
      }
      arahkan(Math.abs(dx) > Math.abs(dy) ? { x: dx > 0 ? 1 : -1, y: 0 } : { x: 0, y: dy > 0 ? 1 : -1 });
      e.preventDefault();
    }

    function onClick() {
      if (!mulai && !overlayVisible()) {
        mulai = true;
        api.hideOverlay();
        last = 0;
        acc = 0;
      }
    }

    function onResize() {
      fit();
      gambar(performance.now());
    }

    /* dpad */
    var dpad = document.createElement('div');
    dpad.className = 'dpad';
    [
      { cls: 'up', icon: 'fa-chevron-up', d: { x: 0, y: -1 } },
      { cls: 'left', icon: 'fa-chevron-left', d: { x: -1, y: 0 } },
      { cls: 'down', icon: 'fa-chevron-down', d: { x: 0, y: 1 } },
      { cls: 'right', icon: 'fa-chevron-right', d: { x: 1, y: 0 } }
    ].forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dpad-btn ' + b.cls;
      btn.setAttribute('aria-label', 'arah ' + b.cls);
      btn.innerHTML = '<i class="fas ' + b.icon + '"></i>';
      btn.addEventListener('click', function () { arahkan(b.d); });
      dpad.appendChild(btn);
    });
    api.controls.appendChild(dpad);

    fit();
    reset();
    raf = requestAnimationFrame(loop);

    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('click', onClick);

    return function () {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('click', onClick);
    };
  }

  /* =========================================================
     BALON
     ========================================================= */
  function jalankanBalon(api) {
    var canvas = api.canvas;
    var ctx = api.ctx;
    var W = 360;
    var H = 220;
    var R = 14;
    var GW = 46;

    var balon = { x: 90, y: 110, vy: 0 };
    var gerbang = [];
    var bintang = [];
    var hidup = true;
    var mulai = false;
    var kecepatan = 2.1;
    var jedaSpawn = 0;
    var last = 0;
    var raf = null;

    function fit() {
      var vw = api.viewport.clientWidth || 320;
      W = Math.max(240, Math.min(440, vw));
      H = Math.max(180, Math.min(300, Math.round(W * 0.6)));
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      balon.x = W * 0.26;
    }

    function buatBintang() {
      bintang = [];
      for (var i = 0; i < 26; i++) {
        bintang.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.4 + 0.4,
          a: Math.random() * 0.6 + 0.2
        });
      }
    }

    function reset() {
      balon = { x: W * 0.26, y: H / 2, vy: 0 };
      gerbang = [];
      hidup = true;
      mulai = false;
      kecepatan = 2.1;
      jedaSpawn = 0;
      last = 0;
      api.setScore(0);
      buatBintang();
      api.setHint('TAP layar atau tombol SPASI untuk naik • <span class="cmd">Esc</span> keluar');
      api.showOverlay('start', {
        title: 'BALON',
        msg: 'Terbang melewati celah tanpa menyentuh tiang',
        onStart: function () {
          mulai = true;
          api.hideOverlay();
          last = 0;
          flap();
        }
      });
    }

    function celah() {
      return Math.max(92, 120 - game.score * 2);
    }

    function spawn() {
      var gap = celah();
      var margin = 46;
      var gapY = margin + Math.random() * (H - margin * 2 - gap);
      gerbang.push({ x: W + 10, gapY: gapY, lewat: false });
    }

    function flap() {
      if (!hidup) return;
      if (!mulai) {
        mulai = true;
        api.hideOverlay();
        last = 0;
      }
      balon.vy = -7.1;
    }

    function mati(pesan) {
      if (!hidup) return;
      hidup = false;
      mulai = false;
      api.gameOver('GAME OVER', pesan || '');
    }

    function tabrak(x, y, w, h) {
      var cx = Math.max(x, Math.min(balon.x, x + w));
      var cy = Math.max(y, Math.min(balon.y, y + h));
      var dx = balon.x - cx;
      var dy = balon.y - cy;
      return dx * dx + dy * dy < R * R;
    }

    function update(f, dt) {
      balon.vy += 0.42 * f;
      balon.y += balon.vy * f;

      if (balon.y - R <= 0) return mati('Terlalu tinggi');
      if (balon.y + R >= H) return mati('Jatuh ke bawah');

      jedaSpawn += dt;
      var interval = Math.max(950, 1500 - game.score * 45);
      if (jedaSpawn >= interval) {
        jedaSpawn = 0;
        spawn();
      }

      for (var i = gerbang.length - 1; i >= 0; i--) {
        var g = gerbang[i];
        g.x -= kecepatan * f;

        if (!g.lewat && g.x + GW < balon.x) {
          g.lewat = true;
          api.setScore(game.score + 1);
          kecepatan = Math.min(3.7, 2.1 + game.score * 0.07);
        }

        if (tabrak(g.x, 0, GW, g.gapY) || tabrak(g.x, g.gapY + celah(), GW, H - g.gapY - celah())) {
          return mati('Kena tiang');
        }

        if (g.x + GW < -20) gerbang.splice(i, 1);
      }
    }

    function gambar(now) {
      var grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#070b18');
      grad.addColorStop(1, '#0d1030');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      bintang.forEach(function (b) {
        ctx.globalAlpha = b.a * (0.6 + Math.sin((now || 0) / 500 + b.x) * 0.4);
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      gerbang.forEach(function (g) {
        var gap = celah();
        ctx.save();
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(g.x, -4, GW, g.gapY + 4);
        ctx.fillRect(g.x, g.gapY + gap, GW, H - g.gapY - gap + 4);
        ctx.restore();

        ctx.fillStyle = '#c4b5fd';
        ctx.fillRect(g.x, g.gapY - 7, GW, 7);
        ctx.fillRect(g.x, g.gapY + gap, GW, 7);
      });

      var putar = Math.max(-0.35, Math.min(0.35, balon.vy * 0.035));
      ctx.save();
      ctx.translate(balon.x, balon.y);
      ctx.rotate(putar);

      ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, R + 2);
      ctx.lineTo(0, R + 12);
      ctx.stroke();

      ctx.fillStyle = '#a16207';
      ctx.fillRect(-5, R + 12, 10, 7);

      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 16;
      var bg = ctx.createRadialGradient(-4, -5, 2, 0, 0, R + 3);
      bg.addColorStop(0, '#a5f3fc');
      bg.addColorStop(0.5, '#22d3ee');
      bg.addColorStop(1, '#0e7490');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.ellipse(0, 0, R, R + 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.ellipse(balon.x - 5, balon.y - 6, 3, 4.5, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      var dt = last ? Math.min(now - last, 60) : 16.7;
      last = now;
      if (mulai && hidup) update(dt / 16.7, dt);
      gambar(now);
    }

    function onKey(e) {
      if (overlayVisible()) return;
      if (e.code === 'Space' || e.key === 'ArrowUp' || String(e.key).toLowerCase() === 'w') {
        e.preventDefault();
        flap();
      }
    }

    function onTap(e) {
      if (overlayVisible()) return;
      e.preventDefault();
      flap();
    }

    function onResize() {
      var skalaY = H ? balon.y / H : 0.5;
      var skalaGap = H ? gerbang.map(function (g) { return g.gapY / H; }) : [];
      fit();
      balon.y = skalaY * H;
      gerbang.forEach(function (g, i) {
        if (skalaGap[i] !== undefined) g.gapY = skalaGap[i] * H;
      });
      if (!bintang.length) buatBintang();
      gambar(performance.now());
    }

    var tapBtn = document.createElement('button');
    tapBtn.type = 'button';
    tapBtn.className = 'tap-btn';
    tapBtn.innerHTML = '<i class="fas fa-hand-pointer"></i> TAP UNTUK NAIK';
    tapBtn.addEventListener('click', function (e) {
      e.preventDefault();
      flap();
    });
    api.controls.appendChild(tapBtn);

    fit();
    buatBintang();
    reset();
    raf = requestAnimationFrame(loop);

    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    canvas.addEventListener('pointerdown', onTap);

    return function () {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onTap);
    };
  }

  printRows([
    'Welcome to <b>AJIM Digital Lab Terminal</b> v1.0',
    'Ketik <span class="cmd">help</span> untuk perintah, <span class="cmd">games</span> untuk arcade'
  ]);
})();
