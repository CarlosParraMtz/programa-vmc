// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "programavmc.firebaseapp.com",
    projectId: "programavmc",
    storageBucket: "programavmc.appspot.com",
    messagingSenderId: "769018192737",
    appId: "1:769018192737:web:8f37a9c275c6754ad81b20",
    measurementId: "G-F7MCMM247Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app)
export const auth = getAuth(app);
