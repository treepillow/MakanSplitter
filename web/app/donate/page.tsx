'use client';

import { Colors } from '@/constants/colors';
import Link from 'next/link';
import { Heart, Coffee, ArrowLeft, QrCode } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function DonatePage() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: Colors.background }}>
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: Colors.textSecondary }}>
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Coffee size={32} style={{ color: Colors.primary }} />
            <Heart size={24} style={{ color: Colors.error }} />
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ color: Colors.text }}>
            Buy Me Lunch!
          </h1>
          <p className="text-xl" style={{ color: Colors.textSecondary }}>
            Support a hungry student's lunch fund
          </p>
        </div>

        <div className="rounded-2xl p-10 mb-10 border max-w-2xl mx-auto" style={{ backgroundColor: Colors.card, borderColor: Colors.border }}>
          <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2" style={{ color: Colors.text }}>
            <QrCode size={24} style={{ color: Colors.primary }} />
            Scan to Donate
          </h2>
          <p className="text-center mb-8" style={{ color: Colors.textSecondary }}>
            PayLah! or PayNow
          </p>

          {/* QR Code */}
          <div className="mb-8">
            {!imageError ? (
              <div className="relative w-full aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden border" style={{ borderColor: Colors.border }}>
                <Image
                  src="/paylah-qr.png"
                  alt="PayLah QR Code"
                  fill
                  className="object-contain p-4"
                  style={{ backgroundColor: Colors.white }}
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div
                className="w-full aspect-square max-w-sm mx-auto rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8"
                style={{ borderColor: Colors.border, backgroundColor: Colors.backgroundTertiary }}
              >
                <QrCode size={48} style={{ color: Colors.textMuted }} className="mb-4" />
                <p className="text-center font-semibold mb-2" style={{ color: Colors.text }}>
                  PayLah QR Code
                </p>
                <p className="text-sm text-center" style={{ color: Colors.textMuted }}>
                  Save your QR to: web/public/paylah-qr.png
                </p>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-lg mb-6" style={{ color: Colors.text }}>
              Thank you for your support!
            </p>
            <p className="mb-8" style={{ color: Colors.textSecondary }}>
              Every contribution fuels late-night coding sessions and keeps MakanSplitter free for everyone!
            </p>
          </div>
        </div>

        {/* Why Donate Section */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            {
              icon: Coffee,
              title: 'Free Forever',
              description: 'No ads, no premium tiers, no BS'
            },
            {
              icon: Heart,
              title: 'Student Built',
              description: 'Made by a broke student who gets it'
            },
            {
              icon: QrCode,
              title: 'Open Source',
              description: 'Transparent and community-driven'
            }
          ].map((item, index) => (
            <div
              key={index}
              className="rounded-xl p-6 text-center border transition-all"
              style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = Colors.backgroundSecondary}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = Colors.card}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: Colors.primaryLight }}
              >
                <item.icon size={24} style={{ color: Colors.primary }} />
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
      </div>
    </div>
  );
}
