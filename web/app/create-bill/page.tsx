'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';
import { useBill } from '@/context/BillContext';
import { Colors } from '@/constants/colors';
import { validatePaidBy, validatePercentage } from '@/utils/validation';

export default function CreateBillScreen() {
  const router = useRouter();
  const { setCurrentBill } = useBill();
  const [gstPercentage, setGstPercentage] = useState('9');
  const [serviceChargePercentage, setServiceChargePercentage] = useState('10');
  const [paidBy, setPaidBy] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const handleContinue = () => {
    const paidByValidation = validatePaidBy(paidBy);
    if (!paidByValidation.valid) {
      setToast({ message: paidByValidation.error!, type: 'error' });
      return;
    }

    const gst = parseFloat(gstPercentage) || 0;
    const serviceCharge = parseFloat(serviceChargePercentage) || 0;

    const gstValidation = validatePercentage(gst, 'GST percentage');
    if (!gstValidation.valid) {
      setToast({ message: gstValidation.error!, type: 'error' });
      return;
    }

    const serviceValidation = validatePercentage(serviceCharge, 'Service charge percentage');
    if (!serviceValidation.valid) {
      setToast({ message: serviceValidation.error!, type: 'error' });
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

    router.push('/add-dishes');
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
      <div className="min-h-screen py-12 px-4 sm:px-6" style={{ backgroundColor: Colors.background }}>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-6" style={{ color: Colors.text }}>
              Create New Bill
            </h1>

            {/* Progress Indicators */}
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: Colors.primary }} />
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: Colors.border }} />
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: Colors.border }} />
            </div>

            <p className="text-sm font-semibold mb-2" style={{ color: Colors.primary }}>
              Step 1 of 3
            </p>
            <p className="text-sm" style={{ color: Colors.textSecondary }}>
              Enter who paid and the tax percentages
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl p-8 border mb-8" style={{ backgroundColor: Colors.card, borderColor: Colors.border }}>
            <div className="space-y-6">
              {/* Paid By */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: Colors.text }}>
                  Who Paid? *
                </label>
                <Input
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  placeholder="Enter name (e.g., John)"
                  maxLength={50}
                />
                <p className="text-xs mt-1" style={{ color: Colors.textMuted }}>
                  This person will receive payments from others
                </p>
              </div>

              {/* GST */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: Colors.text }}>
                  GST %
                </label>
                <Input
                  type="number"
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(e.target.value)}
                  placeholder="9"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              {/* Service Charge */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: Colors.text }}>
                  Service Charge %
                </label>
                <Input
                  type="number"
                  value={serviceChargePercentage}
                  onChange={(e) => setServiceChargePercentage(e.target.value)}
                  placeholder="10"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button onClick={handleContinue} className="w-full">
            <span className="flex items-center justify-center gap-2">
              Continue to Add Dishes
              <ArrowRight size={18} />
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}
