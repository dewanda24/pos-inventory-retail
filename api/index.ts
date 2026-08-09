import express from 'express';
import apiRouter from '../server/apiRouter';
import { dbStore } from '../src/db/store';

const app = express();

app.use(express.json());
app.use('/api', apiRouter);

export default async function handler(req: any, res: any) {
  try {
    // Ensure DB connection is active before processing request
    await dbStore.connect();
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
