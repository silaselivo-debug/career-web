import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCsYxwRKX3ePVtcP1LJbpgcz5P_WH57rSw",
  authDomain: "career-guidance-platform-498.firebaseapp.com",
  projectId: "career-guidance-platform-498",
  storageBucket: "career-guidance-platform-498.firebasestorage.app",
  messagingSenderId: "179964528403",
  appId: "1:179964528403:web:dc75431f1758b63b51bce6",
  measurementId: "G-9VV4YYEFVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;