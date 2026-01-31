# Landing Page Node Hosting

Project landing page dengan backend Node.js untuk monitoring server status.

## 📁 Struktur Project

```
Landing-Page-Node-Hosting/
├── README.md
├── .gitignore
├── package.json              ← Build tools (Tailwind CSS)
├── src/
│   └── input.css             ← Tailwind source
│
├── public/                   ← Upload ini ke public_html
│   ├── index.html
│   ├── favicon.ico
│   ├── robots.txt
│   └── assets/
│       └── css/
│           └── main.css      ← Hasil build Tailwind
│
└── backend/                  ← Deploy sebagai API server
    ├── .env.example
    ├── package.json
    └── index.js
```

## 🚀 Development

### 1. Setup Frontend (Tailwind CSS)

```bash
# Install dependencies di root
npm install

# Build CSS dari src/input.css ke public/assets/css/main.css
npm run build:css
```

### 2. Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Copy .env.example ke .env dan isi variabel
cp .env.example .env

# Development mode
npm run dev

# Production mode
npm start
```

## 📦 Deployment

### Deploy Frontend (Static Files)

1. Upload seluruh folder **`public/`** ke `public_html` di shared hosting
2. Struktur di server:
   ```
   public_html/
   ├── index.html
   ├── favicon.ico
   ├── robots.txt
   └── assets/
       └── css/
           └── main.css
   ```

### Deploy Backend (Node.js API)

1. Upload folder **`backend/`** ke server Node.js (bisa folder terpisah atau subdomain)
2. Di server, jalankan:
   ```bash
   cd backend
   npm install --production
   npm start
   ```
3. Pastikan `.env` sudah dikonfigurasi dengan benar

## 🔧 Environment Variables (.env di backend)

```env
PORT=3000
HT_API_SERVER=https://api.example.com
HT_API_KEY=your_api_key_here
HT_MONITOR_ID=your_monitor_id
```

## 📡 API Endpoints

- `GET /api/get-status` - Mengambil status server (uptime, response time, location)

## 🛠️ Tech Stack

**Frontend:**

- HTML5
- Tailwind CSS 4.x
- Vanilla JavaScript

**Backend:**

- Node.js
- Express 5.x
- Axios (untuk proxy API calls)
- dotenv (environment variables)
