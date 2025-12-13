import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Bill } from '../types/bill';

/**
 * Save bill to Firebase via API route (with rate limiting and validation)
 * Retries up to 3 times with exponential backoff
 */
export async function saveBillToFirebase(bill: Bill): Promise<string> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  // Helper to convert date to ISO string
  const toISOString = (date: Date | string): string => {
    if (typeof date === 'string') return date;
    return date.toISOString();
  };

  // Prepare bill data for API
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

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/bills/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Don't retry on client errors (400s) - these are validation/rate limit errors
        if (response.status >= 400 && response.status < 500) {
          throw new Error(errorData.message || 'Failed to save bill');
        }

        // Retry on server errors (500s)
        throw new Error(errorData.message || 'Server error');
      }

      const data = await response.json();
      console.log('Bill saved successfully:', data.id);
      return data.id;

    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);

      // Don't retry on these errors
      if (error.message.includes('Rate limit') ||
          error.message.includes('Validation') ||
          error.message.includes('Permission denied') ||
          error.message.includes('exceed')) {
        throw error;
      }

      // Retry with exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  if (lastError) {
    if (lastError.message.includes('fetch') || lastError.message.includes('Network')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw new Error(`Failed to save bill after ${maxRetries} attempts. Please try again.`);
  }

  throw new Error('Failed to save bill');
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

// Update bill in Firebase
export async function updateBillInFirebase(bill: Bill): Promise<void> {
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
      updatedAt: toISOString(new Date()), // Update the timestamp
      telegramChatId: bill.telegramChatId || null,
      telegramMessageId: bill.telegramMessageId || null,
    };

    await setDoc(doc(db, 'bills', bill.id), billData);
  } catch (error) {
    console.error('Error updating bill in Firebase:', error);
    throw error;
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
