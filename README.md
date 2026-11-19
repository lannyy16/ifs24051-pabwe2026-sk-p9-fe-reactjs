# ifs24051-pabwe2026-sk-p9-fe-reactjs

Frontend **Delcom Blog** — ReactJS (Vite) SPA multi-tier: Publik · Penulis · Admin.
Tailwind CSS v4 · Toast UI Editor · SweetAlert2 · Vitest. Port **5174**.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5174  (proxy /api -> http://localhost:8081)
```

Backend: `ifs24051-pabwe2026-sk-p9-be-golang-gin` harus berjalan di port 8081.
Akun bawaan: `admin / admin` dan `member / member`.

## Pengujian (100% Statements / Branches / Functions / Lines)

```bash
npm test
```

## Build & deploy terpisah

```bash
npm run build      # hasil di dist/
```

Frontend memanggil backend lewat `VITE_API_BASE_URL` (lihat `.env.example`). Jika kosong dan domain
berakhiran `-fe-reactjs`, alamat backend diturunkan otomatis menjadi `-be-golang-gin` pada domain yang sama.
Backend harus sudah dideploy dan dapat diakses publik.

## Rute SPA

| Path | Tampilan | Akses |
|---|---|---|
| `/`, `/public` | Galeri artikel + pencarian + filter kategori | Publik |
| `/posts/:slug` | Detail artikel (Markdown) | Publik |
| `/login`, `/register` | Form `login-username`, `login-password`, `login-submit` | Publik |
| `/dashboard` | Ruang kerja penulis (statistik, tabel, kebab ⋮, toggle, AI Generator) | Login |
| `/posts/create` | Dashboard penulis dengan form tambah artikel terbuka | Login |
| `/posts` | Sama dengan beranda (daftar artikel) | Publik |
| `/admin` | Panel admin (pengguna & seluruh artikel) | Admin |

## Catatan keamanan

`@toast-ui/editor` membundel DOMPurify lama. Aplikasi ini menambahkan `dompurify` versi terbaru
sebagai dependensi langsung (+ `overrides`) dan memakainya sebagai `customHTMLSanitizer`
pada editor & viewer, sehingga `npm audit` / Trivy bersih.

## Performa & aksesibilitas

- Editor/viewer Markdown (Toast UI), SweetAlert2, dan dashboard dimuat malas (code-splitting) sehingga bundel awal ±76 KB gzip.
- Source map dibuat saat build, `robots.txt` dan meta description tersedia.
- Kontras warna memenuhi WCAG AA di mode terang & gelap (token `--accent-ink`), semua halaman memiliki `<main>` dan `<h1>`.
- Header cache untuk `/assets/*` (hash file sudah unik) perlu diatur di web server hosting, mis. `Cache-Control: public, max-age=31536000, immutable`.

## CI/CD

`Jenkinsfile`: Checkout → Install (`npm ci`) → Test (Vitest, threshold 100%) → Build (`vite build`)
→ Trivy → Package (source murni dari Git) → Publish → Deploy.
