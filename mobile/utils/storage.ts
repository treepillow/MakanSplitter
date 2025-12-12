import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bill } from '../types/bill';

const BILLS_STORAGE_KEY = '@makansplit_bills';

export async function saveBill(bill: Bill): Promise<void> {
  try {
    const existingBills = await getAllBills();
    const updatedBills = [...existingBills, bill];
    await AsyncStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(updatedBills));
  } catch (error) {
    console.error('Error saving bill:', error);
    throw error;
  }
}

export async function updateBill(updatedBill: Bill): Promise<void> {
  try {
    const existingBills = await getAllBills();
    const updatedBills = existingBills.map((bill) =>
      bill.id === updatedBill.id ? updatedBill : bill
    );
    await AsyncStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(updatedBills));
  } catch (error) {
    console.error('Error updating bill:', error);
    throw error;
  }
}

export async function getAllBills(): Promise<Bill[]> {
  try {
    const billsJson = await AsyncStorage.getItem(BILLS_STORAGE_KEY);
    if (!billsJson) {
      return [];
    }
    return JSON.parse(billsJson);
  } catch (error) {
    console.error('Error getting bills:', error);
    return [];
  }
}

export async function getBillById(id: string): Promise<Bill | null> {
  try {
    const bills = await getAllBills();
    return bills.find((bill) => bill.id === id) || null;
  } catch (error) {
    console.error('Error getting bill by id:', error);
    return null;
  }
}

export async function deleteBill(id: string): Promise<void> {
  try {
    const existingBills = await getAllBills();
    const updatedBills = existingBills.filter((bill) => bill.id !== id);
    await AsyncStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(updatedBills));
  } catch (error) {
    console.error('Error deleting bill:', error);
    throw error;
  }
}
