// Vercel serverless catch-all: every /api/* request is routed to this file by
// Vercel's filesystem routing (no rewrite needed). The Express app from
// server.ts is itself a valid (req, res) handler, so we re-export it.
import app from '../server';

export default app;
