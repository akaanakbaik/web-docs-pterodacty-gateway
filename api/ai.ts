import express from "express";

const app = express();
app.use(express.json({ limit: "180kb" }));

const PRIMARY_AI_ENDPOINT = "https://xters.us.kg/api/ai/perplexity";
const FALLBACK_AI_ENDPOINT = "https://www.kitsulabs.xyz/api/v1/perplexity";
const FALLBACK_API_KEY = process.env.KITSU_API_KEY || "";

type JsonObject = Record<string, unknown>;
type ProviderResult = { ok: boolean; answer: string; status: number };

function cleanText(value: unknown) {
  return String(value ?? "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function asObject(value: unknown): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as JsonObject;
}

function pickPrimaryAnswer(payload: JsonObject) {
  const data = asObject(payload.data);
  const response = asObject(data.response);
  return cleanText(response.answer);
}

function pickFallbackAnswer(payload: JsonObject) {
  return cleanText(payload.answer);
}

function createPrompt(question: string, context: string) {
  return [
    "Kamu adalah Akadev Pterodactyl Gateway Docs Assistant.",
    "Identitas produk: Akadev Pterodactyl Gateway adalah package npm stabil @akaanakbaik/pterodactyl-gateway versi 1.0.2 untuk SDK TypeScript ESM, CLI, wizard, config profile, integration helper, bot WhatsApp, bot Telegram, bot Discord, website/API, file manager, backups, schedules, resources, server power, security guard, troubleshooting, dan deployment.",
    "URL penting: Web Docs https://web-docs-pterodacty-gateway.vercel.app, GitHub https://github.com/akaanakbaik/pterodactyl-gateway, npm https://www.npmjs.com/package/@akaanakbaik/pterodactyl-gateway.",
    "Jawab hanya seputar Akadev Pterodactyl Gateway dan ekosistem Pterodactyl Panel yang relevan.",
    "Gunakan bahasa Indonesia yang profesional, jelas, padat, dan mudah dipahami pemula.",
    "Jika memberi command terminal, WAJIB taruh dalam fenced code block ```bash ... ```.",
    "Jika memberi kode JavaScript/TypeScript, WAJIB taruh dalam fenced code block ```ts ... ``` atau ```js ... ```.",
    "Jika memberi JSON/env/config, WAJIB taruh dalam fenced code block sesuai jenisnya.",
    "Jangan menulis command panjang di paragraf biasa. Command harus di code block agar UI bisa membuat kotak salin otomatis.",
    "Berikan langkah praktis dan troubleshooting yang bisa langsung dicoba.",
    "Jangan mengarang fitur yang tidak ada di context.",
    "Jangan meminta atau menampilkan credential asli. Jika user menulis credential, sarankan sensor token/API key/password.",
    "Jika pertanyaan tentang node/location/allocation management, jelaskan bahwa CLI stabil tidak membuka command sensitif tersebut; gunakan panel admin atau ptero-gateway ids untuk memilih ID manual.",
    "Utamakan install dari npm karena versi npm adalah versi stabil untuk user.",
    "",
    "Context dokumentasi lokal:",
    context.slice(0, 13000),
    "",
    "Pertanyaan user:",
    question,
    "",
    "Jawaban:"
  ].join("\n");
}

async function readUpstreamJson(response: Response): Promise<JsonObject> {
  const value: unknown = await response.json().catch(() => ({}));
  return asObject(value);
}

async function callPrimary(prompt: string): Promise<ProviderResult> {
  const url = `${PRIMARY_AI_ENDPOINT}?query=${encodeURIComponent(prompt)}`;
  const upstream = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(15000)
  });
  const data = await readUpstreamJson(upstream);
  return { ok: upstream.ok, status: upstream.status, answer: pickPrimaryAnswer(data) };
}

async function callFallback(prompt: string): Promise<ProviderResult> {
  const url = `${FALLBACK_AI_ENDPOINT}?query=${encodeURIComponent(prompt)}`;
  const headers: Record<string, string> = { accept: "application/json" };
  if (FALLBACK_API_KEY) headers["x-api-key"] = FALLBACK_API_KEY;
  const upstream = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(22000)
  });
  const data = await readUpstreamJson(upstream);
  return { ok: upstream.ok, status: upstream.status, answer: pickFallbackAnswer(data) };
}

async function askWithFallback(prompt: string) {
  try {
    const primary = await callPrimary(prompt);
    if (primary.ok && primary.answer) return primary.answer;
  } catch {
    // silent fallback
  }

  try {
    const fallback = await callFallback(prompt);
    if (fallback.ok && fallback.answer) return fallback.answer;
  } catch {
    // handled below
  }

  return "AI assistant sedang tidak tersedia. Kamu tetap bisa memakai search lokal dan dokumentasi di halaman ini.";
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "pterodactyl-gateway-docs" });
});

app.post("/api/ai", async (req, res) => {
  const question = cleanText(req.body?.question);
  const context = cleanText(req.body?.context);

  if (!question) {
    res.status(400).json({ ok: false, answer: "Pertanyaan wajib diisi." });
    return;
  }

  const prompt = createPrompt(question, context);
  const answer = await askWithFallback(prompt);
  res.status(200).json({ ok: true, answer });
});

export default app;
