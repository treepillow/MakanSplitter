import { Colors } from '@/constants/colors';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: Colors.background }}>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4" style={{ color: Colors.text }}>
            About MakanSplit
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
              So I built MakanSplit to make bill splitting fair, transparent, and instant. Each person pays only for what they ordered.
            </p>
            <h3 className="text-2xl font-bold mt-8 mb-4" style={{ color: Colors.text }}>
              Why It's Different
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="mr-3">✓</span>
                <span>Fair splitting - pay only for what you ordered</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">✓</span>
                <span>Auto-calculate GST & service charge</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">✓</span>
                <span>Share via Telegram instantly</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">✓</span>
                <span>100% free, no hidden costs</span>
              </li>
            </ul>
            <div className="pt-8">
              <p className="mb-6">
                If it's helped you avoid awkward money talks, consider buying me lunch! hehe
              </p>
              <div className="flex gap-4">
                <Link
                  href="/donate"
                  className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: Colors.primary }}
                >
                  Support the Project
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-lg font-semibold border transition-all hover:bg-opacity-10"
                  style={{ color: Colors.textSecondary, borderColor: Colors.border }}
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { emoji: '⚛️', label: 'React' },
            { emoji: '▲', label: 'Next.js' },
            { emoji: '🔥', label: 'Firebase' },
            { emoji: '☕', label: 'Coffee' },
          ].map((tech) => (
            <div
              key={tech.label}
              className="rounded-xl p-6 text-center border"
              style={{ backgroundColor: Colors.card, borderColor: Colors.border }}
            >
              <span className="text-4xl mb-3 inline-block">{tech.emoji}</span>
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
