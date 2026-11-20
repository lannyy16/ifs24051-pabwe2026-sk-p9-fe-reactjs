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

Bila frontend dideploy terpisah dari backend, isi `VITE_API_BASE_URL` (lihat `.env.example`)
dengan URL backend, tanpa `/api` di akhir.

## Rute SPA

| Path | Tampilan | Akses |
|---|---|---|
| `/`, `/public` | Galeri artikel + pencarian + filter kategori | Publik |
| `/posts/:slug` | Detail artikel (Markdown) | Publik |
| `/login`, `/register` | Form `login-username`, `login-password`, `login-submit` | Publik |
| `/author` | Ruang kerja penulis (statistik, tabel, kebab ⋮, toggle, AI Generator) | Login |
| `/admin` | Panel admin (pengguna & seluruh artikel) | Admin |

## Catatan keamanan

`@toast-ui/editor` membundel DOMPurify lama. Aplikasi ini menambahkan `dompurify` versi terbaru
sebagai dependensi langsung (+ `overrides`) dan memakainya sebagai `customHTMLSanitizer`
pada editor & viewer, sehingga `npm audit` / Trivy bersih.

## CI/CD

`Jenkinsfile`: Checkout → Install (`npm ci`) → Test (Vitest, threshold 100%) → Build (`vite build`)
→ Trivy → Package (source murni dari Git) → Publish → Deploy.
