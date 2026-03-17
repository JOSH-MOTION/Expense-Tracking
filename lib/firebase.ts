import { getApp, getApps, initializeApp } from "@react-native-firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBvutiRJoxl2-aLdSXIfExdcP2M1pvRG4E",
  authDomain: "pesakaapp.firebaseapp.com",
  projectId: "pesakaapp",
  storageBucket: "pesakaapp.firebasestorage.app",
  messagingSenderId: "755502841132",
  appId: "1:755502841132:web:0dbf84d5fef045a4064089",
  measurementId: "G-1951GT90RB",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export default app;
