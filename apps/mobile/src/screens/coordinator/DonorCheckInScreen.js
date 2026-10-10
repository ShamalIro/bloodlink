import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Card, FormInput, InfoBanner, PrimaryButton, Screen, SecondaryButton } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import {
  checkInDonor,
  confirmDonation,
  getHospitalRequests,
  toCard,
} from '../../services/coordinatorApi';

// The QR may hold the raw token or a small JSON object; handle both.
const extractToken = (data) => {
  const text = String(data || '').trim();
  try {
    const parsed = JSON.parse(text);
    return parsed.qrToken || parsed.token || text;
  } catch {
    return text;
  }
};

const errMsg = (e, fallback) => e?.response?.data?.message || fallback;

export default function DonorCheckInScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // request id
  const [token, setToken] = useState('');
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [arrived, setArrived] = useState(null); // { donorId, bloodType }
  const [units, setUnits] = useState(1);
  const [result, setResult] = useState(null); // confirm-donation response

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHospitalRequests('broadcasting');
      const cards = data.map(toCard);
      setRequests(cards);
      setSelected((cur) => (cards.some((c) => c.requestId === cur) ? cur : cards[0]?.requestId || null));
    } catch (e) {
      Alert.alert('Could not load requests', errMsg(e, 'Check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests])
  );

  const startScan = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Camera needed', 'Allow camera access to scan, or paste the token below.');
        return;
      }
    }
    setScanning(true);
  };

  const onScanned = ({ data }) => {
    setScanning(false);
    setToken(extractToken(data));
  };

  const doCheckIn = async () => {
    if (busy || !selected || !token.trim()) return;
    setBusy(true);
    try {
      const res = await checkInDonor(selected, token.trim());
      setArrived(res.donor);
      setToken('');
      setResult(null);
      setUnits(1);
    } catch (e) {
      Alert.alert('Check-in failed', errMsg(e, 'Could not check in this donor.'));
    } finally {
      setBusy(false);
    }
  };

  const doConfirm = async () => {
    if (busy || !arrived) return;
    setBusy(true);
    try {
      const doc = await confirmDonation(selected, arrived.donorId, units);
      setResult(doc);
      setArrived(null);
      loadRequests();
    } catch (e) {
      Alert.alert('Could not confirm', errMsg(e, 'Donation was not recorded.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
      <View style={s.content}>
        <View>
          <Text style={s.eyebrow}>DONOR CHECK-IN</Text>
          <Text style={s.title}>Verify donor arrival</Text>
        </View>

        <View style={s.block}>
          <Text style={s.label}>Request</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : requests.length ? (
            <View style={s.chips}>
              {requests.map((r) => (
                <Pressable
                  key={r.requestId}
                  onPress={() => setSelected(r.requestId)}
                  style={[s.chip, selected === r.requestId && s.chipActive]}
                >
                  <Text style={[s.chipText, selected === r.requestId && s.chipTextActive]}>
                    {r.id} · {r.bloodType}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={s.muted}>No broadcasting requests. Approve one first.</Text>
          )}
        </View>

        {scanning ? (
          <Card style={s.cameraCard}>
            <CameraView
              style={s.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={onScanned}
            />
            <SecondaryButton title="Cancel scan" onPress={() => setScanning(false)} />
          </Card>
        ) : (
          <Card style={s.scanner}>
            <View style={s.qr}>
              <MaterialCommunityIcons name="qrcode-scan" size={54} color={colors.primary} />
            </View>
            <Text style={s.scanTitle}>Scan the donor's BloodLink QR</Text>
            <Text style={s.scanText}>Ask the donor to open their QR code, then scan it.</Text>
            <PrimaryButton title="Scan QR" icon="camera-outline" onPress={startScan} />
          </Card>
        )}

        <Text style={s.or}>OR PASTE THE DONOR'S TOKEN</Text>
        <FormInput
          label="QR token"
          placeholder="Paste token"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <PrimaryButton
          title="Check in donor"
          icon="account-check-outline"
          loading={busy && !arrived}
          disabled={!selected || !token.trim() || busy}
          onPress={doCheckIn}
        />

        {arrived ? (
          <Card>
            <Text style={s.label}>Donor checked in</Text>
            <Text style={s.value}>Blood type: {arrived.bloodType || 'unknown'}</Text>
            <View style={s.unitsRow}>
              <Text style={s.label}>Units collected</Text>
              <View style={s.stepper}>
                <Pressable style={s.stepBtn} onPress={() => setUnits((u) => Math.max(1, u - 1))}>
                  <Text style={s.stepText}>-</Text>
                </Pressable>
                <Text style={s.units}>{units}</Text>
                <Pressable style={s.stepBtn} onPress={() => setUnits((u) => Math.min(4, u + 1))}>
                  <Text style={s.stepText}>+</Text>
                </Pressable>
              </View>
            </View>
            <PrimaryButton title="Confirm donation" icon="water-check" loading={busy} onPress={doConfirm} />
          </Card>
        ) : null}

        {result ? (
          <InfoBanner
            variant="success"
            title="Donation recorded"
            message={`${result.unitsFulfilled} of ${result.unitsRequired} units collected. Request is ${result.status}.`}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  screen: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl },
  eyebrow: { color: colors.primary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold },
  title: { marginTop: spacing.xs, color: colors.textPrimary, fontSize: typography.sizes.display, fontWeight: typography.weights.extrabold },
  block: { gap: spacing.sm },
  label: { color: colors.textSecondary, fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold },
  muted: { color: colors.textSecondary, fontSize: typography.sizes.supporting },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  chipText: { color: colors.textSecondary, fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold },
  chipTextActive: { color: colors.primary },
  scanner: { alignItems: 'center', padding: spacing.xxl, gap: spacing.md },
  qr: { width: 120, height: 120, borderWidth: 2, borderColor: colors.primary, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryTint },
  scanTitle: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold, textAlign: 'center' },
  scanText: { color: colors.textSecondary, fontSize: typography.sizes.supporting, textAlign: 'center' },
  cameraCard: { gap: spacing.md },
  camera: { width: '100%', height: 280, borderRadius: radius.lg, overflow: 'hidden' },
  or: { color: colors.textTertiary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, textAlign: 'center' },
  value: { marginVertical: spacing.sm, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  unitsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  stepBtn: { width: 36, height: 36, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: colors.primary, fontSize: 20, fontWeight: typography.weights.bold },
  units: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
});