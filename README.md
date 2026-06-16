# 🧺 LaundryKas — POS Laundry

POS berbasis web untuk usaha laundry. Stack: Next.js 14 + NextAuth + Prisma + PostgreSQL (Railway).

## 🚀 Setup Lokal

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment
```bash
cp .env.example .env
```

Edit `.env` dan isi:
- `DATABASE_URL` → dari Railway (lihat langkah deploy di bawah)
- `NEXTAUTH_SECRET` → generate dengan: `openssl rand -base64 32`
- `NEXTAUTH_URL` → `http://localhost:3000`

### 3. Push schema & seed database
```bash
npm run db:push
npm run db:seed
```

### 4. Jalankan
```bash
npm run dev
```

Buka http://localhost:3000

**Akun default:**
| Role  | Email                   | Password  |
|-------|-------------------------|-----------|
| Admin | admin@laundrykas.com    | admin123  |
| Kasir | kasir@laundrykas.com    | kasir123  |

---

## ☁️ Deploy ke Railway

### Langkah 1 — Buat proyek Railway
1. Buka https://railway.app dan login
2. Klik **"New Project"**
3. Pilih **"Deploy from GitHub repo"** → connect repo kamu

### Langkah 2 — Tambah PostgreSQL
1. Di dalam project, klik **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Tunggu database provisioned
3. Klik service PostgreSQL → tab **"Connect"**
4. Copy **"DATABASE_URL"** (format: `postgresql://...`)

### Langkah 3 — Set environment variables
Di service Next.js kamu, tab **"Variables"**, tambahkan:

```
DATABASE_URL        = postgresql://... (dari langkah 2)
NEXTAUTH_SECRET     = (hasil openssl rand -base64 32)
NEXTAUTH_URL        = https://nama-proyek.up.railway.app
NODE_ENV            = production
```

### Langkah 4 — Set build & start command
Di tab **"Settings"** service Next.js:
- **Build Command:** `npm install && npx prisma generate && npx prisma db push && node prisma/seed.js && npm run build`
- **Start Command:** `npm start`

### Langkah 5 — Deploy
Railway otomatis build & deploy setiap push ke main branch.

> ⚠️ Seed (`node prisma/seed.js`) hanya perlu dijalankan sekali.
> Setelah deploy pertama, ubah Build Command menjadi:
> `npm install && npx prisma generate && npx prisma db push && npm run build`

---

## 📁 Struktur Project

```
laundrykas/
├── prisma/
│   ├── schema.prisma       # Model database
│   └── seed.js             # Data awal
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/       # NextAuth handler
│   │   │   ├── orders/     # CRUD order
│   │   │   └── services/   # List layanan
│   │   ├── dashboard/      # Halaman dashboard
│   │   ├── orders/         # Status board + form
│   │   └── login/          # Halaman login
│   ├── components/
│   │   └── ui/Sidebar.tsx
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client
│   │   ├── auth.ts         # NextAuth config
│   │   └── utils.ts        # Helper format
│   └── types/
│       └── next-auth.d.ts
├── .env.example
└── package.json
```

## 🛣️ Roadmap Fase 2
- [ ] Cetak nota (thermal printer / PDF)
- [ ] Notif WhatsApp via Fonnte API
- [ ] Laporan harian & bulanan
- [ ] Manajemen layanan (tambah/edit/hapus)
- [ ] Multi-kasir dengan log aktivitas
