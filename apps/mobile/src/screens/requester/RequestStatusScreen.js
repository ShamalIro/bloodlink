import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader, BloodTypeBadge, Card, ErrorState, InfoBanner, LoadingState, PrimaryButton, Screen, StatusBadge } from '../../components';
import { RequestProgress } from '../../components/requester';
import { fulfillRequest, getRequest } from '../../services/requestApi';
import { colors, radius, spacing, typography } from '../../theme';

const statusPresentation = {
  pending: { label: 'Pending verification', variant: 'warning', message: 'A coordinator must verify this request before it is broadcast.' },
  broadcasting: { label: 'Broadcasting', variant: 'critical', message: 'The verified request is open for matching donor responses.' },
  fulfilled: { label: 'Fulfilled', variant: 'success', message: 'The requested blood units have been marked as received.' },
  closed: { label: 'Closed', variant: 'neutral', message: 'This request is no longer active.' },
};

export default function RequestStatusScreen({ navigation, route }) {
  const requestId = route.params?.requestId;
  const [request, setRequest] = useState(route.params?.initialRequest ?? null);
  const [loading, setLoading] = useState(!route.params?.initialRequest);
  const [refreshing, setRefreshing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState('');
  const closeLock = useRef(false);

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
    if (!requestId || closeLock.current) return;
    closeLock.current = true;
    setClosing(true);
    setError('');
    try {
      setRequest(await fulfillRequest(requestId, request?.unitsRequired));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Could not mark this request fulfilled.');
      closeLock.current = false;
    } finally {
      setClosing(false);
    }
  };

  if (loading && !request) return <Screen padded={false}><AppHeader title="Request status" onBack={navigation.goBack} /><LoadingState message="Loading request status..." /></Screen>;
  if (error && !request) return <Screen padded={false}><AppHeader title="Request status" onBack={navigation.goBack} /><ErrorState message={error} onRetry={() => load()} /></Screen>;

  const status = statusPresentation[request?.status] ?? statusPresentation.pending;
  const responses = Array.isArray(request?.donorResponses) ? request.donorResponses.filter((item) => item.status !== 'declined') : [];
  const confirmedUnits = Math.max(request?.unitsFulfilled ?? 0, responses.filter((item) => item.status === 'donated').length);
  const isActive = request?.status === 'pending' || request?.status === 'broadcasting';

  return (
    <Screen padded={false} scroll>
      <AppHeader title="Request status" subtitle={requestId ? `REQ-${requestId.slice(-6).toUpperCase()}` : undefined} onBack={navigation.goBack} right={<Pressable onPress={() => load(true)} disabled={refreshing} hitSlop={8}><MaterialCommunityIcons name="refresh" size={24} color={refreshing ? colors.textTertiary : colors.textPrimary} /></Pressable>} />
      <View style={styles.outer}>
        <View style={styles.content}>
          <Card style={styles.summary}>
            <View style={styles.summaryHeader}>
              <BloodTypeBadge type={request?.bloodType ?? '—'} critical={request?.status === 'broadcasting'} />
              <View style={styles.summaryCopy}><StatusBadge label={status.label} variant={status.variant} dot /><Text style={styles.units}>{request?.unitsRequired ?? 0} units requested</Text></View>
            </View>
            <RequestProgress fulfilled={confirmedUnits} required={request?.unitsRequired} label="units covered" />
          </Card>

          <InfoBanner title={status.label} message={status.message} />

          <Card>
            <Text style={styles.sectionTitle}>Request details</Text>
            <DetailRow label="Hospital" value={request?.hospital?.name} />
            <DetailRow label="Address" value={request?.hospital?.address || 'Not provided'} />
            <DetailRow label="Verification" value={request?.isVerified ? 'Verified' : 'Awaiting review'} />
            {request?.notes ? <DetailRow label="Notes" value={request.notes} /> : null}
          </Card>

          <View>
            <Text style={styles.sectionTitle}>Responding donors</Text>
            <Text style={styles.sectionSubtitle}>{responses.length} active response{responses.length === 1 ? '' : 's'} returned by the request service</Text>
            <View style={styles.responses}>
              {responses.map((response, index) => (
                <Card key={`${response.donorId}-${index}`}>
                  <View style={styles.responseRow}>
                    <View style={styles.donorIcon}><MaterialCommunityIcons name="account-outline" size={22} color={colors.primary} /></View>
                    <View style={styles.responseCopy}>
                      <Text style={styles.responseName}>Donor response {index + 1}</Text>
                      <Text style={styles.responseMeta}>{response.distanceKm != null ? `${response.distanceKm} km away` : 'Distance unavailable'}{response.etaMinutes != null ? ` · ${response.etaMinutes} min ETA` : ''}</Text>
                    </View>
                    <StatusBadge label={response.status} variant={response.status === 'donated' || response.status === 'arrived' ? 'success' : 'info'} />
                  </View>
                </Card>
              ))}
              {!responses.length ? <Card><Text style={styles.noResponses}>No active donor responses are available yet. Use refresh to check the latest server state.</Text></Card> : null}
            </View>
          </View>

          {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
          {isActive ? <PrimaryButton title="Mark as fulfilled" icon="check-circle-outline" onPress={markFulfilled} loading={closing} disabled={closing} /> : null}
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
});
