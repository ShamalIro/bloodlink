import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader, Screen } from '../../components';
import { normalizeRole, ROLES, ROUTES } from '../../constants';
import { colors, radius, spacing, typography } from '../../theme';

const signupRoute = {
  [ROLES.REQUESTER]: ROUTES.REQUESTER_SIGNUP,
  [ROLES.DONOR]: ROUTES.DONOR_REGISTRATION,
  [ROLES.COORDINATOR]: ROUTES.COORDINATOR_SIGNUP,
  [ROLES.NGO]: ROUTES.NGO_SIGNUP,
};

const choices = [
  { role: ROLES.REQUESTER, title: 'Requester', icon: 'hospital-box-outline' },
  { role: ROLES.DONOR, title: 'Blood Donor', icon: 'water-outline' },
  { role: ROLES.COORDINATOR, title: 'Hospital Coordinator', icon: 'hospital-building' },
  { role: ROLES.NGO, title: 'NGO Staff', icon: 'account-group-outline' },
];

export default function CreateAccountScreen({ navigation, route }) {
  const selectedRole = normalizeRole(route.params?.role);
  useEffect(() => {
    if (selectedRole) navigation.replace(signupRoute[selectedRole]);
  }, [navigation, selectedRole]);

  if (selectedRole) return <Screen />;

  return (
    <Screen padded={false}>
      <AppHeader title="Create account" onBack={navigation.goBack} />
      <View style={styles.outer}>
        <View style={styles.content}>
          <Text style={styles.title}>How will you use BloodLink?</Text>
          <Text style={styles.subtitle}>Choose an account type to continue.</Text>
          <View style={styles.options}>
            {choices.map((choice) => (
              <Pressable key={choice.role} onPress={() => navigation.navigate(signupRoute[choice.role])} style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
                <View style={styles.iconWrap}><MaterialCommunityIcons name={choice.icon} size={24} color={colors.primary} /></View>
                <Text style={styles.optionText}>{choice.title}</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },
  content: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  title: { color: colors.textPrimary, fontSize: typography.sizes.title, lineHeight: typography.lineHeights.title, fontWeight: typography.weights.extrabold },
  subtitle: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.body },
  options: { gap: spacing.md, marginTop: spacing.xxl },
  option: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  optionPressed: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  iconWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.primaryTint },
  optionText: { flex: 1, color: colors.textPrimary, fontSize: typography.sizes.body, fontWeight: typography.weights.bold },
});
