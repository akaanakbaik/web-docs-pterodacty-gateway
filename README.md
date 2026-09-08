# Akadev Pterodactyl Gateway Docs

Website dokumentasi React/Vite dan proxy AI serverless untuk Pterodactyl Gateway.

**Status versi hasil audit 8 September 2026:** materi mengikuti source GitHub SDK v1.4.2, commit `ee1aa8225023a13c907cccd875d5b30596836dce`. Registry npm baru menyediakan v1.0.3; v1.4.2 belum tersedia melalui npm. Halaman Install menjelaskan build source terpin. Jangan menganggap kedua distribusi identik.

Situs tidak melakukan operasi panel dan tidak membutuhkan PTLA/PTLC di browser. Semua terminal di halaman merupakan simulasi yang diberi label jelas.

## Cakupan Halaman

| Path | Fokus |
|---|---|
| `/docs/overview` | Model SDK, CLI, wizard, mode koneksi, dan jalur belajar |
| `/docs/install` | Node.js, npm, self-check, dan doctor |
| `/docs/config` | Domain, PTLA, PTLC, profile, safe mode, dan retry |
| `/docs/cli-create-server` | CLI yang tersedia dan provisioning melalui SDK |
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

## Menjalankan lokal

```bash
npm ci
npm run dev
```

Web tersedia di port 5173. Untuk AI, isi `CUKI_API_KEY` pada environment shell privat lalu jalankan terminal kedua:

```bash
npm run dev:api
```

Vite meneruskan `/api` ke API lokal pada port 3001. `.env.example` mendokumentasikan nama variabel; script Node tidak otomatis membaca `.env.local`. Jangan memakai variabel `VITE_*` untuk key.

## AI

Frontend mengirim `{ question }` ke `POST /api/ai`. Backend memilih konteks dari dokumentasi terpercaya berdasarkan relevansi, bukan context bebas dari browser. Pertanyaan dibatasi 1.500 karakter; prompt keseluruhan maksimum 4.000 karakter sesuai batas Cuki yang diverifikasi langsung.

Urutan provider: Cuki DeepSeek ketika `CUKI_API_KEY` terkonfigurasi, kemudian Izuka Gemmy, kemudian Prexzy Mistral. Cuki memakai endpoint `https://api.cuki.biz.id/api/ai/deepseek` dengan parameter `apikey` dan `question`. Key hanya dibaca dari environment server. Timeout Cuki 20 detik; fallback masing-masing 8 detik; frontend 40 detik. Batas fungsi hosting 45 detik.

Respons sukses: HTTP 200, `{ ok: true, answer, provider }`. Jika semua provider gagal: HTTP 503, `{ ok: false, answer, provider: null }`, dengan arahan ke pencarian lokal. Input tidak valid menghasilkan 400/413, method selain POST 405, dan kapasitas instance penuh 429 dengan Retry-After.

Parser hanya menerima jawaban string, menolak HTML/error/object kosong, serta membatasi respons upstream 128 KB. Pola token panel/GitHub/Bearer disensor sebelum diteruskan. Penyensoran pola bukan jaminan untuk semua jenis rahasia: pengguna tetap harus memakai placeholder. Header no-store mencegah caching jawaban pribadi.

Batas delapan panggilan aktif berlaku **per instance**, bukan rate limit terdistribusi. Hosting tetap perlu firewall/rate limit global untuk perlindungan abuse lintas instance. Jawaban AI probabilistik; signature penting dicantumkan dalam prompt dan jawaban harus dibandingkan dengan referensi SDK.

## Fitur antarmuka

- 19 halaman, SPA navigation, history browser, title/description/canonical sesuai route.
- Search lokal dengan scoring judul, tag, path, isi, langkah, dan kode; Ctrl/Cmd+K; hasil mobile dan status kosong. Mengetik tidak mengubah history.
- Menu desktop/tablet/mobile, Escape untuk menutup menu, scroll lock, label kontrol, dan indikator halaman aktif.
- Copy dengan Clipboard API, fallback, dan status kegagalan; output terminal menggunakan data contoh asli tanpa status sukses buatan.
- AI assistant dengan batas input, timeout, suggestion berdasarkan halaman, auto-scroll, clear chat, rich text/code, dan Escape.
- Semua gambar memakai asset yang tersedia; tidak ada referensi `/manus-storage` yang hilang.

## Koreksi referensi SDK

- Preview/create smart memakai `ptero.smart.servers`, sedangkan `application.servers.create` menerima payload mentah.
- Schedule memakai `setName`, `setCron`, `addTask`, dan `save`.
- Raw path `/servers` sudah diberi prefix API oleh SDK.
- `resources()` mengembalikan envelope; state berada pada `attributes.current_state`.
- Backup email memakai `ptero.exportAndEmailBackup(serverId, targetEmail, smtpConfig)`.
- Pada source v1.4.2, preview/dryRun masih dapat membuat user bila `autoCreateUser` aktif. Gunakan user yang sudah ada dan `autoCreateUser: false` untuk operasi baca.
- Pada source v1.4.2, `application.servers.delete(id, true)` juga berarti **force delete**.
- CLI source mengiklankan `admin`, `ids`, dan `probe` tetapi dispatcher tidak mengimplementasikannya. Gunakan facade SDK untuk fungsi tersebut.

## Pengujian

```bash
npm run ci
```

Quality gate menjalankan typecheck, source/secret scan, regression AI dan HTTP melalui socket lokal, production build, metadata smoke, dan audit dependency. GitHub Actions mencakup Node.js 18/20/22/24. Source guard mencakup file tracked dan untracked yang tidak diabaikan Git; pola rahasia juga diperiksa pada Markdown, JSON, dan workflow.

Bukti pengujian, inventaris, serta batas cakupan ada di [AUDIT.md](AUDIT.md). Data panel mentah, API key, dan percakapan privat tidak disimpan sebagai artifact atau laporan.

## Hosting

Vercel: framework Vite, install `npm ci`, build `npm run build`, output `dist`. Set `CUKI_API_KEY` pada environment **Production**, kemudian redeploy. `/api/health` melaporkan urutan provider yang terkonfigurasi, bukan hasil probe ketersediaan upstream.

Header nosniff, frame denial, referrer policy, dan permissions policy dikonfigurasi di `vercel.json`. Perubahan environment baru berlaku pada deployment berikutnya.

## Sumber

- [Website](https://pterodacty-gateway.akadev.me/)
- [Source SDK](https://github.com/akaanakbaik/pterodactyl-gateway)
- [Package npm](https://www.npmjs.com/package/@akaanakbaik/pterodactyl-gateway)
- [Lisensi](LICENSE)
