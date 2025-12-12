# Telegram Webhook Example

This is the webhook code that handles button clicks from Telegram. Deploy this to Vercel, Railway, or any serverless platform.

## Complete Webhook Code

Create a file `api/telegram-webhook.js`:

```javascript
// api/telegram-webhook.js
// Vercel serverless function to handle Telegram webhook callbacks

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    console.log('Received update:', JSON.stringify(update, null, 2));

    // Handle callback query (button press)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;
      const data = callbackQuery.data; // Format: "paid_billId_personId"

      // Parse callback data
      const [action, billId, personId] = data.split('_');

      if (action === 'paid') {
        // Get current message
        const currentMessage = callbackQuery.message.text;

        // Find the person's line in the message
        const lines = currentMessage.split('\n');
        let personLine = '';
        let personName = '';

        // Find and extract person info
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(personId) || lines[i].includes('$')) {
            // This is a simplified version - you'll need to parse based on your message format
            personLine = lines[i];
            // Extract name (before the dollar sign)
            const match = personLine.match(/\s+([^-]+)-/);
            if (match) {
              personName = match[1].trim();
            }
            break;
          }
        }

        // Update message: move person from "NOT YET PAID" to "PAID"
        let updatedMessage = currentMessage;

        // Remove from unpaid section
        const unpaidSection = updatedMessage.match(/⏳ \*NOT YET PAID[^]*?(?=\n━|$)/);
        if (unpaidSection) {
          const unpaidText = unpaidSection[0];
          const updatedUnpaid = unpaidText.split('\n').filter(line => {
            return !line.includes(personLine.trim());
          }).join('\n');
          updatedMessage = updatedMessage.replace(unpaidSection[0], updatedUnpaid);
        }

        // Add to paid section
        const paidSection = updatedMessage.match(/✅ \*PAID \(\d+\)\*\n([^]*?)(?=\n\n|$)/);
        if (paidSection) {
          // Increment count
          updatedMessage = updatedMessage.replace(/✅ \*PAID \((\d+)\)\*/, (match, count) => {
            return `✅ *PAID (${parseInt(count) + 1})*`;
          });

          // Add person to paid list
          const insertPosition = updatedMessage.indexOf(paidSection[0]) + paidSection[0].length;
          const paidLine = `   ${personName} - ${personLine.match(/\$[\d.]+/)[0]} ✓\n`;
          updatedMessage = updatedMessage.slice(0, insertPosition) + paidLine + updatedMessage.slice(insertPosition);
        } else {
          // No paid section yet, create one
          const unpaidPos = updatedMessage.indexOf('⏳ *NOT YET PAID');
          const paidLine = `\n✅ *PAID (1)*\n   ${personName} - ${personLine.match(/\$[\d.]+/)[0]} ✓\n`;
          updatedMessage = updatedMessage.slice(0, unpaidPos) + paidLine + updatedMessage.slice(unpaidPos);
        }

        // Update unpaid count
        const unpaidCount = (updatedMessage.match(/⏳ \*NOT YET PAID \((\d+)\)\*/)?.[1] || 0);
        updatedMessage = updatedMessage.replace(/⏳ \*NOT YET PAID \((\d+)\)\*/, (match, count) => {
          return `⏳ *NOT YET PAID (${parseInt(count) - 1})*`;
        });

        // Send updated message
        await fetch(`${TELEGRAM_API}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: updatedMessage,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: extractRemainingButtons(updatedMessage, billId),
            },
          }),
        });

        // Answer callback query (removes loading animation)
        await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: `✅ ${personName} marked as paid!`,
            show_alert: false,
          }),
        });
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
}

// Helper function to extract remaining unpaid people and create buttons
function extractRemainingButtons(message, billId) {
  const buttons = [];
  const unpaidSection = message.match(/⏳ \*NOT YET PAID[^]*?(?=\n━|$)/);

  if (unpaidSection) {
    const lines = unpaidSection[0].split('\n');
    lines.forEach(line => {
      if (line.includes('$')) {
        // Extract person name and amount
        const match = line.match(/\s+([^-]+)-\s+(\$[\d.]+)/);
        if (match) {
          const name = match[1].trim();
          const amount = match[2];
          // Generate personId from name (you may want a better ID system)
          const personId = name.toLowerCase().replace(/\s+/g, '_');

          buttons.push([{
            text: `✅ ${name} - ${amount}`,
            callback_data: `paid_${billId}_${personId}`,
          }]);
        }
      }
    });
  }

  return buttons;
}
```

## Environment Variables

In Vercel, set:
- `TELEGRAM_BOT_TOKEN` = your bot token from @BotFather

## Deployment

1. Create a new directory:
   ```bash
   mkdir makansplit-webhook
   cd makansplit-webhook
   ```

2. Create `api/telegram-webhook.js` with the code above

3. Create `package.json`:
   ```json
   {
     "name": "makansplit-webhook",
     "version": "1.0.0",
     "description": "Telegram webhook for MakanSplit",
     "main": "api/telegram-webhook.js"
   }
   ```

4. Deploy to Vercel:
   ```bash
   vercel
   ```

## Testing

Send a test request:
```bash
curl -X POST https://your-app.vercel.app/api/telegram-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "callback_query": {
      "id": "test123",
      "from": {"id": 12345},
      "message": {
        "chat": {"id": 12345},
        "message_id": 1,
        "text": "Test message"
      },
      "data": "paid_bill123_person456"
    }
  }'
```

## Note

This is a simplified webhook. For production, you should:
1. Store bill data in a database (Firebase, Supabase, etc.)
2. Validate webhook requests are from Telegram
3. Use proper person IDs instead of parsing names
4. Add error handling and logging
5. Use environment variables for sensitive data
