const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPaginationMeta } = require('../utils/helpers');

const STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'Pending'];

// GET /api/appointments?q=&status=&page=
const listAppointments = asyncHandler(async (req, res) => {
  const search = (req.query.q || '').trim();
  const status = (req.query.status || '').trim();
  const { page, limit, offset } = getPagination(req.query, 10);

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(p.full_name LIKE ? OR d.full_name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    conditions.push('a.status = ?');
    params.push(status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [[{ totalRows }]] = await pool.query(
    `SELECT COUNT(*) AS totalRows FROM appointments a
     INNER JOIN patients p ON p.id = a.patient_id
     INNER JOIN doctors d ON d.id = a.doctor_id ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT a.*, p.full_name AS patient_name, d.full_name AS doctor_name, dept.department_name
     FROM appointments a
     INNER JOIN patients p ON p.id = a.patient_id
     INNER JOIN doctors d ON d.id = a.doctor_id
     LEFT JOIN departments dept ON dept.id = a.department_id
     ${where}
     ORDER BY a.appointment_date DESC, a.appointment_time DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({ data: rows, pagination: buildPaginationMeta(totalRows, page, limit), statuses: STATUSES });
});

// GET /api/appointments/:id
const getAppointment = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Appointment not found.' });
  res.json({ data: rows[0] });
});

function validateAppointment(body) {
  const errors = [];
  if (!body.patient_id) errors.push('Please select a patient.');
  if (!body.doctor_id) errors.push('Please select a doctor.');
  if (!body.appointment_date) errors.push('Appointment date is required.');
  if (!body.appointment_time) errors.push('Appointment time is required.');
  return errors;
}

// POST /api/appointments
const createAppointment = asyncHandler(async (req, res) => {
  const errors = validateAppointment(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { patient_id, doctor_id, department_id, appointment_date, appointment_time, reason, status } = req.body;

  const [result] = await pool.query(
    `INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, appointment_time, reason, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      patient_id,
      doctor_id,
      department_id || null,
      appointment_date,
      appointment_time,
      reason || null,
      STATUSES.includes(status) ? status : 'Scheduled',
    ]
  );

  res.status(201).json({ message: 'Appointment created successfully.', id: result.insertId });
});

// PUT /api/appointments/:id
const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const errors = validateAppointment(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { patient_id, doctor_id, department_id, appointment_date, appointment_time, reason, status } = req.body;

  const [result] = await pool.query(
    `UPDATE appointments SET patient_id=?, doctor_id=?, department_id=?, appointment_date=?,
     appointment_time=?, reason=?, status=? WHERE id=?`,
    [
      patient_id,
      doctor_id,
      department_id || null,
      appointment_date,
      appointment_time,
      reason || null,
      STATUSES.includes(status) ? status : 'Scheduled',
      id,
    ]
  );

  if (!result.affectedRows) return res.status(404).json({ message: 'Appointment not found.' });
  res.json({ message: 'Appointment updated successfully.' });
});

/**
 * PATCH /api/appointments/:id/cancel
 * Ports appointments/cancel.php - a soft cancel (status change),
 * NOT a row delete. The original app never deleted appointments.
 */
const cancelAppointment = asyncHandler(async (req, res) => {
  const [result] = await pool.query(
    "UPDATE appointments SET status = 'Cancelled' WHERE id = ?",
    [req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Appointment not found.' });
  res.json({ message: 'Appointment cancelled.' });
});

module.exports = {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
};
