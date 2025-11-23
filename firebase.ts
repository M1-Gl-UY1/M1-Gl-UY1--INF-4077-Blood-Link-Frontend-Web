import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAxBy34WZw_OstZgzHMs54SMxRXF4gCpx0",
  authDomain: "bloodlink-3327e.firebaseapp.com",
  projectId: "bloodlink-3327e",
  storageBucket: "bloodlink-3327e.firebasestorage.app",
  messagingSenderId: "914669668674",
  appId: "1:914669668674:web:3e2ce2a190b00ad688e0db"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;