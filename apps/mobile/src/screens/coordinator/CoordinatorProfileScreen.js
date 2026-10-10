import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, DestructiveButton, Screen, StatusBadge } from '../../components';
import { useAuth } from '../../store/AuthContext';
import { colors, radius, spacing, typography } from '../../theme';
import api from '../../services/api';
import { clearHospitalIdCache, getMyHospitalId } from '../../services/inventoryApi';

export default function CoordinatorProfileScreen() {
  const { user, signOut } = useAuth();
  const [hospitalId, setHospitalId] = useState(null);
  const [hospitalName, setHospitalName] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const id = await getMyHospitalId();
        if (!active || !id) return;
        setHospitalId(id);
        const list = (await api.get('/api/verification/hospitals')).data;
        const match = Array.isArray(list) ? list.find((h) => h.hospitalId === id) : null;
        if (active && match) setHospitalName(match.name);
      } catch {
        // the profile still works without the hospital name
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSignOut = () => {
    clearHospitalIdCache();
    signOut();
  };

  const rows = [
    ['Hospital', hospitalName || hospitalId || 'Loading...'],
    ['Hospital ID', hospitalId || '-'],
    ['Email', user?.email || '-'],
  ];
  if (user?.phone) rows.push(['Phone', user.phone]);

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
      <View style={s.content}>
        <Text style={s.title}>Coordinator profile</Text>

        <Card elevated style={s.identity}>
          <View style={s.avatar}>
            <MaterialCommunityIcons name="hospital-building" size={30} color={colors.primary} />
          </View>
          <View style={s.copy}>
            <Text style={s.name}>{user?.name || 'Coordinator'}</Text>
            <Text style={s.meta}>{hospitalName || 'Your hospital'}</Text>
            <StatusBadge label="HOSPITAL COORDINATOR" variant="success" />
          </View>
        </Card>

        <Card>
          {rows.map(([a, b]) => (
            <View key={a} style={s.row}>
              <Text style={s.label}>{a}</Text>
              <Text style={s.value}>{b}</Text>
            </View>
          ))}
        </Card>

        <DestructiveButton title="Log out" icon="logout" onPress={handleSignOut} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl },
  title: { color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 58, height: 58, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryTint },
  copy: { flex: 1, gap: spacing.xs },
  name: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
  meta: { color: colors.textSecondary, fontSize: typography.sizes.caption },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.md },
  label: { color: colors.textSecondary, fontSize: typography.sizes.supporting },
  value: { flex: 1, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold, textAlign: 'right' },
});

