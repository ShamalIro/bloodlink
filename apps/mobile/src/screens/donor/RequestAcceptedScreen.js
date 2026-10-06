import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader, Card, InfoBanner, PrimaryButton, Screen, SecondaryButton, StatusBadge } from '../../components';
import { ROUTES } from '../../constants';
import { mockAcceptedRequest } from '../../mocks/donorData';
import { colors, radius, spacing, typography } from '../../theme';

export default function RequestAcceptedScreen({ navigation }) {
  return <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={styles.screen}><View style={styles.content}>
    <AppHeader title="Donation response" onBack={navigation.goBack} />
    <View style={styles.successIcon}><MaterialCommunityIcons name="check" size={40} color={colors.white} /></View>
    <View style={styles.center}><StatusBadge label="RESPONSE CONFIRMED" variant="success" dot /><Text style={styles.title}>Thank you for responding</Text><Text style={styles.subtitle}>The hospital has been notified and is preparing for your arrival.</Text></View>
    <Card elevated><Text style={styles.hospital}>{mockAcceptedRequest.hospital.name}</Text><Text style={styles.address}>{mockAcceptedRequest.hospital.address}</Text><View style={styles.divider} /><View style={styles.detail}><Text style={styles.detailLabel}>Coordinator</Text><Text style={styles.detailValue}>{mockAcceptedRequest.coordinator}</Text></View><View style={styles.detail}><Text style={styles.detailLabel}>Travel estimate</Text><Text style={styles.detailValue}>{mockAcceptedRequest.distanceKm} km · {mockAcceptedRequest.etaMinutes} min</Text></View><View style={styles.detail}><Text style={styles.detailLabel}>Accepted</Text><Text style={styles.detailValue}>{mockAcceptedRequest.acceptedAt}</Text></View></Card>
    <InfoBanner title="Before you leave" message="Bring a photo ID, stay hydrated, and tell hospital staff if you feel unwell." />
    <PrimaryButton title="Chat with hospital" icon="message-text-outline" onPress={() => navigation.navigate(ROUTES.HOSPITAL_CHAT)} />
    <SecondaryButton title="Back to donor home" onPress={() => navigation.navigate(ROUTES.DONOR_HOME_TAB, { screen: ROUTES.DONOR_HOME })} />
  </View></Screen>;
}
const styles = StyleSheet.create({ screen: { paddingBottom: spacing.xxxl }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl }, successIcon: { alignSelf: 'center', width: 76, height: 76, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.success }, center: { alignItems: 'center', gap: spacing.sm }, title: { color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold, textAlign: 'center' }, subtitle: { color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting, textAlign: 'center' }, hospital: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold }, address: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.supporting }, divider: { height: 1, marginVertical: spacing.lg, backgroundColor: colors.border }, detail: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.md }, detailLabel: { color: colors.textSecondary, fontSize: typography.sizes.supporting }, detailValue: { flex: 1, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold, textAlign: 'right' } });
