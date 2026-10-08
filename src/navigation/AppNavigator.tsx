import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import SearchScreen from '../screens/SearchScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import CompanyDetailScreen from '../screens/CompanyDetailScreen';
import { brand } from '../theme';

export type AppTabParamList = {
  Dashboard: undefined;
  Search: undefined;
  Analysis: undefined;
  Portfolio: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  CompanyDetail: { symbol?: string };
};

const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconName = route.name === 'Dashboard' ? 'bar-chart' : route.name === 'Search' ? 'search' : route.name === 'Analysis' ? 'analytics' : 'wallet';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: brand.primary,
        tabBarInactiveTintColor: brand.textMuted,
        headerStyle: { backgroundColor: brand.background },
        headerTintColor: brand.text,
        tabBarStyle: { backgroundColor: brand.background, borderTopColor: brand.border, borderTopWidth: 1 },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Overview' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Screen' }} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} options={{ title: 'Ratios' }} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} options={{ title: 'Portfolio' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen
          name="CompanyDetail"
          component={CompanyDetailScreen}
          options={{
            title: 'Company Profile',
            headerStyle: { backgroundColor: brand.background },
            headerTintColor: brand.text,
            headerTitleStyle: { color: brand.text },
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
