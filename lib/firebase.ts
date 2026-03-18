import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
export default app;