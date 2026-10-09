// Calls verification-service (internal route) to check whether an account is approved.
const baseUrl = () => process.env.VERIFICATION_SERVICE_URL || 'http://localhost:4004';

// Returns the verification record, or null if the user has never applied.
// Throws if verification-service is unreachable or rejects our internal key.
async function getVerification(userId) {
  const res = await fetch(`${baseUrl()}/internal/verification/${userId}`, {
    headers: { 'x-internal-key': process.env.INTERNAL_API_KEY || '' },
    signal: AbortSignal.timeout(5000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`verification-service responded ${res.status}`);
  return res.json();
}

module.exports = { getVerification };