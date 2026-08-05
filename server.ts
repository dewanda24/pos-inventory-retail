import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PORT } from './server/config';
import apiRouter from './server/apiRouter';
import { dbStore } from './src/db/store';
async function startServer() {
  const app = express();
  app.use(express.json());

  // Mount modular API routes
  app.use('/api', apiRouter);

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  dbStore.connect().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

startServer();
