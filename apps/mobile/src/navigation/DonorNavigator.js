import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants';
import { colors, controlHeights, typography } from '../theme';
import DonorHomeScreen from '../screens/donor/DonorHomeScreen';
import DonorAlertsScreen from '../screens/donor/DonorAlertsScreen';
import EmergencyMatchScreen from '../screens/donor/EmergencyMatchScreen';
import BloodAlertScreen from '../screens/donor/BloodAlertScreen';
import RequestAcceptedScreen from '../screens/donor/RequestAcceptedScreen';
import DonationHistoryScreen from '../screens/donor/DonationHistoryScreen';
import DonorProfileScreen from '../screens/donor/DonorProfileScreen';
import HospitalChatScreen from '../screens/donor/HospitalChatScreen';

const Tabs = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AlertsStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const stackOptions = { headerShown: false };
const hiddenTabRoutes = new Set([ROUTES.EMERGENCY_MATCH, ROUTES.BLOOD_ALERT, ROUTES.REQUEST_ACCEPTED, ROUTES.HOSPITAL_CHAT]);

function HomeNavigator() {
  return <HomeStack.Navigator screenOptions={stackOptions}>
    <HomeStack.Screen name={ROUTES.DONOR_HOME} component={DonorHomeScreen} />
    <HomeStack.Screen name={ROUTES.BLOOD_ALERT} component={BloodAlertScreen} />
    <HomeStack.Screen name={ROUTES.REQUEST_ACCEPTED} component={RequestAcceptedScreen} options={{ gestureEnabled: false }} />
    <HomeStack.Screen name={ROUTES.HOSPITAL_CHAT} component={HospitalChatScreen} />
  </HomeStack.Navigator>;
}
function AlertsNavigator() {
  return <AlertsStack.Navigator screenOptions={stackOptions}>
    <AlertsStack.Screen name={ROUTES.DONOR_ALERTS} component={DonorAlertsScreen} />
    <AlertsStack.Screen name={ROUTES.EMERGENCY_MATCH} component={EmergencyMatchScreen} />
    <AlertsStack.Screen name={ROUTES.BLOOD_ALERT} component={BloodAlertScreen} />
    <AlertsStack.Screen name={ROUTES.REQUEST_ACCEPTED} component={RequestAcceptedScreen} options={{ gestureEnabled: false }} />
    <AlertsStack.Screen name={ROUTES.HOSPITAL_CHAT} component={HospitalChatScreen} />
  </AlertsStack.Navigator>;
}
function HistoryNavigator() { return <HistoryStack.Navigator screenOptions={stackOptions}><HistoryStack.Screen name={ROUTES.DONATION_HISTORY} component={DonationHistoryScreen} /></HistoryStack.Navigator>; }
function ProfileNavigator() { return <ProfileStack.Navigator screenOptions={stackOptions}><ProfileStack.Screen name={ROUTES.DONOR_PROFILE} component={DonorProfileScreen} /></ProfileStack.Navigator>; }

const icons = {
  [ROUTES.DONOR_HOME_TAB]: ['home-outline', 'home'],
  [ROUTES.DONOR_ALERTS_TAB]: ['bell-outline', 'bell'],
  [ROUTES.DONOR_HISTORY_TAB]: ['history', 'history'],
  [ROUTES.DONOR_PROFILE_TAB]: ['account-outline', 'account'],
};

export default function DonorNavigator() {
  return <Tabs.Navigator screenOptions={({ route }) => {
    const focusedRoute = getFocusedRouteNameFromRoute(route);
    const hideTabBar = hiddenTabRoutes.has(focusedRoute);
    return { headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textTertiary, tabBarLabelStyle: styles.tabLabel, tabBarStyle: [styles.tabBar, hideTabBar && styles.hidden], tabBarIcon: ({ color, focused, size }) => { const names = icons[route.name]; return <MaterialCommunityIcons name={focused ? names[1] : names[0]} size={size} color={color} />; } };
  }}>
    <Tabs.Screen name={ROUTES.DONOR_HOME_TAB} component={HomeNavigator} options={{ title: 'Home' }} />
    <Tabs.Screen name={ROUTES.DONOR_ALERTS_TAB} component={AlertsNavigator} options={{ title: 'Alerts' }} />
    <Tabs.Screen name={ROUTES.DONOR_HISTORY_TAB} component={HistoryNavigator} options={{ title: 'History' }} />
    <Tabs.Screen name={ROUTES.DONOR_PROFILE_TAB} component={ProfileNavigator} options={{ title: 'Profile' }} />
  </Tabs.Navigator>;
}

const styles = StyleSheet.create({
  tabBar: { alignSelf: 'center', width: '100%', maxWidth: 600, minHeight: controlHeights.bottomNavigation, paddingTop: 6, borderTopColor: colors.border, backgroundColor: colors.surface },
  hidden: { display: 'none' },
  tabLabel: { paddingBottom: 5, fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold },
});
