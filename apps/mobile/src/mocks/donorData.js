// Isolated Phase 4 fixtures. These objects deliberately do not imply an API
// contract and can be replaced by donor-service responses later.
export const mockDonorProfile = Object.freeze({
  id: 'donor-preview',
  name: 'Kasun Perera',
  bloodType: 'O+',
  nic: '199218402736',
  location: 'Nugegoda, Colombo',
  donationsMade: 7,
  patientsSupported: 21,
  available: true,
  emergencyAlerts: true,
  lastDonationDate: '2026-06-12T08:30:00.000Z',
  eligibleDate: '2026-10-10T00:00:00.000Z',
  daysUntilEligible: 24,
});

export const mockBloodAlerts = Object.freeze([
  {
    id: 'alert-7741',
    bloodType: 'O+',
    unitsRequired: 2,
    urgency: 'critical',
    createdLabel: '2 min ago',
    hospital: { name: 'National Hospital of Sri Lanka', address: 'Ward 12 — Accident Service, Colombo 10', verified: true },
    distanceKm: 3.4,
    etaMinutes: 12,
    patientReference: 'Patient #7741 · Trauma ICU',
    raisedBy: 'Dr. N. Fernando',
    notes: 'Road accident admission. Two units are needed within the hour.',
  },
  {
    id: 'alert-6612',
    bloodType: 'O+',
    unitsRequired: 1,
    urgency: 'urgent',
    createdLabel: '18 min ago',
    hospital: { name: 'Teaching Hospital Karapitiya', address: 'Emergency Unit, Galle', verified: true },
    distanceKm: 8.2,
    etaMinutes: 22,
    patientReference: 'Patient #6612 · Emergency Unit',
    raisedBy: 'Hospital coordinator',
    notes: 'Urgent transfusion requested following surgery.',
  },
  {
    id: 'alert-4410',
    bloodType: 'O+',
    unitsRequired: 1,
    urgency: 'normal',
    createdLabel: '42 min ago',
    hospital: { name: 'Sri Jayewardenepura General Hospital', address: 'Maternity Ward, Kotte', verified: true },
    distanceKm: 12.6,
    etaMinutes: 28,
    patientReference: 'Patient #4410 · Maternity',
    raisedBy: 'Blood bank team',
    notes: 'A matching unit is requested today.',
  },
]);

export const mockDonationHistory = Object.freeze([
  { id: 'donation-1', date: '2026-06-12T08:30:00.000Z', units: 1, bloodType: 'O+', hospital: 'National Hospital of Sri Lanka', location: 'Colombo 10', department: 'Trauma ICU', patientReference: '#6612' },
  { id: 'donation-2', date: '2026-02-04T09:15:00.000Z', units: 1, bloodType: 'O+', hospital: 'Lady Ridgeway Hospital', location: 'Borella', department: 'Paediatric Surgery', patientReference: '#2077' },
  { id: 'donation-3', date: '2025-09-18T10:00:00.000Z', units: 1, bloodType: 'O+', hospital: 'Sri Jayewardenepura General Hospital', location: 'Kotte', department: 'Maternity', patientReference: '#4410' },
  { id: 'donation-4', date: '2025-05-02T08:45:00.000Z', units: 1, bloodType: 'O+', hospital: 'Colombo North Teaching Hospital', location: 'Ragama', department: 'Dialysis Unit', patientReference: '#1932' },
]);

export const mockAcceptedRequest = Object.freeze({
  ...mockBloodAlerts[0],
  acceptedAt: 'Today, 10:42 AM',
  coordinator: 'Sister Nirmala',
  coordinatorUnit: 'Ward 12 Accident Service',
});

export const mockHospitalChat = Object.freeze([
  { id: 'system-1', sender: 'system', text: 'Emergency response registered. Hospital staff have been notified to prepare for your arrival.', time: '10:42 AM' },
  { id: 'hospital-1', sender: 'hospital', text: 'Ayubowan and thank you for responding. We’re preparing Ward 12 now. What is your estimated arrival time?', time: '10:43 AM' },
  { id: 'donor-1', sender: 'donor', text: 'I’m on my way. Navigation says around 12 minutes. Should I enter through the main emergency gate?', time: '10:44 AM', delivered: true },
]);
