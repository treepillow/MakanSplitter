'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';
import { useBill } from '@/context/BillContext';
import { Colors } from '@/constants/colors';

export default function AddPeopleScreen() {
  const router = useRouter();
  const { currentBill, setCurrentBill } = useBill();
  const [personName, setPersonName] = useState('');
  const [people, setPeople] = useState<string[]>([]);
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

  const handleAddPerson = () => {
    const trimmedName = personName.trim();
    if (!trimmedName) {
      setToast({ message: 'Please enter a person\'s name', type: 'error' });
      return;
    }

    if (people.includes(trimmedName)) {
      setToast({ message: 'This person has already been added', type: 'warning' });
      return;
    }

    setPeople([...people, trimmedName]);
    setPersonName('');
    setToast({ message: `${trimmedName} added successfully!`, type: 'success' });
  };

  const handleRemovePerson = (name: string) => {
    setPeople(people.filter((p) => p !== name));
  };

  const handleContinue = () => {
    if (people.length === 0) {
      setToast({ message: 'Please add at least one person', type: 'error' });
      return;
    }

    setCurrentBill({
      ...currentBill,
      people: people.map((name) => ({
        id: `person_${Date.now()}_${Math.random()}`,
        name,
        amountOwed: 0,
        hasPaid: false,
      })),
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
      <div className="h-screen overflow-hidden" style={{ backgroundColor: Colors.background }}>
      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8 h-full transition-opacity duration-600 flex flex-col"
        style={{ opacity }}
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6" style={{ color: Colors.text }}>
            Add People
          </h1>
          <div className="flex justify-center gap-2 mb-3 sm:mb-4">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-6 sm:w-8 h-2 rounded-full" style={{ backgroundColor: Colors.primary }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.border }} />
          </div>
          <p className="text-sm font-medium mb-4" style={{ color: Colors.textSecondary }}>
            Step 2 of 4: Who's Eating?
          </p>
          <p className="text-sm max-w-md mx-auto" style={{ color: Colors.textMuted }}>
            Add everyone who shared the meal. They'll select their dishes in Telegram later.
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
            <Input
              label="Person's Name"
              value={personName}
              onChangeText={setPersonName}
              placeholder="e.g. Sarah"
              icon="✏️"
              className="mb-6 sm:mb-8"
            />
            <div className="flex justify-end">
              <Button
                title="+ Add Person"
                onPress={handleAddPerson}
              />
            </div>
          </div>

          {/* List Header */}
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold" style={{ color: Colors.text }}>
              People Added
            </h2>
            <div
              className="rounded-lg px-3 py-1 min-w-[40px] text-center"
              style={{ backgroundColor: Colors.primary }}
            >
              <span className="text-base font-bold" style={{ color: Colors.white }}>
                {people.length}
              </span>
            </div>
          </div>

          {people.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-6">
              <p className="text-base text-center" style={{ color: Colors.textSecondary }}>
                No people added yet
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-8 flex-1 overflow-y-auto min-h-0">
              {people.map((item) => (
                <div
                  key={item}
                  className="flex justify-between items-center rounded-xl p-6 border"
                  style={{
                    backgroundColor: Colors.card,
                    borderColor: Colors.border,
                  }}
                >
                  <span className="text-lg font-semibold" style={{ color: Colors.text }}>
                    {item}
                  </span>
                  <button
                    onClick={() => handleRemovePerson(item)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                    style={{ backgroundColor: Colors.error }}
                  >
                    <span className="text-lg font-bold" style={{ color: Colors.white }}>
                      ✕
                    </span>
                  </button>
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
              disabled={people.length === 0}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
