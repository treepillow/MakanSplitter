'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { useBill } from '@/context/BillContext';
import { calculateBill, formatCurrency, generateTelegramMessage } from '@/utils/billCalculator';
import { Bill } from '@/types/bill';
import { Colors } from '@/constants/colors';

export default function BillSummaryScreen() {
  const router = useRouter();
  const { currentBill, clearCurrentBill } = useBill();
  const [opacity, setOpacity] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [telegramMessage, setTelegramMessage] = useState('');

  useEffect(() => {
    setTimeout(() => setOpacity(1), 100);
  }, []);

  useEffect(() => {
    if (!currentBill || !currentBill.dishes || !currentBill.people) {
      router.replace('/');
    }
  }, [currentBill, router]);

  if (!currentBill || !currentBill.dishes || !currentBill.people) {
    return null;
  }

  const calculation = calculateBill(
    currentBill.dishes,
    currentBill.people,
    currentBill.gstPercentage || 0,
    currentBill.serviceChargePercentage || 0
  );

  const handleGenerateMessage = () => {
    const tempBill: Bill = {
      id: 'temp',
      restaurantName: currentBill.restaurantName || 'Restaurant',
      date: typeof currentBill.date === 'string' ? new Date(currentBill.date) : (currentBill.date || new Date()),
      gstPercentage: currentBill.gstPercentage || 0,
      serviceChargePercentage: currentBill.serviceChargePercentage || 0,
      dishes: currentBill.dishes!,
      people: calculation.perPersonBreakdown.map((p) => ({
        id: p.personId,
        name: p.personName,
        amountOwed: p.total,
        hasPaid: false,
        paidBy: currentBill.paidBy || '',
      })),
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

    const message = generateTelegramMessage(tempBill, calculation);
    setTelegramMessage(message);
    setShowMessage(true);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(telegramMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateNew = () => {
    clearCurrentBill();
    router.push('/');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: Colors.background }}>
      <div
        className="max-w-4xl mx-auto px-6 py-12 transition-opacity duration-600"
        style={{ opacity }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">📋</div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: Colors.text }}>
            Bill Summary
          </h1>
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-8 h-2 rounded-full" style={{ backgroundColor: Colors.primary }} />
          </div>
          <p className="text-sm font-medium" style={{ color: Colors.textSecondary }}>
            Step 4 of 4
          </p>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {/* Total Card */}
          <div
            className="rounded-2xl p-8 mb-8 text-center border"
            style={{
              backgroundColor: Colors.card,
              borderColor: Colors.primary,
            }}
          >
            <p className="text-sm font-semibold mb-3" style={{ color: Colors.textSecondary }}>
              TOTAL BILL
            </p>
            <p className="text-5xl font-extrabold mb-6" style={{ color: Colors.primary }}>
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

          {/* Per Person Breakdown */}
          <h2 className="text-2xl font-bold mb-6" style={{ color: Colors.text }}>
            Who Owes What
          </h2>
          <div className="space-y-4 mb-8">
            {calculation.perPersonBreakdown.map((person) => (
              <div
                key={person.personId}
                className="rounded-xl p-5 border"
                style={{
                  backgroundColor: Colors.card,
                  borderColor: Colors.border,
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold" style={{ color: Colors.text }}>
                    {person.personName}
                  </span>
                  <span className="text-2xl font-extrabold" style={{ color: Colors.primary }}>
                    {formatCurrency(person.total)}
                  </span>
                </div>
                <div className="space-y-1">
                  {person.dishesEaten.map((dish, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span style={{ color: Colors.textSecondary }}>• {dish.dishName}</span>
                      <span style={{ color: Colors.textLight }}>{formatCurrency(dish.shareAmount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Telegram Message Display */}
          {showMessage && (
            <div
              className="rounded-2xl p-6 mb-8 border"
              style={{
                backgroundColor: Colors.card,
                borderColor: Colors.primary,
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: Colors.text }}>
                  📱 Telegram Message
                </h3>
                <button
                  onClick={handleCopyMessage}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: copied ? Colors.success : Colors.primary,
                    color: 'white',
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <pre
                className="whitespace-pre-wrap text-sm font-mono p-4 rounded-lg overflow-x-auto"
                style={{
                  backgroundColor: Colors.backgroundTertiary,
                  color: Colors.text,
                }}
              >
                {telegramMessage}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              title="Back"
              variant="secondary"
              onPress={() => router.back()}
              className="flex-1"
            />
            {!showMessage ? (
              <Button
                title="Generate Message 📱"
                onPress={handleGenerateMessage}
                className="flex-[2]"
              />
            ) : (
              <Button
                title="Create New Bill"
                variant="success"
                onPress={handleCreateNew}
                className="flex-[2]"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
