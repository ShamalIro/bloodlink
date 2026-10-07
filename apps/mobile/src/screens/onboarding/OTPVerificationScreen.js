import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader, InfoBanner, OTPInput, PrimaryButton, Screen } from '../../components';
import { colors, spacing, typography } from '../../theme';

export default function OTPVerificationScreen({ navigation, route }) {
  const [code, setCode] = useState('');
  const phone = route.params?.phone ?? 'your mobile number';
  return (
    <Screen padded={false} keyboardAvoiding>
      <AppHeader title="Verify your number" onBack={navigation.goBack} />
      <View style={styles.outer}>
        <View style={styles.content}>
          <Text style={styles.title}>Enter the 6-digit code</Text>
          <Text style={styles.subtitle}>Sent to {phone}</Text>
          <OTPInput value={code} onChangeText={setCode} autoFocus />
          <View style={styles.resendRow}>
            <Text style={styles.resendMuted}>Resend code in 00:42</Text>
            <Pressable disabled><Text style={styles.resendDisabled}>Resend</Text></Pressable>
          </View>
          <InfoBanner title="SMS verification is not connected" message="This screen is ready for the future OTP service, but it will not create a session or call an invented endpoint." />
          <PrimaryButton title="Verify" disabled={code.length !== 6} onPress={() => {}} style={styles.button} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },
  content: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  title: { color: colors.textPrimary, fontSize: typography.sizes.title, lineHeight: typography.lineHeights.title, fontWeight: typography.weights.extrabold },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xxl, color: colors.textSecondary, fontSize: typography.sizes.body },
  resendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, marginBottom: spacing.xxl },
  resendMuted: { color: colors.textSecondary, fontSize: typography.sizes.supporting },
  resendDisabled: { color: colors.textTertiary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  button: { marginTop: spacing.xxl },
});
