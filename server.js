const express = require('express');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { getDatabase } = require('firebase-admin/database');

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
  email: 'muhamad.hidayat@gmail.com',
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
    { nama: 'Flutter / Dart', level: 85 },
    { nama: 'Firebase (Auth, Realtime DB)', level: 80 },
    { nama: 'IoT (ESP32, Sensor, Mqtt)', level: 75 },
    { nama: 'Node.js (Express)', level: 70 },
    { nama: 'Jaringan (Dasar)', level: 65 },
    { nama: 'Linux (Dasar)', level: 60 },
    { nama: 'MySQL / SQLite', level: 60 },
    { nama: 'UI/UX Design', level: 55 },
  ],
  proyek: [
    {
      nama: 'Panen Jamur — Aplikasi Pencatatan & Notifikasi',
      deskripsi:
        'Aplikasi mobile untuk pencatatan hasil panen jamur, grafik tren, riwayat, serta pengingat kegiatan budidaya dengan notifikasi.',
      teknologi: ['Flutter', 'Firebase', 'Android'],
      link: '/downloads/panen-jamur.apk',
      download: true,
    },
    {
      nama: 'Mycelia Smart Farming',
      deskripsi:
        'Tugas akhir berbasis IoT — monitoring suhu, kelembaban, dan penyiraman otomatis budidaya jamur tiram lewat aplikasi mobile.',
      teknologi: ['Flutter', 'Firebase', 'IoT', 'ESP32'],
      link: '#',
    },
    {
      nama: 'Sistem Penyiraman Otomatis',
      deskripsi:
        'Kontrol penyiraman otomatis berbasis sensor kelembaban dengan mode manual & otomatis untuk lahan pertanian.',
      teknologi: ['IoT', 'ESP32', 'Firebase'],
      link: '#',
    },
    {
      nama: 'Website Profil Pribadi',
      deskripsi:
        'Website fullstack ini sendiri — dibangun dengan Node.js, Express, dan EJS untuk portofolio pribadi.',
      teknologi: ['Node.js', 'Express', 'EJS'],
      link: '/',
    },
  ],
  sosial: [
    { nama: 'GitHub', icon: 'fab fa-github', url: '#' },
    { nama: 'LinkedIn', icon: 'fab fa-linkedin-in', url: '#' },
    { nama: 'Instagram', icon: 'fab fa-instagram', url: '#' },
    { nama: 'Email', icon: 'fas fa-envelope', url: 'mailto:muhamad.hidayat@gmail.com' },
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