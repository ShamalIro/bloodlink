import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader, BloodTypeBadge, FormInput, InfoBanner, PrimaryButton, Screen } from '../../components';
import { UnitStepper } from '../../components/requester';
import { ROUTES } from '../../constants';
import { requesterPresentation } from '../../mocks/requesterPresentation';
import { getHospitals } from '../../services/hospitalApi';
import { createRequest } from '../../services/requestApi';
import { colors, spacing, typography } from '../../theme';

const PRIMARY = colors.primary || '#C0272D';
const BORDER = colors.border || '#E5E7EB';

const networkMessage = (error, fallback) =>
  error?.response?.data?.message ||
  (error?.message === 'Network Error' ? 'Cannot reach the server. Check your connection.' : fallback);

export default function RequestDetailsScreen({ navigation, route }) {
  const bloodType = route.params?.bloodType;
  const [units, setUnits] = useState(2);
  const [notes, setNotes] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [hospitalError, setHospitalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);
  const canSubmit = Boolean(bloodType && selected && units >= 1 && !loading);

  const loadHospitals = useCallback(async () => {
    setLoadingHospitals(true);
    setHospitalError('');
    try {
      const list = await getHospitals();
      const items = Array.isArray(list) ? list : [];
      setHospitals(items);
      if (items.length === 1) setSelected(items[0]); // minimal taps: one choice is pre-selected
    } catch (e) {
      setHospitalError(networkMessage(e, 'Could not load hospitals. Please try again.'));
    } finally {
      setLoadingHospitals(false);
    }
  }, []);

  useEffect(() => {
    loadHospitals();
  }, [loadHospitals]);

  const submit = async () => {
    if (!canSubmit || submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError('');
    try {
      const payload = {
        bloodType,
        unitsRequired: units,
        hospital: {
          hospitalId: selected.hospitalId,
          name: selected.name,
          ...(selected.location ? { location: selected.location } : {}),
        },
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
      setError(networkMessage(requestError, 'The request could not be submitted. Please try again.'));
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const renderHospitals = () => {
    if (loadingHospitals) {
      return <ActivityIndicator color={PRIMARY} style={styles.loader} />;
    }
    if (hospitalError) {
      return (
        <View style={styles.hospitalMessage}>
          <Text style={styles.error} accessibilityRole="alert">{hospitalError}</Text>
          <Pressable onPress={loadHospitals} accessibilityRole="button"><Text style={styles.retry}>Try again</Text></Pressable>
        </View>
      );
    }
    if (hospitals.length === 0) {
      return (
        <View style={styles.hospitalMessage}>
          <Text style={styles.subtitle}>No verified hospitals are available yet. A hospital coordinator must be approved first.</Text>
          <Pressable onPress={loadHospitals} accessibilityRole="button"><Text style={styles.retry}>Refresh</Text></Pressable>
        </View>
      );
    }
    return hospitals.map((h) => {
      const active = selected?.hospitalId === h.hospitalId;
      return (
        <Pressable
          key={h.hospitalId}
          onPress={() => setSelected(h)}
          disabled={loading}
          accessibilityRole="radio"
          accessibilityState={{ selected: active }}
          style={[styles.hospitalRow, active && styles.hospitalRowActive]}
        >
          <View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View>
          <Text style={styles.hospitalName}>{h.name}</Text>
        </Pressable>
      );
    });
  };

  return (
    <Screen padded={false} scroll keyboardAvoiding>
      <AppHeader title="Emergency request" subtitle="Step 2 of 2" onBack={navigation.goBack} />
      <View style={styles.outer}>
        <View style={styles.content}>
          <View style={styles.headingRow}>
            <View style={styles.headingCopy}><Text style={styles.title}>How many units are needed?</Text><Text style={styles.subtitle}>Each unit remains open until the request is fulfilled.</Text></View>
            <BloodTypeBadge type={bloodType ?? '-'} critical />
          </View>
          <UnitStepper value={units} onChange={setUnits} disabled={loading} />
          <View style={styles.fields}>
            <View style={styles.hospitalGroup}>
              <Text style={styles.label}>Hospital</Text>
              {renderHospitals()}
            </View>
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
  hospitalGroup: { gap: spacing.md },
  label: { color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: '600' },
  loader: { paddingVertical: spacing.lg },
  hospitalMessage: { gap: spacing.md },
  retry: { color: PRIMARY, fontSize: typography.sizes.supporting, fontWeight: '600' },
  hospitalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg, paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: BORDER, borderRadius: 14, backgroundColor: '#FFFFFF' },
  hospitalRowActive: { borderColor: PRIMARY, backgroundColor: '#FDECEC' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: PRIMARY },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: PRIMARY },
  hospitalName: { flex: 1, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: '600' },
  notesContainer: { minHeight: 112, alignItems: 'flex-start', paddingVertical: spacing.md },
  notesInput: { minHeight: 84, textAlignVertical: 'top' },
  error: { color: colors.error, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting },
});
