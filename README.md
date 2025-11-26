# 📡 AttendIoT - Sistem Absensi IoT Cerdas
### Otomatisasi Kehadiran, Pantau Secara Real-Time
**"Absen Tanpa Ribet, Data Akurat Seketika"**

![Status Proyek](https://img.shields.io/badge/status-active-success)
![Tech Stack](https://img.shields.io/badge/stack-MERN%20%2B%20IoT-blue)

## 📖 Cerita di Balik AttendIoT

Absensi manual (panggil nama satu per satu) itu ketinggalan zaman, memakan waktu, dan rentan kesalahan. Kertas absen bisa hilang, dan waktu belajar terbuang hanya untuk mendata kehadiran.

**Bagaimana jika absensi terjadi secara otomatis begitu mahasiswa melangkah masuk ke ruangan?**

AttendIoT menjembatani dunia Perangkat Keras (Hardware) dan Perangkat Lunak (Software). Menggunakan teknologi **ESP32** dan **BLE (Bluetooth Low Energy)**, sistem ini secara pasif mendeteksi perangkat mahasiswa (smartphone/smartwatch/tag), memproses data melalui **MQTT**, dan memperbarui Dashboard Web yang elegan secara **Real-Time**.

---

## 💡 Mengapa AttendIoT?

AttendIoT bukan sekadar database kehadiran biasa; ini adalah ekosistem yang hidup.

### 🎯 Konsep Inti
1.  **Deteksi Pasif:** Mahasiswa tidak perlu scan QR code atau tanda tangan. Perangkat mereka (MAC Address) adalah identitas mereka.
2.  **Komunikasi Real-Time:** ESP32 berbicara ke server via MQTT. Server berbicara ke Frontend via WebSockets. Tidak perlu refresh halaman.
3.  **Filter Cerdas:** Mencegah spam data ke database dengan menyaring deteksi duplikat dalam rentang waktu singkat.
4.  **Visualisasi Data:** Dashboard indah untuk melihat tingkat kehadiran, logika hadir vs tidak hadir, dan riwayat sesi.

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

### 🔌 Hardware (IoT)
*   **ESP32:** Otak dari scanner. Menangani koneksi Wi-Fi dan scanning BLE.
*   **BLE (Bluetooth Low Energy):** Digunakan untuk mendeteksi keberadaan melalui paket advertising perangkat.

### 🔙 Backend (API & Logika)
*   **Node.js & Express:** Arsitektur REST API.
*   **MongoDB (Mongoose):** Database NoSQL untuk penyimpanan data yang fleksibel.
*   **MQTT.js:** Protokol ringan untuk pengiriman pesan IoT.
*   **Socket.io:** Untuk mem-broadcast update real-time ke client.
*   **JWT:** Autentikasi yang aman.

### 🎨 Frontend (UI/UX)
*   **React 18 (Vite):** Framework SPA yang sangat cepat.
*   **Tailwind CSS:** Styling utility-first yang modern.
*   **shadcn/ui:** Komponen UI yang aksesibel dan berkualitas tinggi.
*   **Recharts:** Untuk grafik analitik data yang cantik.
*   **Framer Motion:** Untuk animasi UI yang halus.

---

## 🚀 Arsitektur Sistem (Cara Kerja)

1.  **SCAN:** **ESP32** memindai perangkat BLE di dalam ruangan setiap beberapa detik.
2.  **PUBLISH:** MAC Address yang terdeteksi dan RSSI (kekuatan sinyal) dikemas dalam JSON dan dikirim ke **MQTT Broker**.
3.  **PROCESS:** **Node.js Backend** menerima data (subscribe), mencocokkan MAC address dengan Mahasiswa terdaftar, dan mencatat kehadiran.
4.  **NOTIFY:** Backend memancarkan event `device-detected` melalui **Socket.io**.
5.  **DISPLAY:** **React Frontend** menerima event tersebut dan memperbarui Live Monitor seketika.

---

## 📦 Instalasi & Pengaturan

### Prasyarat
*   Node.js (v18+)
*   MongoDB (Lokal atau Atlas)
*   MQTT Broker (Mosquitto lokal atau Cloud Broker)
*   Arduino IDE (untuk ESP32)

### 1. Clone Repository
```bash
git clone <repository-url>
cd AttendIoT
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Buat file `.env` di dalam folder `backend`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=kunci_rahasia_anda
MQTT_BROKER=localhost
MQTT_PORT=1883
# Opsional: MQTT_USERNAME / MQTT_PASSWORD
```

Jalankan server:
```bash
npm run dev
# Server berjalan di http://localhost:5000
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

Buat file `.env` di dalam folder `frontend`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Jalankan client:
```bash
npm run dev
# Aplikasi berjalan di http://localhost:5173
```

### 4. Setup Hardware (ESP32)
1.  Buka `esp32/AttendIoT.ino` di Arduino IDE.
2.  Install library: `PubSubClient`, `ArduinoJson`, `BLEDevice`.
3.  Update baris konfigurasi di bagian atas file:
    ```cpp
    const char* ssid = "NAMA_WIFI_KAMU";
    const char* password = "PASSWORD_WIFI_KAMU";
    const char* mqtt_server = "ALAMAT_IP_PC_KAMU"; // Jangan pakai localhost
    ```
4.  Upload ke board ESP32 kamu.

---

## 🔌 Endpoint API

### Autentikasi
*   `POST /api/auth/register` - Daftar admin/user baru.
*   `POST /api/auth/login` - Masuk dan dapatkan JWT.

### Mahasiswa (Students)
*   `GET /api/students` - Lihat semua mahasiswa terdaftar.
*   `POST /api/students` - Daftarkan mahasiswa (petakan Nama ke MAC Address).

### Kehadiran (Attendance)
*   `GET /api/attendance` - Lihat riwayat kehadiran.
*   `GET /api/attendance/stats` - Lihat statistik dashboard.

---

## 🆘 Pemecahan Masalah (Troubleshooting)

**ESP32 Muncul titik-titik `......` terus menerus:**
*   Cek nama (SSID) dan password Wi-Fi di file `.ino`.
*   Pastikan kamu terhubung ke jaringan **2.4GHz** (ESP32 tidak support 5GHz).

**Frontend tidak menerima Data Live:**
*   Cek terminal backend, pastikan muncul `✓ Socket.io initialized` dan `✓ MQTT connected`.
*   Pastikan ESP32 dan PC kamu berada di **jaringan Wi-Fi yang sama**.
*   Cek firewall laptop kamu, pastikan port `1883` (MQTT) dan `5000` (Web) diizinkan.

**Error Koneksi MongoDB:**
*   Jika menggunakan MongoDB Atlas, pastikan **IP Address kamu sudah di-whitelist** di menu Network Access.

---

## 👥 Kontribusi
Kontribusi sangat diterima! Silakan fork repository ini dan ajukan pull request.

## 📄 Lisensi
Proyek ini dibuat untuk tujuan edukasi dan pembelajaran.
