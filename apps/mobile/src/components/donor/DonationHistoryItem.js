import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BloodTypeBadge from '../BloodTypeBadge';
import Card from '../Card';
import { colors, spacing, typography } from '../../theme';

function formatDate(value) {
  return new Intl.DateTimeFormat('en-LK', { dateStyle: 'medium' }).format(new Date(value));
}

export default function DonationHistoryItem({ donation }) {
  return (
    <Card>
      <View style={styles.row}>
        <BloodTypeBadge type={donation.bloodType} size="small" />
        <View style={styles.copy}>
          <View style={styles.titleRow}><Text style={styles.date}>{formatDate(donation.date)}</Text><Text style={styles.units}>{donation.units} unit</Text></View>
          <Text style={styles.hospital}>{donation.hospital}</Text>
          <Text style={styles.meta}>{donation.location} · {donation.department} · Patient {donation.patientReference}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  copy: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  date: { color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.bold },
  units: { color: colors.textSecondary, fontSize: typography.sizes.caption },
  hospital: { marginTop: spacing.sm, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  meta: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption },
});
