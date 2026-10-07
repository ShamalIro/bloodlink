import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export default function BloodTypeBadge({ type, size = 'medium', critical = false, selected = false, style }) {
  const emphasized = critical || selected;
  return (
    <View
      accessibilityLabel={`Blood type ${type}`}
      style={[styles.base, styles[size] ?? styles.medium, emphasized && styles.emphasized, style]}
    >
      <Text style={[styles.text, emphasized && styles.emphasizedText]}>{type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryTint, borderWidth: 1, borderColor: colors.primaryTint, borderRadius: radius.md },
  small: { minWidth: 36, minHeight: 32, paddingHorizontal: spacing.sm },
  medium: { minWidth: 48, minHeight: 44, paddingHorizontal: spacing.md },
  large: { minWidth: 64, minHeight: 60, paddingHorizontal: spacing.lg },
  emphasized: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.primary, fontSize: typography.sizes.body, fontWeight: typography.weights.bold },
  emphasizedText: { color: colors.white },
});
