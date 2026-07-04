'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function BillCounter() {
  const [totalBills, setTotalBills] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'stats', 'counters'),
      (snapshot) => {
        setTotalBills(snapshot.exists() ? snapshot.data().totalBills || 0 : 0);
      },
      (error) => {
        console.error('Error fetching counter:', error);
        setTotalBills(0);
      }
    );

    return () => unsubscribe();
  }, []);

  const receiptNo =
    totalBills === null ? '····' : String(totalBills).padStart(4, '0');

  return (
    <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
      Receipt no.{' '}
      <span className={`text-ink tabnum ${totalBills === null ? 'animate-pulse' : ''}`}>
        {receiptNo}
      </span>{' '}
      — bills split and counting
    </p>
  );
}
