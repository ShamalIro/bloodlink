import api from './api';

// Both return { token, user: { id, name, role, isVerified } }.
export const register = async (payload) =>
  (await api.post('/api/auth/register', payload)).data;

export const login = async ({ email, password }) =>
  (await api.post('/api/auth/login', { email, password })).data;