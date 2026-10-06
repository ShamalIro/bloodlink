import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { normalizeRole, ROLES, ROUTES } from '../constants';
import { useAuth } from '../store/AuthContext';
import SplashScreen from '../screens/onboarding/SplashScreen';
import LanguageSelectionScreen from '../screens/onboarding/LanguageSelectionScreen';
import RoleSelectionScreen from '../screens/onboarding/RoleSelectionScreen';
import LoginScreen from '../screens/onboarding/LoginScreen';
import DonorPhoneLoginScreen from '../screens/onboarding/DonorPhoneLoginScreen';
import OTPVerificationScreen from '../screens/onboarding/OTPVerificationScreen';
import CreateAccountScreen from '../screens/onboarding/CreateAccountScreen';
import RequesterSignupScreen from '../screens/onboarding/RequesterSignupScreen';
import DonorRegistrationScreen from '../screens/onboarding/DonorRegistrationScreen';
import CoordinatorSignupScreen from '../screens/onboarding/CoordinatorSignupScreen';
import NgoSignupScreen from '../screens/onboarding/NgoSignupScreen';
import RoleHomePendingScreen from '../screens/shared/RoleHomePendingScreen';
import RequesterNavigator from './RequesterNavigator';
import DonorNavigator from './DonorNavigator';
import CoordinatorNavigator from './CoordinatorNavigator';
import NgoNavigator from './NgoNavigator';

const Onboarding = createNativeStackNavigator();
const Authenticated = createNativeStackNavigator();

const roleHomeRoutes = {
  [ROLES.DONOR]: ROUTES.DONOR_HOME,
  [ROLES.REQUESTER]: ROUTES.REQUESTER_HOME,
  [ROLES.COORDINATOR]: ROUTES.COORDINATOR_DASHBOARD,
  [ROLES.NGO]: ROUTES.CAMPS_DASHBOARD,
};

function OnboardingStack() {
  return (
    <Onboarding.Navigator initialRouteName={ROUTES.LANGUAGE_SELECTION} screenOptions={{ headerShown: false }}>
      <Onboarding.Screen name={ROUTES.LANGUAGE_SELECTION} component={LanguageSelectionScreen} />
      <Onboarding.Screen name={ROUTES.ROLE_SELECTION} component={RoleSelectionScreen} />
      <Onboarding.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Onboarding.Screen name={ROUTES.DONOR_PHONE_LOGIN} component={DonorPhoneLoginScreen} />
      <Onboarding.Screen name={ROUTES.OTP_VERIFICATION} component={OTPVerificationScreen} />
      <Onboarding.Screen name={ROUTES.CREATE_ACCOUNT} component={CreateAccountScreen} />
      <Onboarding.Screen name={ROUTES.REQUESTER_SIGNUP} component={RequesterSignupScreen} />
      <Onboarding.Screen name={ROUTES.DONOR_REGISTRATION} component={DonorRegistrationScreen} />
      <Onboarding.Screen name={ROUTES.COORDINATOR_SIGNUP} component={CoordinatorSignupScreen} />
      <Onboarding.Screen name={ROUTES.NGO_SIGNUP} component={NgoSignupScreen} />
    </Onboarding.Navigator>
  );
}

function AuthenticatedStack({ role }) {
  return (
    <Authenticated.Navigator key={role} screenOptions={{ headerShown: false }}>
      <Authenticated.Screen
        name={roleHomeRoutes[role]}
        component={RoleHomePendingScreen}
        initialParams={{ role }}
      />
    </Authenticated.Navigator>
  );
}

export default function RootNavigator() {
  const { token, user, booting } = useAuth();
  if (booting) return <SplashScreen />;
  const role = normalizeRole(user?.role) ?? ROLES.REQUESTER;
  return (
    <NavigationContainer>
      {token ? (
        role === ROLES.REQUESTER ? <RequesterNavigator /> :
          role === ROLES.DONOR ? <DonorNavigator /> :
            role === ROLES.COORDINATOR ? <CoordinatorNavigator /> :
              role === ROLES.NGO ? <NgoNavigator /> : <AuthenticatedStack role={role} />
      ) : <OnboardingStack />}
    </NavigationContainer>
  );
}
