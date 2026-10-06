import React from 'react';
import { ROLES } from '../../constants';
import RoleRegistrationScreen from './RoleRegistrationScreen';

export default function RequesterSignupScreen(props) {
  return <RoleRegistrationScreen {...props} role={ROLES.REQUESTER} />;
}
