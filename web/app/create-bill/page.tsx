'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useBill } from '@/context/BillContext';
import { Colors } from '@/constants/colors';

export default function CreateBillScreen() {
  const router = useRouter();
  const { setCurrentBill } = useBill();
  const [gstPercentage, setGstPercentage] = useState('9');
  const [serviceChargePercentage, setServiceChargePercentage] = useState('10');
  const [paidBy, setPaidBy] = useState('');
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setTimeout(() => setOpacity(1), 100);
  }, []);

  const handleContinue = () => {
    if (!paidBy.trim()) {
      alert('Please enter who paid the bill');
      return;
    }

    const gst = parseFloat(gstPercentage) || 0;
    const serviceCharge = parseFloat(serviceChargePercentage) || 0;

    if (gst < 0 || gst > 100) {
      alert('GST percentage must be between 0 and 100');
      return;
    }

    if (serviceCharge < 0 || serviceCharge > 100) {
      alert('Service charge percentage must be between 0 and 100');
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
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: Colors.background }}
    >
      <div
        className="transition-opacity duration-600"
        style={{ opacity }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-8 text-center">
          <div className="text-5xl mb-3">💸</div>
          <h1 className="text-[32px] font-extrabold tracking-tight mb-4" style={{ color: Colors.text }}>
            New Bill
          </h1>
          <div className="flex justify-center gap-2 mb-3">
            <div
              className="w-6 h-2 rounded-full"
              style={{ backgroundColor: Colors.primary }}
            />
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: Colors.border }}
            />
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: Colors.border }}
            />
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: Colors.border }}
            />
          </div>
          <p className="text-sm font-semibold" style={{ color: Colors.textLight }}>
            Step 1 of 4
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 px-5">
          <div
            className="rounded-3xl p-6 border"
            style={{
              backgroundColor: Colors.card,
              borderColor: Colors.border,
              boxShadow: `0 8px 16px ${Colors.primary}26`,
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

            <div
              className="flex items-start rounded-2xl p-4 mt-2 border"
              style={{
                backgroundColor: Colors.cardHover,
                borderColor: Colors.borderLight,
              }}
            >
              <span className="text-xl mr-3">💡</span>
              <p className="flex-1 text-sm leading-5 font-medium" style={{ color: Colors.textSecondary }}>
                In Singapore, GST is typically 9% and service charge is 10%.
                Leave as 0 if not applicable.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 p-5 border-t"
          style={{
            backgroundColor: Colors.background,
            borderColor: Colors.border,
          }}
        >
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => router.push('/')}
            className="flex-1"
          />
          <Button
            title="Continue"
            onPress={handleContinue}
            className="flex-[2]"
            icon="→"
          />
        </div>
      </div>
    </div>
  );
}
