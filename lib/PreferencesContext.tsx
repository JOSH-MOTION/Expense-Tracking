import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PreferencesContextType = {
  hideBalance: boolean;
  selectedCurrency: string;
  toggleHideBalance: () => void;
  setCurrency: (currency: string) => void;
  formatAmount: (amount: number, signed?: boolean) => string;
  getCurrencySymbol: () => string;
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const CURRENCIES: Record<string, { symbol: string; name: string }> = {
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

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("GHS");

  // Load preferences on mount
  useEffect(() => {
    (async () => {
      try {
        const hidden = await AsyncStorage.getItem("hideBalance");
        const currency = await AsyncStorage.getItem("selectedCurrency");
        
        setHideBalance(hidden === "true");
        setSelectedCurrency(currency || "GHS");
      } catch (error) {
        console.error("Failed to load preferences:", error);
      }
    })();
  }, []);

  const toggleHideBalance = async () => {
    const newValue = !hideBalance;
    setHideBalance(newValue);
    try {
      await AsyncStorage.setItem("hideBalance", newValue.toString());
    } catch (error) {
      console.error("Failed to save hideBalance preference:", error);
    }
  };

  const setCurrency = async (currency: string) => {
    setSelectedCurrency(currency);
    try {
      await AsyncStorage.setItem("selectedCurrency", currency);
    } catch (error) {
      console.error("Failed to save currency preference:", error);
    }
  };

  const formatAmount = (amount: number, signed = true) => {
    if (hideBalance) {
      return "••••••";
    }
    
    const currency = CURRENCIES[selectedCurrency];
    const abs = Math.abs(amount).toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    const formatted = `${currency.symbol} ${abs}`;
    return signed ? (amount >= 0 ? `+${formatted}` : `-${formatted}`) : formatted;
  };

  const getCurrencySymbol = () => {
    return CURRENCIES[selectedCurrency]?.symbol || "₵";
  };

  return (
    <PreferencesContext.Provider
      value={{
        hideBalance,
        selectedCurrency,
        toggleHideBalance,
        setCurrency,
        formatAmount,
        getCurrencySymbol,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}

export { CURRENCIES };
