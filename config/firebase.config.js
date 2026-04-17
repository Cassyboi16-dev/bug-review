// Import the functions you need from the SDKs you need
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfAQpKhtg0CyXCoSFfr1F_RjVMpZuEJc8",
  authDomain: "bugreview-76131.firebaseapp.com",
  projectId: "bugreview-76131",
  storageBucket: "bugreview-76131.firebasestorage.app",
  messagingSenderId: "624455085191",
  appId: "1:624455085191:web:2eec94eb85ffb9a462dc22",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
