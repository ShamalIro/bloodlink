import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EmergencyBanner, ErrorState, InfoBanner, LoadingState, Screen } from '../../components';
import { DonorAlertCard } from '../../components/donor';
import { ROUTES } from '../../constants';
import useDonorAlerts from '../../hooks/useDonorAlerts';
import { colors, spacing, typography } from '../../theme';

export default function DonorAlertsScreen({ navigation }) {
  const { loading, error, alerts, reload } = useDonorAlerts();
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={styles.screen}>
      <View style={styles.content}>
        <View>
          <Text style={styles.eyebrow}>BLOOD ALERTS</Text>
          <Text style={styles.title}>Requests near you</Text>
          <Text style={styles.subtitle}>Matches are based on your blood type and saved location.</Text>
        </View>
        {!loading && !error && alerts.length > 0 ? (
          <EmergencyBanner
            title={`${alerts.length} open ${alerts.length === 1 ? 'request' : 'requests'} near you`}
            message="A hospital near you needs blood. Open an alert to respond."
          />
        ) : null}
        {loading ? <LoadingState compact message="Checking for blood requests..." /> : null}
        {!loading && error ? <ErrorState title="Unable to load alerts" message={error} retryLabel="Retry" onRetry={reload} /> : null}
        {!loading && !error && alerts.length === 0 ? (
          <InfoBanner title="No open requests" message="You will be notified when a hospital near you needs your blood type." />
        ) : null}
        <View style={styles.list}>
          {alerts.map((alert) => (
            <DonorAlertCard key={alert.id} alert={alert} onPress={() => navigation.navigate(ROUTES.BLOOD_ALERT, { alertId: alert.id, alert })} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl },
  eyebrow: { color: colors.primary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, letterSpacing: 0.8 },
  title: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.display, fontWeight: typography.weights.extrabold },
  subtitle: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting },
  list: { gap: spacing.md },
});