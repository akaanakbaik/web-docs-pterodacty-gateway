import express from "express";
import { AI_SYSTEM_PROMPT } from "../src/data/aiPrompt.js";

const app = express();
app.use(express.json({ limit: "90kb" }));

const MAX_QUESTION_LENGTH = 1500;
const MAX_CONTEXT_LENGTH = 6000;
const MAX_PROMPT_LENGTH = 3900;
const MAX_SYSTEM_LENGTH = 1200;
const PROVIDER_TIMEOUT_MS = 12000;
const PROVIDER_ATTEMPTS = 2;
const TEMPERATURE = 0.7;
const SIPUTZX_ENDPOINT = "https://api.siputzx.my.id/api/ai/gptoss120b";
const PROVIDER_NAME = "siputzx-gpt-oss-120b";
const FALLBACK_MESSAGE = "AI assistant sedang tidak tersedia sebentar. Kamu tetap bisa memakai search lokal, halaman install, SDK, dan troubleshooting di docs ini.";

type JsonObject = Record<string, unknown>;
type ProviderAttempt = { attempt: number; status: number; ok: boolean };
type ProviderResult = { ok: boolean; answer: string; status: number };
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

function pickAnswer(payload: unknown) {
  if (typeof payload === "string") return firstText(payload);
  const root = asObject(payload);
  if (root.status === false || Number(root.statusCode) >= 400) return "";
  const data = asObject(root.data);
  const nested = asObject(data.response);
  const plainData = typeof root.data === "string" ? root.data : "";
  return firstText(data.response, nested.response, data.answer, data.message, plainData, root.response, root.answer, root.result, root.message);
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

export function buildSiputzxPrompt(question: string, context: string) {
  const intro = "Konteks dokumentasi Pterodactyl Gateway:";
  const closing = "Jawab dengan ringkas, jelas, dan langsung ke solusi. Sertakan command siap pakai bila relevan.";
  const questionBlock = `Pertanyaan user:\n${cleanText(question).slice(0, MAX_QUESTION_LENGTH)}`;
  const available = Math.max(0, MAX_PROMPT_LENGTH - intro.length - closing.length - questionBlock.length - 8);
  return `${intro}\n${cleanText(context).slice(0, available)}\n\n${questionBlock}\n\n${closing}`;
}

export function buildSiputzxSystem() {
  return cleanText(AI_SYSTEM_PROMPT).slice(0, MAX_SYSTEM_LENGTH);
}

async function callSiputzx(prompt: string, system: string, fetchImpl: FetchLike): Promise<ProviderResult> {
  const params = new URLSearchParams({ prompt, system, temperature: String(TEMPERATURE) });
  const response = await fetchImpl(`${SIPUTZX_ENDPOINT}?${params.toString()}`, {
    method: "GET",
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
  });
  const payload = await readPayload(response);
  return { ok: response.ok, status: response.status, answer: pickAnswer(payload) };
}

export async function askWithSiputzx(question: string, context: string, fetchImpl: FetchLike = fetch) {
  const prompt = buildSiputzxPrompt(question, context);
  const system = buildSiputzxSystem();
  const attempts: ProviderAttempt[] = [];
  for (let attempt = 1; attempt <= PROVIDER_ATTEMPTS; attempt += 1) {
    try {
      const result = await callSiputzx(prompt, system, fetchImpl);
      attempts.push({ attempt, status: result.status, ok: result.ok && Boolean(result.answer) });
      if (result.ok && result.answer) return { ok: true, answer: result.answer, provider: PROVIDER_NAME, attempts };
    } catch {
      attempts.push({ attempt, status: 0, ok: false });
    }
  }
  return { ok: false, answer: FALLBACK_MESSAGE, provider: null, attempts };
}

function normalizeRequest(body: unknown) {
  const input = asObject(body);
  const question = cleanText(input.question);
  const context = cleanText(input.context).slice(0, MAX_CONTEXT_LENGTH);
  if (!question) return { status: 400, question, context, answer: "Pertanyaan wajib diisi." };
  if (question.length > MAX_QUESTION_LENGTH) return { status: 413, question, context, answer: `Pertanyaan terlalu panjang. Maksimal ${MAX_QUESTION_LENGTH} karakter.` };
  return { status: 200, question, context, answer: "" };
}

export const __testing = {
  AI_SYSTEM_PROMPT,
  SIPUTZX_ENDPOINT,
  PROVIDER_NAME,
  MAX_CONTEXT_LENGTH,
  MAX_PROMPT_LENGTH,
  buildSiputzxPrompt,
  buildSiputzxSystem,
  pickAnswer,
  askWithSiputzx,
  normalizeRequest
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "pterodactyl-gateway-docs", aiProvider: PROVIDER_NAME, model: "gpt-oss-120b" });
});

app.post("/api/ai", async (req, res) => {
  const request = normalizeRequest(req.body);
  if (request.status !== 200) {
    res.status(request.status).json({ ok: false, answer: request.answer });
    return;
  }
  const result = await askWithSiputzx(request.question, request.context);
  res.status(result.ok ? 200 : 503).json({ ok: result.ok, answer: result.answer, provider: result.provider, attempts: result.attempts });
});

export default app;
