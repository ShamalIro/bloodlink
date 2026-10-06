import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, iconSizes, radius, spacing, typography } from '../theme';

const palettes = {
  info: { background: colors.infoSoft, border: '#CFE0FF', icon: colors.info },
  emergency: { background: colors.criticalSoft, border: '#F4C7CB', icon: colors.critical },
};

export default function Banner({ title, message, variant = 'info', icon, action, style }) {
  const palette = palettes[variant] ?? palettes.info;
  return (
    <View style={[styles.container, { backgroundColor: palette.background, borderColor: palette.border }, style]} accessibilityRole="summary">
      <MaterialCommunityIcons name={icon} size={iconSizes.navigation} color={palette.icon} />
      <View style={styles.content}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {action ? <View style={styles.action}>{action}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderRadius: radius.lg },
  content: { flex: 1 },
  title: { color: colors.textPrimary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting, fontWeight: typography.weights.bold },
  message: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting },
  action: { marginTop: spacing.md, alignSelf: 'flex-start' },
});
