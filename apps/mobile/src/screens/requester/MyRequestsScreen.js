import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState, ErrorState, LoadingState, PrimaryButton, Screen } from '../../components';
import { RequestCard } from '../../components/requester';
import { ROUTES } from '../../constants';
import { getMyRequests } from '../../services/requestApi';
import { colors, radius, spacing, typography } from '../../theme';

export default function MyRequestsScreen({ navigation }) {
  const [filter, setFilter] = useState('active');
  const [state, setState] = useState({ loading: true, error: '', items: [] });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const data = await getMyRequests(filter);
      setState({ loading: false, error: '', items: Array.isArray(data) ? data : [] });
    } catch (error) {
      setState({ loading: false, error: error?.response?.data?.message || 'Could not load your requests.', items: [] });
    }
  }, [filter]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen scroll contentContainerStyle={styles.screen} safeAreaEdges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>REQUEST HISTORY</Text><Text style={styles.title}>My Requests</Text></View>
          <PrimaryButton title="New" icon="plus" compact fullWidth={false} onPress={() => navigation.navigate(ROUTES.REQUESTER_HOME_TAB, { screen: ROUTES.REQUEST_BLOOD_TYPE })} />
        </View>
        <View style={styles.filters}>
          {['active', 'past'].map((item) => {
            const selected = filter === item;
            return <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, selected && styles.filterSelected]}><Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item === 'active' ? 'Active' : 'Past'}</Text></Pressable>;
          })}
        </View>
        {state.loading ? <LoadingState message={`Loading ${filter} requests...`} /> : null}
        {!state.loading && state.error ? <ErrorState title="Unable to load requests" message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && !state.items.length ? (
          <EmptyState icon="clipboard-text-outline" title={`No ${filter} requests`} message={filter === 'active' ? 'You do not currently have a request awaiting verification or fulfilment.' : 'Completed and closed requests will appear here.'} actionLabel={filter === 'active' ? 'Create request' : undefined} onAction={() => navigation.navigate(ROUTES.REQUESTER_HOME_TAB, { screen: ROUTES.REQUEST_BLOOD_TYPE })} />
        ) : null}
        {!state.loading && !state.error && state.items.length ? (
          <View style={styles.list}>
            {state.items.map((request) => <RequestCard key={request._id} request={request} onPress={() => navigation.navigate(ROUTES.REQUEST_STATUS, { requestId: request._id })} />)}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg },
  eyebrow: { color: colors.primary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, letterSpacing: 0.8 },
  title: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.display, lineHeight: typography.lineHeights.display, fontWeight: typography.weights.extrabold },
  filters: { flexDirection: 'row', marginTop: spacing.xxl, padding: spacing.xs, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  filter: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  filterSelected: { backgroundColor: colors.surface },
  filterText: { color: colors.textSecondary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold, textTransform: 'capitalize' },
  filterTextSelected: { color: colors.primary },
  list: { gap: spacing.lg, marginTop: spacing.xxl },
});
