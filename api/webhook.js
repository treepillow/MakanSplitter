// Telegram webhook handler for MakanSplit
// Handles inline queries and button callbacks for dish selection and payment

const admin = require('firebase-admin');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
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

// Main webhook handler
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    console.log('Received update:', JSON.stringify(update, null, 2));

    // Check if Firebase is initialized
    if (!admin.apps.length) {
      console.error('Firebase not initialized');
      return res.status(500).json({ error: 'Firebase not initialized' });
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
    res.status(500).json({ error: error.message, stack: error.stack });
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
              parse_mode: 'Markdown',
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
  // Answer callback immediately to prevent loading state
  await answerCallback(callbackQuery.id, '⏳ Updating...');

  const data = callbackQuery.data;
  const telegramUser = callbackQuery.from;
  const telegramUserId = telegramUser.id;
  const telegramUsername = telegramUser.username
    ? `@${telegramUser.username}`
    : (telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : ''));

  // Check if this is an inline message
  const isInlineMessage = !!callbackQuery.inline_message_id;
  const inlineMessageId = callbackQuery.inline_message_id;

  console.log('Callback data:', data);
  console.log('Telegram user:', telegramUsername, telegramUserId);

  // Parse callback data
  const parts = data.split('_');
  const action = parts[0];

  if (action === 'select') {
    // Format: select_billId_dishId
    await handleDishSelection(data, telegramUserId, telegramUsername, inlineMessageId, isInlineMessage);
  } else if (action === 'lock') {
    // Format: lock_billId
    await handleLockBill(data, telegramUserId, inlineMessageId, isInlineMessage);
  } else if (action === 'paid') {
    // Format: paid_billId_participantTelegramId
    await handleMarkPaid(data, telegramUserId, telegramUsername, inlineMessageId, isInlineMessage);
  }
}

// Handle dish selection
async function handleDishSelection(data, telegramUserId, telegramUsername, inlineMessageId, isInlineMessage) {
  // Parse: select_billId_dishId
  const parts = data.split('_');
  const billId = parts[1];
  const dishId = parts[2];

  console.log('Dish selection:', { billId, dishId, telegramUserId });

  try {
    const billRef = db.collection('bills').doc(billId);
    const billDoc = await billRef.get();

    if (!billDoc.exists) {
      console.error('Bill not found:', billId);
      return;
    }

    const bill = billDoc.data();

    if (bill.phase !== 'selection') {
      console.log('Bill is locked, cannot select dishes');
      await answerCallback(callbackQuery.id, '❌ Bill is locked!');
      return;
    }

    // Initialize participants array if doesn't exist
    if (!bill.participants) {
      bill.participants = [];
    }

    // Find or create participant
    let participant = bill.participants.find(p => p.telegramUserId === telegramUserId);

    if (!participant) {
      participant = {
        telegramUserId,
        telegramUsername,
        selectedDishIds: [],
        hasPaid: false,
      };
      bill.participants.push(participant);
    }

    // Toggle dish selection
    const dishIndex = participant.selectedDishIds.indexOf(dishId);
    if (dishIndex === -1) {
      // Add dish
      participant.selectedDishIds.push(dishId);
      console.log(`${telegramUsername} selected dish ${dishId}`);
    } else {
      // Remove dish
      participant.selectedDishIds.splice(dishIndex, 1);
      console.log(`${telegramUsername} unselected dish ${dishId}`);
    }

    // Update bill
    bill.updatedAt = new Date().toISOString();
    await billRef.update({
      participants: bill.participants,
      updatedAt: bill.updatedAt,
    });

    // Update message
    await updateInlineMessage(bill, inlineMessageId, isInlineMessage, telegramUserId);
  } catch (error) {
    console.error('Error handling dish selection:', error);
  }
}

// Handle lock & calculate
async function handleLockBill(data, telegramUserId, inlineMessageId, isInlineMessage) {
  // Parse: lock_billId
  const parts = data.split('_');
  const billId = parts[1];

  console.log('Lock bill:', { billId, telegramUserId });

  try {
    const billRef = db.collection('bills').doc(billId);
    const billDoc = await billRef.get();

    if (!billDoc.exists) {
      console.error('Bill not found:', billId);
      return;
    }

    const bill = billDoc.data();

    // Check if user is creator
    if (bill.creatorTelegramId && bill.creatorTelegramId !== telegramUserId) {
      console.log('Only creator can lock bill');
      return;
    }

    if (bill.phase !== 'selection') {
      console.log('Bill is already locked');
      return;
    }

    // Calculate amounts for each participant
    calculateAmounts(bill);

    // Update bill to payment phase
    bill.phase = 'payment';
    bill.lockedAt = new Date().toISOString();
    bill.updatedAt = new Date().toISOString();

    await billRef.update({
      phase: bill.phase,
      lockedAt: bill.lockedAt,
      updatedAt: bill.updatedAt,
      participants: bill.participants,
    });

    console.log('Bill locked and amounts calculated');

    // Update message
    await updateInlineMessage(bill, inlineMessageId, isInlineMessage, telegramUserId);
  } catch (error) {
    console.error('Error locking bill:', error);
  }
}

