// Telegram Bot Configuration
// To use this feature:
// 1. Create a bot with @BotFather on Telegram
// 2. Get your bot token
// 3. Add it here (or use environment variables for production)

export const TELEGRAM_CONFIG = {
  // Replace with your bot token from @BotFather
  BOT_TOKEN: '8599382698:AAFUyqeSeuI8062hjMhhBBWAoeMa0zucKIw',

  // Your bot username (without @)
  BOT_USERNAME: 'MakanSplitterBot',

  // Your webhook URL (will be set up with Vercel)
  WEBHOOK_URL: '',

  // API Base URL
  API_URL: 'https://api.telegram.org',
};

// Helper to check if Telegram is configured
export function isTelegramConfigured(): boolean {
  return TELEGRAM_CONFIG.BOT_TOKEN.length > 0;
}

// Get bot API URL
export function getBotApiUrl(): string {
  return `${TELEGRAM_CONFIG.API_URL}/bot${TELEGRAM_CONFIG.BOT_TOKEN}`;
}
