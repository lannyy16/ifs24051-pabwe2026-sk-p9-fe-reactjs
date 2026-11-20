# ifs24051-pabwe2026-sk-p9-fe-reactjs

Frontend **Delcom Blog**: ReactJS (Vite) SPA multi-tier: Publik, Penulis, Admin.
Tailwind CSS v4 · Toast UI Editor · SweetAlert2 · Vitest. Port lokal **5174**.

## Menjalankan lokal

```bash
npm install
npm run dev        # http://localhost:5174  (proxy /api -> http://localhost:8081)
```

Untuk development lokal, kosongkan `VITE_API_BASE_URL` (buat `.env.local` berisi `VITE_API_BASE_URL=`).
Akun bawaan backend: `admin / admin` dan `member / member`.

## Menghubungkan ke backend

`.env.production` berisi `VITE_API_BASE_URL` (URL backend di Vercel, tanpa slash di akhir).
**Ganti** bila nama project Vercel backend Anda berbeda, lalu commit dan deploy ulang
(variabel dibaca saat `npm run build`).

## Pengujian (100% Statements / Branches / Functions / Lines)

```bash
npm test
```

## Rute

| Path | Tampilan | Akses |
|---|---|---|
| `/`, `/public`, `/posts` | Hero, pencarian, filter kategori, galeri artikel | Publik |
| `/posts/:slug` | Detail artikel (Markdown) | Publik |
| `/login`, `/register` | Form `login-username`, `login-password`, `login-submit` | Publik |
| `/dashboard` (alias `/author`) | Ruang kerja penulis | Login |
| `/posts/create` | Dashboard dengan form tambah artikel terbuka | Login |
| `/admin` | Panel admin | Admin |

## Performa & aksesibilitas

- CSS utama disisipkan ke `index.html` saat build (tanpa stylesheet yang memblokir render).
- Editor/viewer Markdown, SweetAlert2, dan dashboard dimuat malas (code-splitting).
- `vercel.json`: SPA rewrite + `Cache-Control: immutable` untuk `/assets/*`.
- Kontras WCAG AA di mode terang & gelap, landmark `main`/`header`/`footer`, satu `h1` per halaman,
  judul halaman dan meta description dinamis (`usePageMeta`), tautan navigasi berupa `<a href>`.
- `@toast-ui/editor` membundel DOMPurify lama; aplikasi memakai `dompurify` terbaru sebagai `customHTMLSanitizer`.

## CI/CD (Jenkins / Delcom)

`Jenkinsfile`: Checkout, Install (`npm ci`), Test (Vitest, threshold 100%), Build, Trivy, Package, Publish, Deploy.
Image Node memakai `node:22-bookworm-slim` (glibc) agar parser native Rollup berjalan benar.
