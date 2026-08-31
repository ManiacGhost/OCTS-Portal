// Vercel serverless entry point.
// The Express app from server.ts is itself a valid (req, res) handler, so we
// re-export it. All /api/* requests are routed here by vercel.json rewrites.
import app from '../server';

export default app;
