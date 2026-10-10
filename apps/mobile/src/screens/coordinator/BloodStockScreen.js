import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  BloodTypeBadge,
  Card,
  EmergencyBanner,
  PrimaryButton,
  Screen,
  SectionHeader,
  SecondaryButton,
  StatusBadge,
} from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import { timeAgo } from '../../services/coordinatorApi';
import {
  broadcastAppeal,
  getInventory,
  getMyHospitalId,
  setStock,
} from '../../services/inventoryApi';

const LEVELS = {
  critical: { label: 'Critical', variant: 'critical' },
  low: { label: 'Low', variant: 'warning' },
};
const levelInfo = (level) => LEVELS[level] || { label: 'Healthy', variant: 'success' };
const errMsg = (e, fallback) => e?.response?.data?.message || fallback;

export default function BloodStockScreen() {
  const [hospitalId, setHospitalId] = useState(null);
  const [stock, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(null); // blood type being saved

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const id = await getMyHospitalId();
      if (!id) {
        setError('Could not work out your hospital yet. Open the Requests tab and try again.');
        return;
      }
      setHospitalId(id);
      const inv = await getInventory(id);
      setStockList(inv.stock || []);
    } catch (e) {
      setError(errMsg(e, 'Could not load inventory.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const changeUnits = async (item, delta) => {
    const next = Math.max(0, item.units + delta);
    if (saving || next === item.units) return;
    setSaving(item.bloodType);
    try {
      await setStock(hospitalId, item.bloodType, next);
      await load(true);
    } catch (e) {
      Alert.alert('Could not update stock', errMsg(e, 'Try again.'));
    } finally {
      setSaving(null);
    }
  };

  const sendAppeal = (item) => {
    Alert.alert(
      `Send appeal for ${item.bloodType}?`,
      'Nearby eligible donors will be notified. Only one appeal per blood type is allowed every 6 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send appeal',
          onPress: async () => {
            try {
              await broadcastAppeal(hospitalId, item.bloodType);
              Alert.alert('Appeal sent', `Donors with ${item.bloodType} blood are being notified.`);
            } catch (e) {
              Alert.alert('Could not send appeal', errMsg(e, 'Try again later.'));
            }
          },
        },
      ]
    );
  };

  const needy = stock.filter((x) => x.level === 'critical' || x.level === 'low');
  const updates = stock.map((x) => x.updatedAt).filter(Boolean).sort();
  const lastUpdate = updates.length ? `Updated ${timeAgo(updates[updates.length - 1])}` : 'No stock recorded yet';

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
      <View style={s.content}>
        <View>
          <Text style={s.eyebrow}>INVENTORY</Text>
          <Text style={s.title}>Blood stock</Text>
          <Text style={s.sub}>{lastUpdate}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
            <PrimaryButton title="Try again" onPress={() => load()} />
          </View>
        ) : (
          <>
            {needy.length ? (
              <EmergencyBanner
                title={`${needy.length} blood type${needy.length === 1 ? '' : 's'} below safe level`}
                message="Tap Appeal on a blood type to alert nearby eligible donors."
              />
            ) : null}

            <SectionHeader title="Current inventory" />
            <View style={s.list}>
              {stock.map((item) => {
                const info = levelInfo(item.level);
                const needsBlood = item.level === 'critical' || item.level === 'low';
                return (
                  <Card key={item.bloodType}>
                    <View style={s.row}>
                      <BloodTypeBadge type={item.bloodType} critical={item.level === 'critical'} />
                      <View style={s.mid}>
                        <Text style={s.units}>
                          {item.units} unit{item.units === 1 ? '' : 's'}
                        </Text>
                        <StatusBadge label={info.label} variant={info.variant} />
                      </View>
                      <View style={s.stepper}>
                        <Pressable
                          style={s.stepBtn}
                          disabled={!!saving || item.units === 0}
                          onPress={() => changeUnits(item, -1)}
                        >
                          <Text style={s.stepText}>-</Text>
                        </Pressable>
                        <Pressable
                          style={s.stepBtn}
                          disabled={!!saving}
                          onPress={() => changeUnits(item, 1)}
                        >
                          <Text style={s.stepText}>+</Text>
                        </Pressable>
                      </View>
                    </View>
                    {needsBlood ? (
                      <View style={s.appeal}>
                        <SecondaryButton
                          title={`Appeal for ${item.bloodType} donors`}
                          icon="broadcast"
                          onPress={() => sendAppeal(item)}
                        />
                      </View>
                    ) : null}
                  </Card>
                );
              })}
            </View>
          </>
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
  sub: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption },
  list: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  mid: { flex: 1, gap: spacing.xs, alignItems: 'flex-start' },
  units: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
  stepper: { flexDirection: 'row', gap: spacing.sm },
  stepBtn: { width: 40, height: 40, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: colors.primary, fontSize: 22, fontWeight: typography.weights.bold },
  appeal: { marginTop: spacing.md },
  errorBox: { gap: spacing.md },
  errorText: { color: colors.textSecondary, fontSize: typography.sizes.supporting, textAlign: 'center' },
});