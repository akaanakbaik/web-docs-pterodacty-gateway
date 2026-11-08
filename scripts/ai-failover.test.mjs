import assert from "node:assert/strict";
import test from "node:test";
import { __testing } from "../api/ai.ts";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function parseCall(url) {
  const parsed = new URL(String(url));
  return { parsed, prompt: parsed.searchParams.get("prompt") ?? "", system: parsed.searchParams.get("system") ?? "", temperature: parsed.searchParams.get("temperature") };
}

test("siputzx is called with GET, system prompt, temperature, and the user question", async () => {
  const calls = [];
  const result = await __testing.askWithSiputzx("Apa itu retry?", "Dokumentasi retry", async (url, init) => {
    calls.push({ url: String(url), init });
    return jsonResponse({ status: true, data: { response: "Jawaban siputzx." } });
  });
  assert.equal(result.ok, true);
  assert.equal(result.provider, "siputzx-gpt-oss-120b");
  assert.equal(result.answer, "Jawaban siputzx.");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init?.method, "GET");
  const call = parseCall(calls[0].url);
  assert.equal(call.parsed.origin + call.parsed.pathname, "https://api.siputzx.my.id/api/ai/gptoss120b");
  assert.equal(call.temperature, "0.7");
  assert.match(call.prompt, /Apa itu retry\?/);
  assert.match(call.prompt, /Dokumentasi retry/);
  assert.match(call.system, /Akadev Pterodactyl Gateway Docs Assistant/);
});

test("a failed first attempt is retried once before succeeding", async () => {
  const calls = [];
  const result = await __testing.askWithSiputzx("Jelaskan safe mode", "Docs security", async (url) => {
    calls.push(String(url));
    if (calls.length === 1) return jsonResponse({ status: false, message: "upstream down" }, 503);
    return jsonResponse({ status: true, data: { response: "Jawaban kedua." } });
  });
  assert.equal(result.ok, true);
  assert.equal(result.answer, "Jawaban kedua.");
  assert.equal(result.attempts.length, 2);
  assert.deepEqual(result.attempts.map((item) => item.ok), [false, true]);
  assert.equal(calls.length, 2);
});

test("network errors are retried and then reported as a safe fallback", async () => {
  let calls = 0;
  const result = await __testing.askWithSiputzx("Pertanyaan", "Context", async () => {
    calls += 1;
    throw new Error("timeout");
  });
  assert.equal(calls, __testing.PROVIDER_ATTEMPTS);
  assert.equal(result.ok, true);
  assert.equal(result.provider, "local-docs");
  assert.equal(result.fallback, true);
  assert.match(result.answer, /dokumentasi resmi|Halaman yang bisa dibuka/);
  assert.deepEqual(result.attempts.map((item) => item.status), [0, 0, 0]);
});

test("provider failure returns a relevant documentation fallback", async () => {
  const result = await __testing.askWithSiputzx("Apa itu retry dan backoff?", "Context", async () => {
    throw new Error("timeout");
  });
  assert.equal(result.ok, true);
  assert.equal(result.provider, "local-docs");
  assert.equal(result.fallback, true);
  assert.match(result.answer, /retry|backoff/i);
  assert.ok(result.answer.includes("Baca lengkap: https://pterodacty-gateway.akaa.dev/docs/"));
});

test("empty, truncated, and reasoning answers are rejected and retried", async () => {
  const calls = [];
  const answers = ["", "**Safe", "Jawaban yang cukup lengkap untuk dipakai."];
  const result = await __testing.askWithSiputzx("Pertanyaan", "Context", async () => {
    const answer = answers[calls.length];
    calls.push(answer);
    return jsonResponse({ status: true, data: { response: answer } });
  });
  assert.equal(calls.length, 3);
  assert.equal(result.ok, true);
  assert.equal(result.answer, "Jawaban yang cukup lengkap untuk dipakai.");
  assert.deepEqual(result.attempts.map((item) => item.ok), [false, false, true]);
});

test("reasoning leaks and internal tokens are cleaned or rejected", () => {
  assert.equal(__testing.sanitizeAnswer("<|end|><|start|>assistantfinal: **Jawaban bersih**"), "**Jawaban bersih**");
  assert.match(__testing.sanitizeAnswer("analysis: internal notes\nfinal: Jawaban final yang cukup."), /^Jawaban final/);
  assert.equal(__testing.isUsableAnswer("analysis: we need answer in English"), false);
  assert.equal(__testing.isUsableAnswer("...assistantanalysis: we need final answer"), false);
  assert.equal(__testing.isUsableAnswer(__testing.sanitizeAnswer("analysis: notes only, no final answer")), false);
});

