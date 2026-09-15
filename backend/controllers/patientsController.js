const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPaginationMeta } = require('../utils/helpers');

// GET /api/patients?q=&page=
const listPatients = asyncHandler(async (req, res) => {
  const search = (req.query.q || '').trim();
  const { page, limit, offset } = getPagination(req.query, 10);

  let where = '';
  const params = [];
  if (search) {
    where = 'WHERE full_name LIKE ? OR nic LIKE ? OR phone LIKE ?';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const [[{ totalRows }]] = await pool.query(
    `SELECT COUNT(*) AS totalRows FROM patients ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT * FROM patients ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({ data: rows, pagination: buildPaginationMeta(totalRows, page, limit) });
});

// GET /api/patients/:id
const getPatient = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Patient not found.' });
  res.json({ data: rows[0] });
});

function validatePatient(body) {
  const errors = [];
  if (!body.full_name?.trim()) errors.push('Full name is required.');
  if (!body.nic?.trim()) errors.push('NIC is required.');
  if (!body.dob) errors.push('Date of birth is required.');
  if (!body.phone?.trim()) errors.push('Phone number is required.');
  return errors;
}

// POST /api/patients
const createPatient = asyncHandler(async (req, res) => {
  const errors = validatePatient(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { full_name, nic, dob, gender, phone, email, address, blood_group, emergency_contact } = req.body;

  const [dupe] = await pool.query('SELECT id FROM patients WHERE nic = ?', [nic]);
  if (dupe.length) return res.status(409).json({ message: 'A patient with this NIC already exists.' });

  const [result] = await pool.query(
    `INSERT INTO patients (full_name, nic, dob, gender, phone, email, address, blood_group, emergency_contact)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [full_name, nic, dob, gender || 'Male', phone, email || null, address || null, blood_group || null, emergency_contact || null]
  );

  res.status(201).json({ message: 'Patient added successfully.', id: result.insertId });
});

// PUT /api/patients/:id
const updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const errors = validatePatient(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { full_name, nic, dob, gender, phone, email, address, blood_group, emergency_contact } = req.body;

  const [dupe] = await pool.query('SELECT id FROM patients WHERE nic = ? AND id != ?', [nic, id]);
  if (dupe.length) return res.status(409).json({ message: 'Another patient already uses this NIC.' });

  const [result] = await pool.query(
    `UPDATE patients SET full_name=?, nic=?, dob=?, gender=?, phone=?, email=?, address=?, blood_group=?, emergency_contact=?
     WHERE id=?`,
    [full_name, nic, dob, gender, phone, email || null, address || null, blood_group || null, emergency_contact || null, id]
  );

  if (!result.affectedRows) return res.status(404).json({ message: 'Patient not found.' });
  res.json({ message: 'Patient updated successfully.' });
});

// DELETE /api/patients/:id
const deletePatient = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM patients WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Patient not found.' });
  res.json({ message: 'Patient deleted successfully.' });
});

module.exports = { listPatients, getPatient, createPatient, updatePatient, deletePatient };
