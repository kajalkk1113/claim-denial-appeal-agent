'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, getApiError, type ClaimRecord } from '@/lib/api';
import { useToast } from '@/lib/toast';
import ClaimForm from '@/components/ClaimForm';

export default function EditClaimPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [claim, setClaim] = useState<ClaimRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: ClaimRecord }>(`/claims/${id}`)
      .then(({ data }) => setClaim(data.data))
      .catch((error: unknown) => showToast(getApiError(error, 'Unable to load this claim.'), 'error'))
      .finally(() => setLoading(false));
  }, [id, showToast]);

  if (loading) return <div className="loading-page" role="status">Loading claim…</div>;
  if (!claim) return <div className="not-found-card"><h2>Claim not available</h2><p>This claim may have been deleted or is not in your workspace.</p></div>;
  return <ClaimForm initial={claim} mode="edit" />;
}
