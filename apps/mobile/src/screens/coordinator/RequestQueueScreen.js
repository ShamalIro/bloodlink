import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState, Screen } from '../../components';
import { CoordinatorRequestCard } from '../../components/coordinator';
import { ROUTES } from '../../constants';
import { colors, radius, spacing, typography } from '../../theme';
import { getHospitalRequests, getPendingRequests, toCard } from '../../services/coordinatorApi';

const TABS = ['Pending', 'Broadcasted', 'Fulfilled'];

export default function RequestQueueScreen({ navigation }) {
  const [filter, setFilter] = useState('Pending');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setItems([]);
    try {
      const data =
        filter === 'Pending'
          ? await getPendingRequests()
          : await getHospitalRequests(filter === 'Broadcasted' ? 'broadcasting' : 'fulfilled');
      setItems(data.map(toCard));
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load requests. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Reload when the tab changes and whenever the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const subtitle = items[0]?.hospital || 'Your hospital';

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
      <View style={s.content}>
        <View>
          <Text style={s.eyebrow}>REQUEST QUEUE</Text>
          <Text style={s.title}>Blood requests</Text>
          <Text style={s.sub}>{subtitle}</Text>
        </View>

        <View style={s.filters}>
          {TABS.map((x) => (
            <Pressable
              key={x}
              onPress={() => setFilter(x)}
              style={[s.filter, filter === x && s.active]}
            >
              <Text style={[s.filterText, filter === x && s.activeText]}>{x}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
            <Pressable onPress={load} style={s.retry}>
              <Text style={s.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : items.length ? (
          <View style={s.list}>
            {items.map((x) => (
              <CoordinatorRequestCard
                key={x.requestId}
                request={x}
                onPress={() =>
                  navigation.navigate(ROUTES.REQUEST_VERIFICATION, { requestId: x.requestId })
                }
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="clipboard-check-outline"
            title={`No ${filter.toLowerCase()} requests`}
            message="Requests in this state will appear here."
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
  title: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.display, fontWeight: typography.weights.extrabold },
  sub: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.supporting },
  filters: { flexDirection: 'row', padding: spacing.xs, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  filter: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  active: { backgroundColor: colors.surface },
  filterText: { color: colors.textSecondary, fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold },
  activeText: { color: colors.primary },
  list: { gap: spacing.md },
  errorBox: { alignItems: 'center', gap: spacing.md },
  errorText: { color: colors.textSecondary, fontSize: typography.sizes.supporting, textAlign: 'center' },
  retry: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary },
  retryText: { color: '#fff', fontWeight: typography.weights.bold },
});