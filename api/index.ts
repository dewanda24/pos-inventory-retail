import express from 'express';
import apiRouter from '../server/apiRouter';
import { dbStore } from '../src/db/store';

const app = express();

app.use(express.json());
app.use('/api', apiRouter);

export default async function handler(req: any, res: any) {
  try {
    // Ensure DB connection is active before processing request, with a 5-second timeout
    await Promise.race([
      dbStore.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB Connection Timeout on Vercel (5s)')), 5000))
    ]);
    return app(req, res);
  } catch (error: any) {
    console.error('Vercel API DB Connection Error:', error);
    res.status(500).json({
      error: 'Failed to connect to database',
      details: error.message,
      uri_configured: !!process.env.MONGODB_URI
    });
  }
}
