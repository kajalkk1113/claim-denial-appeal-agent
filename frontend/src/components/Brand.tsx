import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import type { MouseEventHandler } from 'react';

type BrandProps = {
  variant?: 'landing' | 'auth' | 'workspace';
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export default function Brand({ variant = 'landing', href = '/', onClick }: BrandProps) {
  return (
    <Link
      className={`claimflow-brand claimflow-brand-${variant}`}
      href={href}
      onClick={onClick}
      aria-label={variant === 'workspace' ? 'ClaimFlow AI dashboard' : 'ClaimFlow AI home'}
    >
      <span className="claimflow-brand-icon"><HeartPulse size={21} strokeWidth={2.2} /></span>
      <span className="claimflow-brand-name">ClaimFlow <strong>AI</strong></span>
    </Link>
  );
}
