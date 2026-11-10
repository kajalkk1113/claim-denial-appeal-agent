import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { connectDatabase } from './src/config/db';
import authRoutes from './src/routes/authRoutes';
import claimRoutes from './src/routes/claimRoutes';
import { getJwtSecret } from './src/utils/jwt';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 5000);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'https://claim-denial-appeal-agent.vercel.app';
app.disable('x-powered-by');
app.use(cors({
  origin: frontendOrigin,
  credentials: true
}));app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/claims', claimRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'API route not found.' });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ success: false, error: 'Request body contains invalid JSON.' });
    return;
  }
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'PDF files must be 10 MB or smaller.'
      : 'Unable to accept the uploaded file.';
    res.status(400).json({ success: false, error: message });
    return;
  }
  if (error instanceof Error && error.message === 'Only PDF documents are accepted.') {
    res.status(400).json({ success: false, error: error.message });
    return;
  }
  console.error('Unhandled API error:', error);
  res.status(500).json({ success: false, error: 'An unexpected server error occurred.' });
};

app.use(errorHandler);

async function startServer(): Promise<void> {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid TCP port number.');
  }
  getJwtSecret();
  await connectDatabase();
  await new Promise<void>((resolve, reject) => {
    const server = app.listen(port, () => {
      console.info(`API listening on port ${port}.`);
      resolve();
    });
    server.once('error', reject);
  });
}

startServer().catch((error: unknown) => {
  console.error('Unable to start API:', error);
  process.exitCode = 1;
});
