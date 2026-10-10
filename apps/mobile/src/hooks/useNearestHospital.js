import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import { getHospitals } from '../services/hospitalApi';

const toRad = (deg) => (deg * Math.PI) / 180;

// Haversine distance in km
const distanceKm = (lat1, lng1, lat2, lng2) => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// reason: '' | 'no-hospitals' | 'permission' | 'error'
const INITIAL = { loading: true, hospital: null, distanceKm: null, reason: '' };

export default function useNearestHospital() {
  const [state, setState] = useState(INITIAL);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, reason: '' }));
    try {
      const hospitals = await getHospitals();
      if (!Array.isArray(hospitals) || hospitals.length === 0) {
        setState({ loading: false, hospital: null, distanceKm: null, reason: 'no-hospitals' });
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setState({ loading: false, hospital: null, distanceKm: null, reason: 'permission' });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = position.coords;

      let best = null;
      let bestDistance = Infinity;
      hospitals.forEach((hospital) => {
        const coords = hospital?.location?.coordinates;
        if (!Array.isArray(coords) || coords.length < 2) return;
        const [lng, lat] = coords;
        const d = distanceKm(latitude, longitude, lat, lng);
        if (d < bestDistance) {
          best = hospital;
          bestDistance = d;
        }
      });

      setState({
        loading: false,
        hospital: best,
        distanceKm: best ? bestDistance : null,
        reason: best ? '' : 'no-hospitals',
      });
    } catch (error) {
      setState({ loading: false, hospital: null, distanceKm: null, reason: 'error' });
    }
  }, []);

  return { ...state, reload: load };
}