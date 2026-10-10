import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { AppHeader, Card, InfoBanner, PrimaryButton, Screen, SecondaryButton, StatusBadge } from '../../components';
import { ROUTES } from '../../constants';
import { getMyQr } from '../../services/donorApi';
import { colors, radius, spacing, typography } from '../../theme';

export default function RequestAcceptedScreen({ navigation, route }) {
  const alert = route.params?.alert;
  const [acceptedAt] = useState(() => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
  const [qr, setQr] = useState({ loading: true, token: '', error: '' });
  const travel = Number.isFinite(alert?.distanceKm)
    ? `${alert.distanceKm} km${Number.isFinite(alert?.etaMinutes) ? ` \u00B7 ${alert.etaMinutes} min` : ''}`
    : 'Not available';

  const loadQr = useCallback(async () => {
    setQr({ loading: true, token: '', error: '' });
    try {
      const data = await getMyQr();
      setQr({ loading: false, token: data.token, error: '' });
    } catch (e) {
      setQr({ loading: false, token: '', error: e?.response?.data?.message || 'Could not create your check-in code.' });
    }
  }, []);

  useEffect(() => { loadQr(); }, [loadQr]);

  return (
    <Screen scroll safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={styles.screen}>
      <View style={styles.content}>
        <AppHeader title="Donation response" onBack={navigation.goBack} />
        <View style={styles.successIcon}><MaterialCommunityIcons name="check" size={40} color={colors.white} /></View>
        <View style={styles.center}>
          <StatusBadge label="RESPONSE CONFIRMED" variant="success" dot />
          <Text style={styles.title}>Thank you for responding</Text>
          <Text style={styles.subtitle}>The hospital has been notified that you are on your way.</Text>
        </View>
        <Card elevated>
          <Text style={styles.hospital}>{alert?.hospital?.name ?? 'Hospital'}</Text>
          <View style={styles.divider} />
          <View style={styles.detail}><Text style={styles.detailLabel}>Travel estimate</Text><Text style={styles.detailValue}>{travel}</Text></View>
          <View style={styles.detail}><Text style={styles.detailLabel}>Accepted at</Text><Text style={styles.detailValue}>{acceptedAt}</Text></View>
        </Card>

        <Card elevated style={styles.qrCard}>
          <Text style={styles.qrTitle}>Your check-in QR code</Text>
          <Text style={styles.qrText}>Show this to the hospital coordinator when you arrive.</Text>
          <View style={styles.qrBox}>
            {qr.token ? <QRCode value={qr.token} size={200} /> : <Text style={styles.qrPlaceholder}>{qr.loading ? 'Creating your code...' : qr.error}</Text>}
          </View>
          <Text style={styles.qrNote}>The code is valid for 10 minutes. Refresh it if it expires.</Text>
          <SecondaryButton title="Refresh QR code" icon="refresh" onPress={loadQr} disabled={qr.loading} />
        </Card>

        <InfoBanner title="Before you leave" message="Bring a photo ID, stay hydrated, and tell hospital staff if you feel unwell." />
        <PrimaryButton title="Back to donor home" onPress={() => navigation.navigate(ROUTES.DONOR_HOME_TAB, { screen: ROUTES.DONOR_HOME })} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl },
  successIcon: { alignSelf: 'center', width: 76, height: 76, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.success },
  center: { alignItems: 'center', gap: spacing.sm },
  title: { color: colors.textPrimary, fontSize: typography.sizes.title, fontWeight: typography.weights.extrabold, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting, textAlign: 'center' },
  hospital: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
  divider: { height: 1, marginVertical: spacing.lg, backgroundColor: colors.border },
  detail: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.md },
  detailLabel: { color: colors.textSecondary, fontSize: typography.sizes.supporting },
  detailValue: { flex: 1, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold, textAlign: 'right' },
  qrCard: { alignItems: 'center', gap: spacing.md },
  qrTitle: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
  qrText: { color: colors.textSecondary, fontSize: typography.sizes.supporting, textAlign: 'center' },
  qrBox: { minWidth: 232, minHeight: 232, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, borderRadius: radius.lg, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border },
  qrPlaceholder: { color: colors.textSecondary, fontSize: typography.sizes.supporting, textAlign: 'center' },
  qrNote: { color: colors.textSecondary, fontSize: typography.sizes.caption, textAlign: 'center' },
});