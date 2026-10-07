import React from 'react';
import { ROLES } from '../../constants';
import RoleRegistrationScreen from './RoleRegistrationScreen';

export default function NgoSignupScreen(props) {
  return <RoleRegistrationScreen {...props} role={ROLES.NGO} />;
}
