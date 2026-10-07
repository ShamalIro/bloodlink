import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandMark, Card, EmergencyBanner, PhoneInput, PrimaryButton, Screen } from '../../components';
import { ROLES, ROUTES } from '../../constants';
import { colors, spacing, typography } from '../../theme';

export default function DonorPhoneLoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [notice, setNotice] = useState('');
  const canContinue = phone.replace(/\s/g, '').length >= 9;

  const sendOtp = () => {
    setNotice('SMS verification is not connected to the current backend yet. You can preview the verification screen without changing authentication.');
    navigation.navigate(ROUTES.OTP_VERIFICATION, { phone: `+94 ${phone}`, role: ROLES.DONOR });
  };

  return (
    <Screen scroll keyboardAvoiding contentContainerStyle={styles.screen}>
      <View style={styles.content}>
        <BrandMark compact showTagline={false} />
        <Text style={styles.title}>Enter your mobile number</Text>
        <Text style={styles.subtitle}>We’ll send a 6-digit code by SMS. No password to remember.</Text>
        <Card style={styles.roleCard}>
          <Text style={styles.roleLabel}>Signing in as</Text>
          <Text style={styles.roleValue}>Blood Donor</Text>
          <Pressable onPress={() => navigation.navigate(ROUTES.ROLE_SELECTION)} hitSlop={8}>
            <Text style={styles.change}>Change</Text>
          </Pressable>
        </Card>
        <PhoneInput value={phone} onChangeText={setPhone} helperText="Used only for sign-in and hospital contact." containerStyle={styles.field} />
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <PrimaryButton title="Send OTP" onPress={sendOtp} disabled={!canContinue} />
        <EmergencyBanner
          style={styles.sos}
          title="Raise an SOS without an account"
          message="For emergencies, you can start a request and verify your number afterwards."
        />
        <Pressable onPress={() => navigation.navigate(ROUTES.CREATE_ACCOUNT, { role: ROLES.DONOR })} style={styles.link}>
          <Text style={styles.linkText}>New here? <Text style={styles.linkStrong}>Create an account</Text></Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate(ROUTES.LOGIN, { role: ROLES.DONOR })} style={styles.link}>
          <Text style={styles.linkText}>Use email and password instead</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center', paddingVertical: spacing.xxxl },
  content: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  title: { marginTop: spacing.xxxl, color: colors.textPrimary, fontSize: typography.sizes.title, lineHeight: typography.lineHeights.title, fontWeight: typography.weights.extrabold },
  subtitle: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body },
  roleCard: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xxl },
  roleLabel: { color: colors.textSecondary, fontSize: typography.sizes.supporting },
  roleValue: { flex: 1, marginLeft: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.bold },
  change: { color: colors.primary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  field: { marginTop: spacing.xl, marginBottom: spacing.lg },
  notice: { marginBottom: spacing.md, color: colors.info, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption },
  sos: { marginTop: spacing.xl },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
  linkText: { color: colors.textSecondary, fontSize: typography.sizes.supporting, textAlign: 'center' },
  linkStrong: { color: colors.primary, fontWeight: typography.weights.bold },
});
