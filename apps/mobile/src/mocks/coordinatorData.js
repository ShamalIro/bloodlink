export const coordinatorProfile = { name: 'Nurse M. Wickramasinghe', hospital: 'National Hospital of Sri Lanka', department: 'Blood Bank · Ward 12', employeeId: 'HSP00123', phone: '+94 77 412 8890' };
export const coordinatorStats = { pending: 3, broadcasting: 5, fulfilledToday: 2, critical: 1 };
export const coordinatorRequests = [
  { id: 'REQ-4822', bloodType: 'B-', units: 3, urgency: 'critical', hospital: 'Lady Ridgeway Hospital', location: 'Borella, Colombo 08', distance: '1.8 km', age: '4 min ago', patient: 'Patient #2290 · Paediatric Surgery', raisedBy: 'Nurse M. Wickramasinghe', notes: 'Post-op haemorrhage. Blood is required urgently.', donorsInRange: 38, status: 'pending' },
  { id: 'REQ-4823', bloodType: 'AB+', units: 1, urgency: 'urgent', hospital: 'Teaching Hospital Karapitiya', location: 'Galle', distance: '112 km', age: '18 min ago', patient: 'Patient #3158 · Surgical Unit', raisedBy: 'Hospital coordinator', notes: 'Urgent transfusion after surgery.', donorsInRange: 14, status: 'pending' },
  { id: 'REQ-4824', bloodType: 'O-', units: 2, urgency: 'urgent', hospital: 'Colombo North Teaching Hospital', location: 'Ragama', distance: '14.2 km', age: '26 min ago', patient: 'Patient #5501 · ICU', raisedBy: 'Dr. Fernando', notes: 'Two compatible units requested.', donorsInRange: 24, status: 'pending' },
];
export const coordinatorDonors = [
  { id: 'D-1042', name: 'L. Melani', bloodType: 'O+', status: 'Available today', time: '10:30 AM' },
  { id: 'D-2081', name: 'Kasun Perera', bloodType: 'O+', status: 'Responded 2 min ago', time: '10:42 AM' },
];
export const bloodStock = [
  { type: 'O+', units: 42, target: 60, state: 'Healthy' }, { type: 'A+', units: 31, target: 50, state: 'Healthy' },
  { type: 'O-', units: 6, target: 40, state: 'Critical' }, { type: 'A-', units: 14, target: 40, state: 'Low' },
  { type: 'B+', units: 25, target: 40, state: 'Healthy' }, { type: 'B-', units: 8, target: 35, state: 'Low' },
];
export const coordinatorActivity = ['Donor checked in for REQ-4820 · 9:42 AM', 'REQ-4819 marked fulfilled · 9:15 AM', 'REQ-4818 broadcast to 42 donors · 8:50 AM'];
export const coordinatorMessages = [{ id: 'm1', sender: 'donor', text: 'I have arrived at the Regent Street emergency entrance.', time: '10:55 AM' }, { id: 'm2', sender: 'coordinator', text: 'Thank you. Please proceed to Ward 12 reception with your photo ID.', time: '10:56 AM' }];
