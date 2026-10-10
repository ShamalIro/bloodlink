import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader, BloodTypeBadge, Card, InfoBanner, PrimaryButton, Screen, SecondaryButton, StatusBadge } from '../../components';
import { ROUTES } from '../../constants';
import { respondToRequest } from '../../services/donorApi';
import { colors, spacing, typography } from '../../theme';

const Row = ({ icon, label, value }) => (
  <View style={styles.row}>
    <MaterialCommunityIcons name={icon} size={21} color={colors.primary} />
    <View style={styles.rowCopy}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>
  </View>
);

export default function BloodAlertScreen({ navigation, route }) {
  const alert = route.params?.alert;
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  if (!alert) {
    return (
      <Screen safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={styles.screen}>
        <View style={styles.content}>
          <AppHeader title="Blood alert" onBack={navigation.goBack} />
          <InfoBanner title="Alert not found" message="Open this request again from the Alerts tab." />
        </View>
      </Screen>
    );
  }

  const extras = {};
  if (Number.isFinite(alert.distanceKm)) extras.distanceKm = alert.distanceKm;
  if (Number.isFinite(alert.etaMinutes)) extras.etaMinutes = alert.etaMinutes;

  const respond = async (action) => {
    if (busy) return;
    setError('');
    setBusy(action);
    try {
      await respondToRequest(alert.id, action, extras);
      if (action === 'accept') navigation.replace(ROUTES.REQUEST_ACCEPTED, { alertId: alert.id, alert });
      else navigation.goBack();
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not send your response. Please try again.');
      setBusy('');
    }
  };

  const travel = Number.isFinite(alert.distanceKm)
    ? `${alert.distanceKm} km${Number.isFinite(alert.etaMinutes) ? ` \u00B7 About ${alert.etaMinutes} minutes` : ''}`
    : 'Distance not available';

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={styles.screen}>
      <View style={styles.content}>
        <AppHeader title="Blood alert" subtitle={alert.createdLabel} onBack={navigation.goBack} />
        <Card elevated style={styles.summary}>
          <View style={styles.summaryTop}>
            <BloodTypeBadge type={alert.bloodType} size="large" />
            <StatusBadge label="URGENT" variant="warning" dot />
          </View>
          <Text style={styles.units}>{alert.unitsRequired} {alert.unitsRequired === 1 ? 'unit' : 'units'} required</Text>
        </Card>
        <Card>
          <Row icon="hospital-building" label="Hospital" value={alert.hospital.name} />
          <Row icon="car-outline" label="Travel estimate" value={travel} />
        </Card>
        {alert.notes ? <InfoBanner title="Hospital notes" message={alert.notes} /> : null}
        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        <PrimaryButton title="I can donate" loading={busy === 'accept'} disabled={Boolean(busy)} icon="heart-pulse" onPress={() => respond('accept')} />
        <SecondaryButton title="Decline this alert" loading={busy === 'decline'} disabled={Boolean(busy)} onPress={() => respond('decline')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl },
  summary: { gap: spacing.md },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  units: { color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold },
  row: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowCopy: { flex: 1 },
  label: { color: colors.textSecondary, fontSize: typography.sizes.caption },
  value: { marginTop: 2, color: colors.textPrimary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting, fontWeight: typography.weights.semibold },
  error: { color: colors.error, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting },
});