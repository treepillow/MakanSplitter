'use client';

import { Colors } from '@/constants/colors';
import Link from 'next/link';
import { CheckCircle, Heart, ArrowRight, Atom, Triangle, Flame, Coffee as CoffeeIcon } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: Colors.background }}>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4" style={{ color: Colors.text }}>
            About MakanSplitter
          </h1>
          <p className="text-xl" style={{ color: Colors.textSecondary }}>
            Built by a broke university student
          </p>
        </div>

        <div className="rounded-2xl p-10 mb-10 border" style={{ backgroundColor: Colors.card, borderColor: Colors.border }}>
          <h2 className="text-3xl font-bold mb-6" style={{ color: Colors.text }}>
            Hey there!
          </h2>
          <div className="space-y-6 text-lg" style={{ color: Colors.textSecondary }}>
            <p>
              I'm a university student in Singapore who loves makan sessions with friends but hates the awkward "who owes who" math at the end and i suck at maths.
            </p>
            <p>
              So I built MakanSplitter to make bill splitting fair, transparent, and instant. Each person pays only for what they ordered.
            </p>
            <h3 className="text-2xl font-bold mt-8 mb-4" style={{ color: Colors.text }}>
              Why It's Different
            </h3>
            <ul className="space-y-3">
              {[
                'Fair splitting - pay only for what you ordered',
                'Auto-calculate GST & service charge',
                'Share via Telegram instantly',
                '100% free, no hidden costs'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle size={20} style={{ color: Colors.primary }} className="mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-8">
              <p className="mb-6">
                If it's helped you avoid awkward money talks, consider buying me lunch! hehe
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/donate">
                  <button
                    className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: Colors.primary, color: Colors.white }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = Colors.primaryHover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = Colors.primary}
                  >
                    <Heart size={18} />
                    Support the Project
                  </button>
                </Link>
                <Link href="/">
                  <button
                    className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold border-2 transition-all flex items-center justify-center gap-2"
                    style={{ color: Colors.textSecondary, borderColor: Colors.border, backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = Colors.backgroundSecondary;
                      e.currentTarget.style.borderColor = Colors.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = Colors.border;
                    }}
                  >
                    Back to Home
                    <ArrowRight size={18} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Atom, label: 'React' },
            { icon: Triangle, label: 'Next.js' },
            { icon: Flame, label: 'Firebase' },
            { icon: CoffeeIcon, label: 'Coffee' },
          ].map((tech) => (
            <div
              key={tech.label}
              className="rounded-xl p-6 text-center border transition-all"
              style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = Colors.backgroundSecondary}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = Colors.card}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: Colors.primaryLight }}
              >
                <tech.icon size={24} style={{ color: Colors.primary }} />
              </div>
              <p className="font-medium" style={{ color: Colors.textSecondary }}>
                {tech.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
