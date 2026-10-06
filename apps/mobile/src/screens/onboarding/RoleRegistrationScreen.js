import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  AppHeader, BloodTypeBadge, FormInput, InfoBanner, PasswordInput,
  PhoneInput, PrimaryButton, Screen,
} from '../../components';
import { ROLES, ROUTES } from '../../constants';
import { register } from '../../services/authApi';
import { useAuth } from '../../store/AuthContext';
import { colors, radius, spacing, typography } from '../../theme';

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const configurations = {
  [ROLES.REQUESTER]: {
    title: 'Create an Account', subtitle: 'Requester Sign Up', description: 'Create your account to request blood quickly and safely.',
    nameLabel: 'Full Name', button: 'Create Requester Account', icon: 'hospital-box-outline',
  },
  [ROLES.DONOR]: {
    title: 'Join as Blood Donor', subtitle: 'Be ready to save lives when emergencies arise.', description: 'Receive nearby alerts that match your blood type.',
    nameLabel: 'Full Name', button: 'Complete Donor Registration', icon: 'water-outline',
  },
  [ROLES.COORDINATOR]: {
    title: 'Create Account', subtitle: 'Hospital Coordinator Sign Up', description: 'Register your hospital account to manage urgent blood requests and donor coordination.',
    nameLabel: 'Coordinator Name', button: 'Create Hospital Account', icon: 'hospital-building',
  },
  [ROLES.NGO]: {
    title: 'Create an Account', subtitle: 'NGO Staff', description: 'Create an NGO staff account to organize donation camps and coordinate volunteers.',
    nameLabel: 'Staff Name', button: 'Create NGO Staff Account', icon: 'account-group-outline',
  },
};

const initialForm = {
  name: '', email: '', phone: '', nic: '', bloodType: '', district: '', weight: '',
  organizationName: '', staffId: '', department: '', password: '', confirmPassword: '',
};

