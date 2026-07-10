// firebase.config.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAfAQpKhtg0CyXCoSFfr1F_RjVMpZuEJc8",
  authDomain: "bugreview-76131.firebaseapp.com",
  projectId: "bugreview-76131",
  storageBucket: "bugreview-76131.firebasestorage.app",
  messagingSenderId: "624455085191",
  appId: "1:624455085191:web:2eec94eb85ffb9a462dc22",
  measurementId: "G-YZFKLS506V", // Add your real Measurement ID if using Analytics
};

// Safe app initialization
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Core Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Analytics helper
export const getFirebaseAnalytics = async () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const supported = await isSupported();

    if (!supported) {
      return null;
    }

    return getAnalytics(app);
  } catch (error) {
    console.error("Analytics initialization failed:", error);
    return null;
  }
};

export default app;
