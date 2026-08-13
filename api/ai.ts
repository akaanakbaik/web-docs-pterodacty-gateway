import express from "express";
import { AI_SYSTEM_PROMPT, buildAiPrompt } from "../src/data/aiPrompt.ts";

const app = express();
app.use(express.json({ limit: "90kb" }));

const MAX_QUESTION_LENGTH = 1500;
const MAX_CONTEXT_LENGTH = 32000;
const PROVIDER_TIMEOUT_MS = 9000;
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
    const text = cleanText(value);
    if (text && !/^\s*["']?undefined["']?\s+is not valid json\s*$/i.test(text) && !/^\s*(error|exception|internal server error)\b/i.test(text)) return text;
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
  if (root.status === false || Number(root.statusCode) >= 400) return "";
  if (provider === "izuka-gemmy") return firstText(root.result, root.answer, root.response, root.message, data.result, data.answer);
  if (provider === "cuki-deepseek") return firstText(response.answer, data.response, root.answer, root.result, root.message);
  return firstText(root.response, root.answer, root.result, root.message, message.content, data.response, data.answer);
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();
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
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
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
  const prompt = buildAiPrompt(question, context);
  const providers: Array<{ name: ProviderName; call: () => Promise<ProviderResult> }> = [
    { name: "izuka-gemmy", call: () => callIzuka(prompt, fetchImpl) },
    ...(cukiApiKey ? [{ name: "cuki-deepseek" as const, call: () => callCuki(prompt, fetchImpl, cukiApiKey) }] : []),
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

export const __testing = { AI_SYSTEM_PROMPT, buildAiPrompt, pickAnswer, askWithFailover };

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "pterodactyl-gateway-docs", aiFailover: ["izuka-gemmy", "cuki-deepseek", "prexzy-mistral"] });
});

app.post("/api/ai", async (req, res) => {
  const question = cleanText(req.body?.question);
  const context = cleanText(req.body?.context);
  if (!question) {
    res.status(400).json({ ok: false, answer: "Pertanyaan wajib diisi." });
    return;
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    res.status(413).json({ ok: false, answer: `Pertanyaan terlalu panjang. Maksimal ${MAX_QUESTION_LENGTH} karakter.` });
    return;
  }
  if (context.length > MAX_CONTEXT_LENGTH) {
    res.status(413).json({ ok: false, answer: "Context dokumentasi terlalu besar. Muat ulang halaman lalu coba lagi." });
    return;
  }
  const result = await askWithFailover(question, context);
  res.status(200).json({ ok: true, answer: result.answer });
});

export default app;
