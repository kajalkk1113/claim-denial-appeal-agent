'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileCheck2, LoaderCircle } from 'lucide-react';
import { api, getApiError, type ClaimRecord } from '@/lib/api';
import { useToast } from '@/lib/toast';
import StatusBadge from '@/components/StatusBadge';

export default function AppealsPage() {
  const { showToast } = useToast();
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get<{ data: ClaimRecord[] }>('/claims', { params: { limit: 100 } })
      .then(({ data }) => setClaims(data.data.filter((claim) => claim.status === 'Appeal Drafted' || claim.status === 'Appealed')))
      .catch((error: unknown) => showToast(getApiError(error, 'Unable to load appeals.'), 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);
  return <div className="simple-page"><div className="page-heading"><div><div className="eyebrow">FOLLOW-UP WORKSPACE</div><h1>Appeals</h1><p>Claims marked as drafted or appealed, gathered in one place.</p></div></div>
    <section className="section-card simple-list-card"><div className="section-card-heading"><div><h2>Appeal tracking</h2><p>Appeal generation is not enabled in this phase.</p></div><FileCheck2 className="quiet-icon" size={20} /></div>
      {loading ? <div className="loading-page"><LoaderCircle size={18} className="spin" /> Loading appeals…</div> : claims.length ? <div className="appeal-list">{claims.map((claim) => <Link className="appeal-row" key={claim._id} href={`/claims/${claim._id}`}><span className="appeal-file-icon"><FileCheck2 size={18} /></span><span className="appeal-row-copy"><strong>{claim.claimNumber} · {claim.patientName}</strong><small>{claim.insuranceProvider} · {claim.denialCode}</small></span><StatusBadge status={claim.status} /><ArrowRight size={16} className="quiet-icon" /></Link>)}</div> : <div className="empty-dashboard"><div className="empty-icon"><FileCheck2 size={22} /></div><h3>No appeals to track yet</h3><p>When a claim moves to “Appeal Drafted” or “Appealed,” it will show up here.</p><Link className="text-link" href="/claims">Browse claims <ArrowRight size={15} /></Link></div>}
    </section>
  </div>;
}
