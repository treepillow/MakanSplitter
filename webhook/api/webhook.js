// Telegram webhook handler for MakanSplit
// Handles inline queries and button callbacks for dish selection and payment

const admin = require('firebase-admin');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN environment variable is required');
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

const db = admin.firestore();

// Rate limiting for button clicks
const actionLimits = new Map(); // userId -> { action -> lastTime }

function rateLimit(userId, action, cooldownMs = 1000) {
  const now = Date.now();
  const key = `${userId}_${action}`;
  const lastTime = actionLimits.get(key);

  if (lastTime && now - lastTime < cooldownMs) {
    return false; // Rate limited
  }

  actionLimits.set(key, now);

  // Clean up old entries (older than 1 hour)
  if (actionLimits.size > 10000) {
    for (const [k, time] of actionLimits.entries()) {
      if (now - time > 3600000) {
        actionLimits.delete(k);
      }
    }
  }

  return true;
}

// Sanitize text for Telegram MarkdownV2
function sanitizeForTelegram(text) {
  if (typeof text !== 'string') return String(text); // Handle numbers automatically
  // Escape MarkdownV2 special characters
  return text.replace(/([_*\[\]()~`>#+=|{}.!-])/g, '\\$1');
}

// Verify webhook request is from Telegram
function verifyTelegramRequest(req) {
  // Check secret token if configured (Primary Security)
  if (TELEGRAM_WEBHOOK_SECRET) {
    const headerToken = req.headers['x-telegram-bot-api-secret-token'];
    if (headerToken !== TELEGRAM_WEBHOOK_SECRET) {
      console.warn('Invalid secret token');
      return false;
    }
  }

  // Removed "Suspicious user agent" check to prevent false positives.
  // The Secret Token above is the strong security measure.

  return true;
}

// Main webhook handler
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify request is from Telegram
  if (!verifyTelegramRequest(req)) {
    console.error('Unauthorized webhook request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const update = req.body;
    console.log('Received update type:', update.inline_query ? 'inline_query' : update.callback_query ? 'callback_query' : 'unknown');

    // Check if Firebase is initialized
    if (!admin.apps.length) {
      console.error('Firebase not initialized');
      return res.status(500).json({ error: 'Service unavailable' });
    }

    // Handle inline queries (when user types @bot in chat)
    if (update.inline_query) {
      await handleInlineQuery(update.inline_query);
    }

    // Handle callback queries (when user clicks button)
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Don't expose stack traces to client
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle inline queries
async function handleInlineQuery(inlineQuery) {
  const query = inlineQuery.query.trim();
  const queryId = inlineQuery.id;

  if (!query) {
    await fetch(`${TELEGRAM_API}/answerInlineQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inline_query_id: queryId,
        results: [],
        cache_time: 0,
      }),
    });
    return;
  }

  try {
    console.log('Searching for bill:', query);

    // Get bill from Firestore
    const billDoc = await db.collection('bills').doc(query).get();

    console.log('Bill exists:', billDoc.exists);

    if (!billDoc.exists) {
      console.log('Bill not found, returning empty results');
      await fetch(`${TELEGRAM_API}/answerInlineQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inline_query_id: queryId,
          results: [],
          cache_time: 0,
        }),
      });
      return;
    }

    const bill = billDoc.data();
    console.log('Bill data:', JSON.stringify({
      id: bill.id,
      restaurantName: bill.restaurantName,
      total: bill.total,
      dishCount: bill.dishes?.length,
      hasSubtotal: !!bill.subtotal
    }));

    // Format bill message based on phase
    const message = formatBillMessage(bill);
    const keyboard = createInlineKeyboard(bill, inlineQuery.from.id);

    // Return inline result
    await fetch(`${TELEGRAM_API}/answerInlineQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inline_query_id: queryId,
        results: [
          {
            type: 'article',
            id: bill.id,
            title: `Bill: ${bill.restaurantName || 'Split Bill'}`,
            description: `Total: $${bill.total.toFixed(2)} - ${bill.dishes.length} dishes`,
            input_message_content: {
              message_text: message,
              parse_mode: 'MarkdownV2', // Fixed: MarkdownV2
            },
            reply_markup: keyboard,
          },
        ],
        cache_time: 0,
      }),
    });
  } catch (error) {
    console.error('Error handling inline query:', error);
  }
}

