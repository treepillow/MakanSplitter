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

// --- HELPERS ---

// 1. Rate limiting
const actionLimits = new Map();
function rateLimit(userId, action, cooldownMs = 1000) {
  const now = Date.now();
  const key = `${userId}_${action}`;
  const lastTime = actionLimits.get(key);
  if (lastTime && now - lastTime < cooldownMs) return false;
  actionLimits.set(key, now);
  if (actionLimits.size > 10000) {
    for (const [k, time] of actionLimits.entries()) {
      if (now - time > 3600000) actionLimits.delete(k);
    }
  }
  return true;
}

// 2. Safe Sanitizer for MarkdownV2 (From ChatGPT's cleaner version)
function sanitizeForTelegram(text) {
  if (text === null || text === undefined) return '';
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

// 3. Money Formatter (Handles the . in prices automatically)
function tgMoney(num) {
  return sanitizeForTelegram(Number(num).toFixed(2));
}

// 4. Verify Webhook
function verifyTelegramRequest(req) {
  if (TELEGRAM_WEBHOOK_SECRET) {
    const headerToken = req.headers['x-telegram-bot-api-secret-token'];
    if (headerToken !== TELEGRAM_WEBHOOK_SECRET) return false;
  }
  return true;
}

// --- MAIN HANDLER ---

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!verifyTelegramRequest(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const update = req.body;

    // Handle inline queries
    if (update.inline_query) {
      await handleInlineQuery(update.inline_query);
    }

    // Handle buttons
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- INLINE QUERY HANDLER ---

async function handleInlineQuery(inlineQuery) {
  const query = inlineQuery.query.trim();
  const queryId = inlineQuery.id;

  if (!query) return;

  try {
    console.log('Searching:', query);
    const billDoc = await db.collection('bills').doc(query).get();

    if (!billDoc.exists) {
      console.log('Bill not found');
      await answerInline(queryId, []);
      return;
    }

    const bill = billDoc.data();
    const message = formatBillMessage(bill);
    const keyboard = createInlineKeyboard(bill, inlineQuery.from.id);

    await answerInline(queryId, [
      {
        type: 'article',
        id: bill.id,
        title: `Bill: ${bill.restaurantName || 'Split Bill'}`,
        description: `Total: $${bill.total.toFixed(2)}`,
        input_message_content: {
          message_text: message,
          parse_mode: 'MarkdownV2',
        },
        reply_markup: keyboard,
      },
    ]);
    
    console.log('✅ Article sent for', bill.id);

  } catch (error) {
    console.error('🔥 Error handling inline query:', error);
  }
}

async function answerInline(id, results) {
  const res = await fetch(`${TELEGRAM_API}/answerInlineQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inline_query_id: id, results, cache_time: 0 }),
  });
  if (!res.ok) console.error('Telegram Error:', await res.text());
}

// --- CALLBACK HANDLER (BUTTONS) ---

async function handleCallbackQuery(callbackQuery) {
  const data = callbackQuery.data;
  const telegramUser = callbackQuery.from;
  const userId = telegramUser.id;
  const username = telegramUser.username ? `@${telegramUser.username}` : telegramUser.first_name;

  const isInline = !!callbackQuery.inline_message_id;
  const inlineMsgId = callbackQuery.inline_message_id;
  
  const parts = data.split('_');
  const action = parts[0];

  console.log('Action:', action, 'User:', userId);

  if (!rateLimit(userId, action, 1000)) {
    await answerCallback(callbackQuery.id, '⏱️ Slow down!');
    return;
  }

  await answerCallback(callbackQuery.id, '⏳ Updating...');

  if (action === 'select') {
    await handleDishSelection(data, userId, username, inlineMsgId, isInline);
  } else if (action === 'lock') {
    await handleLockBill(data, userId, inlineMsgId, isInline, callbackQuery.id);
  } else if (action === 'paid') {
    await handleMarkPaid(data, userId, username, inlineMsgId, isInline, callbackQuery.id);
  }
}

// --- DATABASE LOGIC (Restored from your original code) ---

async function handleDishSelection(data, userId, username, inlineMsgId, isInline) {
  const parts = data.split('_');
  const billIndex = parts.indexOf('bill');
  const dishIndex = parts.findIndex((part, idx) => idx > billIndex && part === 'dish');
  
  if (billIndex === -1 || dishIndex === -1) return;
  const billId = parts.slice(billIndex, dishIndex).join('_');
  const dishId = parts.slice(dishIndex).join('_');

  try {
    const billRef = db.collection('bills').doc(billId);
    await db.runTransaction(async (t) => {
      const doc = await t.get(billRef);
      if (!doc.exists) throw new Error('No bill');
      const bill = doc.data();
      
      if (bill.phase !== 'selection') throw new Error('Locked');
      if (!bill.participants) bill.participants = [];

      let pIndex = bill.participants.findIndex(p => p.telegramUserId === userId);
      if (pIndex === -1) {
        bill.participants.push({ telegramUserId: userId, telegramUsername: username, selectedDishIds: [], hasPaid: false });
        pIndex = bill.participants.length - 1;
      }
      
      const p = bill.participants[pIndex];
      const dIdx = p.selectedDishIds.indexOf(dishId);
      if (dIdx === -1) p.selectedDishIds.push(dishId);
      else p.selectedDishIds.splice(dIdx, 1);
      
      if (!bill.creatorTelegramId && bill.participants.length > 0) bill.creatorTelegramId = userId;
      
      t.update(billRef, { participants: bill.participants, creatorTelegramId: bill.creatorTelegramId || null });
    });

    const updated = (await billRef.get()).data();
    await updateInlineMessage(updated, inlineMsgId, isInline, userId);
  } catch (e) { console.error('Select error:', e); }
}

async function handleLockBill(data, userId, inlineMsgId, isInline, cbId) {
  const parts = data.split('_');
  const billIndex = parts.indexOf('bill');
  if (billIndex === -1) return;
  const billId = parts.slice(billIndex).join('_');

  try {
    const billRef = db.collection('bills').doc(billId);
    await db.runTransaction(async (t) => {
      const doc = await t.get(billRef);
      const bill = doc.data();
      
      if (bill.creatorTelegramId && bill.creatorTelegramId !== userId) throw new Error('Creator only');
      if (bill.phase !== 'selection') throw new Error('Already locked');
      
      const hasSelections = bill.participants?.some(p => p.selectedDishIds.length > 0);
      if (!hasSelections) throw new Error('No selections');

      calculateAmounts(bill);
      t.update(billRef, { phase: 'payment', participants: bill.participants });
    });

    const updated = (await billRef.get()).data();
    await updateInlineMessage(updated, inlineMsgId, isInline, userId);
  } catch (e) { 
    console.error('Lock error:', e);
    // Notify user of specific errors via alert
    if (e.message === 'Creator only') await answerCallback(cbId, '🔒 Only creator can lock', true);
    if (e.message === 'No selections') await answerCallback(cbId, '⚠️ Select dishes first', true);
  }
}

async function handleMarkPaid(data, userId, username, inlineMsgId, isInline, cbId) {
  const parts = data.split('_');
  const billIndex = parts.indexOf('bill');
  if (billIndex === -1) return;
  const billId = parts.slice(billIndex, billIndex + 2).join('_');
  const targetId = parseInt(parts[billIndex + 2]);

  try {
    const billRef = db.collection('bills').doc(billId);
    await db.runTransaction(async (t) => {
      const doc = await t.get(billRef);
      const bill = doc.data();
      
      if (bill.phase !== 'payment') throw new Error('Not locked');
      if (bill.creatorTelegramId !== userId && targetId !== userId) throw new Error('Unauthorized');
      
      const p = bill.participants.find(p => p.telegramUserId === targetId);
      if (!p) throw new Error('No participant');
      if (p.hasPaid) throw new Error('Already paid');
      
      p.hasPaid = true;
      p.paidBy = username;
      t.update(billRef, { participants: bill.participants });
    });

    const updated = (await billRef.get()).data();
    await updateInlineMessage(updated, inlineMsgId, isInline, userId);
  } catch (e) { 
    console.error('Pay error:', e); 
    if (e.message === 'Unauthorized') await answerCallback(cbId, '🔒 Only creator/self can mark paid', true);
  }
}

function calculateAmounts(bill) {
  if (!bill.participants) return;
  const gst = bill.gstPercentage / 100;
  const svc = bill.serviceChargePercentage / 100;

  bill.participants.forEach(p => {
    let sub = 0;
    p.selectedDishIds.forEach(id => {
      const d = bill.dishes.find(x => x.id === id);
      if (d) {
        const sharers = bill.participants.filter(x => x.selectedDishIds.includes(id)).length;
        sub += d.price / sharers;
      }
    });
    p.amountOwed = sub * (1 + svc) * (1 + gst);
  });
}

// --- MESSAGE UPDATER ---

async function updateInlineMessage(bill, inlineMsgId, isInline, userId) {
  if (!isInline) return;
  const msg = formatBillMessage(bill);
  const kb = createInlineKeyboard(bill, userId);

  await fetch(`${TELEGRAM_API}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inline_message_id: inlineMsgId,
      text: msg,
      parse_mode: 'MarkdownV2',
      reply_markup: kb,
    }),
  });
}

