'use client';

import React from 'react';
import Link from 'next/link';
import { Colors } from '@/constants/colors';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: Colors.background }}>
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="mb-12">
          <span className="text-7xl mb-8 inline-block">🍜</span>
        </div>
        <h1
          className="text-6xl md:text-7xl font-bold mb-6"
          style={{ color: Colors.text }}
        >
          Split Bills{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${Colors.primary}, ${Colors.accent})`,
            }}
          >
            Effortlessly
          </span>
        </h1>
        <p
          className="text-2xl mb-8 max-w-2xl mx-auto"
          style={{ color: Colors.textSecondary }}
        >
          Are you the suey one paying today? I gotchu.
        </p>

        <div
          className="max-w-xl mx-auto rounded-xl p-6 mb-12 text-left"
          style={{ backgroundColor: Colors.backgroundTertiary }}
        >
          <p className="text-base font-semibold mb-4" style={{ color: Colors.text }}>
            Quick Start:
          </p>
          <ol className="text-sm space-y-3" style={{ color: Colors.textSecondary }}>
            <li>1. Create a bill or scan your receipt</li>
            <li>2. Add people and dishes with prices</li>
            <li>3. Share the bill in any Telegram chat</li>
            <li>4. Everyone selects what they ate</li>
            <li>5. Lock the bill to see who owes what!</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/scan-receipt"
            className="inline-block px-10 py-5 rounded-xl text-xl font-bold transition-all hover:scale-105 hover:shadow-2xl shadow-lg border-2"
            style={{
              backgroundColor: Colors.card,
              borderColor: Colors.primary,
              color: Colors.primary
            }}
          >
            📸 Scan Receipt
          </Link>
          <Link
            href="/create-bill"
            className="inline-block px-10 py-5 rounded-xl text-xl font-bold text-white transition-all hover:scale-105 hover:shadow-2xl shadow-lg"
            style={{ backgroundColor: Colors.primary }}
          >
            Create Manually →
          </Link>
        </div>

        <div className="mt-20 pt-12 border-t" style={{ borderColor: Colors.border }}>
          <p className="text-sm" style={{ color: Colors.textMuted }}>
            Quick. Simple. No sign-up required. Generate your bill split message instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
