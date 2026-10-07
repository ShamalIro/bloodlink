import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

const palettes = {
  neutral: { background: colors.surfaceMuted, text: colors.textSecondary },
  success: { background: colors.successSoft, text: colors.success },
  warning: { background: colors.warningSoft, text: colors.warning },
  info: { background: colors.infoSoft, text: colors.info },
  critical: { background: colors.criticalSoft, text: colors.critical },
};

export default function StatusBadge({ label, variant = 'neutral', dot = false, style }) {
  const palette = palettes[variant] ?? palettes.neutral;
  return (
    <View style={[styles.base, { backgroundColor: palette.background }, style]}>
      {dot ? <View style={[styles.dot, { backgroundColor: palette.text }]} /> : null}
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignSelf: 'flex-start', minHeight: 26, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill },
  dot: { width: 6, height: 6, borderRadius: radius.pill },
  text: { fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption, fontWeight: typography.weights.semibold },
});
