'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Bell,
  ChevronDown,
  FileCheck2,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

const navigation = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Claims', href: '/claims', icon: FileText },
  { label: 'Upload claim', href: '/upload', icon: Upload },
  { label: 'Appeals', href: '/appeals', icon: FileCheck2 },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

function routeTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/claims/new')) return 'New claim';
  if (pathname.includes('/edit')) return 'Edit claim';
  if (pathname.startsWith('/claims/')) return 'Claim details';
  return navigation.find((item) => item.href === pathname)?.label ?? 'Workspace';
}

export default function ProtectedWorkspace({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="auth-loading" role="status" aria-label="Loading workspace">
        <div className="loading-mark"><ShieldCheck size={24} /></div>
        <span className="skeleton-line" />
      </div>
    );
  }

  return (
    <div className="workspace">
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <Link href="/" onClick={() => setSidebarOpen(false)}>
            <span className="brand-icon"><ShieldCheck size={22} strokeWidth={2.2} /></span>
            <span className="brand-copy"><strong>clarity</strong><small>CLAIM INTELLIGENCE</small></span>
          </Link>
          <button type="button" className="sidebar-close" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">NC</div>
          <div><strong>Northstar Care</strong><small>Workspace</small></div>
          <ChevronDown size={16} />
        </div>

        <div className="nav-section-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = href === '/'
              ? pathname === '/'
              : pathname === href || (href === '/claims' && pathname.startsWith('/claims/'));
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)} className={`side-nav-link ${active ? 'active' : ''}`}>
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
                {label === 'Claims' && <span className="nav-dot" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="support-card">
            <div className="support-icon"><Activity size={17} /></div>
            <strong>Appeals, made clearer.</strong>
            <p>Keep every claim organized and moving forward.</p>
            <Link href="/claims/new">Create a claim <span aria-hidden="true">→</span></Link>
          </div>
          <button className="profile-button" type="button" onClick={() => setMenuOpen((open) => !open)}>
            <div className="profile-avatar">{user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div>
            <div className="profile-copy"><strong>{user.name}</strong><small>{user.email}</small></div>
            <ChevronDown size={16} />
          </button>
          {menuOpen && (
            <div className="profile-menu">
              <button type="button" onClick={() => { setMenuOpen(false); logout(); }}>
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="workspace-main">
        <header className="topbar">
          <button className="mobile-menu" type="button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>
            <Menu size={21} />
          </button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{routeTitle(pathname)}</strong></div>
          <div className="topbar-actions">
            <span className="secure-chip"><span /> HIPAA-minded workspace</span>
            <button type="button" className="icon-button notification-button" aria-label="Notifications">
              <Bell size={18} /><i />
            </button>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
