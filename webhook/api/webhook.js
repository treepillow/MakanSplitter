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

// 2. Safe Sanitizer for MarkdownV2
function sanitizeForTelegram(text) {
  if (text === null || text === undefined) return '';
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

// 3. Money Formatter
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

    if (update.message) {
      await handleMessage(update.message);
    }

    if (update.inline_query) {
      await handleInlineQuery(update.inline_query);
    }

    if (update.chosen_inline_result) {
      await handleChosenInlineResult(update.chosen_inline_result);
    }

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
    const keyboard = createInlineKeyboard(bill);

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

// --- MESSAGE HANDLER (/start deep link from web app) ---

async function handleMessage(message) {
  const text = message.text || '';
  const chatId = message.chat.id;
  const userId = message.from.id;

  const startMatch = text.match(/^\/start(?:\s+(bill_[\w-]+))?/);
  if (!startMatch) return;

  const billId = startMatch[1];

  if (!billId) {
    await sendMessage(chatId,
      '👋 Welcome to MakanSplit\\!\n\n' +
      'Create a bill at the web app, then tap *Open in Telegram* to share it with your group\\.');
    return;
  }

  try {
    const billRef = db.collection('bills').doc(billId);
    const billDoc = await billRef.get();

    if (!billDoc.exists) {
      await sendMessage(chatId, '❌ Bill not found\\. It may have expired \\(bills are kept for 30 days\\)\\.');
      return;
    }

    const bill = billDoc.data();

    // The person opening the deep link came from the web app - they are the
    // bill creator. Only set if not already claimed.
    if (!bill.creatorTelegramId) {
      await billRef.update({ creatorTelegramId: userId });
    }

    // switch_inline_query opens Telegram's chat picker and pre-fills the
    // inline query, so the user can't skip the "wait for the popup" step.
    await sendMessage(chatId,
      `🧾 *${sanitizeForTelegram(bill.restaurantName || 'Bill Split')}*\n` +
      `💰 Total: $${tgMoney(bill.total)}\n\n` +
      `Tap the button below, pick your group chat, then *tap the bill card that pops up* to post it\\.`,
      {
        inline_keyboard: [[
          { text: '📤 Share bill to a chat', switch_inline_query: billId }
        ]]
      });
  } catch (e) {
    console.error('Start handler error:', e);
  }
}

async function sendMessage(chatId, text, replyMarkup) {
  const body = { chat_id: chatId, text, parse_mode: 'MarkdownV2' };
  if (replyMarkup) body.reply_markup = replyMarkup;
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error('sendMessage Error:', await res.text());
}

// --- CHOSEN INLINE RESULT (captures who shared the bill) ---
// Requires "inline feedback" to be enabled via @BotFather (/setinlinefeedback).
// Fallback creator capture in case the sharer skipped the /start deep link.

async function handleChosenInlineResult(chosenResult) {
  const billId = chosenResult.result_id;
  const userId = chosenResult.from.id;

  try {
    const billRef = db.collection('bills').doc(billId);
    const billDoc = await billRef.get();
    if (!billDoc.exists) return;

    if (!billDoc.data().creatorTelegramId) {
      await billRef.update({ creatorTelegramId: userId });
    }
  } catch (e) {
    console.error('Chosen inline result error:', e);
  }
}

// --- CALLBACK HANDLER (BUTTONS) ---

async function handleCallbackQuery(callbackQuery) {
  const data = callbackQuery.data;
  const telegramUser = callbackQuery.from;
  const userId = telegramUser.id;
  const username = telegramUser.username ? `@${telegramUser.username}` : telegramUser.first_name;

  const isInline = !!callbackQuery.inline_message_id;
  const inlineMsgId = callbackQuery.inline_message_id;
  
  // ⚡ COMPRESSED PARSING: Split by ':'
  // Format: "action:billId:payload"
  const parts = data.split(':');
  const action = parts[0];
  const billId = parts[1];
  const payload = parts[2]; // dishIndex or targetUserId

  console.log(`Action: ${action}, Bill: ${billId}, Payload: ${payload}`);

  if (!rateLimit(userId, action, 1000)) {
    await answerCallback(callbackQuery.id, '⏱️ Slow down!');
    return;
  }

  // A callback query can only be answered ONCE - answering early with
  // "Updating..." would swallow every error alert below. Handlers return
  // { text, alert } and we answer exactly once at the end.
  let result = {};

  if (action === 's') { // 's' = select
    result = await handleDishSelection(billId, payload, userId, username, inlineMsgId, isInline);
  } else if (action === 'l') { // 'l' = lock
    result = await handleLockBill(billId, userId, inlineMsgId, isInline);
  } else if (action === 'p') { // 'p' = paid
    result = await handleMarkPaid(billId, payload, userId, username, inlineMsgId, isInline);
  }

  await answerCallback(callbackQuery.id, result.text || '', result.alert || false);
}

// --- DATABASE LOGIC ---

async function handleDishSelection(billId, dishIndexStr, userId, username, inlineMsgId, isInline) {
  const dishIndex = parseInt(dishIndexStr);
  let feedback = '';

  try {
    const billRef = db.collection('bills').doc(billId);
    await db.runTransaction(async (t) => {
      const doc = await t.get(billRef);
      if (!doc.exists) throw new Error('No bill');
      const bill = doc.data();

      if (bill.phase !== 'selection') throw new Error('Locked');

      // Get Dish ID from Index (Safe & Short)
      if (!bill.dishes || !bill.dishes[dishIndex]) throw new Error('Invalid dish');
      const dish = bill.dishes[dishIndex];

      if (!bill.participants) bill.participants = [];

      let pIndex = bill.participants.findIndex(p => p.telegramUserId === userId);
      if (pIndex === -1) {
        bill.participants.push({ telegramUserId: userId, telegramUsername: username, selectedDishIds: [], hasPaid: false });
        pIndex = bill.participants.length - 1;
      }

      const p = bill.participants[pIndex];
      const dIdx = p.selectedDishIds.indexOf(dish.id);
      if (dIdx === -1) {
        p.selectedDishIds.push(dish.id);
        feedback = `✓ Added ${dish.name}`;
      } else {
        p.selectedDishIds.splice(dIdx, 1);
        feedback = `✗ Removed ${dish.name}`;
      }

      t.update(billRef, { participants: bill.participants });
    });

    const updated = (await billRef.get()).data();
    await updateInlineMessage(updated, inlineMsgId, isInline);
    return { text: feedback };
  } catch (e) {
    console.error('Select error:', e);
    if (e.message === 'Locked') return { text: '🔒 Bill is already locked', alert: true };
    if (e.message === 'No bill') return { text: '❌ Bill not found', alert: true };
    return { text: '⚠️ Something went wrong, try again', alert: true };
  }
}

async function handleLockBill(billId, userId, inlineMsgId, isInline) {
  try {
    const billRef = db.collection('bills').doc(billId);
    await db.runTransaction(async (t) => {
      const doc = await t.get(billRef);
      if (!doc.exists) throw new Error('No bill');
      const bill = doc.data();

      if (bill.creatorTelegramId && bill.creatorTelegramId !== userId) throw new Error('Creator only');
      if (bill.phase !== 'selection') throw new Error('Already locked');

      const hasSelections = bill.participants?.some(p => p.selectedDishIds.length > 0);
      if (!hasSelections) throw new Error('No selections');

      // Every dish must be claimed by someone, otherwise the sum of what
      // participants owe won't add up to the bill total.
      const unclaimed = bill.dishes.filter(d =>
        !bill.participants.some(p => p.selectedDishIds.includes(d.id))
      );
      if (unclaimed.length > 0) {
        const err = new Error('Unclaimed');
        err.dishNames = unclaimed.map(d => d.name).join(', ');
        throw err;
      }

      calculateAmounts(bill);
      t.update(billRef, {
        phase: 'payment',
        participants: bill.participants,
        // If no one claimed creator via /start or inline share, first locker becomes creator
        creatorTelegramId: bill.creatorTelegramId || userId,
        lockedAt: new Date().toISOString(),
      });
    });

    const updated = (await billRef.get()).data();
    await updateInlineMessage(updated, inlineMsgId, isInline);
    return { text: '🔒 Split calculated!' };
  } catch (e) {
    console.error('Lock error:', e);
    if (e.message === 'Creator only') return { text: '🔒 Only the bill creator can lock', alert: true };
    if (e.message === 'No selections') return { text: '⚠️ Select dishes first', alert: true };
    if (e.message === 'Already locked') return { text: '🔒 Bill is already locked', alert: true };
    if (e.message === 'No bill') return { text: '❌ Bill not found', alert: true };
    if (e.message === 'Unclaimed') return { text: `⚠️ No one claimed: ${e.dishNames}. Every dish needs an owner before locking!`, alert: true };
    return { text: '⚠️ Lock failed, try again', alert: true };
  }
}

async function handleMarkPaid(billId, targetIdStr, userId, username, inlineMsgId, isInline) {
  const targetId = parseInt(targetIdStr);

  try {
    const billRef = db.collection('bills').doc(billId);
    await db.runTransaction(async (t) => {
      const doc = await t.get(billRef);
      if (!doc.exists) throw new Error('No bill');
      const bill = doc.data();

      if (bill.phase !== 'payment') throw new Error('Not locked');
      if (bill.creatorTelegramId !== userId && targetId !== userId) throw new Error('Unauthorized');

      const p = bill.participants.find(p => p.telegramUserId === targetId);
      if (!p) throw new Error('No participant');
      if (p.hasPaid) throw new Error('Already paid');

      p.hasPaid = true;
      p.paidBy = username;
      p.paidAt = new Date().toISOString();
      t.update(billRef, { participants: bill.participants });
    });

    const updated = (await billRef.get()).data();
    await updateInlineMessage(updated, inlineMsgId, isInline);
    return { text: '✅ Marked as paid!' };
  } catch (e) {
    console.error('Pay error:', e);
    if (e.message === 'Unauthorized') return { text: '🔒 Only the creator or the person themselves can mark paid', alert: true };
    if (e.message === 'Already paid') return { text: '✅ Already marked as paid' };
    if (e.message === 'No bill') return { text: '❌ Bill not found', alert: true };
    return { text: '⚠️ Something went wrong, try again', alert: true };
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
    p.amountOwed = Math.round(sub * (1 + svc) * (1 + gst) * 100) / 100;
  });

  // Rounding each share independently can leave the sum a few cents off the
  // bill total - put the difference on the largest share so it adds up exactly.
  const totalCents = Math.round(bill.total * 100);
  const sumCents = bill.participants.reduce((s, p) => s + Math.round(p.amountOwed * 100), 0);
  const diffCents = totalCents - sumCents;
  if (diffCents !== 0 && Math.abs(diffCents) <= bill.participants.length) {
    const largest = bill.participants.reduce((a, b) => (a.amountOwed >= b.amountOwed ? a : b));
    largest.amountOwed = Math.round(largest.amountOwed * 100 + diffCents) / 100;
  }
}

