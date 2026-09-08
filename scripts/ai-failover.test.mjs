import assert from "node:assert/strict";
import test from "node:test";
import { __testing } from "../api/ai.ts";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

test("failover uses Izuka first and forwards the shared system prompt", async () => {
  const calls = [];
  const result = await __testing.askWithFailover("Apa itu retry?", "Dokumentasi retry", async (url, init) => {
    calls.push({ url: String(url), init });
    return jsonResponse({ result: "Jawaban Izuka" });
  }, "");
  assert.equal(result.provider, "izuka-gemmy");
  assert.equal(result.answer, "Jawaban Izuka");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init?.method, "POST");
  const form = calls[0].init?.body;
  assert.ok(form instanceof FormData);
  assert.match(String(form.get("prompt")), /Kamu adalah Akadev Pterodactyl Gateway Docs Assistant/);
  assert.match(String(form.get("prompt")), /Apa itu retry\?/);
  assert.equal(form.get("media"), "");
});

test("Cuki is primary when configured", async () => {
  const calls = [];
  const result = await __testing.askWithFailover("Jelaskan safe mode", "Docs security", async (url) => {
    calls.push(String(url));
    return jsonResponse({ data: { response: "Jawaban Cuki" } });
  }, "cuki-test");
  assert.equal(result.provider, "cuki-deepseek");
  assert.equal(result.answer, "Jawaban Cuki");
  assert.equal(calls.length, 1);
  assert.match(calls[0], /api\.cuki\.biz\.id\/api\/ai\/deepseek/);
  assert.match(decodeURIComponent(calls[0].replace(/\+/g, " ")), /Jelaskan safe mode/);
});

test("failover reaches Prexzy when earlier providers throw", async () => {
  const calls = [];
  const result = await __testing.askWithFailover("Cara install", "Docs install", async (url) => {
    calls.push(String(url));
    if (calls.length < 2) throw new Error("timeout");
    return jsonResponse({ response: "Jawaban Mistral" });
  }, "");
  assert.equal(result.provider, "prexzy-mistral");
  assert.equal(result.answer, "Jawaban Mistral");
  assert.equal(calls.length, 2);
  assert.match(calls[1], /prexzyapis\.com\/ai\/mistral/);
});

test("all provider failures return a safe local fallback", async () => {
  const result = await __testing.askWithFailover("Pertanyaan", "Context", async () => jsonResponse({}, 502), "");
  assert.equal(result.provider, null);
  assert.match(result.answer, /AI assistant sedang tidak tersedia/);
  assert.equal(result.attempts.length, 2);
});

test("HTTP 200 error text does not stop failover", async () => {
  const calls = [];
  const result = await __testing.askWithFailover("Pertanyaan", "Context", async (url) => {
    calls.push(String(url));
    if (calls.length === 1) return new Response('"undefined" is not valid JSON', { status: 200 });
    return jsonResponse({ response: "Jawaban Prexzy" });
  }, "");
  assert.equal(result.provider, "prexzy-mistral");
  assert.equal(result.answer, "Jawaban Prexzy");
});

test("provider status false is treated as a failed answer", async () => {
  const result = await __testing.askWithFailover("Pertanyaan", "Context", async () => jsonResponse({ status: false, result: "upstream error" }, 200), "");
  assert.equal(result.provider, null);
  assert.match(result.answer, /AI assistant sedang tidak tersedia/);
});

test("oversized context is compacted without rejecting a valid question", () => {
  const result = __testing.normalizeRequest({ question: "Apa itu retry?", context: "x".repeat(100000) });
  assert.equal(result.status, 200);
  assert.equal(result.context.length, 64000);
  const prompt = __testing.buildAiPrompt(result.question, result.context);
  assert.match(prompt, /Kamu adalah Akadev Pterodactyl Gateway Docs Assistant/);
  assert.match(prompt, /Apa itu retry\?/);
});

test("request validation rejects missing and oversized questions with actionable output", () => {
  const empty = __testing.normalizeRequest({ question: "   ", context: "docs" });
  assert.equal(empty.status, 400);
  assert.match(empty.answer, /wajib diisi/);
  const oversized = __testing.normalizeRequest({ question: "x".repeat(1501), context: "docs" });
  assert.equal(oversized.status, 413);
  assert.match(oversized.answer, /terlalu panjang/);
});

test("normalizer rejects objects, arrays, HTML and provider errors", () => {
  for (const payload of [{data:{response:{other:"x"}}}, {data:{response:["bad"]}}, {data:{response:"<html>gateway error</html>"}}, {success:false,data:{response:"bad"}}, {error:"failed",data:{response:"bad"}}]) {
    assert.equal(__testing.pickAnswer("cuki-deepseek", payload), "");
  }
  assert.equal(__testing.pickAnswer("cuki-deepseek", {data:{response:{answer:"Nested answer"}}}), "Nested answer");
});

test("questions must be strings", () => {
  for (const question of [null, {}, [], 123, true]) assert.equal(__testing.normalizeRequest({question}).status, 400);
});

test("Cuki failure falls back without leaking provider errors", async () => {
  const result = await __testing.askWithFailover("Install", "docs", async (url) => String(url).includes("cuki") ? jsonResponse({error:"secret provider failure"}, 500) : jsonResponse({result:"Install npm"}), "test-key");
  assert.equal(result.provider, "izuka-gemmy");
  assert.equal(result.attempts.length, 2);
});

test("outgoing prompts redact panel credentials and preserve Unicode questions", async () => {
  const secret = "ptla_" + "a".repeat(32);
  await __testing.askWithFailover(`Bagaimana 安全 ${secret}?`, "docs", async (url) => {
    const prompt = new URL(url).searchParams.get("question");
    assert.ok(!prompt.includes(secret));
    assert.match(prompt, /安全/);
    assert.match(prompt, /\[REDACTED\]/);
    return jsonResponse({data:{response:"Jawaban"}});
  }, "test-key");
});

test("valid troubleshooting answers beginning with Error remain usable", () => {
  assert.equal(__testing.pickAnswer("cuki-deepseek", {data:{response:"Error DOMAIN_REQUIRED berarti domain belum diisi."}}), "Error DOMAIN_REQUIRED berarti domain belum diisi.");
});

test("oversized upstream response fails over", async () => {
  let calls = 0;
  const result = await __testing.askWithFailover("Install", "docs", async () => ++calls === 1 ? new Response("x".repeat(128001)) : jsonResponse({result:"Install SDK"}), "test-key");
  assert.equal(result.provider,"izuka-gemmy");
});

test("Cuki prompt respects the live provider 4000-character limit", async () => {
  await __testing.askWithFailover("Pertanyaan " + "x".repeat(1480), "docs".repeat(20000), async (url) => {
    const prompt = new URL(url).searchParams.get("question");
    assert.ok(prompt.length <= 4000);
    assert.match(prompt, /Pertanyaan x/);
    assert.match(prompt, /Akadev Pterodactyl Gateway Docs Assistant/);
    return jsonResponse({data:{response:"OK"}});
  }, "test-key");
});
