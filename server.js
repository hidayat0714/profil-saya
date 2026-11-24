const express = require('express');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { getDatabase } = require('firebase-admin/database');

// Env loader ringan (tanpa dotenv): baca .env.local bila ada — lokal saja.
try {
  const envFile = path.join(__dirname, '.env.local');
  if (fs.existsSync(envFile)) {
    fs.readFileSync(envFile, 'utf-8').split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
    });
  }
} catch (e) { /* abaikan */ }

const app = express();
const PORT = process.env.PORT || 3000;

// NOTE: Pengaturan aplikasi, rute, dan export 'app' ada di bawah.
// Di Vercel, file ini menjadi entrypoint function; app diexport sebagai default.
// Saat dijalankan lokal (node server.js), app.listen() dipanggil secara manual.

const DATA_DIR = path.join(__dirname, 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Firebase untuk menyimpan pesan kontak secara persisten (online).
// Jika env FIREBASE_SA tidak ada (localhost), fallback ke file lokal.
// Catatan: firebase-admin v14 mengekspor 'cert' di top-level dan 'getDatabase'
// dari subpath 'firebase-admin/database'.
let db = null;
let firebaseApp = null;
try {
  if (process.env.FIREBASE_SA) {
    const sa = JSON.parse(Buffer.from(process.env.FIREBASE_SA, 'base64').toString('utf-8'));
    firebaseApp = admin.initializeApp({
      credential: admin.cert(sa),
      databaseURL: 'https://myceliasuhu-default-rtdb.asia-southeast1.firebasedatabase.app',
    });
    db = getDatabase(firebaseApp);
  } else if (fs.existsSync(path.join(__dirname, 'service-account.json'))) {
    firebaseApp = admin.initializeApp({
      credential: admin.cert(path.join(__dirname, 'service-account.json')),
      databaseURL: 'https://myceliasuhu-default-rtdb.asia-southeast1.firebasedatabase.app',
    });
    db = getDatabase(firebaseApp);
  }
} catch (e) {
  console.error('Firebase init error:', e.message);
}

// --- Ekspor app untuk Vercel (serverless function). Di Vercel, folder
// 'public/' otomatis disajikan sebagai aset statis oleh CDN, jadi kita
// hapus express.static (tidak berfungsi di Vercel) dan biarkan Vercel
// menanganinya. Untuk dev lokal, tetap pakai express.static.
const IS_VERCEL = process.env.VERCEL === '1';

if (!IS_VERCEL) {
  app.use(express.static(path.join(__dirname, 'public')));
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const profilData = {
  nama: 'Muhamad Hidayat',
  namaPanggilan: 'Ajim',
  ttl: 'Sei Pantai, 02 Desember 2005',
  role: 'Mahasiswa Teknik Informatika & Smart Farming Developer',
  email: 'garudalangit72@gmail.com',
  lokasi: 'Barito Kuala, Kalimantan Selatan',
  tagline:
    'Mahasiswa Teknik Informatika yang menggabungkan IT dengan pertanian — membangun solusi IoT untuk budidaya jamur tiram.',
  ringkasan:
    'Saya Muhamad Hidayat, biasa dipanggil Ajim. Mahasiswa semester 5 Teknik Informatika di Politeknik Hasnur ' +
    'dan sedang magang di Dinas Komunikasi dan Informatika (Diskominfo) Barito Kuala. ' +
    'Berpengalaman 5 tahun membudidayakan jamur tiram putih (omset ±3 juta/bulan), hidroponik, dan bertani padi. ' +
    'Tugas akhir saya mengambil tema IoT — satu-satunya dari 7 tahun angkatan di kampus yang memilih judul tersebut.',
  hobi: ['Mancing di sungai Barito', 'Menikmati alam', 'Eksplorasi teknologi IoT'],
  warnaFavorit: 'Biru',
  pendidikan: [
    { nama: 'SDN Patih Selera', periode: 'SD' },
    { nama: 'SMPN 2 Rantau Badauh', periode: 'SMP' },
    { nama: 'SMAN 1 Alalak', periode: 'SMA (Kelas 2 Semester 1)' },
    { nama: 'SMAN 1 Rantau Badauh', periode: 'SMA (Lulus)' },
    { nama: 'Politeknik Hasnur', periode: 'D4 Teknik Informatika (Semester 5)' },
  ],
  pengalaman: [
    {
      judul: 'Magang — Diskominfo Barito Kuala',
      periode: 'Sekarang',
      deskripsi:
        'Belajar jaringan dan infrastruktur IT di instansi pemerintah, eksplorasi Linux via virtual machine.',
    },
    {
      judul: 'Pengelola Budidaya Jamur Tiram Putih',
      periode: '5 Tahun',
      deskripsi:
        'Mengelola budidaya jamur tiram putih dengan omset ±3 juta/bulan. Juga mengelola hidroponik dan lahan padi.',
    },
  ],
  keahlian: [
    {
      nama: 'Flutter / Dart', ikon: 'fab fa-flutter', level: 85, kategori: 'Mobile Development',
      deskripsi: 'Membangun aplikasi multi-platform (Android & iOS) dari satu codebase. Dipakai untuk Panen Jamur dan Mycelia Smart Farming.',
      proyek: ['Panen Jamur', 'Mycelia Smart Farming'],
    },
    {
      nama: 'Firebase (Auth, Realtime DB)', ikon: 'fas fa-fire', level: 80, kategori: 'Backend & Database',
      deskripsi: 'Autentikasi, Realtime Database, dan Cloud Firestore untuk sinkronisasi data realtime tanpa backend custom.',
      proyek: ['Panen Jamur', 'Mycelia Smart Farming', 'Sistem Penyiraman Otomatis'],
    },
    {
      nama: 'IoT (ESP32, Sensor, Mqtt)', ikon: 'fas fa-microchip', level: 75, kategori: 'IoT & Hardware',
      deskripsi: 'Integrasi sensor suhu/kelembaban dengan ESP32, protokol MQTT, dan kontrol aktuator untuk budidaya jamur.',
      proyek: ['Mycelia Smart Farming', 'Sistem Penyiraman Otomatis'],
    },
    {
      nama: 'Node.js (Express)', ikon: 'fab fa-node-js', level: 70, kategori: 'Backend & Database',
      deskripsi: 'Backend web dengan Express — routing, REST API, dan template EJS. Website ini sendiri dibangun dengannya.',
      proyek: ['Website Profil Pribadi'],
    },
    {
      nama: 'Jaringan (Dasar)', ikon: 'fas fa-network-wired', level: 65, kategori: 'IoT & Hardware',
      deskripsi: 'Dasar-dasar jaringan komputer: TCP/IP, subnetting, dan topologi — dipelajari saat magang di Diskominfo.',
      proyek: [],
    },
    {
      nama: 'Linux (Dasar)', ikon: 'fab fa-linux', level: 60, kategori: 'IoT & Hardware',
      deskripsi: 'Navigasi terminal Linux, manajemen paket, dan konfigurasi dasar server — dipakai sehari-hari saat magang.',
      proyek: [],
    },
    {
      nama: 'MySQL / SQLite', ikon: 'fas fa-database', level: 60, kategori: 'Backend & Database',
      deskripsi: 'Perancangan dan kueri relasional untuk penyimpanan data terstruktur.',
      proyek: [],
    },
    {
      nama: 'UI/UX Design', ikon: 'fas fa-palette', level: 55, kategori: 'Design',
      deskripsi: 'Perancangan antarmuka mobile & web yang fungsional — wireframe, hierarki visual, dan alur pengguna.',
      proyek: ['Panen Jamur', 'Website Profil Pribadi'],
    },
  ],
  proyek: [
    {
      nama: 'Panen Jamur — Aplikasi Pencatatan & Notifikasi',
      deskripsi:
        'Aplikasi mobile untuk pencatatan hasil panen jamur, grafik tren, riwayat, serta pengingat kegiatan budidaya dengan notifikasi.',
      deskripsiPanjang:
        'Aplikasi Android yang dibangun untuk memudahkan pencatatan hasil panen jamur tiram secara digital. ' +
        'Setiap panen bisa dicatat lengkap dengan jumlah, berat, dan catatan kualitas. Data tersimpan di Firebase ' +
        'sehingga riwayat panen tampil sebagai grafik tren yang mudah dibaca — pemilik bisa melihat pola panen ' +
        'mingguan/bulanan dan mengambil keputusan budidaya berbasis data. Fitur notifikasi pengingat otomatis ' +
        'mengingatkan jadwal penanaman, penyiraman, dan panen agar tidak ada siklus yang terlewat.',
      fitur: [
        'Pencatatan hasil panen (jumlah, berat, catatan kualitas)',
        'Grafik tren panen mingguan & bulanan',
        'Riwayat panen lengkap dengan filter tanggal',
        'Notifikasi pengingat jadwal kegiatan budidaya',
        'Mode offline — data disinkronkan saat online',
      ],
      peran: 'Solo developer — desain, coding, dan uji coba di lahan budidaya sendiri',
      tahun: '2024',
      status: 'Rilis — tersedia untuk diunduh (APK)',
      tantangan: 'Menyederhanakan pencatatan manual petani menjadi alur digital tanpa mengubah kebiasaan kerja harian.',
      teknologi: ['Flutter', 'Firebase', 'Android'],
      link: '/downloads/panen-jamur.apk',
      download: true,
      ikon: 'fas fa-leaf',
      kategori: 'Mycelia',
    },
    {
      nama: 'Mycelia Smart Farming',
      deskripsi:
        'Tugas akhir berbasis IoT — monitoring suhu, kelembaban, dan penyiraman otomatis budidaya jamur tiram lewat aplikasi mobile.',
      deskripsiPanjang:
        'Tugas akhir D4 Teknik Informatika yang memadukan IoT dan aplikasi mobile untuk budidaya jamur tiram. ' +
        'Sensor suhu dan kelembaban terpasang di kumbung jamur, terhubung ke ESP32, lalu data dikirim realtime ' +
        'ke Firebase dan tampil di aplikasi Flutter. Sistem penyiraman otomatis aktif berdasarkan ambang kelembaban ' +
        'yang bisa diatur — saat tanah kering, pompa menyala otomatis; pengguna juga bisa mengambil alih kontrol manual. ' +
        'Proyek ini menjadi satu-satunya judul IoT di angkatannya (dari 7 tahun terakhir kampus) — bukti nyata ' +
        'perpaduan IT dengan pertanian yang menjadi fokus penelitiannya.',
      fitur: [
        'Monitoring suhu & kelembaban realtime (chart live)',
        'Penyiraman otomatis berbasis ambang kelembaban (bisa diatur)',
        'Kontrol manual pompa dari aplikasi',
        'Riwayat data sensor tersimpan di cloud',
        'Notifikasi perubahan kondisi ekstrem',
      ],
      peran: 'Solo developer & peneliti — perancangan sistem, firmware ESP32, aplikasi, dan pengujian di kumbung',
      tahun: '2025 — Sekarang',
      status: 'Tugas Akhir — dalam pengembangan',
      tantangan: 'Menjaga akurasi sensor di lingkungan kumbung yang lembab dan menghubungkan hardware ke UI mobile secara realtime.',
      teknologi: ['Flutter', 'Firebase', 'IoT', 'ESP32'],
      link: '#',
      ikon: 'fas fa-seedling',
      kategori: 'Mycelia',
    },
    {
      nama: 'Sistem Penyiraman Otomatis',
      deskripsi:
        'Kontrol penyiraman otomatis berbasis sensor kelembaban dengan mode manual & otomatis untuk lahan pertanian.',
      deskripsiPanjang:
        'Sistem penyiraman mandiri yang berdiri sendiri dari Mycelia Smart Farming — difokuskan untuk lahan pertanian ' +
        '(padi, hidroponik, dan sayuran). Sensor kelembaban tanah membaca kondisi media tanam, ESP32 memutuskan ' +
        'kapan pompa menyala berdasarkan ambang batas yang dikonfigurasi. Dua mode tersedia: otomatis (berbasis sensor) ' +
        'dan manual ( kontrol dari aplikasi/mobile). Status dan riwayat penyiraman tercatat di Firebase sehingga ' +
        'efisiensi penggunaan air bisa dievaluasi dari waktu ke waktu.',
      fitur: [
        'Mode otomatis berbasis ambang kelembaban tanah',
        'Mode manual dengan kontrol dari aplikasi',
        'Catatan riwayat penyiraman di Firebase',
        'Konfigurasi ambang batas fleksibel',
        'Hemat air — siram hanya saat tanah kering',
      ],
      peran: 'Solo developer — wiring sensor, firmware, dan integrasi mobile',
      tahun: '2024',
      status: 'Selesai — siap diuji di lahan',
      tantangan: 'Membuat sistem yang andal di lapangan (daya, koneksi, dan kegagalan sensor) tanpa pendampingan teknis.',
      teknologi: ['IoT', 'ESP32', 'Firebase'],
      link: '#',
      ikon: 'fas fa-faucet-drip',
      kategori: 'Mycelia',
    },
    {
      nama: 'Website Profil Pribadi',
      deskripsi:
        'Website fullstack ini sendiri — dibangun dengan Node.js, Express, dan EJS untuk portofolio pribadi.',
      deskripsiPanjang:
        'Portofolio pribadi fullstack yang sedang kamu lihat sekarang. Dibangun dengan Node.js + Express + EJS ' +
        'template engine, menampilkan profil, proyek, skill tree interaktif, playground (terminal + mini games), ' +
        'dan chatbot AJIM_AI. Desainnya bertema futuristic digital-lab dengan animasi Anime.js v4, efek parallax 3D, ' +
        'dark mode, dan responsive dari desktop sampai mobile. Deploy otomatis ke Vercel dari branch GitHub ' +
        'melalui CI/CD — setiap push langsung live.',
      fitur: [
        'One-page portfolio dengan scrollspy & animasi reveal',
        'Skill tree interaktif dengan detail panel',
        'Playground: terminal commands + mini games (Snake, Balon)',
        'Chatbot AJIM_AI berbasis Gemini API',
        'Dark mode + Reduced Motion (aksesibilitas)',
        'Deploy otomatis via Vercel dari GitHub',
      ],
      peran: 'Solo developer — arsitektur backend, frontend, animasi, dan DevOps',
      tahun: '2025 — Sekarang',
      status: 'Live — https://profil-saya-jade.vercel.app',
      tantangan: 'Menyeimbangkan animasi yang kaya dengan performa dan aksesibilitas (reduced motion).',
      teknologi: ['Node.js', 'Express', 'EJS'],
      link: '/',
      ikon: 'fas fa-globe',
      kategori: 'Web',
    },
  ],
  sosial: [
    { nama: 'GitHub', icon: 'fab fa-github', url: 'https://github.com/hidayat0714' },
    { nama: 'LinkedIn', icon: 'fab fa-linkedin-in', url: 'https://www.linkedin.com/in/muhamad-hidayat-1118b5338/' },
    { nama: 'Instagram', icon: 'fab fa-instagram', url: 'https://www.instagram.com/hidayat_0714/' },
    { nama: 'TikTok', icon: 'fab fa-tiktok', url: 'https://www.tiktok.com/@ajim0714' },
    { nama: 'WhatsApp', icon: 'fab fa-whatsapp', url: 'https://wa.me/6283844863295' },
    { nama: 'Email', icon: 'fas fa-envelope', url: 'mailto:garudalangit72@gmail.com' },
  ],
};

function bacaMessages() {
  if (!fs.existsSync(MESSAGES_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function simpanMessages(messages) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (e) {
    console.error('Gagal menulis pesan ke file (biasanya di lingkungan serverless):', e.message);
    throw e;
  }
}

function bacaMessagesAsync() {
  if (db) {
    return db.ref('kontak').once('value').then((snap) => {
      const val = snap.val();
      if (!val || typeof val !== 'object') return [];
      return Object.values(val);
    });
  }
  return Promise.resolve(bacaMessages());
}

async function simpanMessagesAsync(message) {
  if (db) {
    await db.ref('kontak').push(message);
    return;
  }
  const messages = bacaMessages();
  messages.push(message);
  simpanMessages(messages);
}

// --- Halaman (satu halaman one-page, semua rute render index) ---
app.get('/', (req, res) => {
  res.render('index', { halaman: 'Beranda', aktif: 'beranda', profil: profilData, pesan: null });
});

app.get('/tentang', (req, res) => {
  res.render('index', { halaman: 'Tentang', aktif: 'tentang', profil: profilData, pesan: null });
});

app.get('/keahlian', (req, res) => {
  res.render('index', { halaman: 'Keahlian', aktif: 'keahlian', profil: profilData, pesan: null });
});

app.get('/proyek', (req, res) => {
  res.render('index', { halaman: 'Proyek', aktif: 'proyek', profil: profilData, pesan: null });
});

app.get('/kontak', (req, res) => {
  res.render('index', {
    halaman: 'Kontak',
    aktif: 'kontak',
    profil: profilData,
    pesan: null,
  });
});

// --- API: kirim pesan dari form kontak ---
app.post('/kontak', async (req, res) => {
  const nama = (req.body.nama || '').trim();
  const email = (req.body.email || '').trim();
  const subjek = (req.body.subjek || '').trim();
  const isi = (req.body.isi || '').trim();

  if (!nama || !email || !isi) {
    return res.render('index', {
      halaman: 'Kontak',
      aktif: 'kontak',
      profil: profilData,
      pesan: { tipe: 'error', teks: 'Mohon isi nama, email, dan pesan terlebih dahulu.' },
    });
  }

  try {
    await simpanMessagesAsync({
      nama,
      email,
      subjek,
      isi,
      tanggal: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Gagal menyimpan pesan:', e.message);
    return res.render('index', {
      halaman: 'Kontak',
      aktif: 'kontak',
      profil: profilData,
      pesan: { tipe: 'error', teks: 'Maaf, pesan gagal terkirim. Silakan coba lagi.' },
    });
  }

  res.render('index', {
    halaman: 'Kontak',
    aktif: 'kontak',
    profil: profilData,
    pesan: { tipe: 'sukses', teks: 'Terima kasih! Pesan Anda telah terkirim.' },
  });
});

// --- API JSON ---
app.get('/api/profil', (req, res) => {
  res.json(profilData);
});

app.get('/api/pesan', (req, res) => {
  bacaMessagesAsync().then((messages) => res.json(messages));
});

// ============================================================
// AJIM_AI — chatbot berbasis Gemini API dengan pengetahuan
// portfolio. Tanpa API key → fallback aturan lokal (tetap bisa
// menjawab + memberi tombol aksi).
// ============================================================

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';

function bangunPengetahuan() {
  const p = profilData;
  const baris = [];
  baris.push(`NAMA: ${p.nama} (panggilan: ${p.namaPanggilan})`);
  baris.push(`ROLE: ${p.role}`);
  baris.push(`LOKASI: ${p.lokasi}`);
  baris.push(`EMAIL: ${p.email}`);
  baris.push(`RINGKASAN: ${p.ringkasan}`);
  baris.push('');
  baris.push('PROYEK:');
  p.proyek.forEach((pr, i) => {
    baris.push(`- [${i}] ${pr.nama} (${pr.kategori}, ${pr.tahun || '-'}) — ${pr.deskripsiPanjang || pr.deskripsi}`);
    if (pr.fitur) baris.push(`  Fitur: ${pr.fitur.join('; ')}`);
    if (pr.peran) baris.push(`  Peran: ${pr.peran}`);
    baris.push(`  Tech: ${pr.teknologi.join(', ')}`);
    if (pr.status) baris.push(`  Status: ${pr.status}`);
  });
  baris.push('');
  baris.push('KEAHLIAN:');
  p.keahlian.forEach((k) => {
    baris.push(`- ${k.nama} (level ${k.level}%, kategori ${k.kategori}) — ${k.deskripsi || ''}`);
    if (k.proyek && k.proyek.length) baris.push(`  Dipakai di: ${k.proyek.join(', ')}`);
  });
  baris.push('');
  baris.push('PENGALAMAN:');
  p.pengalaman.forEach((e) => baris.push(`- ${e.judul} (${e.periode}): ${e.deskripsi}`));
  baris.push('');
  baris.push('PENDIDIKAN:');
  p.pendidikan.forEach((s) => baris.push(`- ${s.nama} — ${s.periode}`));
  baris.push('');
  baris.push('KONTAK/SOSIAL:');
  p.sosial.forEach((s) => baris.push(`- ${s.nama}: ${s.url}`));
  return baris.join('\n');
}

const SISTEM_PROMPT = [
  'Kamu adalah AJIM_AI, asisten AI resmi di portofolio Muhamad Hidayat (panggilan Ajim).',
  'Kamu berada di dalam website portofolionya dan menjawab pertanyaan pengunjung soal dirinya, keahliannya, proyeknya, pengalaman, pendidikan, dan kontak.',
  'Jawab dengan bahasa Indonesia yang ramah, ringkas (maksimal ~120 kata), dan akurat HANYA dari data portofolio di bawah. Jangan mengarang.',
  'Jika ditanya hal di luar data portofolio, jawab dengan sopan bahwa info tersebut tidak ada di portofolio, lalu tawarkan info yang tersedia.',
  '',
  '=== DATA PORTOFOLIO ===',
  bangunPengetahuan(),
  '=== AKHIR DATA ===',
  '',
  'CARA MEMBERI TOMBOL AKSI (opsional, hanya bila relevan):',
  'Akhirkan jawaban dengan baris-baris aksi memakai format persis ini (satu aksi per baris, tanpa markdown):',
  'ACTION:openProject:<indeks 0-3>:<label pendek>',
  'ACTION:gotoSkill:<nama skill persis>:<label pendek>',
  'ACTION:gotoSection:<id section>:<label pendek>',
  'ACTION:openContact:<label pendek>',
  'Contoh baris akhir:',
  'ACTION:openProject:0:Lihat detail Panen Jamur',
  'ACTION:gotoSkill:Flutter / Dart:Skill Flutter',
  'ACTION:gotoSection:keahlian:Buka Skill Tree',
  'Aturan aksi:',
  '- SELALU akhiri jawaban dengan 1-3 baris ACTION bila pertanyaan menyentuh proyek, keahlian, pengalaman, pendidikan, profil, atau kontak.',
  '- id section yang valid: beranda, stations, profile, proyek, keahlian, playground, ajim-ai, kontak, panelExperience.',
  '- Untuk pertanyaan kontak, gunakan ACTION:openContact:Chat WhatsApp (atau sebutkan link langsung).',
  '- Jangan menaruh aksi di tengah kalimat — selalu di baris terpisah setelah jawaban teks.',
  '- Jangan pakai markdown (bold/bullet) di baris ACTION.',
].join('\n');

// Fallback lokal: aturan sederhana berbasis kata kunci + data portfolio.
function jawabanLokal(pesan) {
  const t = pesan.toLowerCase();
  const p = profilData;
  const aksi = [];
  let teks = null;

  const punya = (...kata) => kata.some((k) => t.includes(k));

  if (punya('halo', 'hai', 'hi', 'hello', 'pagi', 'siang', 'malam')) {
    teks = `Halo! Saya AJIM_AI, asisten portofolio ${p.namaPanggilan}. Mau tahu soal proyek, keahlian, atau pengalaman saya?`;
  } else if (punya('proyek', 'project', 'karya', 'aplikasi', 'buat')) {
    teks = `Ada 4 proyek unggulan: Panen Jamur (aplikasi pencatatan panen), Mycelia Smart Farming (IoT tugas akhir), Sistem Penyiraman Otomatis, dan website ini. Mau lihat yang mana?`;
    p.proyek.forEach((pr, i) => aksi.push(`openProject:${i}:Lihat ${pr.nama.split('—')[0].trim()}`));
  } else if (punya('keahlian', 'skill', 'skilltree', 'bisa apa', 'kemampuan', 'teknologi')) {
    teks = `Keahlian saya: Flutter (85%), Firebase (80%), IoT/ESP32 (75%), Node.js (70%), plus Jaringan, Linux, MySQL, dan UI/UX. Skill tree lengkapnya bisa dibuka:`;
    aksi.push('gotoSection:keahlian:Buka Skill Tree');
    aksi.push('gotoSkill:Flutter / Dart:Detail Flutter');
  } else if (punya('pengalaman', 'kerja', 'magang', 'intern', 'pengalaman kerja')) {
    teks = `Saya sedang magang di Diskominfo Barito Kuala (jaringan & infrastruktur IT) dan punya 5 tahun pengalaman mengelola budidaya jamur tiram (omset ±3 juta/bulan).`;
    aksi.push('gotoSection:panelExperience:Lihat Pengalaman');
  } else if (punya('pendidikan', 'sekolah', 'kampus', 'politeknik', 'study', 'kuliah')) {
    teks = `Saya mahasiswa D4 Teknik Informatika semester 5 di Politeknik Hasnur, sebelumnya SMA di Rantau Badauh.`;
    aksi.push('gotoSection:profile:Lihat Profile');
  } else if (punya('kontak', 'contact', 'hubungi', 'email', 'wa', 'whatsapp', 'chat')) {
    teks = `Bisa hubungi saya lewat WhatsApp, email, GitHub, atau LinkedIn — semua ada di section Kontak.`;
    aksi.push('openContact:Buka Kontak');
  } else if (punya('tentang', 'about', 'siapa', 'kenalan', 'profil', 'bio', 'diri')) {
    teks = `Saya ${p.nama} (${p.namaPanggilan}) — ${p.role}. ${p.ringkasan.split('.')[0]}.`;
    aksi.push('gotoSection:profile:Lihat Profile');
  } else if (punya('ai', 'bot', 'kamu siapa', 'siapa kamu')) {
    teks = `Saya AJIM_AI, chatbot portofolio ${p.namaPanggilan}. Saya bisa jelaskan proyek, keahlian, pengalaman, dan membantu menemukan info di website ini.`;
    aksi.push('gotoSection:ajim-ai:Tentang AI ini');
  } else if (punya('help', 'bantu', 'bisa apa', 'menu')) {
    teks = `Saya bisa bantu soal: proyek, keahlian, pengalaman, pendidikan, kontak, atau tentang Ajim. Coba klik salah satu di bawah:`;
    aksi.push('gotoSection:proyek:Proyek');
    aksi.push('gotoSection:keahlian:Keahlian');
    aksi.push('openContact:Kontak');
  } else {
    teks = `Maaf, saya belum paham pertanyaannya (mode offline). Coba tanya soal proyek, keahlian, pengalaman, pendidikan, atau kontak — atau tunggu AI online untuk jawaban lebih fleksibel.`;
    aksi.push('gotoSection:proyek:Lihat Proyek');
    aksi.push('gotoSection:keahlian:Lihat Keahlian');
  }

  return { teks, aksi };
}

async function tanyaGemini(pesan, riwayat) {
  const contents = [];
  // riwayat: [{role:'user'|'model', text}] — batasi 10 pesan terakhir
  (riwayat || []).slice(-10).forEach((m) => {
    if (!m || !m.text) return;
    contents.push({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: String(m.text) }] });
  });
  contents.push({ role: 'user', parts: [{ text: String(pesan) }] });

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SISTEM_PROMPT }] },
      contents,
      generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  const cand = data && data.candidates && data.candidates[0];
  const parts = cand && cand.content ? cand.content.parts : null;
  if (!parts) throw new Error('Gemini response kosong');
  const teks = parts.map((x) => x.text || '').join('').trim();
  if (!teks) throw new Error('Gemini teks kosong (finishReason=' + (cand.finishReason || '?') + ')');
  return teks;
}

function parseAksi(blok) {
  const aksi = [];
  const teks = [];
  String(blok || '').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^ACTION:(.+)$/);
    if (m) {
      const isi = m[1].trim();
      // openContact:<label> | openProject:<i>:<label> | gotoSkill:<nama>:<label> | gotoSection:<id>:<label>
      const c = isi.split(':');
      if (c[0] === 'openContact') {
        aksi.push({ tipe: 'openContact', label: c.slice(1).join(':') || 'Kontak' });
      } else if (c[0] === 'openProject') {
        let idx = parseInt(c[1], 10);
        const label = c.slice(2).join(':') || c.slice(1).join(':') || 'Lihat Proyek';
        if (isNaN(idx) || idx < 0 || idx >= profilData.proyek.length) {
          // index tidak valid — coba cocokkan dari label
          const low = label.toLowerCase();
          idx = profilData.proyek.findIndex((p) => low.includes(p.nama.split(/[—-]/)[0].trim().toLowerCase().split(' ')[0]));
          if (idx < 0) idx = 0;
        }
        aksi.push({ tipe: 'openProject', index: idx, label });
      } else if (c[0] === 'gotoSkill') {
        aksi.push({ tipe: 'gotoSkill', skill: c[1] || '', label: c.slice(2).join(':') || 'Lihat Skill' });
      } else if (c[0] === 'gotoSection') {
        aksi.push({ tipe: 'gotoSection', section: c[1] || '', label: c.slice(2).join(':') || 'Buka Section' });
      }
    } else {
      teks.push(line);
    }
  });
  return { teks: teks.join('\n').trim(), aksi };
}

