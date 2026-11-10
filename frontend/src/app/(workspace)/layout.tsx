import { Suspense, type ReactNode } from 'react';
import ProtectedWorkspace from '@/components/ProtectedWorkspace';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="auth-loading"><span className="skeleton-line" /></div>}>
      <ProtectedWorkspace>{children}</ProtectedWorkspace>
    </Suspense>
  );
}
