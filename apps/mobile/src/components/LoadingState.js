import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

export default function LoadingState({ message = 'Loading...', compact = false, style }) {
  return (
    <View style={[styles.container, compact && styles.compact, style]} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size={compact ? 'small' : 'large'} color={colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 240, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  compact: { flex: 0, minHeight: 96 },
  message: { marginTop: spacing.md, color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting, textAlign: 'center' },
});
