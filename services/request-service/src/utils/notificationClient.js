// Calls notification-service (internal routes) about a blood request.
// Fire-and-forget: errors are logged, never thrown, so a failed
// notification can never break the request flow.
const baseUrl = () => process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005';

async function post(path, body) {
  try {
    const res = await fetch(`${baseUrl()}/internal/notifications/${path}`, {
      method: 'POST',
      headers: {
        'x-internal-key': process.env.INTERNAL_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      console.error(`notification-service ${path} responded ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`notification-service ${path} failed: ${err.message}`);
    return null;
  }
}

// Request just became `broadcasting`: alert matching donors nearby.
function notifyBroadcast(doc) {
  return post('request-broadcast', {
    requestId: String(doc._id),
    requesterId: String(doc.requesterId),
    bloodType: doc.bloodType,
    unitsRequired: doc.unitsRequired,
    hospitalName: doc.hospital?.name,
    location: { coordinates: doc.hospital?.location?.coordinates },
  });
}

// Request was fulfilled or closed: tell donors still on their way to stop.
function notifyClosed(doc) {
  const donorIds = (doc.donorResponses || [])
    .filter((r) => r.status === 'responding')
    .map((r) => String(r.donorId));
  if (donorIds.length === 0) return Promise.resolve(null);

  return post('request-closed', {
    requestId: String(doc._id),
    status: doc.status,
    hospitalName: doc.hospital?.name,
    donorIds,
  });
}

module.exports = { notifyBroadcast, notifyClosed };