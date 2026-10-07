import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export default function RequestProgress({ fulfilled = 0, required = 1, label = 'units confirmed' }) {
  const safeRequired = Math.max(Number(required) || 1, 1);
  const safeFulfilled = Math.max(0, Math.min(Number(fulfilled) || 0, safeRequired));
  const percentage = Math.round((safeFulfilled / safeRequired) * 100);
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: safeRequired, now: safeFulfilled }}>
      <View style={styles.copyRow}>
        <Text style={styles.value}>{safeFulfilled} of {safeRequired} {label}</Text>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      <View style={styles.track}><View style={[styles.fill, { width: `${percentage}%` }]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  copyRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  value: { flex: 1, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  percentage: { color: colors.textSecondary, fontSize: typography.sizes.caption },
  track: { height: 6, overflow: 'hidden', marginTop: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.success },
});
