import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileText,
  HeartPulse,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Upload,
  type LucideIcon,
} from 'lucide-react';
import Brand from './Brand';

const navigation = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
];

const features: { title: string; description: string; icon: LucideIcon; tone: string }[] = [
  {
    title: 'AI Denial Analysis',
    description: 'Understand denial codes and uncover the key details behind each decision.',
    icon: Sparkles,
    tone: 'violet',
  },
  {
    title: 'Smart Appeal Letters',
    description: 'Create a clear, structured first draft tailored to the claim and denial reason.',
    icon: FileCheck2,
    tone: 'blue',
  },
  {
    title: 'Claim Management',
    description: 'Keep claim details, statuses, and next steps organized in one workspace.',
    icon: LayoutDashboard,
    tone: 'teal',
  },
  {
    title: 'PDF Claim Upload',
    description: 'Add claim documents to your workflow and keep supporting files together.',
    icon: Upload,
    tone: 'amber',
  },
  {
    title: 'Recovery Tracking',
    description: 'Follow appeal progress and keep an eye on amounts that need attention.',
    icon: BarChart3,
    tone: 'green',
  },
];

const steps: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: 'Upload denied claim',
    description: 'Add claim details and supporting documents to your workspace.',
    icon: Upload,
  },
  {
    title: 'Analyze the denial',
    description: 'Review the denial reason and identify important claim information.',
    icon: Sparkles,
  },
  {
    title: 'Generate an appeal',
    description: 'Prepare a focused appeal letter draft from the details you provide.',
    icon: FileText,
  },
  {
    title: 'Review and submit',
    description: 'Check the draft, make it your own, then submit it to the payer.',
    icon: ClipboardCheck,
  },
];

const benefits = [
  'Spend less time writing appeal drafts by hand.',
  'Make denial details easier to understand.',
  'Keep claim activity organized in one dashboard.',
  'Move through appeal follow-up with a clearer workflow.',
];

