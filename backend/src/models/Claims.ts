import mongoose, { Schema, type Document } from 'mongoose';
import type { ClaimStatus } from '../utils/claimValidation';

export interface IUploadedDocument {
  storedName: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface IClaim extends Document {
  claimNumber: string;
  patientName: string;
  patientId: string;
  providerName: string;
  insuranceProvider: string;
  policyNumber?: string;
  serviceDate: Date;
  submissionDate: Date;
  claimAmount: number;
  deniedAmount: number;
  denialCode: string;
  denialReason: string;
  diagnosisCode: string;
  status: ClaimStatus;
  uploadedDocument?: IUploadedDocument;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UploadedDocumentSchema = new Schema<IUploadedDocument>(
  {
    storedName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false },
);

const ClaimSchema = new Schema<IClaim>(
  {
    claimNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    patientName: { type: String, required: true, trim: true, maxlength: 120 },
    patientId: { type: String, required: true, trim: true, maxlength: 80 },
    providerName: { type: String, required: true, trim: true, maxlength: 120 },
    insuranceProvider: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    policyNumber: { type: String, trim: true, maxlength: 80 },
    serviceDate: { type: Date, required: true },
    submissionDate: { type: Date, required: true },
    claimAmount: { type: Number, required: true, min: 0 },
    deniedAmount: { type: Number, required: true, min: 0 },
    denialCode: { type: String, required: true, trim: true, maxlength: 40 },
    denialReason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    diagnosisCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Denied',
        'Under Review',
        'Appeal Drafted',
        'Appealed',
        'Approved',
        'Recovered',
      ],
      default: 'Submitted',
    },
    uploadedDocument: { type: UploadedDocumentSchema, default: undefined },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

ClaimSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model<IClaim>('Claim', ClaimSchema);
