'use client';

import Link from 'next/link';
import BillCounter from '@/components/BillCounter';

const DEMO_ITEMS = [
  { name: 'CHICKEN RICE', price: '5.50' },
  { name: 'KAYA TOAST SET', price: '4.80' },
  { name: 'TEH PENG', price: '2.00' },
  { name: 'SAMBAL STINGRAY', price: '18.00' },
];

const DEMO_SPLIT = [
  { name: 'AARON', amount: '17.38' },
  { name: 'MEL', amount: '16.55' },
  { name: 'JON', amount: '2.40' },
];

const STEPS = [
  { no: '01', verb: 'Scan', line: 'Snap the receipt. AI reads every dish and price.' },
  { no: '02', verb: 'Share', line: 'One tap posts the bill to your Telegram group.' },
  { no: '03', verb: 'Tap', line: 'Everyone picks exactly what they ate.' },
  { no: '04', verb: 'Lock', line: 'Split calculated — down to the cent.' },
];

function ReceiptLine({ name, price }: { name: string; price: string }) {
  return (
    <div className="leader-row font-mono text-[0.8125rem] text-ink">
      <span className="truncate">{name}</span>
      <span className="leader" />
      <span className="tabnum">{price}</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-start">
          {/* Left: thesis */}
          <div className="max-w-xl">
            <p className="starline mb-6">★ No sign-up · no app · free ★</p>

            <h1 className="font-mono font-extrabold uppercase text-ink text-[2.5rem] sm:text-[3.4rem] leading-[0.98] tracking-tight mb-6">
              Makan first,
              <br />
              split later.
            </h1>

            <p className="text-lg text-ink-soft leading-relaxed mb-3">
              Scan the receipt, share one Telegram poll, and everyone pays for
              exactly what they ate.
            </p>
            <p className="text-lg text-ink-soft leading-relaxed mb-10">
              Are you the{' '}
              <span className="font-semibold text-chop">suey one</span> paying
              today? I gotchu.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/scan-receipt" className="btn btn-ink btn-lg">
                Scan receipt
              </Link>
              <Link href="/create-bill" className="btn btn-ghost btn-lg">
                Type it in
              </Link>
            </div>

            <BillCounter />
          </div>

          {/* Right: the receipt, printing */}
          <div className="max-w-[340px] w-full mx-auto lg:mx-0 lg:justify-self-end" aria-hidden="true">
            <div className="print-slot" />
            <div className="print-frame -mt-2 px-2">
              <div className="receipt-print slip tear-b px-6 pt-7 pb-6 mt-0">
                <p className="font-mono font-bold text-sm text-center tracking-[0.18em] text-ink mb-1">
                  KOPITIAM SEHATI
                </p>
                <p className="font-mono text-[0.6875rem] text-center tracking-[0.12em] text-ink-soft mb-4">
                  SAT 05 JUL · TABLE 12 · PAX 3
                </p>

                <hr className="rule-dash mb-3" />
                <div className="space-y-1.5">
                  {DEMO_ITEMS.map((item) => (
                    <ReceiptLine key={item.name} name={item.name} price={item.price} />
                  ))}
                </div>
                <hr className="rule-dash my-3" />

                <div className="space-y-1 font-mono text-[0.75rem] text-ink-soft">
                  <div className="leader-row">
                    <span>SUBTOTAL</span>
                    <span className="leader" />
                    <span className="tabnum">30.30</span>
                  </div>
                  <div className="leader-row">
                    <span>SVC 10%</span>
                    <span className="leader" />
                    <span className="tabnum">3.03</span>
                  </div>
                  <div className="leader-row">
                    <span>GST 9%</span>
                    <span className="leader" />
                    <span className="tabnum">3.00</span>
                  </div>
                </div>
                <div className="leader-row font-mono font-bold text-[0.9375rem] text-ink mt-2">
                  <span>TOTAL</span>
                  <span className="leader" />
                  <span className="tabnum">36.33</span>
                </div>

                <hr className="rule-dash my-3" />
                <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-ink-soft mb-2">
                  SPLIT 3 WAYS VIA TELEGRAM
                </p>
                <div className="space-y-1.5 relative">
                  {DEMO_SPLIT.map((person) => (
                    <ReceiptLine key={person.name} name={person.name} price={person.amount} />
                  ))}
                  <span className="chop-stamp absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70">
                    All paid
                  </span>
                </div>

                <hr className="rule-dash my-4" />
                <p className="font-mono text-[0.6875rem] text-center tracking-[0.2em] text-ink-soft">
                  *** THANK YOU, COME AGAIN ***
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <p className="mlabel mb-8">How it works</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          {STEPS.map((step) => (
            <div
              key={step.no}
              className="lg:border-l lg:border-dashed lg:border-rule-dash lg:pl-6 first:border-l-0 first:pl-0"
            >
              <p className="font-mono text-xs font-semibold text-chop tabnum mb-2">
                {step.no}
              </p>
              <h3 className="font-mono font-bold uppercase tracking-[0.1em] text-ink mb-2">
                {step.verb}
              </h3>
              <p className="text-sm text-ink-soft leading-relaxed">{step.line}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dashed border-rule-dash mt-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 text-center space-y-4">
          <p className="font-mono text-xs tracking-[0.2em] text-ink-soft">
            *** THANK YOU, COME AGAIN ***
          </p>
          <p className="text-sm text-ink-faint">
            © {new Date().getFullYear()} MakanSplitter ·{' '}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
              Privacy policy
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
