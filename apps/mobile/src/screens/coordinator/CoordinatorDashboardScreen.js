import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, PrimaryButton, Screen, SectionHeader, StatusBadge } from '../../components';
import { CoordinatorRequestCard } from '../../components/coordinator';
import { ROUTES } from '../../constants';
import { colors, radius, spacing, typography } from '../../theme';
import { USER_KEY } from '../../services/api';
import {
  getDashboard,
  getHospitalRequests,
  getPendingRequests,
  timeAgo,
  toCard,
} from '../../services/coordinatorApi';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 18) return 'Good afternoon,';
  return 'Good evening,';
};

const STATUS_TEXT = {
  pending: 'awaiting verification',
  broadcasting: 'broadcasting to donors',
  fulfilled: 'fulfilled',
};

export default function CoordinatorDashboardScreen({ navigation }) {
  const [name, setName] = useState('Coordinator');
  const [hospital, setHospital] = useState('Your hospital');
  const [stats, setStats] = useState(null);
  const [urgent, setUrgent] = useState(null);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const rawUser = await AsyncStorage.getItem(USER_KEY);
      const user = rawUser ? JSON.parse(rawUser) : null;
      if (user?.name) setName(user.name);

      const [dash, pending, broadcasting, fulfilled] = await Promise.all([
        getDashboard(),
        getPendingRequests(),
        getHospitalRequests('broadcasting'),
        getHospitalRequests('fulfilled'),
      ]);
      setStats(dash);

      const all = [...pending, ...broadcasting, ...fulfilled];
      if (all[0]?.hospital?.name) setHospital(all[0].hospital.name);

      // Most urgent open request: first critical one, otherwise the newest open one.
      const open = [...pending, ...broadcasting].map(toCard);
      setUrgent(open.find((x) => x.urgency === 'critical') || open[0] || null);

      // Recent activity: latest 4 changes to this hospital's requests.
      const recent = [...all]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 4)
        .map((r) => {
          const c = toCard(r);
          return `${c.id} ${STATUS_TEXT[r.status] || r.status} · ${timeAgo(r.updatedAt)}`;
        });
      setActivity(recent);
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load the dashboard.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const num = (k) => (stats ? stats[k] : '-');
  const tiles = [
    ['Pending verification', num('pending'), 'clipboard-clock-outline'],
    ['Broadcasting', num('broadcasted'), 'broadcast'],
    ['Fulfilled', num('fulfilled'), 'check-circle-outline'],
    ['Critical requests', num('critical'), 'alert-circle-outline'],
  ];

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
      <View style={s.content}>
        <View style={s.hero}>
          <Text style={s.eyebrow}>BLOODLINK HOSPITAL</Text>
          <Text style={s.greeting}>{greeting()}</Text>
          <Text style={s.name}>{name}</Text>
          <Text style={s.hospital}>{hospital}</Text>
        </View>

        {error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
            <PrimaryButton title="Try again" onPress={load} />
          </View>
        ) : null}

        <View style={s.grid}>
          {tiles.map(([label, n, icon]) => (
            <Card key={label} style={s.stat}>
              <MaterialCommunityIcons
                name={icon}
                size={22}
                color={label.startsWith('Critical') ? colors.critical : colors.primary}
              />
              <Text style={s.value}>{n}</Text>
              <Text style={s.label}>{label}</Text>
            </Card>
          ))}
        </View>

        <SectionHeader
          title="Urgent - needs attention"
          actionLabel="View queue"
          onAction={() => navigation.navigate(ROUTES.COORDINATOR_REQUESTS_TAB)}
        />
        {urgent ? (
          <CoordinatorRequestCard
            request={urgent}
            onPress={() =>
              navigation.navigate(ROUTES.REQUEST_VERIFICATION, { requestId: urgent.requestId })
            }
          />
        ) : (
          <Text style={s.empty}>No open requests right now.</Text>
        )}

        <SectionHeader title="Recent activity" />
        <Card>
          {activity.length ? (
            activity.map((x, i) => (
              <View key={x} style={s.activity}>
                <View style={s.dot} />
                <Text style={s.activityText}>{x}</Text>
                {i === 0 ? <StatusBadge label="New" variant="info" /> : null}
              </View>
            ))
          ) : (
            <Text style={s.empty}>No activity yet.</Text>
          )}
        </Card>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  screen: { paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl },
  hero: { marginHorizontal: -spacing.xl, padding: spacing.xl, backgroundColor: colors.primary },
  eyebrow: { color: 'rgba(255,255,255,.75)', fontSize: typography.sizes.caption, fontWeight: typography.weights.bold },
  greeting: { marginTop: spacing.lg, color: colors.white, fontSize: typography.sizes.supporting },
  name: { color: colors.white, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold },
  hospital: { marginTop: spacing.xs, color: 'rgba(255,255,255,.8)', fontSize: typography.sizes.caption },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stat: { width: '48%', flexGrow: 1 },
  value: { marginTop: spacing.sm, color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold },
  label: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption },
  activity: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors.primary },
  activityText: { flex: 1, color: colors.textPrimary, fontSize: typography.sizes.caption },
  empty: { color: colors.textSecondary, fontSize: typography.sizes.caption },
  errorBox: { gap: spacing.md },
  errorText: { color: colors.textSecondary, fontSize: typography.sizes.supporting, textAlign: 'center' },
});