import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [seen,  setSeen]  = useState(false);
  const [user,  setUser]  = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem('onboarding_done').then((val) => setSeen(val === 'true'));

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
    return unsub;
  }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: '#F0F4F3' }} />;
  if (user)   return <Redirect href="/(tabs)/home" />;
  return <Redirect href={seen ? '/(auth)/phone' : '/onboarding'} />;
}