// Handle callback queries (button clicks)
async function handleCallbackQuery(callbackQuery) {
  const data = callbackQuery.data;
  const telegramUser = callbackQuery.from;
  const telegramUserId = telegramUser.id;
  const telegramUsername = telegramUser.username
    ? `@${telegramUser.username}`
    : (telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : ''));

  // Check if this is an inline message
  const isInlineMessage = !!callbackQuery.inline_message_id;
  const inlineMessageId = callbackQuery.inline_message_id;

  // Parse callback data
  const parts = data.split('_');
  const action = parts[0];

  console.log('Callback from user:', telegramUserId, 'action:', action);

  // Rate limit: 1 action per second per user
  if (!rateLimit(telegramUserId, action, 1000)) {
    await answerCallback(callbackQuery.id, '⏱️ Please wait before clicking again');
    return;
  }

  // Answer callback immediately to prevent loading state
  await answerCallback(callbackQuery.id, '⏳ Updating...');

  if (action === 'select') {
    // Format: select_billId_dishId
    await handleDishSelection(data, telegramUserId, telegramUsername, inlineMessageId, isInlineMessage, callbackQuery.id);
  } else if (action === 'lock') {
    // Format: lock_billId
    await handleLockBill(data, telegramUserId, inlineMessageId, isInlineMessage, callbackQuery.id);
  } else if (action === 'paid') {
    // Format: paid_billId_participantTelegramId
    await handleMarkPaid(data, telegramUserId, telegramUsername, inlineMessageId, isInlineMessage, callbackQuery.id);
  }
}

// Handle dish selection
async function handleDishSelection(data, telegramUserId, telegramUsername, inlineMessageId, isInlineMessage, callbackQueryId) {
  // Parse callback data
  const parts = data.split('_');

  // Find indices of 'bill' and 'dish' markers
  const billIndex = parts.indexOf('bill');
  const dishIndex = parts.findIndex((part, idx) => idx > billIndex && part === 'dish');

  if (billIndex === -1 || dishIndex === -1) {
    console.error('Invalid callback data:', data);
    return;
  }

  // Extract billId and dishId
  const billId = parts.slice(billIndex, dishIndex).join('_');
  const dishId = parts.slice(dishIndex).join('_');

  console.log('Dish selection:', { billId, dishId, userId: telegramUserId });

  try {
    const billRef = db.collection('bills').doc(billId);

    // Use transaction to prevent race conditions
    await db.runTransaction(async (transaction) => {
      const billDoc = await transaction.get(billRef);

      if (!billDoc.exists) {
        throw new Error('Bill not found');
      }

      const bill = billDoc.data();

      // Check if bill is locked
      if (bill.phase !== 'selection') {
        throw new Error('Bill is locked');
      }

      // Initialize participants if needed
      if (!bill.participants) {
        bill.participants = [];
      }

      // Find or create participant
      let participantIndex = bill.participants.findIndex(p => p.telegramUserId === telegramUserId);
      let participant;

      if (participantIndex === -1) {
        // Create new participant
        participant = {
          telegramUserId,
          telegramUsername,
          selectedDishIds: [],
          hasPaid: false,
        };
        bill.participants.push(participant);
        participantIndex = bill.participants.length - 1;
      } else {
        participant = bill.participants[participantIndex];
      }

      // Toggle dish selection
      const dishIdIndex = participant.selectedDishIds.indexOf(dishId);

      if (dishIdIndex === -1) {
        // Add dish
        participant.selectedDishIds.push(dishId);
        console.log(`${telegramUsername} selected ${dishId}`);
      } else {
        // Remove dish
        participant.selectedDishIds.splice(dishIdIndex, 1);
        console.log(`${telegramUsername} unselected ${dishId}`);
      }

      // Update participant in array
      bill.participants[participantIndex] = participant;

      // Set creator on first interaction if not set
      if (!bill.creatorTelegramId && bill.participants.length > 0) {
        bill.creatorTelegramId = telegramUserId;
      }

      // Update bill with transaction
      transaction.update(billRef, {
        participants: bill.participants,
        creatorTelegramId: bill.creatorTelegramId || null,
        updatedAt: new Date().toISOString(),
      });

      return bill; // Return for message update
    });

    // Fetch updated bill for message
    const updatedBillDoc = await billRef.get();
    const updatedBill = updatedBillDoc.data();

    // Update message
    await updateInlineMessage(updatedBill, inlineMessageId, isInlineMessage, telegramUserId);

  } catch (error) {
    console.error('Error handling dish selection:', error);
    if (error.message === 'Bill is locked') {
      // Callback already answered, no need to answer again
    }
  }
}

