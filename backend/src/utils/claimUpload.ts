import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Express } from 'express';
import type { IUploadedDocument } from '../models/Claims';

export const CLAIM_UPLOAD_DIRECTORY = path.resolve(process.cwd(), 'uploads', 'claims');

export async function persistClaimDocument(file: Express.Multer.File): Promise<IUploadedDocument> {
  if (!file.buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    throw new Error('The uploaded file is not a valid PDF document.');
  }

  await mkdir(CLAIM_UPLOAD_DIRECTORY, { recursive: true, mode: 0o700 });
  const storedName = `${randomUUID()}.pdf`;
  const storedPath = path.join(CLAIM_UPLOAD_DIRECTORY, storedName);
  await writeFile(storedPath, file.buffer, { flag: 'wx', mode: 0o600 });

  return {
    storedName,
    originalName: path.basename(file.originalname).slice(0, 255),
    mimeType: 'application/pdf',
    size: file.size,
  };
}

export async function removeClaimDocument(storedName?: string): Promise<void> {
  if (!storedName) return;
  if (!/^[0-9a-f-]{36}\.pdf$/i.test(storedName)) {
    throw new Error('Stored document name is invalid.');
  }
  try {
    await unlink(path.join(CLAIM_UPLOAD_DIRECTORY, storedName));
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
      return;
    }
    throw error;
  }
}

export function getClaimDocumentPath(storedName: string): string {
  if (!/^[0-9a-f-]{36}\.pdf$/i.test(storedName)) {
    throw new Error('Stored document name is invalid.');
  }
  return path.join(CLAIM_UPLOAD_DIRECTORY, storedName);
}
