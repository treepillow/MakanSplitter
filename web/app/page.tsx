'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllBillsFromFirebase, deleteBillFromFirebase } from '@/lib/billStorage';
import { Bill } from '@/types/bill';

export default function Home() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    setLoading(true);
    const loadedBills = await getAllBillsFromFirebase();
    setBills(loadedBills);
    setLoading(false);
  };

  const handleDelete = async (billId: string) => {
    if (confirm('Delete this bill?')) {
      await deleteBillFromFirebase(billId);
      await loadBills();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🍽️ MakanSplit
          </h1>
          <p className="text-gray-400">
            Split bills easily with friends via Telegram
          </p>
        </div>

        {/* Create New Bill Button */}
        <Link
          href="/create"
          className="block w-full bg-[#10b981] text-white text-center py-4 px-6 rounded-lg font-semibold hover:opacity-90 transition mb-8"
        >
          + Create New Bill
        </Link>

        {/* Bills List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Recent Bills
          </h2>

          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : bills.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No bills yet. Create your first bill!
            </div>
          ) : (
            bills.map((bill) => (
              <div
                key={bill.id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#10b981] transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {bill.restaurantName || 'Unnamed Bill'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(bill.date).toLocaleDateString('en-SG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#10b981]">
                      ${bill.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {bill.dishes.length} dish{bill.dishes.length !== 1 ? 'es' : ''}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/bill/${bill.id}`}
                    className="flex-1 bg-[#10b981] text-white text-center py-2 px-4 rounded hover:opacity-90 transition"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(bill.id)}
                    className="px-4 py-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
