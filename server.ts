import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/routes/api.routes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security and parsing middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // REST API Routes
  app.use('/api/v1', apiRouter);

  // Healthcheck
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'ProcuraPay AI',
      timestamp: new Date().toISOString(),
      paypalConfigured: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist static assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ProcuraPay AI] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[ProcuraPay AI] Server initialization error:', err);
  process.exit(1);
});
