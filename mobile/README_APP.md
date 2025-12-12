# MakanSplit - Smart Bill Splitting App 🍽️

A React Native app designed specifically for Singaporeans to easily split restaurant bills, with support for shared dishes, GST, service charges, and payment tracking.

## Features ✨

### 1. **Smart Bill Creation**
- Quick restaurant name input
- Dynamic GST and Service Charge (default 9% and 10% for Singapore)
- Track who paid the bill

### 2. **Easy People Management**
- Add all diners quickly
- No duplicate names
- Simple add/remove interface

### 3. **Flexible Dish Assignment**
- Add dishes with prices
- Assign multiple people to each dish (for shared items)
- Visual indicators for assigned/unassigned dishes
- Each person pays their fair share based on what they ate

### 4. **Automatic Calculations**
The app handles all the complex math:
- Individual dish costs split proportionally
- Service charge applied to each person's subtotal
- GST calculated on (subtotal + service charge)
- **Formula per person:**
  - Person Subtotal = Sum of (Dish Price ÷ Number of People Sharing)
  - Person Service Charge = Person Subtotal × (Service Charge % ÷ 100)
  - Person GST = (Person Subtotal + Person Service Charge) × (GST % ÷ 100)
  - **Person Total = Person Subtotal + Person Service Charge + Person GST**

### 5. **Payment Tracking**
- Mark payments as received
- Visual indicators (✅ paid, ⏳ pending)
- Real-time progress tracking
- Notification when everyone has paid

### 6. **Easy Sharing**
- Copy formatted message for Telegram (with markdown)
- Copy formatted message for WhatsApp
- Native share functionality
- Includes breakdown of what each person ate

### 7. **Bill History**
- All bills saved locally
- View past bills anytime
- See payment status
- Delete old bills

## How to Use 📱

### Creating a New Bill

1. **Step 1: Bill Details**
   - Tap "Create New Bill" on home screen
   - Enter restaurant name
   - Enter who paid the bill
   - Set GST % (default: 9%)
   - Set Service Charge % (default: 10%)
   - Tap "Continue"

2. **Step 2: Add People**
   - Type each person's name
   - Tap "Add" after each name
   - Remove anyone by tapping "Remove"
   - Tap "Continue" when done

3. **Step 3: Add Dishes**
   - Enter dish name and price
   - Tap "Add Dish"
   - A modal will open to assign people
   - Select everyone who shared that dish
   - Tap "Save"
   - Repeat for all dishes
   - Tap "Continue" when all dishes are assigned

4. **Step 4: Review & Share**
   - Review the bill summary
   - See each person's breakdown
   - Copy for Telegram/WhatsApp
   - Share via any app
   - Tap "Save Bill" to keep in history

### Tracking Payments

1. Open a saved bill from the home screen
2. Tap on any person's name to toggle paid/unpaid status
3. Get notified when everyone has paid
4. Share the bill again if needed

## Example Scenario 🍜

**Restaurant:** Paradise Dynasty
**Paid by:** John
**GST:** 9%
**Service Charge:** 10%

**People:** John, Sarah, Mike

**Dishes:**
- Xiao Long Bao ($15) - Shared by: John, Sarah, Mike
- Fried Rice ($12) - Shared by: Sarah, Mike
- Noodles ($10) - Shared by: John

**Calculations:**

**John's Bill:**
- Xiao Long Bao: $15 ÷ 3 = $5.00
- Noodles: $10 ÷ 1 = $10.00
- Subtotal: $15.00
- Service Charge (10%): $1.50
- GST (9%): $1.49
- **Total: $17.99**

**Sarah's Bill:**
- Xiao Long Bao: $15 ÷ 3 = $5.00
- Fried Rice: $12 ÷ 2 = $6.00
- Subtotal: $11.00
- Service Charge (10%): $1.10
- GST (9%): $1.09
- **Total: $13.19**

**Mike's Bill:**
- Xiao Long Bao: $15 ÷ 3 = $5.00
- Fried Rice: $12 ÷ 2 = $6.00
- Subtotal: $11.00
- Service Charge (10%): $1.10
- GST (9%): $1.09
- **Total: $13.19**

**Grand Total: $44.37**

## Running the App 🚀

### Prerequisites
- Node.js installed
- iOS Simulator (for testing on Mac)
- Expo CLI

### Start Development Server

```bash
npm install
npx expo start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

### Building for Production

For iOS:
```bash
npx expo build:ios
```

For Android:
```bash
npx expo build:android
```

## Technical Details 🛠️

### Tech Stack
- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for navigation
- **AsyncStorage** for local data persistence
- **Clipboard API** for copy functionality

### Project Structure
```
app/
├── index.tsx              # Home screen (bill list)
├── create-bill.tsx        # Step 1: Bill details
├── add-people.tsx         # Step 2: Add people
├── add-dishes.tsx         # Step 3: Add dishes
├── bill-summary.tsx       # Step 4: Review & share
├── bill/[id].tsx          # View saved bill
└── _layout.tsx            # Root layout

components/
├── Button.tsx             # Reusable button
└── Input.tsx              # Reusable input field

context/
└── BillContext.tsx        # Global state management

types/
└── bill.ts                # TypeScript types

utils/
├── billCalculator.ts      # Calculation logic
└── storage.ts             # AsyncStorage helpers
```

### Key Features Implementation

**Smart Calculation Engine:**
The app uses a sophisticated calculation system that:
1. Calculates each person's share of each dish
2. Applies service charge to individual subtotals
3. Calculates GST on (subtotal + service charge)
4. Ensures accurate penny-perfect calculations

**Offline-First:**
- All data stored locally using AsyncStorage
- No internet required
- Instant loading and saving

**User-Friendly Design:**
- Clean iOS-style interface
- Clear visual feedback
- Minimal taps required
- Smart defaults for Singapore

## Future Enhancements 💡

Potential features to add:
- [ ] QR code generation for easy sharing
- [ ] Bill splitting by percentage (for unequal splits)
- [ ] Photo upload of receipt
- [ ] OCR to scan receipt automatically
- [ ] Multiple currency support
- [ ] Tips/Rounding options
- [ ] Export to PDF
- [ ] Integration with PayNow
- [ ] Push notifications for payment reminders
- [ ] Cloud backup/sync
- [ ] Split by item quantity (e.g., someone ate 2 dishes)

## Tips for Best User Experience 💯

1. **Add people before dishes** - This ensures smooth dish assignment
2. **Use clear names** - Use first names everyone recognizes
3. **Assign immediately** - Assign people to dishes right after adding them
4. **Double-check totals** - Review the summary before saving
5. **Share immediately** - Copy and send the breakdown right away
6. **Track payments** - Update payment status as people pay

## Troubleshooting 🔧

**App not starting:**
```bash
npm install
npx expo start --clear
```

**TypeScript errors:**
```bash
npx tsc --noEmit
```

**Storage issues:**
- Clear app data and restart
- Reinstall the app

## Publishing to App Store 📲

1. Create an Apple Developer account ($99/year)
2. Build the production app:
   ```bash
   npx expo build:ios
   ```
3. Submit via App Store Connect
4. Wait for review (typically 1-3 days)

## Support & Feedback 💬

For issues or suggestions, please create an issue in the repository.

---

**Made with ❤️ for Singapore's food culture**

Enjoy stress-free bill splitting! 🎉
