import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandMark, FormInput, InfoBanner, PasswordInput, PrimaryButton, Screen } from '../../components';
import { normalizeRole, ROLES, ROUTES } from '../../constants';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../store/AuthContext';
import { login } from '../../services/authApi';

const roleLabels = {
  [ROLES.DONOR]: 'Blood Donor',
  [ROLES.REQUESTER]: 'Requester',
  [ROLES.COORDINATOR]: 'Hospital Coordinator',
  [ROLES.NGO]: 'NGO Staff',
};

export default function LoginScreen({ navigation, route }) {
  const role = normalizeRole(route.params?.role);
  const { signIn } = useAuth();
  const passwordRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  const onSubmit = async () => {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const data = await login({ email: email.trim().toLowerCase(), password });
      await signIn(data.token, data.user);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || (requestError?.message === 'Network Error'
        ? 'Cannot reach the server. Check your connection.'
        : 'Incorrect email or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding contentContainerStyle={styles.screen}>
      <View style={styles.content}>
        <BrandMark />
        <View style={styles.heading}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>{role ? `Continue as ${roleLabels[role]}.` : 'Sign in to request or donate blood.'}</Text>
        </View>
        {role ? (
          <View style={styles.roleRow}>
            <Text style={styles.roleText}>Signing in as <Text style={styles.roleStrong}>{roleLabels[role]}</Text></Text>
            <Pressable onPress={() => navigation.navigate(ROUTES.ROLE_SELECTION)} hitSlop={8}><Text style={styles.change}>Change</Text></Pressable>
          </View>
        ) : null}
        <View style={styles.form}>
          <FormInput label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="next" leftIcon="email-outline" onSubmitEditing={() => passwordRef.current?.focus()} />
          <PasswordInput ref={passwordRef} label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" returnKeyType="done" onSubmitEditing={canSubmit ? onSubmit : undefined} />
        </View>
        <Pressable onPress={() => setNotice('Password recovery is not available in the current backend yet.')} style={styles.forgot} hitSlop={8}><Text style={styles.forgotText}>Forgot password?</Text></Pressable>
        {notice ? <InfoBanner message={notice} style={styles.feedback} /> : null}
        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        <PrimaryButton title="Sign in" onPress={onSubmit} disabled={!canSubmit} loading={loading} />
        <Pressable onPress={() => navigation.navigate(ROUTES.CREATE_ACCOUNT, { role })} style={styles.createLink}>
          <Text style={styles.createText}>Don’t have an account? <Text style={styles.createStrong}>Create one</Text></Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center', paddingVertical: spacing.xxxl },
  content: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  heading: { marginTop: spacing.xxxl, alignItems: 'center' },
  title: { color: colors.textPrimary, fontSize: typography.sizes.title, lineHeight: typography.lineHeights.title, fontWeight: typography.weights.extrabold },
  subtitle: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body, textAlign: 'center' },
  roleRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, paddingHorizontal: spacing.md, borderRadius: 12, backgroundColor: colors.primaryTint },
  roleText: { color: colors.textSecondary, fontSize: typography.sizes.supporting },
  roleStrong: { color: colors.textPrimary, fontWeight: typography.weights.bold },
  change: { color: colors.primary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  form: { gap: spacing.lg, marginTop: spacing.xxl },
  forgot: { minHeight: 44, alignSelf: 'flex-end', justifyContent: 'center' },
  forgotText: { color: colors.primary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  feedback: { marginBottom: spacing.lg },
  error: { marginBottom: spacing.lg, color: colors.error, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting },
  createLink: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  createText: { color: colors.textSecondary, fontSize: typography.sizes.supporting },
  createStrong: { color: colors.primary, fontWeight: typography.weights.bold },
});
