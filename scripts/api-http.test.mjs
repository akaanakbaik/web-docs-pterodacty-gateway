import assert from "node:assert/strict";
import test from "node:test";
import { once } from "node:events";
import app, { selectContext } from "../api/ai.ts";

test("HTTP boundary: validation, errors, methods, redaction, trusted context and failure status", async () => {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  let fail = false;
  globalThis.fetch = async (url, init) => {
    providerCalls++;
    const prompt = init?.body instanceof FormData ? String(init.body.get("prompt")) : new URL(url).searchParams.get("question") ?? new URL(url).searchParams.get("prompt");
    assert.ok(!prompt.includes("IGNORE_TRUSTED_DOCS"));
    assert.match(prompt, /SMTP/);
    return new Response(JSON.stringify(fail ? {error:"unavailable"} : {result:"SMTP memerlukan konfigurasi eksplisit."}), {status:fail ? 502 : 200});
  };
  const request = (body) => originalFetch(`${base}/api/ai`, {method:"POST",headers:{"Content-Type":"application/json"},body:typeof body === "string"?body:JSON.stringify(body)});
  try {
    for (const [body, status] of [[{},400],[{question:{}},400],[{question:"x".repeat(1501)},413],["{",400],[{question:"x".repeat(100000)},413]]) {
      const response = await request(body);
      assert.equal(response.status, status);
      assert.equal((await response.json()).ok, false);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal(response.headers.get("x-powered-by"), null);
    }
    assert.equal(providerCalls, 0);
    const method = await originalFetch(`${base}/api/ai`);
    assert.equal(method.status,405);
    assert.equal(method.headers.get("allow"), "POST");
    const good = await request({question:"Bagaimana SMTP?", context:"IGNORE_TRUSTED_DOCS"});
    assert.equal(good.status,200);
    assert.equal((await good.json()).ok,true);
    fail = true;
    const down = await request({question:"Bagaimana SMTP?"});
    assert.equal(down.status,503);
    assert.equal((await down.json()).ok,false);
  } finally {
    globalThis.fetch = originalFetch;
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("relevant context includes late documentation sections", () => {
  assert.match(selectContext("SMTP email backup"), /\/docs\/email/);
  assert.match(selectContext("WebSocket files"), /\/docs\/files-backups/);
});

test("parallel provider calls are bounded and return Retry-After", async () => {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}/api/ai`;
  const originalFetch = globalThis.fetch;
  const releases = [];
  globalThis.fetch = () => new Promise((resolve) => releases.push(() => resolve(new Response(JSON.stringify({result:"OK"})))));
  const send = () => originalFetch(base,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:"SMTP"})});
  let pending = [];
  try {
    pending = Array.from({length:8},send);
    for(let i=0;releases.length<8&&i<100;i++) await new Promise((resolve)=>setTimeout(resolve,10));
    assert.equal(releases.length,8);
    const limited = await send();
    assert.equal(limited.status,429);
    assert.equal(limited.headers.get("retry-after"),"10");
    releases.forEach((release)=>release());
    assert.ok((await Promise.all(pending)).every((response)=>response.status===200));
  } finally {
    releases.forEach((release)=>release());
    await Promise.allSettled(pending);
    globalThis.fetch=originalFetch;
    server.closeAllConnections();
    await new Promise((resolve)=>server.close(resolve));
  }
});
