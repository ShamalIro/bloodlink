import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, SecondaryButton, Screen, StatusBadge } from '../../components';
import useNearestHospital from '../../hooks/useNearestHospital';
import { useAuth } from '../../store/AuthContext';
import { colors, radius, spacing, typography } from '../../theme';

const hospitalValue = ({ loading, hospital, distanceKm, reason }) => {
  if (loading) return 'Finding nearest hospital...';
  if (hospital) return `${hospital.name} \u00B7 ${distanceKm.toFixed(1)} km away`;
  if (reason === 'permission') return 'Location access needed';
  return 'Not available';
};

export default function RequesterProfileScreen() {
  const { user, signOut } = useAuth();
  const nearest = useNearestHospital();
  const reloadNearest = nearest.reload;

  useEffect(() => { reloadNearest(); }, [reloadNearest]);

  const menuItems = [
    { label: 'Nearest Verified Hospital', value: hospitalValue(nearest), icon: 'hospital-building' },
    { label: 'Notification Settings', value: 'Uses application defaults', icon: 'bell-outline' },
    { label: 'Privacy & Contact Sharing', value: 'Managed locally', icon: 'shield-account-outline' },
  ];

  const initials = (user?.name ?? 'BloodLink User').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return (
    <Screen scroll contentContainerStyle={styles.screen} safeAreaEdges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.identity}>
          <View style={styles.avatar}><Text style={styles.initials}>{initials}</Text></View>
          <Text style={styles.name}>{user?.name ?? 'BloodLink User'}</Text>
          <Text style={styles.phone}>Requester account</Text>
          <StatusBadge label={user?.isVerified ? 'Verified requester' : 'Requester'} variant={user?.isVerified ? 'success' : 'neutral'} dot />
        </View>
        <Card>
          {menuItems.map((item, index) => (
            <Pressable key={item.label} style={[styles.menuItem, index < menuItems.length - 1 && styles.menuBorder]} accessibilityRole="button">
              <View style={styles.menuIcon}><MaterialCommunityIcons name={item.icon} size={22} color={colors.textSecondary} /></View>
              <View style={styles.menuCopy}><Text style={styles.menuLabel}>{item.label}</Text><Text style={styles.menuValue} numberOfLines={1}>{item.value}</Text></View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </Pressable>
          ))}
        </Card>
        <Text style={styles.note}>Profile editing and notification preferences are not connected to a backend service yet.</Text>
        <SecondaryButton title="Log out" icon="logout" onPress={signOut} style={styles.logout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  title: { color: colors.textPrimary, fontSize: typography.sizes.display, lineHeight: typography.lineHeights.display, fontWeight: typography.weights.extrabold },
  identity: { alignItems: 'center', marginVertical: spacing.xxxl },
  avatar: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.primaryTint},
  initials: { color: colors.primary, fontSize: 28, fontWeight: typography.weights.extrabold },
  name: { marginTop: spacing.lg, color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
  phone: { marginTop: spacing.xs, marginBottom: spacing.md, color: colors.textSecondary, fontSize: typography.sizes.supporting },
  menuItem: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  menuIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  menuCopy: { flex: 1 },
  menuLabel: { color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  menuValue: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption },
  note: { marginTop: spacing.lg, color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption, textAlign: 'center' },
  logout: { marginTop: spacing.xxl },
});