'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  ClipboardList,
  FilePlus2,
  FileText,
  Hourglass,
  TrendingUp,
} from 'lucide-react';
import { api, getApiError, type ClaimRecord, type ClaimStats } from '@/lib/api';
import { useToast } from '@/lib/toast';
import ClaimsTable from './ClaimsTable';

const emptyStats: ClaimStats = { totalClaims: 0, deniedClaims: 0, pendingClaims: 0, totalClaimAmount: 0, totalDeniedAmount: 0, statusCounts: {} };

function currency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function Dashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<ClaimStats>(emptyStats);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get<{ data: ClaimStats }>('/claims/stats'),
      api.get<{ data: ClaimRecord[] }>('/claims', { params: { limit: 5, sort: 'newest' } }),
    ])
      .then(([statsResponse, claimsResponse]) => {
        setStats(statsResponse.data.data);
        setClaims(claimsResponse.data.data);
        setLoadError('');
      })
      .catch((error: unknown) => {
        const message = getApiError(error, 'Could not load dashboard data.');
        setLoadError(message);
        showToast(message, 'error');
      })
      .finally(() => setLoading(false));
  }, [showToast, refreshKey]);

  return (
    <div className="dashboard-page">
      <div className="page-heading dashboard-heading">
        <div><div className="eyebrow">CLAIMS OVERVIEW</div><h1>Your claims at a glance</h1><p>A clear view of your claim activity and follow-up priorities.</p></div>
        <Link href="/claims/new" className="button button-primary"><FilePlus2 size={17} /> New claim</Link>
      </div>

      <section className="dashboard-banner">
        <div className="banner-orb banner-orb-one" /><div className="banner-orb banner-orb-two" />
        <div className="banner-content"><span className="banner-label"><span /> YOUR WORKSPACE IS UP TO DATE</span>
          <h2>Every claim has a next step.</h2><p>Track denials, organize supporting documents, and keep your team moving forward.</p>
          <Link href="/claims" className="banner-link">Explore your claims <ArrowRight size={16} /></Link>
        </div>
        <div className="banner-art"><div className="art-ring"><div className="art-card"><div className="art-card-icon"><FileText size={20} /></div><div><span>Claim workflow</span><strong>On track</strong></div><i><ArrowUpRight size={15} /></i></div><div className="art-progress"><span /><span /><span /><span /></div></div></div>
      </section>

      {loadError ? <section className="load-error"><FileText size={20} /><div><strong>Dashboard data is unavailable</strong><span>{loadError}</span></div><button className="button button-outline button-small" type="button" onClick={() => { setLoading(true); setRefreshKey((key) => key + 1); }}>Try again</button></section> : <>
      <section className="metric-grid" aria-label="Claims summary">
        <MetricCard title="Total claims" value={String(stats.totalClaims)} note="All claims in your workspace" icon={<ClipboardList size={18} />} color="blue" loading={loading} />
        <MetricCard title="Denied claims" value={String(stats.deniedClaims)} note="Claims that need attention" icon={<ArrowDownRight size={18} />} color="rose" loading={loading} />
        <MetricCard title="Pending claims" value={String(stats.pendingClaims)} note="Submitted or under review" icon={<Hourglass size={18} />} color="amber" loading={loading} />
        <MetricCard title="Total claim amount" value={currency(stats.totalClaimAmount)} note={`${currency(stats.totalDeniedAmount)} currently denied`} icon={<CircleDollarSign size={18} />} color="green" loading={loading} />
      </section>

      <section className="section-card recent-claims">
        <div className="section-card-heading"><div><h2>Recent claims</h2><p>Your latest claim activity</p></div><Link href="/claims" className="text-link">View all claims <ArrowRight size={15} /></Link></div>
        {loading ? <TableSkeleton /> : claims.length > 0 ? <ClaimsTable claims={claims} compact /> : <EmptyDashboard />}
      </section>

      <div className="dashboard-bottom">
        <section className="section-card workflow-card">
          <div className="section-card-heading"><div><h2>Keep your workflow moving</h2><p>Pick up where you left off.</p></div><TrendingUp className="quiet-icon" size={20} /></div>
          <div className="workflow-actions">
            <Link href="/claims/new" className="workflow-action"><span className="workflow-action-icon blue"><FilePlus2 size={18} /></span><span><strong>Add a claim</strong><small>Record the key claim details</small></span><ArrowRight size={16} /></Link>
            <Link href="/upload" className="workflow-action"><span className="workflow-action-icon violet"><FileText size={18} /></span><span><strong>Upload a document</strong><small>Attach a PDF to a claim</small></span><ArrowRight size={16} /></Link>
          </div>
        </section>
        <section className="section-card dashboard-note"><div className="note-icon"><ShieldCheckIcon /></div><div className="eyebrow">A NOTE ON YOUR DATA</div><h2>Built for thoughtful workflows.</h2><p>Claim data is visible only to the account that created it. This workspace is an organizational tool and is not a substitute for clinical or legal advice.</p></section>
      </div>
      </>}
    </div>
  );
}

function MetricCard({ title, value, note, icon, color, loading }: { title: string; value: string; note: string; icon: ReactNode; color: string; loading: boolean }) {
  return <article className="metric-card"><div className="metric-top"><span>{title}</span><span className={`metric-icon ${color}`}>{icon}</span></div>{loading ? <><span className="skeleton-line metric-value-skeleton" /><span className="skeleton-line metric-note-skeleton" /></> : <><strong className="metric-value">{value}</strong><span className="metric-note">{note}</span></>}</article>;
}

function TableSkeleton() {
  return <div className="table-skeleton" aria-label="Loading claims">{Array.from({ length: 4 }, (_, index) => <div key={index}><span className="skeleton-line" /><span className="skeleton-line" /><span className="skeleton-line" /></div>)}</div>;
}

function EmptyDashboard() {
  return <div className="empty-dashboard"><div className="empty-icon"><FileText size={24} /></div><h3>Your claim list starts here</h3><p>Create your first claim record to track status, payer details, and supporting documents in one place.</p><Link className="button button-primary" href="/claims/new"><FilePlus2 size={16} /> Add your first claim</Link></div>;
}

function ShieldCheckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 3 19 6v5c0 4.7-3 8-7 10-4-2-7-5.3-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
}
