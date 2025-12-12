# MakanSplit - Architecture Documentation

## Overview

MakanSplit is a React Native app built with Expo that helps users split restaurant bills fairly by tracking who ate what dishes.

## Design Decisions

### Why These Choices?

1. **Expo Router for Navigation**
   - File-based routing (like Next.js)
   - Simple to understand
   - Type-safe navigation
   - Less boilerplate than React Navigation alone

2. **Context API for State Management**
   - Lightweight (no Redux needed)
   - Perfect for small-medium apps
   - Built into React
   - Easy to understand

3. **AsyncStorage for Persistence**
   - Native to React Native
   - Simple key-value storage
   - No backend needed
   - Instant saves

4. **TypeScript**
   - Catch bugs early
   - Better IDE autocomplete
   - Self-documenting code
   - Easier refactoring

## Data Flow

### Creating a Bill

```
User Action → Context State → Calculation → Display → Storage
```

1. **User enters data** in create-bill screen
2. **Data stored in Context** (`currentBill`)
3. **User adds people** → Updates context
4. **User adds dishes** → Updates context
5. **Bill summary calculated** using `billCalculator.ts`
6. **User saves** → Persisted via `storage.ts`

### Viewing a Bill

```
Storage → Context → Display → User Interaction → Storage
```

1. **Load bills** from AsyncStorage on app start
2. **Display in list** on home screen
3. **User selects bill** → Navigate to detail
4. **User toggles payment** → Update context → Save to storage

## Calculation Logic

### The Math Behind Bill Splitting

The key challenge: **How to split a bill when people shared different dishes?**

**Solution:** Calculate each person's fair share based on:
1. Which dishes they ate
2. How many people shared each dish
3. Apply service charge to their subtotal
4. Apply GST to (subtotal + service charge)

**Formula:**
```
For each person:
  Subtotal = Sum of (Dish Price ÷ People Sharing That Dish)
  Service Charge = Subtotal × (Service Charge %)
  GST = (Subtotal + Service Charge) × (GST %)
  Total = Subtotal + Service Charge + GST
```

**Why this formula?**
- Service charge applies to food cost (subtotal)
- GST applies to food cost + service (Singapore tax law)
- Each person pays proportionally for shared dishes

### Example Calculation

**Scenario:**
- Dish A: $12, shared by Alice & Bob
- Dish B: $10, eaten by Alice only
- Service Charge: 10%
- GST: 9%

**Alice's calculation:**
```
Subtotal = ($12 ÷ 2) + ($10 ÷ 1) = $6 + $10 = $16
Service = $16 × 0.10 = $1.60
GST = ($16 + $1.60) × 0.09 = $1.58
Total = $16 + $1.60 + $1.58 = $19.18
```

**Bob's calculation:**
```
Subtotal = ($12 ÷ 2) = $6
Service = $6 × 0.10 = $0.60
GST = ($6 + $0.60) × 0.09 = $0.59
Total = $6 + $0.60 + $0.59 = $7.19
```

## File Structure Explained

### Core Files

**[app/index.tsx](app/index.tsx:1)**
- Home screen showing list of saved bills
- Entry point of the app
- Displays payment status badges
- Navigation to create new bill or view existing bill

**[app/create-bill.tsx](app/create-bill.tsx:1)**
- First step of bill creation wizard
- Collects: restaurant name, payer, GST%, service charge%
- Validation for percentages (0-100)
- Stores initial data in Context

**[app/add-people.tsx](app/add-people.tsx:1)**
- Second step: Add all diners
- Simple input + list interface
- Prevents duplicate names
- Creates Person objects with unique IDs

**[app/add-dishes.tsx](app/add-dishes.tsx:1)**
- Third step: Add dishes and assign people
- Most complex UI screen
- Modal for selecting who shared each dish
- Visual indicators for assigned/unassigned dishes
- Prevents continuing with unassigned dishes

**[app/bill-summary.tsx](app/bill-summary.tsx:1)**
- Fourth step: Review and share
- Runs calculations using `billCalculator.ts`
- Shows per-person breakdown
- Copy to Telegram/WhatsApp
- Save to storage
- Redirects to bill detail or home