app.post('/api/ai', async (req, res) => {
  const pesan = ((req.body && req.body.pesan) || '').trim().slice(0, 2000);
  const riwayat = (req.body && Array.isArray(req.body.riwayat)) ? req.body.riwayat : [];
  if (!pesan) return res.status(400).json({ error: 'pesan kosong' });

  // Tanpa key → fallback lokal (tetap berguna).
  if (!GEMINI_KEY) {
    const fb = jawabanLokal(pesan);
    return res.json({ teks: fb.teks, aksi: fb.aksi.map(parseAksiLine), mode: 'lokal' });
  }

  try {
    const mentah = await tanyaGemini(pesan, riwayat);
    const { teks, aksi } = parseAksi(mentah);
    if (!teks && !aksi.length) throw new Error('kosong setelah parse');
    return res.json({ teks, aksi, mode: 'gemini' });
  } catch (e) {
    console.error('AI error:', e.message);
    const fb = jawabanLokal(pesan);
    return res.json({
      teks: fb.teks,
      aksi: fb.aksi.map(parseAksiLine),
      mode: 'lokal',
      catatan: 'AI sedang tidak tersedia — jawaban lokal.',
    });
  }
});

// Status AI untuk UI (LED online/offline)
app.get('/api/ai/status', (req, res) => {
  res.json({ online: !!GEMINI_KEY, model: GEMINI_KEY ? GEMINI_MODEL : 'Local Rule-Based' });
});

