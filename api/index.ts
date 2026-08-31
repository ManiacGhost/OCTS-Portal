// Vercel serverless entry. vercel.json routes every /api/* request here with the
// original URL preserved, so the Express app (a valid (req, res) handler) matches
// its /api/... routes directly.
import app from '../server';

export default app;
