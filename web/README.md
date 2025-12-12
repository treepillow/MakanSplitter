# MakanSplit Web

A modern web application for splitting bills with friends using Telegram bot integration.

## Features

- 🍽️ **Bill Creation** - Create bills with dish-by-dish breakdown
- 📷 **OCR Receipt Scanning** - Upload receipt images and automatically extract dishes
- 📱 **Telegram Integration** - Share bills via Telegram with interactive buttons
- 🎯 **Two-Phase Splitting**:
  - Phase 1: Friends select which dishes they ate via Telegram
  - Phase 2: Lock & calculate amounts, then mark as paid
- 💰 **Smart Calculations** - Automatic GST and service charge calculations
- 🔥 **Real-time Updates** - See selections and payments update live

## Quick Start

```bash
cd makansplit-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Create Bill** → Enter restaurant info and add dishes (or upload receipt)
2. **Save & Share** → Get a bill ID to share on Telegram
3. **Telegram Sharing** → Type `@MakanSplitterBot [bill ID]` in any chat
4. **Friends Select** → Everyone taps dishes they ate
5. **Lock & Calculate** → Split calculated automatically
6. **Mark Paid** → Track who has paid

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS v4
- Firebase Firestore
- Tesseract.js (OCR)
- Telegram Bot API

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## License

MIT
