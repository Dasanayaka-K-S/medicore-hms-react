const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Lightweight option lists used to populate <select> dropdowns on the
 * appointment / medical record / lab / billing forms.
 *
 * Why this exists: in the original PHP app, pages like
 * appointments/add.php queried the patients, doctors and departments
 * tables directly for their dropdowns, even for roles (Doctor, Nurse)
 * that are NOT granted access to the Doctors or Departments modules.
 * To preserve that exact behaviour without handing those roles the full
 * Doctors/Departments CRUD API, these endpoints expose id + name only.
 */

// GET /api/lookups/patients
const patientOptions = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, full_name FROM patients ORDER BY full_name');
  res.json({ data: rows });
});

// GET /api/lookups/doctors?activeOnly=1
const doctorOptions = asyncHandler(async (req, res) => {
  const activeOnly = req.query.activeOnly === '1';
  const sql = activeOnly
    ? "SELECT id, full_name, department_id FROM doctors WHERE status = 'Active' ORDER BY full_name"
    : 'SELECT id, full_name, department_id FROM doctors ORDER BY full_name';
  const [rows] = await pool.query(sql);
  res.json({ data: rows });
});

// GET /api/lookups/departments
const departmentOptions = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, department_name FROM departments ORDER BY department_name');
  res.json({ data: rows });
});

module.exports = { patientOptions, doctorOptions, departmentOptions };