**[app/bill/[id].tsx](app/bill/[id].tsx:1)**
- View saved bill
- Track payment status (tap to toggle)
- Share bill again
- Delete bill
- Uses dynamic route parameter `[id]`

### Utility Files

**[utils/billCalculator.ts](utils/billCalculator.ts:1)**
- Core calculation engine
- `calculateBill()` - Main calculation function
- `formatCurrency()` - Format numbers as SGD
- `generateTelegramMessage()` - Format for Telegram (with markdown)
- `generateWhatsAppMessage()` - Format for WhatsApp (plain text)

**[utils/storage.ts](utils/storage.ts:1)**
- AsyncStorage wrapper functions
- `saveBill()` - Add new bill
- `updateBill()` - Update existing bill
- `getAllBills()` - Load all bills
- `getBillById()` - Load single bill
- `deleteBill()` - Remove bill

### Type Definitions

**[types/bill.ts](types/bill.ts:1)**
```typescript
Person {
  id: string
  name: string
  amountOwed: number
  hasPaid: boolean
}

Dish {
  id: string
  name: string
  price: number
  sharedBy: string[] // Person IDs
}

Bill {
  id: string
  restaurantName: string
  date: Date
  gstPercentage: number
  serviceChargePercentage: number
  dishes: Dish[]
  people: Person[]
  subtotal: number
  gstAmount: number
  serviceChargeAmount: number
  total: number
  paidBy: string
  createdAt: Date
  updatedAt: Date
}
```

### Context

**[context/BillContext.tsx](context/BillContext.tsx:1)**
- Global state management
- `bills` - All saved bills
- `currentBill` - Bill being created
- `setCurrentBill()` - Update current bill
- `saveBillToHistory()` - Save new bill
- `updateBillInHistory()` - Update existing bill
- `deleteBillFromHistory()` - Delete bill
- `refreshBills()` - Reload from storage

### Components

**[components/Button.tsx](components/Button.tsx:1)**
- Reusable button component
- Variants: primary, secondary, danger
- Loading state support
- Disabled state support

**[components/Input.tsx](components/Input.tsx:1)**
- Reusable text input component
- Label + input field
- Error message support
- Keyboard type configuration
- Multiline support

## User Experience Design

### Design Principles

1. **Minimize Taps** - Reduce friction in data entry
2. **Clear Visual Feedback** - Always show what's happening
3. **Prevent Errors** - Validate before allowing progress
4. **Singapore-First** - Default to local conventions (9% GST, 10% SVC)
5. **Offline-First** - Everything works without internet

### UX Patterns

**Progressive Disclosure:**
- Wizard flow (4 steps) breaks complex task into manageable chunks
- Each step focuses on one thing
- Can't proceed until current step is valid

**Immediate Feedback:**
- Dishes show assigned/unassigned status immediately
- Payment toggles update instantly
- Success/error alerts for all actions

**Smart Defaults:**
- GST: 9% (Singapore standard)
- Service: 10% (common in Singapore)
- Empty fields have helpful placeholders

**Error Prevention:**
- Can't add duplicate names
- Can't continue with unassigned dishes
- Validate percentages (0-100 range)
- Confirm destructive actions (delete)

## Performance Considerations

### Current Implementation

- **Synchronous calculations** - Fine for bills with <50 dishes and <20 people
- **No pagination** - Bill list shows all bills (fine for <100 bills)
- **No memoization** - Calculations run on every render

### Optimization Opportunities (for future)

If performance becomes an issue:

1. **Memoize calculations:**
   ```typescript
   const calculation = useMemo(() =>
     calculateBill(dishes, people, gst, service),
     [dishes, people, gst, service]
   );
   ```

2. **Virtualized lists:**
   - Use `FlatList` with `windowSize` prop
   - Already using FlatList, just optimize if needed

3. **Debounce input:**
   - Add debounce to name/price inputs
   - Prevent excessive re-renders

4. **Code splitting:**
   - Lazy load screens not on critical path
   - Currently not needed (app is small)

