import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EmergencyBanner, Screen } from '../../components';
import { DonorAlertCard } from '../../components/donor';
import { ROUTES } from '../../constants';
import { mockBloodAlerts } from '../../mocks/donorData';
import { colors, spacing, typography } from '../../theme';

export default function DonorAlertsScreen({ navigation }) {
  return <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={styles.screen}><View style={styles.content}>
    <View><Text style={styles.eyebrow}>BLOOD ALERTS</Text><Text style={styles.title}>Requests near you</Text><Text style={styles.subtitle}>Matches are based on your blood type and saved location.</Text></View>
    <EmergencyBanner title="1 critical match nearby" message="A matching request at National Hospital needs an immediate response." />
    <View style={styles.list}>{mockBloodAlerts.map((alert, index) => <DonorAlertCard key={alert.id} alert={alert} onPress={() => navigation.navigate(index === 0 ? ROUTES.EMERGENCY_MATCH : ROUTES.BLOOD_ALERT, { alertId: alert.id })} />)}</View>
  </View></Screen>;
}
const styles = StyleSheet.create({ screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl }, eyebrow: { color: colors.primary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, letterSpacing: 0.8 }, title: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.display, fontWeight: typography.weights.extrabold }, subtitle: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting }, list: { gap: spacing.md } });