async function answerCallback(id, text, alert = false) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: id, text, show_alert: alert }),
  });
}

// --- FORMATTERS (Using clean ChatGPT logic) ---

function formatBillMessage(bill) {
  const date = sanitizeForTelegram(new Date(bill.date).toLocaleDateString('en-SG', {
    day: 'numeric', month: 'short', year: 'numeric'
  }));
  return bill.phase === 'payment' ? formatPayment(bill, date) : formatSelection(bill, date);
}

function formatSelection(bill, date) {
  let msg = `🧾 *${sanitizeForTelegram(bill.restaurantName || 'Bill Split')}*\n`;
  msg += `📅 ${date}\n`;
  msg += `💰 Total: $${tgMoney(bill.total)}\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `*SELECT YOUR DISHES:*\n\n`;

  bill.dishes.forEach((d, i) => {
    msg += `${i + 1}\\. ${sanitizeForTelegram(d.name)} \\- $${tgMoney(d.price)}\n`;
  });

  msg += `\n━━━━━━━━━━━━━━━━━━\n\n`;

  if (!bill.participants?.length) {
    msg += `_No one has selected dishes yet\\._\n`; // Escaped dot
  } else {
    msg += `*👥 Selections:*\n`;
    bill.participants.forEach(p => {
      const name = sanitizeForTelegram(p.telegramUsername);
      if (!p.selectedDishIds.length) {
        msg += `⏳ ${name}: \\(not selected yet\\)\n`; // Escaped parens
      } else {
        const dishes = p.selectedDishIds
          .map(id => bill.dishes.find(d => d.id === id)?.name || '?')
          .map(sanitizeForTelegram)
          .join(', ');
        msg += `✓ ${name}: ${dishes}\n`;
      }
    });
  }

  msg += `\n━━━━━━━━━━━━━━━━━━\n`;
  msg += `_Tap dishes below to select what you ate\\!_`;
  return msg;
}

function formatPayment(bill, date) {
  let msg = `🧾 *${sanitizeForTelegram(bill.restaurantName)}*\n`;
  msg += `📅 ${date}\n`;
  msg += `💰 Total: $${tgMoney(bill.total)}\n`;
  msg += `🔒 *Split Calculated\\!*\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n\n`;

  const paid = bill.participants.filter(p => p.hasPaid);
  const pending = bill.participants.filter(p => !p.hasPaid);

  if (paid.length) {
    msg += `*✅ PAID \\(${paid.length}\\)*\n`;
    paid.forEach(p => {
      const by = p.paidBy ? ` \\(by ${sanitizeForTelegram(p.paidBy)}\\)` : '';
      msg += `   ${sanitizeForTelegram(p.telegramUsername)} \\- $${tgMoney(p.amountOwed)} ✓${by}\n`;
    });
    msg += `\n`;
  }

  if (pending.length) {
    msg += `*⏳ PENDING \\(${pending.length}\\)*\n`;
    pending.forEach(p => {
      msg += `   ${sanitizeForTelegram(p.telegramUsername)} \\- $${tgMoney(p.amountOwed)}\n`;
    });
  }

  msg += `\n━━━━━━━━━━━━━━━━━━\n`;
  msg += `_Tap "Mark Paid" when you've paid\\!_`;
  return msg;
}