function DashboardPreview() {
  return (
    <div className="landing-visual" aria-label="Illustration of the ClaimFlow AI claims dashboard">
      <div className="visual-glow" />
      <div className="visual-float visual-float-top"><span><ShieldCheck size={17} /></span><div><strong>Claim securely organized</strong><small>Documents in one place</small></div><Check size={16} /></div>
      <div className="preview-window">
        <div className="preview-topbar">
          <div className="preview-brand"><span><HeartPulse size={13} /></span><strong>ClaimFlow</strong></div>
          <div className="preview-topbar-right"><span className="preview-avatar">AM</span><span className="preview-menu-dots">•••</span></div>
        </div>
        <div className="preview-body">
          <div className="preview-heading">
            <div><small>MONDAY, OCTOBER 14</small><strong>Your claims overview</strong></div>
            <span className="preview-add">+ New claim</span>
          </div>
          <div className="preview-metrics">
            <div><span>Open claims</span><strong>24</strong><small><i className="preview-dot blue" /> Across your workspace</small></div>
            <div><span>Need attention</span><strong>08</strong><small><i className="preview-dot amber" /> Ready for follow-up</small></div>
            <div><span>In review</span><strong>12</strong><small><i className="preview-dot green" /> Payer response pending</small></div>
          </div>
          <div className="preview-content">
            <div className="preview-chart">
              <div className="preview-section-title"><strong>Appeal activity</strong><span>Last 6 months <ChevronRight size={12} /></span></div>
              <div className="chart-area" aria-hidden="true">
                <div className="chart-grid"><i /><i /><i /></div>
                <div className="chart-bars">
                  {[34, 52, 43, 69, 57, 82, 61, 93, 73, 100, 79, 88].map((height, index) => (
                    <span key={index} style={{ height: `${height}%` }} className={index === 9 ? 'highlight' : ''} />
                  ))}
                </div>
              </div>
              <div className="chart-labels"><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></div>
            </div>
            <div className="preview-opportunity">
              <span className="opportunity-icon"><Sparkles size={15} /></span>
              <small>CLAIM INSIGHT</small>
              <strong>Appeal draft ready for review</strong>
              <p>Denial details are organized and ready for your next step.</p>
              <span className="opportunity-link">Review claim <ArrowUpRight size={12} /></span>
            </div>
          </div>
          <div className="preview-claim-row">
            <span className="claim-file-icon"><FileText size={14} /></span>
            <span className="claim-row-label"><strong>Claim #CL-2048</strong><small>Denial review · Updated today</small></span>
            <span className="claim-row-status"><i /> In progress</span>
            <ArrowUpRight className="claim-row-arrow" size={14} />
          </div>
        </div>
      </div>
      <div className="visual-float visual-float-bottom"><span><Clock3 size={17} /></span><div><strong>A clearer next step</strong><small>Keep appeals moving</small></div><ArrowUpRight size={15} /></div>
      <div className="visual-spark visual-spark-one" aria-hidden="true">✳</div>
      <div className="visual-spark visual-spark-two" aria-hidden="true">✦</div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="landing-page">
      <a className="landing-skip-link" href="#main-content">Skip to content</a>
      <header className="landing-header">
        <div className="landing-header-inner">
          <Brand />
          <nav className="landing-nav" aria-label="Main navigation">
            {navigation.map((item) => <a href={item.href} key={item.label}>{item.label}</a>)}
          </nav>
          <div className="landing-nav-actions">
            <Link className="landing-login" href="/login">Log in</Link>
            <Link className="landing-button landing-button-primary landing-header-cta" href="/register">Get started <ArrowRight size={16} /></Link>
          </div>
        </div>
      </header>

      <section className="landing-hero" id="main-content">
        <div className="landing-container hero-layout">
          <div className="hero-copy">
            <div className="hero-kicker"><span><HeartPulse size={14} /></span> A clearer path from denial to appeal</div>
            <h1>Turn claim denials into <span>successful appeals.</span></h1>
            <p>Analyze denied medical claims, understand denial reasons, and generate AI-powered appeal letters with ease.</p>
            <div className="hero-actions">
              <Link className="landing-button landing-button-primary" href="/register">Get started free <ArrowRight size={17} /></Link>
              <a className="landing-button landing-button-secondary" href="#features">Explore features <ChevronRight size={17} /></a>
            </div>
            <div className="hero-trust"><span className="trust-icon"><ShieldCheck size={15} /></span><span>Designed to bring clarity to your claim workflow</span></div>
          </div>
          <DashboardPreview />
        </div>
        <div className="hero-bottom-wash" aria-hidden="true" />
      </section>

      <section className="landing-section features-section" id="features">
        <div className="landing-container">
          <div className="section-intro">
            <span className="landing-eyebrow">ONE CLEAR WORKFLOW</span>
            <h2>Everything you need to move<br className="desktop-break" /> an appeal forward.</h2>
            <p>Bring claim details, denial insights, and appeal follow-up into one simple workspace.</p>
          </div>
          <div className="feature-grid">
            {features.map(({ title, description, icon: Icon, tone }) => (
              <article className="feature-card" key={title}>
                <span className={`feature-icon ${tone}`}><Icon size={20} strokeWidth={1.8} /></span>
                <h3>{title}</h3>
                <p>{description}</p>
                <a href="#how-it-works" aria-label={`Learn how ${title} works`}><ArrowRight size={16} /></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section how-section" id="how-it-works">
        <div className="landing-container">
          <div className="section-intro">
            <span className="landing-eyebrow">SIMPLE BY DESIGN</span>
            <h2>A practical process, from claim to appeal.</h2>
            <p>Keep the work clear at every step, with your team in control of the final review.</p>
          </div>
          <div className="steps-grid">
            {steps.map(({ title, description, icon: Icon }, index) => (
              <article className="step-card" key={title}>
                <div className="step-top"><span className="step-icon"><Icon size={20} /></span><span className="step-number">0{index + 1}</span></div>
                {index < steps.length - 1 && <span className="step-connector" aria-hidden="true"><ArrowRight size={15} /></span>}
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section benefits-section" id="about">
        <div className="landing-container benefits-layout">
          <div className="benefits-copy">
            <span className="landing-eyebrow">MADE FOR YOUR WORKFLOW</span>
            <h2>More clarity for the work behind every appeal.</h2>
            <p>ClaimFlow AI helps make denial follow-up more organized—so your team can focus on reviewing the details and deciding what comes next.</p>
            <ul>
              {benefits.map((benefit) => <li key={benefit}><span><Check size={14} /></span>{benefit}</li>)}
            </ul>
          </div>
          <div className="benefit-visual">
            <div className="benefit-orb" aria-hidden="true" />
            <div className="benefit-note-card">
              <div className="benefit-note-top"><span><FileCheck2 size={18} /></span><span className="benefit-status"><i /> Ready to review</span></div>
              <small>APPEAL WORKFLOW</small>
              <h3>A clear next step for every claim.</h3>
              <div className="benefit-progress"><span /></div>
              <div className="benefit-checks"><span><Check size={13} /></span>Claim details organized</div>
              <div className="benefit-checks"><span><Check size={13} /></span>Denial reason reviewed</div>
              <div className="benefit-checks pending"><span><Clock3 size={13} /></span>Appeal ready for your review</div>
            </div>
            <div className="benefit-bubble"><span><ShieldCheck size={19} /></span><div><strong>Your review matters</strong><small>Stay in control of every appeal</small></div></div>
          </div>
        </div>
      </section>

      <section className="landing-cta-section">
        <div className="landing-container">
          <div className="landing-cta">
            <div className="cta-decoration cta-decoration-one" aria-hidden="true" />
            <div className="cta-decoration cta-decoration-two" aria-hidden="true" />
            <span className="cta-icon"><HeartPulse size={21} /></span>
            <div className="cta-copy"><span>YOUR WORKFLOW, WITH MORE CLARITY</span><h2>Ready to simplify your claim appeals?</h2><p>Bring your claims and appeal workflow together in one place.</p></div>
            <Link className="landing-button landing-button-white" href="/register">Get started today <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-main">
            <div className="footer-brand-block"><Brand /><p>Clearer claim workflows, from denial review to appeal follow-up.</p></div>
            <div className="footer-links">
              <div><strong>Explore</strong><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#about">About</a></div>
              <div><strong>Your account</strong><Link href="/login">Log in</Link><Link href="/register">Create an account</Link></div>
            </div>
          </div>
          <div className="footer-bottom"><span>© ClaimFlow AI. All rights reserved.</span><span><ShieldCheck size={14} /> A thoughtful tool for your appeal workflow</span></div>
        </div>
      </footer>
    </main>
  );
}
