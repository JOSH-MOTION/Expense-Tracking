import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";

export default function SecuritySettingsScreen() {
  const [biometric, setBiometric] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [appLock, setAppLock] = useState(true);

  return (
    <View className="flex-1 bg-gray-100 px-4 pt-24">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-yellow-400 p-3 rounded-full mr-4"
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>

        <Text className="text-xl font-semibold text-gray-900">
          Security Settings
        </Text>
      </View>

      {/* AUTHENTICATION */}
      <Text className="text-gray-500 mb-2 font-semibold">AUTHENTICATION</Text>

      <View className="bg-white rounded-2xl overflow-hidden mb-6">
        {/* Change PIN */}
        <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <View className="bg-yellow-400 p-3 rounded-xl mr-3">
              <Ionicons name="lock-closed" size={20} color="#000" />
            </View>
            <View>
              <Text className="font-semibold text-gray-900">Change PIN</Text>
              <Text className="text-gray-500 text-sm">
                Update your 4-digit PIN
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">{">"}</Text>
        </TouchableOpacity>

        {/* Biometric */}
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center">
            <View className="bg-green-100 p-3 rounded-xl mr-3">
              <Ionicons name="finger-print" size={20} color="green" />
            </View>
            <View>
              <Text className="font-semibold text-gray-900">
                Biometric Login
              </Text>
              <Text className="text-gray-500 text-sm">
                Use FaceID / TouchID
              </Text>
            </View>
          </View>
          <Switch value={biometric} onValueChange={setBiometric} />
        </View>
      </View>

      {/* PRIVACY */}
      <Text className="text-gray-500 mb-2 font-semibold">PRIVACY</Text>

      <View className="bg-white rounded-2xl overflow-hidden mb-6">
        {/* Hide Balance */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <View className="bg-yellow-400 p-3 rounded-xl mr-3">
              <Ionicons name="eye-off" size={20} color="#000" />
            </View>
            <View>
              <Text className="font-semibold text-gray-900">
                Hide Balances on Open
              </Text>
              <Text className="text-gray-500 text-sm">
                Conceal amounts by default
              </Text>
            </View>
          </View>
          <Switch value={hideBalance} onValueChange={setHideBalance} />
        </View>

        {/* App Lock */}
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center">
            <View className="bg-yellow-400 p-3 rounded-xl mr-3">
              <Ionicons name="phone-portrait" size={20} color="#000" />
            </View>
            <View>
              <Text className="font-semibold text-gray-900">App Lock</Text>
              <Text className="text-gray-500 text-sm">
                Require PIN when returning
              </Text>
            </View>
          </View>
          <Switch value={appLock} onValueChange={setAppLock} />
        </View>
      </View>

      {/* DEVICES */}
      <Text className="text-gray-500 mb-2 font-semibold">
        DEVICES & SESSIONS
      </Text>

      <TouchableOpacity className="bg-white rounded-2xl p-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="bg-yellow-400 p-3 rounded-xl mr-3">
            <Ionicons name="laptop" size={20} color="#000" />
          </View>
          <View>
            <Text className="font-semibold text-gray-900">Active Sessions</Text>
            <Text className="text-gray-500 text-sm">
              Manage logged in devices
            </Text>
          </View>
        </View>
        <Text className="text-gray-400">{">"}</Text>
      </TouchableOpacity>
    </View>
  );
}