// --- KEYBOARDS ---

function createInlineKeyboard(bill, userId) {
  if (bill.phase === 'payment') {
    return {
      inline_keyboard: bill.participants
        .filter(p => !p.hasPaid)
        .map(p => [{
          text: `${p.telegramUsername} - $${p.amountOwed.toFixed(2)} → Mark Paid`,
          callback_data: `paid_${bill.id}_${p.telegramUserId}`
        }])
    };
  }

  // Selection Keyboard
  const rows = [];
  const currentParticipant = bill.participants?.find(p => p.telegramUserId === userId);
  const selected = currentParticipant?.selectedDishIds || [];

  for (let i = 0; i < bill.dishes.length; i += 2) {
    const row = [];
    const d1 = bill.dishes[i];
    row.push({
      text: `${selected.includes(d1.id) ? '✓ ' : ''}${d1.name}`,
      callback_data: `select_${bill.id}_${d1.id}`,
    });
    if (bill.dishes[i + 1]) {
      const d2 = bill.dishes[i + 1];
      row.push({
        text: `${selected.includes(d2.id) ? '✓ ' : ''}${d2.name}`,
        callback_data: `select_${bill.id}_${d2.id}`,
      });
    }
    rows.push(row);
  }

  if (bill.participants?.length) {
    rows.push([{ text: '🔒 Lock & Calculate Split', callback_data: `lock_${bill.id}` }]);
  }

  return { inline_keyboard: rows };
}