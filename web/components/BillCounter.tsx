'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function BillCounter() {
  const [totalBills, setTotalBills] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to counter document for real-time updates
    const unsubscribe = onSnapshot(
      doc(db, 'stats', 'counters'),
      (doc) => {
        if (doc.exists()) {
          setTotalBills(doc.data().totalBills || 0);
        } else {
          setTotalBills(0);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching counter:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">
          <div className="h-12 w-32 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="inline-block">
        <div className="text-5xl font-bold text-green-600 mb-2">
          {totalBills?.toLocaleString() || '0'}
        </div>
        <div className="text-gray-600 text-sm uppercase tracking-wide">
          Bills Split & Counting
        </div>
      </div>
    </div>
  );
}
