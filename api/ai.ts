import express from "express";
import { AI_SYSTEM_PROMPT } from "../src/data/aiPrompt.js";
import { DOCS_URL, docs } from "../src/data/docs.js";

const app = express();
app.use(express.json({ limit: "90kb" }));

const MAX_QUESTION_LENGTH = 1500;
const MAX_CONTEXT_LENGTH = 6000;
const MAX_PROMPT_LENGTH = 3900;
const MAX_SYSTEM_LENGTH = 1700;
const PROVIDER_TIMEOUT_MS = 4000;
const PROVIDER_ATTEMPTS = 3;
const PROVIDER_DEADLINE_MS = 8000;
const MIN_ANSWER_LENGTH = 12;
const TEMPERATURE = 0.7;
const SIPUTZX_ENDPOINT = "https://api.siputzx.my.id/api/ai/gptoss120b";
const PROVIDER_NAME = "siputzx-gpt-oss-120b";
const FALLBACK_MESSAGE = "Penyedia AI sedang tidak tersedia. Berikut ringkasan dari dokumentasi lokal yang paling relevan. Coba lagi nanti, atau gunakan pencarian lokal.";

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

export function sanitizeAnswer(value: string) {
  let text = cleanText(value).replace(/<\|[^|]*\|>/g, "");
  const final = text.match(/(?:assistant\s*)?final\s*:\s*([\s\S]+)$/i);
  if (final) text = final[1];
  text = cleanText(text).replace(/^(?:assistant\s*)?final\s*:\s*/i, "").trim();
  if ((text.match(/```/g) ?? []).length % 2 === 1) text = `${text}\n\`\`\``;
  return text;
}

const STOPWORDS = new Set(["apa", "apakah", "itu", "ini", "dan", "yang", "untuk", "dengan", "dari", "pada", "atau", "akan", "tidak", "sudah", "belum", "saya", "bisa", "cara", "bagaimana", "kenapa", "mengapa", "adalah", "juga", "agar", "dalam", "ke", "di", "the", "dan", "pterodactyl", "pterodacty", "gateway", "akadev", "docs", "dokumentasi"]);

function fallbackTerms(question: string) {
  return [...new Set(question.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).flatMap((word) => {
    if (word.length < 3 && !/\d/.test(word)) return [];
    if (STOPWORDS.has(word)) return [];
    const stem = word.replace(/^(meng|meny|mem|men|di|ter)/, "");
    return stem.length >= 3 && stem !== word ? [word, stem] : [word];
  }))];
}

function buildDocsFallback(question: string) {
  const terms = fallbackTerms(question);
  let best = docs[0];
  let bestScore = 0;
  for (const doc of docs) {
    const title = doc.title.toLowerCase();
    const tags = doc.tags.join(" ").toLowerCase();
    const text = `${doc.summary} ${doc.beginner} ${doc.body.join(" ")} ${doc.steps.map((step) => `${step.title} ${step.detail} ${step.command ?? ""}`).join(" ")}`.toLowerCase();
    const score = terms.reduce((sum, term) => sum + (title.includes(term) ? 5 : 0) + (tags.includes(term) ? 3 : 0) + (text.includes(term) ? 1 : 0), 0);
    if (score > bestScore) {
      best = doc;
      bestScore = score;
    }
  }
  if (bestScore < 2) {
    return `${FALLBACK_MESSAGE}\n\nHalaman yang bisa dibuka:\n${docs.slice(0, 3).map((doc) => `- ${doc.title}: ${DOCS_URL}${doc.path}`).join("\n")}`;
  }
  const steps = best.steps.slice(0, 3).map((step, index) => `${index + 1}. ${step.title}: ${step.detail}${step.command ? ` Command: \`${step.command.split("\n")[0]}\`` : ""}`).join("\n");
  return `Jawaban dari dokumentasi resmi:\n\n${best.beginner}\n\n${best.body.slice(0, 2).join("\n\n")}\n\n${steps}\n\nBaca lengkap: ${DOCS_URL}${best.path}`;
}

const SEARCH_ONLY_PATTERN = /^\s*(?:search|look up|find|read|open|visit|check)\b[^.\n]{0,120}\b(?:documentation|docs|guide|manual)\b/i;

function isSearchOnlyAnswer(answer: string) {
  return SEARCH_ONLY_PATTERN.test(sanitizeAnswer(answer));
}

function isUsableAnswer(answer: string) {
  const text = sanitizeAnswer(answer);
  if (text.length < MIN_ANSWER_LENGTH) return false;
  if (/^[\s.]*(?:assistant\s*)?(analysis|reasoning|thinking|thought process)\b/i.test(text)) return false;
  if (/\b(oops|i mistakenly|let'?s craft|need to produce|final answer properly|assistant(?:final|analysis))\b/i.test(text)) return false;
  if (/\b(saya akan mencari|mencari informasi|i will search|let me (?:search|check)|berikut adalah informasi)\b/i.test(text)) return false;
  if (SEARCH_ONLY_PATTERN.test(text)) return false;
  if (/(\b[\w@]+\b)(?:\s+\1){3,}/i.test(text)) return false;
  if (/```[a-z]*\s*```/i.test(text)) return false;
  const scopes = [...text.matchAll(/@([a-z0-9_-]+)\/pterodactyl-gateway/gi)].map((match) => match[1].toLowerCase());
  if (scopes.some((scope) => scope !== "akaanakbaik")) return false;
  if (!/[.!?`)\]}]$/.test(text)) return false;
  const words = text.split(/\s+/).filter((word) => /[A-Za-z0-9]/.test(word));
  return words.length >= 2 || text.length >= 24;
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

