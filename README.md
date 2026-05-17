# Akadev Pterodactyl Gateway Docs Web

Website dokumentasi premium untuk package npm stabil [`@akaanakbaik/pterodactyl-gateway`](https://www.npmjs.com/package/@akaanakbaik/pterodactyl-gateway).

> URL produksi yang disiapkan: `https://pterodacty-gateway.akadev.me`

## Tujuan

Repo ini berisi web docs resmi untuk membantu user memahami Akadev Pterodactyl Gateway dengan cara yang lebih fokus, modern, dan mudah dicari.

Docs dibuat per halaman/path supaya user pemula bisa belajar satu topik tanpa bingung:

- `/docs/overview`
- `/docs/install`
- `/docs/config`
- `/docs/cli-create-server`
- `/docs/sdk`
- `/docs/integrations/telegram-bot`
- `/docs/integrations/whatsapp-bot`
- `/docs/integrations/discord-bot`
- `/docs/integrations/website-api`
- `/docs/security`
- `/docs/troubleshooting`
- `/privacy`
- `/terms`

## Stack

- Vite
- ReactJS
- TypeScript ESM
- Tailwind CSS
- Express API route
- Framer Motion
- Lucide Icons
- Vercel free tier friendly

## Fitur utama

- Dokumentasi lengkap per path/halaman.
- Search lokal cepat dengan auto navigasi ke hasil paling relevan.
- Floating AI assistant di kanan bawah layar.
- API proxy `/api/ai` yang hanya mengambil `data.response.answer` dari metadata upstream.
- Tutorial pemula dengan langkah step-by-step.
- Simulasi animasi penggunaan pada setiap tutorial.
- Contoh integrasi Telegram bot, WhatsApp bot, Discord bot, website/API, SDK, CLI, security, dan troubleshooting.
- Halaman Privacy Policy dan Terms and Conditions.
- UI soft premium profesional, tanpa gradient keras, responsif, mobile friendly, desktop friendly.
- Code block dengan tombol copy.
- SEO profesional: sitemap, robots, canonical, manifest, icon SVG, OpenGraph, Twitter Card, JSON-LD.
- Keyword SEO termasuk typo umum seperti `pterodacty gateway`, `pterodactyl gateway`, `pterodactyl SDK`, `bot panel`, dan `Pterodactyl CLI`.

## AI Assistant

Endpoint internal:

```txt
POST /api/ai
```

Endpoint upstream:

```txt
https://xters.us.kg/api/ai/perplexity?query=...
```

Format metadata upstream yang didukung:

```json
{
  "status": true,
  "message": "Success",
  "data": {
    "response": {
      "answer": "Jawaban AI..."
    }
  }
}
```

Website hanya menampilkan value:

```txt
data.response.answer
```

Metadata lain seperti `search_results`, `related_queries`, `id`, dan `message` tidak ditampilkan sebagai jawaban user.

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

Deploy manual:

```bash
npm i -g vercel
vercel --prod
```

Health check:

```txt
/api/health
```

## Struktur

```txt
api/ai.ts              Express serverless API untuk AI assistant
public/icon.svg        SVG icon web
public/robots.txt      SEO crawler rules
public/sitemap.xml     Sitemap halaman docs
public/site.webmanifest Web manifest
src/data/docs.ts       Konten docs, path, tutorial, simulasi, examples
src/data/ai.ts         System prompt lokal untuk AI docs
src/main.tsx           React app utama, routing SPA, search, AI popup
src/styles.css         Tailwind + custom premium style
vercel.json            Routing Vercel
```

## Catatan penggunaan

- User harus diarahkan memakai package npm karena versi npm adalah versi stabil.
- Source GitHub package utama tetap dipakai untuk kontribusi/development.
- Jangan taruh API key panel di frontend.
- Jangan kirim credential asli ke AI assistant.
- Semua operasi Pterodactyl asli tetap harus dilakukan lewat backend/CLI package utama.

## Package utama

Install package stabil:

```bash
npm i @akaanakbaik/pterodactyl-gateway
```

Install CLI global:

```bash
npm i -g @akaanakbaik/pterodactyl-gateway
```

Package GitHub:

```txt
https://github.com/akaanakbaik/pterodactyl-gateway
```

Package npm:

```txt
https://www.npmjs.com/package/@akaanakbaik/pterodactyl-gateway
```
