import { Suspense } from 'react';
import Dashboard from '@/components/Dashboard';
import ProtectedWorkspace from '@/components/ProtectedWorkspace';

export default function HomePage() {
  return (
    <Suspense fallback={<div className="auth-loading"><span className="skeleton-line" /></div>}>
      <ProtectedWorkspace><Dashboard /></ProtectedWorkspace>
    </Suspense>
  );
}
