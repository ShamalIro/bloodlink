import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppHeader, BloodTypeBadge, Card, PrimaryButton, Screen, StatusBadge } from '../../components';
import { ROUTES } from '../../constants';
import { colors, spacing, typography } from '../../theme';
import { getRequestById, timeAgo, toCard, verifyRequest } from '../../services/coordinatorApi';

export default function RequestVerificationScreen({ navigation, route }) {
  const requestId = route.params?.requestId;
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRequest(await getRequestById(requestId));
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load this request.');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const approve = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await verifyRequest(requestId);
      navigation.replace(ROUTES.REQUEST_BROADCAST, { requestId });
    } catch (e) {
      setBusy(false);
      Alert.alert('Could not approve', e?.response?.data?.message || 'Something went wrong. Try again.');
    }
  };

  if (loading) {
    return (
      <Screen safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
        <View style={s.content}>
          <AppHeader title="Verify request" onBack={navigation.goBack} />
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (error || !request) {
    return (
      <Screen safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
        <View style={s.content}>
          <AppHeader title="Verify request" onBack={navigation.goBack} />
          <Text style={s.note}>{error || 'Request not found.'}</Text>
          <PrimaryButton title="Try again" onPress={load} />
        </View>
      </Screen>
    );
  }

  const card = toCard(request);
  const isPending = request.status === 'pending';
  const critical = card.urgency === 'critical';
  const responders = (request.donorResponses || []).filter((d) =>
    ['responding', 'arrived'].includes(d.status)
  ).length;

  const rows = [
    ['Hospital', request.hospital?.name || '-'],
    ['Location', request.hospital?.address || 'Not provided'],
    ['Status', request.status],
    ['Raised', timeAgo(request.createdAt)],
    ['Units confirmed', `${request.unitsFulfilled} of ${request.unitsRequired}`],
    ['Donors responding', String(responders)],
  ];

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
      <View style={s.content}>
        <AppHeader title="Verify request" subtitle={card.id} onBack={navigation.goBack} />

        <Card elevated>
          <View style={s.top}>
            <BloodTypeBadge type={request.bloodType} size="large" critical={critical} />
            <View>
              <Text style={s.units}>
                {request.unitsRequired} unit{request.unitsRequired !== 1 ? 's' : ''}
              </Text>
              <StatusBadge
                label={card.urgency.toUpperCase()}
                variant={critical ? 'critical' : 'warning'}
                dot
              />
            </View>
          </View>
        </Card>

        <Card>
          {rows.map(([a, b]) => (
            <View key={a} style={s.row}>
              <Text style={s.label}>{a}</Text>
              <Text style={s.value}>{b}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={s.label}>Note from requester</Text>
          <Text style={s.notes}>{request.notes || 'No note provided.'}</Text>
        </Card>

        {isPending ? (
          <PrimaryButton title="Approve & broadcast" loading={busy} onPress={approve} />
        ) : (
          <Text style={s.note}>This request is already {request.status}. Nothing to approve.</Text>
        )}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  screen: { paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  units: { marginBottom: spacing.sm, color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold },
  row: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  label: { width: 120, color: colors.textSecondary, fontSize: typography.sizes.caption },
  value: { flex: 1, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  notes: { marginTop: spacing.sm, color: colors.textPrimary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting },
  note: { color: colors.textSecondary, fontSize: typography.sizes.caption, textAlign: 'center' },
});