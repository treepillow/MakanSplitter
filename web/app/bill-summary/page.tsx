'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { Toast } from '@/components/Toast';
import { useBill } from '@/context/BillContext';
import { calculateBill } from '@/utils/billCalculator';
import { saveBillToFirebase } from '@/lib/billStorage';
import { Bill } from '@/types/bill';
import { TELEGRAM_CONFIG } from '@/config/telegram';

function StepMeter({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Step ${current} of 3`}>
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          className={`h-[3px] w-10 ${step <= current ? 'bg-chop' : 'bg-rule-dash'}`}
        />
      ))}
    </div>
  );
}

export default function BillSummaryScreen() {
  const router = useRouter();
  const { currentBill, clearCurrentBill } = useBill();
  const [copied, setCopied] = useState(false);
  const [billId, setBillId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    if (!currentBill || !currentBill.dishes) {
      router.replace('/');
    }
  }, [currentBill, router]);

  if (!currentBill || !currentBill.dishes) {
    return null;
  }

  const calculation = calculateBill(
    currentBill.dishes,
    currentBill.people || [],
    currentBill.gstPercentage || 0,
    currentBill.serviceChargePercentage || 0
  );

  const handleSaveBill = async () => {
    setSaving(true);
    try {
      const newBillId = `bill_${nanoid()}`;

      const fullBill: Bill = {
        id: newBillId,
        restaurantName: currentBill.restaurantName || 'Restaurant',
        date: typeof currentBill.date === 'string' ? new Date(currentBill.date) : (currentBill.date || new Date()),
        gstPercentage: currentBill.gstPercentage || 0,
        serviceChargePercentage: currentBill.serviceChargePercentage || 0,
        dishes: currentBill.dishes!,
        people: currentBill.people || [],
        participants: [],
        phase: 'selection' as const,
        subtotal: calculation.subtotal,
        gstAmount: calculation.gst,
        serviceChargeAmount: calculation.serviceCharge,
        total: calculation.total,
        paidBy: currentBill.paidBy!,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await saveBillToFirebase(fullBill);

      setBillId(newBillId);
      setToast({ message: 'Bill saved — ready to share', type: 'success' });
    } catch (error) {
      console.error('Error saving bill:', error);
      setToast({ message: 'Could not save the bill. Try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyInlineCommand = () => {
    if (!billId) return;
    const inlineCommand = `@${TELEGRAM_CONFIG.BOT_USERNAME} ${billId}`;
    navigator.clipboard.writeText(inlineCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const telegramDeepLink = billId
    ? `https://t.me/${TELEGRAM_CONFIG.BOT_USERNAME}?start=${billId}`
    : '';

  const handleCreateNew = () => {
    clearCurrentBill();
    // Use window.location to force a full page reload and avoid the useEffect redirect
    window.location.href = '/create-bill';
  };

  const billDate = new Date(currentBill.date || Date.now());

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      <div className="min-h-screen py-12 px-5 sm:px-8">
        <div className="max-w-lg mx-auto">
          {/* Step header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <p className="mlabel">Step 3 / 3</p>
              <StepMeter current={3} />
            </div>
            <h1 className="font-mono font-extrabold uppercase text-3xl tracking-tight text-ink mb-2">
              Review &amp; share
            </h1>
            <p className="text-ink-soft">
              Check the receipt, then send it to your group.
            </p>
          </div>

          {/* The receipt */}
          <div className="slip tear-b px-6 sm:px-8 pt-7 pb-7 mb-10">
            <p className="font-mono font-bold text-sm text-center tracking-[0.18em] text-ink mb-1">
              {(currentBill.restaurantName || 'MAKAN SESSION').toUpperCase()}
            </p>
            <p className="font-mono text-[0.6875rem] text-center tracking-[0.12em] text-ink-soft mb-4">
              {billDate
                .toLocaleDateString('en-SG', { weekday: 'short', day: '2-digit', month: 'short' })
                .toUpperCase()}{' '}
              · PAID BY {currentBill.paidBy?.toUpperCase()}
            </p>

            <hr className="rule-dash mb-3" />
            <div className="space-y-1.5">
              {currentBill.dishes.map((dish) => (
                <div key={dish.id} className="leader-row font-mono text-sm text-ink">
                  <span className="truncate">{dish.name}</span>
                  <span className="leader" />
                  <span className="tabnum">{dish.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <hr className="rule-dash my-3" />

            <div className="space-y-1 font-mono text-xs text-ink-soft">
              <div className="leader-row">
                <span>SUBTOTAL</span>
                <span className="leader" />
                <span className="tabnum">{calculation.subtotal.toFixed(2)}</span>
              </div>
              {calculation.serviceCharge > 0 && (
                <div className="leader-row">
                  <span>SVC {currentBill.serviceChargePercentage}%</span>
                  <span className="leader" />
                  <span className="tabnum">{calculation.serviceCharge.toFixed(2)}</span>
                </div>
              )}
              {calculation.gst > 0 && (
                <div className="leader-row">
                  <span>GST {currentBill.gstPercentage}%</span>
                  <span className="leader" />
                  <span className="tabnum">{calculation.gst.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="leader-row font-mono font-bold text-lg text-ink mt-2">
              <span>TOTAL</span>
              <span className="leader" />
              <span className="tabnum">{calculation.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Share panel (after save) */}
          {billId && (
            <div className="slip px-6 sm:px-8 py-7 mb-10">
              <p className="mlabel mb-5">Share in Telegram</p>

              <ol className="space-y-4 mb-6">
                <li className="flex gap-3 text-sm text-ink">
                  <span className="font-mono text-xs font-semibold text-chop tabnum mt-0.5">01</span>
                  <span>Open the bot with the button below.</span>
                </li>
                <li className="flex gap-3 text-sm text-ink">
                  <span className="font-mono text-xs font-semibold text-chop tabnum mt-0.5">02</span>
                  <span>
                    Tap <strong>&ldquo;📤 Share bill to a chat&rdquo;</strong> and pick your group.
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-ink">
                  <span className="font-mono text-xs font-semibold text-chop tabnum mt-0.5">03</span>
                  <span>
                    <strong>Tap the bill card that pops up</strong> above the message box —
                    don&apos;t press Enter.
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-ink">
                  <span className="font-mono text-xs font-semibold text-chop tabnum mt-0.5">04</span>
                  <span>Everyone taps their dishes, then you lock the bill.</span>
                </li>
              </ol>

              <a
                href={telegramDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ink btn-lg w-full mb-4"
              >
                Open in Telegram
              </a>

              <details className="group">
                <summary className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft cursor-pointer hover:text-ink">
                  Prefer to type it manually?
                </summary>
                <div className="mt-3 space-y-3">
                  <p className="text-xs text-ink-soft">
                    Paste this in any chat, <strong>wait for the bill card to pop up, and tap
                    it</strong>. Pressing Enter just sends plain text — nobody will be able to
                    select dishes.
                  </p>
                  <div className="flex items-center gap-2 border border-rule-dash rounded-sm bg-bright p-2">
                    <code className="font-mono text-xs text-ink flex-1 break-all">
                      @{TELEGRAM_CONFIG.BOT_USERNAME} {billId}
                    </code>
                    <button
                      onClick={handleCopyInlineCommand}
                      className={`btn btn-sm shrink-0 ${copied ? 'btn-paid' : 'btn-ghost'}`}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </details>

              <hr className="rule-dash my-4" />
              <p className="text-xs text-ink-faint">
                The bot works in any chat — no need to add it to your group.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => router.back()} className="btn btn-ghost flex-1">
              Back
            </button>
            {!billId ? (
              <button
                onClick={handleSaveBill}
                disabled={saving}
                className="btn btn-chop flex-[2]"
              >
                {saving ? 'Saving…' : 'Save & share'}
              </button>
            ) : (
              <button onClick={handleCreateNew} className="btn btn-ink flex-[2]">
                Create new bill
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
