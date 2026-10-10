import { useCallback, useState } from 'react';
import { getMyNotifications, getRequestById } from '../services/donorApi';

const timeAgo = (iso) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
};

// Maps a blood_request notification + its request to the shape DonorAlertCard expects.
// urgency and ETA do not exist in the backend: urgency is fixed, ETA is a rough estimate.
const toAlert = (notification, request) => {
  const distanceKm = notification.data?.distanceKm;
  return {
    id: notification.data.requestId,
    notificationId: notification._id,
    bloodType: request.bloodType,
    unitsRequired: Math.max(1, request.unitsRequired - (request.unitsFulfilled || 0)),
    urgency: 'urgent',
    createdLabel: timeAgo(notification.createdAt),
    hospital: { name: request.hospital?.name ?? notification.data?.hospitalName ?? 'Hospital', address: '', verified: true },
    distanceKm,
    etaMinutes: Number.isFinite(distanceKm) ? Math.max(5, Math.round(distanceKm * 3)) : undefined,
    patientReference: '',
    raisedBy: '',
    notes: request.notes || '',
  };
};

// Open blood requests this donor was notified about (closed or fulfilled ones are dropped).
export default function useDonorAlerts(limit = 10) {
  const [state, setState] = useState({ loading: true, error: '', alerts: [] });

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const { notifications = [] } = await getMyNotifications();
      const recent = notifications
        .filter((n) => n.type === 'blood_request' && n.data?.requestId)
        .slice(0, limit);
      const results = await Promise.allSettled(recent.map((n) => getRequestById(n.data.requestId)));
      const alerts = [];
      recent.forEach((n, index) => {
        const result = results[index];
        if (result.status === 'fulfilled' && result.value?.status === 'broadcasting') {
          alerts.push(toAlert(n, result.value));
        }
      });
      setState({ loading: false, error: '', alerts });
    } catch (error) {
      setState({ loading: false, error: error?.response?.data?.message || 'Could not load blood alerts.', alerts: [] });
    }
  }, [limit]);

  return { ...state, reload };
}