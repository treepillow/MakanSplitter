import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bill, Dish, Person } from '../types/bill';
import { getAllBills, saveBill, updateBill, deleteBill } from '../utils/storage';

interface BillContextType {
  bills: Bill[];
  currentBill: Partial<Bill> | null;
  setCurrentBill: (bill: Partial<Bill> | null) => void;
  saveBillToHistory: (bill: Bill) => Promise<void>;
  updateBillInHistory: (bill: Bill) => Promise<void>;
  deleteBillFromHistory: (id: string) => Promise<void>;
  refreshBills: () => Promise<void>;
}

const BillContext = createContext<BillContextType | undefined>(undefined);

export function BillProvider({ children }: { children: React.ReactNode }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [currentBill, setCurrentBill] = useState<Partial<Bill> | null>(null);

  useEffect(() => {
    refreshBills();
  }, []);

  const refreshBills = async () => {
    const loadedBills = await getAllBills();
    setBills(loadedBills);
  };

  const saveBillToHistory = async (bill: Bill) => {
    await saveBill(bill);
    await refreshBills();
  };

  const updateBillInHistory = async (bill: Bill) => {
    await updateBill(bill);
    await refreshBills();
  };

  const deleteBillFromHistory = async (id: string) => {
    await deleteBill(id);
    await refreshBills();
  };

  return (
    <BillContext.Provider
      value={{
        bills,
        currentBill,
        setCurrentBill,
        saveBillToHistory,
        updateBillInHistory,
        deleteBillFromHistory,
        refreshBills,
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