// Handle mark as paid
async function handleMarkPaid(data, telegramUserId, telegramUsername, inlineMessageId, isInlineMessage) {
  // Parse: paid_billId_participantTelegramId
  const parts = data.split('_');
  const billId = parts[1];
  const participantTelegramId = parseInt(parts[2]);

  console.log('Mark paid:', { billId, participantTelegramId, markedBy: telegramUserId });

  try {
    const billRef = db.collection('bills').doc(billId);
    const billDoc = await billRef.get();

    if (!billDoc.exists) {
      console.error('Bill not found:', billId);
      return;
    }

    const bill = billDoc.data();

    if (bill.phase !== 'payment') {
      console.log('Bill must be locked before marking as paid');
      return;
    }

    // Find participant
    const participant = bill.participants.find(p => p.telegramUserId === participantTelegramId);

    if (!participant) {
      console.error('Participant not found:', participantTelegramId);
      return;
    }

    if (participant.hasPaid) {
      console.log('Already marked as paid');
      return;
    }

    // Mark as paid
    participant.hasPaid = true;
    participant.paidAt = new Date().toISOString();
    participant.paidBy = telegramUsername;

    bill.updatedAt = new Date().toISOString();

    await billRef.update({
      participants: bill.participants,
      updatedAt: bill.updatedAt,
    });

    console.log(`${telegramUsername} marked ${participant.telegramUsername} as paid`);

    // Update message
    await updateInlineMessage(bill, inlineMessageId, isInlineMessage, telegramUserId);
  } catch (error) {
    console.error('Error marking as paid:', error);
  }
}

// Calculate amounts for each participant
function calculateAmounts(bill) {
  if (!bill.participants || bill.participants.length === 0) {
    return;
  }

  const totalBeforeCharges = bill.subtotal;
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
    parse_mode: 'Markdown',
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
  let message = `🧾 *${bill.restaurantName || 'Bill Split'}*\n`;
  message += `📅 ${date}\n`;
  message += `💰 Total: $${bill.total.toFixed(2)}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━\n\n`;
  message += `*SELECT YOUR DISHES:*\n\n`;

  // Show all dishes
  bill.dishes.forEach((dish, index) => {
    message += `${index + 1}. ${dish.name} - $${dish.price.toFixed(2)}\n`;
  });

  message += `\n━━━━━━━━━━━━━━━━━━\n\n`;

  // Show who selected what
  if (bill.participants && bill.participants.length > 0) {
    message += `*👥 Selections:*\n`;
    bill.participants.forEach(p => {
      const dishNames = p.selectedDishIds
        .map(dishId => {
          const dish = bill.dishes.find(d => d.id === dishId);
          return dish ? dish.name : '?';
        })
        .join(', ');

      if (p.selectedDishIds.length > 0) {
        message += `✓ ${p.telegramUsername}: ${dishNames}\n`;
      } else {
        message += `⏳ ${p.telegramUsername}: (not selected yet)\n`;
      }
    });
  } else {
    message += `_No one has selected dishes yet..._\n`;
  }

  message += `\n━━━━━━━━━━━━━━━━━━\n`;
  message += `_Tap dishes below to select what you ate!_`;

  return message;
}

// Format message for payment phase
function formatPaymentPhaseMessage(bill, date) {
  let message = `🧾 *${bill.restaurantName || 'Bill Split'}*\n`;
  message += `📅 ${date}\n`;
  message += `💰 Total: $${bill.total.toFixed(2)}\n`;
  message += `🔒 *Split Calculated!*\n\n`;
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
      const paidByInfo = p.paidBy ? ` (by ${p.paidBy})` : '';
      message += `   ${p.telegramUsername} - $${p.amountOwed.toFixed(2)} ✓${paidByInfo}\n`;
    });
    message += `\n`;
  }

  // Show unpaid
  if (unpaidParticipants.length > 0) {
    message += `*⏳ PENDING (${unpaidParticipants.length})*\n`;
    unpaidParticipants.forEach(p => {
      message += `   ${p.telegramUsername} - $${p.amountOwed.toFixed(2)}\n`;
    });
  }

  message += `\n━━━━━━━━━━━━━━━━━━\n`;
  message += `_Tap "Mark Paid" when you've paid!_`;

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
