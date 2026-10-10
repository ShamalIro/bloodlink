import React from 'react';
import { ResultScreen } from '../../components';
import { ROUTES } from '../../constants';

export function CampPublishedScreen({ navigation, route }) {
  const campId = route.params?.camp?._id;
  return (
    <ResultScreen
      variant="success"
      icon="calendar-check-outline"
      eyebrow="CAMPAIGN IS LIVE"
      title="Donation camp published"
      message="Your camp is now visible to donors nearby. Open it to invite eligible donors."
      primaryAction={{
        title: 'View campaign',
        onPress: () => navigation.replace(ROUTES.CAMP_DETAILS, { campId }),
      }}
      secondaryAction={{
        title: 'Back to camps',
        onPress: () => navigation.navigate(ROUTES.NGO_CAMPS_TAB),
      }}
    />
  );
}

export function CampCancelledScreen({ navigation }) {
  return (
    <ResultScreen
      variant="error"
      icon="calendar-remove-outline"
      eyebrow="CAMP CANCELLED"
      title="Donation camp cancelled"
      message="The camp has been cancelled and is no longer visible to donors."
      primaryAction={{
        title: 'Back to camps',
        onPress: () => navigation.navigate(ROUTES.NGO_CAMPS_TAB),
      }}
    />
  );
}