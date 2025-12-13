'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBill } from '@/context/BillContext';
import { SplashScreen } from '@/components/SplashScreen';
import { formatCurrency } from '@/utils/billCalculator';
import { Colors } from '@/constants/colors';

export default function HomeScreen() {
  const { bills } = useBill();
  const [showSplash, setShowSplash] = useState(true);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (!showSplash) {
      setTimeout(() => setOpacity(1), 100);
    }
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const sortedBills = [...bills].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: Colors.background }}
    >
      <div
        className="transition-opacity duration-500"
        style={{ opacity }}
      >
        {/* Modern Header */}
        <div className="flex justify-between items-start px-6 pt-5 pb-6">
          <div>
            <h2 className="text-base font-medium mb-1" style={{ color: Colors.textLight }}>
              Hello 👋
            </h2>
            <h1 className="text-[32px] font-extrabold tracking-tight" style={{ color: Colors.text }}>
              MakanSplit
            </h1>
          </div>
          <div
            className="px-5 py-3 rounded-2xl text-center border"
            style={{
              backgroundColor: Colors.card,
              borderColor: Colors.border,
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: Colors.textLight }}>
              Total Bills
            </p>
            <p className="text-2xl font-extrabold" style={{ color: Colors.primary }}>
              {bills.length}
            </p>
          </div>
        </div>

        {/* Bills list or empty state */}
        <div className="px-5 pb-5">
          {bills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-10">
              <div
                className="w-[120px] h-[120px] rounded-full flex items-center justify-center mb-6 border-2"
                style={{
                  backgroundColor: Colors.card,
                  borderColor: Colors.border,
                }}
              >
                <span className="text-6xl">🧾</span>
              </div>
              <h2 className="text-[28px] font-extrabold mb-3 tracking-tight" style={{ color: Colors.text }}>
                No bills yet
              </h2>
              <p className="text-base text-center leading-6 mb-8" style={{ color: Colors.textLight }}>
                Create your first bill to start splitting with friends
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedBills.map((item) => {
                const paidCount = item.people.filter((p) => p.hasPaid).length;
                const totalPeople = item.people.length;
                const allPaid = paidCount === totalPeople;

                return (
                  <div key={item.id} className="mb-4">
                    <Link
                      href={`/bill/${item.id}`}
                      className="block relative rounded-3xl p-5 border transition-all hover:opacity-90"
                      style={{
                        backgroundColor: Colors.card,
                        borderColor: Colors.border,
                        boxShadow: `0 8px 16px ${Colors.primary}26`,
                      }}
                    >
                      {allPaid && (
                        <div
                          className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                          style={{
                            backgroundColor: Colors.success,
                            boxShadow: `0 0 8px ${Colors.success}CC`,
                          }}
                        />
                      )}

                      <div className="flex items-center">
                        <div
                          className="w-[70px] h-[70px] rounded-[20px] flex flex-col items-center justify-center mr-4"
                          style={{
                            backgroundColor: allPaid ? Colors.success : Colors.primary,
                            boxShadow: `0 4px 8px ${allPaid ? Colors.success : Colors.primary}4D`,
                          }}
                        >
                          <span className="text-[28px] font-extrabold tracking-tight" style={{ color: Colors.white }}>
                            {new Date(item.date).getDate()}
                          </span>
                          <span className="text-[11px] font-bold opacity-90" style={{ color: Colors.white }}>
                            {new Date(item.date).toLocaleDateString('en-SG', { month: 'short' }).toUpperCase()}
                          </span>
                        </div>

                        <div className="flex-1">
                          <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: Colors.textMuted }}>
                            Paid by
                          </p>
                          <p className="text-lg font-bold mb-2" style={{ color: Colors.text }}>
                            {item.paidBy}
                          </p>
                          <div className="flex items-center">
                            <span className="text-sm mr-1.5">👥</span>
                            <span className="text-sm font-semibold" style={{ color: Colors.textSecondary }}>
                              {totalPeople} {totalPeople === 1 ? 'person' : 'people'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-[26px] font-extrabold mb-2 tracking-tight" style={{ color: Colors.primary }}>
                            {formatCurrency(item.total)}
                          </p>
                          {allPaid ? (
                            <div
                              className="px-3 py-1.5 rounded-xl"
                              style={{ backgroundColor: Colors.success }}
                            >
                              <span className="text-[11px] font-extrabold tracking-wide" style={{ color: Colors.black }}>
                                ✅ PAID
                              </span>
                            </div>
                          ) : (
                            <div
                              className="px-3 py-1.5 rounded-xl"
                              style={{ backgroundColor: Colors.warning }}
                            >
                              <span className="text-[13px] font-extrabold" style={{ color: Colors.black }}>
                                {paidCount}/{totalPeople}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div
          className="fixed bottom-0 left-0 right-0 flex justify-around items-center px-5 pt-3 pb-6 border-t"
          style={{
            backgroundColor: Colors.card,
            borderColor: Colors.border,
            boxShadow: `0 -4px 12px ${Colors.primary}1A`,
          }}
        >
          <Link href="/" className="flex flex-col items-center justify-center flex-1">
            <span className="text-2xl mb-1 opacity-100 scale-110">🏠</span>
            <span className="text-xs font-bold" style={{ color: Colors.primary }}>
              Home
            </span>
          </Link>

          <Link href="/create-bill" className="flex flex-col items-center justify-center flex-1">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
              style={{
                backgroundColor: Colors.primary,
                boxShadow: `0 4px 8px ${Colors.primary}66`,
              }}
            >
              <span className="text-[32px] font-light leading-9" style={{ color: Colors.white }}>
                +
              </span>
            </div>
            <span className="text-xs font-bold" style={{ color: Colors.primary }}>
              New Bill
            </span>
          </Link>

          <button className="flex flex-col items-center justify-center flex-1 opacity-30" disabled>
            <span className="text-2xl mb-1">⚙️</span>
            <span className="text-xs font-semibold" style={{ color: Colors.textMuted }}>
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