// --- MESSAGE UPDATER ---

async function updateInlineMessage(bill, inlineMsgId, isInline) {
  if (!isInline) return;
  const msg = formatBillMessage(bill);
  const kb = createInlineKeyboard(bill);

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

// --- FORMATTERS ---

function formatBillMessage(bill) {
  const date = sanitizeForTelegram(new Date(bill.date).toLocaleDateString('en-SG', {
    day: 'numeric', month: 'short', year: 'numeric'
  }));
  return bill.phase === 'payment' ? formatPayment(bill, date) : formatSelection(bill, date);
}

function formatSelection(bill, date) {
  let msg = `🧾 *${sanitizeForTelegram(bill.restaurantName || 'Bill Split')}*\n`;
  msg += `📅 ${date}\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `*SELECT YOUR DISHES:*\n\n`;

  bill.dishes.forEach((d, i) => {
    msg += `${i + 1}\\. ${sanitizeForTelegram(d.name)} \\- $${tgMoney(d.price)}\n`;
  });

  msg += `\n━━━━━━━━━━━━━━━━━━\n\n`;

  if (!bill.participants?.length) {
    msg += `_No one has selected dishes yet\\._\n`;
  } else {
    msg += `*👥 Selections:*\n`;
    bill.participants.forEach(p => {
      const name = sanitizeForTelegram(p.telegramUsername);
      if (!p.selectedDishIds.length) {
        msg += `⏳ ${name}: \\(not selected yet\\)\n`;
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
  msg += `_Tap dishes below to select what you ate\\!_\n`;
  msg += `_Every dish needs an owner before the split can be locked\\._`;
  return msg;
}

function formatPayment(bill, date) {
  const paid = bill.participants.filter(p => p.hasPaid);
  const pending = bill.participants.filter(p => !p.hasPaid);
  const received = paid.reduce((sum, p) => sum + (p.amountOwed || 0), 0);

  let msg = `🧾 *${sanitizeForTelegram(bill.restaurantName)}*\n`;
  msg += `📅 ${date}\n`;
  msg += `🔒 *Split Calculated\\!*\n\n`;
  msg += `💰 Expected Amount: $${tgMoney(bill.total)}\n`;
  msg += `✅ Amount Received: $${tgMoney(received)}\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n\n`;

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

// --- KEYBOARDS (COMPRESSED DATA) ---

function createInlineKeyboard(bill) {
  if (bill.phase === 'payment') {
    return {
      inline_keyboard: bill.participants
        .filter(p => !p.hasPaid)
        .map(p => [{
          text: `${p.telegramUsername} - $${p.amountOwed.toFixed(2)} → Mark Paid`,
          // ⚡ 'p' = paid, separated by ':'
          callback_data: `p:${bill.id}:${p.telegramUserId}`
        }])
    };
  }

  // Selection Keyboard. NOTE: an inline message has ONE keyboard shared by
  // every viewer, so buttons can't show per-user checkmarks - they show how
  // many people claimed each dish instead. Per-person selections live in the
  // message text. Buttons are numbered to match the dish list, so duplicate
  // dish names stay distinguishable.
  const rows = [];

  const claimCount = (dishId) =>
    bill.participants?.filter(p => p.selectedDishIds.includes(dishId)).length || 0;

  const buttonFor = (dish, index) => {
    const count = claimCount(dish.id);
    return {
      text: `${index + 1}. ${dish.name}${count > 0 ? ` (${count}👤)` : ''}`,
      // ⚡ 's' = select, using INDEX instead of long ID
      callback_data: `s:${bill.id}:${index}`,
    };
  };

  for (let i = 0; i < bill.dishes.length; i += 2) {
    const row = [buttonFor(bill.dishes[i], i)];
    if (bill.dishes[i + 1]) {
      row.push(buttonFor(bill.dishes[i + 1], i + 1));
    }
    rows.push(row);
  }

  if (bill.participants?.length) {
    // ⚡ 'l' = lock
    rows.push([{ text: '🔒 Lock & Calculate Split', callback_data: `l:${bill.id}` }]);
  }

  return { inline_keyboard: rows };
}