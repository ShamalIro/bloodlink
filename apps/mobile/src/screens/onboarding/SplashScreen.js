import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '../../components';
import { colors, spacing, typography } from '../../theme';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.glow} />
      <BrandMark light />
      <ActivityIndicator color={colors.white} style={styles.spinner} accessibilityLabel="Loading BloodLink" />
      <Text style={styles.footer}>National Blood Transfusion Service · Sri Lanka</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, backgroundColor: colors.primary },
  glow: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(255,255,255,0.05)' },
  spinner: { marginTop: spacing.xxxl },
  footer: { position: 'absolute', bottom: spacing.xxxl, color: 'rgba(255,255,255,0.72)', fontSize: typography.sizes.caption, textAlign: 'center' },
});
