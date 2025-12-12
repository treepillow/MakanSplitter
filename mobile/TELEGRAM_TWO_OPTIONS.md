# Two Ways to Send Bills to Telegram

Now you have **two options** when sharing bills to Telegram!

## Option 1: Quick Share (Recommended for Most Users)

**What it is:** Opens Telegram's native share dialog

**How it works:**
1. Tap "📤 Share to Telegram"
2. Choose "Quick Share (No buttons)"
3. Telegram opens → pick any chat/group
4. Bill is sent as plain text

**Pros:**
- ✅ Super easy (2 seconds)
- ✅ No setup required
- ✅ Works instantly
- ✅ Can share to any chat/group

**Cons:**
- ❌ No interactive buttons
- ❌ People can't click to mark as paid
- ❌ Static text only

**Best for:** Quick splits, casual use, first-time users

---

## Option 2: Via Bot (For Interactive Buttons)

**What it is:** Sends via your Telegram bot with clickable buttons

**How it works:**
1. Tap "📤 Share to Telegram"
2. Choose "Via Bot (Interactive buttons)"
3. Enter your group Chat ID
4. Bot posts message with "Paid" buttons
5. People click buttons → message updates automatically

**Pros:**
- ✅ Interactive "Paid" buttons
- ✅ Real-time updates when clicked
- ✅ Automatic status tracking
- ✅ More professional

**Cons:**
- ❌ Requires bot setup
- ❌ Requires webhook deployment
- ❌ Need to get Chat ID first
- ❌ More technical

**Best for:** Regular groups, power users, automated tracking

---

## Comparison Table

| Feature | Quick Share | Via Bot |
|---------|-------------|---------|
| Setup time | 0 seconds | 30+ minutes |
| Technical knowledge | None | Moderate |
| Interactive buttons | ❌ No | ✅ Yes |
| Auto-updates | ❌ No | ✅ Yes |
| Choose chat on-the-fly | ✅ Yes | ❌ No (need Chat ID) |
| Works offline | ✅ Yes | ❌ No (needs webhook) |

---

## Which Should You Use?

### Use **Quick Share** if:
- You just want to send the bill quickly
- You don't need interactive buttons
- You're sharing to different groups each time
- You don't want to deal with setup

### Use **Via Bot** if:
- You have a regular group that splits bills often
- You want interactive "Paid" buttons
- You're okay with technical setup
- You want automatic tracking

---

## How to Get Interactive Buttons (Via Bot)

If you want to use Option 2, you need to:

### 1. Create a Bot
```
1. Message @BotFather on Telegram
2. Send /newbot
3. Follow prompts to create bot
4. Save the bot token
```

### 2. Add Bot to Your Group
```
1. Create a Telegram group with friends
2. Add your bot to the group
3. Send a message in the group
```

### 3. Get Group Chat ID
```
1. Visit: https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
2. Look for your group's message
3. Copy the "chat" → "id" (negative number like -1001234...)
```

### 4. Deploy Webhook (Optional)
For the buttons to actually work, you need a webhook backend.

See [WEBHOOK_EXAMPLE.md](WEBHOOK_EXAMPLE.md) for details.

**Without webhook:** Buttons appear but don't do anything when clicked
**With webhook:** Buttons update the message in real-time

---

## Example: What You See

### Quick Share (Text Only)
```
🧾 Bill Split Summary

📅 Date: 12 Dec 2025
👤 Paid by: You
💰 Total: $120.00

━━━━━━━━━━━━━━━━━━

⏳ NOT YET PAID (3)
   Alice - $30.00
   Bob - $40.00
   Charlie - $50.00
```

### Via Bot (With Buttons)
```
🧾 Bill Split Summary

📅 Date: 12 Dec 2025
👤 Paid by: You
💰 Total: $120.00

━━━━━━━━━━━━━━━━━━

⏳ NOT YET PAID (3)
   Alice - $30.00
   Bob - $40.00
   Charlie - $50.00

[✅ Alice - $30.00]  ← Clickable button
[✅ Bob - $40.00]    ← Clickable button
[✅ Charlie - $50.00] ← Clickable button
```

When someone clicks their button:
- Message updates automatically
- They move from "NOT YET PAID" to "PAID ✓"
- Everyone sees the update

---

## My Recommendation

**Start with Quick Share!**

It's simple and works great for most people. If you later decide you want interactive buttons, you can set up the bot then.

90% of users will be happy with Quick Share.
Only power users need Via Bot.

---

## FAQ

**Q: Can I use both options?**
A: Yes! Use Quick Share most of the time, and Via Bot when you need buttons.

**Q: Do the buttons work without a webhook?**
A: No. Buttons appear but won't do anything. You need a webhook backend.

**Q: Is the webhook hard to set up?**
A: It requires deploying to Vercel/Railway and understanding APIs. Not beginner-friendly.

**Q: Can I switch between options?**
A: Yes! Each time you share, you choose which method to use.

**Q: Which is faster?**
A: Quick Share is much faster (2 seconds vs 5+ minutes for first-time bot setup).