// Handle lock & calculate
async function handleLockBill(data, telegramUserId, inlineMessageId, isInlineMessage, callbackQueryId) {
  // Parse: lock_billId
  const parts = data.split('_');
  const billIndex = parts.indexOf('bill');

  if (billIndex === -1) {
    console.error('Invalid lock callback data:', data);
    return;
  }

  const billId = parts.slice(billIndex).join('_');

  console.log('Lock bill:', { billId, telegramUserId, rawData: data });

  try {
    const billRef = db.collection('bills').doc(billId);

    // Use transaction to prevent race conditions
    await db.runTransaction(async (transaction) => {
      const billDoc = await transaction.get(billRef);

      if (!billDoc.exists) {
        throw new Error('Bill not found');
      }

      const bill = billDoc.data();

      // Check if user is creator
      if (bill.creatorTelegramId && bill.creatorTelegramId !== telegramUserId) {
        throw new Error('Only the bill creator can lock and calculate');
      }

      if (bill.phase !== 'selection') {
        throw new Error('Bill is already locked');
      }

      // Validate at least one participant selected dishes
      if (!bill.participants || bill.participants.length === 0) {
        throw new Error('No participants have selected dishes yet');
      }

      const hasSelections = bill.participants.some(p => p.selectedDishIds && p.selectedDishIds.length > 0);
      if (!hasSelections) {
        throw new Error('At least one person must select a dish before locking');
      }

      // Calculate amounts for each participant
      calculateAmounts(bill);

      // Update bill to payment phase
      transaction.update(billRef, {
        phase: 'payment',
        lockedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        participants: bill.participants,
      });

      return bill;
    });

    console.log('Bill locked and amounts calculated');

    // Fetch updated bill for message
    const updatedBillDoc = await billRef.get();
    const updatedBill = updatedBillDoc.data();

    // Update message
    await updateInlineMessage(updatedBill, inlineMessageId, isInlineMessage, telegramUserId);

  } catch (error) {
    console.error('Error locking bill:', error);
    // Provide user feedback for common errors
    if (error.message.includes('creator')) {
      await answerCallback(callbackQueryId, '🔒 Only the bill creator can lock');
    } else if (error.message.includes('already locked')) {
      await answerCallback(callbackQueryId, '✅ Bill is already locked');
    } else if (error.message.includes('select')) {
      await answerCallback(callbackQueryId, '⚠️ At least one person must select dishes first');
    }
  }
}

// Handle mark as paid
async function handleMarkPaid(data, telegramUserId, telegramUsername, inlineMessageId, isInlineMessage, callbackQueryId) {
  // Parse: paid_billId_participantTelegramId
  const parts = data.split('_');
  const billIndex = parts.indexOf('bill');

  if (billIndex === -1) {
    console.error('Invalid paid callback data:', data);
    return;
  }

  // billId is bill_TIMESTAMP, participantId is the number after that
  const billId = parts.slice(billIndex, billIndex + 2).join('_');
  const participantTelegramId = parseInt(parts[billIndex + 2]);

  console.log('Mark paid:', { billId, participantTelegramId, markedBy: telegramUserId, rawData: data });

  try {
    const billRef = db.collection('bills').doc(billId);

    // Use transaction to prevent race conditions
    await db.runTransaction(async (transaction) => {
      const billDoc = await transaction.get(billRef);

      if (!billDoc.exists) {
        throw new Error('Bill not found');
      }

      const bill = billDoc.data();

      if (bill.phase !== 'payment') {
        throw new Error('Bill must be locked before marking as paid');
      }

      // Authorization: Only the creator or the participant themselves can mark as paid
      const isCreator = bill.creatorTelegramId === telegramUserId;
      const isSelf = participantTelegramId === telegramUserId;

      if (!isCreator && !isSelf) {
        throw new Error('Only the bill creator or the participant can mark as paid');
      }

      // Find participant
      const participantIndex = bill.participants.findIndex(p => p.telegramUserId === participantTelegramId);

      if (participantIndex === -1) {
        throw new Error('Participant not found');
      }

      const participant = bill.participants[participantIndex];

      if (participant.hasPaid) {
        throw new Error('Already marked as paid');
      }

      // Mark as paid
      participant.hasPaid = true;
      participant.paidAt = new Date().toISOString();
      participant.paidBy = telegramUsername;

      bill.participants[participantIndex] = participant;

      // Update with transaction
      transaction.update(billRef, {
        participants: bill.participants,
        updatedAt: new Date().toISOString(),
      });

      return bill;
    });

    console.log(`${telegramUsername} marked participant ${participantTelegramId} as paid`);

    // Fetch updated bill for message
    const updatedBillDoc = await billRef.get();
    const updatedBill = updatedBillDoc.data();

    // Update message
    await updateInlineMessage(updatedBill, inlineMessageId, isInlineMessage, telegramUserId);

  } catch (error) {
    console.error('Error marking as paid:', error);
    // Provide user feedback
    if (error.message.includes('creator') || error.message.includes('participant')) {
      await answerCallback(callbackQueryId, '🔒 Only the bill creator or participant can mark as paid');
    } else if (error.message.includes('Already marked')) {
      await answerCallback(callbackQueryId, '✅ Already marked as paid');
    } else if (error.message.includes('must be locked')) {
      await answerCallback(callbackQueryId, '⚠️ Bill must be locked first');
    }
  }
}

