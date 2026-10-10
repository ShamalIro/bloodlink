import api from './api';

// -> { userId, bloodType, district, available, location, lastDonationDate,
//      eligibleFromDate, isEligible, ... }  (404 if the profile is not set up yet)
export const getMyProfile = async () => (await api.get('/api/donors/me')).data;

// payload: { bloodType, district, latitude, longitude, available, pushToken }
// token is optional: pass it right after registering, before it is saved in storage
export const saveMyProfile = async (payload, token) =>
  (await api.put('/api/donors/me', payload,
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)).data;

export const setAvailability = async (available) =>
  (await api.patch('/api/donors/me/availability', { available })).data;

// -> { token, expiresInSeconds }  (render `token` as the check-in QR code)
export const getMyQr = async () => (await api.get('/api/donors/me/qr')).data;

// -> { count, lastDonationDate, eligibleFromDate, isEligible, donations: [...] }
export const getMyDonations = async () =>
  (await api.get('/api/donors/me/donations')).data;

// Alert feed: blood_request / camp_invite notifications for this donor
export const getMyNotifications = async () =>
  (await api.get('/api/notifications/mine')).data;

export const markNotificationRead = async (id) =>
  (await api.patch(`/api/notifications/${id}/read`)).data;

// action: 'accept' or 'decline'; extras: { distanceKm, etaMinutes } (optional)
export const respondToRequest = async (requestId, action, extras = {}) =>
  (await api.patch(`/api/requests/${requestId}/respond`, { action, ...extras })).data;

// Donor view of one request
export const getRequestById = async (requestId) =>
  (await api.get(`/api/requests/${requestId}`)).data;