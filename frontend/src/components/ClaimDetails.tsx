'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, Download, FileText, LoaderCircle, Pencil, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { api, getApiError, type ClaimRecord } from '@/lib/api';
import { useToast } from '@/lib/toast';
import StatusBadge from './StatusBadge';

function money(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}
function date(value: string): string {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));
}

export default function ClaimDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [claim, setClaim] = useState<ClaimRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [documentUrl, setDocumentUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    api.get<{ data: ClaimRecord }>(`/claims/${id}`)
      .then(({ data }) => {
        if (active) {
          setClaim(data.data);
          setLoadError('');
        }
      })
      .catch((error: unknown) => {
        if (active) {
          const message = getApiError(error, 'Unable to load claim.');
          setLoadError(message);
          showToast(message, 'error');
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, refreshKey, showToast]);
  useEffect(() => () => { if (documentUrl) URL.revokeObjectURL(documentUrl); }, [documentUrl]);

  async function previewDocument() {
    if (!claim) return;
    setPreviewLoading(true);
    try {
      const { data } = await api.get<Blob>(`/claims/${claim._id}/document`, { responseType: 'blob' });
      setDocumentUrl(URL.createObjectURL(data));
    } catch (error) {
      showToast(getApiError(error, 'Unable to open the uploaded document.'), 'error');
    } finally {
      setPreviewLoading(false);
    }
  }

  async function deleteClaim() {
    if (!claim) return;
    setDeleting(true);
    try {
      const { data } = await api.delete<{ warning?: string }>(`/claims/${claim._id}`);
      showToast(data.warning ?? 'Claim deleted.', data.warning ? 'error' : 'success');
      router.replace('/claims');
    } catch (error) {
      showToast(getApiError(error, 'Unable to delete claim.'), 'error');
      setDeleting(false);
    }
  }

  if (loading) return <DetailsSkeleton />;
  if (!claim) return <div className="not-found-card"><div className="empty-icon"><FileText size={23} /></div><h2>{loadError ? 'Unable to load claim' : 'Claim not available'}</h2><p>{loadError || 'This claim may have been deleted or is not in your workspace.'}</p>{loadError && <button className="button button-outline" type="button" onClick={() => { setLoading(true); setRefreshKey((key) => key + 1); }}>Try again</button>}<Link className="button button-outline" href="/claims"><ArrowLeft size={16} /> Back to claims</Link></div>;

  return (
    <div className="details-page">
      <Link href="/claims" className="back-link"><ArrowLeft size={16} /> Back to claims</Link>
      <div className="detail-heading">
        <div><div className="eyebrow">CLAIM RECORD · {claim.claimNumber}</div><div className="detail-title-row"><h1>{claim.patientName}</h1><StatusBadge status={claim.status} /></div><p>{claim.insuranceProvider} <span>·</span> Patient ID {claim.patientId}</p></div>
        <div className="detail-actions"><Link href={`/claims/${claim._id}/edit`} className="button button-outline"><Pencil size={16} /> Edit claim</Link><button type="button" className="button button-danger-outline" onClick={() => setDeleteOpen(true)}><Trash2 size={16} /> Delete</button></div>
      </div>

      <section className="detail-money-card">
        <div className="detail-money-main"><span>Claim amount</span><strong>{money(claim.claimAmount)}</strong><small>Submitted {date(claim.submissionDate)}</small></div>
        <div className="money-divider" />
        <div className="detail-money-main"><span>Denied amount</span><strong className="denied-amount">{money(claim.deniedAmount)}</strong><small>{claim.denialCode} · {claim.diagnosisCode}</small></div>
        <div className="detail-money-art"><div className="money-art-icon"><ShieldCheck size={23} /></div><span>CLAIM WORKSPACE</span><strong>All in one place</strong></div>
      </section>

      <div className="detail-columns">
        <div className="detail-main-column">
          <section className="section-card detail-section">
            <div className="section-card-heading"><div><h2>Claim information</h2><p>Core claim and coverage details</p></div><FileText className="quiet-icon" size={19} /></div>
            <div className="detail-fields">
              <Info label="Claim number" value={claim.claimNumber} />
              <Info label="Patient name" value={claim.patientName} />
              <Info label="Patient ID" value={claim.patientId} />
              <Info label="Provider name" value={claim.providerName} />
              <Info label="Insurance provider" value={claim.insuranceProvider} />
              <Info label="Policy number" value={claim.policyNumber || 'Not provided'} />
              <Info label="Date of service" value={date(claim.serviceDate)} />
              <Info label="Submission date" value={date(claim.submissionDate)} />
            </div>
          </section>
          <section className="section-card detail-section">
            <div className="section-card-heading"><div><h2>Denial information</h2><p>Reason and coding attached to this claim</p></div><CalendarDays className="quiet-icon" size={18} /></div>
            <div className="denial-info"><div className="denial-code-block"><span>DENIAL CODE</span><strong>{claim.denialCode}</strong></div><div className="denial-code-block"><span>DIAGNOSIS CODE</span><strong>{claim.diagnosisCode}</strong></div><div className="denial-reason"><span>Denial reason</span><p>{claim.denialReason}</p></div></div>
          </section>
        </div>
        <aside className="detail-side-column">
          <section className="section-card document-card">
            <div className="section-card-heading"><div><h2>Supporting document</h2><p>Uploaded claim attachment</p></div><Upload className="quiet-icon" size={18} /></div>
            {claim.uploadedDocument ? <div className="document-file"><span className="pdf-icon">PDF</span><span className="document-meta"><strong>{claim.uploadedDocument.originalName}</strong><small>{(claim.uploadedDocument.size / 1024 / 1024).toFixed(2)} MB · PDF document</small></span><button type="button" className="icon-button" title="Preview PDF" aria-label="Preview PDF" disabled={previewLoading} onClick={previewDocument}>{previewLoading ? <LoaderCircle size={17} className="spin" /> : <Download size={17} />}</button></div> : <div className="no-document"><div className="empty-icon"><FileText size={20} /></div><strong>No document attached</strong><span>Attach a PDF to keep source records with this claim.</span><Link href={`/claims/${claim._id}/edit`} className="text-link">Add a document</Link></div>}
            <div className="document-note"><ShieldCheck size={15} /> Only your account can access this file.</div>
          </section>
          <section className="next-step-card"><div className="next-step-icon"><ShieldCheck size={19} /></div><span className="eyebrow">NEXT STEP</span><h2>Keep your documentation organized.</h2><p>Review the payer’s denial reason and attach any relevant supporting records.</p><Link href={`/claims/${claim._id}/edit`}>Update this claim <span>→</span></Link></section>
        </aside>
      </div>

      {documentUrl && <div className="preview-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { URL.revokeObjectURL(documentUrl); setDocumentUrl(''); } }}><section className="pdf-preview" role="dialog" aria-modal="true" aria-label="Claim document preview"><div className="pdf-preview-head"><strong>{claim.uploadedDocument?.originalName}</strong><button className="button button-outline button-small" type="button" onClick={() => { URL.revokeObjectURL(documentUrl); setDocumentUrl(''); }}>Close</button></div><iframe title="Uploaded claim document" src={documentUrl} /></section></div>}
      {deleteOpen && <div className="modal-backdrop" role="presentation"><section className="confirm-modal" role="alertdialog" aria-modal="true"><div className="confirm-icon"><Trash2 size={20} /></div><h2>Delete this claim?</h2><p>Claim <strong>{claim.claimNumber}</strong> and its attached document will be permanently removed.</p><div className="confirm-actions"><button className="button button-outline" disabled={deleting} onClick={() => setDeleteOpen(false)}>Cancel</button><button className="button button-danger" disabled={deleting} onClick={deleteClaim}>{deleting ? <><LoaderCircle size={15} className="spin" /> Deleting…</> : 'Delete claim'}</button></div></section></div>}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="info-item"><span>{label}</span><strong>{value}</strong></div>;
}

function DetailsSkeleton() {
  return <div className="details-loading" role="status" aria-label="Loading claim"><span className="skeleton-line" /><span className="skeleton-line" /><div className="skeleton-panel" /><div className="skeleton-panel" /></div>;
}
