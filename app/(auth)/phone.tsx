import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '@/lib/firebase';
import { createUserIfNew } from '@/lib/db';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, StatusBar,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

const PRIMARY        = '#1D9E75';
const TEXT_PRIMARY   = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

export default function PhoneScreen() {
  const [loading, setLoading] = useState(false);

const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  clientId:        '755502841132-ipah42e57vbq2stf4q20g1ft4vdv9d4h.apps.googleusercontent.com', // Web
  iosClientId:     '755502841132-th256nqii3iopvqe0fq582f8ckk3mtlf.apps.googleusercontent.com', // iOS
  androidClientId: '755502841132-ipah42e57vbq2stf4q20g1ft4vdv9d4h.apps.googleusercontent.com', // Web (Android uses web client)
});


  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response);
    }
  }, [response]);

  const handleGoogleResponse = async (resp: any) => {
    setLoading(true);
    try {
      const { id_token } = resp.params;
      const credential   = GoogleAuthProvider.credential(id_token);
      const result       = await signInWithCredential(auth, credential);
      const user         = result.user;

      await createUserIfNew(user.email || '');

      const isNew = result._tokenResponse?.isNewUser ?? false;
      if (isNew) {
        router.replace({
          pathname: '/(auth)/setup-profile',
          params: { phone: user.email || '' },
        });
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      Alert.alert('Sign-in failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={s.content}>

        {/* Logo */}
        <View style={s.logoBox}>
          <View style={s.logo}>
            <Text style={s.logoText}>P</Text>
          </View>
        </View>

        <Text style={s.title}>Welcome to Pesaka</Text>
        <Text style={s.subtitle}>
          Track your MoMo and cash transactions.{'\n'}Sign in to get started.
        </Text>

        <View style={s.spacer} />

        {/* Google Button */}
        <TouchableOpacity
          style={[s.googleBtn, (!request || loading) && s.btnDisabled]}
          onPress={() => promptAsync()}
          disabled={!request || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#1A1A1A" size="small" />
          ) : (
            <>
              <View style={s.googleIconBox}>
                <Text style={s.googleG}>G</Text>
              </View>
              <Text style={s.googleText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={s.hint}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 32 },
  logoBox: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  logoText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  title:    { fontSize: 28, fontWeight: '800', color: TEXT_PRIMARY, textAlign: 'center', letterSpacing: -0.5, marginBottom: 12 },
  subtitle: { fontSize: 15, color: TEXT_SECONDARY, textAlign: 'center', lineHeight: 22 },
  spacer:   { flex: 1 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 16,
    height: 58, gap: 12, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    marginBottom: 16,
  },
  btnDisabled: { opacity: 0.5 },
  googleIconBox: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F8F9FF',
  },
  googleG:    { fontSize: 14, fontWeight: '800', color: '#4285F4' },
  googleText: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY },
  hint: { textAlign: 'center', fontSize: 12, color: TEXT_SECONDARY, lineHeight: 18 },
});