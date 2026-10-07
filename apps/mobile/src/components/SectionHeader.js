import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, controlHeights, spacing, typography } from '../theme';

export default function SectionHeader({ title, subtitle, actionLabel, onAction, right, style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ?? (actionLabel ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: controlHeights.touchTarget, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg },
  copy: { flex: 1 },
  title: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, lineHeight: typography.lineHeights.sectionTitle, fontWeight: typography.weights.bold },
  subtitle: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting },
  action: { minHeight: controlHeights.touchTarget, justifyContent: 'center', paddingLeft: spacing.md },
  actionText: { color: colors.primary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
});
