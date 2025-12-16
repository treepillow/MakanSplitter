'use client';

import Link from 'next/link';
import { ArrowRight, Receipt, Users, Calculator, CheckCircle } from 'lucide-react';
import { Colors } from '@/constants/colors';
import BillCounter from '@/components/BillCounter';

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: Colors.background }}>
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
               style={{ backgroundColor: Colors.primaryLight, color: Colors.primary }}>
            <CheckCircle size={16} />
            <span className="text-sm font-medium">No sign-up required</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
              style={{ color: Colors.text }}>
            Split Bills
            <br />
            <span style={{ color: Colors.primary }}>Effortlessly</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
             style={{ color: Colors.textSecondary }}>
            Are you the <span style={{ color: Colors.primary }} className="font-semibold">suey one</span> paying today? I gotchu.
          </p>

          {/* Bill Counter */}
          <div className="mb-12">
            <BillCounter />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/scan-receipt">
              <button
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border-2"
                style={{
                  backgroundColor: Colors.white,
                  borderColor: Colors.border,
                  color: Colors.text
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = Colors.primary;
                  e.currentTarget.style.backgroundColor = Colors.backgroundSecondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = Colors.border;
                  e.currentTarget.style.backgroundColor = Colors.white;
                }}
              >
                <Receipt size={20} />
                Scan Receipt
              </button>
            </Link>

            <Link href="/create-bill">
              <button
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: Colors.primary,
                  color: Colors.white
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = Colors.primaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = Colors.primary;
                }}
              >
                Create Manually
                <ArrowRight size={20} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: Colors.text }}>
            How It Works
          </h2>
          <p className="text-lg" style={{ color: Colors.textSecondary }}>
            Quick. Simple. Generate your bill split message instantly.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {[
            {
              icon: Receipt,
              step: '1',
              title: 'Create or Scan',
              description: 'Add your bill manually or scan a receipt'
            },
            {
              icon: Users,
              step: '2',
              title: 'Add Dishes',
              description: 'List all dishes with prices'
            },
            {
              icon: Calculator,
              step: '3',
              title: 'Share Bill',
              description: 'Send via Telegram to your friends'
            },
            {
              icon: CheckCircle,
              step: '4',
              title: 'Select Items',
              description: 'Everyone picks what they ate'
            },
            {
              icon: Calculator,
              step: '5',
              title: 'Get Totals',
              description: 'See who owes what instantly'
            },
          ].map((item, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl transition-all"
              style={{ backgroundColor: Colors.white }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = Colors.backgroundSecondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = Colors.white;
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: Colors.primaryLight }}
              >
                <item.icon size={24} style={{ color: Colors.primary }} />
              </div>
              <div
                className="text-sm font-bold mb-2"
                style={{ color: Colors.textMuted }}
              >
                STEP {item.step}
              </div>
              <h3 className="font-semibold mb-2" style={{ color: Colors.text }}>
                {item.title}
              </h3>
              <p className="text-sm" style={{ color: Colors.textSecondary }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-24" style={{ borderColor: Colors.border }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center space-y-4">
            <p className="text-sm" style={{ color: Colors.textSecondary }}>
              © {new Date().getFullYear()} MakanSplitter. All rights reserved.
            </p>
            <p className="text-sm" style={{ color: Colors.textMuted }}>
              Made in Singapore
            </p>
            <div>
              <Link
                href="/privacy"
                className="text-sm hover:underline"
                style={{ color: Colors.primary }}
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
