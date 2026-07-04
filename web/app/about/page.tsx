'use client';

import Link from 'next/link';

const DIFFERENCES = [
  'Fair splitting — pay only for what you ordered',
  'GST & service charge worked out automatically',
  'Shared as one Telegram poll, no app installs',
  '100% free, no hidden costs',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-14 px-5 sm:px-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-10">
          <p className="starline mb-4">★ About this stall ★</p>
          <h1 className="font-mono font-extrabold uppercase text-3xl sm:text-4xl tracking-tight text-ink mb-3">
            About MakanSplitter
          </h1>
          <p className="text-lg text-ink-soft">Built by a broke university student.</p>
        </div>

        <div className="slip tear-b px-6 sm:px-8 py-8 mb-12">
          <h2 className="font-mono font-bold uppercase tracking-[0.1em] text-ink mb-4">
            Hey there!
          </h2>
          <div className="space-y-4 text-ink-soft leading-relaxed">
            <p>
              I&apos;m a university student in Singapore who loves makan sessions
              with friends but hates the awkward &ldquo;who owes who&rdquo; math at
              the end — and I suck at maths.
            </p>
            <p>
              So I built MakanSplitter to make bill splitting fair, transparent,
              and instant. Each person pays only for what they ordered.
            </p>
          </div>

          <hr className="rule-dash my-6" />

          <p className="mlabel mb-4">Why it&apos;s different</p>
          <ul className="space-y-2.5">
            {DIFFERENCES.map((item) => (
              <li key={item} className="flex items-start gap-3 text-ink-soft">
                <span className="font-mono text-paid font-bold text-sm mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <hr className="rule-dash my-6" />

          <p className="text-ink-soft mb-5">
            If it&apos;s helped you avoid awkward money talks, consider buying me
            lunch! hehe
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/donate" className="btn btn-chop flex-1">
              Buy me lunch
            </Link>
            <Link href="/" className="btn btn-ghost flex-1">
              Back to home
            </Link>
          </div>

          <hr className="rule-dash my-6" />
          <p className="font-mono text-[0.6875rem] text-center tracking-[0.14em] text-ink-faint uppercase">
            Made with Next.js · Firebase · Kopi
          </p>
        </div>
      </div>
    </div>
  );
}
