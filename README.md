# Akadev Pterodactyl Gateway Docs Web

[![Documentation CI](https://github.com/akaanakbaik/web-docs-pterodacty-gateway/actions/workflows/ci.yml/badge.svg)](https://github.com/akaanakbaik/web-docs-pterodacty-gateway/actions/workflows/ci.yml)

Website dokumentasi resmi untuk package npm [`@akaanakbaik/pterodactyl-gateway`](https://www.npmjs.com/package/@akaanakbaik/pterodactyl-gateway) **v1.4.2**. Situs ini berfokus pada jalur operasional yang dapat diverifikasi: install, konfigurasi, provisioning, server control, file dan backup, retry safety, safe mode, integrasi bot, backend API, troubleshooting, serta release quality gate.

> Situs dokumentasi yang disiapkan: [`https://pterodacty-gateway.akadev.me`](https://pterodacty-gateway.akadev.me)

## Status Kualitas

| Area | Status |
|---|---|
| SDK reference | Selaras dengan `@akaanakbaik/pterodactyl-gateway@1.4.2` |
| Node.js | 18.x, 20.x, dan 22.x |
| TypeScript | Strict typecheck untuk frontend, config Node, dan `api/ai.ts` |
| Build | Vite production build tervalidasi |
| Source guard | Menolak komentar kode dan pola credential pada file ter-track |
| Site smoke | Memeriksa metadata build, icon, manifest, canonical, dan stale version marker |
| Dependency audit | Quality gate gagal pada high severity; temuan low tetap dilaporkan untuk pemantauan |
| AI assistant | Input limit, timeout upstream, fallback, sanitasi, dan prompt versi v1.4.2 |

Dokumentasi situs adalah lapisan frontend dan serverless AI proxy. Semua operasi Pterodactyl asli tetap dilakukan oleh backend atau CLI package utama. Situs ini tidak menyimpan atau meminta credential panel.

## Cakupan Halaman

| Path | Fokus |
|---|---|
| `/docs/overview` | Model SDK, CLI, wizard, mode koneksi, dan jalur belajar |
| `/docs/install` | Node.js, npm, self-check, dan doctor |
| `/docs/config` | Domain, PTLA, PTLC, profile, safe mode, dan retry |
| `/docs/cli-create-server` | IDs, dry-run, create user/server, probe, dan cleanup |
| `/docs/sdk` | `createPtero`, preview, create, handle, error, dan typed response |
| `/docs/http-safety` | Retry safe method, `retryUnsafe`, `Retry-After`, backoff, dan idempotency |
| `/docs/api-surface` | Application API, Client API, generic types, resolver, dan pagination |
| `/docs/server-operations` | Resources, power, command, startup, dan schedule |
| `/docs/files-backups` | File manager, download, HTML fallback, backup, dan WebSocket Node.js |
| `/docs/integrations/telegram-bot` | Identity, payment gate, dry-run, create, dan audit |
| `/docs/integrations/whatsapp-bot` | Order, payment callback, idempotency, dan delivery private |
| `/docs/integrations/discord-bot` | Slash command, role check, ephemeral reply, dan error handling |
| `/docs/integrations/website-api` | Backend preview/create, auth, payment, rate limit, dan idempotency |
| `/docs/security` | Secret handling, safe mode, destructive confirmation, dan audit |
| `/docs/email` | SMTP eksplisit, backup email, recipient guard, dan retention |
| `/docs/release` | Local CI, GitHub Actions, package, audit, dan release checklist |
| `/docs/troubleshooting` | Error domain, key, image, allocation, file, retry, dan safe mode |
| `/privacy` | Pemrosesan search lokal dan AI assistant |
| `/terms` | Syarat penggunaan dan tanggung jawab operator |

## Fitur Situs

Situs memakai navigasi per halaman, search lokal dengan scoring berdasarkan judul, path, tag, isi, command, dan contoh kode, serta perpindahan route tanpa full page reload. Sidebar desktop berubah menjadi menu drawer pada mobile dan menyediakan escape route ke halaman lain.

Hero menggunakan ilustrasi system map dan identitas grafis khusus. Code block, terminal simulation, status chip, path label, dan callout memakai material berbeda agar pembaca dapat membedakan instruksi, output, dan warning. Tombol copy memiliki fallback ketika Clipboard API tidak tersedia. Focus ring, label input, `aria-live`, dialog label, serta `prefers-reduced-motion` disiapkan untuk aksesibilitas dasar.

AI assistant memakai endpoint internal `POST /api/ai`. Frontend hanya mengirim pertanyaan dan knowledge base dokumentasi. Endpoint memvalidasi pertanyaan maksimum 1.500 karakter, membatasi context maksimum 32.000 karakter, memakai timeout upstream, memilih jawaban dari struktur response yang aman, dan mengembalikan fallback generik ketika provider tidak tersedia.

## Selaras dengan SDK v1.4.2

Materi situs mengikuti perubahan utama pada SDK utama:

| Perubahan SDK | Perlakuan di dokumentasi |
|---|---|
| Retry hanya untuk method aman secara default | Dijelaskan pada halaman HTTP safety, termasuk `retryUnsafe` untuk POST yang benar-benar idempotent |
| Safe mode meminta konfirmasi delete | Contoh memakai boolean confirmation untuk user, server, dan allocation |
| Resolver Nest/Egg tidak fallback diam-diam | Docs mengarahkan pencarian berdasarkan nama atau default eksplisit |
| Pagination membaca seluruh halaman sampai batas aman | Dijelaskan bersama `PteroPagination`, `PteroCollection`, dan resolver |
| Download file menggunakan endpoint yang benar | Diberi contoh `server.files.download()` dan guard HTML fallback |
| WebSocket Node.js memakai Origin dan menunggu open | Dijelaskan pada file, backup, dan WebSocket |
| `changeNestEgg` memiliki image dan skip scripts | Dicakup pada API reference dan provisioning guidance |
| SMTP wajib eksplisit | Halaman email menjelaskan host, port, username, password, recipient guard, dan retention |
| API `updateInventory()` tidak digunakan | Docs hanya memakai facade yang tersedia pada v1.4.2 |
| Generic response types tersedia | Contoh memakai `PteroResource`, `PteroCollection`, dan `PteroPagination` |

## Stack

Project ini menggunakan Vite, React 18, TypeScript ESM, Tailwind CSS 3, Express serverless route, Framer Motion, dan Lucide Icons. Hosting Vercel tetap didukung melalui `vercel.json`, sedangkan workflow CI berjalan pada Node.js 18, 20, dan 22.

## Instalasi Lokal

```bash
npm ci
npm run dev
```

Buka `http://localhost:5173` pada browser.

## Quality Gate Lokal

Jalankan pemeriksaan yang sama dengan workflow CI:

```bash
npm run check
npm run build
npm run test:site
npm audit --audit-level=high
```

Atau jalankan semuanya sekaligus:

```bash
npm run ci
```

`npm run check` menjalankan root TypeScript project references, typecheck `api/ai.ts`, dan `scripts/source-guard.mjs`. Source guard memindai file code yang ter-track dan menolak code comment serta pola PTLA, PTLC, GitHub token, atau credential sejenis. Contoh credential pada materi docs menggunakan placeholder yang pendek atau bentuk yang tidak menyerupai token nyata.

`npm run build` menghasilkan bundle production pada `dist`. `npm run test:site` memeriksa marker metadata yang harus ada pada `dist/index.html` dan menolak marker versi lama. Smoke test tidak memanggil provider AI dan dapat berjalan deterministik di CI.

## GitHub Actions

`Documentation CI` berjalan pada push ke `main`, pull request menuju `main`, dan manual dispatch. Workflow memakai concurrency cancellation, timeout, npm lockfile cache, permission read-only, matrix Node.js 18/20/22, quality gate, production build, dan artifact retention tujuh hari.

`Documentation Release Check` berjalan pada pull request, tag `v*` atau `docs-v*`, dan manual dispatch. Workflow memakai quality gate yang sama serta artifact release candidate dengan retention empat belas hari.

Workflow AI auto-fix lama tidak digunakan. Perubahan ini disengaja agar tidak ada command atau file yang dieksekusi berdasarkan output provider eksternal dan agar seluruh perbaikan tetap melalui review diff serta quality gate deterministik.

## Deploy Vercel

Repo ini memiliki `vercel.json` dengan framework Vite, build command `npm run build`, output directory `dist`, dan install command `npm install`. Route SPA diarahkan ke `index.html`; route `/api/ai` tetap tersedia sebagai serverless function sesuai konfigurasi platform.

Pengaturan yang disarankan:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
```

Endpoint health tersedia pada:

```text
GET /api/health
```

Jika provider fallback AI digunakan, set `KITSU_API_KEY` hanya melalui environment secret hosting. Jangan menaruh key pada `VITE_*`, source frontend, `README.md`, atau workflow log.

## Struktur Repositori

```text
api/ai.ts                    Serverless AI endpoint, validation, timeout, fallback
src/data/docs.ts             Knowledge base v1.4.2 dan route content
src/data/ai.ts               System prompt lokal assistant
src/main.tsx                 Router SPA, search, docs UI, terminal, assistant
src/styles.css               Material, theme, responsive, motion, focus ring
public/icon.svg              Favicon dan icon deployment
public/robots.txt            Crawler rules
public/sitemap.xml           Sitemap halaman docs
public/site.webmanifest      Web manifest
scripts/source-guard.mjs     Guard comment dan credential pattern
scripts/site-smoke.mjs       Smoke test output build dan metadata
.github/workflows/ci.yml     Matrix validation dan artifact build
.github/workflows/release-check.yml
                             Release candidate validation
vercel.json                  SPA, API route, dan domain redirect
```

## Catatan Keamanan

Jangan memasukkan PTLA, PTLC, token GitHub, password panel, token bot, SMTP password, atau data user ke source, issue, AI assistant, screenshot, log, maupun artifact. Setelah pengujian panel nyata, cabut atau rotasi seluruh key testing. Gunakan backend untuk seluruh operasi Pterodactyl dan terapkan authentication, authorization, rate limit, payment gate, idempotency, audit log, serta redaction.

## Package Utama

```bash
npm i @akaanakbaik/pterodactyl-gateway@1.4.2
npm i -g @akaanakbaik/pterodactyl-gateway@1.4.2
```

| Resource | URL |
|---|---|
| SDK GitHub | https://github.com/akaanakbaik/pterodactyl-gateway |
| SDK npm | https://www.npmjs.com/package/@akaanakbaik/pterodactyl-gateway |
| Docs source | https://github.com/akaanakbaik/web-docs-pterodacty-gateway |
| Docs production | https://pterodacty-gateway.akadev.me |

## Lisensi

Lisensi project mengikuti file [`LICENSE`](./LICENSE).
