import api from './api';

// -> [{ hospitalId, name, location: { type: 'Point', coordinates: [lng, lat] } }]
// Only hospitals whose coordinator has been approved are returned.
export const getHospitals = async () =>
  (await api.get('/api/verification/hospitals')).data;
