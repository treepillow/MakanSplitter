'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
    // Validate paidBy
    const paidByValidation = validatePaidBy(paidBy);
    if (!paidByValidation.valid) {
      setToast({ message: paidByValidation.error!, type: 'error' });
      return;
    }

    const gst = parseFloat(gstPercentage) || 0;
    const serviceCharge = parseFloat(serviceChargePercentage) || 0;

    // Validate GST
    const gstValidation = validatePercentage(gst, 'GST percentage');
    if (!gstValidation.valid) {
      setToast({ message: gstValidation.error!, type: 'error' });
      return;
    }

    // Validate Service Charge
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
      <div className="min-h-screen" style={{ backgroundColor: Colors.background }}>
        <motion.div
          className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: Colors.text }}>
              Create New Bill
            </h1>
            <div className="flex justify-center gap-3 mb-4">
              <div className="w-8 h-2 rounded-full" style={{ backgroundColor: Colors.primary }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            </div>
            <p className="text-sm font-semibold mb-3" style={{ color: Colors.primary }}>
              Step 1 of 3: Bill Information
            </p>
            <p className="text-sm max-w-md mx-auto" style={{ color: Colors.textMuted }}>
              Enter who paid and the tax percentages. You'll add dishes next.
            </p>
          </motion.div>

          {/* Content */}
          <div className="max-w-2xl mx-auto">
            <motion.div
              className="rounded-2xl p-8 sm:p-10 border-2 space-y-8 mb-8"
              style={{
                backgroundColor: Colors.glassBackground,
                borderColor: Colors.borderGlow,
                backdropFilter: 'blur(20px)',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Input
                label="Who Paid the Bill?"
                value={paidBy}
                onChangeText={setPaidBy}
                placeholder="e.g. John, Me"
              />

              <Input
                label="GST (%)"
                value={gstPercentage}
                onChangeText={setGstPercentage}
                placeholder="9"
                type="number"
              />

              <Input
                label="Service Charge (%)"
                value={serviceChargePercentage}
                onChangeText={setServiceChargePercentage}
                placeholder="10"
                type="number"
              />

              <p className="text-sm text-center pt-4" style={{ color: Colors.textSecondary }}>
                💡 In Singapore, GST is typically 9% and service charge is 10%
              </p>
            </motion.div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-center">
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
        </motion.div>
      </div>
    </>
  );
}
