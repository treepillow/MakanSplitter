'use client';

import Link from 'next/link';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono font-bold uppercase tracking-[0.1em] text-ink text-lg mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-ink-soft leading-relaxed">{children}</div>
    </section>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-4 decoration-rule-dash hover:text-ink"
    >
      {children}
    </a>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-14 px-5 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-ink inline-block mb-8"
        >
          ← Back to home
        </Link>

        <h1 className="font-mono font-extrabold uppercase text-3xl sm:text-4xl tracking-tight text-ink mb-2">
          Privacy policy
        </h1>
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-ink-faint mb-10">
          Last updated:{' '}
          {new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="space-y-10">
          <Section title="What we collect">
            <p>
              MakanSplitter is designed to minimize data collection. We only collect
              what&apos;s necessary to split bills:
            </p>
            <ul className="list-disc list-outside space-y-2 ml-5">
              <li>
                <strong className="text-ink">Bill information:</strong> Restaurant names, dish
                names, prices, and GST/service charge percentages you enter
              </li>
              <li>
                <strong className="text-ink">Telegram user IDs:</strong> When you interact with
                bills via Telegram, we store your Telegram user ID to track who selected which
                dishes
              </li>
              <li>
                <strong className="text-ink">Receipt images:</strong> Temporarily processed by
                Google Gemini AI for OCR (not stored on our servers)
              </li>
              <li>
                <strong className="text-ink">IP addresses:</strong> Used only for rate limiting
                to prevent abuse (not stored long-term)
              </li>
            </ul>
          </Section>

          <Section title="How we use your data">
            <ul className="list-disc list-outside space-y-2 ml-5">
              <li>Display bills and calculate who owes what</li>
              <li>Enable Telegram bot functionality for dish selection</li>
              <li>Prevent spam and abuse through rate limiting</li>
              <li>Show usage statistics (total bills created)</li>
            </ul>
            <p>
              <strong className="text-ink">We do NOT:</strong>
            </p>
            <ul className="list-disc list-outside space-y-2 ml-5">
              <li>Sell your data to third parties</li>
              <li>Use your data for advertising</li>
              <li>Share your data with anyone except as required by law</li>
              <li>Track you across websites</li>
            </ul>
          </Section>

          <Section title="Data retention">
            <p>
              All bills are <strong className="text-ink">automatically deleted after 30 days</strong>.
              This ensures your data doesn&apos;t stick around longer than necessary.
            </p>
            <p>
              If you want a bill deleted sooner, it will naturally expire when you close the
              browser (bills are linked by shareable IDs, not accounts).
            </p>
          </Section>

          <Section title="Third-party services">
            <p>We use the following third-party services:</p>
            <ul className="list-disc list-outside space-y-2 ml-5">
              <li>
                <strong className="text-ink">Firebase (Google):</strong> Database hosting for
                bills. See{' '}
                <ExtLink href="https://firebase.google.com/support/privacy">
                  Firebase Privacy Policy
                </ExtLink>
              </li>
              <li>
                <strong className="text-ink">Vercel:</strong> Web hosting and serverless
                functions. See{' '}
                <ExtLink href="https://vercel.com/legal/privacy-policy">
                  Vercel Privacy Policy
                </ExtLink>
              </li>
              <li>
                <strong className="text-ink">Google Gemini AI:</strong> Receipt OCR processing.
                Images are sent to Google&apos;s API for text extraction. See{' '}
                <ExtLink href="https://ai.google.dev/gemini-api/terms">Gemini API Terms</ExtLink>
              </li>
              <li>
                <strong className="text-ink">Telegram:</strong> Bot platform for bill sharing.
                See <ExtLink href="https://telegram.org/privacy">Telegram Privacy Policy</ExtLink>
              </li>
            </ul>
          </Section>

          <Section title="Your rights">
            <p>You have the right to:</p>
            <ul className="list-disc list-outside space-y-2 ml-5">
              <li>Access your bill data (bills are publicly accessible via their unique ID)</li>
              <li>Delete your data (all bills auto-delete after 30 days)</li>
              <li>Know what data we have (see &ldquo;What we collect&rdquo; above)</li>
            </ul>
          </Section>

          <Section title="Security">
            <p>We implement industry-standard security measures including:</p>
            <ul className="list-disc list-outside space-y-2 ml-5">
              <li>HTTPS encryption for all data transmission</li>
              <li>Rate limiting to prevent abuse</li>
              <li>Input validation to prevent injection attacks</li>
              <li>Secure random bill IDs to prevent enumeration</li>
              <li>Firebase security rules to restrict data access</li>
            </ul>
          </Section>

          <Section title="Children's privacy">
            <p>
              MakanSplitter is not intended for children under 13. We do not knowingly collect
              data from children.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              We may update this privacy policy from time to time. Changes will be posted on
              this page with an updated &ldquo;Last updated&rdquo; date.
            </p>
          </Section>

          <Section title="Contact us">
            <p>
              If you have questions about this privacy policy or want to request data deletion,
              contact us at{' '}
              <ExtLink href="mailto:privacy@makansplitter.com">privacy@makansplitter.com</ExtLink>.
            </p>
          </Section>
        </div>

        <div className="mt-14 pt-8 border-t border-dashed border-rule-dash text-center space-y-3">
          <p className="font-mono text-xs tracking-[0.2em] text-ink-soft">
            *** THANK YOU, COME AGAIN ***
          </p>
          <p className="text-sm text-ink-faint">
            © {new Date().getFullYear()} MakanSplitter · Made in Singapore
          </p>
        </div>
      </div>
    </div>
  );
}
