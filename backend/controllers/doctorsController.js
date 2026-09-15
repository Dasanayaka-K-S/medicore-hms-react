const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPaginationMeta } = require('../utils/helpers');

// GET /api/doctors?q=&page=
const listDoctors = asyncHandler(async (req, res) => {
  const search = (req.query.q || '').trim();
  const { page, limit, offset } = getPagination(req.query, 10);

  let where = '';
  const params = [];
  if (search) {
    where = 'WHERE d.full_name LIKE ? OR d.specialization LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  const [[{ totalRows }]] = await pool.query(
    `SELECT COUNT(*) AS totalRows FROM doctors d ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT d.*, dept.department_name FROM doctors d
     LEFT JOIN departments dept ON dept.id = d.department_id
     ${where} ORDER BY d.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({ data: rows, pagination: buildPaginationMeta(totalRows, page, limit) });
});

// GET /api/doctors/:id
const getDoctor = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT d.*, dept.department_name FROM doctors d
     LEFT JOIN departments dept ON dept.id = d.department_id
     WHERE d.id = ?`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Doctor not found.' });
  res.json({ data: rows[0] });
});

function validateDoctor(body) {
  const errors = [];
  if (!body.full_name?.trim()) errors.push('Full name is required.');
  if (!body.specialization?.trim()) errors.push('Specialization is required.');
  if (!body.phone?.trim()) errors.push('Phone number is required.');
  return errors;
}

function daysToString(available_days) {
  if (Array.isArray(available_days)) return available_days.join(',');
  return available_days || '';
}

// POST /api/doctors
const createDoctor = asyncHandler(async (req, res) => {
  const errors = validateDoctor(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { full_name, specialization, department_id, phone, email, available_days, status } = req.body;

  const [result] = await pool.query(
    `INSERT INTO doctors (full_name, specialization, department_id, phone, email, available_days, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [full_name, specialization, department_id || null, phone, email || null, daysToString(available_days), status || 'Active']
  );

  res.status(201).json({ message: 'Doctor added successfully.', id: result.insertId });
});

// PUT /api/doctors/:id
const updateDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const errors = validateDoctor(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { full_name, specialization, department_id, phone, email, available_days, status } = req.body;

  const [result] = await pool.query(
    `UPDATE doctors SET full_name=?, specialization=?, department_id=?, phone=?, email=?, available_days=?, status=?
     WHERE id=?`,
    [full_name, specialization, department_id || null, phone, email || null, daysToString(available_days), status || 'Active', id]
  );

  if (!result.affectedRows) return res.status(404).json({ message: 'Doctor not found.' });
  res.json({ message: 'Doctor updated successfully.' });
});

// DELETE /api/doctors/:id
const deleteDoctor = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM doctors WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Doctor not found.' });
  res.json({ message: 'Doctor deleted successfully.' });
});

module.exports = { listDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor };
