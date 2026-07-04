'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const HONEST_LINES = [
  { name: 'ADS', value: 'NONE' },
  { name: 'PREMIUM TIER', value: 'NONE' },
  { name: 'YOUR DATA, SOLD', value: 'NEVER' },
  { name: 'YOUR SUPPORT', value: 'OPTIONAL' },
];

export default function DonatePage() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="min-h-screen py-14 px-5 sm:px-8">
      <div className="max-w-xl mx-auto">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-ink inline-block mb-8"
        >
          ← Back to home
        </Link>

        <div className="mb-10">
          <p className="starline mb-4">★ Tip jar ★</p>
          <h1 className="font-mono font-extrabold uppercase text-3xl sm:text-4xl tracking-tight text-ink mb-3">
            Buy me lunch!
          </h1>
          <p className="text-lg text-ink-soft">
            Support a hungry student&apos;s lunch fund.
          </p>
        </div>

        <div className="slip tear-b px-6 sm:px-8 py-8 mb-12">
          <p className="mlabel text-center mb-1">Scan to donate</p>
          <p className="font-mono text-xs text-center tracking-[0.12em] text-ink-faint mb-6 uppercase">
            PayLah! or PayNow
          </p>

          {/* QR Code */}
          {!imageError ? (
            <div className="relative w-full aspect-square max-w-xs mx-auto border border-rule bg-bright mb-6">
              <Image
                src="/paylah-qr.png"
                alt="PayLah QR code"
                fill
                className="object-contain p-4"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="w-full aspect-square max-w-xs mx-auto border border-dashed border-rule-dash flex flex-col items-center justify-center p-8 mb-6">
              <p className="font-mono font-bold text-sm uppercase tracking-[0.12em] text-ink mb-2 text-center">
                PayLah QR code
              </p>
              <p className="font-mono text-xs text-ink-faint text-center">
                Save your QR to: web/public/paylah-qr.png
              </p>
            </div>
          )}

          <p className="text-center text-ink-soft mb-6">
            Every contribution fuels late-night coding sessions and keeps
            MakanSplitter free for everyone. Thank you!
          </p>

          <hr className="rule-dash mb-4" />

          {/* The honest receipt */}
          <div className="space-y-1.5 max-w-xs mx-auto">
            {HONEST_LINES.map((line) => (
              <div
                key={line.name}
                className="leader-row font-mono text-xs text-ink-soft"
              >
                <span>{line.name}</span>
                <span className="leader" />
                <span>{line.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
