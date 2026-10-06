import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SecondaryButton from './SecondaryButton';
import { colors, iconSizes, radius, spacing, typography } from '../theme';

export default function EmptyState({ icon = 'inbox-outline', title, message, actionLabel, onAction, style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={iconSizes.large} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel ? <SecondaryButton title={actionLabel} onPress={onAction} compact fullWidth={false} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 280, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  iconWrap: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  title: { marginTop: spacing.lg, color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, lineHeight: typography.lineHeights.sectionTitle, fontWeight: typography.weights.bold, textAlign: 'center' },
  message: { maxWidth: 320, marginTop: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting, textAlign: 'center' },
  action: { marginTop: spacing.xl },
});
