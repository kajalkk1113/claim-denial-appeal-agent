'use client';

import Link from 'next/link';
import { ArrowDown, ArrowUp, FileText, MoreHorizontal } from 'lucide-react';
import type { ClaimRecord } from '@/lib/api';
import StatusBadge from './StatusBadge';

interface ClaimsTableProps {
  claims: ClaimRecord[];
  onDelete?: (claim: ClaimRecord) => void;
  sort?: 'newest' | 'oldest';
  onSort?: () => void;
  compact?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export default function ClaimsTable({ claims, onDelete, sort = 'newest', onSort, compact = false }: ClaimsTableProps) {
  return (
    <div className="table-scroll">
      <table className="claims-table">
        <thead>
          <tr>
            <th>Claim number</th>
            <th>Patient</th>
            <th>Insurance provider</th>
            <th>Claim amount</th>
            <th>Denial code</th>
            <th>Status</th>
            <th>{onSort ? <button type="button" className="table-sort" onClick={onSort}>
              Submission date {sort === 'newest' ? <ArrowDown size={13} /> : <ArrowUp size={13} />}
            </button> : 'Submission date'}</th>
            <th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr key={claim._id}>
              <td><Link className="claim-number" href={`/claims/${claim._id}`}>{claim.claimNumber}</Link></td>
              <td>
                <div className="patient-cell"><span className="patient-avatar">{claim.patientName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
                  <span><strong>{claim.patientName}</strong><small>{claim.patientId}</small></span>
                </div>
              </td>
              <td className="provider-cell">{claim.insuranceProvider}</td>
              <td><strong>{formatCurrency(claim.claimAmount)}</strong></td>
              <td><span className="code-chip">{claim.denialCode}</span></td>
              <td><StatusBadge status={claim.status} /></td>
              <td className="date-cell">{formatDate(claim.submissionDate)}</td>
              <td>
                <div className="row-actions">
                  <Link href={`/claims/${claim._id}`} className="row-action-link">View</Link>
                  {!compact && onDelete && (
                    <button className="row-more" aria-label={`Delete ${claim.claimNumber}`} title="Delete claim" onClick={() => onDelete(claim)}>
                      <MoreHorizontal size={17} />
                    </button>
                  )}
                  {compact && <Link href={`/claims/${claim._id}`} className="row-more" aria-label="View claim"><FileText size={16} /></Link>}
                </div>
              </td>
            </tr>
          ))}
          {claims.length === 0 && (
            <tr><td colSpan={8}><div className="table-empty"><div className="empty-icon"><FileText size={22} /></div><strong>No claims to show</strong><span>When claims are added, they’ll appear here.</span></div></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
