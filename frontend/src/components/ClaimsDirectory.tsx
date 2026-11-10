'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FilePlus2, LoaderCircle, Search, SlidersHorizontal, X } from 'lucide-react';
import { api, CLAIM_STATUSES, getApiError, type ClaimRecord, type ClaimStatus } from '@/lib/api';
import { useToast } from '@/lib/toast';
import ClaimsTable from './ClaimsTable';

interface PageMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function ClaimsDirectory() {
  const { showToast } = useToast();
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [pagination, setPagination] = useState<PageMeta>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClaimRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    api.get<{ data: ClaimRecord[]; pagination: PageMeta }>('/claims', {
      params: { page: pagination.page, limit: pagination.limit, search: query, status, sort },
    })
      .then(({ data }) => {
        if (!active) return;
        setClaims(data.data);
        setPagination(data.pagination);
        setLoadError('');
      })
      .catch((error: unknown) => {
        if (active) {
          const message = getApiError(error, 'Could not load claims.');
          setLoadError(message);
          showToast(message, 'error');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [pagination.page, pagination.limit, query, status, sort, refreshKey, showToast]);

  function updateFilter(update: () => void) {
    setLoading(true);
    setPagination((current) => ({ ...current, page: 1 }));
    update();
  }

  async function deleteClaim() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data } = await api.delete<{ warning?: string }>(`/claims/${deleteTarget._id}`);
      showToast(data.warning ?? 'Claim deleted.', data.warning ? 'error' : 'success');
      setDeleteTarget(null);
      setLoading(true);
      if (claims.length === 1 && pagination.page > 1) {
        setPagination((current) => ({ ...current, page: current.page - 1 }));
      } else {
        setRefreshKey((current) => current + 1);
      }
    } catch (error) {
      showToast(getApiError(error, 'Unable to delete claim.'), 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="claims-page">
      <div className="page-heading">
        <div><div className="eyebrow">CLAIM MANAGEMENT</div><h1>Claims</h1><p>Search, review, and manage the claims in your workspace.</p></div>
        <Link href="/claims/new" className="button button-primary"><FilePlus2 size={17} /> Add claim</Link>
      </div>

      <section className="section-card claims-directory-card">
        <div className="directory-toolbar">
          <div className="directory-title"><div><h2>All claims</h2><p>{loading ? 'Updating your claim list…' : `${pagination.total} ${pagination.total === 1 ? 'claim' : 'claims'} in your workspace`}</p></div></div>
          <div className="directory-filters">
            <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => updateFilter(() => setSearch(event.target.value))} placeholder="Search patient or claim…" aria-label="Search claims" />{search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}><X size={15} /></button>}</label>
            <label className="select-filter"><SlidersHorizontal size={15} /><select aria-label="Filter by status" value={status} onChange={(event) => updateFilter(() => setStatus(event.target.value as ClaimStatus | ''))}><option value="">All statuses</option>{CLAIM_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <button type="button" className="button button-outline sort-button" onClick={() => { setLoading(true); setSort((current) => current === 'newest' ? 'oldest' : 'newest'); }}>{sort === 'newest' ? 'Newest first' : 'Oldest first'}</button>
          </div>
        </div>
        {loading ? <ClaimsSkeleton /> : loadError ? <div className="load-error load-error-inline"><Search size={19} /><div><strong>Claims could not be loaded</strong><span>{loadError}</span></div><button className="button button-outline button-small" type="button" onClick={() => { setLoading(true); setRefreshKey((key) => key + 1); }}>Try again</button></div> : claims.length > 0 ? <ClaimsTable claims={claims} onDelete={setDeleteTarget} sort={sort} onSort={() => { setLoading(true); setSort((current) => current === 'newest' ? 'oldest' : 'newest'); }} /> : <FilteredEmpty hasFilters={Boolean(query || status)} onReset={() => updateFilter(() => { setSearch(''); setStatus(''); })} />}
        <div className="table-footer">
          <span>{pagination.total ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}` : 'No results'}</span>
          <div className="pagination-controls">
            <button type="button" className="button button-outline button-small" disabled={pagination.page <= 1 || loading} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page - 1 })); }}>Previous</button>
            <span>Page {pagination.page} of {Math.max(pagination.pages, 1)}</span>
            <button type="button" className="button button-outline button-small" disabled={pagination.page >= pagination.pages || loading} onClick={() => { setLoading(true); setPagination((current) => ({ ...current, page: current.page + 1 })); }}>Next</button>
          </div>
        </div>
      </section>

      {deleteTarget && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setDeleteTarget(null); }}>
        <section className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description">
          <div className="confirm-icon"><X size={21} /></div><h2 id="delete-title">Delete this claim?</h2>
          <p id="delete-description">Claim <strong>{deleteTarget.claimNumber}</strong> and its uploaded document will be permanently removed. This can’t be undone.</p>
          <div className="confirm-actions"><button type="button" className="button button-outline" disabled={deleting} onClick={() => setDeleteTarget(null)}>Cancel</button><button type="button" className="button button-danger" disabled={deleting} onClick={deleteClaim}>{deleting ? <><LoaderCircle size={16} className="spin" /> Deleting…</> : 'Delete claim'}</button></div>
        </section>
      </div>}
    </div>
  );
}

function ClaimsSkeleton() {
  return <div className="table-skeleton claims-list-skeleton" role="status" aria-label="Loading claims">{Array.from({ length: 6 }, (_, index) => <div key={index}><span className="skeleton-line" /><span className="skeleton-line" /><span className="skeleton-line" /><span className="skeleton-line" /></div>)}</div>;
}

function FilteredEmpty({ hasFilters, onReset }: { hasFilters: boolean; onReset: () => void }) {
  return <div className="empty-dashboard filtered-empty"><div className="empty-icon"><Search size={23} /></div><h3>{hasFilters ? 'No matching claims' : 'No claims yet'}</h3><p>{hasFilters ? 'Try adjusting your search or clearing the status filter.' : 'Add a claim to start organizing your denial and appeal workflow.'}</p>{hasFilters ? <button className="button button-outline" onClick={onReset}>Clear filters</button> : <Link className="button button-primary" href="/claims/new"><FilePlus2 size={16} /> Add a claim</Link>}</div>;
}
