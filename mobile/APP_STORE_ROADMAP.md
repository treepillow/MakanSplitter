# MakanSplit - App Store Launch Roadmap

## Your Goal: Publish on App Store & Build User Base

This is your step-by-step plan to launch MakanSplit successfully.

---

## Phase 1: MVP Launch (Week 1-2) 🚀

**Goal:** Get the app in users' hands ASAP to validate the concept.

### What's Already Done ✅
- [x] Dark mode UI
- [x] Bill creation flow
- [x] OCR receipt scanning
- [x] Dish & people management
- [x] Bill calculation
- [x] Local storage (AsyncStorage)
- [x] Quick Share to Telegram (plain text)
- [x] Copy for WhatsApp
- [x] Payment tracking (tap to mark paid)

### What You Need to Do:

#### 1. Testing (2-3 days)
- [ ] Test bill creation flow end-to-end
- [ ] Test OCR with real receipts
- [ ] Test Telegram sharing
- [ ] Test on both iOS and Android
- [ ] Fix any critical bugs

#### 2. App Store Prep (2-3 days)
- [ ] Create app icon (1024x1024)
- [ ] Take screenshots (required sizes)
- [ ] Write app description
- [ ] Set up Apple Developer account ($99/year)
- [ ] Configure app signing in Xcode
- [ ] Create privacy policy URL (required)
- [ ] Submit for review

#### 3. Marketing (1 day)
- [ ] Create landing page (optional but recommended)
- [ ] Prepare social media posts
- [ ] Reach out to 10 friends to test

**Launch Target:** 2 weeks from now

---

## Phase 2: Growth & Feedback (Week 3-6) 📈

**Goal:** Get initial users, collect feedback, iterate.

### Metrics to Track:
- Downloads per day
- Active users (DAU/MAU)
- Bills created per user
- Telegram shares per bill
- User retention (7-day, 30-day)

### Tasks:
- [ ] Set up analytics (Firebase Analytics or Mixpanel)
- [ ] Add feedback form in app
- [ ] Monitor crash reports
- [ ] Release bug fixes weekly
- [ ] Post in relevant communities:
  - Reddit: r/singapore, r/apps
  - Facebook groups
  - ProductHunt (when ready)

### Success Criteria:
- 100+ downloads
- 10+ daily active users
- 4.0+ star rating
- Positive user feedback

---

## Phase 3: Premium Features (Week 7-10) 💎

**Goal:** Add interactive Telegram buttons as a premium/pro feature.

### Why Wait?
- ✅ Validate that people actually use the app first
- ✅ Build user base before investing in backend
- ✅ Understand user needs better
- ✅ Can charge for Pro features to cover costs

### Implementation Plan:

#### 1. Backend Setup (Week 7)
**Firebase (Recommended)**
- [ ] Create Firebase project
- [ ] Set up Firestore database
- [ ] Configure security rules
- [ ] Add Firebase SDK to app
- [ ] Migrate bills to Firestore (optional, keep local too)

**Schema:**
```
bills/
  {billId}/
    restaurantName: string
    date: timestamp
    total: number
    people: array
    dishes: array
    telegramMessageId: number
    telegramChatId: string
```

#### 2. Webhook Deployment (Week 7-8)
**Vercel (Free tier)**
- [ ] Create Next.js API route for webhook
- [ ] Handle inline queries
- [ ] Handle callback queries (button clicks)
- [ ] Test with ngrok locally
- [ ] Deploy to Vercel
- [ ] Set webhook URL in Telegram

**Webhook endpoints:**
```
POST /api/telegram-webhook
  - Handle inline queries (bot search)
  - Handle callback queries (button clicks)
  - Update Firebase on button click
```

#### 3. Bot Configuration (Week 8)
- [ ] Enable inline mode via @BotFather
- [ ] Test inline query responses
- [ ] Test button callbacks
- [ ] Add rate limiting
- [ ] Add error handling

#### 4. App Integration (Week 8-9)
- [ ] Add "Pro" badge/section in app
- [ ] Implement inline mode sharing
- [ ] Add Firebase sync for bills
- [ ] Test end-to-end flow
- [ ] Beta test with 10 users

#### 5. Monetization (Week 9-10)
**Option A: Freemium**
- Free: Basic sharing (current)
- Pro ($2.99/month): Interactive buttons, unlimited bills

**Option B: Free with Ads**
- Free: All features with banner ads
- Pro ($4.99 one-time): Remove ads

**Option C: Fully Free**
- Keep it free, use as portfolio piece
- Add "Buy me a coffee" link

### Success Criteria:
- 10% of users upgrade to Pro
- 95%+ webhook uptime
- <500ms button response time

---

