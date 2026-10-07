import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import IconButton from './IconButton';
import { colors, controlHeights, spacing, typography } from '../theme';

export default function AppHeader({ title, subtitle, onBack, right, style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.side}>
        {onBack ? (
          <IconButton
            icon="chevron-left"
            onPress={onBack}
            accessibilityLabel="Go back"
            variant="ghost"
          />
        ) : null}
      </View>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.side, styles.right]}>
        {typeof right === 'string' ? (
          <MaterialCommunityIcons name={right} size={24} color={colors.textSecondary} />
        ) : right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  side: { width: controlHeights.touchTarget, minHeight: controlHeights.touchTarget, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  copy: { flex: 1, paddingHorizontal: spacing.sm },
  title: { color: colors.textPrimary, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body, fontWeight: typography.weights.bold },
  subtitle: { marginTop: 1, color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption },
});
