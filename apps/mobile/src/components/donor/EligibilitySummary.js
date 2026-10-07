import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export default function EligibilitySummary({ daysRemaining, eligibleDate }) {
  const eligible = daysRemaining <= 0;
  return (
    <View style={styles.container}>
      <View style={[styles.ring, eligible && styles.ringEligible]}>
        <Text style={[styles.days, eligible && styles.daysEligible]}>{eligible ? 'Ready' : daysRemaining}</Text>
        <Text style={styles.caption}>{eligible ? 'to donate' : 'days left'}</Text>
      </View>
      <Text style={styles.label}>{eligible ? 'You are eligible to donate' : `Eligible again on ${eligibleDate}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  ring: { width: 148, height: 148, alignItems: 'center', justifyContent: 'center', borderWidth: 10, borderColor: colors.primary, borderRadius: radius.pill, backgroundColor: colors.surface },
  ringEligible: { borderColor: colors.success },
  days: { color: colors.textPrimary, fontSize: 38, fontWeight: typography.weights.extrabold },
  daysEligible: { color: colors.success, fontSize: typography.sizes.title },
  caption: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption },
  label: { marginTop: spacing.lg, color: colors.textSecondary, fontSize: typography.sizes.supporting, textAlign: 'center' },
});
