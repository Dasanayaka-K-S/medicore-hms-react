const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPaginationMeta } = require('../utils/helpers');

// GET /api/medical-records?q=&page=
const listRecords = asyncHandler(async (req, res) => {
  const search = (req.query.q || '').trim();
  const { page, limit, offset } = getPagination(req.query, 10);

  let where = '';
  const params = [];
  if (search) {
    where = 'WHERE p.full_name LIKE ? OR mr.diagnosis LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  const [[{ totalRows }]] = await pool.query(
    `SELECT COUNT(*) AS totalRows FROM medical_records mr
     INNER JOIN patients p ON p.id = mr.patient_id ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT mr.*, p.full_name AS patient_name, d.full_name AS doctor_name
     FROM medical_records mr
     INNER JOIN patients p ON p.id = mr.patient_id
     INNER JOIN doctors d ON d.id = mr.doctor_id
     ${where}
     ORDER BY mr.record_date DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({ data: rows, pagination: buildPaginationMeta(totalRows, page, limit) });
});

// GET /api/medical-records/:id
const getRecord = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT mr.*, p.full_name AS patient_name, d.full_name AS doctor_name
     FROM medical_records mr
     INNER JOIN patients p ON p.id = mr.patient_id
     INNER JOIN doctors d ON d.id = mr.doctor_id
     WHERE mr.id = ?`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Medical record not found.' });
  res.json({ data: rows[0] });
});

function validateRecord(body) {
  const errors = [];
  if (!body.patient_id) errors.push('Please select a patient.');
  if (!body.doctor_id) errors.push('Please select a doctor.');
  if (!body.record_date) errors.push('Record date is required.');
  if (!body.diagnosis?.trim()) errors.push('Diagnosis is required.');
  return errors;
}

// POST /api/medical-records
const createRecord = asyncHandler(async (req, res) => {
  const errors = validateRecord(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { patient_id, doctor_id, record_date, diagnosis, treatment, prescription, notes } = req.body;

  const [result] = await pool.query(
    `INSERT INTO medical_records (patient_id, doctor_id, record_date, diagnosis, treatment, prescription, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [patient_id, doctor_id, record_date, diagnosis, treatment || null, prescription || null, notes || null]
  );

  res.status(201).json({ message: 'Medical record added successfully.', id: result.insertId });
});

// PUT /api/medical-records/:id
const updateRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const errors = validateRecord(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { patient_id, doctor_id, record_date, diagnosis, treatment, prescription, notes } = req.body;

  const [result] = await pool.query(
    `UPDATE medical_records SET patient_id=?, doctor_id=?, record_date=?, diagnosis=?,
     treatment=?, prescription=?, notes=? WHERE id=?`,
    [patient_id, doctor_id, record_date, diagnosis, treatment || null, prescription || null, notes || null, id]
  );

  if (!result.affectedRows) return res.status(404).json({ message: 'Medical record not found.' });
  res.json({ message: 'Medical record updated successfully.' });
});

module.exports = { listRecords, getRecord, createRecord, updateRecord };
