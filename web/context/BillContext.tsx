'use client';

import React, { createContext, useContext, useState } from 'react';
import { Bill } from '../types/bill';

interface BillContextType {
  currentBill: Partial<Bill> | null;
  setCurrentBill: (bill: Partial<Bill> | null) => void;
  clearCurrentBill: () => void;
}

const BillContext = createContext<BillContextType | undefined>(undefined);

export function BillProvider({ children }: { children: React.ReactNode }) {
  const [currentBill, setCurrentBill] = useState<Partial<Bill> | null>(null);

  const clearCurrentBill = () => {
    setCurrentBill(null);
  };

  return (
    <BillContext.Provider
      value={{
        currentBill,
        setCurrentBill,
        clearCurrentBill,
      }}
    >
      {children}
    </BillContext.Provider>
  );
}

export function useBill() {
  const context = useContext(BillContext);
  if (context === undefined) {
    throw new Error('useBill must be used within a BillProvider');
  }
  return context;
}
