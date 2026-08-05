import express from 'express';
import apiRouter from '../server/apiRouter';
import { dbStore } from '../src/db/store';

const app = express();

app.use(express.json());
app.use('/api', apiRouter);

export default async function handler(req: any, res: any) {
  // Ensure DB connection is active before processing request
  await dbStore.connect();
  return app(req, res);
}
