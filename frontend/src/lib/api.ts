import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'claim-appeal-token';
const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const API_BASE_URL = configuredApiUrl.replace(/\/claims$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      typeof window !== 'undefined' &&
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      window.localStorage.getItem(TOKEN_STORAGE_KEY)
    ) {
      window.dispatchEvent(new Event('claim-appeal:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export function getApiError(error: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export interface ClaimRecord {
  _id: string;
  claimNumber: string;
  patientName: string;
  patientId: string;
  providerName: string;
  insuranceProvider: string;
  policyNumber?: string;
  serviceDate: string;
  submissionDate: string;
  claimAmount: number;
  deniedAmount: number;
  denialCode: string;
  denialReason: string;
  diagnosisCode: string;
  status: ClaimStatus;
  uploadedDocument?: {
    originalName: string;
    mimeType: string;
    size: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type ClaimStatus =
  | 'Submitted'
  | 'Denied'
  | 'Under Review'
  | 'Appeal Drafted'
  | 'Appealed'
  | 'Approved'
  | 'Recovered';

export const CLAIM_STATUSES: ClaimStatus[] = [
  'Submitted',
  'Denied',
  'Under Review',
  'Appeal Drafted',
  'Appealed',
  'Approved',
  'Recovered',
];

export interface ClaimStats {
  totalClaims: number;
  deniedClaims: number;
  pendingClaims: number;
  totalClaimAmount: number;
  totalDeniedAmount: number;
  statusCounts: Partial<Record<ClaimStatus, number>>;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface ClaimInput {
  claimNumber?: string;
  patientName: string;
  patientId: string;
  providerName: string;
  insuranceProvider: string;
  policyNumber: string;
  serviceDate: string;
  submissionDate: string;
  claimAmount: string;
  deniedAmount: string;
  denialCode: string;
  denialReason: string;
  diagnosisCode: string;
  status: ClaimStatus;
  document?: File;
}

export function toClaimFormData(values: ClaimInput): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (key === 'document') continue;
    if (value !== undefined) formData.append(key, String(value));
  }
  if (values.document) formData.append('document', values.document);
  return formData;
}
