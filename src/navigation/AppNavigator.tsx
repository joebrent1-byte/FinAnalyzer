import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import SearchScreen from '../screens/SearchScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import PortfolioScreen from '../screens/PortfolioScreen';

export type AppTabParamList = {
  Dashboard: undefined;
  Search: undefined;
  Analysis: undefined;
  Portfolio: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'Dashboard'
              ? 'bar-chart'
              : route.name === 'Search'
                ? 'search'
                : route.name === 'Analysis'
                  ? 'analytics'
                  : 'wallet';

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#94A3B8',
        headerStyle: {
          backgroundColor: '#0F172A',
        },
        headerTintColor: '#E2E8F0',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Overview' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Screen' }} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} options={{ title: 'Ratios' }} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} options={{ title: 'Portfolio' }} />
    </Tab.Navigator>
  );
}
