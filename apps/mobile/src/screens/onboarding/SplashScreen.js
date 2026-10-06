import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

// Not a stack screen: RootNavigator renders this while AuthContext is booting.
export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <MaterialCommunityIcons name="water" size={72} color={colors.primary} />
      </View>
      <Text style={styles.title}>BloodLink</Text>
      <Text style={styles.tagline}>Emergency blood, found faster.</Text>
      <ActivityIndicator color="#fff" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoWrap: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontSize: 34, fontWeight: '800', color: '#fff' },
  tagline: { marginTop: spacing.sm, fontSize: 15, color: 'rgba(255,255,255,0.85)' },
  spinner: { marginTop: spacing.xl },
});