function parseAksiLine(line) {
  const c = line.split(':');
  if (c[0] === 'openContact') return { tipe: 'openContact', label: c.slice(1).join(':') || 'Kontak' };
  if (c[0] === 'openProject') {
    let idx = parseInt(c[1], 10);
    const label = c.slice(2).join(':') || 'Lihat Proyek';
    if (isNaN(idx) || idx < 0 || idx >= profilData.proyek.length) {
      const low = (label + ' ' + (c[1] || '')).toLowerCase();
      idx = profilData.proyek.findIndex((p) => low.includes(p.nama.split(/[—-]/)[0].trim().toLowerCase().split(' ')[0]));
      if (idx < 0) idx = 0;
    }
    return { tipe: 'openProject', index: idx, label };
  }
  if (c[0] === 'gotoSkill') return { tipe: 'gotoSkill', skill: c[1] || '', label: c.slice(2).join(':') || 'Lihat Skill' };
  if (c[0] === 'gotoSection') return { tipe: 'gotoSection', section: c[1] || '', label: c.slice(2).join(':') || 'Buka Section' };
  return { tipe: 'gotoSection', section: 'beranda', label: line };
}

// --- 404 ---
app.use((req, res) => {
  res.status(404).render('404', { halaman: '404', aktif: '', profil: profilData });
});

// Di Vercel: export app sebagai default (module.exports).
// Saat lokal: panggil app.listen().
if (process.env.VERCEL === '1') {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Server profil berjalan di http://localhost:${PORT}`);
  });
}