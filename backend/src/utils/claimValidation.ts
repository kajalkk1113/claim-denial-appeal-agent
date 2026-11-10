export const CLAIM_STATUSES = [
  'Submitted',
  'Denied',
  'Under Review',
  'Appeal Drafted',
  'Appealed',
  'Approved',
  'Recovered',
] as const;

export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export interface ClaimInput {
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
}

type ValidationResult =
  | { success: true; data: ClaimInput }
  | { success: false; error: string };

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function date(value: unknown): Date | null {
  if (typeof value !== 'string' && !(value instanceof Date)) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function amount(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function validateClaimInput(input: Record<string, unknown>): ValidationResult {
  const fields = {
    claimNumber: text(input.claimNumber),
    patientName: text(input.patientName),
    patientId: text(input.patientId),
    providerName: text(input.providerName),
    insuranceProvider: text(input.insuranceProvider),
    policyNumber: text(input.policyNumber),
    serviceDate: date(input.serviceDate),
    submissionDate: date(input.submissionDate),
    claimAmount: amount(input.claimAmount),
    deniedAmount: amount(input.deniedAmount),
    denialCode: text(input.denialCode),
    denialReason: text(input.denialReason),
    diagnosisCode: text(input.diagnosisCode),
    status: text(input.status) || 'Submitted',
  };

  const requiredText: Array<[string, string, number]> = [
    ['claimNumber', fields.claimNumber, 60],
    ['patientName', fields.patientName, 120],
    ['patientId', fields.patientId, 80],
    ['providerName', fields.providerName, 120],
    ['insuranceProvider', fields.insuranceProvider, 120],
    ['denialCode', fields.denialCode, 40],
    ['denialReason', fields.denialReason, 2000],
    ['diagnosisCode', fields.diagnosisCode, 20],
  ];

  for (const [label, value, maxLength] of requiredText) {
    if (!value) return { success: false, error: `${label} is required.` };
    if (value.length > maxLength) {
      return { success: false, error: `${label} must be ${maxLength} characters or fewer.` };
    }
  }

  if (!fields.serviceDate || !fields.submissionDate) {
    return { success: false, error: 'Valid service and submission dates are required.' };
  }
  if (fields.claimAmount === null || fields.deniedAmount === null) {
    return { success: false, error: 'Claim and denied amounts must be valid non-negative numbers.' };
  }
  if (fields.deniedAmount > fields.claimAmount) {
    return { success: false, error: 'Denied amount cannot exceed the claim amount.' };
  }
  if (fields.policyNumber.length > 80) {
    return { success: false, error: 'policyNumber must be 80 characters or fewer.' };
  }
  if (!CLAIM_STATUSES.includes(fields.status as ClaimStatus)) {
    return { success: false, error: 'Status is not supported.' };
  }

  return {
    success: true,
    data: {
      ...fields,
      status: fields.status as ClaimStatus,
      serviceDate: fields.serviceDate,
      submissionDate: fields.submissionDate,
      claimAmount: fields.claimAmount,
      deniedAmount: fields.deniedAmount,
      policyNumber: fields.policyNumber || undefined,
    },
  };
}
