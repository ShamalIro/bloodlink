import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from './Screen';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import { colors, iconSizes, radius, spacing, typography } from '../theme';

const palettes = {
  success: { foreground: colors.success, background: colors.successSoft, icon: 'check' },
  error: { foreground: colors.critical, background: colors.criticalSoft, icon: 'close' },
  info: { foreground: colors.info, background: colors.infoSoft, icon: 'information-outline' },
};

export default function ResultScreen({
  variant = 'success',
  icon,
  title,
  message,
  primaryAction,
  secondaryAction,
  children,
}) {
  const palette = palettes[variant] ?? palettes.success;
  return (
    <Screen contentContainerStyle={styles.screen}>
      <View style={[styles.iconWrap, { backgroundColor: palette.background }]}>
        <MaterialCommunityIcons name={icon ?? palette.icon} size={iconSizes.state} color={palette.foreground} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {children ? <View style={styles.details}>{children}</View> : null}
      <View style={styles.actions}>
        {primaryAction ? <PrimaryButton {...primaryAction} /> : null}
        {secondaryAction ? <SecondaryButton {...secondaryAction} /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl },
  iconWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  title: { marginTop: spacing.xxl, color: colors.textPrimary, fontSize: typography.sizes.title, lineHeight: typography.lineHeights.title, fontWeight: typography.weights.bold, textAlign: 'center' },
  message: { maxWidth: 360, marginTop: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body, textAlign: 'center' },
  details: { alignSelf: 'stretch', marginTop: spacing.xxl },
  actions: { alignSelf: 'stretch', gap: spacing.md, marginTop: spacing.xxxl },
});
