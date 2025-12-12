import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANcMQFOB4RO96qjoOM8W7zDC279JCVsNw",
  authDomain: "makansplitter.firebaseapp.com",
  projectId: "makansplitter",
  storageBucket: "makansplitter.firebasestorage.app",
  messagingSenderId: "589052834590",
  appId: "1:589052834590:web:52d9a6f95ab8955eb58f0f",
  measurementId: "G-F950VXBTFL"
};

// Initialize Firebase (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore (for storing bills)
export const db = getFirestore(app);
