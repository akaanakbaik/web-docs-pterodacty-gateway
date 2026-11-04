type ResponseLike = { status: (code: number) => ResponseLike; json: (body: unknown) => void };

export default function handler(_req: unknown, res: ResponseLike) {
  res.status(200).json({ ok: true, service: "pterodactyl-gateway-docs", aiProvider: "siputzx-gpt-oss-120b", model: "gpt-oss-120b" });
}
