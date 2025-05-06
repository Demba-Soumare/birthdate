import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBW-gCvB3kmtf7AtIRgVj0rSmuJL9iGObY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "birthdate-e2edc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "birthdate-e2edc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "birthdate-e2edc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "465005032207",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:465005032207:web:439d1f51d6e80f7c40047a",
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;