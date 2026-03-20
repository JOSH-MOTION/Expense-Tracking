import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/lib/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { user, loading } = useAuth();
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("onboarding_done").then((val) => setSeen(val === "true"));
  }, []);

  useEffect(() => {
    if (!loading && seen !== null) {
      SplashScreen.hideAsync();
    }
  }, [loading, seen]);

  if (loading || seen === null) {
    return (
      <View style={{ flex: 1, backgroundColor: "#1D9E75",
        alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#1A1A1A" size="large" />
      </View>
    );
  }

  if (user) return <Redirect href="/(tabs)/home" />;
  return <Redirect href={seen ? "/(auth)/phone" : "/onboarding"} />;
}