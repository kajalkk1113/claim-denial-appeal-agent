import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Medical Billing Claim Denial Appeal Agent | Clarity',
  description: 'A clear workspace for managing medical billing claims and denials.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
