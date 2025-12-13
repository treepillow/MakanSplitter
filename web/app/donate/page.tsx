import { Colors } from '@/constants/colors';
import Link from 'next/link';

export default function DonatePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: Colors.background }}>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4" style={{ color: Colors.text }}>
            Buy Me Lunch!
          </h1>
          <p className="text-xl" style={{ color: Colors.textSecondary }}>
            Support a hungry student's lunch fund
          </p>
        </div>

        <div className="rounded-2xl p-10 mb-10 border max-w-2xl mx-auto" style={{ backgroundColor: Colors.card, borderColor: Colors.border }}>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: Colors.text }}>
            Scan to Donate
          </h2>
          <p className="text-center mb-8" style={{ color: Colors.textSecondary }}>
            PayLah! or PayNow
          </p>

          {/* QR Code Placeholder */}
          <div className="mb-8">
            <div
              className="w-full aspect-square max-w-sm mx-auto rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8"
              style={{ borderColor: Colors.border, backgroundColor: Colors.backgroundTertiary }}
            >
              <p className="text-center font-semibold mb-2" style={{ color: Colors.text }}>
                PayLah QR Code
              </p>
              <p className="text-sm text-center" style={{ color: Colors.textMuted }}>
                Save your QR to: web/public/paylah-qr.png
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg mb-6" style={{ color: Colors.text }}>
              Thank you for your support! 
            </p>
            <p className="mb-8" style={{ color: Colors.textSecondary }}>
              Every contribution fuels late-night coding sessions and keeps MakanSplit free for everyone!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-lg font-semibold border transition-all hover:bg-opacity-10"
              style={{ color: Colors.textSecondary, borderColor: Colors.border }}
            >
              Back to Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
