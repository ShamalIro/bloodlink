import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card, EmptyState, PrimaryButton, Screen } from '../../components';
import { CampCard } from '../../components/ngo';
import { ROUTES } from '../../constants';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../../store/AuthContext';
import { getMyCamps, toCampCard } from '../../services/campApi';

const FILTERS = ['all', 'upcoming', 'active', 'completed'];

export default function CampsDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [camps, setCamps] = useState([]);
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyCamps();
      setCamps(data.map(toCampCard));
      if (data[0]?.organizationName) setOrganization(data[0].organizationName);
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load your camps.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const items = filter === 'all' ? camps : camps.filter((x) => x.status === filter);
  const open = camps.filter((x) => x.status === 'upcoming' || x.status === 'active');
  const donors = open.reduce((sum, x) => sum + x.registered, 0);

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
      <View style={s.content}>
        <View>
          <Text style={s.eyebrow}>CAMPS</Text>
          <Text style={s.title}>{organization || user?.name || 'Your camps'}</Text>
          <Text style={s.sub}>Blood donation camps</Text>
        </View>

        <View style={s.stats}>
          <Card style={s.stat}>
            <Text style={s.value}>{open.length}</Text>
            <Text style={s.label}>Upcoming & active</Text>
          </Card>
          <Card style={s.stat}>
            <Text style={s.value}>{donors}</Text>
            <Text style={s.label}>Donors registered</Text>
          </Card>
        </View>

        <PrimaryButton title="New donation camp" icon="plus" onPress={() => navigation.navigate(ROUTES.CAMP_FORM)} />

        <View style={s.filters}>
          {FILTERS.map((x) => (
            <Pressable key={x} onPress={() => setFilter(x)} style={[s.filter, filter === x && s.active]}>
              <Text style={[s.filterText, filter === x && s.activeText]}>{x[0].toUpperCase() + x.slice(1)}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
            <PrimaryButton title="Try again" onPress={load} />
          </View>
        ) : items.length ? (
          <View style={s.list}>
            {items.map((c) => (
              <CampCard key={c.id} camp={c} onPress={() => navigation.navigate(ROUTES.CAMP_DETAILS, { campId: c.id })} />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="calendar-blank-outline"
            title={`No ${filter === 'all' ? '' : filter + ' '}camps`}
            message="Camps you create will appear here."
          />
        )}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl },
  eyebrow: { color: colors.primary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold },
  title: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold },
  sub: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.supporting },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1 },
  value: { color: colors.primary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold },
  label: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption },
  filters: { flexDirection: 'row', padding: spacing.xs, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  filter: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  active: { backgroundColor: colors.surface },
  filterText: { color: colors.textSecondary, fontSize: 11, fontWeight: typography.weights.semibold },
  activeText: { color: colors.primary },
  list: { gap: spacing.md },
  errorBox: { gap: spacing.md },
  errorText: { color: colors.textSecondary, fontSize: typography.sizes.supporting, textAlign: 'center' },
});