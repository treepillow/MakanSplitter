# Telegram Inline Mode - The Right Solution!

## What is Inline Mode?

Inline mode lets users type `@your_bot` in ANY chat and share interactive messages with buttons. The buttons work because it's a fresh message from the bot, not a forward.

## Examples of Bots Using This:
- @gif - Search and share GIFs with buttons
- @vote - Create polls with voting buttons
- @music - Share songs with play buttons

## How It Will Work for MakanSplit:

### User Experience:
1. User creates bill in MakanSplit app
2. Taps "📤 Share to Telegram"
3. Telegram opens with: `@makansplit_bot bill_abc123`
4. Bot shows the bill preview as an inline result
5. User taps the result
6. Picks which chat/group to send to
7. Bill posted with interactive "Paid" buttons!
8. Everyone in the group can click buttons
9. Message updates in real-time

### Benefits:
✅ No Chat ID needed
✅ User picks group dynamically
✅ Interactive buttons work
✅ Real-time updates
✅ Professional UX

## Setup Steps

### Step 1: Enable Inline Mode on Your Bot

1. Open Telegram and message @BotFather
2. Send `/setinline`
3. Select your bot (@makansplit_bot)
4. Enter a placeholder text like: "Search bills..."
5. Done! Inline mode is now enabled

### Step 2: Deploy Backend to Handle Inline Queries

You need a backend (webhook) to:
1. Receive inline query requests from Telegram
2. Look up the bill by ID
3. Return the formatted bill as an inline result
4. Handle button callbacks (when users click "Paid")

### Step 3: Update the App

The app will:
1. Generate a deep link: `https://t.me/makansplit_bot?start=inline-<bill_id>`
2. Or directly open: `tg://resolve?domain=makansplit_bot&start=<bill_id>`
3. User types the bot username and bill ID shows as result

## Backend Implementation

Here's what your webhook needs to handle:

### 1. Inline Query Handler

```javascript
// api/telegram-webhook.js

export default async function handler(req, res) {
  const update = req.body;

  // Handle inline queries (when user types @bot in chat)
  if (update.inline_query) {
    const query = update.inline_query.query; // e.g., "bill_abc123"
    const billId = query.trim();

    // Fetch bill data from your storage (you'll need to implement this)
    const bill = await getBillById(billId);

    if (!bill) {
      // No results
      await fetch(`${TELEGRAM_API}/answerInlineQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inline_query_id: update.inline_query.id,
          results: [],
          cache_time: 0,
        }),
      });
      return res.status(200).json({ ok: true });
    }

    // Format the bill message
    const message = formatBillMessage(bill);

    // Create inline keyboard with "Paid" buttons
    const keyboard = {
      inline_keyboard: bill.people
        .filter(p => !p.hasPaid)
        .map(person => [{
          text: `✅ ${person.name} - $${person.amountOwed.toFixed(2)}`,
          callback_data: `paid_${bill.id}_${person.id}`,
        }]),
    };

    // Return inline result
    await fetch(`${TELEGRAM_API}/answerInlineQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inline_query_id: update.inline_query.id,
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

    return res.status(200).json({ ok: true });
  }

  // Handle callback queries (button clicks)
  if (update.callback_query) {
    // ... handle button clicks (same as before)
  }

  res.status(200).json({ ok: true });
}

// Helper function to get bill by ID
async function getBillById(billId) {
  // You need to implement bill storage
  // Options:
  // 1. Firebase Realtime Database
  // 2. Supabase
  // 3. PostgreSQL
  // 4. MongoDB
  // 5. In-memory cache (for testing only)

  // For now, return null
  return null;
}

function formatBillMessage(bill) {
  // Same formatting as before
  // ...
}
```

## The Storage Challenge

The **key challenge** is: Where do you store the bills so the backend can access them?

### Option 1: Firebase (Recommended)
- Easy to set up
- Real-time sync
- Free tier is generous
- Works with both mobile app and backend

### Option 2: API Endpoint
- Your app sends bill data to your backend
- Backend stores it temporarily (in-memory or Redis)
- Inline query fetches from there

### Option 3: Encode Bill in Query (Hacky but works)
- Encode entire bill in the query string
- No storage needed
- Limited by URL length (~2KB max)

## Complete Flow with Storage

### 1. User Creates Bill in App
```typescript
// app creates bill
const bill = {
  id: 'bill_abc123',
  restaurantName: 'Dinner',
  total: 120,
  people: [...],
};

// Save to Firebase
await saveBillToFirebase(bill);

// Generate share link
const shareUrl = `https://t.me/makansplit_bot?startinline=${bill.id}`;
```

### 2. User Taps Share Link
- Opens Telegram
- Shows `@makansplit_bot bill_abc123` in the input
- Bot searches Firebase for bill_abc123
- Returns it as inline result

### 3. User Shares to Group
- Picks a group
- Bill posted with buttons
- Webhook handles button clicks
- Updates Firebase
- Updates message

## Simplified Alternative: URL-Encoded Bill

If you don't want to set up Firebase, encode the bill in the URL:

```typescript
// Encode bill as base64
const billData = JSON.stringify(bill);
const encoded = Buffer.from(billData).toString('base64');

// Create inline query (limited to ~2KB)
const shareUrl = `https://t.me/makansplit_bot?startinline=${encoded}`;
```

In webhook:
```javascript
const encoded = update.inline_query.query;
const billData = Buffer.from(encoded, 'base64').toString();
const bill = JSON.parse(billData);
```

**Pros:** No database needed
**Cons:** URL length limit, not ideal for large bills

## Next Steps

1. **Enable inline mode** on your bot (takes 30 seconds)
2. **Choose storage solution** (Firebase recommended)
3. **Deploy webhook** with inline query handler
4. **Update app** to use inline mode

## Testing

Once set up, test by:
1. Open any Telegram chat
2. Type: `@makansplit_bot bill_abc123`
3. You should see the bill as a result
4. Tap it → bill posted with buttons!

## Is It Worth It?

**Pros:**
✅ No Chat ID needed
✅ Professional UX
✅ Interactive buttons work
✅ Shareable like other popular bots

**Cons:**
❌ Requires backend setup
❌ Requires bill storage (Firebase/Supabase)
❌ More complex than simple text sharing

**My recommendation:** Start with simple text sharing (no buttons). Add inline mode later if users demand it.
