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
    return jsonResponse({ status: true, data: { response: "Jawaban siputzx" } });
  });
  assert.equal(result.ok, true);
  assert.equal(result.provider, "siputzx-gpt-oss-120b");
  assert.equal(result.answer, "Jawaban siputzx");
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
    return jsonResponse({ status: true, data: { response: "Jawaban kedua" } });
  });
  assert.equal(result.ok, true);
  assert.equal(result.answer, "Jawaban kedua");
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
  assert.equal(calls, 2);
  assert.equal(result.ok, false);
  assert.equal(result.provider, null);
  assert.match(result.answer, /AI assistant sedang tidak tersedia/);
  assert.deepEqual(result.attempts.map((item) => item.status), [0, 0]);
});

test("HTTP 200 error text does not count as an answer", async () => {
  const calls = [];
  const result = await __testing.askWithSiputzx("Pertanyaan", "Context", async (url) => {
    calls.push(String(url));
    if (calls.length === 1) return new Response('"undefined" is not valid JSON', { status: 200 });
    return jsonResponse({ status: true, data: { response: "Jawaban valid" } });
  });
  assert.equal(result.ok, true);
  assert.equal(result.answer, "Jawaban valid");
  assert.equal(calls.length, 2);
});

test("status false is treated as a failed answer even with HTTP 200", async () => {
  const result = await __testing.askWithSiputzx("Pertanyaan", "Context", async () => jsonResponse({ status: false, data: { response: "upstream error" } }, 200));
  assert.equal(result.ok, false);
  assert.equal(result.provider, null);
  assert.match(result.answer, /AI assistant sedang tidak tersedia/);
});

test("system prompt mengunci nama package dan perintah instalasi resmi", () => {
  const system = __testing.buildSiputzxSystem();
  assert.match(system, /@akaanakbaik\/pterodactyl-gateway/);
  assert.match(system, /npm i @akaanakbaik\/pterodactyl-gateway/);
  assert.match(system, /1\.6\.0-beta/);
});

test("oversized context and questions keep the upstream URL within safe limits", () => {
  const request = __testing.normalizeRequest({ question: `${"q".repeat(1500)}`, context: "x".repeat(100000) });
  assert.equal(request.status, 200);
  assert.equal(request.context.length, 6000);
  const prompt = __testing.buildSiputzxPrompt(request.question, request.context);
  const system = __testing.buildSiputzxSystem();
  assert.ok(prompt.length <= 5000);
  assert.ok(system.length <= 1200);
  assert.match(prompt, /Pertanyaan user:/);
  assert.match(system, /Akadev Pterodactyl Gateway Docs Assistant/);
  const url = `https://api.siputzx.my.id/api/ai/gptoss120b?${new URLSearchParams({ prompt, system, temperature: "0.7" })}`;
  assert.ok(url.length < 12000);
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
