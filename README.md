# Akadev Pterodactyl Gateway Docs Web

Website dokumentasi premium untuk `@akaanakbaik/pterodactyl-gateway`.

Dibuat dengan:

- Vite
- ReactJS
- TypeScript ESM
- Tailwind CSS
- Express API route
- AI assistant docs
- Local search
- Vercel free tier friendly

## Fitur

- Dokumentasi lengkap per bagian.
- Search lokal cepat tanpa database.
- AI assistant yang menjawab seputar Pterodactyl Gateway.
- API proxy `/api/ai` agar endpoint AI tidak dipanggil langsung dari logic UI yang berantakan.
- UI soft premium modern, tanpa gradient keras, responsif, dan mobile friendly.
- Parallax halus dengan Framer Motion.
- Code block dengan tombol copy.
- SEO metadata dasar untuk Google, AI search, dan social preview.

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Buka:

```txt
http://localhost:5173
```

## Build

```bash
npm run build
```

Preview hasil build:

```bash
npm run preview
```

## Deploy Vercel

Repo ini sudah punya `vercel.json`.

Pengaturan Vercel:

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

API assistant tersedia di:

```txt
/api/ai
```

Health check:

```txt
/api/health
```

## Struktur

```txt
api/ai.ts              Express serverless API untuk AI assistant
src/data/docs.ts       Konten dokumentasi terstruktur
src/data/ai.ts         System prompt lokal untuk AI docs
src/main.tsx           React app utama
src/styles.css         Tailwind + custom premium style
vercel.json            Routing Vercel
```

## AI Endpoint

Endpoint upstream yang dipakai:

```txt
https://xters.us.kg/api/ai/perplexity?query=...
```

Response yang didukung:

```json
{
  "answer": "..."
}
```

Jika upstream gagal, UI tetap bisa digunakan dengan search lokal.

## Catatan keamanan

- Jangan taruh API key panel di frontend.
- Website docs ini hanya membaca dokumentasi dan mengirim pertanyaan AI.
- Semua operasi Pterodactyl asli tetap harus dilakukan dari backend/CLI package utama.
- Jangan pernah menampilkan credential asli di prompt AI.

## Package utama

```bash
npm i @akaanakbaik/pterodactyl-gateway
```

GitHub package:

```txt
https://github.com/akaanakbaik/pterodactyl-gateway
```
