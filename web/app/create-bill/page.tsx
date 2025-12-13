'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';
import { useBill } from '@/context/BillContext';
import { Colors } from '@/constants/colors';

export default function CreateBillScreen() {
  const router = useRouter();
  const { setCurrentBill } = useBill();
  const [gstPercentage, setGstPercentage] = useState('9');
  const [serviceChargePercentage, setServiceChargePercentage] = useState('10');
  const [paidBy, setPaidBy] = useState('');
  const [opacity, setOpacity] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    setTimeout(() => setOpacity(1), 100);
  }, []);

  const handleContinue = () => {
    if (!paidBy.trim()) {
      setToast({ message: 'Please enter who paid the bill', type: 'error' });
      return;
    }

    const gst = parseFloat(gstPercentage) || 0;
    const serviceCharge = parseFloat(serviceChargePercentage) || 0;

    if (gst < 0 || gst > 100) {
      setToast({ message: 'GST percentage must be between 0 and 100', type: 'error' });
      return;
    }

    if (serviceCharge < 0 || serviceCharge > 100) {
      setToast({ message: 'Service charge percentage must be between 0 and 100', type: 'error' });
      return;
    }

    setCurrentBill({
      gstPercentage: gst,
      serviceChargePercentage: serviceCharge,
      paidBy: paidBy.trim(),
      date: new Date(),
      dishes: [],
      people: [],
    });

    router.push('/add-people');
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
      <div className="h-screen overflow-hidden" style={{ backgroundColor: Colors.background }}>
      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8 h-full transition-opacity duration-600 flex flex-col"
        style={{ opacity }}
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6" style={{ color: Colors.text }}>
            Create New Bill
          </h1>
          <div className="flex justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-6 sm:w-8 h-2 rounded-full" style={{ backgroundColor: Colors.primary }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
          </div>
          <p className="text-sm font-medium mb-4" style={{ color: Colors.textSecondary }}>
            Step 1 of 4: Bill Information
          </p>
          <p className="text-sm max-w-md mx-auto" style={{ color: Colors.textMuted }}>
            Enter who paid and the tax percentages. You'll add people and dishes next.
          </p>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto flex-1 flex flex-col min-h-0">
        <div
          className="rounded-2xl p-6 sm:p-10 border space-y-6 sm:space-y-8 mb-6 sm:mb-8"
          style={{
            backgroundColor: Colors.card,
            borderColor: Colors.border,
          }}
        >
          <Input
            label="Who Paid the Bill?"
            value={paidBy}
            onChangeText={setPaidBy}
            placeholder="e.g. John, Me"
            icon="👤"
          />

          <Input
            label="GST (%)"
            value={gstPercentage}
            onChangeText={setGstPercentage}
            placeholder="9"
            type="number"
            icon="📋"
          />

          <Input
            label="Service Charge (%)"
            value={serviceChargePercentage}
            onChangeText={setServiceChargePercentage}
            placeholder="10"
            type="number"
            icon="🔔"
          />

          <p className="text-sm text-center pt-4" style={{ color: Colors.textSecondary }}>
            💡 In Singapore, GST is typically 9% and service charge is 10%
          </p>
        </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => router.push('/')}
              className="w-full sm:flex-1 sm:max-w-[200px]"
            />
            <Button
              title="Continue →"
              onPress={handleContinue}
              className="w-full sm:flex-[2] sm:max-w-[400px]"
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
