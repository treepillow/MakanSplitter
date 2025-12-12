# 🤖 Receipt OCR Setup Guide

MakanSplit uses **Hugging Face's FREE API** for receipt scanning. No credit card required!

## ✅ Step 1: Get Your FREE API Key

1. Go to [huggingface.co](https://huggingface.co/)
2. Click "Sign Up" (use email/GitHub/Google)
3. Once logged in, go to **Settings** → **Access Tokens**
4. Click **"New token"**
   - Name: `MakanSplit OCR`
   - Role: Select **"Read"** (that's all you need!)
5. Click **"Generate token"**
6. **Copy the token** (starts with `hf_...`)

## ✅ Step 2: Add Token to Your App

1. Open `config/ocr.ts` in your project
2. Replace `'YOUR_HF_TOKEN_HERE'` with your actual token:
   ```typescript
   HUGGING_FACE_API_KEY: 'hf_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
   ```
3. Change `ENABLED: false` to `ENABLED: true`:
   ```typescript
   ENABLED: true,
   ```
4. Save the file

## ✅ Step 3: Test It!

1. Run your app: `npx expo start`
2. Go to **Add Dishes** screen
3. Tap **📸 Scan Receipt**
4. Take a photo of a receipt
5. Tap **🤖 Scan Receipt**
6. Watch the AI detect dishes!

## 🎉 What You Get for FREE

- **30,000 scans per month** (that's ~1,000 per day!)
- Automatic dish name detection
- Automatic price extraction
- No credit card required
- No time limit

## 🔧 How It Works

1. You take a photo of a receipt
2. Image is sent to Hugging Face's TrOCR model
3. AI extracts text from the image
4. Our parser finds dish names and prices
5. Dishes are added to your bill automatically

## 📊 Accuracy Tips

For best results:
- ✅ Good lighting
- ✅ Receipt laid flat
- ✅ All text visible
- ✅ Camera focused
- ❌ Avoid shadows/glare
- ❌ Avoid wrinkled receipts

## 🆘 Troubleshooting

**"Setup Required" alert?**
- Make sure you added your token to `config/ocr.ts`
- Make sure `ENABLED: true` is set

**"Scan Failed" error?**
- Check your internet connection
- Make sure token is valid (copy it again from Hugging Face)
- You might have hit the rate limit (wait a minute and try again)

**"No Dishes Found"?**
- Receipt might be too blurry
- Try retaking with better lighting
- Some receipt formats are harder to read

## 🚀 Advanced: Use Google Cloud Vision (Optional)

If TrOCR doesn't work well for Singapore receipts, you can switch to Google Cloud Vision:

1. Get free API key at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable Vision API
3. Uncomment the Google Vision function in `utils/receiptOCR.ts`
4. Update `config/ocr.ts` to use Google instead

Google also has a free tier: **1,000 requests/month**

## 💡 Why Free?

Hugging Face provides free inference for open-source AI models. It's their way of supporting developers and researchers. The free tier is generous and permanent!

## ⚠️ Security Note

- **Never commit your API key to git!**
- Add `config/ocr.ts` to `.gitignore` if sharing code
- The token only has READ access (can't modify your Hugging Face account)
- Tokens can be revoked anytime from Hugging Face settings

---

Happy scanning! 🍜✨
