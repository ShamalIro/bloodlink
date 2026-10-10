import React, { useCallback, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BloodTypeBadge, Card, ErrorState, InfoBanner, LoadingState, Screen, SectionHeader } from '../../components';
import { DonorAlertCard, EligibilitySummary } from '../../components/donor';
import { ROUTES } from '../../constants';
import useDonorAlerts from '../../hooks/useDonorAlerts';
import { getMyDonations, getMyProfile, setAvailability } from '../../services/donorApi';
import { useAuth } from '../../store/AuthContext';
import { colors, radius, spacing, typography } from '../../theme';

export default function DonorHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [stats, setStats] = useState({ count: 0, units: 0 });
  const [available, setAvailable] = useState(true);
  const { loading, error, alerts, reload } = useDonorAlerts();

  const loadProfile = useCallback(async () => {
    try {
      const [p, d] = await Promise.all([getMyProfile(), getMyDonations()]);
      setProfile(p);
      setProfileMissing(false);
      setAvailable(p.available !== false);
      setStats({ count: d.count ?? 0, units: (d.donations ?? []).reduce((sum, x) => sum + (x.units || 0), 0) });
    } catch (e) {
      if (e?.response?.status === 404) setProfileMissing(true);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadProfile(); reload(); }, [loadProfile, reload]));

  const onToggle = async (value) => {
    const previous = available;
    setAvailable(value);
    try { await setAvailability(value); } catch (e) { setAvailable(previous); }
  };

  const eligibleFrom = profile?.eligibleFromDate ? new Date(profile.eligibleFromDate) : null;
  const daysRemaining = eligibleFrom ? Math.max(0, Math.ceil((eligibleFrom.getTime() - Date.now()) / 86400000)) : 0;
  const eligibleDate = (eligibleFrom ?? new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const firstName = (user?.name ?? 'Donor').split(' ')[0];

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={styles.screen}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroTop}><View><Text style={styles.eyebrow}>DONOR DASHBOARD</Text><Text style={styles.title}>Hello, {firstName}</Text></View>{profile?.bloodType ? <BloodTypeBadge type={profile.bloodType} size="large" /> : null}</View>
          <View style={styles.availability}><View style={styles.availabilityCopy}><Text style={styles.availabilityTitle}>Available to donate</Text><Text style={styles.availabilityText}>{available ? 'Nearby emergency alerts are enabled' : 'You will not receive nearby matches'}</Text></View><Switch value={available} onValueChange={onToggle} trackColor={{ false: colors.borderStrong, true: colors.success }} thumbColor={colors.white} /></View>
        </View>

        {profileMissing ? <InfoBanner title="Donor profile not set up" message="Your donor profile has no blood type or location yet, so you cannot receive alerts." /> : null}

        <View style={styles.stats}>
          <Card style={styles.stat}><MaterialCommunityIcons name="water-outline" size={24} color={colors.primary} /><Text style={styles.statValue}>{stats.count}</Text><Text style={styles.statLabel}>Donations</Text></Card>
          <Card style={styles.stat}><MaterialCommunityIcons name="account-heart-outline" size={24} color={colors.success} /><Text style={styles.statValue}>{stats.units}</Text><Text style={styles.statLabel}>Units given</Text></Card>
        </View>

        <EligibilitySummary daysRemaining={daysRemaining} eligibleDate={eligibleDate} />
        <InfoBanner title="Your availability matters" message="Keep your status current so BloodLink only sends alerts when you can respond." />

        <SectionHeader title="Blood needed near you" actionLabel="View all" onAction={() => navigation.navigate(ROUTES.DONOR_ALERTS_TAB)} />
        {loading ? <LoadingState compact message="Checking for blood requests..." /> : null}
        {!loading && error ? <ErrorState title="Unable to load alerts" message={error} retryLabel="Retry" onRetry={reload} /> : null}
        {!loading && !error && alerts.length === 0 ? <InfoBanner title="No open requests" message="You will be notified when a hospital near you needs your blood type." /> : null}
        {!loading && !error && alerts.length > 0 ? (
          <View style={styles.list}>{alerts.slice(0, 2).map((alert) => <DonorAlertCard key={alert.id} alert={alert} onPress={() => navigation.navigate(ROUTES.BLOOD_ALERT, { alertId: alert.id, alert })} />)}</View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.xxxl }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl },
  hero: { marginHorizontal: -spacing.xl, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl, gap: spacing.xl, backgroundColor: colors.primary },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eyebrow: { color: 'rgba(255,255,255,0.78)', fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, letterSpacing: 0.8 }, title: { marginTop: spacing.xs, color: colors.white, fontSize: typography.sizes.display, fontWeight: typography.weights.extrabold },
  availability: { minHeight: 72, flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.12)' }, availabilityCopy: { flex: 1, paddingRight: spacing.md }, availabilityTitle: { color: colors.white, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }, availabilityText: { marginTop: 2, color: 'rgba(255,255,255,0.78)', fontSize: typography.sizes.caption },
  stats: { flexDirection: 'row', gap: spacing.md }, stat: { flex: 1, alignItems: 'center', gap: spacing.xs }, statValue: { color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold }, statLabel: { color: colors.textSecondary, fontSize: typography.sizes.caption }, list: { gap: spacing.md },
});