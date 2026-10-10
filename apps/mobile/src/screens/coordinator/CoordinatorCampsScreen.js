import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { IconButton, PrimaryButton, Screen, SectionHeader } from '../../components';
import { CampCard } from '../../components/ngo';
import { ROUTES } from '../../constants';
import api from '../../services/api';
import { toCampCard } from '../../services/campApi';
import { getMyHospitalId } from '../../services/inventoryApi';
import { colors, spacing, typography } from '../../theme';

const RADIUS_KM = 100;

export default function CoordinatorCampsScreen({ navigation }) {
  const [camps, setCamps] = useState([]);
  const [nearHospital, setNearHospital] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const params = { radiusKm: RADIUS_KM };
      let located = false;
      const hospitalId = await getMyHospitalId();
      if (hospitalId) {
        const hospitals = (await api.get('/api/verification/hospitals')).data;
        const mine = Array.isArray(hospitals) ? hospitals.find((h) => h.hospitalId === hospitalId) : null;
        const coords = mine?.location?.coordinates;
        if (Array.isArray(coords) && coords.length === 2) {
          params.lng = coords[0];
          params.lat = coords[1];
          located = true;
        }
      }
      const data = (await api.get('/api/camps/nearby', { params })).data;
      setCamps((Array.isArray(data) ? data : []).map(toCampCard));
      setNearHospital(located);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          (e?.message === 'Network Error' ? 'Cannot reach the server. Check your connection.' : 'Could not load camps.'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload every time the tab is opened.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
      <View style={s.content}>
        <View style={s.header}>
          <View>
            <Text style={s.eyebrow}>HOSPITAL CAMPS</Text>
            <Text style={s.title}>Donation camps</Text>
          </View>
          <IconButton icon="account-outline" accessibilityLabel="Coordinator profile" onPress={() => navigation.navigate(ROUTES.COORDINATOR_PROFILE)} />
        </View>
        <SectionHeader title="Nearby campaigns" />
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? (
          <View style={s.list}>
            <Text style={s.error} accessibilityRole="alert">{error}</Text>
            <PrimaryButton title="Try again" onPress={load} />
          </View>
        ) : null}
        {!loading && !error && camps.length === 0 ? (
          <Text style={s.note}>No upcoming camps{nearHospital ? ` within ${RADIUS_KM} km of your hospital` : ''} yet.</Text>
        ) : null}
        <View style={s.list}>
          {camps.map((c) => (
            <CampCard key={c.id} camp={c} />
          ))}
        </View>
        {!loading && !error && camps.length > 0 ? (
          <Text style={s.note}>
            {nearHospital ? `Upcoming camps within ${RADIUS_KM} km of your hospital.` : 'Upcoming camps.'}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.primary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold },
  title: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold },
  list: { gap: spacing.md },
  error: { color: colors.error, fontSize: typography.sizes.supporting },
  note: { color: colors.textSecondary, fontSize: typography.sizes.caption, textAlign: 'center' },
});