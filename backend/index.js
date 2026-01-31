// Impor package
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // Memuat variabel dari file .env

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi Whitelist Domain
const allowedOrigins = process.env.WHITELIST_DOMAIN
  ? process.env.WHITELIST_DOMAIN // Memisahkan koma dan menghapus spasi
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Izinkan request dari server itu sendiri (tidak ada origin) atau local development
    if (!origin) {
      return callback(null, true);
    }

    // 2. Jika WHITELIST_DOMAIN kosong, izinkan semua (Development Mode/Public API)
    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }

    // 3. Cek apakah origin ada di whitelist
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Izinkan cookie/auth header jika perlu
};

// Gunakan CORS dengan opsi di atas
app.use(cors(corsOptions));

// Endpoint inilah yang akan dipanggil oleh frontend Anda
app.get('/api/get-status', async (req, res) => {
  try {
    // Ambil kunci API dari environment variable yang aman
    const apiServer = process.env.HT_API_SERVER;
    const apiKey = process.env.HT_API_KEY;
    const monitorId = process.env.HT_MONITOR_ID;

    // URL API pihak ketiga yang sebenarnya
    const apiUrl = apiServer + '/uptime-monitors';

    console.log('Meneruskan permintaan ke API pihak ketiga...');

    // Server Anda memanggil API pihak ketiga menggunakan Axios
    const response = await axios.get(apiUrl, {
      headers: {
        // Kunci API ditambahkan di sini, di sisi server
        Authorization: `Bearer ${apiKey}`,
      },
      params: {
        id: monitorId,
      },
    });

    // --- Filter dan Proses Data ---
    // Ambil objek monitor pertama dari array
    const monitor = response.data.monitors[0];

    // Cek jika data monitor dan lokasi ada
    if (monitor && monitor.locations) {
      // 1. Ambil nilai uptime dan lokasi server
      const uptime = monitor.uptime;
      const city = monitor.resolve_address_info?.City;
      const country = monitor.resolve_address_info?.Country;
      // Gabungkan kota dan negara, berikan nilai default jika tidak ada
      const serverLocation = city && country ? `${city}, ${country}` : 'Lokasi tidak diketahui';

      // 2. Kalkulasi response time
      const locations = Object.values(monitor.locations);
      const totalResponseTime = locations.reduce((sum, loc) => sum + loc.response_time, 0);

      // Hindari pembagian dengan nol jika tidak ada lokasi
      const averageResponseTime = locations.length > 0 ? totalResponseTime / locations.length : 0;

      // 3. Buat objek baru yang akan dikirim ke frontend
      const filteredData = {
        uptime: uptime,
        average_response_time: averageResponseTime,
        location: serverLocation, // TAMBAHAN: Lokasi server
      };

      // Kirim data yang sudah difilter kembali ke frontend
      res.json(filteredData);
    } else {
      // Kirim pesan error jika struktur data tidak sesuai
      res.status(404).json({ message: 'Data monitor atau lokasi tidak ditemukan.' });
    }
  } catch (error) {
    console.error('Error saat mengambil data dari API:', error);
    res.status(500).json({ message: 'Gagal mengambil data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
