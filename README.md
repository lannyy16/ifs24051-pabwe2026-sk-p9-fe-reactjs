# Delcom Blog - Frontend (ReactJS + Vite)

Praktikum PABWE 2026 P9 - Studi Kasus. Frontend SPA multi-tier (Publik, Penulis, Admin) yang mengonsumsi
backend `ifs24037-pabwe2026-sk-p9-be-golang-gin`.

## Menjalankan (development)

```bash
npm install
npm run dev          # http://localhost:5174, proxy /api -> http://localhost:8081
```

## Pengujian (Vitest, threshold coverage 100%)

```bash
npm test
```

## Build & Deploy (Vercel)

URL backend sudah diatur di `.env.production` (`VITE_API_BASE_URL`), sehingga `npm run build` langsung memakainya. Untuk mengganti, ubah file tersebut atau set env var di Vercel:

```bash
npm run build        # hasil di dist/
```

`vercel.json` sudah berisi rewrite SPA sehingga refresh di `/author`, `/admin`, `/posts/:slug` tidak 404.

## Rute

| Path | Akses | Keterangan |
| --- | --- | --- |
| `/` atau `/public` | Publik | Galeri artikel, pencarian, filter kategori |
| `/posts/:slug` | Publik | Detail artikel (Markdown) |
| `/login`, `/register` | Publik | Form dengan `#login-username`, `#login-password`, `#login-submit` |
| `/author` | Login | Workspace penulis (CRUD, toggle terbit, AI generator) |
| `/admin` | Admin | Monitoring pengguna dan artikel |
