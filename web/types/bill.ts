export interface Person {
  id: string;
  name: string;
  telegramUsername?: string; // Telegram username (e.g., "@alice")
  telegramUserId?: number; // Telegram user ID
  amountOwed: number;
  hasPaid: boolean;
  paidBy?: string; // Who marked this as paid
  paidAt?: string; // When marked as paid
}

export interface Dish {
  id: string;
  name: string;
  price: number;
  sharedBy: string[]; // Array of person IDs who selected this dish
}

// Participant who selected dishes via Telegram
export interface Participant {
  telegramUserId: number;
  telegramUsername: string; // "@username" or "First Last"
  selectedDishIds: string[]; // IDs of dishes they selected
  amountOwed?: number; // Calculated after lock
  hasPaid: boolean;
  paidAt?: string;
}

export type BillPhase = 'selection' | 'payment';

export interface Bill {
  id: string;
  restaurantName?: string; // Optional
  date: Date;
  gstPercentage: number;
  serviceChargePercentage: number;
  dishes: Dish[];
  people: Person[]; // Legacy - for backward compatibility
  participants: Participant[]; // New - people who joined via Telegram
  subtotal: number;
  gstAmount: number;
  serviceChargeAmount: number;
  total: number;
  paidBy: string; // Person who paid the bill initially
  creatorTelegramId?: number; // Telegram ID of bill creator (only they can lock)
  phase: BillPhase; // 'selection' or 'payment'
  lockedAt?: string; // When bill was locked for calculation
  createdAt: Date;
  updatedAt: Date;
  // Telegram integration
  telegramChatId?: string; // Chat ID where message was sent
  telegramMessageId?: number; // Message ID for updating
}

export interface BillCalculation {
  subtotal: number;
  serviceCharge: number;
  gst: number;
  total: number;
  perPersonBreakdown: {
    personId: string;
    personName: string;
    dishesEaten: {
      dishName: string;
      dishPrice: number;
      shareAmount: number;
    }[];
    subtotal: number;
    serviceCharge: number;
    gst: number;
    total: number;
  }[];
}
