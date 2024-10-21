// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyDSsmK57c_LBlFMTEuT88Ilrcu6PAjGvD4",
  authDomain: "renting-wala.firebaseapp.com",
  projectId: "renting-wala",
  storageBucket: "renting-wala.appspot.com",
  messagingSenderId: "180970125349",
  appId: "1:180970125349:web:a204e0c73d0b39a521a7cc",
  measurementId: "G-BLSYY0G1BM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);