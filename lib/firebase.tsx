// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSNyt79Cp3yvGzepp1grbk7ptY_dVDAd0",
  authDomain: "farm-ec-89c3d.firebaseapp.com",
  projectId: "farm-ec-89c3d",
  storageBucket: "farm-ec-89c3d.firebasestorage.app",
  messagingSenderId: "541385315958",
  appId: "1:541385315958:web:6b3f5e33adeae0f9977157",
  measurementId: "G-MH9VL0BJCL"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);

export { app };