export default function RoleRegistrationScreen({ navigation, role }) {
  const config = configurations[role];
  const { signIn } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setField = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));
  const isStaff = role === ROLES.COORDINATOR || role === ROLES.NGO;
  const needsBloodType = role === ROLES.DONOR || role === ROLES.REQUESTER;

  const requiredValues = [form.name, form.email, form.phone, form.password, form.confirmPassword];
  if (role === ROLES.REQUESTER) requiredValues.push(form.nic, form.bloodType, form.district);
  if (role === ROLES.DONOR) requiredValues.push(form.bloodType, form.district, form.weight);
  if (isStaff) requiredValues.push(form.organizationName, form.staffId, form.department);
  const canSubmit = requiredValues.every((value) => value.trim().length > 0)
    && form.password.length >= 6 && form.password === form.confirmPassword && accepted && !loading;

  const submit = async () => {
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role,
      };
      if (role === ROLES.DONOR) {
        payload.bloodType = form.bloodType;
        payload.district = form.district.trim();
      }
      if (isStaff) {
        payload.organizationName = form.organizationName.trim();
        payload.organizationType = role === ROLES.COORDINATOR ? 'hospital' : 'ngo';
        payload.staffIdOrRegNumber = form.staffId.trim();
      }
      const data = await register(payload);
      await signIn(data.token, data.user);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || (requestError?.message === 'Network Error'
        ? 'Cannot reach the server. Check your connection.'
        : 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded={false} scroll keyboardAvoiding>
      <AppHeader title={config.title} onBack={navigation.goBack} />
      <View style={styles.outer}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.subtitle}>{config.subtitle}</Text>
              <Text style={styles.description}>{config.description}</Text>
            </View>
            <View style={styles.heroIcon}><MaterialCommunityIcons name={config.icon} size={32} color={colors.primary} /></View>
          </View>

          <View style={styles.fields}>
            <FormInput label={config.nameLabel} value={form.name} onChangeText={setField('name')} placeholder="Enter your full name" autoComplete="name" />
            {isStaff ? <FormInput label={role === ROLES.COORDINATOR ? 'Hospital Name' : 'NGO Name'} value={form.organizationName} onChangeText={setField('organizationName')} placeholder="Enter organization name" leftIcon="hospital-building" /> : null}
            <FormInput label={isStaff ? 'Work Email' : 'Email'} value={form.email} onChangeText={setField('email')} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" leftIcon="email-outline" />
            <PhoneInput value={form.phone} onChangeText={setField('phone')} />
            {role === ROLES.REQUESTER ? <FormInput label="NIC / ID Number" value={form.nic} onChangeText={setField('nic')} placeholder="Enter your NIC or ID number" leftIcon="card-account-details-outline" /> : null}
            {isStaff ? <FormInput label={role === ROLES.COORDINATOR ? 'Employee ID' : 'Staff ID'} value={form.staffId} onChangeText={setField('staffId')} placeholder="Enter staff identification" leftIcon="badge-account-outline" /> : null}
            {isStaff ? <FormInput label={role === ROLES.COORDINATOR ? 'Department / Unit' : 'District / Area'} value={form.department} onChangeText={setField('department')} placeholder="Enter department or area" leftIcon="map-marker-outline" /> : null}
            {(role === ROLES.REQUESTER || role === ROLES.DONOR) ? <FormInput label="District / City" value={form.district} onChangeText={setField('district')} placeholder="e.g. Colombo" leftIcon="map-marker-outline" /> : null}
            {needsBloodType ? (
              <View>
                <Text style={styles.fieldLabel}>Blood Group</Text>
                <View style={styles.bloodTypes}>
                  {BLOOD_TYPES.map((type) => (
                    <Pressable key={type} onPress={() => setField('bloodType')(type)} accessibilityRole="radio" accessibilityState={{ checked: form.bloodType === type }}>
                      <BloodTypeBadge type={type} selected={form.bloodType === type} />
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}
            {role === ROLES.DONOR ? <FormInput label="Weight (kg)" value={form.weight} onChangeText={setField('weight')} placeholder="Minimum 50 kg" keyboardType="numeric" leftIcon="scale-bathroom" /> : null}
            <PasswordInput label="Password" value={form.password} onChangeText={setField('password')} placeholder="Create a strong password" helperText="Use at least 6 characters." />
            <PasswordInput label="Confirm Password" value={form.confirmPassword} onChangeText={setField('confirmPassword')} placeholder="Re-enter your password" error={form.confirmPassword && form.password !== form.confirmPassword ? 'Passwords do not match.' : ''} />
          </View>

          {isStaff ? <InfoBanner title="Verification required" message="Hospital and NGO accounts remain unverified until reviewed." style={styles.banner} /> : null}
          <Pressable onPress={() => setAccepted((value) => !value)} style={styles.terms} accessibilityRole="checkbox" accessibilityState={{ checked: accepted }}>
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>{accepted ? <MaterialCommunityIcons name="check" size={15} color={colors.white} /> : null}</View>
            <Text style={styles.termsText}>I agree to the privacy policy and terms</Text>
          </Pressable>
          {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
          <PrimaryButton title={config.button} icon="arrow-right" iconPosition="right" onPress={submit} disabled={!canSubmit} loading={loading} />
          <Pressable onPress={() => navigation.navigate(ROUTES.LOGIN, { role })} style={styles.loginLink}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginStrong}>Log in</Text></Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  outer: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  content: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  heroCopy: { flex: 1 },
  subtitle: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, lineHeight: typography.lineHeights.sectionTitle, fontWeight: typography.weights.bold },
  description: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting },
  heroIcon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: radius.xl, backgroundColor: colors.primaryTint },
  fields: { gap: spacing.lg, marginTop: spacing.xxl },
  fieldLabel: { marginBottom: spacing.sm, color: colors.textPrimary, fontSize: typography.sizes.label, lineHeight: typography.lineHeights.label, fontWeight: typography.weights.semibold },
  bloodTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  banner: { marginTop: spacing.xl },
  terms: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.lg },
  checkbox: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 6, backgroundColor: colors.surface },
  checkboxChecked: { borderColor: colors.primary, backgroundColor: colors.primary },
  termsText: { flex: 1, color: colors.textSecondary, fontSize: typography.sizes.supporting },
  error: { marginBottom: spacing.md, color: colors.error, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting },
  loginLink: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
  loginText: { color: colors.textSecondary, fontSize: typography.sizes.supporting },
  loginStrong: { color: colors.primary, fontWeight: typography.weights.bold },
});
