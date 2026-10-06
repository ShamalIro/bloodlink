import React from 'react';
import { Card, ResultScreen } from '../../components';
import { ROUTES } from '../../constants';
import { StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function RequestSubmittedScreen({ navigation, route }) {
  const request = route.params?.request;
  const requestId = request?._id;
  return (
    <ResultScreen
      title="Request sent successfully"
      message="Your request is awaiting verification. Once approved, matching donors can be alerted."
      primaryAction={{ title: 'View request status', onPress: () => navigation.replace(ROUTES.REQUEST_STATUS, { requestId, initialRequest: request }), disabled: !requestId }}
      secondaryAction={{ title: 'Back to home', onPress: () => navigation.popToTop() }}
    >
      <Card>
        <Text style={styles.label}>REQUEST SUMMARY</Text>
        <Text style={styles.value}>{request?.bloodType ?? '—'} · {request?.unitsRequired ?? 0} units</Text>
        <Text style={styles.hospital}>{request?.hospital?.name ?? 'Hospital unavailable'}</Text>
      </Card>
    </ResultScreen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, letterSpacing: 0.7 },
  value: { marginTop: spacing.sm, color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
  hospital: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.supporting },
});
