import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDidIFKMAAIkupCsJb1P1RV7zcpYx4as8g",
  authDomain: "gym-system-92b4f.firebaseapp.com",
  projectId: "gym-system-92b4f",
  storageBucket: "gym-system-92b4f.firebasestorage.app",
  messagingSenderId: "969893486977",
  appId: "1:969893486977:web:bce5970b3a668941160880"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);