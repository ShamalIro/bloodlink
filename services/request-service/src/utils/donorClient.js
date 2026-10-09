// Calls donor-service's internal routes (QR validation, donation recording).
const baseUrl = () => process.env.DONOR_SERVICE_URL || 'http://localhost:4002';

const upstream = (msg) => Object.assign(new Error(msg), { code: 'UPSTREAM' });

async function call(path, body) {
  try {
    return await fetch(`${baseUrl()}${path}`, {
      method: 'POST',
      headers: { 'x-internal-key': process.env.INTERNAL_API_KEY || '', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    throw upstream(`donor-service unreachable: ${err.message}`);
  }
}

// -> { valid: false } or { valid: true, donorId, bloodType, district, isEligible }
async function validateQr(token) {
  const res = await call('/internal/donors/validate-qr', { token });
  if ([400, 401, 404].includes(res.status)) return { valid: false };
  if (!res.ok) throw upstream(`donor-service validate-qr responded ${res.status}`);
  return res.json();
}

// Records the donation and starts the donor's 120-day cooldown.
// 409 means it was already recorded, so retrying is safe.
async function recordDonation(donorId, payload) {
  const res = await call(`/internal/donors/${donorId}/donations`, payload);
  if (res.status === 201 || res.status === 409) return;
  throw upstream(`donor-service record donation responded ${res.status}`);
}

module.exports = { validateQr, recordDonation };