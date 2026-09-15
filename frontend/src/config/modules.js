/**
 * Module definitions for the sidebar + route guards.
 *
 * `roles` mirrors PAGE_ACCESS from the PHP app (and backend/config/roles.js)
 * so the sidebar only renders links the logged-in role may actually use.
 * The backend enforces the same rules independently - this copy is purely
 * for navigation and must never be the only check.
 */
export const MODULES = [
  { key: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2', path: '/dashboard',
    roles: ['Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Laboratory Staff', 'Pharmacist', 'Accountant'] },
  { key: 'patients', label: 'Patients', icon: 'bi-people', path: '/patients',
    roles: ['Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Laboratory Staff', 'Pharmacist'] },
  { key: 'doctors', label: 'Doctors', icon: 'bi-person-badge', path: '/doctors',
    roles: ['Administrator', 'Receptionist'] },
  { key: 'departments', label: 'Departments', icon: 'bi-diagram-3', path: '/departments',
    roles: ['Administrator', 'Receptionist'] },
  { key: 'appointments', label: 'Appointments', icon: 'bi-calendar-check', path: '/appointments',
    roles: ['Administrator', 'Doctor', 'Nurse', 'Receptionist'] },
  { key: 'medical-records', label: 'Medical Records', icon: 'bi-file-earmark-medical', path: '/medical-records',
    roles: ['Administrator', 'Doctor', 'Nurse'] },
  { key: 'laboratory', label: 'Laboratory', icon: 'bi-clipboard2-pulse', path: '/laboratory',
    roles: ['Administrator', 'Doctor', 'Laboratory Staff'] },
  { key: 'pharmacy', label: 'Pharmacy', icon: 'bi-capsule', path: '/pharmacy',
    roles: ['Administrator', 'Pharmacist'] },
  { key: 'billing', label: 'Billing', icon: 'bi-receipt', path: '/billing',
    roles: ['Administrator', 'Receptionist', 'Accountant'] },
];

export function canAccess(roleName, moduleKey) {
  const mod = MODULES.find((m) => m.key === moduleKey);
  return !!mod && mod.roles.includes(roleName);
}
