import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PRIMARY_GREEN = '#1D9E75';

function AddTabIcon() {
  return (
    <View style={styles.addButton}>
      <IconSymbol size={28} name="plus" color="#FFFFFF" />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const inactiveColor = Colors[colorScheme ?? 'light'].tabIconDefault;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY_GREEN,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="arrow.left.arrow.right" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="transaction"
        options={{
          title: '',
          tabBarIcon: () => <AddTabIcon />,
          tabBarLabel: () => null,
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="chart.pie.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
    elevation: 0,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  addButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: PRIMARY_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 16 : 10,
    shadowColor: PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});