import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BIOMETRIC_KEY = "biometric_enabled";

// Check if device hardware supports biometrics
export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

// Save user preference
export async function setBiometricEnabled(value: boolean) {
  await AsyncStorage.setItem(BIOMETRIC_KEY, value ? "true" : "false");
}

export async function getBiometricEnabled(): Promise<boolean> {
  const val = await AsyncStorage.getItem(BIOMETRIC_KEY);
  return val === "true";
}

// Prompt the system biometric dialog
// Returns true if authenticated, false if failed/cancelled
export async function promptBiometric(): Promise<boolean> {
  const available = await isBiometricAvailable();
  if (!available) return true; // no hardware → don't block

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage:  "Verify it's you",
    fallbackLabel:  "Use passcode",
    cancelLabel:    "Cancel",
    disableDeviceFallback: false, // allow PIN fallback
  });

  return result.success;
}