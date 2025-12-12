'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveBillToFirebase } from '@/lib/billStorage';
import { Bill, Dish } from '@/types/bill';
import { TELEGRAM_CONFIG } from '@/config/telegram';

export default function Summary() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [billData, setBillData] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('newBill');
    if (!data) {
      router.push('/create');
      return;
    }
    setBillData(JSON.parse(data));
  }, [router]);

  if (!billData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const subtotal = billData.dishes.reduce((sum: number, dish: Dish) => sum + dish.price, 0);
  const serviceChargeAmount = subtotal * (billData.serviceChargePercentage / 100);
  const gstAmount = (subtotal + serviceChargeAmount) * (billData.gstPercentage / 100);
  const total = subtotal + serviceChargeAmount + gstAmount;

  const handleSave = async () => {
    setSaving(true);

    try {
      const bill: Bill = {
        id: `bill_${Date.now()}`,
        restaurantName: billData.restaurantName,
        date: new Date(),
        gstPercentage: billData.gstPercentage,
        serviceChargePercentage: billData.serviceChargePercentage,
        dishes: billData.dishes,
        people: [],
        participants: [],
        phase: 'selection',
        subtotal,
        gstAmount,
        serviceChargeAmount: serviceChargeAmount,
        total,
        paidBy: billData.paidBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await saveBillToFirebase(bill);
      sessionStorage.removeItem('newBill');

      // Redirect to bill detail page
      router.push(`/bill/${bill.id}`);
    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Failed to save bill. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/create" className="text-gray-400 hover:text-white">
            ← Back
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-6">Bill Summary</h1>

        {/* Restaurant Info */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{billData.restaurantName}</h2>
          <p className="text-gray-400">Paid by: {billData.paidBy}</p>
        </div>

        {/* Dishes */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Dishes</h3>
          <div className="space-y-2">
            {billData.dishes.map((dish: Dish, index: number) => (
              <div key={dish.id} className="flex justify-between text-gray-300">
                <span>{index + 1}. {dish.name}</span>
                <span className="font-medium">${dish.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Breakdown */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Total</h3>
          <div className="space-y-2 text-gray-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-white">${subtotal.toFixed(2)}</span>
            </div>
            {billData.serviceChargePercentage > 0 && (
              <div className="flex justify-between">
                <span>Service Charge ({billData.serviceChargePercentage}%):</span>
                <span className="text-white">${serviceChargeAmount.toFixed(2)}</span>
              </div>
            )}
            {billData.gstPercentage > 0 && (
              <div className="flex justify-between">
                <span>GST ({billData.gstPercentage}%):</span>
                <span className="text-white">${gstAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[#2a2a2a]">
              <span className="text-xl font-bold text-white">Grand Total:</span>
              <span className="text-xl font-bold text-[#10b981]">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#10b981] text-white py-4 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Bill & Share on Telegram'}
        </button>
      </div>
    </div>
  );
}
