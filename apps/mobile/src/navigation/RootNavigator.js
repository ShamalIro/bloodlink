import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/AuthContext';
import { colors } from '../theme';
import SplashScreen from '../screens/onboarding/SplashScreen';
import LoginScreen from '../screens/onboarding/LoginScreen';

// Temporary stand-ins; each gets replaced as we build the real screen.
const Placeholder = ({ name }) => () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>{name} (coming next)</Text>
  </View>
);
const RoleSelection = Placeholder({ name: 'Role Selection' });
const CreateAccount = Placeholder({ name: 'Create Account' });
const RequesterHome = Placeholder({ name: 'Requester Home' });

const Onboarding = createNativeStackNavigator();
const Requester = createNativeStackNavigator();

const stackOpts = {
  headerTintColor: colors.primary,
  headerShadowVisible: false,
  headerTitle: '',
};

function OnboardingStack() {
  return (
    <Onboarding.Navigator screenOptions={stackOpts}>
      {/* Until Role Selection exists, start on Login */}
      <Onboarding.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Onboarding.Screen name="RoleSelection" component={RoleSelection} />
      <Onboarding.Screen name="CreateAccount" component={CreateAccount} />
    </Onboarding.Navigator>
  );
}

function RequesterStack() {
  return (
    <Requester.Navigator screenOptions={stackOpts}>
      <Requester.Screen name="RequesterHome" component={RequesterHome} />
    </Requester.Navigator>
  );
}

export default function RootNavigator() {
  const { token, booting } = useAuth();
  if (booting) return <SplashScreen />;
  return (
    <NavigationContainer>
      {token ? <RequesterStack /> : <OnboardingStack />}
    </NavigationContainer>
  );
}