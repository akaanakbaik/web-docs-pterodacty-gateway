import express, { type ErrorRequestHandler } from "express";
import { docs } from "../src/data/docs.js";
import { AI_SYSTEM_PROMPT, buildAiPrompt } from "../src/data/aiPrompt.js";

const app = express();
app.disable("x-powered-by");
app.set("query parser", "simple");
app.use((_req, res, next) => { res.set("Cache-Control", "no-store"); res.set("X-Content-Type-Options", "nosniff"); next(); });
app.use(express.json({ limit: "90kb" }));

const MAX_QUESTION_LENGTH = 1500;
const MAX_CONTEXT_LENGTH = 64000;
const PROVIDER_TIMEOUT_MS = 8000;
const CUKI_API_KEY = process.env.CUKI_API_KEY || "";
const FALLBACK_MESSAGE = "AI assistant sedang tidak tersedia sebentar. Kamu tetap bisa memakai search lokal, halaman install, SDK, dan troubleshooting di docs ini.";

type JsonObject = Record<string, unknown>;
type ProviderName = "izuka-gemmy" | "cuki-deepseek" | "prexzy-mistral";
type ProviderResult = { ok: boolean; answer: string; status: number; provider: ProviderName };
type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function asObject(value: unknown): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as JsonObject;
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const text = typeof value === "string" ? cleanText(value) : "";
    if (text && !/^\s*</.test(text) && !/^\s*["']?undefined["']?\s+is not valid json\s*$/i.test(text) && !/^\s*(error|exception|internal server error)\s*$/i.test(text)) return text;
  }
  return "";
}

function pickAnswer(provider: ProviderName, payload: unknown) {
  if (typeof payload === "string") return firstText(payload);
  const root = asObject(payload);
  const data = asObject(root.data);
  const response = asObject(data.response);
  const choices = Array.isArray(root.choices) ? root.choices : [];
  const firstChoice = asObject(choices[0]);
  const message = asObject(firstChoice.message);
  if (root.status === false || root.success === false || root.error || Number(root.statusCode) >= 400) return "";
  if (provider === "izuka-gemmy") return firstText(root.result, root.answer, root.response, root.message, data.result, data.answer);
  if (provider === "cuki-deepseek") return firstText(response.answer, data.response, data.answer, data.result, root.answer, root.result, root.response, message.content);
  return firstText(root.response, root.answer, root.result, root.message, message.content, data.response, data.answer);
}

async function readPayload(response: Response): Promise<unknown> {
  const reader = response.body?.getReader();
  if (!reader) return {};
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 128000) { await reader.cancel(); throw new Error("Response too large"); }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally { reader.releaseLock(); }
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function callIzuka(prompt: string, fetchImpl: FetchLike): Promise<ProviderResult> {
  const form = new FormData();
  form.set("prompt", prompt);
  form.set("media", "");
  const response = await fetchImpl("https://my.izuka-api.xyz/api/ai/gemmy-chat", {
    method: "POST",
    headers: { accept: "application/json" },
    body: form,
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
  });
  const payload = await readPayload(response);
  return { ok: response.ok, status: response.status, answer: pickAnswer("izuka-gemmy", payload), provider: "izuka-gemmy" };
}

async function callCuki(prompt: string, fetchImpl: FetchLike, apiKey: string): Promise<ProviderResult> {
  const params = new URLSearchParams({ apikey: apiKey, question: prompt });
  const response = await fetchImpl(`https://api.cuki.biz.id/api/ai/deepseek?${params.toString()}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(20000)
  });
  const payload = await readPayload(response);
  return { ok: response.ok, status: response.status, answer: pickAnswer("cuki-deepseek", payload), provider: "cuki-deepseek" };
}

async function callPrexzy(prompt: string, fetchImpl: FetchLike): Promise<ProviderResult> {
  const params = new URLSearchParams({ prompt });
  const response = await fetchImpl(`https://prexzyapis.com/ai/mistral?${params.toString()}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
  });
  const payload = await readPayload(response);
  return { ok: response.ok, status: response.status, answer: pickAnswer("prexzy-mistral", payload), provider: "prexzy-mistral" };
}