async function callSiputzx(prompt: string, system: string, fetchImpl: FetchLike, timeoutMs = PROVIDER_TIMEOUT_MS): Promise<ProviderResult> {
  const params = new URLSearchParams({ prompt, system, temperature: String(TEMPERATURE) });
  const response = await fetchImpl(`${SIPUTZX_ENDPOINT}?${params.toString()}`, {
    method: "GET",
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs)
  });
  const payload = await readPayload(response);
  return { ok: response.ok, status: response.status, answer: pickAnswer(payload) };
}

export async function askWithSiputzx(question: string, context: string, fetchImpl: FetchLike = fetch) {
  const prompt = buildSiputzxPrompt(question, context);
  const system = buildSiputzxSystem();
  const attempts: ProviderAttempt[] = [];
  const startedAt = Date.now();
  for (let attempt = 1; attempt <= PROVIDER_ATTEMPTS; attempt += 1) {
    const remaining = PROVIDER_DEADLINE_MS - (Date.now() - startedAt);
    if (remaining < 1500) break;
    try {
      const result = await callSiputzx(prompt, system, fetchImpl, Math.min(PROVIDER_TIMEOUT_MS, remaining));
      const answer = sanitizeAnswer(result.answer);
      const usable = result.ok && isUsableAnswer(answer);
      attempts.push({ attempt, status: result.status, ok: usable });
      if (usable) return { ok: true, answer, provider: PROVIDER_NAME, attempts };
      if (result.ok && isSearchOnlyAnswer(answer)) break;
    } catch {
      attempts.push({ attempt, status: 0, ok: false });
    }
  }
  return { ok: true, answer: buildDocsFallback(question), provider: "local-docs", fallback: true, attempts };
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
  PROVIDER_ATTEMPTS,
  PROVIDER_DEADLINE_MS,
  MIN_ANSWER_LENGTH,
  sanitizeAnswer,
  isSearchOnlyAnswer,
  isUsableAnswer,
  buildDocsFallback,
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
  res.status(result.ok ? 200 : 503).json({ ok: result.ok, answer: result.answer, provider: result.provider, fallback: result.fallback ?? false, retryable: !result.ok, attempts: result.attempts });
});

export default app;
