
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
const port = Number(process.env.PORT || 5000);

app.disable('x-powered-by');

app.use(cors({
  origin: [
    'https://claim-denial-appeal-agent.vercel.app',
    'https://claim-denial-appeal-agent-4dckk6emw-kajalk.vercel.app'
  ],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Backend is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/claims', claimRoutes);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);

  if (error instanceof SyntaxError) {
    res.status(400).json({ success: false, error: 'Invalid JSON' });
    return;
  }

  if (error instanceof multer.MulterError) {
    res.status(400).json({ success: false, error: error.message });
    return;
  }

  res.status(500).json({
    success: false,
    error: error instanceof Error ? error.message : 'Server error'
  });
};

app.use(errorHandler);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'API route not found'
  });
});

async function startServer() {
  getJwtSecret();
  await connectDatabase();

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);
