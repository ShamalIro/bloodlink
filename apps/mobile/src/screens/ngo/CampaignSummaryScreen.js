import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppHeader, Card, PrimaryButton, Screen, StatusBadge } from '../../components';
import { ROUTES } from '../../constants';
import { getCamp, toCampCard } from '../../services/campApi';
import { colors, spacing, typography } from '../../theme';

export default function CampaignSummaryScreen({ navigation, route }) {
  const campId = route.params?.campId;
  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCamp(toCampCard(await getCamp(campId)));
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          (e?.message === 'Network Error' ? 'Cannot reach the server. Check your connection.' : 'Could not load this campaign.'),
      );
    } finally {
      setLoading(false);
    }
  }, [campId]);

  useEffect(() => {
    load();
  }, [load]);

  const filled = camp && camp.target > 0 ? Math.round((camp.registered / camp.target) * 100) : 0;

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
      <View style={s.content}>
        <AppHeader title="Campaign completed" onBack={navigation.goBack} />
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? (
          <View style={s.center}>
            <Text style={s.error} accessibilityRole="alert">{error}</Text>
            <PrimaryButton title="Try again" onPress={load} />
          </View>
        ) : null}
        {camp ? (
          <>
            <View style={s.center}>
              <StatusBadge label="COMPLETED" variant="success" />
              <Text style={s.title}>{camp.name}</Text>
              <Text style={s.sub}>Here is a summary of your blood donation camp.</Text>
            </View>
            <Card>
              {[
                ['Date', camp.date],
                ['Time', camp.time],
                ['Location', camp.location],
                ['Target blood groups', camp.bloodTypes.join(', ')],
              ].map(([a, b]) => (
                <View key={a} style={s.row}>
                  <Text style={s.label}>{a}</Text>
                  <Text style={s.value}>{b}</Text>
                </View>
              ))}
            </Card>
            <View style={s.grid}>
              {[
                ['Registered', camp.registered],
                ['Target donors', camp.target],
                ['Filled', `${filled}%`],
                ['Spots left', camp.spotsLeft],
              ].map(([a, b]) => (
                <Card key={a} style={s.stat}>
                  <Text style={s.num}>{b}</Text>
                  <Text style={s.label}>{a}</Text>
                </Card>
              ))}
            </View>
          </>
        ) : null}
        <PrimaryButton title="Back to campaigns" onPress={() => navigation.navigate(ROUTES.NGO_CAMPAIGNS_TAB)} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  screen: { paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl },
  center: { alignItems: 'center', gap: spacing.sm },
  title: { color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold, textAlign: 'center' },
  sub: { color: colors.textSecondary, fontSize: typography.sizes.supporting, textAlign: 'center' },
  error: { color: colors.error, fontSize: typography.sizes.supporting, textAlign: 'center' },
  row: { paddingVertical: spacing.md },
  label: { color: colors.textSecondary, fontSize: typography.sizes.caption },
  value: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stat: { width: '48%', flexGrow: 1 },
  num: { color: colors.primary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold },
});