import express from 'express';
import apiRouter from '../server/apiRouter';
import { dbStore } from '../src/db/store';

const app = express();

app.use(express.json());
// Middleware to ensure DB connection before processing any API route
app.use(async (req, res, next) => {
  try {
    await Promise.race([
      dbStore.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB Connection Timeout on Vercel (5s)')), 5000))
    ]);
    next();
  } catch (error: any) {
    console.error('Vercel API DB Connection Error:', error);
    res.status(500).json({
      error: 'Failed to connect to database',
      details: error.message,
      uri_configured: !!process.env.MONGODB_URI
    });
  }
});

app.use('/api', apiRouter);

export default app;
