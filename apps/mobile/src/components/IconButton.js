import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, controlHeights, iconSizes, radius } from '../theme';

export default function IconButton({ icon, onPress, size = iconSizes.navigation, variant = 'surface', color, disabled = false, style, ...props }) {
  const isGhost = variant === 'ghost';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        !isGhost && styles.surface,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <MaterialCommunityIcons name={icon} size={size} color={color ?? colors.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: controlHeights.touchTarget, height: controlHeights.touchTarget, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  surface: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pressed: { backgroundColor: colors.surfaceMuted },
  disabled: { opacity: 0.4 },
});
