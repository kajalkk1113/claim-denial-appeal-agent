import jwt from 'jsonwebtoken';

export interface AuthTokenPayload {
  userId: string;
  role: 'user' | 'admin';
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to a value of at least 32 characters.');
  }
  return secret;
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const payload = jwt.verify(token, getJwtSecret());
  if (
    typeof payload === 'string' ||
    typeof payload.userId !== 'string' ||
    (payload.role !== 'user' && payload.role !== 'admin')
  ) {
    throw new Error('Invalid authentication token.');
  }
  return { userId: payload.userId, role: payload.role };
}
