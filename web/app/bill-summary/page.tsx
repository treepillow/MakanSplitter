'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { useBill } from '@/context/BillContext';
import { calculateBill, formatCurrency, generateTelegramMessage } from '@/utils/billCalculator';
import { Bill } from '@/types/bill';
import { Colors } from '@/constants/colors';
import { saveBillToFirebase } from '@/lib/billStorage';

export default function BillSummaryScreen() {
  const router = useRouter();
  const { currentBill, setCurrentBill, saveBillToHistory } = useBill();
  const [saving, setSaving] = useState(false);
  const [opacity, setOpacity] = useState(0);

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

  const handleSaveBill = async () => {
    setSaving(true);
    try {
      const completeBill: Bill = {
        id: `bill_${Date.now()}`,
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

      await saveBillToHistory(completeBill);

      try {
        await saveBillToFirebase(completeBill);
        console.log('Bill saved to Firebase:', completeBill.id);
      } catch (error) {
        console.error('Failed to save to Firebase:', error);
      }

      setCurrentBill(null);
      alert('Bill saved successfully!');
      router.push('/');
    } catch (error) {
      alert('Failed to save bill. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyMessage = () => {
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
    navigator.clipboard.writeText(message);
    alert('Message copied to clipboard!');
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: Colors.background }}
    >
      <div
        className="transition-opacity duration-600"
        style={{ opacity }}
      >
        {/* Header */}
        <div className="p-5 text-center">
          <div className="text-5xl mb-3">📋</div>
          <h1 className="text-[32px] font-extrabold tracking-tight mb-4" style={{ color: Colors.text }}>
            Bill Summary
          </h1>
          <div className="flex justify-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-6 h-2 rounded-full" style={{ backgroundColor: Colors.primary }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: Colors.textLight }}>
            Step 4 of 4
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 pb-24 overflow-y-auto">
          {/* Total Card */}
          <div
            className="rounded-3xl p-6 mb-5 text-center border"
            style={{
              backgroundColor: Colors.card,
              borderColor: Colors.primary,
              boxShadow: `0 8px 16px ${Colors.primary}4D`,
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: Colors.textLight }}>
              TOTAL BILL
            </p>
            <p className="text-5xl font-extrabold mb-4" style={{ color: Colors.primary }}>
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
          <h2 className="text-xl font-bold mb-4" style={{ color: Colors.text }}>
            Who Owes What
          </h2>
          <div className="space-y-3 mb-5">
            {calculation.perPersonBreakdown.map((person, index) => (
              <div
                key={person.personId}
                className="rounded-2xl p-4 border"
                style={{
                  backgroundColor: Colors.card,
                  borderColor: Colors.border,
                  boxShadow: `0 4px 8px ${Colors.primary}1A`,
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

          {/* Share Button */}
          <Button
            title="📋 Copy Summary"
            variant="secondary"
            onPress={handleCopyMessage}
            className="mb-3"
          />
        </div>

        {/* Footer */}
        <div
          className="fixed bottom-0 left-0 right-0 flex gap-3 p-5 border-t"
          style={{
            backgroundColor: Colors.background,
            borderColor: Colors.border,
          }}
        >
          <Button
            title="Back"
            variant="secondary"
            onPress={() => router.back()}
            className="flex-1"
          />
          <Button
            title="Save Bill"
            onPress={handleSaveBill}
            className="flex-[2]"
            loading={saving}
            icon="✓"
          />
        </div>
      </div>
    </div>
  );
}
