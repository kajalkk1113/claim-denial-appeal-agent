'use client';

import { useAuth } from '@/lib/auth';
import { LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  return <div className="simple-page"><div className="page-heading"><div><div className="eyebrow">PREFERENCES</div><h1>Settings</h1><p>Account details and workspace security.</p></div></div>
    <section className="section-card settings-card"><div className="section-card-heading"><div><h2>Your account</h2><p>Profile information associated with this login</p></div><UserRound className="quiet-icon" size={19} /></div>
      <div className="settings-profile"><div className="settings-avatar">{user?.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div><div><strong>{user?.name}</strong><span>{user?.email}</span></div></div>
      <div className="settings-info"><span>Account role</span><strong>{user?.role === 'admin' ? 'Administrator' : 'Member'}</strong></div>
    </section>
    <section className="section-card security-card"><div className="section-card-heading"><div><h2>Security and privacy</h2><p>How your account data is protected</p></div><ShieldCheck className="quiet-icon" size={19} /></div>
      <div className="security-row"><span className="security-row-icon"><LockKeyhole size={17} /></span><div><strong>Token-based authentication</strong><small>Your login session is verified for each API request.</small></div></div>
      <div className="security-row"><span className="security-row-icon"><ShieldCheck size={17} /></span><div><strong>Private claim records</strong><small>Claims and attached documents are scoped to your account.</small></div></div>
    </section>
    <p className="analytics-disclaimer">This prototype is intended for development and evaluation. Do not upload real patient health information or production claim documents until an appropriate security and compliance review is complete.</p>
  </div>;
}
