import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { verifyAuthToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; role: 'user' | 'admin' };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authorization = req.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }

  try {
    const payload = verifyAuthToken(authorization.slice(7));
    if (!mongoose.isValidObjectId(payload.userId)) {
      res.status(401).json({ success: false, error: 'Invalid authentication token.' });
      return;
    }
    req.auth = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired authentication token.' });
  }
}
