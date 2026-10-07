import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BloodTypeBadge, Card, DestructiveButton, Screen, StatusBadge } from '../../components';
import { EligibilitySummary } from '../../components/donor';
import { mockDonorProfile } from '../../mocks/donorData';
import { useAuth } from '../../store/AuthContext';
import { colors, radius, spacing, typography } from '../../theme';

const formatDate = (date) => new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
export default function DonorProfileScreen() {
  const { user, signOut } = useAuth();
  const [available, setAvailable] = useState(mockDonorProfile.available);
  const [alerts, setAlerts] = useState(mockDonorProfile.emergencyAlerts);
  const name = user?.name || mockDonorProfile.name;
  return <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={styles.screen}><View style={styles.content}>
    <View><Text style={styles.eyebrow}>DONOR PROFILE</Text><Text style={styles.title}>Profile & availability</Text></View>
    <Card elevated style={styles.identity}><View style={styles.avatar}><MaterialCommunityIcons name="account" size={34} color={colors.primary} /></View><View style={styles.identityCopy}><Text style={styles.name}>{name}</Text><Text style={styles.meta}>{user?.phone || mockDonorProfile.location}</Text><StatusBadge label="VERIFIED DONOR" variant="success" dot /></View><BloodTypeBadge type={mockDonorProfile.bloodType} /></Card>
    <EligibilitySummary daysRemaining={mockDonorProfile.daysUntilEligible} eligibleDate="10 Oct 2026" />
    <Card><View style={styles.setting}><View style={styles.settingCopy}><Text style={styles.settingTitle}>Available to donate</Text><Text style={styles.settingText}>Show your profile for compatible nearby requests.</Text></View><Switch value={available} onValueChange={setAvailable} trackColor={{ false: colors.borderStrong, true: colors.success }} thumbColor={colors.white} /></View><View style={styles.divider} /><View style={styles.setting}><View style={styles.settingCopy}><Text style={styles.settingTitle}>Emergency alerts</Text><Text style={styles.settingText}>Allow critical blood-match notifications.</Text></View><Switch value={alerts} onValueChange={setAlerts} trackColor={{ false: colors.borderStrong, true: colors.primary }} thumbColor={colors.white} /></View></Card>
    <Card><View style={styles.infoRow}><Text style={styles.infoLabel}>NIC</Text><Text style={styles.infoValue}>{mockDonorProfile.nic}</Text></View><View style={styles.infoRow}><Text style={styles.infoLabel}>Location</Text><Text style={styles.infoValue}>{mockDonorProfile.location}</Text></View><View style={styles.infoRow}><Text style={styles.infoLabel}>Last donation</Text><Text style={styles.infoValue}>{formatDate(mockDonorProfile.lastDonationDate)}</Text></View></Card>
    <Text style={styles.localNote}>Availability preferences are stored locally in this preview until donor APIs are available.</Text>
    <DestructiveButton title="Log out" icon="logout" onPress={signOut} />
  </View></Screen>;
}
const styles = StyleSheet.create({ screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl }, eyebrow: { color: colors.primary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, letterSpacing: 0.8 }, title: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold }, identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, avatar: { width: 56, height: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryTint }, identityCopy: { flex: 1, gap: spacing.xs }, name: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold }, meta: { color: colors.textSecondary, fontSize: typography.sizes.caption }, setting: { minHeight: 66, flexDirection: 'row', alignItems: 'center' }, settingCopy: { flex: 1, paddingRight: spacing.md }, settingTitle: { color: colors.textPrimary, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold }, settingText: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption }, divider: { height: 1, backgroundColor: colors.border }, infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.md }, infoLabel: { color: colors.textSecondary, fontSize: typography.sizes.supporting }, infoValue: { flex: 1, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold, textAlign: 'right' }, localNote: { color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption, textAlign: 'center' } });
