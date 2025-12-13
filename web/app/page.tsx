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
          className="text-2xl mb-16 max-w-2xl mx-auto"
          style={{ color: Colors.textSecondary }}
        >
          Are you the suey one paying today? I gotchu.
        </p>
        <Link
          href="/create-bill"
          className="inline-block px-12 py-5 rounded-xl text-xl font-bold text-white transition-all hover:scale-105 hover:shadow-2xl shadow-lg"
          style={{ backgroundColor: Colors.primary }}
        >
          Create New Bill →
        </Link>

        <div className="mt-20 pt-12 border-t" style={{ borderColor: Colors.border }}>
          <p className="text-sm" style={{ color: Colors.textMuted }}>
            Quick. Simple. No sign-up required. Generate your bill split message instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
