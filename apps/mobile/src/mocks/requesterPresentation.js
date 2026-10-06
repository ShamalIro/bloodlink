// Presentation-only defaults for Figma fields not backed by a current API.
// Keep these isolated so profile/hospital services can replace them later.
export const requesterPresentation = Object.freeze({
  savedHospital: {
    name: 'National Hospital of Sri Lanka',
    address: 'Regent Street, Colombo 10',
  },
  matchingRadiusKm: 15,
  profilePhone: 'Not available from the current account API',
});
