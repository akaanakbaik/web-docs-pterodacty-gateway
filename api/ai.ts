import express from "express";

const app = express();
app.use(express.json({ limit: "90kb" }));

const PRIMARY_AI_ENDPOINT = "https://xters.us.kg/api/ai/perplexity";
const FALLBACK_AI_ENDPOINT = "https://www.kitsulabs.xyz/api/v1/perplexity";
const FALLBACK_API_KEY = process.env.KITSU_API_KEY || "";

type JsonObject = Record<string, unknown>;
type ProviderResult = { ok: boolean; answer: string; status: number };

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function compactText(value: string, max = 5200) {
  return cleanText(value).slice(0, max);
}

function asObject(value: unknown): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as JsonObject;
}

function pickPrimaryAnswer(payload: JsonObject) {
  const data = asObject(payload.data);
  const response = asObject(data.response);
  const choices = Array.isArray(payload.choices) ? payload.choices : [];
  const first = asObject(choices[0]);
  const msg = asObject(first.message);
  return cleanText(msg.content || response.answer || data.answer || payload.answer || payload.result || payload.message);
}

function pickFallbackAnswer(payload: JsonObject) {
  const data = asObject(payload.data);
  const response = asObject(data.response);
  return cleanText(payload.answer || response.answer || data.answer || payload.result || payload.message);
}

function createPrompt(question: string, context: string) {
  return [
    "Kamu adalah AI docs assistant untuk Akadev Pterodactyl Gateway.",
    "Produk: @akaanakbaik/pterodactyl-gateway v1.0.2, SDK TypeScript ESM + CLI + wizard untuk Pterodactyl Panel.",
    "URL: Web Docs https://web-docs-pterodacty-gateway.vercel.app | GitHub https://github.com/akaanakbaik/pterodactyl-gateway | npm https://www.npmjs.com/package/@akaanakbaik/pterodactyl-gateway",
    "Jawab bahasa Indonesia, singkat, jelas, praktis, dan khusus seputar gateway/Pterodactyl.",
    "Jika memberi command terminal, tulis dalam fenced code block ```bash ... ```.",
    "Jika memberi kode TypeScript/JavaScript/JSON/env, tulis dalam fenced code block sesuai jenisnya.",
    "Jangan taruh command di paragraf biasa. Jangan sebut nama provider/model/API.",
    "Jangan meminta atau membuka credential asli; minta user sensor token/password/API key.",
    "Fitur sensitif node/location/allocation tidak tersedia di CLI stabil; gunakan panel admin atau ptero-gateway ids untuk pilih ID manual.",
    "Context ringkas:",
    compactText(context),
    "Pertanyaan:",
    compactText(question, 1500),
    "Jawaban:"
  ].join("\n");
}

async function readUpstreamJson(response: Response): Promise<JsonObject> {
  const value: unknown = await response.json().catch(() => ({}));
  return asObject(value);
}

async function callPrimary(prompt: string): Promise<ProviderResult> {
  const query = encodeURIComponent(prompt.slice(0, 6500));
  const upstream = await fetch(`${PRIMARY_AI_ENDPOINT}?query=${query}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(15000)
  });
  const data = await readUpstreamJson(upstream);
  return { ok: upstream.ok, status: upstream.status, answer: pickPrimaryAnswer(data) };
}

async function callFallback(prompt: string): Promise<ProviderResult> {
  const query = encodeURIComponent(prompt.slice(0, 6500));
  const headers: Record<string, string> = { accept: "application/json" };
  if (FALLBACK_API_KEY) headers["x-api-key"] = FALLBACK_API_KEY;
  const upstream = await fetch(`${FALLBACK_AI_ENDPOINT}?query=${query}`, {
    headers,
    signal: AbortSignal.timeout(18000)
  });
  const data = await readUpstreamJson(upstream);
  return { ok: upstream.ok, status: upstream.status, answer: pickFallbackAnswer(data) };
}

async function askWithFallback(prompt: string) {
  const fallbackText = "AI assistant sedang tidak tersedia sebentar. Kamu tetap bisa memakai search lokal, halaman install, SDK, dan troubleshooting di docs ini.";

  try {
    const primary = await callPrimary(prompt);
    if (primary.ok && primary.answer) return primary.answer;
    if (primary.answer) return primary.answer;
  } catch {
    // silent fallback
  }

  try {
    const fallback = await callFallback(prompt);
    if (fallback.ok && fallback.answer) return fallback.answer;
    if (fallback.answer) return fallback.answer;
  } catch {
    // handled below
  }

  return fallbackText;
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
