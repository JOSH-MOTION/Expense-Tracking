import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1D9E75';
const TEXT_PRIMARY   = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

export default function PhoneScreen() {
  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    const digits = phone.replace(/\s/g, '');
    if (digits.length < 9) return;
    setLoading(true);
    // TODO: Firebase phone auth
    // const confirmation = await auth().signInWithPhoneNumber('+233' + digits);
    setTimeout(() => {
      setLoading(false);
      router.push({ pathname: '/(auth)/otp', params: { phone: digits } });
    }, 1200);
  };

  const formatted = phone.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');
  const isValid   = phone.replace(/\s/g, '').length >= 9;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.kav}
      >
        <View style={s.content}>
          

          <Text style={s.title}>Enter your number</Text>
          <Text style={s.subtitle}>
            Log in or create a new account to track your expenses.
          </Text>

          {/* Phone input */}
          <View style={s.inputRow}>
            <View style={s.prefix}>
              <Text style={s.flag}>🇬🇭</Text>
              <Text style={s.prefixText}>+233</Text>
              <Text style={s.caret}>▾</Text>
            </View>
            <View style={s.divider} />
            <TextInput
              style={s.input}
              placeholder="24 123 4567"
              placeholderTextColor="#CBD5E1"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 9))}
              maxLength={9}
              autoFocus
            />
          </View>

          {/* Send OTP */}
          <TouchableOpacity
            style={[s.btn, !isValid && s.btnDisabled]}
            onPress={handleSendOTP}
            disabled={!isValid || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Send OTP</Text>
            }
          </TouchableOpacity>

          <Text style={s.hint}>We'll send a verification code via SMS</Text>

          {/* Divider */}
          <View style={s.orRow}>
            <View style={s.orLine} />
            <Text style={s.orText}>OR</Text>
            <View style={s.orLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={s.googleBtn}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            {/* Google G */}
            <View style={s.googleIcon}>
              <Text style={s.googleG}>G</Text>
            </View>
            <Text style={s.googleText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  kav:  { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  logoBox: { alignItems: 'center', marginBottom: 36 },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    lineHeight: 22,
    marginBottom: 32,
  },
  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    height: 56,
    marginBottom: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 10,
  },
  flag:       { fontSize: 20 },
  prefixText: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY },
  caret:      { fontSize: 10, color: TEXT_SECONDARY },
  divider:    { width: 1, height: 28, backgroundColor: '#E5E7EB', marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    color: TEXT_PRIMARY,
    letterSpacing: 1,
  },
  // Button
  btn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  btnDisabled: { opacity: 0.5 },
  btnText:     { fontSize: 16, fontWeight: '700', color: '#fff' },
  hint:        { textAlign: 'center', fontSize: 13, color: TEXT_SECONDARY, marginBottom: 24 },
  // OR
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  orLine: { flex: 1, height: 0.5, backgroundColor: '#E5E7EB' },
  orText: { fontSize: 12, color: TEXT_SECONDARY, fontWeight: '500' },
  // Google
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    height: 54,
    gap: 10,
    backgroundColor: '#fff',
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG:    { fontSize: 13, fontWeight: '800', color: '#4285F4' },
  googleText: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY },
});