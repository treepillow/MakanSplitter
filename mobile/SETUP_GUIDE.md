# MakanSplit - Quick Setup Guide

## What You Have Now ✅

A fully functional bill splitting app with:
- ✅ Complete user interface (5 screens)
- ✅ Smart calculation engine
- ✅ Payment tracking
- ✅ Share to Telegram/WhatsApp
- ✅ Local storage (bills saved on device)
- ✅ TypeScript for reliability
- ✅ iOS-optimized design

## Next Steps to Test

### Option 1: Test on iOS Simulator (Mac Only)

1. Open Terminal in this folder
2. Run:
   ```bash
   npx expo start
   ```
3. Press `i` to open iOS Simulator
4. The app will load automatically

### Option 2: Test on Your iPhone

1. Install "Expo Go" from the App Store
2. Run in Terminal:
   ```bash
   npx expo start
   ```
3. Scan the QR code with your iPhone camera
4. The app will open in Expo Go

### Option 3: Test on Android

1. Install "Expo Go" from Google Play Store
2. Run in Terminal:
   ```bash
   npx expo start
   ```
3. Scan the QR code with Expo Go app
4. The app will load

## Quick Test Flow

Try this to test all features:

1. **Create a test bill:**
   - Restaurant: "Test Restaurant"
   - Paid by: "Me"
   - GST: 9%, Service: 10%

2. **Add people:**
   - Add: "Alice"
   - Add: "Bob"
   - Add: "Charlie"

3. **Add dishes:**
   - "Fried Rice" - $10 - Shared by: Alice, Bob
   - "Noodles" - $8 - Shared by: Charlie
   - "Soup" - $6 - Shared by: Alice, Bob, Charlie

4. **Review summary:**
   - Check calculations
   - Copy for Telegram
   - Save bill

5. **Track payments:**
   - Open the saved bill
   - Tap on names to mark as paid
   - See the progress update

## Publishing Checklist

Before publishing to App Store:

### 1. App Icon & Splash Screen
```bash
# Add your app icon (1024x1024 PNG)
# Place in: assets/images/icon.png

# Add splash screen (1284x2778 PNG)
# Place in: assets/images/splash.png
```

### 2. Update App Metadata

Edit `app.json`:
```json
{
  "expo": {
    "name": "MakanSplit",
    "slug": "makansplit",
    "version": "1.0.0",
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/splash.png",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.makansplit",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.makansplit",
      "versionCode": 1
    }
  }
}
```

### 3. Set Up Apple Developer Account
- Go to: https://developer.apple.com
- Enroll in Apple Developer Program ($99/year)
- Create App ID: com.yourcompany.makansplit

### 4. Build for Production

For iOS:
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios
```

### 5. Submit to App Store
1. Download .ipa file from EAS dashboard
2. Upload to App Store Connect
3. Fill in app details:
   - Screenshots (from simulator)
   - Description
   - Keywords: "bill splitting, restaurant, singapore, paynow"
   - Category: Finance or Lifestyle
   - Privacy Policy URL
4. Submit for review

## App Store Description Template

```
MakanSplit - Split Restaurant Bills the Smart Way 🍽️

Tired of complicated math when splitting restaurant bills? MakanSplit makes it easy to split bills fairly, especially when some people didn't eat certain dishes!

PERFECT FOR SINGAPORE:
✓ Built-in GST (9%) and Service Charge (10%) support
✓ Share via Telegram or WhatsApp
✓ PayNow-ready breakdown

KEY FEATURES:
• Smart Dish Assignment - Mark who ate what
• Fair Splitting - Each person pays only for what they ate
• Automatic Calculations - GST and service charge handled correctly
• Payment Tracking - Know who has paid and who hasn't
• Bill History - Keep track of all your meals
• Easy Sharing - Copy and paste into any messaging app

HOW IT WORKS:
1. Enter restaurant name and charges
2. Add everyone who ate
3. Add each dish and select who shared it
4. Get instant breakdown
5. Share with everyone
6. Track payments as they come in

No more awkward math at the table!
No more "just split equally" when it's not fair!
No more forgetting who owes what!

Download MakanSplit today and make bill splitting stress-free! 🎉
```

## Estimated Timeline

- **Design icon & splash:** 2-3 hours
- **Test thoroughly:** 1-2 days
- **Apple account setup:** 1 day
- **Build & upload:** 2-3 hours
- **App Store review:** 1-3 days
- **Total:** ~1 week

## Common Issues & Solutions

**Issue:** App crashes on startup
**Solution:** Check console for errors, ensure all dependencies installed

**Issue:** AsyncStorage not working
**Solution:** Clear app data, reinstall

**Issue:** Clipboard not working
**Solution:** Test on real device (not all features work in simulator)

**Issue:** Build fails
**Solution:** Run `npx expo doctor` to check for issues

## Cost Breakdown

- **Development:** FREE (done!)
- **Apple Developer:** $99/year
- **Expo EAS Build:** FREE tier available (2 builds/month)
- **Total to publish:** $99

## Support

If you encounter any issues:
1. Check the console for error messages
2. Try `npx expo start --clear`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Check Expo documentation: https://docs.expo.dev

## What's Next?

Once the app is live, consider:
1. **Marketing:** Share on social media, Reddit r/singapore
2. **Feedback:** Listen to user suggestions
3. **Updates:** Add new features based on feedback
4. **Analytics:** Add tracking to see usage patterns

Good luck with your app! 🚀
