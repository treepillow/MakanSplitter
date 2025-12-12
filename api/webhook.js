// Telegram webhook handler for MakanSplit
// Handles inline queries and button callbacks

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
    res.status(500).json({ error: error.message });
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
    // Get bill from Firestore
    const billDoc = await db.collection('bills').doc(query).get();

    if (!billDoc.exists) {
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

    // Format bill message
    const message = formatBillMessage(bill);
    const keyboard = createInlineKeyboard(bill);

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
            title: `Bill: ${bill.restaurantName}`,
            description: `Total: $${bill.total.toFixed(2)} - ${bill.people.length} people`,
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
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  // Get Telegram user info
  const telegramUser = callbackQuery.from;
  const telegramName = telegramUser.username
    ? `@${telegramUser.username}`
    : (telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : ''));

  const [action, billId, personId] = data.split('_');

  if (action !== 'paid') {
    return;
  }

  try {
    const billRef = db.collection('bills').doc(billId);
    const billDoc = await billRef.get();

    if (!billDoc.exists) {
      await answerCallback(callbackQuery.id, '❌ Bill not found');
      return;
    }

    const bill = billDoc.data();

    // Find person
    const personIndex = bill.people.findIndex(p => p.id === personId);
    if (personIndex === -1) {
      await answerCallback(callbackQuery.id, '❌ Person not found');
      return;
    }

    const person = bill.people[personIndex];

    if (person.hasPaid) {
      await answerCallback(callbackQuery.id, '✅ Already marked as paid!');
      return;
    }

    // Update person status and record who marked it
    bill.people[personIndex].hasPaid = true;
    bill.people[personIndex].paidBy = telegramName;
    bill.people[personIndex].paidAt = new Date().toISOString();
    bill.updatedAt = new Date().toISOString();

    // Save to Firestore
    await billRef.update({
      people: bill.people,
      updatedAt: bill.updatedAt,
    });

    // Update message
    const updatedMessage = formatBillMessage(bill);
    const updatedKeyboard = createInlineKeyboard(bill);

    await fetch(`${TELEGRAM_API}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: updatedMessage,
        parse_mode: 'Markdown',
        reply_markup: updatedKeyboard,
      }),
    });

    await answerCallback(callbackQuery.id, `✅ ${person.name} marked as paid by ${telegramName}!`);
  } catch (error) {
    console.error('Error handling callback:', error);
    await answerCallback(callbackQuery.id, '❌ Error updating status');
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

function formatBillMessage(bill) {
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

  if (paidPeople.length > 0) {
    message += `✅ *PAID (${paidPeople.length})*\n`;
    paidPeople.forEach(person => {
      const paidByInfo = person.paidBy ? ` (by ${person.paidBy})` : '';
      message += `   ${person.name} - $${person.amountOwed.toFixed(2)} ✓${paidByInfo}\n`;
    });
    message += `\n`;
  }

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

function createInlineKeyboard(bill) {
  const unpaidPeople = bill.people.filter(p => !p.hasPaid);

  const keyboard = unpaidPeople.map(person => ([
    {
      text: `${person.name} - $${person.amountOwed.toFixed(2)} → Paid`,
      callback_data: `paid_${bill.id}_${person.id}`,
    },
  ]));

  return {
    inline_keyboard: keyboard,
  };
}
