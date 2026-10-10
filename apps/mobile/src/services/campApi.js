import api from './api';

// ---- API calls (NGO staff, through the gateway) ----

export const getMyCamps = async () => (await api.get('/api/camps/mine')).data;

export const getCamp = async (id) => (await api.get(`/api/camps/${id}`)).data;

// payload: { title, description?, venue: { name, address?, latitude, longitude },
//            startsAt, endsAt, bloodTypesNeeded: [...], capacity }
export const createCamp = async (payload) => (await api.post('/api/camps', payload)).data;

export const updateCamp = async (id, payload) => (await api.patch(`/api/camps/${id}`, payload)).data;

export const cancelCamp = async (id) => (await api.delete(`/api/camps/${id}`)).data;

export const inviteDonors = async (id) => (await api.post(`/api/camps/${id}/invite`)).data;

// ---- Display helpers ----

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatDate = (d) => `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export const formatTime = (d) => {
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
};

// The backend only stores 'scheduled' or 'cancelled'; the rest is worked out from the times.
export const campStatus = (camp) => {
  if (camp.status === 'cancelled') return 'cancelled';
  const now = Date.now();
  if (now < new Date(camp.startsAt).getTime()) return 'upcoming';
  if (now <= new Date(camp.endsAt).getTime()) return 'active';
  return 'completed';
};

// Backend camp -> the shape CampCard and the NGO screens expect.
export const toCampCard = (c) => {
  const start = new Date(c.startsAt);
  const end = new Date(c.endsAt);
  const place = [c.venue?.name, c.venue?.address].filter(Boolean).join(', ');
  return {
    raw: c,
    id: c._id,
    name: c.title,
    status: campStatus(c),
    date: formatDate(start),
    time: `${formatTime(start)} - ${formatTime(end)}`,
    location: place || 'Venue not set',
    registered: c.registeredCount ?? 0,
    target: c.capacity ?? 0,
    units: 0,
    bloodTypes: c.bloodTypesNeeded || [],
    description: c.description || '',
    spotsLeft: c.spotsLeft ?? Math.max(0, (c.capacity ?? 0) - (c.registeredCount ?? 0)),
  };
};