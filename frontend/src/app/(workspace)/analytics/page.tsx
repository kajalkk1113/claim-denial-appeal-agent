'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { BarChart3, CircleDollarSign, ClipboardList, FileWarning } from 'lucide-react';
import { api, getApiError, type ClaimStatus, type ClaimStats } from '@/lib/api';
import { useToast } from '@/lib/toast';

const initialStats: ClaimStats = { totalClaims: 0, deniedClaims: 0, pendingClaims: 0, totalClaimAmount: 0, totalDeniedAmount: 0, statusCounts: {} };
const currency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export default function AnalyticsPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    api.get<{ data: ClaimStats }>('/claims/stats')
      .then(({ data }) => { setStats(data.data); setLoadError(''); })
      .catch((error: unknown) => {
        const message = getApiError(error, 'Unable to load analytics.');
        setLoadError(message);
        showToast(message, 'error');
      })
      .finally(() => setLoading(false));
  }, [showToast, refreshKey]);
  const statuses: ClaimStatus[] = ['Submitted', 'Denied', 'Under Review', 'Appeal Drafted', 'Appealed', 'Approved', 'Recovered'];
  const statusCounts = statuses.map((status) => ({ status, count: stats.statusCounts[status] ?? 0 }));
  const maximum = Math.max(...statusCounts.map((item) => item.count), 1);
  const recoveryRate = stats.totalClaims ? Math.round(((stats.statusCounts.Recovered ?? 0) / stats.totalClaims) * 100) : 0;

  return <div className="simple-page"><div className="page-heading"><div><div className="eyebrow">WORKSPACE OVERVIEW</div><h1>Analytics</h1><p>Understand claim volume and status across your workspace.</p></div></div>
    {loadError ? <section className="load-error"><BarChart3 size={20} /><div><strong>Analytics are unavailable</strong><span>{loadError}</span></div><button className="button button-outline button-small" type="button" onClick={() => { setLoading(true); setRefreshKey((key) => key + 1); }}>Try again</button></section> : <>
    <div className="analytics-metrics">
      <AnalyticsMetric title="Claims tracked" value={loading ? '—' : String(stats.totalClaims)} icon={<ClipboardList size={18} />} />
      <AnalyticsMetric title="Claim value" value={loading ? '—' : currency(stats.totalClaimAmount)} icon={<CircleDollarSign size={18} />} />
      <AnalyticsMetric title="Denied value" value={loading ? '—' : currency(stats.totalDeniedAmount)} icon={<FileWarning size={18} />} />
      <AnalyticsMetric title="Recovered claims" value={loading ? '—' : `${recoveryRate}%`} icon={<BarChart3 size={18} />} />
    </div>
    <div className="analytics-grid">
      <section className="section-card analytics-chart-card"><div className="section-card-heading"><div><h2>Claims by status</h2><p>Distribution of tracked claims</p></div><span className="chart-period">All time</span></div>
        {loading ? <div className="loading-page">Loading analytics…</div> : <div className="status-chart">{statusCounts.map(({ status, count }) => <div className="chart-row" key={status}><span>{status}</span><div className="chart-track"><div className={`chart-bar ${status === 'Denied' ? 'chart-bar-rose' : ''}`} style={{ width: `${count ? Math.max((count / maximum) * 100, 4) : 0}%` }} /></div><strong>{count}</strong></div>)}</div>}
      </section>
      <section className="section-card analytics-summary"><div className="section-card-heading"><div><h2>At a glance</h2><p>Key things to keep in view</p></div></div>
        <div className="summary-stat"><span>Pending claims</span><strong>{loading ? '—' : stats.pendingClaims}</strong><small>Submitted or under review</small></div>
        <div className="summary-stat"><span>Denied claims</span><strong>{loading ? '—' : stats.deniedClaims}</strong><small>Claims requiring follow-up</small></div>
        <div className="summary-stat"><span>Denial rate</span><strong>{loading || !stats.totalClaims ? '—' : `${Math.round((stats.deniedClaims / stats.totalClaims) * 100)}%`}</strong><small>Denied claims as a share of total</small></div>
      </section>
    </div>
    <p className="analytics-disclaimer">Analytics reflect claims in your account only. This initial workspace reports totals from recorded claim data and does not provide predictive or clinical recommendations.</p>
    </>}
  </div>;
}

function AnalyticsMetric({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return <article className="metric-card analytics-metric-card"><span className="metric-icon blue">{icon}</span><span className="metric-note">{title}</span><strong className="metric-value">{value}</strong></article>;
}
