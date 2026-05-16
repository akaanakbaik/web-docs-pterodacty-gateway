import express from "express";

const app = express();
app.use(express.json({ limit: "120kb" }));

const AI_ENDPOINT = "https://xters.us.kg/api/ai/perplexity";
type AiUpstreamResponse = Record<string, unknown>;

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function createPrompt(question: string, context: string) {
  return [
    "Kamu adalah Akadev Pterodactyl Gateway Docs Assistant.",
    "Jawab hanya seputar Akadev Pterodactyl Gateway, SDK, CLI, wizard, config, integration helper, bot, website, deployment, troubleshooting, dan security guard.",
    "Gunakan bahasa Indonesia yang singkat, jelas, profesional, praktis, dan mudah dipahami.",
    "Jika butuh command, berikan command siap copy.",
    "Jangan mengarang fitur yang tidak ada di context.",
    "Jangan meminta atau menampilkan credential asli.",
    "Jika pertanyaan tentang node/location/allocation management, jelaskan bahwa CLI stabil tidak membuka command sensitif tersebut; gunakan IDs manual dari panel atau ptero-gateway ids.",
    "",
    "Context dokumentasi:",
    context.slice(0, 9000),
    "",
    "Pertanyaan:",
    question,
    "",
    "Jawaban:"
  ].join("\n");
}

async function readUpstreamJson(response: Response): Promise<AiUpstreamResponse> {
  const value: unknown = await response.json().catch(() => ({}));
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as AiUpstreamResponse;
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

  try {
    const prompt = createPrompt(question, context);
    const url = `${AI_ENDPOINT}?query=${encodeURIComponent(prompt)}`;
    const upstream = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(25000)
    });
    const data = await readUpstreamJson(upstream);
    const answer = cleanText(data.answer || data.result || data.message);

    res.status(upstream.ok ? 200 : 502).json({
      ok: upstream.ok,
      answer: answer || "AI belum mengembalikan jawaban. Coba ulangi dengan pertanyaan yang lebih spesifik."
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      answer: "AI assistant sedang tidak tersedia. Kamu tetap bisa memakai search lokal dan dokumentasi di halaman ini.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default app;
