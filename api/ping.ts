// Zero-dependency canary. If GET /api/ping returns this JSON on the deployment,
// Vercel is building & serving serverless functions correctly and any remaining
// /api failure is inside the Express app bundle, not the routing/build config.
export default function handler(_req: unknown, res: any) {
  res.setHeader('content-type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, fn: 'vercel-serverless', ts: Date.now() }));
}
