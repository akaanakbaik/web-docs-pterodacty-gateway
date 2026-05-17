export type TutorialStep = {
  title: string;
  detail: string;
  command?: string;
};

export type SimulationStep = {
  label: string;
  terminal: string;
  result: string;
};

export type DocSection = {
  id: string;
  path: string;
  group: string;
  title: string;
  summary: string;
  beginner: string;
  body: string[];
  steps: TutorialStep[];
  simulation: SimulationStep[];
  code?: string;
  examples: { title: string; code: string }[];
  tags: string[];
};

const commonInstall = "npm i @akaanakbaik/pterodactyl-gateway\nnpm i -g @akaanakbaik/pterodactyl-gateway";

export const docs: DocSection[] = [
  {
    id: "overview",
    path: "/docs/overview",
    group: "Start",
    title: "Pengenalan Gateway",
    summary: "Memahami fungsi package npm stabil @akaanakbaik/pterodactyl-gateway untuk SDK, CLI, wizard, dan integrasi bot.",
    beginner: "Mulai dari sini jika kamu baru pertama kali memakai Pterodactyl API atau ingin membuat toko panel/bot panel otomatis.",
    body: [
      "Akadev Pterodactyl Gateway adalah package npm stabil untuk menghubungkan aplikasi Node.js ke Pterodactyl Panel dengan cara yang lebih rapi, aman, dan mudah diuji.",
      "Package ini punya dua wajah: SDK untuk dipakai di source bot/website/backend, dan CLI untuk admin melakukan cek koneksi, create user/server, probe server, file manager, backups, schedules, dan power action.",
      "Versi npm wajib diprioritaskan karena itulah distribusi stabil yang sudah dipublish, bisa diinstall mudah, dan cocok untuk user umum. Source GitHub dipakai untuk kontribusi dan development."
    ],
    steps: [
      { title: "Install versi npm", detail: "Gunakan package dari npm agar user selalu mendapat versi stabil dan mudah diperbarui.", command: commonInstall },
      { title: "Cek package", detail: "Pastikan CLI dan package terbaca dengan version/self-check.", command: "ptero-gateway version\nptero-gateway self-check" },
      { title: "Pilih mode integrasi", detail: "Gunakan CLI untuk admin manual, SDK untuk bot/website, dan wizard untuk flow interaktif." }
    ],
    simulation: [
      { label: "Install", terminal: "npm i -g @akaanakbaik/pterodactyl-gateway", result: "added 1 package" },
      { label: "Check", terminal: "ptero-gateway version", result: "@akaanakbaik/pterodactyl-gateway@1.0.1" },
      { label: "Ready", terminal: "ptero-gateway help", result: "CLI siap dipakai" }
    ],
    code: commonInstall,
    examples: [
      { title: "Import SDK", code: "import { createPtero } from '@akaanakbaik/pterodactyl-gateway';\nconst ptero = createPtero.fromEnv();" },
      { title: "CLI dasar", code: "ptero-gateway doctor\nptero-gateway ids --nest 5\nptero-gateway admin servers" }
    ],
    tags: ["overview", "pengenalan", "npm", "sdk", "cli", "typo: pterodacty pterodactyl gateway"]
  },
  {
    id: "install",
    path: "/docs/install",
    group: "Start",
    title: "Install dan Quick Start",
    summary: "Panduan pemula dari install Node.js, install package npm, sampai doctor OK.",
    beginner: "Ikuti bagian ini step-by-step. Jangan lanjut integrasi bot sebelum doctor OK.",
    body: [
      "Minimal gunakan Node.js 18. Untuk VPS modern, Node.js 20 atau 22 juga aman.",
      "Install dependency lokal jika package dipakai di source bot/website. Install global jika ingin menjalankan CLI dari terminal.",
      "Setelah install, jalankan doctor untuk memastikan domain panel dan API key bekerja."
    ],
    steps: [
      { title: "Install dependency project", detail: "Untuk source bot atau backend, install sebagai dependency biasa.", command: "npm i @akaanakbaik/pterodactyl-gateway" },
      { title: "Install CLI global", detail: "Untuk admin VPS, install global supaya command ptero-gateway tersedia.", command: "npm i -g @akaanakbaik/pterodactyl-gateway" },
      { title: "Cek versi", detail: "Pastikan yang terinstall adalah package npm stabil.", command: "ptero-gateway version" },
      { title: "Cek koneksi", detail: "Doctor akan mengetes domain, Application API, dan Client API.", command: "ptero-gateway doctor" }
    ],
    simulation: [
      { label: "Project install", terminal: "npm i @akaanakbaik/pterodactyl-gateway", result: "dependency masuk package.json" },
      { label: "Global CLI", terminal: "npm i -g @akaanakbaik/pterodactyl-gateway", result: "ptero-gateway tersedia" },
      { label: "Doctor", terminal: "ptero-gateway doctor", result: "Doctor: OK · Mode: full" }
    ],
    code: "npm i @akaanakbaik/pterodactyl-gateway\nnpm i -g @akaanakbaik/pterodactyl-gateway\nptero-gateway version\nptero-gateway self-check\nptero-gateway doctor",
    examples: [
      { title: "package.json bot", code: "{\n  \"type\": \"module\",\n  \"dependencies\": {\n    \"@akaanakbaik/pterodactyl-gateway\": \"latest\"\n  }\n}" },
      { title: "Cek global binary", code: "which ptero-gateway\nptero-gateway help" }
    ],
    tags: ["install", "quick start", "npm install", "nodejs", "pemula"]
  },
  {
    id: "config",
    path: "/docs/config",
    group: "Configuration",
    title: "Konfigurasi API Key dan Profile",
    summary: "Mengatur PTERO_DOMAIN, PTLA, PTLC, dan config profile lokal dengan aman.",
    beginner: "Config adalah pondasi. Jika bagian ini salah, semua command create server akan gagal.",
    body: [
      "PTERO_DOMAIN berisi URL panel. PTLA dipakai untuk Application API seperti user dan server. PTLC dipakai untuk Client API seperti files, backups, schedules, resources, dan power.",
      "Untuk production, simpan credential di environment variable. Untuk CLI di VPS pribadi, gunakan config profile agar tidak perlu export ulang.",
      "Jangan hardcode API key ke GitHub, frontend, pesan bot, atau log publik."
    ],
    steps: [
      { title: "Siapkan API key", detail: "Buat Application API key dan Client API key dari panel dengan permission sesuai kebutuhan." },
      { title: "Buat profile", detail: "Simpan profile lokal untuk CLI.", command: "ptero-gateway config init --profile main --domain https://panel.example.com --ptla ptla_xxx --ptlc ptlc_xxx" },
      { title: "Aktifkan profile", detail: "Jika punya banyak panel, pilih profile aktif.", command: "ptero-gateway config use main" },
      { title: "Validasi", detail: "Jalankan config doctor dan doctor utama.", command: "ptero-gateway config doctor\nptero-gateway doctor" }
    ],
    simulation: [
      { label: "Profile", terminal: "ptero-gateway config init --profile main ...", result: "Profile 'main' tersimpan dan aktif" },
      { label: "List", terminal: "ptero-gateway config list", result: "main yes https://panel.example.com" },
      { label: "Doctor", terminal: "ptero-gateway doctor", result: "PTLA valid · PTLC valid" }
    ],
    code: "PTERO_DOMAIN=https://panel.example.com\nPTERO_PTLA=ptla_xxx\nPTERO_PTLC=ptlc_xxx\n\nptero-gateway config init --profile main --domain https://panel.example.com --ptla ptla_xxx --ptlc ptlc_xxx\nptero-gateway config list\nptero-gateway doctor",
    examples: [
      { title: "Express .env", code: "PTERO_DOMAIN=https://panel.example.com\nPTERO_PTLA=ptla_xxx\nPTERO_PTLC=ptlc_xxx\nPTERO_NODE_ID=1\nPTERO_NEST_ID=5\nPTERO_EGG_ID=18" },
      { title: "Multi profile", code: "ptero-gateway config init --profile prod --domain https://prod.example.com --ptla ptla_xxx --ptlc ptlc_xxx\nptero-gateway config init --profile dev --domain https://dev.example.com --ptla ptla_xxx --ptlc ptlc_xxx\nptero-gateway config use prod" }
    ],
    tags: ["config", "env", "ptla", "ptlc", "api key", "profile"]
  },
  {
    id: "cli-create-server",
    path: "/docs/cli-create-server",
    group: "CLI",
    title: "CLI Create User dan Server",
    summary: "Tutorial lengkap membuat user dan server dari terminal dengan dry-run dulu.",
    beginner: "Selalu dry-run dulu. Jika preview sudah benar, baru tambah --yes.",
    body: [
      "Flow create server terbaik adalah cek IDs, dry-run, lalu eksekusi asli. Dry-run membuat payload preview tanpa membuat server sungguhan.",
      "Gunakan preset basic/standard/premium agar resource konsisten. Override hanya jika perlu.",
      "Jika egg tidak punya Docker Images, isi --docker-image manual atau atur Docker Images di panel."
    ],
    steps: [
      { title: "Cek ID", detail: "Cari Node ID, Nest ID, dan Egg ID.", command: "ptero-gateway ids --nest 5" },
      { title: "Dry-run", detail: "Preview payload create server tanpa membuat server.", command: "ptero-gateway admin create-server --name \"aka test\" --email user@example.com --username aka_test --password \"secret\" --node 1 --nest 5 --egg 18 --preset basic --dry-run" },
      { title: "Eksekusi", detail: "Jika payload sudah benar, jalankan dengan --yes.", command: "ptero-gateway admin create-server --name \"aka test\" --email user@example.com --username aka_test --password \"secret\" --node 1 --nest 5 --egg 18 --preset basic --yes" },
      { title: "Probe", detail: "Tes server baru dari Client API.", command: "ptero-gateway probe <identifier>" }
    ],
    simulation: [
      { label: "IDs", terminal: "ptero-gateway ids --nest 5", result: "node 1 · nest 5 · egg 18" },
      { label: "Dry-run", terminal: "ptero-gateway admin create-server ... --dry-run", result: "Create server dry-run OK" },
      { label: "Create", terminal: "ptero-gateway admin create-server ... --yes", result: "Server berhasil dibuat · identifier: 311d56b7" },
      { label: "Probe", terminal: "ptero-gateway probe 311d56b7", result: "resources OK · files OK · backups OK" }
    ],
    code: "ptero-gateway admin create-server \\\n  --name \"aka test\" \\\n  --email user@example.com \\\n  --username aka_test \\\n  --password \"secret\" \\\n  --node 1 --nest 5 --egg 18 \\\n  --preset basic \\\n  --dry-run",
    examples: [
      { title: "Paket basic", code: "ptero-gateway admin create-server --name \"bot basic\" --email user@example.com --username user_basic --node 1 --nest 5 --egg 18 --preset basic --dry-run" },
      { title: "Override resource", code: "ptero-gateway admin create-server --name \"api custom\" --email user@example.com --username user_api --node 1 --nest 5 --egg 18 --preset standard --memory 3GB --disk 8GB --cpu 250% --dry-run" }
    ],
    tags: ["cli", "create server", "dry run", "preset", "tutorial"]
  },
  {
    id: "sdk",
    path: "/docs/sdk",
    group: "SDK",
    title: "SDK TypeScript Lengkap",
    summary: "Cara memakai createPtero, createSmart, previewCreate, server handle, dan error handling.",
    beginner: "SDK dipakai di backend, bukan langsung dari frontend. Frontend tidak boleh memegang API key panel.",
    body: [
      "SDK cocok untuk Express, Fastify, bot worker, dashboard admin, dan sistem order otomatis.",
      "Gunakan createPtero.fromEnv untuk setup sederhana. Gunakan createPtero({...}) jika config berasal dari database atau multi panel.",
      "Semua operasi penting punya mode preview/dry-run agar bisa divalidasi sebelum benar-benar membuat resource."
    ],
    steps: [
      { title: "Import package", detail: "Import createPtero dari package npm stabil.", command: "import { createPtero } from '@akaanakbaik/pterodactyl-gateway';" },
      { title: "Buat instance", detail: "Pakai fromEnv jika env sudah disiapkan.", command: "const ptero = createPtero.fromEnv();" },
      { title: "Preview server", detail: "Bangun payload dulu tanpa create asli.", command: "const preview = await ptero.servers.previewCreate(input);" },
      { title: "Create asli", detail: "Jika valid, eksekusi createSmart.", command: "const server = await ptero.servers.createSmart(input);" }
    ],
    simulation: [
      { label: "Connect", terminal: "await ptero.connect()", result: "mode: full" },
      { label: "Preview", terminal: "await ptero.servers.previewCreate(input)", result: "payload siap" },
      { label: "Create", terminal: "await ptero.servers.createSmart(input)", result: "server id + identifier" },
      { label: "Control", terminal: "await ptero.server(id).resources()", result: "state running/offline" }
    ],
    code: "import { createPtero } from '@akaanakbaik/pterodactyl-gateway';\n\nconst ptero = createPtero.fromEnv();\n\nconst input = {\n  name: 'Bot User',\n  email: 'user@example.com',\n  username: 'user_bot',\n  password: 'auto',\n  autoCreateUser: true,\n  description: 'Server bot user',\n  nodeId: 1,\n  nestId: 5,\n  eggId: 18,\n  specs: { memory: '1GB', disk: '2GB', cpu: '100%', databases: 0, allocations: 1, backups: 0 }\n};\n\nconst preview = await ptero.servers.previewCreate(input);\nconst server = await ptero.servers.createSmart(input);",
    examples: [
      { title: "File manager", code: "const server = ptero.server('311d56b7');\nawait server.files.write('/tmp/hello.txt', 'halo');\nconst text = await server.files.read('/tmp/hello.txt');" },
      { title: "Power action", code: "const server = ptero.server('311d56b7');\nawait server.start();\nawait server.resources();\nawait server.stop();" }
    ],
    tags: ["sdk", "typescript", "esm", "createPtero", "backend"]
  },
  {
    id: "telegram-bot",
    path: "/docs/integrations/telegram-bot",
    group: "Integration",
    title: "Integrasi Bot Telegram",
    summary: "Contoh lengkap memakai grammy untuk membuat panel dari command Telegram.",
    beginner: "Gunakan Telegram user ID sebagai identitas utama, bukan username, karena username bisa berubah.",
    body: [
      "Bot Telegram harus memvalidasi user sebelum create server. Minimal cek admin ID, role, atau status pembayaran.",
      "Credential panel sebaiknya dikirim private, bukan ke grup. Simpan hasil server id dan identifier di database.",
      "Untuk pemula, mulai dengan dryRun agar tidak membuat server dobel saat testing."
    ],
    steps: [
      { title: "Install dependency", detail: "Install grammy dan gateway.", command: "npm i grammy @akaanakbaik/pterodactyl-gateway" },
      { title: "Buat service", detail: "Simpan node/nest/egg default sekali.", command: "const service = createIntegrationService(config, defaults);" },
      { title: "Command preview", detail: "Gunakan dryRun untuk melihat payload.", command: "await service.dryRun({ kind: 'telegram-bot', ...data });" },
      { title: "Command create", detail: "Create server setelah validasi pembayaran/admin OK.", command: "await service.create({ kind: 'telegram-bot', ...data });" }
    ],
    simulation: [
      { label: "User", terminal: "/createpanel basic", result: "Bot menerima request" },
      { label: "Validate", terminal: "checkPayment(userId)", result: "paid: true" },
      { label: "Dry-run", terminal: "service.dryRun({ kind: 'telegram-bot' })", result: "payload OK" },
      { label: "Create", terminal: "service.create(...) ", result: "Panel berhasil dibuat" }
    ],
    code: "import { Bot } from 'grammy';\nimport { createIntegrationService, explainError } from '@akaanakbaik/pterodactyl-gateway';\n\nconst bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);\nconst service = createIntegrationService({\n  domain: process.env.PTERO_DOMAIN,\n  ptla: process.env.PTERO_PTLA,\n  ptlc: process.env.PTERO_PTLC\n}, { nodeId: 1, nestId: 5, eggId: 18, preset: 'basic', autoCreateUser: true });\n\nbot.command('createpanel', async (ctx) => {\n  try {\n    const userId = ctx.from?.id;\n    if (!userId) return ctx.reply('User tidak valid.');\n    const result = await service.create({\n      kind: 'telegram-bot',\n      name: `tg-${userId}`,\n      email: `${userId}@telegram.local`,\n      username: `tg_${userId}`,\n      password: 'auto'\n    });\n    await ctx.reply(`Panel berhasil dibuat: ${result.identifier ?? result.id}`);\n  } catch (error) {\n    await ctx.reply(explainError(error));\n  }\n});\n\nbot.start();",
    examples: [
      { title: "Dry-run Telegram", code: "const preview = await service.dryRun({ kind: 'telegram-bot', name: 'tg-123', email: '123@telegram.local', username: 'tg_123', password: 'auto' });" },
      { title: "Role/admin check", code: "const ADMINS = new Set(['123456']);\nif (!ADMINS.has(String(ctx.from.id))) return ctx.reply('Khusus admin.');" }
    ],
    tags: ["telegram", "grammy", "bot", "integration", "panel store"]
  },
  {
    id: "whatsapp-bot",
    path: "/docs/integrations/whatsapp-bot",
    group: "Integration",
    title: "Integrasi Bot WhatsApp",
    summary: "Contoh integrasi toko panel WhatsApp/Baileys dengan payment dan create server otomatis.",
    beginner: "Jangan create server langsung dari chat publik. Selalu cek pembayaran/order terlebih dahulu.",
    body: [
      "Bot WhatsApp biasanya dipakai untuk toko panel. Flow aman: user pilih paket, sistem buat invoice, payment sukses, baru create server.",
      "Gunakan kind whatsapp-bot dan preset standard untuk bot yang butuh ruang lebih besar dari basic.",
      "Simpan session WhatsApp di volume server dan hindari menghapus folder session saat update."
    ],
    steps: [
      { title: "Install gateway", detail: "Pasang gateway pada source bot WhatsApp.", command: "npm i @akaanakbaik/pterodactyl-gateway" },
      { title: "Validasi order", detail: "Cek status pembayaran sebelum create." },
      { title: "Create server", detail: "Gunakan createIntegrationService dengan kind whatsapp-bot.", command: "await service.create({ kind: 'whatsapp-bot', ...orderData });" },
      { title: "Kirim hasil", detail: "Kirim panel URL dan data login ke private chat user." }
    ],
    simulation: [
      { label: "Order", terminal: "User pilih Paket Standard", result: "invoice dibuat" },
      { label: "Payment", terminal: "checkPayment(orderId)", result: "paid" },
      { label: "Create", terminal: "service.create({ kind: 'whatsapp-bot' })", result: "server dibuat" },
      { label: "Notify", terminal: "sendMessage(user, credential)", result: "credential terkirim private" }
    ],
    code: "const result = await service.create({\n  kind: 'whatsapp-bot',\n  name: `wa-${order.username}`,\n  email: order.email,\n  username: order.username,\n  password: 'auto',\n  environment: {\n    OWNER_NUMBER: order.phone,\n    BOT_NAME: order.botName\n  }\n});",
    examples: [
      { title: "Payment guard", code: "const paid = await checkPayment(order.id);\nif (!paid) return reply('Pembayaran belum berhasil.');" },
      { title: "Audit log", code: "await db.orders.update({ id: order.id, serverId: result.id, identifier: result.identifier, status: 'created' });" }
    ],
    tags: ["whatsapp", "baileys", "bot wa", "qris", "store panel"]
  },
  {
    id: "discord-bot",
    path: "/docs/integrations/discord-bot",
    group: "Integration",
    title: "Integrasi Bot Discord",
    summary: "Contoh Discord bot dengan slash command, role check, dan ephemeral reply.",
    beginner: "Data panel jangan dikirim ke channel umum. Gunakan ephemeral/private reply.",
    body: [
      "Discord cocok untuk komunitas hosting atau server support. Batasi create panel berdasarkan role atau whitelist.",
      "Gunakan Discord user ID sebagai identitas unik. Email lokal bisa berupa userId@discord.local jika user belum punya email asli.",
      "Gunakan ephemeral reply untuk mencegah credential terlihat publik."
    ],
    steps: [
      { title: "Install dependency", detail: "Install discord.js dan gateway.", command: "npm i discord.js @akaanakbaik/pterodactyl-gateway" },
      { title: "Cek role", detail: "Pastikan hanya role tertentu yang bisa create." },
      { title: "Create server", detail: "Gunakan kind discord-bot.", command: "await service.create({ kind: 'discord-bot', ...data });" },
      { title: "Reply private", detail: "Kirim hasil sebagai ephemeral reply." }
    ],
    simulation: [
      { label: "Slash", terminal: "/panel-create basic", result: "interaction diterima" },
      { label: "Role", terminal: "member.roles.cache.has(roleId)", result: "allowed" },
      { label: "Create", terminal: "service.create({ kind: 'discord-bot' })", result: "server online" },
      { label: "Reply", terminal: "interaction.reply({ ephemeral: true })", result: "credential private" }
    ],
    code: "const result = await service.create({\n  kind: 'discord-bot',\n  name: `dc-${interaction.user.id}`,\n  email: `${interaction.user.id}@discord.local`,\n  username: `dc_${interaction.user.id}`,\n  password: 'auto'\n});\n\nawait interaction.reply({ content: `Server dibuat: ${result.identifier}`, ephemeral: true });",
    examples: [
      { title: "Role check", code: "if (!interaction.memberPermissions?.has('Administrator')) {\n  return interaction.reply({ content: 'Khusus admin.', ephemeral: true });\n}" },
      { title: "Error handling", code: "try { await createDiscordPanel(interaction); } catch (error) { await interaction.reply({ content: explainError(error), ephemeral: true }); }" }
    ],
    tags: ["discord", "discordjs", "slash command", "ephemeral"]
  },
  {
    id: "website-api",
    path: "/docs/integrations/website-api",
    group: "Integration",
    title: "Integrasi Website dan REST API",
    summary: "Membuat endpoint preview/create panel untuk dashboard, store, atau aplikasi web.",
    beginner: "Frontend hanya memanggil API backend. Jangan pernah expose PTLA/PTLC ke browser.",
    body: [
      "Website store panel butuh backend untuk menyimpan secret dan validasi pembayaran. Frontend cukup kirim paket, user, dan order ID.",
      "Endpoint preview berguna untuk admin melihat estimasi payload tanpa create. Endpoint create hanya dijalankan setelah payment sukses.",
      "Tambahkan rate limit, auth admin, dan idempotency agar order tidak dobel."
    ],
    steps: [
      { title: "Buat service backend", detail: "Service gateway dibuat di server Express, bukan React frontend." },
      { title: "Endpoint preview", detail: "Kembalikan dry-run payload untuk validasi admin.", command: "app.post('/api/panel/preview', async (req, res) => res.json(await service.dryRun(...)))" },
      { title: "Endpoint create", detail: "Cek auth/payment, lalu create server.", command: "app.post('/api/panel/create', async (req, res) => res.json(await service.create(...)))" },
      { title: "Simpan audit", detail: "Simpan order ID, user ID, server ID, identifier, dan paket." }
    ],
    simulation: [
      { label: "Frontend", terminal: "POST /api/panel/preview", result: "payload preview" },
      { label: "Payment", terminal: "POST /api/payment/callback", result: "order paid" },
      { label: "Backend", terminal: "POST /api/panel/create", result: "server dibuat" },
      { label: "Dashboard", terminal: "GET /api/my-servers", result: "server tampil" }
    ],
    code: "app.post('/api/panel/create', async (req, res) => {\n  const paid = await checkPayment(req.body.orderId);\n  if (!paid) return res.status(403).json({ ok: false, error: 'Belum dibayar' });\n\n  const result = await service.create({\n    kind: 'website',\n    name: req.body.name,\n    email: req.body.email,\n    username: req.body.username,\n    password: 'auto'\n  });\n\n  res.json({ ok: true, result });\n});",
    examples: [
      { title: "Rate limit sederhana", code: "const key = `${req.ip}:${req.body.userId}`;\nif (await tooManyRequests(key)) return res.status(429).json({ error: 'Terlalu banyak request' });" },
      { title: "Idempotency", code: "const existing = await db.orders.findUnique({ where: { id: orderId } });\nif (existing?.serverId) return res.json(existing);" }
    ],
    tags: ["website", "express", "api", "dashboard", "store"]
  },
  {
    id: "security",
    path: "/docs/security",
    group: "Production",
    title: "Keamanan dan Guard Production",
    summary: "Panduan menjaga API key, command guard, auth, payment, dan batas fitur sensitif.",
    beginner: "Keamanan default dibuat aman tapi tetap fleksibel. Jangan mematikan safeMode tanpa alasan jelas.",
    body: [
      "PTLA dan PTLC adalah credential penting. Simpan hanya di backend/server. Jangan masukkan ke frontend, GitHub, atau pesan publik.",
      "SafeMode memblokir pola command berbahaya. Untuk kasus expert, allowDangerous bisa dipakai secara sadar, tetapi jangan jadikan default untuk user umum.",
      "Command node, location, dan allocation management sengaja tidak dibuka di CLI stabil karena sensitif. Admin cukup memilih ID manual dari panel atau ids."
    ],
    steps: [
      { title: "Pisahkan secret", detail: "Gunakan environment variable atau secret manager." },
      { title: "Auth backend", detail: "Endpoint create server wajib punya auth admin/payment." },
      { title: "Audit log", detail: "Catat siapa membuat server, kapan, paket apa, dan hasilnya." },
      { title: "Dry-run default", detail: "Gunakan dry-run untuk paket baru sebelum production." }
    ],
    simulation: [
      { label: "Request", terminal: "POST /api/panel/create", result: "auth check" },
      { label: "Guard", terminal: "safeMode command scan", result: "dangerous blocked" },
      { label: "Audit", terminal: "db.audit.create(...) ", result: "log tersimpan" },
      { label: "Response", terminal: "res.json({ ok: true })", result: "aman" }
    ],
    code: "const ptero = createPtero({ domain, ptla, ptlc, safeMode: true });\n\nawait ptero.server(identifier).command('npm start');\n\n// Expert only, jangan default untuk user umum:\nawait ptero.server(identifier).command('custom command', { allowDangerous: true });",
    examples: [
      { title: "Jangan expose secret", code: "// salah: jangan kirim PTLA ke frontend\nres.json({ ptla: process.env.PTERO_PTLA });\n\n// benar\nres.json({ ok: true });" },
      { title: "Payment gate", code: "if (!order.paid) throw new Error('Order belum dibayar');\nconst server = await service.create(payload);" }
    ],
    tags: ["security", "safeMode", "guard", "secret", "production"]
  },
  {
    id: "troubleshooting",
    path: "/docs/troubleshooting",
    group: "Production",
    title: "Troubleshooting Error Umum",
    summary: "Solusi detail untuk DOMAIN_REQUIRED, Docker image, allocation, backup, startup variable, dan deploy.",
    beginner: "Jika error, baca pesan error dulu lalu jalankan ptero-gateway explain <CODE>.",
    body: [
      "DOMAIN_REQUIRED berarti domain panel belum diisi. Perbaiki env atau config profile.",
      "DOCKER_IMAGE_NOT_FOUND berarti egg tidak punya docker image default. Atur Docker Images di panel atau isi --docker-image.",
      "NO_FREE_ALLOCATION berarti node tidak punya allocation kosong. Tambahkan allocation dari panel admin.",
      "Jika server stuck starting, cek startup command, file package.json/index.js, dan log Wings."
    ],
    steps: [
      { title: "Jalankan explain", detail: "Mulai dari error code.", command: "ptero-gateway explain DOMAIN_REQUIRED" },
      { title: "Cek doctor", detail: "Pastikan API key valid.", command: "ptero-gateway doctor" },
      { title: "Probe server", detail: "Cek endpoint Client API server.", command: "ptero-gateway probe <identifier>" },
      { title: "Cek resources", detail: "Lihat state server.", command: "ptero-gateway server <identifier> resources" }
    ],
    simulation: [
      { label: "Error", terminal: "DOMAIN_REQUIRED", result: "domain kosong" },
      { label: "Explain", terminal: "ptero-gateway explain DOMAIN_REQUIRED", result: "cara perbaikan muncul" },
      { label: "Config", terminal: "ptero-gateway config init ...", result: "profile aktif" },
      { label: "Doctor", terminal: "ptero-gateway doctor", result: "OK" }
    ],
    code: "ptero-gateway explain DOMAIN_REQUIRED\nptero-gateway explain DOCKER_IMAGE_NOT_FOUND\nptero-gateway doctor\nptero-gateway probe <identifier>\nptero-gateway server <identifier> resources",
    examples: [
      { title: "Docker image manual", code: "ptero-gateway admin create-server --name bot --email user@example.com --node 1 --nest 5 --egg 18 --docker-image ghcr.io/parkervcp/yolks:nodejs_22 --dry-run" },
      { title: "Server alive test", code: "ptero-gateway server <identifier> write /index.js 'console.log(\"alive\"); setInterval(()=>{},1000)' --yes --allow-any-path\nptero-gateway server <identifier> set-env CMD_RUN 'node index.js' --yes\nptero-gateway server <identifier> start --yes" }
    ],
    tags: ["troubleshooting", "error", "domain required", "docker image", "allocation"]
  },
  {
    id: "privacy",
    path: "/privacy",
    group: "Legal",
    title: "Privacy Policy",
    summary: "Kebijakan privasi untuk website dokumentasi dan AI assistant.",
    beginner: "Website docs tidak membutuhkan login dan tidak meminta credential panel.",
    body: [
      "Website ini menyediakan dokumentasi, search lokal, dan AI assistant. Pertanyaan yang dikirim ke AI assistant akan diteruskan ke endpoint AI untuk menghasilkan jawaban.",
      "Jangan memasukkan API key, password, token bot, credential panel, atau data pribadi sensitif ke kolom AI.",
      "Search lokal berjalan di browser dan tidak membutuhkan database. Deployment Vercel dapat memiliki log request standar sesuai platform hosting."
    ],
    steps: [
      { title: "Data yang diproses", detail: "Pertanyaan AI dan konteks dokumentasi dikirim ke backend /api/ai." },
      { title: "Data yang tidak diminta", detail: "Website tidak meminta PTLA, PTLC, password panel, atau token bot." },
      { title: "Saran user", detail: "Selalu samarkan credential saat meminta bantuan AI." }
    ],
    simulation: [
      { label: "Search", terminal: "ketik 'telegram'", result: "filter lokal browser" },
      { label: "AI", terminal: "tanya 'cara install?'", result: "query dikirim ke /api/ai" },
      { label: "Response", terminal: "data.response.answer", result: "hanya jawaban ditampilkan" }
    ],
    code: "Jangan kirim credential asli ke AI. Contoh aman:\nPTERO_DOMAIN=https://panel.example.com\nPTERO_PTLA=ptla_***\nPTERO_PTLC=ptlc_***",
    examples: [
      { title: "Prompt aman", code: "Saya mendapat DOMAIN_REQUIRED. Env saya sudah diset tapi saya sensor value-nya. Apa yang harus dicek?" }
    ],
    tags: ["privacy", "privasi", "legal", "ai"]
  },
  {
    id: "terms",
    path: "/terms",
    group: "Legal",
    title: "Terms and Conditions",
    summary: "Syarat penggunaan website dokumentasi dan package gateway.",
    beginner: "Gunakan package ini secara bertanggung jawab dan sesuai aturan panel/hosting kamu.",
    body: [
      "Dokumentasi ini dibuat untuk membantu penggunaan Akadev Pterodactyl Gateway. Package ini bukan package resmi dari Pterodactyl dan tidak berafiliasi dengan Pterodactyl Software.",
      "User bertanggung jawab terhadap penggunaan API key, resource server, aturan hosting, dan tindakan otomatisasi yang dijalankan.",
      "Contoh kode disediakan sebagai referensi. Sesuaikan auth, payment, rate limit, dan audit log sebelum production."
    ],
    steps: [
      { title: "Gunakan versi npm", detail: "Versi npm adalah distribusi stabil yang direkomendasikan." },
      { title: "Validasi sebelum production", detail: "Uji dry-run, doctor, dan flow payment." },
      { title: "Patuhi aturan hosting", detail: "Jangan gunakan untuk aktivitas yang melanggar ToS provider/panel." }
    ],
    simulation: [
      { label: "Install", terminal: "npm i @akaanakbaik/pterodactyl-gateway", result: "pakai versi stabil" },
      { label: "Test", terminal: "ptero-gateway doctor", result: "validasi koneksi" },
      { label: "Deploy", terminal: "production rollout", result: "dengan auth + audit log" }
    ],
    code: "npm i @akaanakbaik/pterodactyl-gateway\nptero-gateway doctor\nptero-gateway explain DOMAIN_REQUIRED",
    examples: [
      { title: "Checklist production", code: "- Auth admin/payment aktif\n- Rate limit aktif\n- Credential tidak di frontend\n- Audit log tersimpan\n- Dry-run paket baru" }
    ],
    tags: ["terms", "syarat", "legal", "npm stable"]
  }
];

export const docsByPath = new Map(docs.map((doc) => [doc.path, doc]));
export const docsById = new Map(docs.map((doc) => [doc.id, doc]));
export const navGroups = Array.from(new Set(docs.map((doc) => doc.group)));

export const knowledgeBase = docs.map((doc) => [
  `Path: ${doc.path}`,
  `Title: ${doc.title}`,
  `Summary: ${doc.summary}`,
  `Beginner note: ${doc.beginner}`,
  `Body: ${doc.body.join(" ")}`,
  `Steps: ${doc.steps.map((step) => `${step.title} - ${step.detail} ${step.command ?? ""}`).join(" | ")}`,
  `Examples: ${doc.examples.map((example) => `${example.title}: ${example.code}`).join(" | ")}`,
  `Tags: ${doc.tags.join(", ")}`
].join("\n")).join("\n\n---\n\n");
