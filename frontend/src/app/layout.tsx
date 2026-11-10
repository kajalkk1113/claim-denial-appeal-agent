import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClaimFlow AI',
  description: 'Analyze denied medical claims, understand denial reasons, and organize your appeal workflow with ClaimFlow AI.',
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
