import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Card, EmergencyBanner, ErrorState, LoadingState, PrimaryButton, Screen, SectionHeader } from '../../components';
import { RequestCard } from '../../components/requester';
import { ROUTES } from '../../constants';
import useNearestHospital from '../../hooks/useNearestHospital';
import { getMyRequests } from '../../services/requestApi';
import { colors, radius, spacing, typography } from '../../theme';

const hospitalMessage = ({ loading, hospital, distanceKm, reason }) => {
  if (loading) return 'Finding the nearest verified hospital...';
  if (hospital) return `${hospital.name} \u00B7 ${distanceKm.toFixed(1)} km away`;
  if (reason === 'permission') return 'Allow location access to see the nearest verified hospital.';
  if (reason === 'no-hospitals') return 'No verified hospitals are available yet.';
  return 'Could not load the nearest hospital.';
};

export default function RequesterHomeScreen({ navigation }) {
  const [state, setState] = useState({ loading: true, error: '', request: null });
  const nearest = useNearestHospital();
  const reloadNearest = nearest.reload;

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const items = await getMyRequests('active');
      setState({ loading: false, error: '', request: Array.isArray(items) ? items[0] ?? null : null });
    } catch (error) {
      setState({ loading: false, error: error?.response?.data?.message || 'Could not load your active requests.', request: null });
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); reloadNearest(); }, [load, reloadNearest]));

  return (
    <Screen scroll contentContainerStyle={styles.screen} safeAreaEdges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>EMERGENCY BLOOD SUPPORT</Text>
            <Text style={styles.title}>Need blood now?</Text>
          </View>
          <View style={styles.phoneIcon}><MaterialCommunityIcons name="phone-outline" size={24} color={colors.primary} /></View>
        </View>

        <Card style={styles.sosCard} elevated>
          <View style={styles.sosCircle}>
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosCaption}>Request blood</Text>
          </View>
          <Text style={styles.sosTitle}>Request blood in two simple steps</Text>
          <Text style={styles.sosDescription}>Your hospital and request details are sent securely for verification.</Text>
          <PrimaryButton title="Start emergency request" icon="arrow-right" iconPosition="right" onPress={() => navigation.navigate(ROUTES.REQUEST_BLOOD_TYPE)} />
        </Card>

        <EmergencyBanner
          title="Nearest verified hospital"
          message={hospitalMessage(nearest)}
        />

        <SectionHeader title="Active request" actionLabel="View all" onAction={() => navigation.navigate(ROUTES.REQUESTER_REQUESTS_TAB)} />
        {state.loading ? <LoadingState compact message="Checking active requests..." /> : null}
        {!state.loading && state.error ? <ErrorState title="Unable to load requests" message={state.error} retryLabel="Retry" onRetry={load} /> : null}
        {!state.loading && !state.error && state.request ? (
          <RequestCard request={state.request} onPress={() => navigation.navigate(ROUTES.REQUEST_STATUS, { requestId: state.request._id })} />
        ) : null}
        {!state.loading && !state.error && !state.request ? (
          <Pressable onPress={() => navigation.navigate(ROUTES.REQUEST_BLOOD_TYPE)} style={styles.emptyActive}>
            <MaterialCommunityIcons name="clipboard-pulse-outline" size={28} color={colors.textSecondary} />
            <View style={styles.emptyCopy}><Text style={styles.emptyTitle}>No active requests</Text><Text style={styles.emptyText}>Start an SOS request whenever blood is urgently needed.</Text></View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.primary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, letterSpacing: 0.8 },
  title: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.display, lineHeight: typography.lineHeights.display, fontWeight: typography.weights.extrabold},
  phoneIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.primaryTint },
  sosCard: { alignItems: 'center', padding: spacing.xxl },
  sosCircle: { width: 128, height: 128, alignItems: 'center', justifyContent: 'center', borderRadius: 64, backgroundColor: colors.primary },
  sosText: { color: colors.white, fontSize: 34, fontWeight: typography.weights.extrabold },
  sosCaption: { color: 'rgba(255,255,255,0.82)', fontSize: typography.sizes.caption },
  sosTitle: { marginTop: spacing.xl, color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold, textAlign: 'center' },
  sosDescription: { marginTop: spacing.sm, marginBottom: spacing.xl, color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting, textAlign: 'center' },
  emptyActive: { minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  emptyCopy: { flex: 1 },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.sizes.body, fontWeight: typography.weights.bold },
  emptyText: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption },
});