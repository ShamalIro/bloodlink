import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { TOKEN_KEY } from './api';
import { getHospitalRequests, getPendingRequests } from './coordinatorApi';

export const getInventory = async (hospitalId) =>
  (await api.get(`/api/inventory/${hospitalId}`)).data;

export const setStock = async (hospitalId, bloodType, units) =>
  (await api.put(`/api/inventory/${hospitalId}/${encodeURIComponent(bloodType)}`, { units })).data;

export const broadcastAppeal = async (hospitalId, bloodType) =>
  (await api.post(`/api/inventory/${hospitalId}/broadcast-appeal`, { bloodType })).data;

// ---- Which hospital does the logged-in coordinator belong to? ----
// The stored user object has no hospitalId, so read it from the JWT payload,
// and fall back to the hospital on the coordinator's own requests.

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const decodeBase64Url = (input) => {
  const str = input.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  let out = '';
  let acc = 0;
  let bits = 0;
  for (const ch of str) {
    acc = (acc << 6) | B64.indexOf(ch);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out += String.fromCharCode((acc >> bits) & 0xff);
      acc &= (1 << bits) - 1;
    }
  }
  return out;
};

let cachedHospitalId = null;

export const getMyHospitalId = async () => {
  if (cachedHospitalId) return cachedHospitalId;

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const payload = JSON.parse(decodeBase64Url(token.split('.')[1]));
    if (payload.hospitalId) {
      cachedHospitalId = payload.hospitalId;
      return cachedHospitalId;
    }
  } catch {
    // fall through to the request-based lookup
  }

  try {
    const lists = await Promise.all([
      getPendingRequests(),
      getHospitalRequests('broadcasting'),
      getHospitalRequests('fulfilled'),
    ]);
    const found = lists.flat().find((r) => r.hospital?.hospitalId);
    if (found) cachedHospitalId = found.hospital.hospitalId;
  } catch {
    // leave null
  }
  return cachedHospitalId;
};

// Call on logout so the next coordinator is not mixed up with the previous one.
export const clearHospitalIdCache = () => {
  cachedHospitalId = null;
};