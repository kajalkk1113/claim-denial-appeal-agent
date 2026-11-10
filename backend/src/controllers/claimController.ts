import { randomBytes } from 'node:crypto';
import { access } from 'node:fs/promises';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Claim from '../models/Claims';
import {
  getClaimDocumentPath,
  persistClaimDocument,
  removeClaimDocument,
} from '../utils/claimUpload';
import { CLAIM_STATUSES, validateClaimInput } from '../utils/claimValidation';

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

function userId(req: Request): string {
  return req.auth!.userId;
}

function requestBody(req: Request): Record<string, unknown> {
  return typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)
    ? req.body as Record<string, unknown>
    : {};
}

async function cleanupUploadedDocument(storedName: string): Promise<void> {
  try {
    await removeClaimDocument(storedName);
  } catch (error) {
    console.error('Unable to clean up uploaded claim document:', error);
  }
}

function generatedClaimNumber(): string {
  const date = new Date();
  const datePart = [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('');
  return `CLM-${datePart}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function listClaims(req: Request, res: Response): Promise<void> {
  const page = Number.parseInt(String(req.query.page ?? '1'), 10);
  const limit = Number.parseInt(String(req.query.limit ?? '10'), 10);
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const direction = req.query.sort === 'oldest' ? 1 : -1;

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    res.status(400).json({ success: false, error: 'Page must be positive and limit must be between 1 and 100.' });
    return;
  }
  const filter: Record<string, unknown> = { createdBy: userId(req) };
  if (status) {
    const statuses = status.split(',').map((value) => value.trim());
    if (statuses.some((value) => !CLAIM_STATUSES.includes(value as (typeof CLAIM_STATUSES)[number]))) {
      res.status(400).json({ success: false, error: 'Status filter is not supported.' });
      return;
    }
    filter.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
  }
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { patientName: { $regex: escapedSearch, $options: 'i' } },
      { claimNumber: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  try {
    const [claims, total] = await Promise.all([
      Claim.find(filter)
        .sort({ submissionDate: direction, _id: direction })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Claim.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: claims,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Listing claims failed:', error);
    res.status(500).json({ success: false, error: 'Unable to load claims.' });
  }
}

export async function getClaimStats(req: Request, res: Response): Promise<void> {
  try {
    const [result] = await Claim.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId(req)) } },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalClaims: { $sum: 1 },
                deniedClaims: {
                  $sum: { $cond: [{ $eq: ['$status', 'Denied'] }, 1, 0] },
                },
                pendingClaims: {
                  $sum: { $cond: [{ $in: ['$status', ['Submitted', 'Under Review']] }, 1, 0] },
                },
                totalClaimAmount: { $sum: '$claimAmount' },
                totalDeniedAmount: { $sum: '$deniedAmount' },
              },
            },
          ],
          statuses: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        },
      },
    ]);
    const statusCounts = Object.fromEntries(
      (result?.statuses ?? []).map((item: { _id: string; count: number }) => [item._id, item.count]),
    );
    res.json({
      success: true,
      data: {
        ...(result?.summary[0] ?? {
          totalClaims: 0,
          deniedClaims: 0,
          pendingClaims: 0,
          totalClaimAmount: 0,
          totalDeniedAmount: 0,
        }),
        statusCounts,
      },
    });
  } catch (error) {
    console.error('Loading claim statistics failed:', error);
    res.status(500).json({ success: false, error: 'Unable to load claim statistics.' });
  }
}

export async function createClaim(req: Request, res: Response): Promise<void> {
  let uploadedDocument: Awaited<ReturnType<typeof persistClaimDocument>> | undefined;
  try {
    const body = requestBody(req);
    const input = {
      ...body,
      claimNumber: typeof body.claimNumber === 'string' && body.claimNumber.trim()
        ? body.claimNumber
        : generatedClaimNumber(),
    };
    const validated = validateClaimInput(input);
    if (!validated.success) {
      res.status(400).json({ success: false, error: validated.error });
      return;
    }
    if (req.file) uploadedDocument = await persistClaimDocument(req.file);

    const claim = await Claim.create({
      ...validated.data,
      uploadedDocument,
      createdBy: userId(req),
    });
    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    if (uploadedDocument) await cleanupUploadedDocument(uploadedDocument.storedName);
    if (error instanceof Error && error.message === 'The uploaded file is not a valid PDF document.') {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    if (isDuplicateKeyError(error)) {
      res.status(409).json({ success: false, error: 'A claim with this claim number already exists.' });
      return;
    }
    console.error('Creating claim failed:', error);
    res.status(500).json({ success: false, error: 'Unable to create claim.' });
  }
}

export async function getClaim(req: Request, res: Response): Promise<void> {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ success: false, error: 'Claim ID is invalid.' });
    return;
  }
  try {
    const claim = await Claim.findOne({ _id: req.params.id, createdBy: userId(req) });
    if (!claim) {
      res.status(404).json({ success: false, error: 'Claim not found.' });
      return;
    }
    res.json({ success: true, data: claim });
  } catch (error) {
    console.error('Loading claim failed:', error);
    res.status(500).json({ success: false, error: 'Unable to load claim.' });
  }
}

export async function updateClaim(req: Request, res: Response): Promise<void> {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ success: false, error: 'Claim ID is invalid.' });
    return;
  }
  let newDocument: Awaited<ReturnType<typeof persistClaimDocument>> | undefined;
  let documentCleanupWarning: string | undefined;
  try {
    const claim = await Claim.findOne({ _id: req.params.id, createdBy: userId(req) });
    if (!claim) {
      res.status(404).json({ success: false, error: 'Claim not found.' });
      return;
    }
    const validated = validateClaimInput({ ...claim.toObject(), ...requestBody(req) });
    if (!validated.success) {
      res.status(400).json({ success: false, error: validated.error });
      return;
    }
    if (req.file) newDocument = await persistClaimDocument(req.file);
    const previousDocumentName = claim.uploadedDocument?.storedName;

    Object.assign(claim, validated.data);
    if (newDocument) claim.uploadedDocument = newDocument;
    await claim.save();

    const savedDocument = newDocument;
    newDocument = undefined;
    if (savedDocument && previousDocumentName) {
      try {
        await removeClaimDocument(previousDocumentName);
      } catch (error) {
        console.error('Replaced claim document could not be removed:', error);
        documentCleanupWarning = 'Claim updated, but the previous PDF could not be removed from storage.';
      }
    }
    res.json({ success: true, data: claim, ...(documentCleanupWarning ? { warning: documentCleanupWarning } : {}) });
  } catch (error) {
    if (newDocument) await cleanupUploadedDocument(newDocument.storedName);
    if (error instanceof Error && error.message === 'The uploaded file is not a valid PDF document.') {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    if (isDuplicateKeyError(error)) {
      res.status(409).json({ success: false, error: 'A claim with this claim number already exists.' });
      return;
    }
    console.error('Updating claim failed:', error);
    res.status(500).json({ success: false, error: 'Unable to update claim.' });
  }
}

export async function deleteClaim(req: Request, res: Response): Promise<void> {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ success: false, error: 'Claim ID is invalid.' });
    return;
  }
  try {
    const claim = await Claim.findOneAndDelete({ _id: req.params.id, createdBy: userId(req) });
    if (!claim) {
      res.status(404).json({ success: false, error: 'Claim not found.' });
      return;
    }
    try {
      await removeClaimDocument(claim.uploadedDocument?.storedName);
    } catch (error) {
      console.error('Deleted claim document could not be removed:', error);
      res.json({
        success: true,
        data: { id: String(claim._id) },
        warning: 'Claim deleted, but its PDF could not be removed from storage.',
      });
      return;
    }
    res.json({ success: true, data: { id: String(claim._id) } });
  } catch (error) {
    console.error('Deleting claim failed:', error);
    res.status(500).json({ success: false, error: 'Unable to delete claim.' });
  }
}

export async function getClaimDocument(req: Request, res: Response): Promise<void> {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ success: false, error: 'Claim ID is invalid.' });
    return;
  }
  try {
    const claim = await Claim.findOne(
      { _id: req.params.id, createdBy: userId(req) },
      { uploadedDocument: 1 },
    ).lean();
    if (!claim?.uploadedDocument) {
      res.status(404).json({ success: false, error: 'No document is attached to this claim.' });
      return;
    }
    const filePath = getClaimDocumentPath(claim.uploadedDocument.storedName);
    try {
      await access(filePath);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
        res.status(404).json({ success: false, error: 'The claim document is no longer available.' });
        return;
      }
      throw error;
    }
    res.type('application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Loading claim document failed:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Unable to load claim document.' });
    }
  }
}