## Security & Privacy

### Current Approach

- **All data stored locally** - Never leaves device
- **No authentication** - Single-user app
- **No analytics** - No tracking
- **No network requests** - Fully offline

### Privacy Benefits

- User data is 100% private
- No server to hack
- No account to steal
- No data to leak

### Limitations

- No cloud backup
- No multi-device sync
- Lost device = lost data

### Future Enhancements (Optional)

If adding cloud features:
1. **End-to-end encryption** - Encrypt before uploading
2. **Anonymous accounts** - No email required
3. **Local-first sync** - Works offline, syncs when online
4. **Opt-in only** - Keep local-only as default

## Testing Strategy

### What to Test

1. **Calculation accuracy:**
   - Test various dish/people combinations
   - Test edge cases (1 person, 1 dish, etc.)
   - Verify GST/service charge calculations
   - Test with $0 dishes (should handle)

2. **Storage reliability:**
   - Save/load bills
   - Update existing bills
   - Delete bills
   - Handle corrupted data gracefully

3. **UI flows:**
   - Complete bill creation flow
   - Payment tracking
   - Sharing functionality
   - Navigation between screens

4. **Edge cases:**
   - Empty states
   - Very long names/restaurant names
   - Many dishes (50+)
   - Many people (20+)
   - Large prices ($999.99)
   - Decimal prices ($1.23)

### Manual Testing Checklist

- [ ] Create bill with 1 person, 1 dish
- [ ] Create bill with 10 people, 10 dishes, all shared
- [ ] Create bill with mixed sharing patterns
- [ ] Test with GST = 0, Service = 0
- [ ] Test with GST = 100, Service = 100
- [ ] Test copy to clipboard
- [ ] Test share functionality
- [ ] Test payment tracking
- [ ] Test delete bill
- [ ] Test app restart (data persistence)

## Future Enhancement Ideas

### High Priority

1. **Receipt OCR** - Scan receipt with camera
2. **Quick Split** - "Split equally" option for simple cases
3. **Tips** - Add tip percentage or amount
4. **Rounding** - Round to nearest dollar

### Medium Priority

5. **Bill Templates** - Save restaurant presets
6. **Currency Conversion** - For overseas meals
7. **Group Management** - Save common groups
8. **Payment Reminders** - Push notifications

### Low Priority

9. **Dark Mode** - Night-friendly theme
10. **Accessibility** - Screen reader support
11. **Localization** - Support other languages
12. **Cloud Sync** - Optional backup

## Common Issues & Solutions

### Issue: Calculations don't match receipt exactly

**Cause:** Rounding differences
**Solution:** Restaurants often round differently. The app is mathematically correct, but may differ by a few cents.

### Issue: App slow with many bills

**Cause:** Loading all bills at once
**Solution:** Implement pagination or archive old bills

### Issue: Clipboard not working in Expo Go

**Cause:** Expo Go limitations
**Solution:** Build standalone app (development or production build)

## Deployment Checklist

Before publishing:

- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Add app icon (1024x1024)
- [ ] Add splash screen
- [ ] Update app.json with correct bundle ID
- [ ] Test all sharing features on real devices
- [ ] Write privacy policy
- [ ] Screenshot all screens for App Store
- [ ] Build production version
- [ ] Submit to App Store
- [ ] Submit to Play Store

## Maintenance

### What to Monitor

1. **Crashes** - Use crash reporting (Sentry, Crashlytics)
2. **User feedback** - App Store reviews
3. **Feature requests** - GitHub issues or feedback form
4. **OS updates** - Test on new iOS/Android versions

### Update Frequency

- **Bug fixes:** ASAP
- **Minor features:** Monthly
- **Major features:** Quarterly

---

**This architecture is designed for:**
- Simplicity (easy to understand)
- Maintainability (easy to modify)
- Reliability (hard to break)
- User-friendliness (easy to use)

**Trade-offs made:**
- Simplicity over advanced features
- Local storage over cloud
- Single-user over multi-user
- Native UI over custom design system

These trade-offs make the app easier to build, maintain, and publish while still solving the core problem effectively.
