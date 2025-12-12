# MakanSplit Telegram Webhook

This is the webhook server for MakanSplit's Telegram bot integration.

## Deployment to Vercel

### Option 1: Using Vercel CLI (if it works)
```bash
cd /Users/aaron/Desktop/makansplit-webhook
vercel login
vercel deploy
```

### Option 2: Using Vercel Web Dashboard (Recommended)
1. Go to https://vercel.com and sign up/login
2. Click "Add New..." → "Project"
3. Import this repository or drag and drop the folder
4. Vercel will auto-detect the configuration from `vercel.json`
5. Before deploying, add these Environment Variables:
   - `FIREBASE_PROJECT_ID` = `makansplitter`
   - `FIREBASE_CLIENT_EMAIL` = Your Firebase service account email
   - `FIREBASE_PRIVATE_KEY` = Your Firebase private key (keep the \n characters)
   - `TELEGRAM_BOT_TOKEN` = Your bot token from @BotFather
6. Click "Deploy"

## Getting Firebase Credentials

⚠️ **IMPORTANT: Never commit these credentials to GitHub!**

1. Go to Firebase Console: https://console.firebase.google.com/project/YOUR_PROJECT_ID/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Download the JSON file (keep it safe and secure!)
4. Extract these values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (paste the entire key including `-----BEGIN PRIVATE KEY-----`)

These values should ONLY be stored in Vercel's environment variables, never in your code!

## Setting Webhook URL

After deploying, you'll get a URL like: `https://your-project.vercel.app`

Set it as your Telegram webhook:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-project.vercel.app/api/webhook"}'
```

## Testing

Send a test request:
```bash
curl -X POST "https://your-project.vercel.app/api/webhook" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## Webhook Functionality

- **Inline Queries**: When users type `@makansplit_bot <bill_id>` in Telegram
- **Callback Queries**: When users click "Paid" buttons in messages
- **Firebase Integration**: Reads and updates bill data in Firestore
