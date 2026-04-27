// Import the functions you need from the SDKs you need
import { getFirestore } from "firebase/firestore";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAfAQpKhtg0CyXCoSFfr1F_RjVMpZuEJc8",
  authDomain: "bugreview-76131.firebaseapp.com",
  projectId: "bugreview-76131",
  storageBucket: "bugreview-76131.firebasestorage.app",
  messagingSenderId: "624455085191",
  appId: "1:624455085191:web:2eec94eb85ffb9a462dc22",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
const analytics = getAnalytics(app);