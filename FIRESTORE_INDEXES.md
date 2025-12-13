# Firestore Indexes Setup

## Why Indexes Are Needed

Firestore requires composite indexes for queries that:
- Order by multiple fields
- Filter and order by different fields
- Query across collections

Without indexes, these queries will fail in production.

---

## Required Indexes for MakanSplitter

### 1. Query: Get Bills by Phase and Creation Date
**Collection:** `bills`
**Fields indexed:**
- `phase` (Ascending)
- `createdAt` (Descending)

**Used by:** `getAllBillsFromFirebase()` when filtering by phase

---

### 2. Query: Get All Bills Ordered by Creation Date
**Collection:** `bills`
**Fields indexed:**
- `createdAt` (Descending)

**Used by:** `getAllBillsFromFirebase()` in [billStorage.ts:126](web/lib/billStorage.ts#L126)

---

## How to Create Indexes

### Method 1: Firebase Console (Recommended for Beginners)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in left sidebar
4. Click **Indexes** tab at the top
5. Click **Create Index**
6. Configure:
   - **Collection ID:** `bills`
   - **Fields to index:**
     - Field: `createdAt`, Order: `Descending`
   - **Query scope:** Collection
7. Click **Create**

**For composite index (phase + createdAt):**
1. Repeat steps 1-5
2. Configure:
   - **Collection ID:** `bills`
   - **Fields to index:**
     - Field: `phase`, Order: `Ascending`
     - Field: `createdAt`, Order: `Descending`
   - **Query scope:** Collection
3. Click **Create**

**Note:** Index creation takes 5-15 minutes. You'll see "Building..." status.

---

### Method 2: Using firestore.indexes.json (For Deployment)

Create a file `firestore.indexes.json` in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "bills",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "bills",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "phase",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**Deploy indexes:**
```bash
firebase deploy --only firestore:indexes
```

**Prerequisites:**
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in: `firebase login`
- Project initialized: `firebase init firestore`

---

## How to Check Index Status

### Via Console:
1. Go to Firebase Console → Firestore Database → Indexes
2. Check status:
   - ✅ **Enabled** = Ready to use
   - 🔄 **Building** = Wait 5-15 minutes
   - ❌ **Error** = Check configuration

### Via CLI:
```bash
firebase firestore:indexes
```

---

## Troubleshooting

### Error: "The query requires an index"
**Solution:** Create the missing index. Firebase error message includes a direct link to create it.

### Index stuck on "Building" for >30 minutes
**Solution:**
1. Delete the index
2. Wait 5 minutes
3. Recreate it

### Query works locally but fails in production
**Solution:** Local emulator doesn't enforce indexes. Always test with real Firestore before deploying.

---

## Performance Tips

1. **Single-field indexes** are created automatically (e.g., just `createdAt`)
2. **Composite indexes** must be created manually (e.g., `phase` + `createdAt`)
3. **Limit index count** - Each index increases write cost
4. **Use array-contains** instead of multiple ORs when possible

---

## Future Indexes (If Needed)

If you add these queries later, you'll need indexes:

### Archive Query (for 30-day cleanup)
```json
{
  "collectionGroup": "bills",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "createdAt",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "phase",
      "order": "ASCENDING"
    }
  ]
}
```

### User's Bills Query
```json
{
  "collectionGroup": "bills",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "creatorTelegramId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
```

---

## Next Steps

✅ **Action Required:** Create the 2 indexes using Method 1 (Firebase Console)
⏱️ **Time Required:** 5 minutes + 10 minutes build time
🎯 **Result:** All queries will work in production
