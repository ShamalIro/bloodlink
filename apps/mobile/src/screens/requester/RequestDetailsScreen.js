import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader, BloodTypeBadge, FormInput, InfoBanner, PrimaryButton, Screen } from '../../components';
import { UnitStepper } from '../../components/requester';
import { ROUTES } from '../../constants';
import { requesterPresentation } from '../../mocks/requesterPresentation';
import { createRequest } from '../../services/requestApi';
import { colors, spacing, typography } from '../../theme';

export default function RequestDetailsScreen({ navigation, route }) {
  const bloodType = route.params?.bloodType;
  const [units, setUnits] = useState(2);
  const [hospitalName, setHospitalName] = useState(requesterPresentation.savedHospital.name);
  const [hospitalAddress, setHospitalAddress] = useState(requesterPresentation.savedHospital.address);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);
  const canSubmit = Boolean(bloodType && hospitalName.trim() && units >= 1 && !loading);

  const submit = async () => {
    if (!canSubmit || submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError('');
    try {
      const payload = {
        bloodType,
        unitsRequired: units,
        hospital: { name: hospitalName.trim(), ...(hospitalAddress.trim() ? { address: hospitalAddress.trim() } : {}) },
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };
      const request = await createRequest(payload);
      navigation.reset({
        index: 1,
        routes: [
          { name: ROUTES.REQUESTER_HOME },
          { name: ROUTES.REQUEST_SUBMITTED, params: { request } },
        ],
      });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || (requestError?.message === 'Network Error'
        ? 'Cannot reach the server. Check your connection.'
        : 'The request could not be submitted. Please try again.'));
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <Screen padded={false} scroll keyboardAvoiding>
      <AppHeader title="Emergency request" subtitle="Step 2 of 2" onBack={navigation.goBack} />
      <View style={styles.outer}>
        <View style={styles.content}>
          <View style={styles.headingRow}>
            <View style={styles.headingCopy}><Text style={styles.title}>How many units are needed?</Text><Text style={styles.subtitle}>Each unit remains open until the request is fulfilled.</Text></View>
            <BloodTypeBadge type={bloodType ?? '—'} critical />
          </View>
          <UnitStepper value={units} onChange={setUnits} disabled={loading} />
          <View style={styles.fields}>
            <FormInput label="Hospital" value={hospitalName} onChangeText={setHospitalName} placeholder="Hospital name" leftIcon="hospital-building" editable={!loading} />
            <FormInput label="Hospital address" value={hospitalAddress} onChangeText={setHospitalAddress} placeholder="Address (optional)" leftIcon="map-marker-outline" editable={!loading} />
            <FormInput label="Additional notes" value={notes} onChangeText={setNotes} placeholder="Ward, patient reference or urgent details" multiline numberOfLines={4} maxLength={500} inputContainerStyle={styles.notesContainer} style={styles.notesInput} editable={!loading} helperText={`${notes.length}/500 characters`} />
          </View>
          <InfoBanner message={`Requests are created as pending until coordinator verification. Matching may later cover donors within ${requesterPresentation.matchingRadiusKm} km.`} />
          {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
          <PrimaryButton title="Send request" icon="send-outline" onPress={submit} disabled={!canSubmit} loading={loading} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  outer: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  content: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: spacing.xxl },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  headingCopy: { flex: 1 },
  title: { color: colors.textPrimary, fontSize: typography.sizes.title, lineHeight: typography.lineHeights.title, fontWeight: typography.weights.extrabold },
  subtitle: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting },
  fields: { gap: spacing.lg },
  notesContainer: { minHeight: 112, alignItems: 'flex-start', paddingVertical: spacing.md },
  notesInput: { minHeight: 84, textAlignVertical: 'top' },
  error: { color: colors.error, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting },
});
