'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dish } from '@/types/bill';

export default function CreateBill() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [gst, setGst] = useState('9');
  const [serviceCharge, setServiceCharge] = useState('10');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');

  const addDish = () => {
    if (!newDishName || !newDishPrice) return;

    const dish: Dish = {
      id: `dish_${Date.now()}_${Math.random()}`,
      name: newDishName,
      price: parseFloat(newDishPrice),
      sharedBy: [],
    };

    setDishes([...dishes, dish]);
    setNewDishName('');
    setNewDishPrice('');
  };

  const removeDish = (dishId: string) => {
    setDishes(dishes.filter(d => d.id !== dishId));
  };

  const handleNext = () => {
    if (!restaurantName || !paidBy || dishes.length === 0) {
      alert('Please fill in all fields and add at least one dish');
      return;
    }

    // Store in session storage and navigate to summary
    const billData = {
      restaurantName,
      paidBy,
      gstPercentage: parseFloat(gst),
      serviceChargePercentage: parseFloat(serviceCharge),
      dishes,
    };

    sessionStorage.setItem('newBill', JSON.stringify(billData));
    router.push('/summary');
  };

  const subtotal = dishes.reduce((sum, dish) => sum + dish.price, 0);
  const serviceChargeAmount = subtotal * (parseFloat(serviceCharge) / 100);
  const gstAmount = (subtotal + serviceChargeAmount) * (parseFloat(gst) / 100);
  const total = subtotal + serviceChargeAmount + gstAmount;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-gray-400 hover:text-white">
            ← Back
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-6">Create New Bill</h1>

        {/* Bill Info */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Bill Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Restaurant Name</label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded px-4 py-2 text-white focus:border-[#10b981] focus:outline-none"
                placeholder="e.g., Hawker Center"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Paid By</label>
              <input
                type="text"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded px-4 py-2 text-white focus:border-[#10b981] focus:outline-none"
                placeholder="Your name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-2">GST (%)</label>
                <input
                  type="number"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded px-4 py-2 text-white focus:border-[#10b981] focus:outline-none"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Service Charge (%)</label>
                <input
                  type="number"
                  value={serviceCharge}
                  onChange={(e) => setServiceCharge(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded px-4 py-2 text-white focus:border-[#10b981] focus:outline-none"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Add Dishes */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Dishes</h2>

          <div className="space-y-4 mb-4">
            {dishes.map((dish) => (
              <div key={dish.id} className="flex justify-between items-center bg-[#0a0a0a] border border-[#2a2a2a] rounded px-4 py-3">
                <div>
                  <div className="text-white font-medium">{dish.name}</div>
                  <div className="text-gray-400 text-sm">${dish.price.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => removeDish(dish.id)}
                  className="text-red-500 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newDishName}
              onChange={(e) => setNewDishName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addDish()}
              className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded px-4 py-2 text-white focus:border-[#10b981] focus:outline-none"
              placeholder="Dish name"
            />
            <input
              type="number"
              value={newDishPrice}
              onChange={(e) => setNewDishPrice(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addDish()}
              className="w-32 bg-[#0a0a0a] border border-[#2a2a2a] rounded px-4 py-2 text-white focus:border-[#10b981] focus:outline-none"
              placeholder="Price"
              step="0.01"
            />
            <button
              onClick={addDish}
              className="bg-[#10b981] text-white px-6 py-2 rounded hover:opacity-90 transition"
            >
              Add
            </button>
          </div>

          <div className="mt-4">
            <Link
              href="/upload"
              className="block w-full bg-[#2a2a2a] text-white text-center py-3 rounded hover:bg-[#3a3a3a] transition"
            >
              📷 Or Upload Receipt Image
            </Link>
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <div className="space-y-2 text-gray-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-white">${subtotal.toFixed(2)}</span>
            </div>
            {parseFloat(serviceCharge) > 0 && (
              <div className="flex justify-between">
                <span>Service Charge ({serviceCharge}%):</span>
                <span className="text-white">${serviceChargeAmount.toFixed(2)}</span>
              </div>
            )}
            {parseFloat(gst) > 0 && (
              <div className="flex justify-between">
                <span>GST ({gst}%):</span>
                <span className="text-white">${gstAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[#2a2a2a]">
              <span className="text-xl font-bold text-white">Total:</span>
              <span className="text-xl font-bold text-[#10b981]">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-[#10b981] text-white py-4 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Continue to Summary
        </button>
      </div>
    </div>
  );
}
