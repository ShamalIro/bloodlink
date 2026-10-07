import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader, BloodTypeBadge, Card, PrimaryButton, Screen, SecondaryButton, StatusBadge } from '../../components';
import { ROUTES } from '../../constants';
import { mockBloodAlerts } from '../../mocks/donorData';
import { colors, radius, spacing, typography } from '../../theme';

export default function EmergencyMatchScreen({ navigation, route }) {
  const alert = mockBloodAlerts.find((item) => item.id === route.params?.alertId) || mockBloodAlerts[0];
  return <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={styles.screen}><View style={styles.content}>
    <AppHeader title="Emergency match" onBack={navigation.goBack} />
    <View style={styles.pulse}><MaterialCommunityIcons name="alarm-light-outline" size={38} color={colors.critical} /></View>
    <View style={styles.center}><StatusBadge label="CRITICAL REQUEST" variant="critical" dot /><Text style={styles.title}>You are a match</Text><Text style={styles.subtitle}>A verified hospital nearby urgently needs your blood type.</Text></View>
    <Card elevated style={styles.match}><BloodTypeBadge type={alert.bloodType} size="large" critical /><View style={styles.matchCopy}><Text style={styles.hospital}>{alert.hospital.name}</Text><Text style={styles.meta}>{alert.distanceKm} km away · About {alert.etaMinutes} min</Text><Text style={styles.meta}>{alert.unitsRequired} units needed · {alert.createdLabel}</Text></View></Card>
    <PrimaryButton title="View emergency details" icon="arrow-right" iconPosition="right" onPress={() => navigation.replace(ROUTES.BLOOD_ALERT, { alertId: alert.id })} />
    <SecondaryButton title="Not available now" onPress={navigation.goBack} />
    <Text style={styles.note}>Respond only if you feel well and are currently eligible to donate.</Text>
  </View></Screen>;
}
const styles = StyleSheet.create({ screen: { paddingBottom: spacing.xxxl }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl }, pulse: { alignSelf: 'center', width: 76, height: 76, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.criticalSoft }, center: { alignItems: 'center', gap: spacing.sm }, title: { color: colors.textPrimary, fontSize: typography.sizes.display, fontWeight: typography.weights.extrabold }, subtitle: { color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting, textAlign: 'center' }, match: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg }, matchCopy: { flex: 1 }, hospital: { color: colors.textPrimary, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }, meta: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption }, note: { color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption, textAlign: 'center' } });
