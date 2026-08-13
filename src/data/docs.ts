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

export const SDK_VERSION = "1.4.2";
export const PACKAGE_NAME = "@akaanakbaik/pterodactyl-gateway";
export const DOCS_URL = "https://pterodacty-gateway.akadev.me";
export const SDK_REPOSITORY_URL = "https://github.com/akaanakbaik/pterodactyl-gateway";
export const NPM_PACKAGE_URL = "https://www.npmjs.com/package/@akaanakbaik/pterodactyl-gateway";

const commonInstall = `npm i ${PACKAGE_NAME}
npm i -g ${PACKAGE_NAME}`;
const safeModeSnippet = `const ptero = createPtero({
  domain: process.env.PTERO_DOMAIN,
  ptla: process.env.PTERO_PTLA,
  ptlc: process.env.PTERO_PTLC,
  safeMode: true
});`;

export const docs: DocSection[] = [
  {
    id: "overview",
    path: "/docs/overview",
    group: "Start",
    title: "Pengenalan Gateway",
    summary: `Dokumentasi resmi ${PACKAGE_NAME} v${SDK_VERSION} untuk SDK TypeScript, CLI, wizard, dan integrasi bot Pterodactyl.`,
    beginner: "Mulai dari sini untuk memahami pembagian Application API, Client API, mode koneksi, dan jalur aman dari install sampai production.",
    body: [
      `Akadev Pterodactyl Gateway v${SDK_VERSION} adalah package Node.js ESM untuk menghubungkan backend, bot, dashboard, dan tool admin ke Pterodactyl Panel. SDK utama dipakai di backend; browser tidak boleh menerima PTLA atau PTLC.`,
      "Package ini menyediakan facade Application API untuk user, server, node, nest, egg, allocation, dan email; facade Client API untuk file, resources, power, backup, schedule, database, network, startup, dan WebSocket; serta helper smart untuk provisioning yang konsisten.",
      "Distribusi npm adalah jalur stabil yang direkomendasikan. Repositori GitHub menjadi tempat source, changelog, quality gate, dan kontribusi. Semua contoh di docs ini memakai placeholder credential dan tidak merepresentasikan panel nyata."
    ],
    steps: [
      { title: "Install versi npm", detail: "Pasang package lokal untuk backend atau CLI global untuk pekerjaan admin.", command: commonInstall },
      { title: "Validasi binary", detail: "Pastikan versi dan self-check menunjuk ke package yang benar.", command: "ptero-gateway version\nptero-gateway self-check" },
      { title: "Pilih jalur integrasi", detail: "Gunakan SDK untuk aplikasi, CLI untuk operasi manual, dan wizard untuk konfigurasi interaktif." },
      { title: "Baca guard sebelum production", detail: "Pahami retry safety, safe mode, secret handling, dan dry-run sebelum membuat resource asli." }
    ],
    simulation: [
      { label: "Install", terminal: `npm i -g ${PACKAGE_NAME}`, result: "package stabil terpasang" },
      { label: "Version", terminal: "ptero-gateway version", result: `@akaanakbaik/pterodactyl-gateway@${SDK_VERSION}` },
      { label: "Self-check", terminal: "ptero-gateway self-check", result: "Self-check: OK · Node.js >=18" },
      { label: "Ready", terminal: "ptero-gateway help", result: "CLI siap dipakai" }
    ],
    code: commonInstall,
    examples: [
      { title: "Import SDK", code: `import { createPtero } from "${PACKAGE_NAME}";\nconst ptero = createPtero.fromEnv();` },
      { title: "CLI dasar", code: "ptero-gateway doctor\nptero-gateway ids --nest 5\nptero-gateway admin servers" },
      { title: "Sumber resmi", code: `${SDK_REPOSITORY_URL}\n${NPM_PACKAGE_URL}` }
    ],
    tags: ["overview", "pengenalan", "npm", "sdk", "cli", "v1.4.2", "pterodacty gateway"]
  },
  {
    id: "install",
    path: "/docs/install",
    group: "Start",
    title: "Install dan Quick Start",
    summary: "Panduan dari Node.js >=18, install package, self-check, sampai doctor dengan mode koneksi yang jelas.",
    beginner: "Ikuti urutan ini sebelum membaca integrasi. Jika doctor belum OK, jangan menjalankan create server.",
    body: [
      "SDK mendukung Node.js 18, 20, dan 22. Gunakan project ESM dengan type module agar import package dan binary berjalan konsisten.",
      "Install lokal dipakai oleh service backend, sedangkan install global dipakai oleh admin yang ingin menjalankan ptero-gateway dari shell. Setelah install, self-check memeriksa metadata package dan doctor menguji domain serta key yang tersedia.",
      "Jangan menaruh PTLA atau PTLC di source frontend. Gunakan environment variable pada backend, secret manager, atau profile lokal yang tidak masuk Git."
    ],
    steps: [
      { title: "Periksa runtime", detail: "Pastikan Node.js memenuhi engine package.", command: "node --version\nnpm --version" },
      { title: "Install dependency project", detail: "Gunakan dependency lokal untuk bot, API, worker, atau dashboard backend.", command: `npm i ${PACKAGE_NAME}` },
      { title: "Install CLI global", detail: "Gunakan ini jika ptero-gateway dipanggil langsung dari terminal.", command: `npm i -g ${PACKAGE_NAME}` },
      { title: "Validasi package dan koneksi", detail: "Jalankan self-check lalu doctor setelah env tersedia.", command: "ptero-gateway version\nptero-gateway self-check\nptero-gateway doctor" }
    ],
    simulation: [
      { label: "Runtime", terminal: "node --version", result: "v18.x, v20.x, atau v22.x" },
      { label: "Project", terminal: `npm i ${PACKAGE_NAME}`, result: "dependency masuk package.json" },
      { label: "Self-check", terminal: "ptero-gateway self-check", result: "Self-check: OK" },
      { label: "Doctor", terminal: "ptero-gateway doctor", result: "mode: full · application/client valid" }
    ],
    code: `node --version
npm i ${PACKAGE_NAME}
ptero-gateway version
ptero-gateway self-check
ptero-gateway doctor`,
    examples: [
      { title: "package.json ESM", code: `{
  "type": "module",
  "engines": { "node": ">=18" },
  "dependencies": {
    "${PACKAGE_NAME}": "^${SDK_VERSION}"
  }
}` },
      { title: "Cek global binary", code: "which ptero-gateway\nptero-gateway help\nptero-gateway version --json" }
    ],
    tags: ["install", "quick start", "npm install", "nodejs", "pemula", "esm"]
  },
  {
    id: "config",
    path: "/docs/config",
    group: "Configuration",
    title: "Konfigurasi API Key dan Profile",
    summary: "Mengatur domain, PTLA, PTLC, safe mode, retry, dan profile CLI tanpa membocorkan secret.",
    beginner: "Configuration adalah pondasi. Pisahkan Application API dan Client API agar mode koneksi mudah didiagnosis.",
    body: [
      "PTERO_DOMAIN atau panelUrl berisi URL panel. PTLA atau applicationKey dipakai untuk Application API. PTLC atau clientKey dipakai untuk Client API. SDK dapat berjalan dalam mode full, admin, client, raw, atau invalid sesuai key yang valid.",
      "safeMode aktif secara default dan melindungi operasi destruktif. Retry dapat diatur untuk status tertentu, tetapi POST tidak diulang otomatis kecuali retryUnsafe bernilai true pada request yang memang idempotent menurut aplikasi.",
      "Profile CLI berguna untuk beberapa panel. Simpan file profile di lokasi privat dan jangan memasukkan isinya ke repository, artifact, log CI, atau prompt AI."
    ],
    steps: [
      { title: "Siapkan secret", detail: "Buat key dengan permission minimal dari panel dan simpan hanya di backend atau profile lokal." },
      { title: "Set environment", detail: "Gunakan variable untuk service yang dijalankan process manager.", command: "PTERO_DOMAIN=https://panel.example.com\nPTERO_PTLA=ptla_xxx\nPTERO_PTLC=ptlc_xxx" },
      { title: "Buat profile", detail: "Gunakan profile untuk CLI dengan banyak panel.", command: "ptero-gateway config init --profile main --domain https://panel.example.com --ptla ptla_xxx --ptlc ptlc_xxx" },
      { title: "Validasi", detail: "Periksa profile lalu jalankan doctor tanpa mencetak secret.", command: "ptero-gateway config list\nptero-gateway config doctor\nptero-gateway doctor" }
    ],
    simulation: [
      { label: "Env", terminal: "PTERO_DOMAIN=https://panel.example.com", result: "domain dinormalisasi" },
      { label: "Profile", terminal: "ptero-gateway config init --profile main ...", result: "profile aktif tanpa menampilkan key" },
      { label: "List", terminal: "ptero-gateway config list", result: "main · active · panel.example.com" },
      { label: "Doctor", terminal: "ptero-gateway doctor", result: "PTLA valid · PTLC valid" }
    ],
    code: `PTERO_DOMAIN=https://panel.example.com
PTERO_PTLA=ptla_xxx
PTERO_PTLC=ptlc_xxx

ptero-gateway config init --profile main --domain https://panel.example.com --ptla ptla_xxx --ptlc ptlc_xxx
ptero-gateway config use main
ptero-gateway config doctor`,
    examples: [
      { title: "SDK config", code: `import { createPtero } from "${PACKAGE_NAME}";\n\nconst ptero = createPtero({\n  domain: process.env.PTERO_DOMAIN,\n  ptla: process.env.PTERO_PTLA,\n  ptlc: process.env.PTERO_PTLC,\n  safeMode: true,\n  timeout: 15000\n});` },
      { title: "Multi profile", code: "ptero-gateway config init --profile prod --domain https://prod.example.com --ptla ptla_xxx --ptlc ptlc_xxx\nptero-gateway config init --profile dev --domain https://dev.example.com --ptla ptla_xxx --ptlc ptlc_xxx\nptero-gateway config use prod" }
    ],
    tags: ["config", "env", "ptla", "ptlc", "profile", "safeMode", "retry"]
  },
  {
    id: "cli-create-server",
    path: "/docs/cli-create-server",
    group: "CLI",
    title: "CLI Create User dan Server",
    summary: "Flow provisioning yang dapat diaudit: cek ID, dry-run, create, probe, control, dan cleanup.",
    beginner: "Selalu mulai dari ids dan dry-run. Operasi asli harus memakai konfirmasi yang terlihat jelas.",
    body: [
      "Flow create server menggabungkan user, node, nest, egg, allocation, image, startup, dan limits. CLI membantu membuat preview payload sebelum request POST dikirim ke panel.",
      "Nest dan Egg tidak boleh dianggap memiliki ID universal. Gunakan ptero-gateway ids --nest <id> atau resolver berdasarkan nama, lalu verifikasi Docker image serta allocation di panel yang sedang dipakai.",
      "Untuk testing, gunakan resource sementara dengan nama yang jelas, catat identifier, lalu hapus user dan server setelah skenario selesai. Jangan menguji pada resource produksi tanpa approval."
    ],
    steps: [
      { title: "Cek identifier panel", detail: "Temukan Node, Nest, dan Egg yang tersedia.", command: "ptero-gateway ids --nest 5" },
      { title: "Preview payload", detail: "Dry-run tidak membuat resource asli.", command: "ptero-gateway admin create-server --name \"docs-test\" --email user@example.com --username docs_test --password auto --node 1 --nest 5 --egg 18 --preset basic --dry-run" },
      { title: "Eksekusi terkonfirmasi", detail: "Gunakan --yes setelah preview, permission, image, allocation, dan limits diperiksa.", command: "ptero-gateway admin create-server --name \"docs-test\" --email user@example.com --username docs_test --password auto --node 1 --nest 5 --egg 18 --preset basic --yes" },
      { title: "Probe dan cleanup", detail: "Tes endpoint client lalu hapus resource test setelah selesai.", command: "ptero-gateway probe <identifier>\nptero-gateway admin delete-server <id> --yes" }
    ],
    simulation: [
      { label: "IDs", terminal: "ptero-gateway ids --nest 5", result: "node, nest, egg tersedia" },
      { label: "Dry-run", terminal: "ptero-gateway admin create-server ... --dry-run", result: "payload preview · no mutation" },
      { label: "Create", terminal: "ptero-gateway admin create-server ... --yes", result: "server dibuat · identifier tercatat" },
      { label: "Probe", terminal: "ptero-gateway probe <identifier>", result: "resources · files · backups terjangkau" }
    ],
    code: `ptero-gateway ids --nest 5
ptero-gateway admin create-server \
  --name "docs-test" \
  --email user@example.com \
  --username docs_test \
  --password auto \
  --node 1 --nest 5 --egg 18 \
  --preset basic \
  --dry-run`,
    examples: [
      { title: "Preset standard", code: "ptero-gateway admin create-server --name \"bot standard\" --email user@example.com --username bot_standard --node 1 --nest 5 --egg 18 --preset standard --dry-run" },
      { title: "Override resource", code: "ptero-gateway admin create-server --name \"api custom\" --email user@example.com --username api_custom --node 1 --nest 5 --egg 18 --preset standard --memory 3GB --disk 8GB --cpu 250% --dry-run" },
      { title: "Image manual", code: "ptero-gateway admin create-server --name \"node app\" --email user@example.com --username node_app --node 1 --nest 5 --egg 18 --docker-image ghcr.io/parkervcp/yolks:nodejs_22 --dry-run" }
    ],
    tags: ["cli", "create user", "create server", "dry run", "preset", "nest", "egg", "allocation"]
  },
  {
    id: "sdk",
    path: "/docs/sdk",
    group: "SDK",
    title: "SDK TypeScript v1.4.2",
    summary: "Membangun gateway, menjalankan preview, createSmart, server handle, error handling, dan typed response.",
    beginner: "SDK hanya berjalan di backend atau worker terpercaya. Gunakan preview dan safe mode sebelum mutation.",
    body: [
      "createPtero.fromEnv() cocok untuk service sederhana. createPtero(config) cocok untuk multi-panel, konfigurasi dari secret manager, custom fetcher, timeout, retry, atau safeMode yang eksplisit.",
      "Facade servers menyediakan preview, create, createFromPreset, updateSpecs, changeOwnership, dan changeNestEgg. Handle server menyediakan resources, power, command, files, startup, network, databases, backups, dan websocket.",
      "PteroError dan explainError membantu aplikasi memetakan error domain, key, allocation, image, safe mode, atau server ke pesan yang dapat ditindaklanjuti."
    ],
    steps: [
      { title: "Import package", detail: "Gunakan named export dari package npm.", command: `import { createPtero, explainError } from "${PACKAGE_NAME}";` },
      { title: "Buat instance", detail: "fromEnv membaca configuration dari process environment.", command: "const ptero = createPtero.fromEnv();" },
      { title: "Preview", detail: "Preview menghasilkan payload dan hasil resolver tanpa membuat server.", command: "const preview = await ptero.application.servers.preview(input);" },
      { title: "Create dan handle", detail: "Setelah preview disetujui, create lalu gunakan identifier pada Client API.", command: "const server = await ptero.application.servers.create(input);\nconst handle = ptero.server(server.identifier);" }
    ],
    simulation: [
      { label: "Connect", terminal: "await ptero.connect()", result: "mode: full · latency terukur" },
      { label: "Preview", terminal: "await ptero.application.servers.preview(input)", result: "payload siap · no mutation" },
      { label: "Create", terminal: "await ptero.application.servers.create(input)", result: "server id + identifier" },
      { label: "Control", terminal: "await ptero.server(identifier).resources()", result: "state dan resource tersedia" }
    ],
    code: `import { createPtero, explainError } from "${PACKAGE_NAME}";

const ptero = createPtero.fromEnv();
const input = {
  name: "Docs Server",
  email: "user@example.com",
  username: "docs_user",
  password: "auto",
  autoCreateUser: true,
  nodeId: 1,
  nestId: 5,
  eggId: 18,
  specs: { memory: "1GB", disk: "2GB", cpu: "100%", databases: 0, allocations: 1, backups: 0 }
};

try {
  const preview = await ptero.application.servers.preview(input);
  const server = await ptero.application.servers.create(input);
  console.log(preview.payload, server.identifier);
} catch (error) {
  console.error(explainError(error));
}`,
    examples: [
      { title: "File manager", code: `const server = ptero.server("identifier");
await server.files.write("/tmp/hello.txt", "halo");
const text = await server.files.read("/tmp/hello.txt");
const download = await server.files.download("/tmp/hello.txt");` },
      { title: "Power action", code: `const server = ptero.server("identifier");
await server.power("start");
await server.resources();
await server.power("stop");` },
      { title: "Typed collection", code: `const response = await ptero.request<PteroCollection<PteroAppServer>>({
  api: "application",
  path: "/servers",
  method: "GET"
});
const first = response.data[0]?.attributes;` }
    ],
    tags: ["sdk", "typescript", "esm", "createPtero", "createSmart", "backend", "typed"]
  },
  {
    id: "http-safety",
    path: "/docs/http-safety",
    group: "SDK",
    title: "HTTP Retry dan Request Safety",
    summary: "Memahami retry default, Retry-After, backoff, jitter, dan alasan POST membutuhkan opt-in eksplisit.",
    beginner: "Retry dapat mengulang request. Jangan mengulang mutation yang belum idempotent hanya karena jaringan lambat.",
    body: [
      "HttpCore v1.4.2 hanya melakukan auto-retry untuk method GET, HEAD, OPTIONS, PUT, PATCH, dan DELETE sesuai konfigurasi retryOn. POST tidak diulang otomatis karena request create dapat menggandakan resource.",
      "Jika aplikasi menjamin POST tertentu idempotent melalui idempotency key atau mekanisme server sendiri, request dapat memakai retryUnsafe: true. Keputusan ini harus dibuat per request, dicatat, dan diuji pada staging.",
      "Delay memakai exponential backoff dengan jitter dan menghormati header Retry-After bila tersedia. Atur timeout dan jumlah retry secukupnya agar kegagalan upstream tidak berubah menjadi storm request."
    ],
    steps: [
      { title: "Atur retry global", detail: "Retry status dapat dikonfigurasi pada PteroConfig.", command: "const ptero = createPtero({ domain, ptla, ptlc, retry: { retries: 2, baseDelay: 250, maxDelay: 4000 } });" },
      { title: "Gunakan GET aman", detail: "Read request dapat retry sesuai policy.", command: "await ptero.request({ api: \"application\", method: \"GET\", path: \"/servers\" });" },
      { title: "Opt-in mutation", detail: "POST hanya boleh retry jika idempotency dijamin aplikasi.", command: "await ptero.request({ api: \"application\", method: \"POST\", path: \"/safe-endpoint\", body: payload, retryUnsafe: true });" },
      { title: "Amati error", detail: "Gunakan PteroError dan log request tanpa menulis credential." }
    ],
    simulation: [
      { label: "GET", terminal: "GET /api/application/servers", result: "retry policy active" },
      { label: "429", terminal: "Retry-After: 2", result: "delay mengikuti upstream" },
      { label: "POST", terminal: "POST /api/application/servers", result: "no automatic retry by default" },
      { label: "Opt-in", terminal: "retryUnsafe: true", result: "POST retry enabled intentionally" }
    ],
    code: `const ptero = createPtero({
  domain: process.env.PTERO_DOMAIN,
  ptla: process.env.PTERO_PTLA,
  ptlc: process.env.PTERO_PTLC,
  retry: { retries: 2, baseDelay: 250, maxDelay: 4000 }
});

await ptero.request({
  api: "application",
  method: "GET",
  path: "/servers"
});

await ptero.request({
  api: "application",
  method: "POST",
  path: "/idempotent-endpoint",
  body: payload,
  retryUnsafe: true
});`,
    examples: [
      { title: "Method policy", code: "GET · HEAD · OPTIONS · PUT · PATCH · DELETE = eligible\nPOST = opt-in with retryUnsafe: true" },
      { title: "No duplicate create", code: "const preview = await ptero.application.servers.preview(input);\nif (preview.ok) await ptero.application.servers.create(input);" }
    ],
    tags: ["retry", "retryUnsafe", "http", "backoff", "jitter", "Retry-After", "idempotent"]
  },
  {
    id: "api-surface",
    path: "/docs/api-surface",
    group: "SDK",
    title: "API Surface dan Pagination",
    summary: "Peta Application API, Client API, generic types, dan helper pagination lintas halaman.",
    beginner: "Gunakan facade untuk operasi umum. Gunakan request raw ketika endpoint panel belum memiliki helper khusus.",
    body: [
      "Application API berisi users, servers, nodes, nests, eggs, allocations, locations, dan email. Client API berisi account, servers, files, startup, network, databases, backups, schedules, resources, power, command, dan WebSocket.",
      "Response collection memakai PteroResource<T>, PteroCollection<T>, dan PteroPagination. Helper resolver dan provisioning membaca seluruh halaman sampai batas maksimum 100 halaman agar pilihan Nest, Egg, dan allocation tidak berhenti di halaman pertama.",
      "Resolver Nest/Egg tidak lagi diam-diam jatuh ke ID hardcoded. Jika nama tidak ditemukan dan default ID tidak diberikan secara eksplisit, SDK mengembalikan error yang harus ditangani aplikasi."
    ],
    steps: [
      { title: "Gunakan typed collection", detail: "Berikan generic pada request raw ketika response akan dipakai di aplikasi.", command: "const result = await ptero.request<PteroCollection<PteroAppServer>>({ api: \"application\", path: \"/servers\" });" },
      { title: "Resolver berdasarkan nama", detail: "Cari Nest atau Egg dari panel aktif, bukan dari ID universal.", command: "const nest = await ptero.findNestByName(\"Node.js\");\nconst egg = await ptero.findEggByName(nest.id, \"Node.js\");" },
      { title: "Resolve provisioning", detail: "Berikan default hanya jika memang dipilih operator.", command: "const defaults = await ptero.autoResolveDefaults(1, { defaultNestId: 5, defaultEggId: 18 });" },
      { title: "Batasi risiko", detail: "Tinjau total halaman, latency, dan rate limit panel sebelum menjalankan operasi batch." }
    ],
    simulation: [
      { label: "Page 1", terminal: "GET /nests?page=1", result: "pagination.current_page = 1" },
      { label: "Page N", terminal: "GET /nests?page=2", result: "items digabungkan" },
      { label: "Resolver", terminal: "findNestByName(\"Node.js\")", result: "ID dari panel aktif" },
      { label: "Strict", terminal: "missing name + no default", result: "resolver error · no silent fallback" }
    ],
    code: `import type { PteroAppServer, PteroCollection } from "${PACKAGE_NAME}";

const page = await ptero.request<PteroCollection<PteroAppServer>>({
  api: "application",
  method: "GET",
  path: "/servers"
});

const nest = await ptero.findNestByName("Node.js");
const egg = await ptero.findEggByName(nest.id, "Node.js");`,
    examples: [
      { title: "Generic resource", code: "type ServerResource = PteroResource<PteroAppServer>;\nconst item: ServerResource = page.data[0];" },
      { title: "Raw endpoint", code: "await ptero.request({ api: \"application\", method: \"GET\", path: \"/application/servers\" });" }
    ],
    tags: ["api", "application", "client", "pagination", "PteroResource", "PteroCollection", "resolver", "nest", "egg"]
  },
  {
    id: "server-operations",
    path: "/docs/server-operations",
    group: "Client API",
    title: "Kontrol Server dan Startup",
    summary: "Menggunakan server handle untuk resources, power, command, startup variables, dan schedule builder.",
    beginner: "Gunakan identifier server dari response create atau list, bukan nama yang bisa berubah.",
    body: [
      "server(identifier) membuat handle Client API untuk server tertentu. Dari handle ini aplikasi dapat membaca resources, mengirim power signal start/stop/restart/kill, menjalankan command, membaca startup, mengubah variable, dan membuat schedule.",
      "Power dan command adalah mutation. Lindungi route backend dengan authentication, authorization, idempotency, rate limit, dan audit log. Jangan meneruskan command mentah dari input user tanpa allowlist.",
      "Command Node.js untuk test sebaiknya menulis file sederhana, menjalankan proses foreground, dan memiliki cleanup yang jelas agar tidak meninggalkan process atau resource."
    ],
    steps: [
      { title: "Buat handle", detail: "Gunakan identifier yang berasal dari panel.", command: "const server = ptero.server(\"identifier\");" },
      { title: "Baca resource", detail: "Gunakan resources sebelum dan sesudah mutation.", command: "const before = await server.resources();" },
      { title: "Kontrol power", detail: "Kirim signal yang didukung panel.", command: "await server.power(\"start\");\nawait server.power(\"restart\");" },
      { title: "Kelola startup", detail: "Baca dan set environment variable sesuai egg.", command: "await server.startup.get();\nawait server.startup.set(\"CMD_RUN\", \"node index.js\");" }
    ],
    simulation: [
      { label: "Resources", terminal: "server.resources()", result: "state: offline" },
      { label: "Start", terminal: "server.power(\"start\")", result: "signal accepted" },
      { label: "Command", terminal: "server.command(\"node --version\")", result: "command queued" },
      { label: "State", terminal: "server.resources()", result: "state: running" }
    ],
    code: `const server = ptero.server("identifier");
const before = await server.resources();
await server.power("start");
await server.command("node --version");
await server.startup.set("CMD_RUN", "node index.js");
const after = await server.resources();`,
    examples: [
      { title: "Safe command allowlist", code: "const allowed = new Set([\"node --version\", \"npm --version\"]);\nif (!allowed.has(command)) throw new Error(\"Command tidak diizinkan\");\nawait server.command(command);" },
      { title: "Schedule builder", code: "const schedule = server.createScheduleBuilder();\nschedule.name(\"nightly\").cron(\"0 3 * * *\").power(\"restart\");\nawait schedule.create();" }
    ],
    tags: ["client api", "server", "resources", "power", "command", "startup", "schedule"]
  },
  {
    id: "files-backups",
    path: "/docs/files-backups",
    group: "Client API",
    title: "Files, Backups, dan WebSocket",
    summary: "Menguji file manager, download yang benar, backup, dan koneksi console WebSocket Node.js.",
    beginner: "File dan backup memakai endpoint Client API. Uji path, ukuran, dan izin pada server staging.",
    body: [
      "File manager menyediakan list, read, write, mkdir, rename, compress, decompress, delete, json.read, json.write, dan download. Endpoint download mengembalikan URL file dari panel; ia tidak boleh diperlakukan seperti response HTML fallback.",
      "Files.read menolak HTML fallback agar halaman error panel tidak dianggap sebagai isi file. Saat mengunduh, periksa status response, content type, dan ukuran sebelum menyimpan buffer.",
      "Backups menyediakan list, create, get, download, dan delete. WebSocket helper mengambil auth dari Client API dan di Node.js mengirim Origin yang sesuai agar handshake dapat dibuka; connect() menunggu socket benar-benar open."
    ],
    steps: [
      { title: "Tulis dan baca file", detail: "Mulai dengan file kecil di path yang diizinkan.", command: "await server.files.write(\"/tmp/docs.txt\", \"hello\");\nconst text = await server.files.read(\"/tmp/docs.txt\");" },
      { title: "Download file", detail: "Gunakan helper download dan tangani URL hasil panel.", command: "const download = await server.files.download(\"/tmp/docs.txt\");" },
      { title: "Backup", detail: "Buat atau daftar backup sebelum menghapus file test.", command: "const backup = await server.backups.create(\"docs-test\");\nconst backups = await server.backups.list();" },
      { title: "WebSocket", detail: "Connect setelah auth tersedia dan tutup socket saat service berhenti.", command: "const socket = server.websocket.create();\nawait socket.connect();" }
    ],
    simulation: [
      { label: "Write", terminal: "files.write(/tmp/docs.txt)", result: "file tersimpan" },
      { label: "Read", terminal: "files.read(/tmp/docs.txt)", result: "hello" },
      { label: "Backup", terminal: "backups.create(docs-test)", result: "backup queued" },
      { label: "Socket", terminal: "websocket.connect()", result: "socket open" }
    ],
    code: `const server = ptero.server("identifier");
await server.files.write("/tmp/docs.json", JSON.stringify({ ok: true }));
const json = await server.files.json.read<{ ok: boolean }>("/tmp/docs.json");
const download = await server.files.download("/tmp/docs.json");
const backups = await server.backups.list();`,
    examples: [
      { title: "JSON helper", code: "await server.files.json.write(\"/tmp/config.json\", { port: 3000 });\nconst config = await server.files.json.read<{ port: number }>(\"/tmp/config.json\");" },
      { title: "Backup download", code: "const backup = await server.backups.download(backupId);\nif (!backup?.attributes?.url) throw new Error(\"URL backup tidak tersedia\");" },
      { title: "Cleanup file", code: "await server.files.delete(\"/tmp\", [\"docs.txt\", \"docs.json\"]);" }
    ],
    tags: ["files", "download", "html fallback", "backup", "websocket", "origin", "client api"]
  },
  {
    id: "integrations-telegram",
    path: "/docs/integrations/telegram-bot",
    group: "Integration",
    title: "Integrasi Bot Telegram",
    summary: "Membangun command Telegram dengan validasi user, payment gate, dry-run, create, dan audit.",
    beginner: "Gunakan Telegram user ID sebagai identitas; username dapat berubah dan tidak cocok sebagai primary key.",
    body: [
      "Bot Telegram harus memvalidasi admin, role, atau status pembayaran sebelum menjalankan mutation. Credential panel tidak boleh dikirim ke chat atau group.",
      "createIntegrationService membantu menyatukan default node, nest, egg, preset, dan kind. Jalankan dryRun pada order baru, simpan idempotency key, lalu create hanya setelah payment verified.",
      "Kirim hasil credential melalui private chat dan simpan server ID, identifier, serta status order pada database yang terproteksi."
    ],
    steps: [
      { title: "Install dependency", detail: "Pasang grammy dan gateway pada backend bot.", command: `npm i grammy ${PACKAGE_NAME}` },
      { title: "Validasi identity", detail: "Cek user ID dan role sebelum menerima order." },
      { title: "Preview order", detail: "Bangun payload tanpa mutation.", command: "const preview = await service.dryRun({ kind: \"telegram-bot\", name: \"tg-user\", email: \"user@example.com\", username: \"tg_user\", password: \"auto\" });" },
      { title: "Create private", detail: "Jalankan create setelah payment dan idempotency lolos.", command: "const result = await service.create({ kind: \"telegram-bot\", name: \"tg-user\", email: \"user@example.com\", username: \"tg_user\", password: \"auto\" });" }
    ],
    simulation: [
      { label: "Identity", terminal: "/createpanel basic", result: "user ID tervalidasi" },
      { label: "Payment", terminal: "checkPayment(orderId)", result: "paid: true" },
      { label: "Preview", terminal: "service.dryRun({ kind: telegram-bot })", result: "payload OK" },
      { label: "Create", terminal: "service.create(...) ", result: "server dibuat dan dicatat" }
    ],
    code: `import { Bot } from "grammy";
import { createIntegrationService, explainError } from "${PACKAGE_NAME}";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
const service = createIntegrationService({
  domain: process.env.PTERO_DOMAIN,
  ptla: process.env.PTERO_PTLA,
  ptlc: process.env.PTERO_PTLC
}, { nodeId: 1, nestId: 5, eggId: 18, preset: "basic", autoCreateUser: true });

bot.command("createpanel", async (ctx) => {
  try {
    const userId = ctx.from?.id;
    if (!userId) return ctx.reply("User tidak valid.");
    const result = await service.create({
      kind: "telegram-bot",
      name: "tg-user",
      email: "user@example.com",
      username: "tg_user",
      password: "auto"
    });
    await ctx.reply("Server dibuat: " + (result.identifier ?? result.id));
  } catch (error) {
    await ctx.reply(explainError(error));
  }
});

bot.start();`,
    examples: [
      { title: "Admin allowlist", code: "const admins = new Set([\"123456\"]);\nif (!admins.has(String(ctx.from.id))) return ctx.reply(\"Khusus admin.\");" },
      { title: "Payment gate", code: "const paid = await checkPayment(orderId);\nif (!paid) return ctx.reply(\"Pembayaran belum berhasil.\");\nawait service.create(payload);" }
    ],
    tags: ["telegram", "grammy", "bot", "integration", "payment", "dryRun"]
  },
  {
    id: "integrations-whatsapp",
    path: "/docs/integrations/whatsapp-bot",
    group: "Integration",
    title: "Integrasi Bot WhatsApp",
    summary: "Flow toko panel WhatsApp dengan order, payment, idempotency, create server, dan delivery private.",
    beginner: "Jangan membuat server dari chat publik sebelum status payment dan identity order terverifikasi.",
    body: [
      "Bot WhatsApp cocok untuk toko panel, tetapi session dan credential memiliki risiko operasional tinggi. Simpan session pada volume privat dan rancang recovery sebelum production.",
      "Flow yang disarankan adalah pilih paket, buat invoice, terima callback terverifikasi, cek order idempotency, jalankan dryRun atau create, lalu kirim detail hanya ke nomor yang telah divalidasi.",
      "Gunakan kind whatsapp-bot pada integration service dan simpan audit log yang menghubungkan order, user, server, identifier, preset, serta waktu provisioning."
    ],
    steps: [
      { title: "Install gateway", detail: "Pasang gateway pada backend Baileys atau WhatsApp service.", command: `npm i ${PACKAGE_NAME}` },
      { title: "Validasi order", detail: "Pastikan callback payment autentik dan order belum pernah dipenuhi." },
      { title: "Preview lalu create", detail: "Gunakan service dengan kind whatsapp-bot.", command: "await service.dryRun({ kind: \"whatsapp-bot\", name: \"wa-order\", email: \"user@example.com\", username: \"wa_user\", password: \"auto\" });" },
      { title: "Kirim private", detail: "Kirim URL dan password lewat private chat yang sudah diverifikasi." }
    ],
    simulation: [
      { label: "Order", terminal: "User pilih Paket Standard", result: "invoice dibuat" },
      { label: "Payment", terminal: "verifyCallback(signature)", result: "paid" },
      { label: "Create", terminal: "service.create({ kind: whatsapp-bot })", result: "server dibuat" },
      { label: "Notify", terminal: "sendPrivateMessage(user, result)", result: "credential tidak diposting ke group" }
    ],
    code: `const result = await service.create({
  kind: "whatsapp-bot",
  name: "wa-order",
  email: "user@example.com",
  username: "wa_user",
  password: "auto",
  environment: {
    OWNER_NUMBER: order.phone,
    BOT_NAME: order.botName
  }
});`,
    examples: [
      { title: "Idempotency", code: "const existing = await db.orders.findUnique({ where: { id: orderId } });\nif (existing?.serverId) return existing;\nreturn service.create(payload);" },
      { title: "Audit record", code: "await db.orders.update({ where: { id: orderId }, data: { serverId: result.id, identifier: result.identifier, status: \"created\" } });" }
    ],
    tags: ["whatsapp", "baileys", "bot wa", "payment", "idempotency", "store panel"]
  },
  {
    id: "integrations-discord",
    path: "/docs/integrations/discord-bot",
    group: "Integration",
    title: "Integrasi Bot Discord",
    summary: "Slash command Discord dengan role check, ephemeral reply, dan error handling yang tidak membocorkan secret.",
    beginner: "Credential dan identifier server jangan dikirim ke channel umum. Gunakan ephemeral reply.",
    body: [
      "Discord cocok untuk komunitas hosting dan support. Batasi provisioning dengan role atau permission yang dapat diaudit, lalu gunakan Discord user ID sebagai identity stabil.",
      "Jalankan dryRun pada interaction pertama atau gunakan order idempotency sebelum create. Error dari SDK sebaiknya diubah menjadi pesan ringkas melalui explainError.",
      "Jangan memasukkan token bot, PTLA, PTLC, atau password ke log interaction maupun output channel."
    ],
    steps: [
      { title: "Install dependency", detail: "Pasang discord.js dan gateway.", command: `npm i discord.js ${PACKAGE_NAME}` },
      { title: "Cek role", detail: "Pastikan member memenuhi permission sebelum membuat panel." },
      { title: "Create server", detail: "Pakai integration service atau facade SDK dari backend.", command: "await service.create({ kind: \"discord-bot\", name: \"dc-user\", email: \"user@example.com\", username: \"dc_user\", password: \"auto\" });" },
      { title: "Reply private", detail: "Kembalikan hasil sebagai ephemeral interaction." }
    ],
    simulation: [
      { label: "Slash", terminal: "/panel-create basic", result: "interaction diterima" },
      { label: "Role", terminal: "member.roles.cache.has(roleId)", result: "allowed" },
      { label: "Create", terminal: "service.create({ kind: discord-bot })", result: "server online" },
      { label: "Reply", terminal: "interaction.reply({ ephemeral: true })", result: "credential private" }
    ],
    code: `const result = await service.create({
  kind: "discord-bot",
  name: "dc-user",
  email: "user@example.com",
  username: "dc_user",
  password: "auto"
});

await interaction.reply({
  content: "Server dibuat: " + result.identifier,
  ephemeral: true
});`,
    examples: [
      { title: "Role check", code: "if (!interaction.memberPermissions?.has(\"Administrator\")) {\n  return interaction.reply({ content: \"Khusus admin.\", ephemeral: true });\n}" },
      { title: "Error handling", code: "try { await createDiscordPanel(interaction); } catch (error) { await interaction.reply({ content: explainError(error), ephemeral: true }); }" }
    ],
    tags: ["discord", "discordjs", "slash command", "ephemeral", "permission"]
  },
  {
    id: "website-api",
    path: "/docs/integrations/website-api",
    group: "Integration",
    title: "Integrasi Website dan REST API",
    summary: "Membuat backend preview/create untuk dashboard atau toko panel tanpa mengekspos secret ke browser.",
    beginner: "Frontend hanya mengirim input bisnis ke backend. PTLA, PTLC, dan operasi panel selalu tinggal di server.",
    body: [
      "Dashboard atau toko panel memerlukan backend yang memegang secret, memvalidasi user, memeriksa payment, dan menyimpan audit. React frontend tidak boleh mengimpor package SDK untuk memanggil panel secara langsung.",
      "Endpoint preview mengembalikan hasil dry-run untuk admin atau order service. Endpoint create hanya berjalan setelah authentication, authorization, payment verification, dan idempotency check.",
      "Tambahkan rate limit, schema validation, request size limit, CSRF strategy sesuai arsitektur, serta redaction pada error dan log."
    ],
    steps: [
      { title: "Buat service backend", detail: "Inisialisasi SDK pada Express, Fastify, worker, atau runtime Node.js lain." },
      { title: "Endpoint preview", detail: "Kembalikan payload yang tidak mengubah panel.", command: "app.post(\"/api/panel/preview\", async (req, res) => res.json(await service.dryRun(req.body)));" },
      { title: "Endpoint create", detail: "Cek auth, payment, schema, dan idempotency sebelum mutation.", command: "app.post(\"/api/panel/create\", async (req, res) => res.json(await service.create(req.body)));" },
      { title: "Simpan audit", detail: "Simpan order ID, user ID, server ID, identifier, preset, dan status tanpa secret." }
    ],
    simulation: [
      { label: "Frontend", terminal: "POST /api/panel/preview", result: "payload preview" },
      { label: "Payment", terminal: "POST /api/payment/callback", result: "signature verified · paid" },
      { label: "Backend", terminal: "POST /api/panel/create", result: "server dibuat sekali" },
      { label: "Dashboard", terminal: "GET /api/my-servers", result: "server tampil sesuai user" }
    ],
    code: `app.post("/api/panel/create", async (req, res) => {
  const input = validateCreateInput(req.body);
  const paid = await checkPayment(input.orderId);
  if (!paid) return res.status(403).json({ ok: false, error: "Belum dibayar" });

  const existing = await db.orders.findUnique({ where: { id: input.orderId } });
  if (existing?.serverId) return res.json({ ok: true, result: existing });

  const result = await service.create({
    kind: "website",
    name: input.name,
    email: input.email,
    username: input.username,
    password: "auto"
  });

  await db.orders.update({ where: { id: input.orderId }, data: { serverId: result.id, status: "created" } });
  return res.json({ ok: true, result });
});`,
    examples: [
      { title: "Rate limit", code: "const key = `${req.ip}:${req.body.userId}`;\nif (await tooManyRequests(key)) return res.status(429).json({ error: \"Terlalu banyak request\" });" },
      { title: "Secret redaction", code: "logger.info({ orderId, serverId: result.id, identifier: result.identifier });\nlogger.info({ ptla: \"[redacted]\", ptlc: \"[redacted]\" });" }
    ],
    tags: ["website", "express", "api", "dashboard", "store", "backend", "idempotency"]
  },
  {
    id: "security",
    path: "/docs/security",
    group: "Production",
    title: "Keamanan dan Safe Mode",
    summary: "Guard production untuk credential, mutation, destructive operation, command, payment, dan audit.",
    beginner: "Safe mode aktif secara default. Jadikan pengecualian sebagai keputusan operasional yang terlihat dan terdokumentasi.",
    body: [
      "PTLA dan PTLC adalah credential berkuasa tinggi. Simpan di secret manager atau environment backend, gunakan permission minimal, rotasi setelah testing, dan jangan memasukkannya ke frontend, repository, log, issue, atau AI assistant.",
      "safeMode v1.4.2 meminta konfirmasi eksplisit untuk menghapus Application user, server, dan allocation. Pada facade SDK, konfirmasi diberikan sebagai argumen boolean pada method destruktif; CLI memakai flag konfirmasi yang terlihat.",
      "Safe mode tidak menggantikan authorization. Endpoint tetap membutuhkan auth, rate limit, payment gate bila relevan, audit log, validation, idempotency, dan policy allowlist untuk command."
    ],
    steps: [
      { title: "Aktifkan default aman", detail: "Biarkan safeMode true pada instance production.", command: safeModeSnippet },
      { title: "Preview sebelum mutation", detail: "Gunakan preview atau dryRun untuk provisioning dan perubahan specs." },
      { title: "Konfirmasi destructive", detail: "Berikan true hanya setelah user, server, atau allocation yang benar diverifikasi.", command: "await ptero.application.users.delete(userId, true);\nawait ptero.application.servers.delete(serverId, true);" },
      { title: "Rotasi dan audit", detail: "Catat actor, target, alasan, waktu, dan hasil; jangan catat secret." }
    ],
    simulation: [
      { label: "Default", terminal: "safeMode: true", result: "destructive guard active" },
      { label: "Blocked", terminal: "application.servers.delete(id)", result: "SAFE_MODE_CONFIRMATION_REQUIRED" },
      { label: "Confirm", terminal: "application.servers.delete(id, true)", result: "delete request allowed" },
      { label: "Audit", terminal: "audit.log({ actor, target })", result: "event tercatat tanpa secret" }
    ],
    code: safeModeSnippet,
    examples: [
      { title: "Deletion confirmation", code: "await ptero.application.users.delete(userId, true);\nawait ptero.application.nodes.allocations.delete(nodeId, allocationId, true);\nawait ptero.application.servers.delete(serverId, true);" },
      { title: "Command allowlist", code: "const allowed = new Set([\"node --version\", \"npm --version\"]);\nif (!allowed.has(command)) throw new Error(\"Command tidak diizinkan\");\nawait ptero.server(identifier).command(command);" },
      { title: "Secret-safe response", code: "res.json({ ok: true, serverId: result.id, identifier: result.identifier });" }
    ],
    tags: ["security", "safeMode", "destructive", "confirm", "secret", "audit", "production"]
  },
  {
    id: "email",
    path: "/docs/email",
    group: "Production",
    title: "Backup Email dan SMTP",
    summary: "Menggunakan export backup dan email dengan konfigurasi SMTP eksplisit yang dapat divalidasi.",
    beginner: "Fitur email berjalan pada runtime Node.js dan membutuhkan konfigurasi SMTP lengkap; jangan mengandalkan default tersembunyi.",
    body: [
      "Gateway menyediakan email.send, email.sendToUser, broadcast, exportAndEmailBackup, dan backupAndEmailUserServers. Fitur ini cocok untuk backend job, bukan browser.",
      "SMTP harus memiliki host, port, username, dan password. fromAddress, fromName, encryption, serta rejectUnauthorized dapat disesuaikan. Validasi konfigurasi sebelum job berjalan agar error tidak muncul setelah backup selesai.",
      "Backup yang akan dikirim perlu diperlakukan sebagai data sensitif. Gunakan recipient allowlist, ukuran attachment limit, retention policy, dan hapus file temporary setelah pengiriman."
    ],
    steps: [
      { title: "Siapkan SMTP", detail: "Gunakan secret manager dan konfigurasi eksplisit.", command: "const smtp = { host: process.env.SMTP_HOST, port: 465, username: process.env.SMTP_USER, password: process.env.SMTP_PASSWORD, fromAddress: process.env.SMTP_FROM };" },
      { title: "Kirim email biasa", detail: "Gunakan email.send pada backend.", command: "await ptero.email.send({ to: \"user@example.com\", subject: \"Panel ready\", text: \"Server siap.\", smtp });" },
      { title: "Export backup", detail: "Jalankan setelah backup dan recipient tervalidasi.", command: "await ptero.exportAndEmailBackup(serverId, \"user@example.com\", smtp);" },
      { title: "Monitor job", detail: "Catat status tanpa mencetak SMTP password atau attachment content." }
    ],
    simulation: [
      { label: "Config", terminal: "SMTP_HOST + SMTP_PORT + SMTP_USER + SMTP_PASSWORD", result: "configuration complete" },
      { label: "Backup", terminal: "backups.create()", result: "backup ready" },
      { label: "Download", terminal: "backups.download(id)", result: "temporary buffer ready" },
      { label: "Send", terminal: "email.send(...) ", result: "message accepted" }
    ],
    code: `const smtp = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  username: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  fromAddress: process.env.SMTP_FROM,
  fromName: "Pterodactyl Gateway"
};

await ptero.email.send({
  to: "user@example.com",
  subject: "Panel ready",
  text: "Backup atau detail panel tersedia.",
  smtp
});`,
    examples: [
      { title: "SMTP validation", code: "for (const key of [\"host\", \"port\", \"username\", \"password\"]) {\n  if (!smtp[key]) throw new Error(`SMTP ${key} wajib diisi`);\n}" },
      { title: "Recipient guard", code: "if (!allowedRecipients.has(email)) throw new Error(\"Recipient tidak diizinkan\");\nawait ptero.exportAndEmailBackup(serverId, email, smtp);" }
    ],
    tags: ["smtp", "email", "backup", "exportAndEmailBackup", "node", "secret"]
  },
  {
    id: "release",
    path: "/docs/release",
    group: "Production",
    title: "Quality Gate dan Release",
    summary: "Menjalankan typecheck, source guard, regression test, CLI smoke test, pack, release guard, dan audit.",
    beginner: "Rilis bukan hanya npm publish. Pastikan local quality gate dan GitHub Actions lulus pada semua runtime yang didukung.",
    body: [
      `SDK v${SDK_VERSION} memakai quality gate berlapis. ` + "verify" + " menggabungkan typecheck, source guard, regression test, CLI checks, package smoke test, dan release guard.",
      "CI memvalidasi Node.js 18.x, 20.x, dan 22.x, menjalankan audit dependency runtime, serta membuat artifact package smoke test. Workflow memakai concurrency cancellation dan timeout agar run lama tidak menutupi hasil terbaru.",
      "Sebelum release, pastikan version package, changelog, README, declaration files, dan package contents konsisten. Jangan memasukkan .env, test credential, report mentah yang berisi secret, atau artifact temporer."
    ],
    steps: [
      { title: "Quality gate lokal", detail: "Jalankan command yang sama dengan CI.", command: "npm run ci" },
      { title: "Periksa package", detail: "Pastikan tarball hanya berisi dist dan metadata yang dimaksud.", command: "npm run test:pack\nnpm run test:release" },
      { title: "Review diff", detail: "Periksa source guard, secret scan, README, changelog, dan lockfile." },
      { title: "Monitor CI", detail: "Tunggu seluruh matrix job selesai sebelum menandai release siap." }
    ],
    simulation: [
      { label: "Typecheck", terminal: "npm run typecheck", result: "TypeScript strict: OK" },
      { label: "Regression", terminal: "npm test", result: "29 tests passed" },
      { label: "Pack", terminal: "npm run test:pack", result: "tarball contents verified" },
      { label: "CI", terminal: "Node 18 · 20 · 22", result: "matrix passed" }
    ],
    code: "npm run ci\ngit diff --check\ngit status --short",
    examples: [
      { title: "Release checklist", code: "Version bumped\nCHANGELOG updated\nREADME synchronized\nLocal CI passed\nGitHub Actions passed\nNo credentials in diff" },
      { title: "Runtime matrix", code: "Node.js 18.x\nNode.js 20.x\nNode.js 22.x\nPackage smoke test" }
    ],
    tags: ["release", "ci", "github actions", "quality gate", "npm", "audit", "test"]
  },
  {
    id: "troubleshooting",
    path: "/docs/troubleshooting",
    group: "Production",
    title: "Troubleshooting Error Umum",
    summary: "Memetakan error domain, key, image, allocation, safe mode, file download, retry, dan startup.",
    beginner: "Mulai dari error code dan mode koneksi. Jangan langsung mengulang create server tanpa memeriksa state panel.",
    body: [
      "DOMAIN_REQUIRED berarti domain belum ada atau tidak valid. APPLICATION_KEY_INVALID dan CLIENT_KEY_INVALID berarti key salah, expired, atau permission tidak sesuai. Jalankan doctor untuk melihat mode dan check yang gagal.",
      "DOCKER_IMAGE_NOT_FOUND berarti egg tidak memiliki image yang bisa dipakai. NO_FREE_ALLOCATION berarti node tidak mempunyai allocation yang cocok. Resolver strict juga dapat gagal bila Nest atau Egg tidak ditemukan tanpa default eksplisit.",
      "SAFE_MODE_CONFIRMATION_REQUIRED berarti operasi destruktif belum diberi konfirmasi. Jika files.read mendapatkan HTML, anggap itu error panel atau fallback dan jangan menyimpan HTML sebagai isi file. Untuk POST yang gagal setelah timeout, periksa state sebelum retry manual."
    ],
    steps: [
      { title: "Jalankan explain", detail: "Mulai dari kode error yang terlihat.", command: "ptero-gateway explain DOMAIN_REQUIRED\nptero-gateway explain SAFE_MODE_CONFIRMATION_REQUIRED" },
      { title: "Cek doctor", detail: "Pastikan domain dan key memiliki mode yang diharapkan.", command: "ptero-gateway doctor" },
      { title: "Probe server", detail: "Cek endpoint Client API dan resources.", command: "ptero-gateway probe <identifier>\nptero-gateway server <identifier> resources" },
      { title: "Periksa panel", detail: "Verifikasi node, allocation, egg image, permission, logs Wings, dan state operation di panel." }
    ],
    simulation: [
      { label: "Error", terminal: "SAFE_MODE_CONFIRMATION_REQUIRED", result: "konfirmasi destruktif belum diberikan" },
      { label: "Explain", terminal: "ptero-gateway explain SAFE_MODE_CONFIRMATION_REQUIRED", result: "hint perbaikan muncul" },
      { label: "Config", terminal: "ptero-gateway config doctor", result: "profile aktif" },
      { label: "Probe", terminal: "ptero-gateway probe <identifier>", result: "endpoint client terjangkau" }
    ],
    code: "ptero-gateway explain DOMAIN_REQUIRED\nptero-gateway explain DOCKER_IMAGE_NOT_FOUND\nptero-gateway explain SAFE_MODE_CONFIRMATION_REQUIRED\nptero-gateway doctor\nptero-gateway probe <identifier>",
    examples: [
      { title: "Docker image manual", code: "ptero-gateway admin create-server --name node-app --email user@example.com --node 1 --nest 5 --egg 18 --docker-image ghcr.io/parkervcp/yolks:nodejs_22 --dry-run" },
      { title: "State after timeout", code: "const before = await ptero.server(identifier).resources();\nconst result = await ptero.server(identifier).resources();\nif (before.current_state !== result.current_state) await auditStateChange();" },
      { title: "File type guard", code: "const response = await server.files.read(\"/index.js\");\nif (response.trimStart().startsWith(\"<!doctype html\")) throw new Error(\"Panel returned HTML fallback\");" }
    ],
    tags: ["troubleshooting", "error", "domain required", "docker image", "allocation", "safe mode", "retry"]
  },
  {
    id: "privacy",
    path: "/privacy",
    group: "Legal",
    title: "Privacy Policy",
    summary: "Kebijakan privasi untuk situs dokumentasi, pencarian lokal, dan AI assistant.",
    beginner: "Situs docs tidak meminta login panel dan tidak membutuhkan PTLA atau PTLC di browser.",
    body: [
      "Website menyediakan dokumentasi, search lokal, dan AI assistant. Search lokal berjalan di browser. Pertanyaan yang dikirim ke assistant dapat diteruskan ke endpoint AI serverless untuk menghasilkan jawaban.",
      "Jangan memasukkan API key, password, token bot, credential panel, data pembayaran, atau data pribadi sensitif ke kolom AI. Gunakan placeholder saat meminta bantuan.",
      "Deployment hosting dapat memiliki log request standar sesuai kebijakan platform. Pengelola perlu meninjau retention, akses log, analytics, dan provider AI sebelum production."
    ],
    steps: [
      { title: "Data yang diproses", detail: "Pertanyaan AI dan konteks dokumentasi dapat dikirim ke backend /api/ai." },
      { title: "Data yang tidak diminta", detail: "Website tidak meminta PTLA, PTLC, password panel, atau token bot." },
      { title: "Gunakan placeholder", detail: "Sensor semua secret sebelum menulis pertanyaan atau issue." }
    ],
    simulation: [
      { label: "Search", terminal: "ketik telegram", result: "filter lokal browser" },
      { label: "AI", terminal: "tanya cara install", result: "query masuk ke /api/ai" },
      { label: "Sanitize", terminal: "redact secrets", result: "credential tidak diteruskan" },
      { label: "Response", terminal: "data.response.answer", result: "hanya jawaban ditampilkan" }
    ],
    code: "Jangan kirim credential asli ke AI. Gunakan placeholder:\nPTERO_DOMAIN=https://panel.example.com\nPTERO_PTLA=ptla_***\nPTERO_PTLC=ptlc_***",
    examples: [
      { title: "Prompt aman", code: "Saya mendapat DOMAIN_REQUIRED. Value environment sudah disensor. Apa yang perlu dicek?" },
      { title: "Search lokal", code: "Search docs dilakukan di browser dan tidak membutuhkan API key panel." }
    ],
    tags: ["privacy", "privasi", "legal", "ai", "credential"]
  },
  {
    id: "terms",
    path: "/terms",
    group: "Legal",
    title: "Terms and Conditions",
    summary: "Syarat penggunaan situs dokumentasi dan package gateway secara bertanggung jawab.",
    beginner: "Gunakan gateway hanya pada panel dan resource yang memang Anda miliki atau berwenang kelola.",
    body: [
      "Dokumentasi ini membantu penggunaan Akadev Pterodactyl Gateway. Package ini bukan package resmi dari Pterodactyl dan tidak berafiliasi dengan Pterodactyl Software.",
      "Pengguna bertanggung jawab atas API key, server, resource, automation, payment, data user, dan aturan hosting yang dijalankan melalui SDK atau CLI.",
      "Contoh kode disediakan sebagai referensi. Sesuaikan authentication, authorization, validation, payment, rate limit, audit, retention, dan recovery sebelum production."
    ],
    steps: [
      { title: "Gunakan versi stabil", detail: `Install ${PACKAGE_NAME}@${SDK_VERSION} atau versi kompatibel yang telah diuji.` },
      { title: "Validasi sebelum production", detail: "Uji dry-run, doctor, cleanup, retry safety, dan destructive confirmation." },
      { title: "Patuhi aturan provider", detail: "Jangan gunakan automation untuk aktivitas yang melanggar ToS panel atau hosting." }
    ],
    simulation: [
      { label: "Install", terminal: `npm i ${PACKAGE_NAME}@${SDK_VERSION}`, result: "versi stabil dipilih" },
      { label: "Test", terminal: "ptero-gateway doctor", result: "koneksi tervalidasi" },
      { label: "Review", terminal: "npm run ci", result: "quality gate lulus" },
      { label: "Deploy", terminal: "production rollout", result: "dengan auth + audit log" }
    ],
    code: `npm i ${PACKAGE_NAME}@${SDK_VERSION}
ptero-gateway doctor
npm run ci`,
    examples: [
      { title: "Checklist production", code: "Auth admin/payment aktif\nRate limit aktif\nCredential tidak di frontend\nAudit log tersimpan\nSafe mode aktif\nDry-run paket baru\nCI lulus" }
    ],
    tags: ["terms", "syarat", "legal", "npm stable", "responsibility"]
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
