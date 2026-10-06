const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Red-cell compatibility: for each blood type a patient NEEDS, which donor types can give.
const DONORS_FOR = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': BLOOD_TYPES,
};

const compatibleDonorTypes = (needed) => DONORS_FOR[needed] || [];

module.exports = { BLOOD_TYPES, compatibleDonorTypes };