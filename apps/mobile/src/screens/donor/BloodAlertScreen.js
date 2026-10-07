import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader, BloodTypeBadge, Card, InfoBanner, PrimaryButton, Screen, SecondaryButton, StatusBadge } from '../../components';
import { ROUTES } from '../../constants';
import { mockBloodAlerts } from '../../mocks/donorData';
import { colors, spacing, typography } from '../../theme';

const Row = ({ icon, label, value }) => <View style={styles.row}><MaterialCommunityIcons name={icon} size={21} color={colors.primary} /><View style={styles.rowCopy}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View></View>;
export default function BloodAlertScreen({ navigation, route }) {
  const [submitting, setSubmitting] = useState(false);
  const alert = mockBloodAlerts.find((item) => item.id === route.params?.alertId) || mockBloodAlerts[0];
  const accept = () => { if (submitting) return; setSubmitting(true); navigation.replace(ROUTES.REQUEST_ACCEPTED, { alertId: alert.id }); };
  return <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={styles.screen}><View style={styles.content}>
    <AppHeader title="Blood alert" subtitle={alert.createdLabel} onBack={navigation.goBack} />
    <Card elevated style={styles.summary}><View style={styles.summaryTop}><BloodTypeBadge type={alert.bloodType} size="large" critical={alert.urgency === 'critical'} /><StatusBadge label={alert.urgency.toUpperCase()} variant={alert.urgency === 'critical' ? 'critical' : alert.urgency === 'urgent' ? 'warning' : 'neutral'} dot /></View><Text style={styles.units}>{alert.unitsRequired} {alert.unitsRequired === 1 ? 'unit' : 'units'} required</Text><Text style={styles.patient}>{alert.patientReference}</Text></Card>
    <Card><Row icon="hospital-building" label="Hospital" value={alert.hospital.name} /><Row icon="map-marker-outline" label="Location" value={alert.hospital.address} /><Row icon="car-outline" label="Travel estimate" value={`${alert.distanceKm} km · About ${alert.etaMinutes} minutes`} /><Row icon="account-badge-outline" label="Raised by" value={alert.raisedBy} /></Card>
    <InfoBanner title="Hospital notes" message={alert.notes} />
    <PrimaryButton title="I can donate" loading={submitting} disabled={submitting} icon="heart-pulse" onPress={accept} />
    <SecondaryButton title="Decline this alert" onPress={navigation.goBack} />
  </View></Screen>;
}
const styles = StyleSheet.create({ screen: { paddingBottom: spacing.xxxl }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl }, summary: { gap: spacing.md }, summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, units: { color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold }, patient: { color: colors.textSecondary, fontSize: typography.sizes.supporting }, row: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, rowCopy: { flex: 1 }, label: { color: colors.textSecondary, fontSize: typography.sizes.caption }, value: { marginTop: 2, color: colors.textPrimary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting, fontWeight: typography.weights.semibold } });
