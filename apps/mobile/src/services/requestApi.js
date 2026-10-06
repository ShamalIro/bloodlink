import api from './api';

// payload: { bloodType, unitsRequired, hospital: { name, address? }, notes? }
export const createRequest = async (payload) =>
  (await api.post('/api/requests', payload)).data;

// status: 'active' (default) or 'past'
export const getMyRequests = async (status = 'active') =>
  (await api.get('/api/requests/mine', { params: { status } })).data;

export const getRequest = async (id) =>
  (await api.get(`/api/requests/${id}`)).data;

export const fulfillRequest = async (id, unitsFulfilled) =>
  (await api.patch(`/api/requests/${id}/fulfill`, unitsFulfilled != null ? { unitsFulfilled } : {})).data;