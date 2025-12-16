'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Colors } from '@/constants/colors';
import { TrendingUp } from 'lucide-react';

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
      <div className="text-center py-4">
        <div className="animate-pulse inline-flex flex-col items-center gap-2">
          <div className="h-10 w-24 rounded" style={{ backgroundColor: Colors.gray200 }}></div>
          <div className="h-4 w-32 rounded" style={{ backgroundColor: Colors.gray100 }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <div className="inline-flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: Colors.primaryLight }}
          >
            <TrendingUp size={20} style={{ color: Colors.primary }} />
          </div>
          <div className="text-4xl font-bold" style={{ color: Colors.text }}>
            {totalBills?.toLocaleString() || '0'}
          </div>
        </div>
        <div className="text-sm font-medium" style={{ color: Colors.textSecondary }}>
          Bills split and counting
        </div>
      </div>
    </div>
  );
}
