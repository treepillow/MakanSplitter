# Using Telegram Groups for MakanSplit

## Why Groups Are Better Than Private Chats

When you send a bill to a **Telegram group** instead of private chats:

✅ **One message, everyone sees it** - No need to send to multiple people
✅ **Real-time updates** - When someone clicks "Paid", everyone sees it instantly
✅ **More social** - People can discuss, remind each other, chat about the meal
✅ **Easy setup** - Only need one Chat ID for the whole group
✅ **Perfect for friend groups** - Your regular dinner gang can have a dedicated bill channel

## Quick Setup Guide

### 1. Create a Telegram Group (5 seconds)
```
Telegram → New Group → Add your friends → Name it "Makan Bills"
```

### 2. Add Your Bot (10 seconds)
```
Group → Add Member → Search for your bot → Add
```

### 3. Get the Group Chat ID (30 seconds)

**Step 1:** Send any message in the group (e.g., "test")

**Step 2:** Open this URL in your browser:
```
https://api.telegram.org/bot8599382698:AAFUyqeSeuI8062hjMhhBBWAoeMa0zucKIw/getUpdates
```
*(Replace with your bot token if different)*

**Step 3:** Look for something like this in the response:
```json
{
  "chat": {
    "id": -1001234567890,
    "title": "Makan Bills",
    "type": "group"
  }
}
```

**Step 4:** Copy that negative number (e.g., `-1001234567890`)

### 4. Use in MakanSplit

1. Create a bill in the app
2. Go to bill details
3. Tap "📤 Send to Telegram"
4. Enter your group Chat ID (the negative number from step 3)
5. Done! Everyone in the group sees the bill with "Paid" buttons

## Example Use Case

**The Gang:** You, Alice, Bob, Charlie go for dinner

**Before:**
- You pay the bill
- Create WhatsApp message asking everyone for money
- Chase people individually
- No clear tracking of who paid

**After (with Telegram group):**
1. You create the bill in MakanSplit
2. Send to "Makan Gang" Telegram group
3. Everyone sees:
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

   [✅ Alice - $30.00]  <- Everyone sees these buttons
   [✅ Bob - $40.00]
   [✅ Charlie - $50.00]
   ```

4. Alice clicks her button → Message updates to:
   ```
   ✅ PAID (1)
      Alice - $30.00 ✓

   ⏳ NOT YET PAID (2)
      Bob - $40.00
      Charlie - $50.00
   ```

5. Everyone in the group sees Alice paid
6. Bob and Charlie can't pretend they didn't see it 😄

## Pro Tips

🎯 **One group, all bills** - Use the same group for all your dinner bills. Build a history!

💬 **Group chat doubles as reminder** - Just @ someone in the chat if they haven't paid

📊 **Everyone stays accountable** - Public visibility = faster payments

🔒 **Privacy note** - Everyone in the group can see who owes what. Don't add random people!

## Comparison: Groups vs Private Chats

| Feature | Private Chat | Group Chat |
|---------|--------------|------------|
| Setup | Everyone needs to start chat with bot | Add bot once, done |
| Updates | Each person sees their own message | Everyone sees one shared message |
| Social | Isolated, 1-on-1 | Collaborative, group discussion |
| Accountability | Private | Public (within group) |
| Best for | Personal tracking | Friend groups, regular splitting |

## Troubleshooting

**"Chat not found" error?**
- Make sure you sent a message in the group first
- Check you're using the correct negative number
- Verify the bot is still in the group

**Bot doesn't have permission to send?**
- In group settings, make sure members can send messages
- Make the bot an admin if needed (not required usually)

**Can't find the group in getUpdates?**
- Send a fresh message in the group
- Refresh the getUpdates URL
- Make sure you used the correct bot token

## Next Steps

Once you have your group Chat ID, you can:
1. Save it somewhere for future use
2. Use the same Chat ID for all bills
3. No need to look it up again!

For webhook setup (to make the "Paid" buttons actually work), see [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md).