export async function askWithFailover(question: string, context: string, fetchImpl: FetchLike = fetch, cukiApiKey = CUKI_API_KEY) {
  const prompt = buildAiPrompt(redactSecrets(question), redactSecrets(context), 4000);
  const providers: Array<{ name: ProviderName; call: () => Promise<ProviderResult> }> = [
    ...(cukiApiKey ? [{ name: "cuki-deepseek" as const, call: () => callCuki(prompt, fetchImpl, cukiApiKey) }] : []),
    { name: "izuka-gemmy", call: () => callIzuka(prompt, fetchImpl) },
    { name: "prexzy-mistral", call: () => callPrexzy(prompt, fetchImpl) }
  ];
  const attempts: Array<{ provider: ProviderName; status: number; ok: boolean }> = [];
  for (const provider of providers) {
    try {
      const result = await provider.call();
      attempts.push({ provider: provider.name, status: result.status, ok: result.ok && Boolean(result.answer) });
      if (result.ok && result.answer) return { answer: result.answer, provider: result.provider, attempts };
    } catch {
      attempts.push({ provider: provider.name, status: 0, ok: false });
    }
  }
  return { answer: FALLBACK_MESSAGE, provider: null, attempts };
}

export function redactSecrets(text: string) {
  return text.replace(/\b(?:ptla_|ptlc_|ghp_|github_pat_)[A-Za-z0-9_]+/g, "[REDACTED]").replace(/(Bearer\s+)[^\s]+/gi, "$1[REDACTED]");
}

export function selectContext(question: string) {
  const terms = question.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((term) => term.length > 2);
  return docs.map((doc) => ({ doc, score: terms.reduce((score, term) => score + ([doc.title, ...doc.tags].join(" ").toLowerCase().includes(term) ? 10 : 0) + (JSON.stringify(doc).toLowerCase().includes(term) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score).slice(0, 3)
    .map(({ doc }) => `${doc.path} — ${doc.title}\n${doc.summary}\n${doc.body.join("\n")}\n${doc.code ?? ""}`).join("\n\n");
}

function normalizeRequest(body: unknown) {
  const input = asObject(body);
  const question = typeof input.question === "string" ? cleanText(input.question) : "";
  const context = typeof input.context === "string" ? cleanText(input.context).slice(0, MAX_CONTEXT_LENGTH) : "";
  if (!question) return { status: 400, question, context, answer: "Pertanyaan wajib diisi." };
  if (question.length > MAX_QUESTION_LENGTH) return { status: 413, question, context, answer: `Pertanyaan terlalu panjang. Maksimal ${MAX_QUESTION_LENGTH} karakter.` };
  return { status: 200, question, context, answer: "" };
}

export const __testing = { AI_SYSTEM_PROMPT, buildAiPrompt, pickAnswer, askWithFailover, normalizeRequest };

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "pterodactyl-gateway-docs", aiFailover: [...(CUKI_API_KEY ? ["cuki-deepseek"] : []), "izuka-gemmy", "prexzy-mistral"] });
});

let activeRequests = 0;
app.post("/api/ai", async (req, res) => {
  const request = normalizeRequest(req.body);
  if (request.status !== 200) {
    res.status(request.status).json({ ok: false, answer: request.answer });
    return;
  }
  if (activeRequests >= 8) {
    res.set("Retry-After", "10").status(429).json({ ok: false, answer: "AI sedang sibuk. Coba lagi sebentar." });
    return;
  }
  activeRequests++;
  try {
    const result = await askWithFailover(request.question, selectContext(request.question));
    res.status(result.provider ? 200 : 503).json({ ok: Boolean(result.provider), answer: result.answer, provider: result.provider });
  } finally { activeRequests--; }
});

app.all("/api/ai", (_req, res) => { res.set("Allow", "POST").status(405).json({ ok: false, answer: "Gunakan POST dengan body JSON." }); });

const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = error?.type === "entity.too.large" ? 413 : error instanceof SyntaxError ? 400 : 500;
  res.status(status).json({ ok: false, answer: status === 413 ? "Body request terlalu besar." : status === 400 ? "Body JSON tidak valid." : "AI sedang tidak tersedia." });
};
app.use(handleError);

export default app;
