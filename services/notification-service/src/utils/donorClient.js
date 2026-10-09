// Calls donor-service's internal routes. We never read its database directly.
const baseUrl = () => process.env.DONOR_SERVICE_URL || 'http://localhost:4002';
const headers = () => ({
  'x-internal-key': process.env.INTERNAL_API_KEY || '',
  'Content-Type': 'application/json',
});

// -> [{ userId, bloodType, pushToken, distanceKm }]
async function matchDonors({ bloodType, lat, lng, radiusKm, exact }) {
  const qs = new URLSearchParams({ bloodType, lat, lng, radiusKm });
  if (exact) qs.set('exact', 'true');
  const res = await fetch(`${baseUrl()}/internal/donors/match?${qs}`, {
    headers: headers(),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`donor-service match responded ${res.status}`);
  return res.json();
}

// -> [{ userId, pushToken }]
async function getPushTokens(userIds) {
  const res = await fetch(`${baseUrl()}/internal/donors/push-tokens`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ userIds }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`donor-service push-tokens responded ${res.status}`);
  return res.json();
}

module.exports = { matchDonors, getPushTokens };