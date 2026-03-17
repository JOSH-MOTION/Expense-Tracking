import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  const [seen,  setSeen]  = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('onboarding_done').then((val) => {
      setSeen(val === 'true');
    });
  }, []);

  if (loading || seen === null) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F0F4F3',
        alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#1D9E75" size="large" />
      </View>
    );
  }

  if (user)  return <Redirect href="/(tabs)/home" />;
  return <Redirect href={seen ? '/(auth)/phone' : '/onboarding'} />;
}