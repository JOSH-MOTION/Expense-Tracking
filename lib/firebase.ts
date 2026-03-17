import { initializeApp, getApps, getApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey:            'AIzaSyBvutiRJoxl2-aLdSXIfExdcP2M1pvRG4E',
  authDomain:        'pesakaapp.firebaseapp.com',
  projectId:         'pesakaapp',
  storageBucket:     'pesakaapp.firebasestorage.app',
  messagingSenderId: '755502841132',
  appId:             '1:755502841132:web:0dbf84d5fef045a4064089',
};

// Only initialize once
let app;
let auth;

if (getApps().length === 0) {
  app  = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  app  = getApp();
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
export default app;