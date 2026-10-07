import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BloodTypeBadge, Card, InfoBanner, Screen, SectionHeader } from '../../components';
import { DonorAlertCard, EligibilitySummary } from '../../components/donor';
import { ROUTES } from '../../constants';
import { mockBloodAlerts, mockDonorProfile } from '../../mocks/donorData';
import { colors, radius, spacing, typography } from '../../theme';

export default function DonorHomeScreen({ navigation }) {
  const [available, setAvailable] = useState(mockDonorProfile.available);
  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={styles.screen}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroTop}><View><Text style={styles.eyebrow}>DONOR DASHBOARD</Text><Text style={styles.title}>Hello, {mockDonorProfile.name.split(' ')[0]}</Text></View><BloodTypeBadge type={mockDonorProfile.bloodType} size="large" /></View>
          <View style={styles.availability}><View style={styles.availabilityCopy}><Text style={styles.availabilityTitle}>Available to donate</Text><Text style={styles.availabilityText}>{available ? 'Nearby emergency alerts are enabled' : 'You will not receive nearby matches'}</Text></View><Switch value={available} onValueChange={setAvailable} trackColor={{ false: colors.borderStrong, true: colors.success }} thumbColor={colors.white} /></View>
        </View>

        <View style={styles.stats}>
          <Card style={styles.stat}><MaterialCommunityIcons name="water-outline" size={24} color={colors.primary} /><Text style={styles.statValue}>{mockDonorProfile.donationsMade}</Text><Text style={styles.statLabel}>Donations</Text></Card>
          <Card style={styles.stat}><MaterialCommunityIcons name="account-heart-outline" size={24} color={colors.success} /><Text style={styles.statValue}>{mockDonorProfile.patientsSupported}</Text><Text style={styles.statLabel}>People helped</Text></Card>
        </View>

        <EligibilitySummary daysRemaining={mockDonorProfile.daysUntilEligible} eligibleDate="10 Oct 2026" />
        <InfoBanner title="Your availability matters" message="Keep your status current so BloodLink only sends alerts when you can respond." />

        <SectionHeader title="Blood needed near you" actionLabel="View all" onAction={() => navigation.navigate(ROUTES.DONOR_ALERTS_TAB)} />
        <View style={styles.list}>{mockBloodAlerts.slice(0, 2).map((alert) => <DonorAlertCard key={alert.id} alert={alert} onPress={() => navigation.navigate(ROUTES.BLOOD_ALERT, { alertId: alert.id })} />)}</View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.xxxl }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl },
  hero: { marginHorizontal: -spacing.xl, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl, gap: spacing.xl, backgroundColor: colors.primary },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eyebrow: { color: 'rgba(255,255,255,0.78)', fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, letterSpacing: 0.8 }, title: { marginTop: spacing.xs, color: colors.white, fontSize: typography.sizes.display, fontWeight: typography.weights.extrabold },
  availability: { minHeight: 72, flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.12)' }, availabilityCopy: { flex: 1, paddingRight: spacing.md }, availabilityTitle: { color: colors.white, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }, availabilityText: { marginTop: 2, color: 'rgba(255,255,255,0.78)', fontSize: typography.sizes.caption },
  stats: { flexDirection: 'row', gap: spacing.md }, stat: { flex: 1, alignItems: 'center', gap: spacing.xs }, statValue: { color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold }, statLabel: { color: colors.textSecondary, fontSize: typography.sizes.caption }, list: { gap: spacing.md },
});
