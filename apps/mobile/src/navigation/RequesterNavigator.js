import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants';
import { colors, controlHeights, typography } from '../theme';
import RequesterHomeScreen from '../screens/requester/RequesterHomeScreen';
import RequestBloodTypeScreen from '../screens/requester/RequestBloodTypeScreen';
import RequestDetailsScreen from '../screens/requester/RequestDetailsScreen';
import RequestSubmittedScreen from '../screens/requester/RequestSubmittedScreen';
import RequestStatusScreen from '../screens/requester/RequestStatusScreen';
import MyRequestsScreen from '../screens/requester/MyRequestsScreen';
import RequesterProfileScreen from '../screens/requester/RequesterProfileScreen';

const Tabs = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const RequestsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const stackOptions = { headerShown: false };
const hiddenTabRoutes = new Set([ROUTES.REQUEST_BLOOD_TYPE, ROUTES.REQUEST_DETAILS, ROUTES.REQUEST_SUBMITTED, ROUTES.REQUEST_STATUS]);

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackOptions}>
      <HomeStack.Screen name={ROUTES.REQUESTER_HOME} component={RequesterHomeScreen} />
      <HomeStack.Screen name={ROUTES.REQUEST_BLOOD_TYPE} component={RequestBloodTypeScreen} />
      <HomeStack.Screen name={ROUTES.REQUEST_DETAILS} component={RequestDetailsScreen} />
      <HomeStack.Screen name={ROUTES.REQUEST_SUBMITTED} component={RequestSubmittedScreen} options={{ gestureEnabled: false }} />
      <HomeStack.Screen name={ROUTES.REQUEST_STATUS} component={RequestStatusScreen} />
    </HomeStack.Navigator>
  );
}

function RequestsNavigator() {
  return (
    <RequestsStack.Navigator screenOptions={stackOptions}>
      <RequestsStack.Screen name={ROUTES.MY_REQUESTS} component={MyRequestsScreen} />
      <RequestsStack.Screen name={ROUTES.REQUEST_STATUS} component={RequestStatusScreen} />
    </RequestsStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={stackOptions}>
      <ProfileStack.Screen name={ROUTES.REQUESTER_PROFILE} component={RequesterProfileScreen} />
    </ProfileStack.Navigator>
  );
}

const icons = {
  [ROUTES.REQUESTER_HOME_TAB]: ['home-outline', 'home'],
  [ROUTES.REQUESTER_REQUESTS_TAB]: ['clipboard-text-outline', 'clipboard-text'],
  [ROUTES.REQUESTER_PROFILE_TAB]: ['account-outline', 'account'],
};

export default function RequesterNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => {
        const focusedRoute = getFocusedRouteNameFromRoute(route);
        const hideTabBar = hiddenTabRoutes.has(focusedRoute);
        return {
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: [styles.tabBar, hideTabBar && styles.hidden],
          tabBarIcon: ({ color, focused, size }) => {
            const names = icons[route.name];
            return <MaterialCommunityIcons name={focused ? names[1] : names[0]} size={size} color={color} />;
          },
        };
      }}
    >
      <Tabs.Screen name={ROUTES.REQUESTER_HOME_TAB} component={HomeNavigator} options={{ title: 'Home' }} />
      <Tabs.Screen name={ROUTES.REQUESTER_REQUESTS_TAB} component={RequestsNavigator} options={{ title: 'Requests' }} />
      <Tabs.Screen name={ROUTES.REQUESTER_PROFILE_TAB} component={ProfileNavigator} options={{ title: 'Profile' }} />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: { alignSelf: 'center', width: '100%', maxWidth: 600, minHeight: controlHeights.bottomNavigation, paddingTop: 6, borderTopColor: colors.border, backgroundColor: colors.surface },
  hidden: { display: 'none' },
  tabLabel: { paddingBottom: 5, fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold },
});
