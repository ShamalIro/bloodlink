import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppHeader, Card, PrimaryButton, Screen, SecondaryButton, StatusBadge } from '../../components';
import { ROUTES } from '../../constants';
import api from '../../services/api';
import { colors, spacing, typography } from '../../theme';

const STATUS = {
  responding: { label: 'ON THE WAY', text: 'On the way', variant: 'warning' },
  arrived: { label: 'ARRIVED', text: 'Arrived', variant: 'success' },
  donated: { label: 'DONATED', text: 'Donated', variant: 'success' },
};

const timeOf = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export default function DonorResponsesScreen({ navigation, route }) {
  const params = route.params || {};
  const passed = params.request?.raw ?? params.request ?? null; // works for a raw request or a card
  const requestId = params.requestId ?? passed?._id ?? params.request?.id ?? params.id;

  const [request, setRequest] = useState(passed);
  const [loading, setLoading] = useState(Boolean(requestId));
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    setError('');
    try {
      setRequest((await api.get(`/api/requests/${requestId}`)).data);
    } catch (e) {
      // fall back to the request we were handed, if any
      if (!passed) {
        setError(
          e?.response?.data?.message ||
            (e?.message === 'Network Error' ? 'Cannot reach the server. Check your connection.' : 'Could not load this request.'),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [requestId, passed]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const donors = (request?.donorResponses || []).filter((d) => d.status !== 'declined');
  const code = requestId ? `REQ-${String(requestId).slice(-4).toUpperCase()}` : '';

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
      <View style={s.content}>
        <AppHeader title="Donor responses" subtitle={code} onBack={navigation.goBack} />
        {!requestId ? <Text style={s.meta}>No request selected. Open a request from the Requests tab.</Text> : null}
        {loading && !request ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Text style={s.error} accessibilityRole="alert">{error}</Text> : null}
        {request ? (
          <>
            <Card>
              <Text style={s.title}>
                {request.bloodType} - {request.unitsFulfilled ?? 0} of {request.unitsRequired} units
              </Text>
              <Text style={s.meta}>{request.hospital?.name}</Text>
              <Text style={s.reach}>
                {donors.length} {donors.length === 1 ? 'donor has' : 'donors have'} responded
              </Text>
            </Card>
            {donors.length === 0 ? <Text style={s.meta}>No donors have accepted yet. This list updates when you refresh.</Text> : null}
            {donors.map((d, i) => {
              const st = STATUS[d.status] || { label: String(d.status).toUpperCase(), text: d.status, variant: 'warning' };
              const bits = [
                st.text,
                d.distanceKm != null ? `${d.distanceKm} km` : null,
                d.etaMinutes != null ? `ETA ${d.etaMinutes} min` : null,
                timeOf(d.respondedAt) ? `accepted ${timeOf(d.respondedAt)}` : null,
              ].filter(Boolean);
              return (
                <Card key={String(d.donorId)}>
                  <View style={s.donor}>
                    <View style={s.copy}>
                      <Text style={s.name}>Donor {i + 1}</Text>
                      <Text style={s.meta}>{bits.join(' - ')}</Text>
                    </View>
                    <StatusBadge label={st.label} variant={st.variant} />
                  </View>
                </Card>
              );
            })}
          </>
        ) : null}
        {requestId ? <SecondaryButton title="Refresh" onPress={load} disabled={loading} /> : null}
        <PrimaryButton title="Back to requests" onPress={() => navigation.navigate(ROUTES.COORDINATOR_REQUESTS_TAB)} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  screen: { paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl },
  title: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
  meta: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption },
  reach: { marginTop: spacing.lg, color: colors.primary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  error: { color: colors.error, fontSize: typography.sizes.supporting },
  donor: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  copy: { flex: 1 },
  name: { color: colors.textPrimary, fontSize: typography.sizes.body, fontWeight: typography.weights.bold },
});