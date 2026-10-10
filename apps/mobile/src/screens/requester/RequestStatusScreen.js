import React, { useCallback, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader, BloodTypeBadge, Card, DestructiveButton, ErrorState, InfoBanner, LoadingState, PrimaryButton, Screen, StatusBadge } from '../../components';
import { RequestProgress } from '../../components/requester';
import api from '../../services/api';
import { fulfillRequest, getRequest } from '../../services/requestApi';
import { colors, radius, spacing, typography } from '../../theme';

const statusPresentation = {
  pending: { label: 'Pending verification', variant: 'warning', message: 'A coordinator must verify this request before it is broadcast.' },
  broadcasting: { label: 'Broadcasting', variant: 'critical', message: 'The verified request is open for matching donor responses.' },
  fulfilled: { label: 'Fulfilled', variant: 'success', message: 'The requested blood units have been received.' },
  closed: { label: 'Closed', variant: 'neutral', message: 'This request is no longer active.' },
};

const responseLabels = { responding: 'On the way', arrived: 'Arrived', donated: 'Donated' };

export default function RequestStatusScreen({ navigation, route }) {
  const requestId = route.params?.requestId;
  const [request, setRequest] = useState(route.params?.initialRequest ?? null);
  const [loading, setLoading] = useState(!route.params?.initialRequest);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const lock = useRef(false);

  const load = useCallback(async (quiet = false) => {
    if (!requestId) { setError('Request information is unavailable.'); setLoading(false); return; }
    quiet ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      setRequest(await getRequest(requestId));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Could not load this request.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [requestId]);

  React.useEffect(() => { load(Boolean(request)); }, [load]);

  const markFulfilled = async () => {
    if (!requestId || lock.current) return;
    lock.current = true;
    setBusy('fulfill');
    setError('');
    try {
      setRequest(await fulfillRequest(requestId));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Could not mark this request fulfilled.');
    } finally {
      lock.current = false;
      setBusy('');
    }
  };

  const doCancel = async () => {
    if (!requestId || lock.current) return;
    lock.current = true;
    setBusy('cancel');
    setError('');
    try {
      setRequest((await api.patch(`/api/requests/${requestId}/close`)).data);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Could not cancel this request.');
    } finally {
      lock.current = false;
      setBusy('');
    }
  };

  const cancelRequest = () => {
    Alert.alert('Cancel this request?', 'Donors who are on their way will be told they are no longer needed.', [
      { text: 'Keep request', style: 'cancel' },
      { text: 'Cancel request', style: 'destructive', onPress: doCancel },
    ]);
  };

  if (loading && !request) return <Screen padded={false}><AppHeader title="Request status" onBack={navigation.goBack} /><LoadingState message="Loading request status..." /></Screen>;
  if (error && !request) return <Screen padded={false}><AppHeader title="Request status" onBack={navigation.goBack} /><ErrorState message={error} onRetry={() => load()} /></Screen>;

  const status = statusPresentation[request?.status] ?? statusPresentation.pending;
  const responses = Array.isArray(request?.donorResponses) ? request.donorResponses.filter((item) => item.status !== 'declined') : [];
  const confirmedUnits = request?.unitsFulfilled ?? 0;
  const required = request?.unitsRequired ?? 0;
  const isActive = request?.status === 'pending' || request?.status === 'broadcasting';
  const canFulfill = request?.status === 'broadcasting' && required > 0 && confirmedUnits >= required;

  return (
    <Screen padded={false} scroll>
      <AppHeader title="Request status" subtitle={requestId ? `REQ-${requestId.slice(-6).toUpperCase()}` : undefined} onBack={navigation.goBack} right={<Pressable onPress={() => load(true)} disabled={refreshing} hitSlop={8}><MaterialCommunityIcons name="refresh" size={24} color={refreshing ? colors.textTertiary : colors.textPrimary} /></Pressable>} />
      <View style={styles.outer}>
        <View style={styles.content}>
          <Card style={styles.summary}>
            <View style={styles.summaryHeader}>
              <BloodTypeBadge type={request?.bloodType ?? '\u2014'} critical={request?.status === 'broadcasting'} />
              <View style={styles.summaryCopy}><StatusBadge label={status.label} variant={status.variant} dot /><Text style={styles.units}>{required} units requested</Text></View>
            </View>
            <RequestProgress fulfilled={confirmedUnits} required={request?.unitsRequired} label="units confirmed" />
          </Card>

          <InfoBanner title={status.label} message={status.message} />

          <Card>
            <Text style={styles.sectionTitle}>Request details</Text>
            <DetailRow label="Hospital" value={request?.hospital?.name} />
            <DetailRow label="Verification" value={request?.isVerified ? 'Verified' : 'Awaiting review'} />
            {request?.notes ? <DetailRow label="Notes" value={request.notes} /> : null}
          </Card>

          <View>
            <Text style={styles.sectionTitle}>Responding donors</Text>
            <Text style={styles.sectionSubtitle}>{responses.length} donor response{responses.length === 1 ? '' : 's'}</Text>
            <View style={styles.responses}>
              {responses.map((response, index) => (
                <Card key={`${response.donorId}-${index}`}>
                  <View style={styles.responseRow}>
                    <View style={styles.donorIcon}><MaterialCommunityIcons name="account-outline" size={22} color={colors.primary} /></View>
                    <View style={styles.responseCopy}>
                      <Text style={styles.responseName}>Donor {index + 1}</Text>
                      <Text style={styles.responseMeta}>{response.distanceKm != null ? `${response.distanceKm} km away` : 'Distance unavailable'}{response.etaMinutes != null ? ` \u00B7 ${response.etaMinutes} min ETA` : ''}</Text>
                    </View>
                    <StatusBadge label={responseLabels[response.status] ?? response.status} variant={response.status === 'donated' || response.status === 'arrived' ? 'success' : 'info'} />
                  </View>
                </Card>
              ))}
              {!responses.length ? <Card><Text style={styles.noResponses}>No donors have responded yet. Tap the refresh icon above to check again.</Text></Card> : null}
            </View>
          </View>

          {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
          {canFulfill ? <PrimaryButton title="Mark as fulfilled" icon="check-circle-outline" onPress={markFulfilled} loading={busy === 'fulfill'} disabled={Boolean(busy)} /> : null}
          {isActive && !canFulfill && request?.status === 'broadcasting' ? <Text style={styles.hint}>This request closes automatically once the hospital confirms all units.</Text> : null}
          {isActive ? <DestructiveButton title="Cancel request" icon="close-circle-outline" onPress={cancelRequest} loading={busy === 'cancel'} disabled={Boolean(busy)} /> : null}
        </View>
      </View>
    </Screen>
  );
}

function DetailRow({ label, value }) {
  return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value ?? 'Unavailable'}</Text></View>;
}

const styles = StyleSheet.create({
  outer: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xxl },
  summary: { gap: spacing.xl },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  summaryCopy: { flex: 1, alignItems: 'flex-start', gap: spacing.sm },
  units: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
  sectionSubtitle: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption },
  detailRow: { flexDirection: 'row', gap: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  detailLabel: { width: 92, color: colors.textSecondary, fontSize: typography.sizes.supporting },
  detailValue: { flex: 1, color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold, textAlign: 'right' },
  responses: { gap: spacing.md, marginTop: spacing.lg },
  responseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  donorIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.primaryTint },
  responseCopy: { flex: 1 },
  responseName: { color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.bold },
  responseMeta: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption },
  noResponses: { color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting, textAlign: 'center' },
  error: { color: colors.error, fontSize: typography.sizes.supporting },
  hint: { color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption, textAlign: 'center' },
});