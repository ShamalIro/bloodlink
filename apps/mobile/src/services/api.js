import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

// Set EXPO_PUBLIC_API_URL in apps/mobile/.env, e.g. http://192.168.1.20:4000
// (your PC's LAN IPv4 for a physical phone). 10.0.2.2 is the Android emulator's
// address for the host machine.
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000';

const api = axios.create({ baseURL: API_URL, timeout: 10000 });

// Attach the saved JWT to every request.
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url ?? '';
    // Skip /api/auth/*: a wrong password on login is also a 401
    if (status === 401 && !url.includes('/api/auth/') && onUnauthorized) onUnauthorized();
    return Promise.reject(error);
  }
);

export default api;