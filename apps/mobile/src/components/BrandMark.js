import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

export default function BrandMark({ compact = false, light = false, showTagline = true }) {
  const foreground = light ? colors.white : colors.textPrimary;
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, compact && styles.iconWrapCompact, light && styles.iconWrapLight]}>
        <MaterialCommunityIcons name="water" size={compact ? 24 : 34} color={light ? colors.primary : colors.white} />
      </View>
      <Text style={[styles.name, compact && styles.nameCompact, { color: foreground }]}>BloodLink</Text>
      {showTagline ? <Text style={[styles.tagline, light && styles.taglineLight]}>Nearby donors, reached in seconds.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  iconWrap: { width: 64, height: 64, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  iconWrapCompact: { width: 46, height: 46, borderRadius: radius.md },
  iconWrapLight: { backgroundColor: colors.white },
  name: { marginTop: spacing.md, fontSize: typography.sizes.title, lineHeight: typography.lineHeights.title, fontWeight: typography.weights.extrabold },
  nameCompact: { marginTop: spacing.sm, fontSize: typography.sizes.sectionTitle, lineHeight: typography.lineHeights.sectionTitle },
  tagline: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting, textAlign: 'center' },
  taglineLight: { color: 'rgba(255,255,255,0.84)' },
});
