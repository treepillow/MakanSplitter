'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Toast } from '@/components/Toast';
import { useBill } from '@/context/BillContext';
import { validatePaidBy, validatePercentage } from '@/utils/validation';

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
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      <div className="min-h-screen py-12 px-5 sm:px-8">
        <div className="max-w-lg mx-auto">
          {/* Step header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <p className="mlabel">Step 1 / 3</p>
              <StepMeter current={1} />
            </div>
            <h1 className="font-mono font-extrabold uppercase text-3xl tracking-tight text-ink mb-2">
              Open a tab
            </h1>
            <p className="text-ink-soft">
              Who fronted the money, and what the restaurant adds on top.
            </p>
          </div>

          {/* Form slip */}
          <div className="slip tear-b px-6 sm:px-8 py-8 mb-12">
            <div className="space-y-6">
              <div>
                <Input
                  label="Who paid?"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  placeholder="e.g. Aaron"
                  maxLength={50}
                />
                <p className="text-xs text-ink-faint mt-2">
                  This person collects the money after the split.
                </p>
              </div>

              <hr className="rule-dash" />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="GST %"
                  type="number"
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(e.target.value)}
                  placeholder="9"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <Input
                  label="Service %"
                  type="number"
                  value={serviceChargePercentage}
                  onChange={(e) => setServiceChargePercentage(e.target.value)}
                  placeholder="10"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <button onClick={handleContinue} className="btn btn-ink btn-lg w-full">
                Next: add dishes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
