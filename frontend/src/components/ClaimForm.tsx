'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileUp, LoaderCircle, Paperclip, ShieldCheck, X } from 'lucide-react';
import { api, CLAIM_STATUSES, getApiError, toClaimFormData, type ClaimInput, type ClaimRecord, type ClaimStatus } from '@/lib/api';
import { useToast } from '@/lib/toast';

interface ClaimFormProps {
  initial?: ClaimRecord;
  mode?: 'create' | 'edit';
  uploadFocused?: boolean;
}

function inputDate(value?: string): string {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

export default function ClaimForm({ initial, mode = 'create', uploadFocused = false }: ClaimFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [document, setDocument] = useState<File | undefined>();
  const [documentError, setDocumentError] = useState('');
  const [values, setValues] = useState<ClaimInput>({
    claimNumber: initial?.claimNumber,
    patientName: initial?.patientName ?? '',
    patientId: initial?.patientId ?? '',
    providerName: initial?.providerName ?? '',
    insuranceProvider: initial?.insuranceProvider ?? '',
    policyNumber: initial?.policyNumber ?? '',
    serviceDate: inputDate(initial?.serviceDate),
    submissionDate: inputDate(initial?.submissionDate),
    claimAmount: initial ? String(initial.claimAmount) : '',
    deniedAmount: initial ? String(initial.deniedAmount) : '',
    denialCode: initial?.denialCode ?? '',
    denialReason: initial?.denialReason ?? '',
    diagnosisCode: initial?.diagnosisCode ?? '',
    status: initial?.status ?? 'Submitted',
  });

  function update<K extends keyof ClaimInput>(key: K, value: ClaimInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function chooseDocument(file?: File) {
    setDocumentError('');
    if (!file) {
      setDocument(undefined);
      return;
    }
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      setDocumentError('Choose a PDF document.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setDocumentError('PDF documents must be 10 MB or smaller.');
      return;
    }
    setDocument(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (Number(values.deniedAmount) > Number(values.claimAmount)) {
      showToast('Denied amount cannot exceed the claim amount.', 'error');
      return;
    }
    if (documentError) return;
    setSaving(true);
    try {
      const payload = toClaimFormData({ ...values, document });
      const response = mode === 'edit' && initial
        ? await api.put<{ data: ClaimRecord }>(`/claims/${initial._id}`, payload)
        : await api.post<{ data: ClaimRecord }>('/claims', payload);
      showToast(
        'warning' in response.data
          ? String(response.data.warning)
          : mode === 'edit' ? 'Claim changes saved.' : 'Claim created successfully.',
        'warning' in response.data ? 'error' : 'success',
      );
      router.push(`/claims/${response.data.data._id}`);
      router.refresh();
    } catch (error) {
      showToast(getApiError(error, 'Unable to save claim.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-page">
      <Link href={mode === 'edit' && initial ? `/claims/${initial._id}` : '/claims'} className="back-link">
        <ArrowLeft size={16} /> Back to {mode === 'edit' ? 'claim details' : 'claims'}
      </Link>
      <div className="page-heading form-heading">
        <div><div className="eyebrow">{uploadFocused ? 'SECURE DOCUMENT INTAKE' : 'CLAIM MANAGEMENT'}</div>
          <h1>{mode === 'edit' ? 'Edit claim' : uploadFocused ? 'Upload a claim' : 'Add a new claim'}</h1>
          <p>{mode === 'edit' ? 'Update claim information and supporting documentation.' : 'Add claim details and attach the original denial document.'}</p>
        </div>
        <div className="secure-note"><ShieldCheck size={16} /> Your documents are stored securely</div>
      </div>
      <form className="claim-form" onSubmit={submit}>
        <section className="form-section">
          <div className="form-section-title"><span className="section-number">01</span><div><h2>Claim information</h2><p>Identifiers and dates associated with this claim.</p></div></div>
          <div className="form-grid">
            <Field label="Claim number" hint="Leave blank to generate one" value={values.claimNumber ?? ''} onChange={(v) => update('claimNumber', v)} placeholder="CLM-2026-00128" />
            <Field label="Patient name" value={values.patientName} onChange={(v) => update('patientName', v)} placeholder="Jordan Mitchell" required />
            <Field label="Patient ID" value={values.patientId} onChange={(v) => update('patientId', v)} placeholder="PT-20481" required />
            <Field label="Provider name" value={values.providerName} onChange={(v) => update('providerName', v)} placeholder="Northstar Medical Group" required />
            <Field label="Insurance provider" value={values.insuranceProvider} onChange={(v) => update('insuranceProvider', v)} placeholder="Blue Cross Blue Shield" required />
            <Field label="Policy number" value={values.policyNumber} onChange={(v) => update('policyNumber', v)} placeholder="POL-90814-XY" />
            <Field label="Date of service" type="date" value={values.serviceDate} onChange={(v) => update('serviceDate', v)} required />
            <Field label="Submission date" type="date" value={values.submissionDate} onChange={(v) => update('submissionDate', v)} required />
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-title"><span className="section-number">02</span><div><h2>Denial details</h2><p>Capture the financial amounts and payer’s reason for denial.</p></div></div>
          <div className="form-grid">
            <Field label="Claim amount" type="number" min="0" step="0.01" value={values.claimAmount} onChange={(v) => update('claimAmount', v)} prefix="$" required />
            <Field label="Denied amount" type="number" min="0" step="0.01" value={values.deniedAmount} onChange={(v) => update('deniedAmount', v)} prefix="$" required />
            <Field label="Denial code" value={values.denialCode} onChange={(v) => update('denialCode', v)} placeholder="CO-50" required />
            <Field label="Diagnosis code (ICD-10)" value={values.diagnosisCode} onChange={(v) => update('diagnosisCode', v)} placeholder="M54.5" required />
            <label className="field-label">Claim status
              <select className="form-control" value={values.status} onChange={(event) => update('status', event.target.value as ClaimStatus)}>
                {CLAIM_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <label className="field-label full-field">Denial reason
              <textarea className="form-control textarea" value={values.denialReason} onChange={(event) => update('denialReason', event.target.value)} placeholder="Describe the reason given by the payer…" required maxLength={2000} rows={4} />
            </label>
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-title"><span className="section-number">03</span><div><h2>Supporting document</h2><p>Attach the EOB or denial letter as a PDF (up to 10 MB).</p></div></div>
          <label className={`upload-zone ${document ? 'upload-selected' : ''}`}>
            <input type="file" accept="application/pdf,.pdf" onChange={(event) => chooseDocument(event.target.files?.[0])} />
            {document ? <Paperclip size={22} /> : <FileUp size={22} />}
            <strong>{document?.name ?? 'Choose a PDF document'}</strong>
            <span>{document ? `${(document.size / 1024 / 1024).toFixed(2)} MB · Ready to upload` : 'PDF only · Maximum file size 10 MB'}</span>
            {document && <button className="remove-file" type="button" aria-label="Remove selected PDF" onClick={(event) => { event.preventDefault(); chooseDocument(); }}><X size={15} /></button>}
          </label>
          {initial?.uploadedDocument && !document && <p className="current-document">Current file: {initial.uploadedDocument.originalName}</p>}
          {documentError && <p className="field-error">{documentError}</p>}
        </section>

        <div className="form-actions">
          <Link href={mode === 'edit' && initial ? `/claims/${initial._id}` : '/claims'} className="button button-outline">Cancel</Link>
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? <><LoaderCircle size={16} className="spin" /> Saving…</> : mode === 'edit' ? 'Save changes' : 'Create claim'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
  placeholder,
  type = 'text',
  required = false,
  min,
  step,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
  prefix?: string;
}) {
  return (
    <label className="field-label">{label}{required && <span className="required-mark"> *</span>}
      {hint && <small className="field-hint">{hint}</small>}
      <span className={prefix ? 'input-with-prefix' : undefined}>
        {prefix && <span>{prefix}</span>}
        <input className="form-control" type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} min={min} step={step} />
      </span>
    </label>
  );
}
