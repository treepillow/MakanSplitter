'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Colors } from '@/constants/colors';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: Colors.background }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: Colors.textSecondary }}>
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-4" style={{ color: Colors.text }}>
          Privacy Policy
        </h1>
        <p className="text-sm mb-8" style={{ color: Colors.textMuted }}>
          Last updated: {new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {/* Content */}
        <div className="space-y-8" style={{ color: Colors.textSecondary }}>
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: Colors.primary }}>
              What We Collect
            </h2>
            <p className="mb-3">
              MakanSplitter is designed to minimize data collection. We only collect what's necessary to split bills:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Bill information:</strong> Restaurant names, dish names, prices, and GST/service charge percentages you enter</li>
              <li><strong>Telegram user IDs:</strong> When you interact with bills via Telegram, we store your Telegram user ID to track who selected which dishes</li>
              <li><strong>Receipt images:</strong> Temporarily processed by Google Gemini AI for OCR (not stored on our servers)</li>
              <li><strong>IP addresses:</strong> Used only for rate limiting to prevent abuse (not stored long-term)</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: Colors.primary }}>
              How We Use Your Data
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Display bills and calculate who owes what</li>
              <li>Enable Telegram bot functionality for dish selection</li>
              <li>Prevent spam and abuse through rate limiting</li>
              <li>Show usage statistics (total bills created)</li>
            </ul>
            <p className="mt-3">
              <strong>We do NOT:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Sell your data to third parties</li>
              <li>Use your data for advertising</li>
              <li>Share your data with anyone except as required by law</li>
              <li>Track you across websites</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: Colors.primary }}>
              Data Retention
            </h2>
            <p>
              All bills are <strong>automatically deleted after 30 days</strong>. This ensures your data doesn't stick around longer than necessary.
            </p>
            <p className="mt-3">
              If you want a bill deleted sooner, it will naturally expire when you close the browser (bills are linked by shareable IDs, not accounts).
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: Colors.primary }}>
              Third-Party Services
            </h2>
            <p className="mb-3">We use the following third-party services:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Firebase (Google):</strong> Database hosting for bills. See{' '}
                <a
                  href="https://firebase.google.com/support/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: Colors.primary }}
                >
                  Firebase Privacy Policy
                </a>
              </li>
              <li>
                <strong>Vercel:</strong> Web hosting and serverless functions. See{' '}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: Colors.primary }}
                >
                  Vercel Privacy Policy
                </a>
              </li>
              <li>
                <strong>Google Gemini AI:</strong> Receipt OCR processing. Images are sent to Google's API for text extraction. See{' '}
                <a
                  href="https://ai.google.dev/gemini-api/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: Colors.primary }}
                >
                  Gemini API Terms
                </a>
              </li>
              <li>
                <strong>Telegram:</strong> Bot platform for bill sharing. See{' '}
                <a
                  href="https://telegram.org/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: Colors.primary }}
                >
                  Telegram Privacy Policy
                </a>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: Colors.primary }}>
              Your Rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your bill data (bills are publicly accessible via their unique ID)</li>
              <li>Delete your data (all bills auto-delete after 30 days)</li>
              <li>Know what data we have (see "What We Collect" above)</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: Colors.primary }}>
              Security
            </h2>
            <p>
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>HTTPS encryption for all data transmission</li>
              <li>Rate limiting to prevent abuse</li>
              <li>Input validation to prevent injection attacks</li>
              <li>Secure random bill IDs to prevent enumeration</li>
              <li>Firebase security rules to restrict data access</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: Colors.primary }}>
              Children's Privacy
            </h2>
            <p>
              MakanSplitter is not intended for children under 13. We do not knowingly collect data from children.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: Colors.primary }}>
              Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. Changes will be posted on this page with an updated "Last updated" date.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: Colors.primary }}>
              Contact Us
            </h2>
            <p>
              If you have questions about this privacy policy or want to request data deletion, contact us at:
            </p>
            <p className="mt-3">
              <a
                href="mailto:privacy@makansplitter.com"
                className="underline"
                style={{ color: Colors.primary }}
              >
                privacy@makansplitter.com
              </a>
            </p>
            <p className="mt-3 text-sm" style={{ color: Colors.textMuted }}>
              (Note: Update this email address to your actual contact email)
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: Colors.borderLight }}>
          <p className="text-sm text-center" style={{ color: Colors.textMuted }}>
            © {new Date().getFullYear()} MakanSplitter. Made in Singapore.
          </p>
        </div>
      </div>
    </div>
  );
}
