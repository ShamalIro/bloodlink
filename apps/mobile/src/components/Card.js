import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, layout, radius, shadows } from '../theme';

export default function Card({ children, onPress, elevated = false, style, ...props }) {
  const cardStyle = [styles.base, elevated && shadows.card, style];
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={cardStyle} {...props}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { padding: layout.cardPadding, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg },
  pressed: { backgroundColor: colors.surfaceMuted },
});
