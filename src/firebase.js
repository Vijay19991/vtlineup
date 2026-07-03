// src/firebase.js  —  Single Firebase init file
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:            "AIzaSyAHUzE59H3P43F-Yp1VyNM_E5lAwpn9OVg",
  authDomain:        "v-tlineup-detw8r.firebaseapp.com",
  projectId:         "v-tlineup-detw8r",
  storageBucket:     "v-tlineup-detw8r.firebasestorage.app",
  messagingSenderId: "365739949017",
  appId:             "1:365739949017:web:06ce0b0e43540d2e41b7c8",
};

const app       = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth      = getAuth(app);
export const db        = getFirestore(app);
export const functions = getFunctions(app, "asia-south1");
export const storage   = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
