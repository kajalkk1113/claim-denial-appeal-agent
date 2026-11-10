import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { signAuthToken } from '../utils/jwt';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const BCRYPT_MAX_BYTES = 72;

function publicUser(user: { _id: unknown; name: string; email: string; role: string }) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (name.length < 2 || name.length > 100) {
    res.status(400).json({ success: false, error: 'Name must be between 2 and 100 characters.' });
    return;
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    res.status(400).json({ success: false, error: 'Enter a valid email address.' });
    return;
  }
  if (password.length < PASSWORD_MIN_LENGTH || Buffer.byteLength(password, 'utf8') > BCRYPT_MAX_BYTES) {
    res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters and no more than 72 bytes.',
    });
    return;
  }

  try {
    const existing = await User.exists({ email });
    if (existing) {
      res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
    });
    res.status(201).json({
      success: true,
      data: { user: publicUser(user), token: signAuthToken({ userId: String(user._id), role: user.role }) },
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      return;
    }
    console.error('Registration failed:', error);
    res.status(500).json({ success: false, error: 'Unable to create the account.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!EMAIL_PATTERN.test(email) || !password || Buffer.byteLength(password, 'utf8') > BCRYPT_MAX_BYTES) {
    res.status(400).json({ success: false, error: 'Enter a valid email address and password.' });
    return;
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ success: false, error: 'Email or password is incorrect.' });
      return;
    }
    res.json({
      success: true,
      data: {
        user: publicUser(user),
        token: signAuthToken({ userId: String(user._id), role: user.role }),
      },
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ success: false, error: 'Unable to sign in.' });
  }
}

export async function currentUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.auth?.userId);
    if (!user) {
      res.status(401).json({ success: false, error: 'Account no longer exists.' });
      return;
    }
    res.json({ success: true, data: { user: publicUser(user) } });
  } catch (error) {
    console.error('Loading current user failed:', error);
    res.status(500).json({ success: false, error: 'Unable to load account.' });
  }
}
