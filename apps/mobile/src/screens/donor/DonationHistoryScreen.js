import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Screen } from '../../components';
import { DonationHistoryItem } from '../../components/donor';
import { mockDonationHistory, mockDonorProfile } from '../../mocks/donorData';
import { colors, spacing, typography } from '../../theme';

export default function DonationHistoryScreen() {
  return <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={styles.screen}><View style={styles.content}>
    <View><Text style={styles.eyebrow}>YOUR IMPACT</Text><Text style={styles.title}>Donation history</Text><Text style={styles.subtitle}>A record of donations confirmed through BloodLink.</Text></View>
    <View style={styles.stats}><Card style={styles.stat}><Text style={styles.statValue}>{mockDonorProfile.donationsMade}</Text><Text style={styles.statLabel}>Total donations</Text></Card><Card style={styles.stat}><Text style={styles.statValue}>{mockDonorProfile.patientsSupported}</Text><Text style={styles.statLabel}>People supported</Text></Card></View>
    <Text style={styles.section}>Recent donations</Text>
    <View style={styles.list}>{mockDonationHistory.map((donation) => <DonationHistoryItem key={donation.id} donation={donation} />)}</View>
  </View></Screen>;
}
const styles = StyleSheet.create({ screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl }, eyebrow: { color: colors.primary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, letterSpacing: 0.8 }, title: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.display, fontWeight: typography.weights.extrabold }, subtitle: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.supporting }, stats: { flexDirection: 'row', gap: spacing.md }, stat: { flex: 1 }, statValue: { color: colors.primary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold }, statLabel: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption }, section: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold }, list: { gap: spacing.md } });
