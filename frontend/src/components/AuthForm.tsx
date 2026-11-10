'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import Brand from '@/components/Brand';
import { getApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register';
  const { user, loading, login, register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (isRegister && name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Your password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) await register(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
      showToast(isRegister ? 'Your account is ready.' : 'Welcome back.');
      router.replace('/dashboard');
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to authenticate. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-brand"><Brand variant="auth" /></div>
      <section className="auth-card">
        <div className="auth-symbol"><ShieldCheck size={24} /></div>
        <div className="eyebrow">{isRegister ? 'GET STARTED' : 'WELCOME BACK'}</div>
        <h1>{isRegister ? 'Create your account' : 'Sign in to your workspace'}</h1>
        <p className="auth-subtitle">{isRegister ? 'Start bringing clarity to your claim workflow.' : 'Your claims workspace is ready when you are.'}</p>

        <form className="auth-form" onSubmit={submit}>
          {isRegister && <label className="field-label">Full name
            <span className="auth-input-wrap"><UserRound size={17} /><input className="form-control" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" autoComplete="name" required minLength={2} maxLength={100} /></span>
          </label>}
          <label className="field-label">Work email
            <span className="auth-input-wrap"><Mail size={17} /><input className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@organization.com" autoComplete="email" required /></span>
          </label>
          <label className="field-label">Password
            <span className="auth-input-wrap"><LockKeyhole size={17} /><input className="form-control" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={8} maxLength={72} /><button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((show) => !show)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
          </label>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <button type="submit" className="button button-primary auth-submit" disabled={submitting}>
            {submitting ? <><LoaderCircle size={17} className="spin" /> Please wait…</> : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="auth-switch">{isRegister ? 'Already have an account?' : 'New to ClaimFlow AI?'} <Link href={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></div>
        <div className="auth-security"><LockKeyhole size={14} /> Your account is protected with encrypted authentication.</div>
      </section>
      <footer className="auth-footer"><span>ClaimFlow AI</span><span>Privacy · Security · Support</span></footer>
    </main>
  );
}
