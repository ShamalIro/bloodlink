import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PrimaryButton from './PrimaryButton';
import { colors, iconSizes, radius, spacing, typography } from '../theme';

export default function ErrorState({ title = 'Something went wrong', message, retryLabel = 'Try again', onRetry, style }) {
  return (
    <View style={[styles.container, style]} accessibilityRole="alert">
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="alert-circle-outline" size={iconSizes.large} color={colors.critical} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onRetry ? <PrimaryButton title={retryLabel} onPress={onRetry} compact fullWidth={false} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 280, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  iconWrap: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.criticalSoft },
  title: { marginTop: spacing.lg, color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, lineHeight: typography.lineHeights.sectionTitle, fontWeight: typography.weights.bold, textAlign: 'center' },
  message: { maxWidth: 320, marginTop: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting, textAlign: 'center' },
  action: { marginTop: spacing.xl },
});
