import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC5O0hKf96V4CegM414OdJqKvxJRtGHKJs",
  authDomain: 
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pef-web.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pef-web",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pef-web.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "421013117173",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:421013117173:web:2eb410e5b4904bf9d28dbc",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