test("answer validation rejects markup-only and very short replies", () => {
  assert.equal(__testing.isUsableAnswer("**Safe"), false);
  assert.equal(__testing.isUsableAnswer("**"), false);
  assert.equal(__testing.isUsableAnswer("Jawaban valid."), true);
  assert.equal(__testing.isUsableAnswer("Jawaban yang cukup panjang dan jelas."), true);
  assert.equal(__testing.isUsableAnswer("Jawaban yang berhenti di tengah kalimat dan respons error 5"), false);
});

test("corrupted, repetitive, and wrong-package answers are rejected", () => {
  const corrupt = "```bash @aac AAC AAC AAC AAC AAC AAC AAC AAC AAC?``` Oops! I mistakenly said that. assistantfinal: npm install @akanakbaik/pterodactyl-gateway";
  assert.equal(__testing.isUsableAnswer(__testing.sanitizeAnswer(corrupt)), false);
  assert.equal(__testing.sanitizeAnswer("Jawaban yang cukup jelas.\n```js\nconst x = 1;"), "Jawaban yang cukup jelas.\n```js\nconst x = 1;\n```");
  assert.equal(__testing.isUsableAnswer("Saya akan mencari informasi tentang dry-run."), false);
  assert.equal(__testing.isUsableAnswer("sp sp sp sp sp sp sp sp sp sp"), false);
  assert.equal(__testing.isUsableAnswer("Install dengan npm i @akaanakbaik/pterodactyl-gateway lalu verifikasi."), true);
});

test("HTTP 200 error text does not count as an answer", async () => {
  const calls = [];
  const result = await __testing.askWithSiputzx("Pertanyaan", "Context", async (url) => {
    calls.push(String(url));
    if (calls.length === 1) return new Response('"undefined" is not valid JSON', { status: 200 });
    return jsonResponse({ status: true, data: { response: "Jawaban valid." } });
  });
  assert.equal(result.ok, true);
  assert.equal(result.answer, "Jawaban valid.");
  assert.equal(calls.length, 2);
});

test("status false is treated as a failed answer even with HTTP 200", async () => {
  const result = await __testing.askWithSiputzx("Pertanyaan", "Context", async () => jsonResponse({ status: false, data: { response: "upstream error" } }, 200));
  assert.equal(result.ok, true);
  assert.equal(result.provider, "local-docs");
  assert.equal(result.fallback, true);
  assert.match(result.answer, /dokumentasi resmi|Halaman yang bisa dibuka/);
});

test("system prompt mengunci nama package dan perintah instalasi resmi", () => {
  const system = __testing.buildSiputzxSystem();
  assert.match(system, /@akaanakbaik\/pterodactyl-gateway/);
  assert.match(system, /npm i @akaanakbaik\/pterodactyl-gateway/);
  assert.match(system, /1\.6\.0/);
  assert.match(system, /Node\.js 18/);
  assert.match(system, /Pterodactyl v1 dan v2 open beta/);
  assert.match(system, /Jangan memakai tabel markdown/);
  assert.match(system, /proses berpikir/);
});

test("oversized context and questions keep the prompt below the provider limit", () => {
  const request = __testing.normalizeRequest({ question: `${"q".repeat(1500)}`, context: "x".repeat(100000) });
  assert.equal(request.status, 200);
  assert.equal(request.context.length, 6000);
  const prompt = __testing.buildSiputzxPrompt(request.question, request.context);
  const system = __testing.buildSiputzxSystem();
  assert.ok(prompt.length <= 3900);
  assert.ok(prompt.length < 4000);
  assert.ok(system.length <= 1700);
  assert.match(prompt, /Pertanyaan user:/);
  assert.match(system, /Akadev Pterodactyl Gateway Docs Assistant/);
});

test("request validation rejects missing and oversized questions with actionable output", () => {
  const empty = __testing.normalizeRequest({ question: "   ", context: "docs" });
  assert.equal(empty.status, 400);
  assert.match(empty.answer, /wajib diisi/);
  const oversized = __testing.normalizeRequest({ question: "x".repeat(1501), context: "docs" });
  assert.equal(oversized.status, 413);
  assert.match(oversized.answer, /terlalu panjang/);
});

test("nested and plain response shapes are both supported", () => {
  assert.equal(__testing.pickAnswer({ status: true, data: { response: "nested" } }), "nested");
  assert.equal(__testing.pickAnswer({ status: true, data: "plain" }), "plain");
  assert.equal(__testing.pickAnswer({ status: false, data: { response: "hidden" } }), "");
});
