import express from "express";

const app = express();

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "pterodactyl-gateway-docs", aiProvider: "siputzx-gpt-oss-120b", model: "gpt-oss-120b" });
});

export default app;