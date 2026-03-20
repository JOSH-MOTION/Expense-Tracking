import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Linking,
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

const FAQ_ITEMS = [
  {
    question: "How do I import MoMo transactions?",
    answer:
      "Go to Settings > MoMo SMS Import or tap the import button on the home screen. For Android, grant SMS permission to auto-read messages. For iOS, copy and paste MoMo SMS manually.",
  },
  {
    question: "Is my financial data secure?",
    answer:
      "Yes! All data is encrypted and stored securely. We use Firebase for secure storage and never share your personal information with third parties.",
  },
  {
    question: "How do I hide my balance?",
    answer:
      "Go to Settings > Preferences > Hide Balance and toggle it on. This will hide all amounts throughout the app until you turn it off.",
  },
  {
    question: "Can I change the currency?",
    answer:
      "Yes! Go to Settings > Preferences > Currency to select from multiple African and international currencies.",
  },
  {
    question: "How do I enable biometric lock?",
    answer:
      "Go to Settings > Security > Biometric Lock. Make sure your device has Face ID or fingerprint set up first.",
  },
  {
    question: "How do I export my data?",
    answer:
      "Go to Settings > Account > Export Data to download all your transactions in CSV format for backup or analysis.",
  },
];

const SUPPORT_OPTIONS = [
  {
    icon: "chatbubble-outline",
    title: "Live Chat",
    subtitle: "Chat with our support team",
    color: "#E1F5EE",
    action: "chat",
  },
  {
    icon: "mail-outline",
    title: "Email Support",
    subtitle: "support@pesakaapp.com",
    color: "#EEF2FF",
    action: "email",
  },
  {
    icon: "call-outline",
    title: "Phone Support",
    subtitle: "+233 30 123 4567",
    color: "#FEF2F2",
    action: "phone",
  },
  {
    icon: "logo-whatsapp",
    title: "WhatsApp",
    subtitle: "+233 20 987 6543",
    color: "#E1F5EE",
    action: "whatsapp",
  },
];

export default function HelpSupportScreen() {
  const handleSupportAction = (action: string) => {
    switch (action) {
      case "chat":
        Alert.alert(
          "Live Chat",
          "Live chat is available Monday-Friday, 9AM-5PM. Our team will respond shortly.",
        );
        break;
      case "email":
        Linking.openURL(
          "mailto:support@pesakaapp.com?subject=Support Request - PesakaApp",
        );
        break;
      case "phone":
        Linking.openURL("tel:+233301234567");
        break;
      case "whatsapp":
        Linking.openURL("https://wa.me/233209876543");
        break;
    }
  };

  const FAQItem = ({
    question,
    answer,
  }: {
    question: string;
    answer: string;
  }) => {
    const [expanded, setExpanded] = React.useState(false);

    return (
      <View style={styles.faqItem}>
        <TouchableOpacity
          style={styles.faqQuestion}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.faqQuestionText}>{question}</Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={TEXT_SECONDARY}
          />
        </TouchableOpacity>
        {expanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{answer}</Text>
          </View>
        )}
      </View>
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Quick Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK HELP</Text>
          <View style={styles.helpCard}>
            <View style={styles.helpIcon}>
              <Ionicons name="book-outline" size={24} color={PRIMARY} />
            </View>
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>User Guide</Text>
              <Text style={styles.helpSub}>
                Learn how to use all features of PesakaApp with our
                comprehensive guide.
              </Text>
              <TouchableOpacity style={styles.helpBtn}>
                <Text style={styles.helpBtnText}>View Guide</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT SUPPORT</Text>
          <View style={styles.supportGrid}>
            {SUPPORT_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.supportCard, { backgroundColor: option.color }]}
                onPress={() => handleSupportAction(option.action)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={TEXT_PRIMARY}
                />
                <Text style={styles.supportTitle}>{option.title}</Text>
                <Text style={styles.supportSub}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
          <View style={styles.faqCard}>
            {FAQ_ITEMS.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP INFORMATION</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2026.03.20</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Developer</Text>
              <Text style={styles.infoValue}>Pesaka Technologies</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Country</Text>
              <Text style={styles.infoValue}>🇬🇭 Made in Ghana</Text>
            </View>
          </View>
        </View>

        {/* Rate App */}
        <View style={styles.rateCard}>
          <Ionicons name="star-outline" size={24} color={GOLD} />
          <View style={styles.rateContent}>
            <Text style={styles.rateTitle}>Enjoying PesakaApp?</Text>
            <Text style={styles.rateSub}>
              Rate us on the App Store and help others discover it!
            </Text>
          </View>
          <TouchableOpacity style={styles.rateBtn}>
            <Text style={styles.rateBtnText}>Rate App</Text>
          </TouchableOpacity>
        </View>
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

  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_SECONDARY,
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  helpCard: {
    flexDirection: "row",
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  helpIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E1F5EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  helpSub: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 12,
  },
  helpBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: PRIMARY,
    borderRadius: 8,
  },
  helpBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  supportGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  supportCard: {
    width: "48%",
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginTop: 8,
    marginBottom: 2,
    textAlign: "center",
  },
  supportSub: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    textAlign: "center",
  },

  faqCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  faqItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F0F0",
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginRight: 16,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },

  infoCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  infoLabel: {
    fontSize: 15,
    color: TEXT_SECONDARY,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  infoDivider: {
    height: 0.5,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 16,
  },

  rateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8EC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFE4A0",
  },
  rateContent: {
    flex: 1,
    marginLeft: 16,
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  rateSub: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  rateBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: GOLD,
    borderRadius: 8,
  },
  rateBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A2800",
  },
});
