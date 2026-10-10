import api from './api';

// ---- API calls (all go through the gateway, token added by api.js) ----

export const getPendingRequests = async () =>
  (await api.get('/api/requests/pending')).data;

// status: 'broadcasting' | 'fulfilled'
export const getHospitalRequests = async (status) =>
  (await api.get('/api/requests/hospital', { params: { status } })).data;

export const getDashboard = async () =>
  (await api.get('/api/requests/dashboard')).data;

export const getRequestById = async (id) =>
  (await api.get(`/api/requests/${id}`)).data;

export const verifyRequest = async (id) =>
  (await api.patch(`/api/requests/${id}/verify`)).data;

export const checkInDonor = async (id, qrToken) =>
  (await api.post(`/api/requests/${id}/check-in`, { qrToken })).data;

export const confirmDonation = async (id, donorId, units = 1) =>
  (await api.post(`/api/requests/${id}/confirm-donation`, { donorId, units })).data;

// ---- Mapper: backend request -> shape used by CoordinatorRequestCard ----

const CRITICAL_AFTER_MIN = 15;

export const timeAgo = (iso) => {
  if (!iso) return '';
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
};

const activeResponders = (r) =>
  (r.donorResponses || []).filter((d) => ['responding', 'arrived'].includes(d.status)).length;

// The backend has no urgency field, so it is derived here.
// Broadcasting: critical if open > 15 min with nobody responding (same rule as the dashboard).
// Pending: critical for 3+ units or O-.
const urgencyOf = (r) => {
  if (r.status === 'fulfilled' || r.status === 'closed') return r.status;
  if (r.status === 'broadcasting') {
    const open = r.verifiedAt ? (Date.now() - new Date(r.verifiedAt).getTime()) / 60000 : 0;
    const anyone = (r.donorResponses || []).some((d) =>
      ['responding', 'arrived', 'donated'].includes(d.status)
    );
    return open > CRITICAL_AFTER_MIN && !anyone ? 'critical' : 'urgent';
  }
  return r.unitsRequired >= 3 || r.bloodType === 'O-' ? 'critical' : 'urgent';
};

export const toCard = (r) => {
  const responders = activeResponders(r);
  return {
    raw: r,
    requestId: r._id, // real id, used for navigation and API calls
    id: `REQ-${String(r._id).slice(-4).toUpperCase()}`, // short code shown on the card
    bloodType: r.bloodType,
    units: r.unitsRequired,
    urgency: urgencyOf(r),
    hospital: r.hospital?.name || 'Hospital',
    location: r.hospital?.address || 'Hospital request',
    distance:
      r.status === 'pending'
        ? 'Awaiting verification'
        : `${responders} donor${responders === 1 ? '' : 's'} responding`,
    age: timeAgo(r.createdAt),
  };
};