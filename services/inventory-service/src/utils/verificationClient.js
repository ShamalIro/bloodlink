// Calls verification-service (internal routes).
const baseUrl = () => process.env.VERIFICATION_SERVICE_URL || 'http://localhost:4004';
const headers = () => ({ 'x-internal-key': process.env.INTERNAL_API_KEY || '' });
const upstream = (msg) => Object.assign(new Error(msg), { code: 'UPSTREAM' });

// Returns the verification record, or null if the user has never applied.
// Throws if verification-service is unreachable or rejects our internal key.
async function getVerification(userId) {
  const res = await fetch(`${baseUrl()}/internal/verification/${userId}`, {
    headers: headers(),
    signal: AbortSignal.timeout(5000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`verification-service responded ${res.status}`);
  return res.json();
}

// -> { hospitalId, name, location } or null if no approved hospital has that id.
async function getHospital(hospitalId) {
  let res;
  try {
    res = await fetch(`${baseUrl()}/internal/verification/hospitals/${encodeURIComponent(hospitalId)}`, {
      headers: headers(),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    throw upstream(`verification-service unreachable: ${err.message}`);
  }
  if (res.status === 404) return null;
  if (!res.ok) throw upstream(`verification-service responded ${res.status}`);
  return res.json();
}

module.exports = { getVerification, getHospital };