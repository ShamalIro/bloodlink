export const ROLES = Object.freeze({
  DONOR: 'donor',
  REQUESTER: 'requester',
  COORDINATOR: 'coordinator',
  NGO: 'ngo',
});

const ROLE_ALIASES = Object.freeze({
  donor: ROLES.DONOR,
  blood_donor: ROLES.DONOR,
  requester: ROLES.REQUESTER,
  patient: ROLES.REQUESTER,
  coordinator: ROLES.COORDINATOR,
  hospital_coordinator: ROLES.COORDINATOR,
  hospital_staff: ROLES.COORDINATOR,
  ngo: ROLES.NGO,
  ngo_staff: ROLES.NGO,
});

export function normalizeRole(role) {
  if (typeof role !== 'string') return null;
  const key = role.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return ROLE_ALIASES[key] ?? null;
}

export function isKnownRole(role) {
  return normalizeRole(role) !== null;
}
