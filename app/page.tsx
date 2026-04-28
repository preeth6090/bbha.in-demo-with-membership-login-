import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <>
      <style>{`
        html { scroll-behavior: smooth; }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up  { animation: fade-up 0.75s ease both; }
        .delay-1  { animation-delay: 0.1s; }
        .delay-2  { animation-delay: 0.22s; }
        .delay-3  { animation-delay: 0.34s; }
        .delay-4  { animation-delay: 0.46s; }

        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: inline-flex;
          white-space: nowrap;
          animation: ticker 38s linear infinite;
        }
        .ticker-track:hover { animation-play-state: paused; }

        .hero-bg {
          background: linear-gradient(155deg, #3D0A12 0%, #6B1427 60%, #4A0E1B 100%);
        }
        .lift {
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .lift:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.09);
        }
        .nav-link {
          position: relative;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.15s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          left: 0; bottom: -2px;
          width: 0; height: 2px;
          background: #6B1427;
          transition: width 0.2s ease;
        }
        .nav-link:hover { color: #6B1427; }
        .nav-link:hover::after { width: 100%; }

        .social-btn { border-color: #6B1427; color: #6B1427; transition: background 0.15s, color 0.15s; }
        .social-btn:hover { background-color: #6B1427; color: #fff; }

        .pill-check {
          display: inline-flex; align-items: center; justify-content: center;
          width: 18px; height: 18px; border-radius: 9999px;
          background: #6B1427; color: #fff;
          font-size: 9px; font-weight: 700; flex-shrink: 0; margin-top: 1px;
        }
      `}</style>

      <div className="min-h-screen bg-white font-sans antialiased" style={{ color: '#111827' }}>

        {/* ── NAVBAR ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-white/96 backdrop-blur-md" style={{ borderBottom: '1px solid #f1f0ee' }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">

            <a href="#home" className="flex items-center gap-3">
              <Image src="https://bbha.in/images/logo.png" alt="BBHA" width={40} height={40} unoptimized className="flex-shrink-0" />
              <div className="hidden sm:block">
                <p className="text-[13px] font-bold leading-tight" style={{ color: '#6B1427' }}>Bangalore Hotels Association</p>
                <p className="text-[10px] font-semibold tracking-widest" style={{ color: '#D4A017' }}>REGD. · EST. 1936</p>
              </div>
            </a>

            <nav className="hidden items-center gap-7 lg:flex">
              {[
                { label: 'About',      href: '#about' },
                { label: 'Community',  href: '#community' },
                { label: 'Portal',     href: '#portal' },
                { label: 'Why Join',   href: '#why-join' },
                { label: 'Contact',    href: '#contact' },
              ].map(({ label, href }) => (
                <a key={label} href={href} className="nav-link">{label}</a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/demo" className="hidden rounded-full border px-4 py-1.5 text-xs font-semibold transition-all sm:block hover:opacity-80" style={{ borderColor: '#6B1427', color: '#6B1427' }}>
                Live Demo
              </Link>
              <Link href="/login" className="rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#6B1427' }}>
                Member Login
              </Link>
              <Link href="/register" className="rounded-full px-4 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#D4A017' }}>
                Join Now
              </Link>
            </div>
          </div>
        </header>

        {/* ── HERO ───────────────────────────────────────────────── */}
        <section id="home" className="hero-bg relative overflow-hidden px-5 pb-24 pt-20 text-white sm:px-8 md:pt-32 md:pb-32">
          {/* Subtle radial glow */}
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 70% 50%, rgba(212,160,23,0.08) 0%, transparent 70%)' }} />

          <div className="relative mx-auto max-w-6xl">
            <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2">

              {/* Copy */}
              <div>
                <div className="fade-up mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)' }}>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: '#D4A017' }} />
                  90 Years of Hospitality Excellence
                </div>

                <h1 className="fade-up delay-1 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                  Karnataka&apos;s<br />
                  <span style={{ color: '#D4A017' }}>Premier</span><br />
                  Hospitality<br />
                  Association
                </h1>

                <p className="fade-up delay-2 mt-7 max-w-md text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Representing 1,000+ hotels, restaurants, and food establishments across Bruhat Bengaluru since 1936. Your business, protected and connected.
                </p>

                <div className="fade-up delay-3 mt-9 flex flex-wrap gap-3">
                  <Link href="/register" className="rounded-full px-7 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl" style={{ backgroundColor: '#D4A017' }}>
                    Apply for Membership →
                  </Link>
                  <Link href="/demo" className="rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-white/18">
                    Explore the Portal
                  </Link>
                </div>

                <div className="fade-up delay-4 mt-12 flex items-center gap-10 border-t pt-8" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  {[
                    { v: '90+',    l: 'Years' },
                    { v: '1,000+', l: 'Members' },
                    { v: '1,050+', l: 'Establishments' },
                  ].map(({ v, l }) => (
                    <div key={l}>
                      <p className="text-3xl font-extrabold" style={{ color: '#D4A017' }}>{v}</p>
                      <p className="mt-0.5 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emblem */}
              <div className="flex justify-center md:justify-end">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(212,160,23,0.18)' }} />
                  <Image src="https://bbha.in/images/logo.png" alt="BBHA Official Seal" width={320} height={320} className="relative" unoptimized />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── TICKER ─────────────────────────────────────────────── */}
        <div className="overflow-hidden py-3.5" style={{ backgroundColor: '#FDF8EE', borderBottom: '1px solid #e8e0cc' }}>
          <div className="ticker-track text-xs font-semibold tracking-wide" style={{ color: '#6B1427' }}>
            <span>{TICKER_TEXT}{TICKER_TEXT}{TICKER_TEXT}{TICKER_TEXT}</span>
          </div>
        </div>

        {/* ── ABOUT ──────────────────────────────────────────────── */}
        <section id="about" className="px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:items-center">

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#D4A017' }}>About BBHA</p>
                <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl" style={{ color: '#111' }}>
                  The voice of Bangalore&apos;s<br />hospitality industry<br />
                  <span style={{ color: '#6B1427' }}>since 1936.</span>
                </h2>
                <p className="mt-6 text-base leading-relaxed" style={{ color: '#4B5563' }}>
                  The Bangalore Hotels Association (Regd.) is the apex body representing hotels, restaurants, bakeries, quick service restaurants, bars, catering businesses, and food establishments across Bruhat Bengaluru Municipal Corporation limits.
                </p>
                <p className="mt-4 text-base leading-relaxed" style={{ color: '#4B5563' }}>
                  We provide collective legal protection, compliance guidance, trade license support, and a connected network of over 1,000 member establishments. BBHA is your establishment&apos;s strongest ally in navigating Karnataka&apos;s hospitality regulatory landscape.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {ABOUT_STATS.map(({ value, label, sub }) => (
                  <div key={label} className="lift rounded-2xl p-6" style={{ backgroundColor: '#FDF8EE', border: '1px solid #e8e0cc' }}>
                    <p className="text-4xl font-extrabold" style={{ color: '#6B1427' }}>{value}</p>
                    <p className="mt-2 text-sm font-semibold" style={{ color: '#1F2937' }}>{label}</p>
                    <p className="mt-0.5 text-xs" style={{ color: '#6B7280' }}>{sub}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ── COMMUNITY ──────────────────────────────────────────── */}
        <section id="community" className="px-5 py-24 sm:px-8" style={{ backgroundColor: '#F9FAFB' }}>
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#D4A017' }}>Our Community</p>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Who we represent</h2>
              <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: '#6B7280' }}>
                Every segment of Bangalore&apos;s food and hospitality industry — from heritage hotels to neighbourhood bakeries.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {COMMUNITY_TYPES.map(({ icon, label }) => (
                <div key={label} className="lift flex flex-col items-center gap-3 rounded-2xl bg-white p-5 text-center shadow-sm" style={{ border: '1px solid #F3F4F6' }}>
                  <span className="text-4xl">{icon}</span>
                  <p className="text-xs font-semibold" style={{ color: '#374151' }}>{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 rounded-3xl p-10 text-white" style={{ background: 'linear-gradient(135deg, #4A0E1B 0%, #6B1427 100%)' }}>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {[
                  { value: '12', label: 'Vendor Categories', desc: 'Food supplies, equipment, linen, housekeeping, IT, pest control & more' },
                  { value: '20+', label: 'Empanelled Suppliers', desc: 'BBHA-vetted vendors with negotiated member-only pricing' },
                  { value: '10', label: 'Verified Badges', desc: 'Recommended, FSSAI Approved, Negotiated Price, Exclusive Partner & more' },
                ].map(({ value, label, desc }) => (
                  <div key={label} className="border-l pl-8" style={{ borderColor: 'rgba(212,160,23,0.4)' }}>
                    <p className="text-4xl font-extrabold" style={{ color: '#D4A017' }}>{value}</p>
                    <p className="mt-2 text-sm font-bold text-white">{label}</p>
                    <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PORTAL FEATURES ────────────────────────────────────── */}
        <section id="portal" className="px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#D4A017' }}>Member Portal</p>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Everything in one place
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base" style={{ color: '#6B7280' }}>
                The BBHA digital portal replaces WhatsApp chases, paper files, and spreadsheets with a clean, mobile-ready platform built specifically for Karnataka hospitality businesses.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link href="/demo" className="rounded-full px-7 py-3 text-sm font-bold text-white shadow transition-all hover:opacity-90" style={{ backgroundColor: '#6B1427' }}>
                  Try Live Demo →
                </Link>
                <Link href="/register" className="rounded-full border px-7 py-3 text-sm font-semibold transition-all hover:opacity-70" style={{ borderColor: '#6B1427', color: '#6B1427' }}>
                  Create Account
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PORTAL_FEATURES.map(({ icon, title, bullets, accent }) => (
                <div key={title} className="lift rounded-2xl p-6" style={{ backgroundColor: accent.bg, border: `1px solid ${accent.border}` }}>
                  <div className="mb-4 text-4xl">{icon}</div>
                  <h3 className="mb-3 text-base font-bold" style={{ color: '#111' }}>{title}</h3>
                  <ul className="space-y-2">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-[13px]" style={{ color: '#4B5563' }}>
                        <span className="pill-check mt-0.5">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY JOIN ───────────────────────────────────────────── */}
        <section id="why-join" className="px-5 py-24 sm:px-8" style={{ backgroundColor: '#FDF8EE' }}>
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:items-start">

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#D4A017' }}>Why Join BBHA</p>
                <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                  Your establishment,<br />
                  <span style={{ color: '#6B1427' }}>backed by 90 years</span><br />
                  of collective strength.
                </h2>
                <p className="mt-6 text-base leading-relaxed" style={{ color: '#4B5563' }}>
                  Membership is more than a certificate. It is access to legal protection, government liaison, negotiated vendor rates, compliance handholding, and a 1,000-strong community of peers.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/register" className="rounded-full px-7 py-3 text-sm font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#6B1427' }}>
                    Apply for Membership
                  </Link>
                  <Link href="/demo" className="rounded-full border px-7 py-3 text-sm font-semibold transition-all hover:opacity-70" style={{ borderColor: '#6B1427', color: '#6B1427' }}>
                    Explore the Portal
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                {WHY_JOIN.map(({ point, sub }) => (
                  <div key={point} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
                    <span className="pill-check mt-0.5 flex-shrink-0">✓</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#111' }}>{point}</p>
                      <p className="mt-0.5 text-xs" style={{ color: '#6B7280' }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ── INSIGHTS STRIP ─────────────────────────────────────── */}
        <section id="insights" className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#D4A017' }}>Insights & Updates</p>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Stay ahead</h2>
              <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: '#6B7280' }}>
                Members get real-time compliance deadlines, vendor news, and BBHA circulars — delivered directly in the portal.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {INSIGHTS.map(({ tag, title, desc, color }) => (
                <div key={title} className="lift rounded-2xl bg-white p-6 shadow-sm" style={{ border: '1px solid #F3F4F6' }}>
                  <span className="inline-block rounded-full px-3 py-0.5 text-[11px] font-bold" style={{ backgroundColor: color.bg, color: color.text }}>{tag}</span>
                  <h3 className="mt-3 text-sm font-bold" style={{ color: '#111' }}>{title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed" style={{ color: '#6B7280' }}>{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm" style={{ color: '#9CA3AF' }}>
              Members see the full feed inside the portal.{' '}
              <Link href="/register" className="font-semibold underline underline-offset-2" style={{ color: '#6B1427' }}>
                Join to get access →
              </Link>
            </p>
          </div>
        </section>

        {/* ── CONTACT ────────────────────────────────────────────── */}
        <section id="contact" className="px-5 py-20 sm:px-8" style={{ backgroundColor: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#D4A017' }}>Contact</p>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Get in touch</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-7 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#D4A017' }}>Visit Us</p>
                <address className="mt-3 not-italic text-sm leading-relaxed" style={{ color: '#4B5563' }}>
                  No. 87, Shreshta Bhoomi,<br />
                  Bangalore – 560 004,<br />
                  Karnataka, India
                </address>
              </div>
              <div className="rounded-2xl bg-white p-7 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#D4A017' }}>Reach Us</p>
                <div className="mt-3 space-y-2 text-sm" style={{ color: '#4B5563' }}>
                  <p>📞 080-26674444</p>
                  <a href="mailto:info@bbha.in" className="block hover:underline" style={{ color: '#6B1427' }}>✉ info@bbha.in</a>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-7 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#D4A017' }}>Follow BBHA</p>
                <div className="mt-3 flex gap-3">
                  {[
                    { label: 'Facebook',  href: 'https://facebook.com/bengaluruhotelsassociation', icon: 'f' },
                    { label: 'Twitter/X', href: 'https://x.com/bg_hotels',                          icon: '𝕏' },
                    { label: 'Instagram', href: 'https://instagram.com/bangalore_hotels_association', icon: '◎' },
                  ].map(({ label, href, icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="social-btn flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold"
                    >
                      {icon}
                    </a>
                  ))}
                </div>
                <p className="mt-4 text-xs" style={{ color: '#9CA3AF' }}>Stay updated on BBHA news and events.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────── */}
        <footer className="px-5 py-12 sm:px-8" style={{ backgroundColor: '#4A0E1B' }}>
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
              <div className="flex items-center gap-3">
                <Image src="https://bbha.in/images/logo.png" alt="BBHA" width={36} height={36} className="opacity-90 brightness-0 invert" unoptimized />
                <div>
                  <p className="text-sm font-bold text-white">Bangalore Hotels Association (Regd.)</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Syncing India Hospitality Trends since 1936</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <a href="#about"    className="transition-colors hover:text-white">About</a>
                <a href="#community" className="transition-colors hover:text-white">Community</a>
                <a href="#portal"   className="transition-colors hover:text-white">Portal</a>
                <a href="#why-join" className="transition-colors hover:text-white">Why Join</a>
                <a href="#contact"  className="transition-colors hover:text-white">Contact</a>
                <Link href="/login"    className="transition-colors hover:text-white">Member Login</Link>
                <Link href="/register" className="transition-colors hover:text-white">Register</Link>
                <Link href="/demo"     className="transition-colors hover:text-white">Demo Portal</Link>
              </div>
            </div>
            <div className="mt-8 border-t pt-6 text-center text-xs" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.28)' }}>
              © {new Date().getFullYear()} Bangalore Hotels Association (Regd.) · All rights reserved · Member Portal — Digital Initiative by BBHA
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}

// ─── Data ──────────────────────────────────────────────────────

const TICKER_TEXT = `✦ Established 1936  ·  Karnataka's Largest Hospitality Trade Body  ·  1,000+ Active Members  ·  1,050+ Registered Establishments  ·  FSSAI Compliance Support  ·  Vendor Empanelment  ·  Legal & Trade Licence Guidance  ·  Member Exclusive Vendor Rates  ·  Annual General Meetings  ·  Industry Intelligence    `

const ABOUT_STATS = [
  { value: '1936', label: 'Year Founded',    sub: '90 years of unbroken service' },
  { value: '1,000+', label: 'Active Members', sub: 'Hotels, restaurants & more' },
  { value: '1,050+', label: 'Establishments', sub: 'Across Bruhat Bengaluru' },
  { value: '12',    label: 'Vendor Categories', sub: 'Empanelled supplier network' },
]

const COMMUNITY_TYPES = [
  { icon: '🏨', label: 'Hotels' },
  { icon: '🍽️', label: 'Restaurants' },
  { icon: '🥐', label: 'Bakeries' },
  { icon: '🍔', label: 'QSRs' },
  { icon: '🍺', label: 'Bars & Pubs' },
  { icon: '🍱', label: 'Catering' },
]

const PORTAL_FEATURES: { icon: string; title: string; bullets: string[]; accent: { bg: string; border: string } }[] = [
  {
    icon: '📋',
    title: 'Compliance Vault',
    bullets: [
      'Upload FSSAI, BBMP Trade Licence, Fire NOC, GST, Health & Liquor Licence',
      'Automatic expiry alerts at 90 and 30 days',
      'Green / Yellow / Red compliance score always visible',
      'Admin verifies uploads — instant notifications',
    ],
    accent: { bg: '#FFFBEB', border: '#FDE68A' },
  },
  {
    icon: '💳',
    title: 'Membership & Dues',
    bullets: [
      'Pay via UPI QR, NEFT, RTGS, IMPS, or cash',
      'Submit UTR reference for admin verification',
      'Download GST tax invoice (CGST + SGST breakup)',
      'Full payment history with invoice numbers',
    ],
    accent: { bg: '#F5F3FF', border: '#DDD6FE' },
  },
  {
    icon: '🏪',
    title: 'Vendor Directory',
    bullets: [
      'BBHA-empanelled suppliers across 12 categories',
      'Filter by category, pincode, radius, or badge',
      'Contact details unlocked for paid members',
      'Negotiated BBHA member rates highlighted',
    ],
    accent: { bg: '#EFF6FF', border: '#BFDBFE' },
  },
]

const WHY_JOIN = [
  { point: 'Legal defence and regulatory guidance', sub: 'Trade licence disputes, inspections, government orders — BBHA fights your corner.' },
  { point: 'Collective bargaining with authorities', sub: 'Stronger together: from utility rates to BBMP rules, your voice amplified 1,000x.' },
  { point: 'Exclusive negotiated vendor rates', sub: 'Members-only pricing at Metro Cash & Carry, linen suppliers, pest control, and more.' },
  { point: 'FSSAI & BBMP compliance support', sub: 'Avoid costly penalties with expert guidance and document tracking built into the portal.' },
  { point: 'Real-time compliance alerts', sub: 'Never miss an expiry date — automated reminders at 90, 30, and 7 days.' },
  { point: 'AGMs, workshops, and networking', sub: 'Annual General Meetings, industry workshops, and a peer community of 1,000+ operators.' },
  { point: 'Policy voice with policymakers', sub: 'Collectively represent Karnataka hospitality concerns to the state government.' },
]

const INSIGHTS = [
  {
    tag: 'Compliance',
    title: 'FSSAI Annual Return Deadline — May 31',
    desc: 'All FBOs must submit annual returns by 31 May. Portal members get auto-reminders and document verification before the deadline.',
    color: { bg: '#FEF3C7', text: '#92400E' },
  },
  {
    tag: 'Vendor',
    title: 'Metro Cash & Carry — New BBHA Rate Card',
    desc: 'Exclusive bulk rates now active across all Bangalore Metro outlets. Show your BBHA membership card or QR at the B2B desk.',
    color: { bg: '#DBEAFE', text: '#1E40AF' },
  },
  {
    tag: 'Regulatory',
    title: 'Karnataka Fire NOC Renewal Process Updated',
    desc: 'The Karnataka Fire & Emergency Services department has revised the NOC renewal process. Portal members get step-by-step guidance.',
    color: { bg: '#FCE7F3', text: '#9D174D' },
  },
]
