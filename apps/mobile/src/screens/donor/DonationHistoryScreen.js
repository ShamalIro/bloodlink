import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BloodTypeBadge, Card, ErrorState, InfoBanner, LoadingState, Screen } from '../../components';
import { getMyDonations } from '../../services/donorApi';
import { colors, spacing, typography } from '../../theme';

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function DonationHistoryScreen() {
  const [state, setState] = useState({ loading: true, error: '', donations: [] });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const data = await getMyDonations();
      setState({ loading: false, error: '', donations: data.donations ?? [] });
    } catch (e) {
      const message = e?.response?.status === 404
        ? 'Your donor profile is not set up yet.'
        : e?.response?.data?.message || 'Could not load your donation history.';
      setState({ loading: false, error: message, donations: [] });
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const { loading, error, donations } = state;
  const units = donations.reduce((sum, d) => sum + (d.units || 0), 0);

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={styles.screen}>
      <View style={styles.content}>
        <View>
          <Text style={styles.eyebrow}>YOUR IMPACT</Text>
          <Text style={styles.title}>Donation history</Text>
          <Text style={styles.subtitle}>A record of donations confirmed through BloodLink.</Text>
        </View>
        <View style={styles.stats}>
          <Card style={styles.stat}><Text style={styles.statValue}>{donations.length}</Text><Text style={styles.statLabel}>Total donations</Text></Card>
          <Card style={styles.stat}><Text style={styles.statValue}>{units}</Text><Text style={styles.statLabel}>Units given</Text></Card>
        </View>
        <Text style={styles.section}>Recent donations</Text>
        {loading ? <LoadingState compact message="Loading donations..." /> : null}
        {!loading && error ? <ErrorState title="Unable to load history" message={error} retryLabel="Retry" onRetry={load} /> : null}
        {!loading && !error && donations.length === 0 ? (
          <InfoBanner title="No donations yet" message="Donations confirmed by a hospital coordinator will appear here." />
        ) : null}
        <View style={styles.list}>
          {donations.map((donation) => (
            <Card key={donation._id} style={styles.item}>
              <BloodTypeBadge type={donation.bloodType} />
              <View style={styles.itemCopy}>
                <Text style={styles.itemDate}>{formatDate(donation.donatedAt)}</Text>
                <Text style={styles.itemHospital}>{donation.hospitalName || 'Hospital'}</Text>
              </View>
              <Text style={styles.itemUnits}>{donation.units} {donation.units === 1 ? 'unit' : 'units'}</Text>
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl },
  eyebrow: { color: colors.primary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, letterSpacing: 0.8 },
  title: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.display, fontWeight: typography.weights.extrabold },
  subtitle: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.supporting },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1 },
  statValue: { color: colors.primary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold },
  statLabel: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption },
  section: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
  list: { gap: spacing.md },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemCopy: { flex: 1 },
  itemDate: { color: colors.textPrimary, fontSize: typography.sizes.body, fontWeight: typography.weights.bold },
  itemHospital: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.supporting },
  itemUnits: { color: colors.textSecondary, fontSize: typography.sizes.caption },
});