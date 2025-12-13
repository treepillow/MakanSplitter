'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';
import { useBill } from '@/context/BillContext';
import { Dish } from '@/types/bill';
import { Colors } from '@/constants/colors';

export default function AddDishesScreen() {
  const router = useRouter();
  const { currentBill, setCurrentBill } = useBill();
  const [dishes, setDishes] = useState<Dish[]>(currentBill?.dishes || []);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [opacity, setOpacity] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    setTimeout(() => setOpacity(1), 100);
  }, []);

  useEffect(() => {
    if (!currentBill || !currentBill.people) {
      router.replace('/');
    }
  }, [currentBill, router]);

  if (!currentBill || !currentBill.people) {
    return null;
  }

  const people = currentBill.people;

  const handleAddDish = () => {
    const trimmedName = dishName.trim();
    const price = parseFloat(dishPrice);

    if (!trimmedName) {
      setToast({ message: 'Please enter a dish name', type: 'error' });
      return;
    }

    if (isNaN(price) || price <= 0) {
      setToast({ message: 'Please enter a valid price', type: 'error' });
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

    // Automatically open assignment modal
    setSelectedDish(newDish);
    setSelectedPeople([]);
    setAssignModalVisible(true);
  };

  const handleAssignPeople = (dish: Dish) => {
    setSelectedDish(dish);
    setSelectedPeople(dish.sharedBy);
    setAssignModalVisible(true);
  };

  const handleTogglePerson = (personId: string) => {
    if (selectedPeople.includes(personId)) {
      setSelectedPeople(selectedPeople.filter((id) => id !== personId));
    } else {
      setSelectedPeople([...selectedPeople, personId]);
    }
  };

  const handleSaveAssignment = () => {
    if (selectedPeople.length === 0) {
      setToast({ message: 'Please select at least one person for this dish', type: 'error' });
      return;
    }

    if (selectedDish) {
      setDishes(
        dishes.map((d) =>
          d.id === selectedDish.id ? { ...d, sharedBy: selectedPeople } : d
        )
      );
      setToast({ message: 'Assignment saved successfully!', type: 'success' });
    }

    setAssignModalVisible(false);
    setSelectedDish(null);
    setSelectedPeople([]);
  };

  const handleRemoveDish = (dishId: string) => {
    setDishes(dishes.filter((d) => d.id !== dishId));
  };

  const handleContinue = () => {
    if (dishes.length === 0) {
      setToast({ message: 'Please add at least one dish', type: 'error' });
      return;
    }

    const unassignedDishes = dishes.filter((d) => d.sharedBy.length === 0);
    if (unassignedDishes.length > 0) {
      setToast({ message: `Please assign people to: ${unassignedDishes.map((d) => d.name).join(', ')}`, type: 'warning' });
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
        className="max-w-3xl mx-auto px-6 py-8 h-full transition-opacity duration-600 flex flex-col"
        style={{ opacity }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-6" style={{ color: Colors.text }}>
            Add Dishes
          </h1>
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-8 h-2 rounded-full" style={{ backgroundColor: Colors.primary }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
          </div>
          <p className="text-sm font-medium" style={{ color: Colors.textSecondary }}>
            Step 3 of 4
          </p>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto flex-1 flex flex-col min-h-0">
          {/* Input Section */}
          <div
            className="rounded-2xl p-10 mb-8 border"
            style={{
              backgroundColor: Colors.card,
              borderColor: Colors.border,
            }}
          >
            <div className="flex gap-4 mb-8">
              <Input
                label="Dish Name"
                value={dishName}
                onChangeText={setDishName}
                placeholder="e.g. Xiao Long Bao"
                className="flex-[2] mb-0"
              />
              <Input
                label="Price ($)"
                value={dishPrice}
                onChangeText={setDishPrice}
                placeholder="0.00"
                type="number"
                className="flex-1 mb-0"
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
              {dishes.map((item) => {
                const assignedPeople = people.filter((p) => item.sharedBy.includes(p.id));
                const isAssigned = item.sharedBy.length > 0;

                return (
                  <div
                    key={item.id}
                    className="rounded-xl p-6 border"
                    style={{
                      backgroundColor: Colors.card,
                      borderColor: Colors.border,
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
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

                    {isAssigned ? (
                      <button
                        onClick={() => handleAssignPeople(item)}
                        className="w-full rounded-lg p-3 border text-left"
                        style={{
                          backgroundColor: Colors.backgroundTertiary,
                          borderColor: Colors.success,
                        }}
                      >
                        <p className="text-sm" style={{ color: Colors.success }}>
                          Shared: {assignedPeople.map((p) => p.name).join(', ')}
                        </p>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAssignPeople(item)}
                        className="w-full rounded-lg p-3 border"
                        style={{
                          backgroundColor: Colors.backgroundTertiary,
                          borderColor: Colors.warning,
                        }}
                      >
                        <p className="text-sm text-center" style={{ color: Colors.warning }}>
                          ⚠️ Tap to assign people
                        </p>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              title="Back"
              variant="secondary"
              onPress={() => router.back()}
              className="flex-1"
            />
            <Button
              title="Continue →"
              onPress={handleContinue}
              className="flex-[2]"
              disabled={dishes.length === 0}
            />
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {assignModalVisible && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setAssignModalVisible(false)}
        >
          <div
            className="w-full max-w-md max-h-[80vh] rounded-2xl p-8 border overflow-y-auto"
            style={{
              backgroundColor: Colors.card,
              borderColor: Colors.border,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-3" style={{ color: Colors.text }}>
              Who shared this dish?
            </h3>
            <p className="text-base mb-8" style={{ color: Colors.textSecondary }}>
              {selectedDish?.name} (${selectedDish?.price.toFixed(2)})
            </p>

            <div className="space-y-4 mb-8">
              {people.map((person) => {
                const isSelected = selectedPeople.includes(person.id);
                return (
                  <button
                    key={person.id}
                    onClick={() => handleTogglePerson(person.id)}
                    className="w-full flex justify-between items-center p-5 rounded-xl border"
                    style={{
                      backgroundColor: isSelected ? Colors.primary : Colors.backgroundTertiary,
                      borderColor: isSelected ? Colors.primary : Colors.border,
                    }}
                  >
                    <span
                      className="text-base font-medium"
                      style={{ color: isSelected ? Colors.white : Colors.text }}
                    >
                      {person.name}
                    </span>
                    {isSelected && (
                      <span className="text-lg font-bold" style={{ color: Colors.white }}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setAssignModalVisible(false);
                  setSelectedDish(null);
                  setSelectedPeople([]);
                }}
                className="flex-1"
              />
              <Button
                title="Save"
                onPress={handleSaveAssignment}
                className="flex-[2]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
