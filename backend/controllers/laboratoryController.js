const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPaginationMeta } = require('../utils/helpers');

const STATUSES = ['Requested', 'Sample Collected', 'Processing', 'Completed'];

// GET /api/laboratory?status=&page=
const listTests = asyncHandler(async (req, res) => {
  const status = (req.query.status || '').trim();
  const { page, limit, offset } = getPagination(req.query, 10);

  let where = '';
  const params = [];
  if (status) {
    where = 'WHERE lt.status = ?';
    params.push(status);
  }

  const [[{ totalRows }]] = await pool.query(
    `SELECT COUNT(*) AS totalRows FROM laboratory_tests lt ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT lt.*, p.full_name AS patient_name, d.full_name AS doctor_name
     FROM laboratory_tests lt
     INNER JOIN patients p ON p.id = lt.patient_id
     LEFT JOIN doctors d ON d.id = lt.doctor_id
     ${where}
     ORDER BY lt.test_date DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({ data: rows, pagination: buildPaginationMeta(totalRows, page, limit), statuses: STATUSES });
});

// GET /api/laboratory/:id
const getTest = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT lt.*, p.full_name AS patient_name, d.full_name AS doctor_name
     FROM laboratory_tests lt
     INNER JOIN patients p ON p.id = lt.patient_id
     LEFT JOIN doctors d ON d.id = lt.doctor_id
     WHERE lt.id = ?`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Test request not found.' });
  res.json({ data: rows[0] });
});

/**
 * POST /api/laboratory
 * New test requests always start at status 'Requested', exactly as in
 * laboratory/add.php (the status was hard-coded in the INSERT).
 */
const createTest = asyncHandler(async (req, res) => {
  const errors = [];
  if (!req.body.patient_id) errors.push('Please select a patient.');
  if (!req.body.test_name?.trim()) errors.push('Test name is required.');
  if (!req.body.test_date) errors.push('Test date is required.');
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { patient_id, doctor_id, test_name, test_date, notes } = req.body;

  const [result] = await pool.query(
    `INSERT INTO laboratory_tests (patient_id, doctor_id, test_name, test_date, status, notes)
     VALUES (?, ?, ?, ?, 'Requested', ?)`,
    [patient_id, doctor_id || null, test_name, test_date, notes || null]
  );

  res.status(201).json({ message: 'Laboratory test request created.', id: result.insertId });
});

/**
 * PUT /api/laboratory/:id
 * Mirrors laboratory/edit.php: only the test details, result, status and
 * notes are editable. The patient and requesting doctor are fixed once
 * the request has been raised.
 */
const updateTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const errors = [];
  if (!req.body.test_name?.trim()) errors.push('Test name is required.');
  if (!req.body.test_date) errors.push('Test date is required.');
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { test_name, test_date, result: testResult, status, notes } = req.body;

  const [result] = await pool.query(
    `UPDATE laboratory_tests SET test_name=?, test_date=?, result=?, status=?, notes=? WHERE id=?`,
    [
      test_name,
      test_date,
      testResult || null,
      STATUSES.includes(status) ? status : 'Requested',
      notes || null,
      id,
    ]
  );

  if (!result.affectedRows) return res.status(404).json({ message: 'Test request not found.' });
  res.json({ message: 'Test request updated successfully.' });
});

module.exports = { listTests, getTest, createTest, updateTest };
