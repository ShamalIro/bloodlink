import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppHeader, Card, DestructiveButton, PrimaryButton, Screen, SecondaryButton, StatusBadge } from '../../components';
import { ROUTES } from '../../constants';
import { colors, spacing, typography } from '../../theme';
import { cancelCamp, getCamp, inviteDonors, toCampCard } from '../../services/campApi';

const VARIANT = { active: 'success', completed: 'info', cancelled: 'critical' };
const errMsg = (e, fallback) => e?.response?.data?.message || fallback;

export default function CampDetailsScreen({ navigation, route }) {
  const campId = route.params?.campId;
  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Goes back to the first screen of the current tab (Camps dashboard or Campaigns list).
  const backToDashboard = () => navigation.popToTop();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCamp(toCampCard(await getCamp(campId)));
    } catch (e) {
      setError(errMsg(e, 'Could not load this camp.'));
    } finally {
      setLoading(false);
    }
  }, [campId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const sendInvites = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await inviteDonors(campId);
      Alert.alert('Invites sent', 'Nearby donors with the blood types you need are being notified.');
      load();
    } catch (e) {
      Alert.alert('Could not send invites', errMsg(e, 'Try again later.'));
    } finally {
      setBusy(false);
    }
  };

  const confirmCancel = () => {
    Alert.alert('Cancel this camp?', 'Registered donors will no longer be able to attend. This cannot be undone.', [
      { text: 'Keep camp', style: 'cancel' },
      {
        text: 'Cancel camp',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await cancelCamp(campId);
            navigation.replace(ROUTES.CAMP_CANCELLED);
          } catch (e) {
            setBusy(false);
            Alert.alert('Could not cancel', errMsg(e, 'Try again.'));
          }
        },
      },
    ]);
  };

  if (loading || error || !camp) {
    return (
      <Screen safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
        <View style={s.content}>
          <AppHeader title="Donation camp" onBack={navigation.goBack} />
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Text style={s.note}>{error || 'Camp not found.'}</Text>
              <PrimaryButton title="Try again" onPress={load} />
              <SecondaryButton title="Back to dashboard" icon="view-dashboard-outline" onPress={backToDashboard} />
            </>
          )}
        </View>
      </Screen>
    );
  }

  const rows = [
    ['Date', camp.date],
    ['Time', camp.time],
    ['Location', camp.location],
    ['Target blood groups', camp.bloodTypes.join(', ') || '-'],
  ];
  if (camp.description) rows.push(['About', camp.description]);

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
      <View style={s.content}>
        <AppHeader title="Donation camp" onBack={navigation.goBack} />

        <Card elevated>
          <View style={s.top}>
            <Text style={s.name}>{camp.name}</Text>
            <StatusBadge label={camp.status.toUpperCase()} variant={VARIANT[camp.status] || 'warning'} />
          </View>
          {rows.map(([a, b]) => (
            <View key={a} style={s.row}>
              <Text style={s.label}>{a}</Text>
              <Text style={s.value}>{b}</Text>
            </View>
          ))}
        </Card>

        <View style={s.stats}>
          <Card style={s.stat}>
            <Text style={s.num}>{camp.registered}</Text>
            <Text style={s.label}>Registered</Text>
          </Card>
          <Card style={s.stat}>
            <Text style={s.num}>{camp.spotsLeft}</Text>
            <Text style={s.label}>Spots left of {camp.target}</Text>
          </Card>
        </View>

        {camp.status === 'upcoming' ? (
          <PrimaryButton title="Invite nearby donors" icon="broadcast" loading={busy} onPress={sendInvites} />
        ) : null}
        {camp.status === 'upcoming' || camp.status === 'active' ? (
          <DestructiveButton title="Cancel camp" disabled={busy} onPress={confirmCancel} />
        ) : (
          <Text style={s.note}>This camp is {camp.status}. No further actions are available.</Text>
        )}

        <SecondaryButton title="Back to dashboard" icon="view-dashboard-outline" onPress={backToDashboard} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  screen: { paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, justifyContent: 'space-between' },
  name: { flex: 1, color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold },
  row: { marginTop: spacing.lg },
  label: { color: colors.textSecondary, fontSize: typography.sizes.caption },
  value: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1 },
  num: { color: colors.primary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold },
  note: { color: colors.textSecondary, fontSize: typography.sizes.caption, textAlign: 'center' },
});