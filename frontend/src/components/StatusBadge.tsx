import type { ClaimStatus } from '@/lib/api';

const statusClass: Record<ClaimStatus, string> = {
  Submitted: 'status-submitted',
  Denied: 'status-denied',
  'Under Review': 'status-review',
  'Appeal Drafted': 'status-drafted',
  Appealed: 'status-appealed',
  Approved: 'status-approved',
  Recovered: 'status-recovered',
};

export default function StatusBadge({ status }: { status: ClaimStatus }) {
  return <span className={`status-badge ${statusClass[status]}`}>{status}</span>;
}
