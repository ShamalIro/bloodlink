import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader, Card, PrimaryButton, Screen, SecondaryButton, StatusBadge } from '../../components';
import { ROUTES } from '../../constants';
import { createCamp, formatDate, formatTime } from '../../services/campApi';
import { colors, spacing, typography } from '../../theme';

export default function CampPreviewScreen({ navigation, route }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const d = route.params?.draft || {};
  const start = d.startsAt ? new Date(d.startsAt) : null;
  const end = d.endsAt ? new Date(d.endsAt) : null;

  const publish = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const camp = await createCamp({
        title: d.name,
        venue: { name: d.venueName, latitude: d.latitude, longitude: d.longitude },
        startsAt: d.startsAt,
        endsAt: d.endsAt,
        bloodTypesNeeded: d.bloodTypes,
        capacity: d.target,
      });
      navigation.replace(ROUTES.CAMP_PUBLISHED, { camp });
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          (e?.message === 'Network Error'
            ? 'Cannot reach the server. Check your connection.'
            : 'The camp could not be published. Please try again.'),
      );
      setBusy(false);
    }
  };

  const rows = [
    ['Date', start ? formatDate(start) : '-'],
    ['Time', start && end ? `${formatTime(start)} - ${formatTime(end)}` : '-'],
    ['Venue', d.venueName],
    ['Target blood types', (d.bloodTypes || []).join(', ')],
    ['Expected target', `${d.target} donors`],
  ];

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
      <View style={s.content}>
        <AppHeader title="Preview donation camp" onBack={navigation.goBack} />
        <Text style={s.heading}>Review before publishing</Text>
        <Card elevated>
          <View style={s.top}>
            <Text style={s.name}>{d.name}</Text>
            <StatusBadge label="UPCOMING" variant="warning" />
          </View>
          {rows.map(([a, b]) => (
            <View key={a} style={s.row}>
              <Text style={s.label}>{a}</Text>
              <Text style={s.value}>{b}</Text>
            </View>
          ))}
        </Card>
        {error ? <Text style={s.error} accessibilityRole="alert">{error}</Text> : null}
        <PrimaryButton title="Publish campaign" loading={busy} onPress={publish} />
        <SecondaryButton title="Edit details" disabled={busy} onPress={navigation.goBack} />
        <Text style={s.note}>After publishing, open the camp and tap "Invite nearby donors" to notify eligible donors.</Text>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  screen: { paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl },
  heading: { color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold },
  top: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', justifyContent: 'space-between' },
  name: { flex: 1, color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
  row: { marginTop: spacing.lg },
  label: { color: colors.textSecondary, fontSize: typography.sizes.caption },
  value: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  error: { color: colors.error, fontSize: typography.sizes.supporting },
  note: { color: colors.textSecondary, fontSize: typography.sizes.caption, textAlign: 'center' },
});