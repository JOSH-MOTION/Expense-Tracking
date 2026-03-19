// OTP Screen - DISABLED (using Google auth only)
// Uncomment if you want to enable phone/SMS authentication
/*
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from "@/lib/firebase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#1D9E75";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";
const OTP_LENGTH = 6;

export default function OTPScreen() {
  const { phone, verificationId } =
    useLocalSearchParams<{ phone: string; verificationId: string }>();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const next  = [...otp];
    next[idx]   = digit;
    setOtp(next);
    if (digit && idx < OTP_LENGTH - 1) inputs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
      const next = [...otp]; next[idx - 1] = ''; setOtp(next);
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) return;
    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
      await createUserIfNew("+233" + phone);
      setLoading(false);
      router.replace("/(tabs)/home");
    } catch {
      setLoading(false);
      Alert.alert(
        "Wrong code",
        "The code entered is incorrect. Please try again.",
      );
    }
  };

  const handleResend = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setTimer(45);
    setCanResend(false);
    inputs.current[0]?.focus();
    router.back();
  };

  const formatPhone = (p: string) =>
    p ? `+233 ${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5)}` : "+233";

  const isComplete = otp.every((d) => d !== "");

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.kav}
      >
        <View style={s.content}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>

          <Text style={s.title}>Verify number</Text>
          <Text style={s.subtitle}>
            Enter the code sent to{' '}
            <Text style={s.phoneHighlight}>{formatPhone(phone)}</Text>
          </Text>

          <View style={s.boxRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(r) => { inputs.current[i] = r; }}
                style={[
                  s.box,
                  digit ? s.boxFilled : null,
                  otp.slice(0, i).every((d) => d !== '') && !digit ? s.boxActive : null,
                ]}
                value={digit}
                onChangeText={(v) => handleChange(v, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                selectionColor={PRIMARY}
                autoFocus={i === 0}
              />
            ))}
          </View>

          <View style={s.resendRow}>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={s.resendLink}>Resend code</Text>
              </TouchableOpacity>
            ) : (
              <Text style={s.resendTimer}>
                Resend in <Text style={s.timerBold}>0:{timer.toString().padStart(2,'0')}</Text>
              </Text>
            )}
          </View>
        </View>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.btn, !isComplete && s.btnDisabled]}
            onPress={handleVerify}
            disabled={!isComplete || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Verify</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#FFFFFF' },
  kav:     { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F3F4F6', alignItems: 'center',
    justifyContent: 'center', marginBottom: 28,
  },
  backArrow:      { fontSize: 18, color: TEXT_PRIMARY, fontWeight: '500' },
  title:          { fontSize: 28, fontWeight: '800', color: TEXT_PRIMARY, marginBottom: 8, letterSpacing: -0.5 },
  subtitle:       { fontSize: 15, color: TEXT_SECONDARY, lineHeight: 22, marginBottom: 36 },
  phoneHighlight: { color: TEXT_PRIMARY, fontWeight: '600' },
  boxRow:         { flexDirection: 'row', gap: 10, marginBottom: 24 },
  box: {
    flex: 1, height: 56, borderRadius: 12, borderWidth: 1.5,
    borderColor: '#E5E7EB', textAlign: 'center', fontSize: 22,
    fontWeight: '700', color: TEXT_PRIMARY, backgroundColor: '#FAFAFA',
  },
  boxFilled:   { backgroundColor: '#FFFFFF', borderColor: '#D1D5DB' },
  boxActive:   { borderColor: PRIMARY, backgroundColor: '#FFFFFF' },
  resendRow:   { alignItems: 'center', marginBottom: 16 },
  resendTimer: { fontSize: 14, color: TEXT_SECONDARY },
  timerBold:   { fontWeight: '700', color: TEXT_PRIMARY },
  resendLink:  { fontSize: 14, color: PRIMARY, fontWeight: '600' },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  btn:         { backgroundColor: PRIMARY, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText:     { fontSize: 16, fontWeight: '700', color: '#fff' },
});
*/

// Placeholder component to silence the warning
export default function OTPScreen() {
  return null;
}
