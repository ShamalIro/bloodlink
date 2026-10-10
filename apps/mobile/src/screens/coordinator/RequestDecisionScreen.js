import React from 'react';
import { ResultScreen } from '../../components';
import { ROUTES } from '../../constants';

export function BroadcastSuccessScreen({ navigation, route }) {
  return (
    <ResultScreen
      variant="success"
      icon="broadcast"
      eyebrow="REQUEST APPROVED"
      title="Request broadcast"
      message="The request was approved and matching donors in range are being notified."
      primaryAction={{
        title: 'View donor responses',
        onPress: () => navigation.replace(ROUTES.DONOR_RESPONSES, route.params), // pass the request along
      }}
      secondaryAction={{
        title: 'Back to requests',
        onPress: () => navigation.navigate(ROUTES.COORDINATOR_REQUESTS_TAB),
      }}
    />
  );
}

export function RequestRejectedScreen({ navigation }) {
  return (
    <ResultScreen
      variant="error"
      icon="close-circle-outline"
      eyebrow="REQUEST REJECTED"
      title="Request not approved"
      message="This request was not approved and will not be broadcast to donors."
      primaryAction={{
        title: 'Back to request queue',
        onPress: () => navigation.navigate(ROUTES.COORDINATOR_REQUESTS_TAB),
      }}
    />
  );
}