/**
 * MediCore HMS - Role / module access map.
 * This is a direct port of PAGE_ACCESS from includes/auth.php in the
 * original PHP app. Do not add a role to a module here unless the
 * original system granted it access.
 */
const PAGE_ACCESS = {
  dashboard: ['Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Laboratory Staff', 'Pharmacist', 'Accountant'],
  patients: ['Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Laboratory Staff', 'Pharmacist'],
  doctors: ['Administrator', 'Receptionist'],
  departments: ['Administrator', 'Receptionist'],
  appointments: ['Administrator', 'Doctor', 'Nurse', 'Receptionist'],
  'medical-records': ['Administrator', 'Doctor', 'Nurse'],
  laboratory: ['Administrator', 'Doctor', 'Laboratory Staff'],
  pharmacy: ['Administrator', 'Pharmacist'],
  billing: ['Administrator', 'Receptionist', 'Accountant'],
};

function canAccess(roleName, moduleKey) {
  const allowed = PAGE_ACCESS[moduleKey] || [];
  return allowed.includes(roleName);
}

module.exports = { PAGE_ACCESS, canAccess };
