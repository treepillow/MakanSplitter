// Simple test endpoint to verify Firebase connection
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

module.exports = async (req, res) => {
  try {
    const db = admin.firestore();

    // Test Firebase connection
    const testDoc = await db.collection('bills').limit(1).get();

    res.status(200).json({
      ok: true,
      firebaseInitialized: admin.apps.length > 0,
      billsCount: testDoc.size,
      envVars: {
        FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
        TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
      },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
      stack: error.stack,
    });
  }
};
