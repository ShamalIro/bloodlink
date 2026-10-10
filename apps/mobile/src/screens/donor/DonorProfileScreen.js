import React, { useCallback, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { BloodTypeBadge, Card, DestructiveButton, ErrorState, InfoBanner, LoadingState, Screen, SecondaryButton, StatusBadge } from '../../components';
import { EligibilitySummary } from '../../components/donor';
import { getMyProfile, saveMyProfile, setAvailability } from '../../services/donorApi';
import { useAuth } from '../../store/AuthContext';
import { colors, radius, spacing, typography } from '../../theme';

const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function DonorProfileScreen() {
  const { user, signOut } = useAuth();
  const [state, setState] = useState({ loading: true, profile: null, missing: false, error: '' });
  const [available, setAvailable] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      const profile = await getMyProfile();
      setAvailable(profile.available !== false);
      setState({ loading: false, profile, missing: false, error: '' });
    } catch (e) {
      if (e?.response?.status === 404) setState({ loading: false, profile: null, missing: true, error: '' });
      else setState({ loading: false, profile: null, missing: false, error: e?.response?.data?.message || 'Could not load your profile.' });
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onToggle = async (value) => {
    const previous = available;
    setAvailable(value);
    try { await setAvailability(value); } catch (e) { setAvailable(previous); }
  };

  const updateLocation = async () => {
    setBusy(true);
    setNotice('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setNotice('Location permission is needed to match you with nearby requests.');
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await saveMyProfile({ latitude: coords.latitude, longitude: coords.longitude });
      setNotice('Location updated.');
      await load();
    } catch (e) {
      setNotice(e?.response?.data?.message || 'Could not update your location.');
    } finally {
      setBusy(false);
    }
  };

  const { loading, profile, missing, error } = state;
  const eligibleFrom = profile?.eligibleFromDate ? new Date(profile.eligibleFromDate) : null;
  const daysRemaining = eligibleFrom ? Math.max(0, Math.ceil((eligibleFrom.getTime() - Date.now()) / 86400000)) : 0;
  const hasLocation = profile?.location?.coordinates?.length === 2;

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={styles.screen}>
      <View style={styles.content}>
        <View><Text style={styles.eyebrow}>DONOR PROFILE</Text><Text style={styles.title}>Profile & availability</Text></View>
        <Card elevated style={styles.identity}>
          <View style={styles.avatar}><MaterialCommunityIcons name="account" size={34} color={colors.primary} /></View>
          <View style={styles.identityCopy}>
            <Text style={styles.name}>{user?.name || 'Donor'}</Text>
            {profile?.district ? <Text style={styles.meta}>{profile.district}</Text> : null}
            {profile ? <StatusBadge label={daysRemaining === 0 ? 'ELIGIBLE TO DONATE' : 'RESTING PERIOD'} variant={daysRemaining === 0 ? 'success' : 'neutral'} dot /> : null}
          </View>
          {profile?.bloodType ? <BloodTypeBadge type={profile.bloodType} /> : null}
        </Card>

        {loading ? <LoadingState compact message="Loading your profile..." /> : null}
        {!loading && error ? <ErrorState title="Unable to load profile" message={error} retryLabel="Retry" onRetry={load} /> : null}
        {!loading && missing ? <InfoBanner title="Donor profile not set up" message="Your donor profile has no blood type or location yet, so you cannot receive alerts." /> : null}

        {profile ? (
          <>
            <EligibilitySummary
              daysRemaining={daysRemaining}
              eligibleDate={formatDate(eligibleFrom ?? new Date())}
            />
            <Card>
              <View style={styles.setting}>
                <View style={styles.settingCopy}>
                  <Text style={styles.settingTitle}>Available to donate</Text>
                  <Text style={styles.settingText}>Show your profile for compatible nearby requests.</Text>
                </View>
                <Switch value={available} onValueChange={onToggle} trackColor={{ false: colors.borderStrong, true: colors.success }} thumbColor={colors.white} />
              </View>
            </Card>
            <Card>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>District</Text><Text style={styles.infoValue}>{profile.district || 'Not set'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Saved location</Text><Text style={styles.infoValue}>{hasLocation ? 'Saved' : 'Not saved'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Last donation</Text><Text style={styles.infoValue}>{profile.lastDonationDate ? formatDate(profile.lastDonationDate) : 'No donation yet'}</Text></View>
            </Card>
            {!hasLocation ? <InfoBanner title="Location needed" message="Without a saved location you cannot be matched with nearby requests." /> : null}
            {notice ? <InfoBanner message={notice} /> : null}
            <SecondaryButton title="Update my location" icon="crosshairs-gps" onPress={updateLocation} loading={busy} disabled={busy} />
          </>
        ) : null}

        <DestructiveButton title="Log out" icon="logout" onPress={signOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl },
  eyebrow: { color: colors.primary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, letterSpacing: 0.8 },
  title: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 56, height: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryTint },
  identityCopy: { flex: 1, gap: spacing.xs },
  name: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
  meta: { color: colors.textSecondary, fontSize: typography.sizes.caption },
  setting: { minHeight: 66, flexDirection: 'row', alignItems: 'center' },
  settingCopy: { flex: 1, paddingRight: spacing.md },
  settingTitle: { color: colors.textPrimary, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold },
  settingText: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.md },
  infoLabel: { color: colors.textSecondary, fontSize: typography.sizes.supporting },
  infoValue: { flex: 1, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold, textAlign: 'right' },
});