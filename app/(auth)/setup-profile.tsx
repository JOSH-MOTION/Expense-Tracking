import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, StatusBar, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateDisplayName } from '@/lib/db';

const PRIMARY        = '#1D9E75';
const TEXT_PRIMARY   = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

export default function SetupProfileScreen() {
  const { phone }   = useLocalSearchParams<{ phone: string }>();
  const [name,    setName]    = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Enter your name', 'Please enter your name to continue.');
      return;
    }
    setLoading(true);
    try {
      await updateDisplayName(name.trim());
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.kav}
      >
        <View style={s.content}>
          {/* Logo */}
          <View style={s.logoBox}>
            <View style={s.logo}>
              <Text style={s.logoText}>P</Text>
            </View>
          </View>

          <Text style={s.title}>What's your name?</Text>
          <Text style={s.subtitle}>
            This is how we'll greet you in the app.
          </Text>

          <TextInput
            style={s.input}
            placeholder="e.g. Kwame Mensah"
            placeholderTextColor="#CBD5E1"
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />

          <TouchableOpacity
            style={[s.btn, !name.trim() && s.btnDisabled]}
            onPress={handleContinue}
            disabled={!name.trim() || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Continue</Text>
            }
          </TouchableOpacity>

          <Text style={s.hint}>You can change this later in Settings</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#FFFFFF' },
  kav:     { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  logoBox: { alignItems: 'center', marginBottom: 40 },
  logo: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
  },
  logoText:   { fontSize: 24, fontWeight: '800', color: '#fff' },
  title:      { fontSize: 28, fontWeight: '800', color: TEXT_PRIMARY, marginBottom: 8, letterSpacing: -0.5 },
  subtitle:   { fontSize: 15, color: TEXT_SECONDARY, lineHeight: 22, marginBottom: 32 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14,
    height: 56, paddingHorizontal: 16, fontSize: 16,
    color: TEXT_PRIMARY, backgroundColor: '#FAFAFA', marginBottom: 14,
  },
  btn: {
    backgroundColor: PRIMARY, borderRadius: 14,
    height: 54, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  btnDisabled: { opacity: 0.5 },
  btnText:     { fontSize: 16, fontWeight: '700', color: '#fff' },
  hint:        { textAlign: 'center', fontSize: 13, color: TEXT_SECONDARY },
});