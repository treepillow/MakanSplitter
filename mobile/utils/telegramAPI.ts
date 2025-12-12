import { Linking } from 'react-native';
import { getBotApiUrl, isTelegramConfigured as checkTelegramConfig, TELEGRAM_CONFIG } from '../config/telegram';
import { Bill } from '../types/bill';

// Re-export for convenience
export const isTelegramConfigured = checkTelegramConfig;

// Format bill message for Telegram
export function formatBillMessage(bill: Bill): string {
  const date = new Date(bill.date).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const paidPeople = bill.people.filter(p => p.hasPaid);
  const unpaidPeople = bill.people.filter(p => !p.hasPaid);

  let message = `🧾 *Bill Split Summary*\n\n`;
  message += `📅 Date: ${date}\n`;
  message += `👤 Paid by: ${bill.paidBy}\n`;
  message += `💰 Total: $${bill.total.toFixed(2)}\n`;
  message += `\n━━━━━━━━━━━━━━━━━━\n\n`;

  // Paid section
  if (paidPeople.length > 0) {
    message += `✅ *PAID (${paidPeople.length})*\n`;
    paidPeople.forEach(person => {
      message += `   ${person.name} - $${person.amountOwed.toFixed(2)} ✓\n`;
    });
    message += `\n`;
  }

  // Unpaid section
  if (unpaidPeople.length > 0) {
    message += `⏳ *NOT YET PAID (${unpaidPeople.length})*\n`;
    unpaidPeople.forEach(person => {
      message += `   ${person.name} - $${person.amountOwed.toFixed(2)}\n`;
    });
  }

  message += `\n━━━━━━━━━━━━━━━━━━\n`;
  message += `\n_Tap the button below when you've paid!_`;

  return message;
}

// Create inline keyboard with "Paid" buttons for each unpaid person
export function createInlineKeyboard(bill: Bill) {
  const unpaidPeople = bill.people.filter(p => !p.hasPaid);

  const keyboard = unpaidPeople.map(person => ([
    {
      text: `✅ ${person.name} - $${person.amountOwed.toFixed(2)}`,
      callback_data: `paid_${bill.id}_${person.id}`,
    },
  ]));

  return {
    inline_keyboard: keyboard,
  };
}

// Send bill to Telegram
export async function sendBillToTelegram(
  chatId: string,
  bill: Bill
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  if (!checkTelegramConfig()) {
    return {
      success: false,
      error: 'Telegram bot not configured. Please add your bot token in config/telegram.ts',
    };
  }

  try {
    const url = `${getBotApiUrl()}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatBillMessage(bill),
        parse_mode: 'Markdown',
        reply_markup: createInlineKeyboard(bill),
      }),
    });

    const data = await response.json();

    if (data.ok) {
      return {
        success: true,
        messageId: data.result.message_id,
      };
    } else {
      return {
        success: false,
        error: data.description || 'Failed to send message',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Generate a simple text message (without markdown) for sharing
export function formatBillMessagePlainText(bill: Bill): string {
  const date = new Date(bill.date).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const paidPeople = bill.people.filter(p => p.hasPaid);
  const unpaidPeople = bill.people.filter(p => !p.hasPaid);

  let message = `🧾 Bill Split Summary\n\n`;
  message += `📅 Date: ${date}\n`;
  message += `👤 Paid by: ${bill.paidBy}\n`;
  message += `💰 Total: $${bill.total.toFixed(2)}\n`;
  message += `\n━━━━━━━━━━━━━━━━━━\n\n`;

  // Paid section
  if (paidPeople.length > 0) {
    message += `✅ PAID (${paidPeople.length})\n`;
    paidPeople.forEach(person => {
      message += `   ${person.name} - $${person.amountOwed.toFixed(2)} ✓\n`;
    });
    message += `\n`;
  }

  // Unpaid section
  if (unpaidPeople.length > 0) {
    message += `⏳ NOT YET PAID (${unpaidPeople.length})\n`;
    unpaidPeople.forEach(person => {
      message += `   ${person.name} - $${person.amountOwed.toFixed(2)}\n`;
    });
  }

  message += `\n━━━━━━━━━━━━━━━━━━\n`;
  message += `\nTap "Paid" when you transfer the money!`;

  return message;
}

// Open Telegram share dialog (user-friendly - no Chat ID needed!)
export async function shareBillToTelegram(bill: Bill): Promise<{ success: boolean; error?: string }> {
  try {
    const message = formatBillMessagePlainText(bill);
    const encodedMessage = encodeURIComponent(message);

    // Get bot username from token (first part before the colon)
    const botUsername = 'makansplit_bot'; // You should set this in config

    // Create a Telegram share URL that opens the app
    // Users can choose which chat/group to send to
    const shareUrl = `https://t.me/share/url?url=${encodedMessage}`;

    const canOpen = await Linking.canOpenURL(shareUrl);

    if (canOpen) {
      await Linking.openURL(shareUrl);
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Could not open Telegram. Make sure Telegram is installed.',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Share bill via inline mode (opens Telegram with @bot query pre-filled)
// User can then pick any chat to share to, and buttons will work!
export async function shareBillViaInlineMode(bill: Bill): Promise<{ success: boolean; error?: string }> {
  if (!checkTelegramConfig()) {
    return {
      success: false,
      error: 'Bot not configured. Please set BOT_USERNAME in config/telegram.ts',
    };
  }

  try {
    // Use inline mode - opens Telegram with the bot query pre-filled
    // User types @bot_username in any chat, and the bill appears as a result
    // When they tap it, it posts to that chat with interactive buttons
    const botUrl = `https://t.me/${TELEGRAM_CONFIG.BOT_USERNAME}?startinline=${encodeURIComponent(bill.id)}`;

    const canOpen = await Linking.canOpenURL(botUrl);

    if (canOpen) {
      await Linking.openURL(botUrl);
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Could not open Telegram. Make sure Telegram is installed.',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Update Telegram message when payment status changes
export async function updateTelegramMessage(
  chatId: string,
  messageId: number,
  bill: Bill
): Promise<{ success: boolean; error?: string }> {
  if (!checkTelegramConfig()) {
    return {
      success: false,
      error: 'Telegram bot not configured',
    };
  }

  try {
    const url = `${getBotApiUrl()}/editMessageText`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: formatBillMessage(bill),
        parse_mode: 'Markdown',
        reply_markup: createInlineKeyboard(bill),
      }),
    });

    const data = await response.json();

    if (data.ok) {
      return { success: true };
    } else {
      return {
        success: false,
        error: data.description || 'Failed to update message',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
