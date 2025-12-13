'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
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
      alert('Please enter a dish name');
      return;
    }

    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
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
      alert('Please select at least one person for this dish');
      return;
    }

    if (selectedDish) {
      setDishes(
        dishes.map((d) =>
          d.id === selectedDish.id ? { ...d, sharedBy: selectedPeople } : d
        )
      );
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
      alert('Please add at least one dish');
      return;
    }

    const unassignedDishes = dishes.filter((d) => d.sharedBy.length === 0);
    if (unassignedDishes.length > 0) {
      alert(`Please assign people to: ${unassignedDishes.map((d) => d.name).join(', ')}`);
      return;
    }

    setCurrentBill({
      ...currentBill,
      dishes,
    });

    router.push('/bill-summary');
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
        <div
          className="p-5 border-b"
          style={{
            backgroundColor: Colors.backgroundSecondary,
            borderColor: Colors.border,
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[32px]">🍽️</span>
            <div className="flex-1">
              <h1 className="text-[28px] font-bold mb-2" style={{ color: Colors.text }}>
                Add Dishes
              </h1>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
                <div className="w-6 h-2 rounded-full" style={{ backgroundColor: Colors.primary }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
              </div>
            </div>
          </div>
          <p className="text-sm font-semibold" style={{ color: Colors.textSecondary }}>
            Step 3 of 4
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 pb-24">
          {/* Input Section */}
          <div className="mb-6">
            <div className="flex gap-3 mb-3">
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
            <Button
              title="Add Dish"
              onPress={handleAddDish}
            />
          </div>

          {/* List */}
          <h2 className="text-lg font-semibold mb-3" style={{ color: Colors.text }}>
            Dishes ({dishes.length})
          </h2>

          {dishes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-10">
              <span className="text-5xl mb-3">🍽️</span>
              <p className="text-base text-center leading-6" style={{ color: Colors.textSecondary }}>
                No dishes added yet.{'\n'}Add all items from the bill.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dishes.map((item) => {
                const assignedPeople = people.filter((p) => item.sharedBy.includes(p.id));
                const isAssigned = item.sharedBy.length > 0;

                return (
                  <div
                    key={item.id}
                    className="rounded-xl p-4 border"
                    style={{
                      backgroundColor: Colors.card,
                      borderColor: Colors.border,
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="text-base font-semibold mb-1" style={{ color: Colors.text }}>
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
                        <p className="text-xs mb-1" style={{ color: Colors.success }}>
                          Shared by:
                        </p>
                        <p className="text-sm font-medium mb-1" style={{ color: Colors.text }}>
                          {assignedPeople.map((p) => p.name).join(', ')}
                        </p>
                        <p className="text-xs text-right" style={{ color: Colors.accent }}>
                          Edit
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
        </div>

        {/* Footer */}
        <div
          className="fixed bottom-0 left-0 right-0 flex gap-3 p-4 border-t"
          style={{
            backgroundColor: Colors.backgroundSecondary,
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
            title="Continue"
            onPress={handleContinue}
            className="flex-[2]"
            disabled={dishes.length === 0}
          />
        </div>
      </div>

      {/* Assignment Modal */}
      {assignModalVisible && (
        <div
          className="fixed inset-0 flex items-end justify-center z-50"
          style={{ backgroundColor: Colors.overlay }}
          onClick={() => setAssignModalVisible(false)}
        >
          <div
            className="w-full max-h-[80%] rounded-t-3xl p-5 border overflow-y-auto"
            style={{
              backgroundColor: Colors.card,
              borderColor: Colors.border,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-1" style={{ color: Colors.text }}>
              Who shared this dish?
            </h3>
            <p className="text-base mb-5" style={{ color: Colors.textSecondary }}>
              {selectedDish?.name} (${selectedDish?.price.toFixed(2)})
            </p>

            <div className="space-y-2 mb-5">
              {people.map((person) => {
                const isSelected = selectedPeople.includes(person.id);
                return (
                  <button
                    key={person.id}
                    onClick={() => handleTogglePerson(person.id)}
                    className="w-full flex justify-between items-center p-4 rounded-xl border"
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
  );
}
