'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';
import { useBill } from '@/context/BillContext';
import { Dish } from '@/types/bill';
import { Colors } from '@/constants/colors';
import { validateDishName, validatePrice } from '@/utils/validation';

export default function AddDishesScreen() {
  const router = useRouter();
  const { currentBill, setCurrentBill } = useBill();
  const [dishes, setDishes] = useState<Dish[]>(currentBill?.dishes || []);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [opacity, setOpacity] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    setTimeout(() => setOpacity(1), 100);
  }, []);

  useEffect(() => {
    if (!currentBill) {
      router.replace('/');
    }
  }, [currentBill, router]);

  if (!currentBill) {
    return null;
  }

  const handleAddDish = () => {
    const trimmedName = dishName.trim();
    const price = parseFloat(dishPrice);

    // Validate dish name
    const nameValidation = validateDishName(trimmedName);
    if (!nameValidation.valid) {
      setToast({ message: nameValidation.error!, type: 'error' });
      return;
    }

    // Validate price
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
    setToast({ message: `${trimmedName} added successfully!`, type: 'success' });
  };

  const handleRemoveDish = (dishId: string) => {
    setDishes(dishes.filter((d) => d.id !== dishId));
  };

  const handleContinue = () => {
    if (dishes.length === 0) {
      setToast({ message: 'Please add at least one dish', type: 'error' });
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
            Add Dishes
          </h1>
          <div className="flex justify-center gap-2 mb-3 sm:mb-4">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-6 sm:w-8 h-2 rounded-full" style={{ backgroundColor: Colors.primary }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
          </div>
          <p className="text-sm font-medium mb-4" style={{ color: Colors.textSecondary }}>
            Step 2 of 3: What Did You Order?
          </p>
          <p className="text-sm max-w-md mx-auto" style={{ color: Colors.textMuted }}>
            Add all dishes from the bill with their prices. People will choose what they ate in Telegram.
          </p>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto flex-1 flex flex-col min-h-0">
          {/* Input Section */}
          <div
            className="rounded-2xl p-6 sm:p-10 mb-6 sm:mb-8 border"
            style={{
              backgroundColor: Colors.card,
              borderColor: Colors.border,
            }}
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Input
                label="Dish Name"
                value={dishName}
                onChangeText={setDishName}
                placeholder="e.g. Xiao Long Bao"
                className="w-full sm:flex-[2] mb-0"
              />
              <Input
                label="Price ($)"
                value={dishPrice}
                onChangeText={setDishPrice}
                placeholder="0.00"
                type="number"
                className="w-full sm:flex-1 mb-0"
              />
            </div>
            <div className="flex justify-end">
              <Button
                title="+ Add Dish"
                onPress={handleAddDish}
              />
            </div>
          </div>

          {/* List */}
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: Colors.text }}>
            Dishes
            <span className="text-base px-2 py-1 rounded-lg" style={{ backgroundColor: Colors.primary, color: Colors.white }}>
              {dishes.length}
            </span>
          </h2>

          {dishes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-base text-center" style={{ color: Colors.textSecondary }}>
                No dishes added yet
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-8 flex-1 overflow-y-auto min-h-0">
              {dishes.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl p-6 border"
                  style={{
                    backgroundColor: Colors.card,
                    borderColor: Colors.border,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-base font-semibold mb-2" style={{ color: Colors.text }}>
                        {item.name}
                      </p>
                      <p className="text-lg font-bold" style={{ color: Colors.accent }}>
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveDish(item.id)}
                      className="p-1"
                    >
                      <span className="text-xl" style={{ color: Colors.error }}>✕</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              title="Back"
              variant="secondary"
              onPress={() => router.back()}
              className="w-full sm:flex-1"
            />
            <Button
              title="Continue →"
              onPress={handleContinue}
              className="w-full sm:flex-[2]"
              disabled={dishes.length === 0}
            />
          </div>
        </div>
      </div>

    </div>
    </>
  );
}
