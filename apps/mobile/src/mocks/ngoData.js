export const ngoProfile = { name: 'Pathum Sathsara', organization: 'Sri Lanka Red Cross', branch: 'Colombo branch', phone: '+94 77 412 8890', staffId: 'NGO1234' };
export const ngoCamps = [
  { id: 'camp-1', name: 'Negombo Community Drive', status: 'active', date: 'Sat, 19 Sep 2026', time: '9:00 AM - 4:00 PM', location: 'Negombo Town Hall, Colombo Road', registered: 68, target: 80, units: 46, bloodTypes: ['O-', 'B-', 'AB-'] },
  { id: 'camp-2', name: 'University of Peradeniya Camp', status: 'upcoming', date: 'Tue, 22 Sep 2026', time: '9:30 AM - 3:00 PM', location: 'Sarachchandra Hall, Peradeniya', registered: 41, target: 100, units: 0, bloodTypes: ['O+', 'A+', 'B+'] },
  { id: 'camp-3', name: 'Galle Fort Awareness Drive', status: 'upcoming', date: 'Sun, 27 Sep 2026', time: '8:00 AM - 2:00 PM', location: 'Galle Fort Esplanade, Galle', registered: 23, target: 80, units: 0, bloodTypes: ['O-', 'A-', 'AB-'] },
  { id: 'camp-4', name: 'Colombo Community Drive', status: 'completed', date: 'Sat, 12 Jul 2026', time: '9:00 AM - 4:00 PM', location: 'Viharamahadevi Park, Colombo', registered: 82, checkedIn: 67, successful: 54, target: 80, units: 54, bloodTypes: ['O-', 'B-', 'AB-'] },
];
export const volunteerResponses = [
  { id: 'v1', name: 'Kasun Perera', bloodType: 'O+', status: 'confirmed' }, { id: 'v2', name: 'Nimali Silva', bloodType: 'B-', status: 'confirmed' },
  { id: 'v3', name: 'Amal Fernando', bloodType: 'AB-', status: 'maybe' }, { id: 'v4', name: 'Chamudi Soysa', bloodType: 'B-', status: 'confirmed' },
  { id: 'v5', name: 'Ravi Kumar', bloodType: 'O-', status: 'declined' },
];
export const emptyCampDraft = { name: '', date: '', time: '', location: '', target: '80', bloodTypes: [] };
