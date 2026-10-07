import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, controlHeights, iconSizes, radius, spacing, typography } from '../theme';

const variants = {
  primary: { background: colors.primary, pressed: colors.primaryPressed, text: colors.white, border: colors.primary },
  secondary: { background: colors.surface, pressed: colors.surfaceMuted, text: colors.primary, border: colors.primary },
  destructive: { background: colors.critical, pressed: colors.primaryDark, text: colors.white, border: colors.critical },
};

export default function ActionButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  compact = false,
  fullWidth = true,
  style,
  textStyle,
  accessibilityLabel,
  ...props
}) {
  const palette = variants[variant] ?? variants.primary;
  const isDisabled = disabled || loading;
  const iconNode = icon ? (
    <MaterialCommunityIcons name={icon} size={iconSizes.medium} color={palette.text} />
  ) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : styles.regular,
        fullWidth && styles.fullWidth,
        { backgroundColor: pressed ? palette.pressed : palette.background, borderColor: palette.border },
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <View style={styles.content}>
          {iconPosition === 'left' ? iconNode : null}
          <Text style={[styles.label, { color: palette.text }, textStyle]}>{title}</Text>
          {iconPosition === 'right' ? iconNode : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  regular: { minHeight: controlHeights.button },
  compact: { minHeight: controlHeights.buttonCompact },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.48 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  label: { fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body, fontWeight: typography.weights.semibold, textAlign: 'center' },
});
