import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PrimaryButton, Screen, StatusBadge } from '../../components';
import { ROLES } from '../../constants';
import { useAuth } from '../../store/AuthContext';
import { colors, radius, spacing, typography } from '../../theme';

const copy = {
  [ROLES.DONOR]: { title: 'Donor home', message: 'Your donor dashboard will be implemented in the approved donor phase.', icon: 'water-outline' },
  [ROLES.REQUESTER]: { title: 'Requester home', message: 'Your emergency request dashboard will be implemented in Phase 3.', icon: 'hospital-box-outline' },
  [ROLES.COORDINATOR]: { title: 'Coordinator dashboard', message: 'Request verification and hospital tools will be implemented in the coordinator phase.', icon: 'hospital-building' },
  [ROLES.NGO]: { title: 'NGO camps', message: 'Donation camp tools will be implemented in the NGO phase.', icon: 'account-group-outline' },
};

export default function RoleHomePendingScreen({ route }) {
  const { user, signOut } = useAuth();
  const role = route.params?.role ?? ROLES.REQUESTER;
  const content = copy[role] ?? copy[ROLES.REQUESTER];
  return (
    <Screen contentContainerStyle={styles.screen}>
      <View style={styles.content}>
        <View style={styles.iconWrap}><MaterialCommunityIcons name={content.icon} size={40} color={colors.primary} /></View>
        <StatusBadge label={`${role} account`} variant={user?.isVerified ? 'success' : 'warning'} dot />
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.greeting}>Signed in as {user?.name ?? 'BloodLink user'}.</Text>
        <Text style={styles.message}>{content.message}</Text>
        <PrimaryButton title="Log out" onPress={signOut} fullWidth={false} style={styles.button} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: 'center', justifyContent: 'center' },
  content: { width: '100%', maxWidth: 440, alignItems: 'center', padding: spacing.xxl, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, backgroundColor: colors.surface },
  iconWrap: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, borderRadius: radius.pill, backgroundColor: colors.primaryTint },
  title: { marginTop: spacing.lg, color: colors.textPrimary, fontSize: typography.sizes.title, lineHeight: typography.lineHeights.title, fontWeight: typography.weights.extrabold, textAlign: 'center' },
  greeting: { marginTop: spacing.sm, color: colors.textPrimary, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, textAlign: 'center' },
  message: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting, textAlign: 'center' },
  button: { marginTop: spacing.xxl },
});
