import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../theme';
import { useAuth } from '../../store/AuthContext';
import { login } from '../../services/authApi';

export default function LoginScreen({ navigation, route }) {
  const role = route.params?.role; // set by Role Selection later
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await login({ email: email.trim().toLowerCase(), password });
      await signIn(data.token, data.user); // flips RootNavigator to the requester flow
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          (e?.message === 'Network Error'
            ? 'Cannot reach the server. Check your connection.'
            : 'Incorrect email or password.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Log in</Text>
        <Text style={styles.subtitle}>
          {role ? `Continue as ${role}.` : 'Welcome back to BloodLink.'}
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="next"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.pwRow}>
          <TextInput
            style={[styles.input, styles.pwInput]}
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPw}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={canSubmit ? onSubmit : undefined}
          />
          <TouchableOpacity
            style={styles.eye}
            onPress={() => setShowPw((s) => !s)}
            accessibilityLabel={showPw ? 'Hide password' : 'Show password'}
          >
            <MaterialCommunityIcons
              name={showPw ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={!canSubmit}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate('CreateAccount', { role })}
        >
          <Text style={styles.linkText}>
            New here? <Text style={styles.linkStrong}>Create an account</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  pwRow: { justifyContent: 'center' },
  pwInput: { paddingRight: 48 },
  eye: { position: 'absolute', right: spacing.md },
  error: { color: colors.error, marginTop: spacing.md, fontSize: 14 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { alignItems: 'center', marginTop: spacing.lg },
  linkText: { color: colors.textMuted, fontSize: 14 },
  linkStrong: { color: colors.primary, fontWeight: '700' },
});