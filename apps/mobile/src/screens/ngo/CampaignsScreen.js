import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PrimaryButton, Screen } from '../../components';
import { CampCard } from '../../components/ngo';
import { ROUTES } from '../../constants';
import { getMyCamps, toCampCard } from '../../services/campApi';
import { colors, radius, spacing, typography } from '../../theme';

const FILTERS = ['all', 'upcoming', 'active', 'completed'];
const label = (x) => x.charAt(0).toUpperCase() + x.slice(1);

export default function CampaignsScreen({ navigation }) {
  const [filter, setFilter] = useState('all');
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getMyCamps();
      const list = Array.isArray(data) ? data : data?.camps ?? [];
      setCamps(list.map(toCampCard).filter((c) => c.status !== 'cancelled'));
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          (e?.message === 'Network Error' ? 'Cannot reach the server. Check your connection.' : 'Could not load campaigns.'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload every time the tab is opened, so new or cancelled camps show up.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const items = filter === 'all' ? camps : camps.filter((c) => c.status === filter);

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
      <View style={s.content}>
        <View>
          <Text style={s.eyebrow}>CAMPAIGNS</Text>
          <Text style={s.title}>All campaigns</Text>
          <Text style={s.sub}>Upcoming, active and completed</Text>
        </View>
        <View style={s.filters}>
          {FILTERS.map((x) => (
            <Pressable key={x} onPress={() => setFilter(x)} style={[s.filter, filter === x && s.active]}>
              <Text style={[s.text, filter === x && s.activeText]}>{label(x)}</Text>
            </Pressable>
          ))}
        </View>
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? (
          <View style={s.list}>
            <Text style={s.error} accessibilityRole="alert">{error}</Text>
            <PrimaryButton title="Try again" onPress={load} />
          </View>
        ) : null}
        {!loading && !error && items.length === 0 ? <Text style={s.sub}>No campaigns in this view yet.</Text> : null}
        <View style={s.list}>
          {items.map((c) => (
            <CampCard
              key={c.id}
              camp={c}
              onPress={() =>
                navigation.navigate(c.status === 'completed' ? ROUTES.CAMPAIGN_SUMMARY : ROUTES.CAMP_DETAILS, { campId: c.id })
              }
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl },
  eyebrow: { color: colors.primary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold },
  title: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.display, fontWeight: typography.weights.extrabold },
  sub: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.supporting },
  filters: { flexDirection: 'row', padding: spacing.xs, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  filter: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  active: { backgroundColor: colors.surface },
  text: { fontSize: 11, color: colors.textSecondary },
  activeText: { color: colors.primary, fontWeight: typography.weights.bold },
  list: { gap: spacing.md },
  error: { color: colors.error, fontSize: typography.sizes.supporting },
});