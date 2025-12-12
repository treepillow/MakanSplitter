import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Bill } from '../types/bill';

// Save bill to Firebase
export async function saveBillToFirebase(bill: Bill): Promise<void> {
  try {
    // Helper to convert date to ISO string (handles both Date objects and strings)
    const toISOString = (date: Date | string): string => {
      if (typeof date === 'string') return date;
      return date.toISOString();
    };

    // Convert bill to plain object
    const billData = {
      id: bill.id,
      restaurantName: bill.restaurantName || '',
      date: toISOString(bill.date),
      gstPercentage: bill.gstPercentage || 0,
      serviceChargePercentage: bill.serviceChargePercentage || 0,
      dishes: bill.dishes || [],
      people: bill.people || [],
      participants: bill.participants || [],
      subtotal: bill.subtotal || 0,
      gstAmount: bill.gstAmount || 0,
      serviceChargeAmount: bill.serviceChargeAmount || 0,
      total: bill.total || 0,
      paidBy: bill.paidBy || '',
      phase: bill.phase || 'selection',
      creatorTelegramId: bill.creatorTelegramId || null,
      lockedAt: bill.lockedAt || null,
      createdAt: toISOString(bill.createdAt),
      updatedAt: toISOString(bill.updatedAt),
      telegramChatId: bill.telegramChatId || null,
      telegramMessageId: bill.telegramMessageId || null,
    };

    await setDoc(doc(db, 'bills', bill.id), billData);
  } catch (error) {
    console.error('Error saving bill to Firebase:', error);
    throw error;
  }
}

// Get bill from Firebase
export async function getBillFromFirebase(billId: string): Promise<Bill | null> {
  try {
    const docRef = doc(db, 'bills', billId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        date: new Date(data.date),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      } as Bill;
    }
    return null;
  } catch (error) {
    console.error('Error getting bill from Firebase:', error);
    return null;
  }
}

// Get all bills from Firebase
export async function getAllBillsFromFirebase(): Promise<Bill[]> {
  try {
    const q = query(collection(db, 'bills'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const bills: Bill[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bills.push({
        ...data,
        date: new Date(data.date),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      } as Bill);
    });

    return bills;
  } catch (error) {
    console.error('Error getting all bills:', error);
    return [];
  }
}

// Delete bill from Firebase
export async function deleteBillFromFirebase(billId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'bills', billId));
  } catch (error) {
    console.error('Error deleting bill:', error);
    throw error;
  }
}
