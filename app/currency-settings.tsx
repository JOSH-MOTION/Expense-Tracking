import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#1D9E75";
const GOLD = "#F5A623";
const BG = "#F0F4F3";
const CARD_BG = "#FFFFFF";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";

const CURRENCIES = {
  GHS: { symbol: "₵", name: "Ghana Cedi" },
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  NGN: { symbol: "₦", name: "Nigerian Naira" },
  XOF: { symbol: "CFA", name: "West African CFA" },
  XAF: { symbol: "FCFA", name: "Central African CFA" },
  ZAR: { symbol: "R", name: "South African Rand" },
  KES: { symbol: "KSh", name: "Kenyan Shilling" },
  UGX: { symbol: "USh", name: "Ugandan Shilling" },
};

export default function CurrencySettingsScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState("GHS");

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("selectedCurrency");
      if (saved) {
        setSelectedCurrency(saved);
      }
    })();
  }, []);

  const handleCurrencySelect = async (currency: string) => {
    setSelectedCurrency(currency);
    await AsyncStorage.setItem("selectedCurrency", currency);

    Alert.alert(
      "Currency Changed",
      `Your currency has been changed to ${currency}. This will be reflected throughout the app.`,
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Currency</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <Ionicons name="cash" size={24} color={PRIMARY} />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Choose your currency</Text>
          <Text style={styles.infoSub}>
            Select the currency you want to use throughout the app. This will
            affect how amounts are displayed.
          </Text>
        </View>
      </View>

      {/* Currency List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {Object.entries(CURRENCIES).map(([code, currency]) => {
          const isSelected = selectedCurrency === code;
          return (
            <TouchableOpacity
              key={code}
              style={[
                styles.currencyCard,
                isSelected && styles.currencyCardSelected,
              ]}
              onPress={() => handleCurrencySelect(code)}
              activeOpacity={0.7}
            >
              <View style={styles.currencyLeft}>
                <View
                  style={[
                    styles.currencySymbol,
                    isSelected && styles.currencySymbolSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.symbolText,
                      isSelected && styles.symbolTextSelected,
                    ]}
                  >
                    {currency.symbol}
                  </Text>
                </View>
                <View style={styles.currencyInfo}>
                  <Text
                    style={[
                      styles.currencyName,
                      isSelected && styles.currencyNameSelected,
                    ]}
                  >
                    {currency.name}
                  </Text>
                  <Text style={styles.currencyCountry}>Country</Text>
                </View>
              </View>
              <View style={styles.currencyRight}>
                <Text
                  style={[
                    styles.currencyCode,
                    isSelected && styles.currencyCodeSelected,
                  ]}
                >
                  {code}
                </Text>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  placeholder: { width: 40 },

  infoCard: {
    flexDirection: "row",
    backgroundColor: "#E1F5EE",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#B7E4C7",
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  infoSub: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  currencyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  currencyCardSelected: {
    backgroundColor: "#E1F5EE",
    borderColor: PRIMARY,
    borderWidth: 1.5,
  },
  currencyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  currencySymbol: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  currencySymbolSelected: {
    backgroundColor: PRIMARY,
  },
  symbolText: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  symbolTextSelected: {
    color: "#fff",
  },
  currencyInfo: {
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  currencyNameSelected: {
    color: PRIMARY,
  },
  currencyCountry: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  currencyRight: {
    alignItems: "flex-end",
  },
  currencyCode: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  currencyCodeSelected: {
    color: PRIMARY,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
});