// Calculate amounts for each participant
function calculateAmounts(bill) {
  if (!bill.participants || bill.participants.length === 0) {
    return;
  }

  const gstRate = bill.gstPercentage / 100;
  const serviceChargeRate = bill.serviceChargePercentage / 100;

  bill.participants.forEach(participant => {
    let participantSubtotal = 0;

    // Calculate subtotal from selected dishes
    participant.selectedDishIds.forEach(dishId => {
      const dish = bill.dishes.find(d => d.id === dishId);
      if (dish) {
        // Count how many people selected this dish
        const shareCount = bill.participants.filter(p =>
          p.selectedDishIds.includes(dishId)
        ).length;

        // Split dish price among those who selected it
        participantSubtotal += dish.price / shareCount;
      }
    });

    // Calculate service charge and GST proportionally
    const participantServiceCharge = participantSubtotal * serviceChargeRate;
    const participantGst = (participantSubtotal + participantServiceCharge) * gstRate;

    // Total amount owed
    participant.amountOwed = participantSubtotal + participantServiceCharge + participantGst;
  });
}

// Update inline message
async function updateInlineMessage(bill, inlineMessageId, isInlineMessage, currentUserId) {
  if (!isInlineMessage) return;

  const updatedMessage = formatBillMessage(bill);
  const updatedKeyboard = createInlineKeyboard(bill, currentUserId);

  console.log('Updating inline message:', inlineMessageId);

  const requestBody = {
    inline_message_id: inlineMessageId,
    text: updatedMessage,
    parse_mode: 'MarkdownV2', // Fixed: MarkdownV2
    reply_markup: updatedKeyboard,
  };

  const editResponse = await fetch(`${TELEGRAM_API}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  const editResult = await editResponse.json();
  console.log('Edit inline message result:', editResult.ok ? '✅ Success' : `❌ ${editResult.description}`);

  if (!editResult.ok) {
    console.error('Failed to edit inline message:', editResult);
  }
}

async function answerCallback(callbackQueryId, text) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text,
      show_alert: false,
    }),
  });
}

// Format bill message based on phase
function formatBillMessage(bill) {
  const date = new Date(bill.date).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (bill.phase === 'selection') {
    return formatSelectionPhaseMessage(bill, date);
  } else {
    return formatPaymentPhaseMessage(bill, date);
  }
}

// Format message for selection phase
function formatSelectionPhaseMessage(bill, date) {
  let message = `🧾 *${sanitizeForTelegram(bill.restaurantName || 'Bill Split')}*\n`;
  message += `📅 ${sanitizeForTelegram(date)}\n`;
  message += `💰 Total: $${sanitizeForTelegram(bill.total.toFixed(2))}\n\n`; // Escaped price dot
  message += `━━━━━━━━━━━━━━━━━━\n\n`;
  message += `*SELECT YOUR DISHES:*\n\n`;

  // Show all dishes
  bill.dishes.forEach((dish, index) => {
    // Escaped "1." to "1\." and hyphen to " \- " and price dot
    message += `${index + 1}\\. ${sanitizeForTelegram(dish.name)} \\- $${sanitizeForTelegram(dish.price.toFixed(2))}\n`;
  });

  message += `\n━━━━━━━━━━━━━━━━━━\n\n`;

  // Show who selected what
  if (bill.participants && bill.participants.length > 0) {
    message += `*👥 Selections:*\n`;
    bill.participants.forEach(p => {
      const dishNames = p.selectedDishIds
        .map(dishId => {
          const dish = bill.dishes.find(d => d.id === dishId);
          return dish ? sanitizeForTelegram(dish.name) : '?';
        })
        .join(', ');

      if (p.selectedDishIds.length > 0) {
        message += `✓ ${sanitizeForTelegram(p.telegramUsername)}: ${dishNames}\n`;
      } else {
        message += `⏳ ${sanitizeForTelegram(p.telegramUsername)}: (not selected yet)\n`;
      }
    });
  } else {
    message += `_No one has selected dishes yet..._\n`;
  }

  message += `\n━━━━━━━━━━━━━━━━━━\n`;
  message += `_Tap dishes below to select what you ate\\!_`; // Escaped !

  return message;
}

// Format message for payment phase
function formatPaymentPhaseMessage(bill, date) {
  let message = `🧾 *${sanitizeForTelegram(bill.restaurantName || 'Bill Split')}*\n`;
  message += `📅 ${sanitizeForTelegram(date)}\n`;
  message += `💰 Total: $${sanitizeForTelegram(bill.total.toFixed(2))}\n`; // Escaped price dot
  message += `🔒 *Split Calculated\\!*\n\n`; // Escaped !
  message += `━━━━━━━━━━━━━━━━━━\n\n`;

  if (!bill.participants || bill.participants.length === 0) {
    message += `_No participants_\n`;
    return message;
  }

  const paidParticipants = bill.participants.filter(p => p.hasPaid);
  const unpaidParticipants = bill.participants.filter(p => !p.hasPaid);

  // Show paid
  if (paidParticipants.length > 0) {
    message += `*✅ PAID (${paidParticipants.length})*\n`;
    paidParticipants.forEach(p => {
      const paidByInfo = p.paidBy ? ` (by ${sanitizeForTelegram(p.paidBy)})` : '';
      message += `   ${sanitizeForTelegram(p.telegramUsername)} \\- $${sanitizeForTelegram(p.amountOwed.toFixed(2))} ✓${paidByInfo}\n`;
    });
    message += `\n`;
  }

  // Show unpaid
  if (unpaidParticipants.length > 0) {
    message += `*⏳ PENDING (${unpaidParticipants.length})*\n`;
    unpaidParticipants.forEach(p => {
      message += `   ${sanitizeForTelegram(p.telegramUsername)} \\- $${sanitizeForTelegram(p.amountOwed.toFixed(2))}\n`;
    });
  }

  message += `\n━━━━━━━━━━━━━━━━━━\n`;
  message += `_Tap "Mark Paid" when you've paid\\!_`; // Escaped !

  return message;
}

// Create inline keyboard based on phase
function createInlineKeyboard(bill, currentUserId) {
  if (bill.phase === 'selection') {
    return createSelectionKeyboard(bill, currentUserId);
  } else {
    return createPaymentKeyboard(bill);
  }
}

// Create keyboard for selection phase
function createSelectionKeyboard(bill, currentUserId) {
  const keyboard = [];

  // Get current user's selections
  const currentParticipant = bill.participants?.find(p => p.telegramUserId === currentUserId);
  const selectedDishIds = currentParticipant?.selectedDishIds || [];

  // Add dish buttons (2 per row)
  for (let i = 0; i < bill.dishes.length; i += 2) {
    const row = [];

    const dish1 = bill.dishes[i];
    const isSelected1 = selectedDishIds.includes(dish1.id);
    row.push({
      text: `${isSelected1 ? '✓ ' : ''}${dish1.name}`,
      callback_data: `select_${bill.id}_${dish1.id}`,
    });

    if (i + 1 < bill.dishes.length) {
      const dish2 = bill.dishes[i + 1];
      const isSelected2 = selectedDishIds.includes(dish2.id);
      row.push({
        text: `${isSelected2 ? '✓ ' : ''}${dish2.name}`,
        callback_data: `select_${bill.id}_${dish2.id}`,
      });
    }

    keyboard.push(row);
  }

  // Add lock button (only show if there are participants)
  if (bill.participants && bill.participants.length > 0) {
    keyboard.push([{
      text: '🔒 Lock & Calculate Split',
      callback_data: `lock_${bill.id}`,
    }]);
  }

  return { inline_keyboard: keyboard };
}

// Create keyboard for payment phase
function createPaymentKeyboard(bill) {
  const keyboard = [];

  // Add "Mark Paid" buttons for unpaid participants
  const unpaidParticipants = bill.participants.filter(p => !p.hasPaid);

  unpaidParticipants.forEach(p => {
    keyboard.push([{
      text: `${p.telegramUsername} - $${p.amountOwed.toFixed(2)} → Mark Paid`,
      callback_data: `paid_${bill.id}_${p.telegramUserId}`,
    }]);
  });

  return { inline_keyboard: keyboard };
}