// Calls notification-service (internal route) to send a stock appeal to nearby donors.
const baseUrl = () => process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005';
const upstream = (msg) => Object.assign(new Error(msg), { code: 'UPSTREAM' });

// -> { matched, total, sent, failed, noToken }
async function sendStockAppeal(body) {
  let res;
  try {
    res = await fetch(`${baseUrl()}/internal/notifications/stock-appeal`, {
      method: 'POST',
      headers: { 'x-internal-key': process.env.INTERNAL_API_KEY || '', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
  } catch (err) {
    throw upstream(`notification-service unreachable: ${err.message}`);
  }
  if (!res.ok) throw upstream(`notification-service responded ${res.status}`);
  return res.json();
}

module.exports = { sendStockAppeal };