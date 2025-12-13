'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useBill } from '@/context/BillContext';
import { Colors } from '@/constants/colors';

export default function AddPeopleScreen() {
  const router = useRouter();
  const { currentBill, setCurrentBill } = useBill();
  const [personName, setPersonName] = useState('');
  const [people, setPeople] = useState<string[]>([]);
  const [opacity, setOpacity] = useState(0);

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
      alert('Please enter a person\'s name');
      return;
    }

    if (people.includes(trimmedName)) {
      alert('This person has already been added');
      return;
    }

    setPeople([...people, trimmedName]);
    setPersonName('');
  };

  const handleRemovePerson = (name: string) => {
    setPeople(people.filter((p) => p !== name));
  };

  const handleContinue = () => {
    if (people.length === 0) {
      alert('Please add at least one person');
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
          <div className="text-5xl mb-3">👥</div>
          <h1 className="text-[32px] font-extrabold tracking-tight mb-4" style={{ color: Colors.text }}>
            Add People
          </h1>
          <div className="flex justify-center gap-2 mb-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: Colors.border }}
            />
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
          </div>
          <p className="text-sm font-semibold" style={{ color: Colors.textLight }}>
            Step 2 of 4
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 pb-20">
          {/* Input Section */}
          <div
            className="rounded-3xl p-5 mb-6 border"
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
              className="mb-4"
            />
            <Button
              title="Add Person"
              onPress={handleAddPerson}
              icon="+"
            />
          </div>

          {/* List */}
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold" style={{ color: Colors.text }}>
              People Added
            </h2>
            <div
              className="rounded-xl px-3 py-1 min-w-[32px] text-center"
              style={{ backgroundColor: Colors.primary }}
            >
              <span className="text-sm font-extrabold" style={{ color: Colors.white }}>
                {people.length}
              </span>
            </div>
          </div>

          {people.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-10">
              <div
                className="w-[100px] h-[100px] rounded-full flex items-center justify-center mb-5 border-2"
                style={{
                  backgroundColor: Colors.card,
                  borderColor: Colors.border,
                }}
              >
                <span className="text-5xl">👥</span>
              </div>
              <p className="text-base text-center leading-6" style={{ color: Colors.textLight }}>
                No people added yet{'\n'}Add everyone who shared the meal
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {people.map((item) => (
                <div
                  key={item}
                  className="flex justify-between items-center rounded-2xl p-4 border"
                  style={{
                    backgroundColor: Colors.card,
                    borderColor: Colors.border,
                    boxShadow: `0 4px 8px ${Colors.primary}1A`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">👤</span>
                    <span className="text-[17px] font-semibold" style={{ color: Colors.text }}>
                      {item}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemovePerson(item)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: Colors.error }}
                  >
                    <span className="text-lg font-bold leading-5" style={{ color: Colors.white }}>
                      ✕
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="fixed bottom-0 left-0 right-0 flex gap-3 p-5 border-t"
          style={{
            backgroundColor: Colors.background,
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
            disabled={people.length === 0}
            icon="→"
          />
        </div>
      </div>
    </div>
  );
}
