import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BloodTypeBadge from '../BloodTypeBadge';
import Card from '../Card';
import RequestProgress from './RequestProgress';
import StatusBadge from '../StatusBadge';
import { colors, spacing, typography } from '../../theme';

const statusPresentation = {
  pending: { label: 'Pending verification', variant: 'warning' },
  broadcasting: { label: 'Broadcasting', variant: 'critical' },
  fulfilled: { label: 'Fulfilled', variant: 'success' },
  closed: { label: 'Closed', variant: 'neutral' },
};

function formatDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-LK', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function RequestCard({ request, onPress, style }) {
  const status = statusPresentation[request?.status] ?? statusPresentation.pending;
  const requestId = request?._id ? request._id.slice(-6).toUpperCase() : 'NEW';
  return (
    <Card onPress={onPress} style={style}>
      <View style={styles.header}>
        <BloodTypeBadge type={request?.bloodType ?? '—'} size="small" critical={request?.status === 'broadcasting'} />
        <View style={styles.heading}>
          <Text style={styles.id}>REQ-{requestId}</Text>
          <StatusBadge label={status.label} variant={status.variant} dot />
        </View>
        {onPress ? <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} /> : null}
      </View>
      <Text style={styles.hospital} numberOfLines={2}>{request?.hospital?.name ?? 'Hospital not available'}</Text>
      <Text style={styles.meta}>{request?.unitsRequired ?? 0} units requested · {formatDate(request?.createdAt)}</Text>
      <RequestProgress fulfilled={request?.unitsFulfilled} required={request?.unitsRequired} />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heading: { flex: 1, alignItems: 'flex-start', gap: spacing.xs },
  id: { color: colors.textSecondary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, letterSpacing: 0.4 },
  hospital: { marginTop: spacing.lg, color: colors.textPrimary, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body, fontWeight: typography.weights.bold },
  meta: { marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption },
});