## Phase 4: Scale & Optimize (Month 4+) 🔥

**Goal:** Handle growth, add features users request.

### Potential Features (based on feedback):
- [ ] Bill history sync across devices
- [ ] Group management (recurring groups)
- [ ] Payment reminders
- [ ] Multiple currency support
- [ ] Export to PDF
- [ ] Integration with PayNow/PayLah
- [ ] Split by percentage (not just equal)
- [ ] Tip calculator
- [ ] Tax-inclusive pricing toggle

### Technical Improvements:
- [ ] Optimize app performance
- [ ] Reduce app size
- [ ] Improve OCR accuracy
- [ ] Add app shortcuts
- [ ] Widget for recent bills (iOS 14+)
- [ ] Apple Watch app (if popular)

---

## Cost Breakdown

### Initial Costs (Year 1):
- Apple Developer: $99/year
- Firebase: $0 (free tier sufficient for <10k users)
- Vercel: $0 (free tier sufficient)
- Domain (optional): $12/year
- **Total: ~$110/year**

### Scaling Costs (if successful):
- Firebase Blaze: ~$25-50/month (at 50k+ users)
- Vercel Pro: $20/month (optional)
- **Total: ~$300-400/year**

### Revenue Potential:
- 1000 users × 10% conversion × $2.99/month = **$300/month**
- Covers all costs after ~200 paying users

---

## Marketing Strategy

### Launch Week:
1. **Product Hunt** - Post on Tuesday morning (best day)
2. **Reddit** - r/singapore, r/apps, r/sideproject
3. **Facebook** - Singapore groups, foodie communities
4. **Instagram** - Create account, post screenshots
5. **Friends & Family** - Get first 50 users

### Organic Growth:
1. **App Store Optimization (ASO)**
   - Keywords: bill split, expense share, receipt scanner
   - Description focuses on pain points
   - Screenshots show key features

2. **Viral Features**
   - "Generated with MakanSplit" in Telegram messages
   - "Invite friends" flow in app
   - Share your bill link

3. **Content Marketing**
   - Blog: "How to split bills fairly"
   - TikTok: "When friends don't pay back..."
   - YouTube: Tutorial videos

### Paid Growth (if budget allows):
- Facebook ads: $50-100 to test
- Google ads: Focus on "bill splitting app"
- Influencer shoutouts: Food bloggers in SG

---

## Success Metrics

### Month 1 Target:
- 500 downloads
- 50 active users
- 4.5+ stars
- 10+ reviews

### Month 3 Target:
- 2,000 downloads
- 200 active users
- Featured in "New Apps We Love" (App Store)
- 50+ reviews

### Month 6 Target:
- 5,000 downloads
- 500 active users
- 100+ paying users (if freemium)
- Breaking even on costs

### Month 12 Target:
- 15,000 downloads
- 1,500 active users
- Self-sustaining revenue
- Consider Android version

---

## Key Decisions to Make Now

### 1. App Name
- "MakanSplit" (current)
- Or something more generic for global appeal?
- Check App Store availability

### 2. Pricing Strategy
- Start free, add Pro later? ✅ (Recommended)
- Launch with Pro from day 1?
- Always free, donations only?

### 3. Target Market
- Singapore only? (Easy to market, clear niche)
- Global? (Bigger market, more competition)

### 4. Feature Scope
- Launch with MVP? ✅ (Recommended - validate first)
- Wait for interactive buttons? (Delays launch)

---

## Timeline Summary

| Phase | Duration | Key Milestone |
|-------|----------|---------------|
| Phase 1: MVP | 2 weeks | App Store launch |
| Phase 2: Growth | 4 weeks | 100+ downloads, feedback |
| Phase 3: Premium | 4 weeks | Interactive buttons live |
| Phase 4: Scale | Ongoing | 1000+ active users |

**Total to full product: ~10 weeks**

---

## Next Steps (This Week)

1. ✅ Fix navigation error (DONE)
2. ✅ Implement Telegram sharing (DONE)
3. [ ] Test thoroughly on real device
4. [ ] Create app icon
5. [ ] Write App Store description
6. [ ] Take screenshots
7. [ ] Set up Apple Developer account

Then next week: Submit to App Store! 🚀

---

## Questions to Answer

Before launching, decide on:
- [ ] Will you keep "MakanSplit" or rebrand?
- [ ] Singapore-only or global launch?
- [ ] Free forever or freemium model?
- [ ] When to add interactive buttons? (Now or later?)

**My recommendation:** Launch free, Singapore-focused, add Pro features in Month 2.

---

Want me to help with any of these steps? I can:
- Write your App Store description
- Create a simple landing page
- Help with Firebase setup when ready
- Write the webhook code for Phase 3
