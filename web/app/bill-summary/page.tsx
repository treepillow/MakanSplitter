'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';
import { useBill } from '@/context/BillContext';
import { calculateBill, formatCurrency } from '@/utils/billCalculator';
import { saveBillToFirebase } from '@/lib/billStorage';
import { Bill } from '@/types/bill';
import { Colors } from '@/constants/colors';
import { TELEGRAM_CONFIG } from '@/config/telegram';

export default function BillSummaryScreen() {
  const router = useRouter();
  const { currentBill, clearCurrentBill } = useBill();
  const [opacity, setOpacity] = useState(0);
  const [copied, setCopied] = useState(false);
  const [billId, setBillId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    setTimeout(() => setOpacity(1), 100);
  }, []);

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
      // Generate bill ID (cryptographically secure random ID)
      const newBillId = `bill_${nanoid()}`;

      // Create full bill object
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

      // Save to Firebase
      await saveBillToFirebase(fullBill);

      setBillId(newBillId);
      setToast({ message: 'Bill saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Error saving bill:', error);
      setToast({ message: 'Failed to save bill. Please try again.', type: 'error' });
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

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    <div className="min-h-screen" style={{ backgroundColor: Colors.background }}>
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 transition-opacity duration-600"
        style={{ opacity }}
      >
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4" style={{ color: Colors.text }}>
            Bill Summary
          </h1>
          <div className="flex justify-center gap-2 mb-3 sm:mb-4">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-6 sm:w-8 h-2 rounded-full" style={{ backgroundColor: Colors.primary }} />
          </div>
          <p className="text-sm font-medium mb-4" style={{ color: Colors.textSecondary }}>
            Step 3 of 3: Preview & Share
          </p>
          <p className="text-sm max-w-md mx-auto" style={{ color: Colors.textMuted }}>
            Review the bill breakdown, save it, and share in Telegram for everyone to select their dishes.
          </p>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {/* Total Card */}
          <div
            className="rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-center border"
            style={{
              backgroundColor: Colors.card,
              borderColor: Colors.primary,
            }}
          >
            <p className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: Colors.textSecondary }}>
              TOTAL BILL
            </p>
            <p className="text-3xl sm:text-5xl font-extrabold mb-4 sm:mb-6" style={{ color: Colors.primary }}>
              {formatCurrency(calculation.total)}
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span style={{ color: Colors.textSecondary }}>Subtotal</span>
                <span style={{ color: Colors.text }}>{formatCurrency(calculation.subtotal)}</span>
              </div>
              {calculation.serviceCharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: Colors.textSecondary }}>
                    Service ({currentBill.serviceChargePercentage}%)
                  </span>
                  <span style={{ color: Colors.text }}>{formatCurrency(calculation.serviceCharge)}</span>
                </div>
              )}
              {calculation.gst > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: Colors.textSecondary }}>
                    GST ({currentBill.gstPercentage}%)
                  </span>
                  <span style={{ color: Colors.text }}>{formatCurrency(calculation.gst)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dishes List */}
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: Colors.text }}>
            Dishes on Bill
          </h2>
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {currentBill.dishes.map((dish) => (
              <div
                key={dish.id}
                className="rounded-xl p-5 border"
                style={{
                  backgroundColor: Colors.card,
                  borderColor: Colors.border,
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold" style={{ color: Colors.text }}>
                    {dish.name}
                  </span>
                  <span className="text-xl font-bold" style={{ color: Colors.primary }}>
                    ${dish.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Telegram Instructions */}
          {billId && (
            <div
              className="rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 border"
              style={{
                backgroundColor: Colors.card,
                borderColor: Colors.primary,
              }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: Colors.text }}>
                Share in Telegram
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: Colors.primary, color: Colors.white }}>
                    1
                  </div>
                  <p className="text-sm" style={{ color: Colors.text }}>
                    Tap the button below to open the bot in Telegram
                  </p>
                </div>

                <a
                  href={telegramDeepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                  style={{ backgroundColor: Colors.primary, color: 'white' }}
                >
                  ✈️ Open in Telegram
                </a>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: Colors.primary, color: Colors.white }}>
                    2
                  </div>
                  <p className="text-sm" style={{ color: Colors.text }}>
                    Tap <strong>&ldquo;📤 Share bill to a chat&rdquo;</strong> in the bot chat and pick your group
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: Colors.primary, color: Colors.white }}>
                    3
                  </div>
                  <p className="text-sm" style={{ color: Colors.text }}>
                    <strong>Tap the bill card that pops up</strong> above the message box to post it — don&apos;t press Enter
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: Colors.primary, color: Colors.white }}>
                    4
                  </div>
                  <p className="text-sm" style={{ color: Colors.text }}>
                    Everyone taps the dishes they ate, then you lock the bill to calculate the split!
                  </p>
                </div>
              </div>

              <details className="rounded-lg" style={{ backgroundColor: Colors.backgroundTertiary }}>
                <summary className="p-4 text-xs font-semibold cursor-pointer" style={{ color: Colors.textSecondary }}>
                  Prefer to type it manually?
                </summary>
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-xs" style={{ color: Colors.textSecondary }}>
                    Paste this in any chat, <strong>wait for the bill card to pop up, and tap it</strong>.
                    Pressing Enter just sends plain text — nobody will be able to select dishes.
                  </p>
                  <div className="rounded-lg p-3 flex items-center justify-between gap-3" style={{ backgroundColor: Colors.card }}>
                    <code className="text-sm font-mono flex-1 break-all" style={{ color: Colors.text }}>
                      @{TELEGRAM_CONFIG.BOT_USERNAME} {billId}
                    </code>
                    <button
                      onClick={handleCopyInlineCommand}
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                      style={{
                        backgroundColor: copied ? Colors.success : Colors.primary,
                        color: 'white',
                      }}
                    >
                      {copied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </details>

              <div className="rounded-lg p-4 mt-4" style={{ backgroundColor: Colors.backgroundTertiary }}>
                <p className="text-xs" style={{ color: Colors.textSecondary }}>
                  <strong>Tip:</strong> The bot works in any Telegram chat - no need to add it to your group!
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              title="Back"
              variant="secondary"
              onPress={() => router.back()}
              className="w-full sm:flex-1"
            />
            {!billId ? (
              <Button
                title={saving ? "Saving..." : "Save & Share"}
                onPress={handleSaveBill}
                className="w-full sm:flex-[2]"
                disabled={saving}
              />
            ) : (
              <Button
                title="Create New Bill"
                variant="success"
                onPress={handleCreateNew}
                className="w-full sm:flex-[2]"
              />
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
