import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import IconButton from '../IconButton';
import { colors, radius, spacing, typography } from '../../theme';

export default function UnitStepper({ value, onChange, min = 1, max = 20, disabled = false }) {
  const decrement = () => onChange?.(Math.max(min, value - 1));
  const increment = () => onChange?.(Math.min(max, value + 1));
  return (
    <View style={styles.container}>
      <IconButton icon="minus" onPress={decrement} disabled={disabled || value <= min} accessibilityLabel="Decrease units" />
      <View style={styles.valueWrap}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{value === 1 ? 'Unit' : 'Units'}</Text>
      </View>
      <IconButton icon="plus" onPress={increment} disabled={disabled || value >= max} accessibilityLabel="Increase units" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 112, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  valueWrap: { alignItems: 'center' },
  value: { color: colors.textPrimary, fontSize: 40, lineHeight: 46, fontWeight: typography.weights.extrabold },
  label: { color: colors.textSecondary, fontSize: typography.sizes.caption, textTransform: 'uppercase', letterSpacing: 0.7 },
});
