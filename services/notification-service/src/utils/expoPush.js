
const EXPO_PUSH_URL =
  'https://exp.host/--/api/v2/push/send';

function isExpoToken(token) {
  return (
    typeof token === 'string' &&
    /^(ExpoPushToken|ExponentPushToken)\[[^\]]+\]$/.test(token)
  );
}

async function sendPush(messages = []) {
  if (!messages.length) {
    return [];
  }

  const results = [];

  // Expo accepts batches of up to 100 messages.
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(batch),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(
        `Expo push service returned ${response.status}`
      );
    }

    const payload = await response.json();

    if (!Array.isArray(payload.data)) {
      throw new Error('Invalid Expo push response');
    }

    results.push(...payload.data);
  }

  return results;
}

module.exports = {
  sendPush,
  isExpoToken,
};
