# Telegram Bot Setup Guide

This guide will help you set up the Telegram bot integration for MakanSplit, allowing you to send bills to Telegram with interactive "Paid" buttons.

## Step 1: Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow the prompts to:
   - Choose a name for your bot (e.g., "MakanSplit Helper")
   - Choose a username (must end in "bot", e.g., "makansplit_bot")
4. **Save the bot token** you receive (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Step 2: Get Your Chat ID

### Option A: Group Chat (Recommended for Bill Splitting!)

**Why use a group?** Everyone sees the same bill, and when someone clicks "Paid", everyone sees the update in real-time! Perfect for splitting with friends.

1. **Create a Telegram group:**
   - Tap "New Group" in Telegram
   - Add your friends who will split the bill
   - Name it something like "Dinner Bills" or "Makan Gang"

2. **Add your bot to the group:**
   - In the group, tap the group name at the top
   - Tap "Add Member"
   - Search for your bot (the username you created)
   - Add it to the group

3. **Get the group Chat ID:**
   - Send a message in the group (anything, like "Hello bot")
   - Open this URL in your browser (replace YOUR_BOT_TOKEN):
     ```
     https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
     ```
   - Look for your group's message in the JSON response
   - Find the "chat" object and copy the "id" (will be negative, like `-1001234567890`)
   - **This is your Group Chat ID!**

### Option B: Private Chat (For personal use only)

1. Send a message to your bot (anything, like "Hello")
2. Search for [@userinfobot](https://t.me/userinfobot) on Telegram
3. Send `/start` to @userinfobot
4. **Save your Chat ID** (a number like: `123456789`)

## Step 3: Configure the App

1. Open `config/telegram.ts`
2. Add your bot token:
   ```typescript
   export const TELEGRAM_CONFIG = {
     BOT_TOKEN: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz', // Your bot token here
     WEBHOOK_URL: '', // Will be set up later
     API_URL: 'https://api.telegram.org',
   };
   ```

## Step 4: Test Sending a Bill

1. Create a bill in the app
2. Go to the bill details screen
3. Tap "📤 Send to Telegram"
4. Enter your Chat ID
5. Check Telegram - you should see your bill with "Paid" buttons!

## Step 5: Set Up Webhook (For Interactive Buttons)

To make the "Paid" buttons work, you need to deploy a webhook:

### Option A: Deploy to Vercel (Recommended - Free)

1. **Create a GitHub repo** for the webhook:
   ```bash
   cd ~/Desktop
   mkdir makansplit-webhook
   cd makansplit-webhook
   git init
   ```

2. **Create the webhook file** `api/telegram-webhook.js`:
   ```javascript
   // See WEBHOOK_EXAMPLE.md for the full code
   ```

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial webhook"
   git remote add origin https://github.com/YOUR_USERNAME/makansplit-webhook.git
   git push -u origin main
   ```

4. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Select your `makansplit-webhook` repo
   - Click "Deploy"
   - Copy your webhook URL (e.g., `https://your-app.vercel.app/api/telegram-webhook`)

5. **Set webhook URL in Telegram:**
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.vercel.app/api/telegram-webhook"}'
   ```

6. **Update your app config:**
   In `config/telegram.ts`:
   ```typescript
   WEBHOOK_URL: 'https://your-app.vercel.app/api/telegram-webhook',
   ```

### Option B: Use a Different Service

You can also use:
- Railway.app (free tier)
- Render.com (free tier)
- Heroku (paid)

The webhook code is the same, just deploy it to your chosen platform.

## How It Works

1. **You send a bill** from the app → Telegram bot posts a message with "Paid" buttons
2. **Someone clicks a button** → Telegram sends a webhook to your server
3. **Webhook updates the message** → Removes person from "Not Paid" list, adds to "Paid ✓" list
4. **Everyone sees the update** in real-time!

## Troubleshooting

### "Bot token not configured"
- Make sure you added your bot token to `config/telegram.ts`

### "Failed to send message"
- Check that your bot token is correct
- Make sure your Chat ID is correct
- Verify the bot isn't blocked

### Buttons don't work
- Make sure you've set up the webhook
- Verify the webhook URL is correct in Telegram
- Check webhook logs on Vercel/Railway

### "Unauthorized" error
- Your bot token is incorrect
- Try creating a new bot with @BotFather

## Security Notes

- **Never commit your bot token to GitHub!** Use environment variables in production
- The webhook should validate requests are from Telegram
- Store webhook URL in environment variables

## Support

For issues or questions, refer to:
- [Telegram Bot API Docs](https://core.telegram.org/bots/api)
- [Vercel Docs](https://vercel.com/docs)
