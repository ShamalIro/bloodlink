import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BloodTypeBadge from '../BloodTypeBadge';
import Card from '../Card';
import StatusBadge from '../StatusBadge';
import { colors, spacing, typography } from '../../theme';

const urgency = {
  critical: { label: 'Critical', variant: 'critical' },
  urgent: { label: 'Urgent', variant: 'warning' },
  normal: { label: 'Active', variant: 'info' },
};

export default function DonorAlertCard({ alert, onPress, compact = false, style }) {
  const state = urgency[alert.urgency] ?? urgency.normal;
  return (
    <Card onPress={onPress} style={style}>
      <View style={styles.header}>
        <BloodTypeBadge type={alert.bloodType} size={compact ? 'small' : 'medium'} critical={alert.urgency === 'critical'} />
        <View style={styles.copy}>
          <Text style={styles.hospital} numberOfLines={2}>{alert.hospital.name}</Text>
          <View style={styles.badges}><StatusBadge label={state.label} variant={state.variant} dot /><Text style={styles.time}>{alert.createdLabel}</Text></View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
      </View>
      {!compact ? <Text style={styles.address}>{alert.hospital.address}</Text> : null}
      <View style={styles.metrics}>
        <Metric icon="map-marker-distance" value={`${alert.distanceKm} km`} />
        <Metric icon="car-outline" value={`${alert.etaMinutes} min`} />
        <Metric icon="water-outline" value={`${alert.unitsRequired} unit${alert.unitsRequired === 1 ? '' : 's'}`} />
      </View>
    </Card>
  );
}

function Metric({ icon, value }) {
  return <View style={styles.metric}><MaterialCommunityIcons name={icon} size={16} color={colors.textSecondary} /><Text style={styles.metricText}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  copy: { flex: 1 },
  hospital: { color: colors.textPrimary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting, fontWeight: typography.weights.bold },
  badges: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  time: { color: colors.textTertiary, fontSize: typography.sizes.caption },
  address: { marginTop: spacing.md, color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginTop: spacing.lg },
  metric: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metricText: { color: colors.textSecondary, fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold },
});
