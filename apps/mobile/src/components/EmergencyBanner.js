import React from 'react';
import Banner from './Banner';

export default function EmergencyBanner(props) {
  return <Banner variant="emergency" icon="alert-circle-outline" {...props} />;
}
