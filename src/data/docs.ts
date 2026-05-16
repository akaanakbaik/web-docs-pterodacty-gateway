export type DocSection = {
  id: string;
  group: string;
  title: string;
  summary: string;
  body: string[];
  code?: string;
  tags: string[];
};

export const docs: DocSection[] = [
  {
    id: "overview",
    group: "Start",
    title: "Apa itu Akadev Pterodactyl Gateway",
    summary: "SDK TypeScript dan CLI modern untuk mengelola Pterodactyl Panel dari bot, dashboard, backend, dan terminal.",
    body: [
      "Akadev Pterodactyl Gateway membantu aplikasi Node.js berkomunikasi dengan Pterodactyl Panel melalui Application API dan Client API.",
      "Package ini cocok untuk toko panel, bot WhatsApp, bot Telegram, bot Discord, dashboard admin, backend API, dan workflow automation yang butuh create user, create server, kontrol server, file manager, backups, schedules, dan diagnostics.",
      "Fokus utamanya adalah cepat dipakai, aman secara default, tetap fleksibel untuk pengguna expert, dan mudah dites dengan dry-run sebelum eksekusi asli."
    ],
    code: "npm i @akaanakbaik/pterodactyl-gateway\n# atau global CLI\nnpm i -g @akaanakbaik/pterodactyl-gateway",
    tags: ["overview", "sdk", "cli", "pterodactyl"]
  },
  {
    id: "install",
    group: "Start",
    title: "Install dan Quick Start",
    summary: "Cara install dependency, CLI global, dan cek koneksi panel.",
    body: [
      "Gunakan Node.js 18 atau lebih baru. Untuk project TypeScript/Node modern, package ini memakai ESM.",
      "CLI global berguna untuk admin VPS, debug panel, cek ID node/nest/egg, dan smoke test koneksi.",
      "Setelah install, jalankan doctor untuk memastikan domain, PTLA, dan PTLC valid."
    ],
    code: "npm i @akaanakbaik/pterodactyl-gateway\nnpm i -g @akaanakbaik/pterodactyl-gateway\n\nptero-gateway version\nptero-gateway self-check\nptero-gateway doctor",
    tags: ["install", "quickstart", "doctor", "npm"]
  },
  {
    id: "env-config",
    group: "Configuration",
    title: "Environment dan Config Profile",
    summary: "PTERO_DOMAIN, PTLA, PTLC, dan config profile lokal untuk CLI.",
    body: [
      "PTERO_DOMAIN adalah URL panel Pterodactyl. PTLA dipakai untuk Application API seperti user, server, suspend, limits, dan create. PTLC dipakai untuk Client API seperti resources, files, startup variables, backups, schedules, dan power.",
      "Untuk server production, simpan credential di environment variable. Untuk VPS pribadi, config profile memudahkan CLI tanpa export ulang.",
      "Config disimpan di ~/.pterodactyl-gateway/config.json dan CLI otomatis memakai active profile jika env belum tersedia."
    ],
    code: "PTERO_DOMAIN=https://panel.example.com\nPTERO_PTLA=ptla_xxxxxxxxx\nPTERO_PTLC=ptlc_xxxxxxxxx\n\nptero-gateway config init --profile main --domain https://panel.example.com --ptla ptla_xxx --ptlc ptlc_xxx\nptero-gateway config list\nptero-gateway config doctor",
    tags: ["env", "config", "ptla", "ptlc", "profile"]
  },
  {
    id: "cli",
    group: "CLI",
    title: "CLI Command Utama",
    summary: "Command penting untuk health check, IDs, admin list, server control, files, backups, dan schedules.",
    body: [
      "CLI dirancang untuk workflow admin yang jelas dan eksplisit. Aksi tulis biasanya perlu --yes agar tidak salah jalan.",
      "Command node, location, dan allocation management tidak dibuka di CLI stabil agar permukaan risiko tetap kecil.",
      "Gunakan ids --nest untuk melihat node, nest, dan egg yang tersedia sebelum membuat server."
    ],
    code: "ptero-gateway help\nptero-gateway ids --nest 5\nptero-gateway admin users\nptero-gateway admin servers\nptero-gateway servers\nptero-gateway probe <identifier>\nptero-gateway server <identifier> summary",
    tags: ["cli", "admin", "server", "ids", "probe"]
  },
  {
    id: "presets-templates",
    group: "Create Server",
    title: "Preset dan Template",
    summary: "Preset resource dan template siap pakai untuk bot/API/website.",
    body: [
      "Preset membantu membuat paket produk konsisten: mini, basic, standard, premium, dan unlimited.",
      "Template membantu menghasilkan command create-server yang lebih cepat untuk nodejs-bot, nodejs-api, wa-bot, python-bot, dan blank.",
      "Preset tetap bisa dioverride dengan --memory, --disk, --cpu, --databases, --allocations, dan --backups."
    ],
    code: "ptero-gateway presets\nptero-gateway templates list\nptero-gateway templates show nodejs-bot\nptero-gateway templates command nodejs-bot --name \"bot saya\" --email user@example.com --node 1 --nest 5 --egg 18",
    tags: ["preset", "template", "package", "pricing"]
  },
  {
    id: "sdk-basic",
    group: "SDK",
    title: "SDK Basic Usage",
    summary: "Membuat instance gateway, connect, doctor, user, server, dan client server handle.",
    body: [
      "SDK dapat dipakai langsung dari backend Node.js, Express, Fastify, Next API, bot worker, atau CLI internal.",
      "createPtero.fromEnv() membaca environment variable standar. createPtero({ ... }) cocok untuk multi-tenant atau config dari database.",
      "Gunakan previewCreate atau dryRun sebelum create server asli agar payload bisa diperiksa dulu."
    ],
    code: "import { createPtero } from '@akaanakbaik/pterodactyl-gateway';\n\nconst ptero = createPtero.fromEnv();\nawait ptero.connect();\n\nconst preview = await ptero.servers.previewCreate(input);\nconst server = await ptero.servers.createSmart(input);\nconst handle = ptero.server(server.identifier!);\nawait handle.resources();",
    tags: ["sdk", "typescript", "createPtero", "dry-run"]
  },
  {
    id: "integration-helper",
    group: "Integration",
    title: "Integration Helper",
    summary: "Helper untuk membuat server WhatsApp bot, Telegram bot, Discord bot, API, website, Python bot, dan blank server.",
    body: [
      "createIntegrationService membuat flow create server lebih pendek dan konsisten. Default nodeId, nestId, eggId, preset, dan autoCreateUser bisa disimpan sekali.",
      "Kind yang tersedia: whatsapp-bot, telegram-bot, discord-bot, nodejs-api, website, python-bot, dan blank.",
      "Helper ini tetap memakai createSmart di bawahnya, sehingga auto docker, auto startup, environment, dan dry-run tetap bekerja."
    ],
    code: "import { createIntegrationService } from '@akaanakbaik/pterodactyl-gateway';\n\nconst service = createIntegrationService({\n  domain: process.env.PTERO_DOMAIN,\n  ptla: process.env.PTERO_PTLA,\n  ptlc: process.env.PTERO_PTLC\n}, { nodeId: 1, nestId: 5, eggId: 18, preset: 'standard', autoCreateUser: true });\n\nawait service.dryRun({ kind: 'whatsapp-bot', name: 'WA Bot', email: 'user@example.com', username: 'user_wa', password: 'auto' });",
    tags: ["integration", "helper", "whatsapp", "telegram", "discord"]
  },
  {
    id: "whatsapp-bot",
    group: "Integration",
    title: "Integrasi Bot WhatsApp",
    summary: "Flow aman untuk toko panel atau automation WhatsApp bot.",
    body: [
      "Untuk bot WhatsApp/Baileys, gunakan kind whatsapp-bot dan preset standard. Simpan session di volume server, bukan memory sementara.",
      "Order harus divalidasi dulu: status pembayaran, user ID, email, username, dan paket. Hindari create server langsung dari pesan publik tanpa guard admin/payment.",
      "Kirim credential lewat private message dan simpan audit log ke database."
    ],
    code: "const result = await service.create({\n  kind: 'whatsapp-bot',\n  name: `wa-${order.username}`,\n  email: order.email,\n  username: order.username,\n  password: 'auto',\n  environment: { OWNER_NUMBER: order.phone, BOT_NAME: order.botName }\n});",
    tags: ["whatsapp", "baileys", "bot", "order"]
  },
  {
    id: "telegram-discord",
    group: "Integration",
    title: "Integrasi Telegram dan Discord",
    summary: "Pattern untuk grammy, Telegraf, discord.js, dan bot store panel.",
    body: [
      "Untuk Telegram, gunakan Telegram user ID sebagai identifier utama karena username bisa berubah. Untuk Discord, gunakan user ID dan ephemeral reply untuk data sensitif.",
      "Batasi command create panel hanya untuk admin, role tertentu, atau user yang sudah membayar.",
      "Tambahkan rate limit dan idempotency key agar satu order tidak membuat server dobel."
    ],
    code: "await service.create({ kind: 'telegram-bot', name: `tg-${ctx.from.id}`, email: `${ctx.from.id}@telegram.local`, username: `tg_${ctx.from.id}`, password: 'auto' });\n\nawait service.create({ kind: 'discord-bot', name: `dc-${user.id}`, email: `${user.id}@discord.local`, username: `dc_${user.id}`, password: 'auto' });",
    tags: ["telegram", "discord", "grammy", "discordjs"]
  },
  {
    id: "website-api",
    group: "Integration",
    title: "Integrasi Website dan REST API",
    summary: "Backend Express/Fastify/Next API untuk preview dan create panel.",
    body: [
      "Frontend tidak boleh memegang PTLA/PTLC. Semua create server harus lewat backend yang punya auth, payment check, dan audit log.",
      "Buat endpoint preview untuk dry-run dan endpoint create untuk eksekusi asli. Validasi email, username, paket, dan order ID.",
      "Gunakan queue untuk order massal agar tidak race condition."
    ],
    code: "app.post('/api/panel/preview', async (req, res) => {\n  const preview = await service.dryRun({ kind: 'website', name: req.body.name, email: req.body.email, username: req.body.username, password: 'auto' });\n  res.json(preview);\n});",
    tags: ["express", "website", "api", "backend"]
  },
  {
    id: "security",
    group: "Production",
    title: "Keamanan dan Guard",
    summary: "Default aman, tidak terlalu ketat, dan tetap bisa dioverride oleh developer expert.",
    body: [
      "Jangan hardcode API key, token bot, password, atau config profile di source. Gunakan env atau secret manager.",
      "Safe mode default aktif untuk memblokir pola command destructive. Expert masih bisa memakai allowDangerous atau safeMode false jika paham risiko.",
      "CLI tidak membuka command node/location/allocation management agar fitur sensitif tetap berada di panel admin."
    ],
    code: "const ptero = createPtero({ domain, ptla, ptlc, safeMode: true });\nawait ptero.server(identifier).command('npm start');\n// expert only:\nawait ptero.server(identifier).command('custom command', { allowDangerous: true });",
    tags: ["security", "safeMode", "guard", "production"]
  },
  {
    id: "troubleshooting",
    group: "Production",
    title: "Troubleshooting",
    summary: "Solusi error umum: DOMAIN_REQUIRED, Docker image, allocation, backup, startup variable, dan binary global.",
    body: [
      "DOMAIN_REQUIRED berarti domain panel belum diisi via env atau config profile. Jalankan config init atau export PTERO_DOMAIN.",
      "DOCKER_IMAGE_NOT_FOUND berarti egg tidak punya docker image yang bisa dipilih otomatis. Isi Docker Images di panel atau gunakan --docker-image.",
      "NO_FREE_ALLOCATION berarti node tidak memiliki allocation kosong. Tambahkan allocation dari panel admin node.",
      "Backup gagal sering terjadi karena limit backups masih 0 atau Wings/storage bermasalah."
    ],
    code: "ptero-gateway explain DOMAIN_REQUIRED\nptero-gateway explain DOCKER_IMAGE_NOT_FOUND\nptero-gateway doctor\nptero-gateway probe <identifier>",
    tags: ["error", "troubleshooting", "doctor", "explain"]
  },
  {
    id: "deployment",
    group: "Production",
    title: "Deployment dan Release",
    summary: "Checklist npm package, GitHub tag, CI, Vercel, dan production readiness.",
    body: [
      "Untuk package gateway: jalankan npm run verify sebelum publish. Untuk docs web: jalankan npm run build sebelum deploy.",
      "Gunakan tag GitHub untuk rilis stabil, misalnya v1.0.1. Pastikan latest npm mengarah ke versi stable.",
      "Untuk Vercel free tier, gunakan Vite static build dan API route serverless ringan. Hindari menyimpan rahasia di frontend."
    ],
    code: "npm run verify\nnpm publish --access public\ngit tag v1.0.1\ngit push origin v1.0.1\n\n# docs web\nnpm run build",
    tags: ["release", "deploy", "vercel", "ci"]
  }
];

export const knowledgeBase = docs.map((doc) => `${doc.title}\n${doc.summary}\n${doc.body.join("\n")}\n${doc.code ?? ""}\nTags: ${doc.tags.join(", ")}`).join("\n\n---\n\n");
