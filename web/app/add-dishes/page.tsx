'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Toast } from '@/components/Toast';
import { useBill } from '@/context/BillContext';
import { Dish } from '@/types/bill';
import { validateDishName, validatePrice } from '@/utils/validation';

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

export default function AddDishesScreen() {
  const router = useRouter();
  const { currentBill, setCurrentBill } = useBill();
  const [dishes, setDishes] = useState<Dish[]>(currentBill?.dishes || []);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    if (!currentBill) {
      router.replace('/');
    }
  }, [currentBill, router]);

  if (!currentBill) {
    return null;
  }

  const gstPct = currentBill.gstPercentage || 0;
  const svcPct = currentBill.serviceChargePercentage || 0;
  const subtotal = dishes.reduce((sum, dish) => sum + dish.price, 0);
  const svcAmount = subtotal * (svcPct / 100);
  const gstAmount = (subtotal + svcAmount) * (gstPct / 100);
  const total = subtotal + svcAmount + gstAmount;

  const handleAddDish = () => {
    const trimmedName = dishName.trim();
    const price = parseFloat(dishPrice);

    const nameValidation = validateDishName(trimmedName);
    if (!nameValidation.valid) {
      setToast({ message: nameValidation.error!, type: 'error' });
      return;
    }

    const priceValidation = validatePrice(price);
    if (!priceValidation.valid) {
      setToast({ message: priceValidation.error!, type: 'error' });
      return;
    }

    const newDish: Dish = {
      id: `dish_${Date.now()}_${Math.random()}`,
      name: trimmedName,
      price: price,
      sharedBy: [],
    };

    setDishes([...dishes, newDish]);
    setDishName('');
    setDishPrice('');
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddDish();
  };

  const handleRemoveDish = (dishId: string) => {
    setDishes(dishes.filter((d) => d.id !== dishId));
  };

  const handleContinue = () => {
    if (dishes.length === 0) {
      setToast({ message: 'Add at least one dish to continue', type: 'error' });
      return;
    }

    setCurrentBill({
      ...currentBill,
      dishes,
    });

    router.push('/bill-summary');
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
              <p className="mlabel">Step 2 / 3</p>
              <StepMeter current={2} />
            </div>
            <h1 className="font-mono font-extrabold uppercase text-3xl tracking-tight text-ink mb-2">
              Add dishes
            </h1>
            <p className="text-ink-soft">
              Every line on the bill. Your friends pick theirs in Telegram.
            </p>
          </div>

          {/* Entry slip */}
          <div className="slip px-6 sm:px-8 py-6 mb-8">
            <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[2fr_1fr] gap-3 mb-4">
              <Input
                label="Dish"
                value={dishName}
                onChangeText={setDishName}
                placeholder="e.g. Xiao Long Bao"
              />
              <Input
                label="Price $"
                value={dishPrice}
                onChangeText={setDishPrice}
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                onKeyDown={handlePriceKeyDown}
                className="w-28 sm:w-auto"
              />
            </div>
            <button onClick={handleAddDish} className="btn btn-ghost w-full">
              + Add dish
            </button>
          </div>

          {/* Live receipt */}
          <div className="slip tear-b px-6 sm:px-8 pt-6 pb-7 mb-12">
            <div className="flex items-baseline justify-between mb-4">
              <p className="mlabel">The bill so far</p>
              <p className="font-mono text-xs text-ink-soft tabnum">
                {dishes.length} {dishes.length === 1 ? 'ITEM' : 'ITEMS'}
              </p>
            </div>

            {dishes.length === 0 ? (
              <p className="font-mono text-sm text-ink-faint text-center py-8">
                — NO ITEMS YET —
              </p>
            ) : (
              <div className="space-y-2">
                {dishes.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <div className="leader-row font-mono text-sm text-ink flex-1 min-w-0">
                      <span className="truncate">{item.name}</span>
                      <span className="leader" />
                      <span className="tabnum">{item.price.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveDish(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="font-mono text-ink-faint hover:text-chop text-sm px-1 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <hr className="rule-dash my-4" />

            <div className="space-y-1 font-mono text-xs text-ink-soft">
              <div className="leader-row">
                <span>SUBTOTAL</span>
                <span className="leader" />
                <span className="tabnum">{subtotal.toFixed(2)}</span>
              </div>
              {svcPct > 0 && (
                <div className="leader-row">
                  <span>SVC {svcPct}%</span>
                  <span className="leader" />
                  <span className="tabnum">{svcAmount.toFixed(2)}</span>
                </div>
              )}
              {gstPct > 0 && (
                <div className="leader-row">
                  <span>GST {gstPct}%</span>
                  <span className="leader" />
                  <span className="tabnum">{gstAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="leader-row font-mono font-bold text-base text-ink mt-2">
              <span>TOTAL</span>
              <span className="leader" />
              <span className="tabnum">{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => router.back()} className="btn btn-ghost flex-1">
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={dishes.length === 0}
              className="btn btn-ink flex-[2]"
            >
              Next: review
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
