type ResponseLike = { status: (code: number) => ResponseLike; json: (body: unknown) => void };

export default function handler(_req: unknown, res: ResponseLike) {
  res.status(200).json({ ok: true, service: "pterodactyl-gateway-docs", aiFailover: [...(process.env.CUKI_API_KEY ? ["cuki-deepseek"] : []), "izuka-gemmy", "prexzy-mistral"] });
}
