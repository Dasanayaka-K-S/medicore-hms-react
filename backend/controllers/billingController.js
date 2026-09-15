const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPaginationMeta } = require('../utils/helpers');

const PAYMENT_STATUSES = ['Paid', 'Pending'];

// GET /api/billing?q=&status=&page=
const listBills = asyncHandler(async (req, res) => {
  const search = (req.query.q || '').trim();
  const status = (req.query.status || '').trim();
  const { page, limit, offset } = getPagination(req.query, 10);

  const conditions = [];
  const params = [];
  if (search) {
    conditions.push('p.full_name LIKE ?');
    params.push(`%${search}%`);
  }
  if (status) {
    conditions.push('b.payment_status = ?');
    params.push(status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [[{ totalRows }]] = await pool.query(
    `SELECT COUNT(*) AS totalRows FROM bills b INNER JOIN patients p ON p.id = b.patient_id ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT b.*, p.full_name AS patient_name
     FROM bills b
     INNER JOIN patients p ON p.id = b.patient_id
     ${where}
     ORDER BY b.bill_date DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({ data: rows, pagination: buildPaginationMeta(totalRows, page, limit) });
});

// GET /api/billing/:id
const getBill = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.*, p.full_name AS patient_name, p.phone AS patient_phone
     FROM bills b INNER JOIN patients p ON p.id = b.patient_id
     WHERE b.id = ?`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Bill not found.' });
  res.json({ data: rows[0] });
});

function validateBill(body) {
  const errors = [];
  if (!body.patient_id) errors.push('Please select a patient.');
  if (!body.service?.trim()) errors.push('Service is required.');
  if (body.amount === '' || body.amount === undefined || isNaN(Number(body.amount))) {
    errors.push('A valid amount is required.');
  }
  if (!body.bill_date) errors.push('Bill date is required.');
  return errors;
}

// POST /api/billing
const createBill = asyncHandler(async (req, res) => {
  const errors = validateBill(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { patient_id, service, description, amount, bill_date, payment_status } = req.body;

  const [result] = await pool.query(
    `INSERT INTO bills (patient_id, service, description, amount, bill_date, payment_status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      patient_id,
      service,
      description || null,
      amount,
      bill_date,
      PAYMENT_STATUSES.includes(payment_status) ? payment_status : 'Pending',
    ]
  );

  res.status(201).json({ message: 'Bill created successfully.', id: result.insertId });
});

// PUT /api/billing/:id
const updateBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const errors = validateBill(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { patient_id, service, description, amount, bill_date, payment_status } = req.body;

  const [result] = await pool.query(
    `UPDATE bills SET patient_id=?, service=?, description=?, amount=?, bill_date=?, payment_status=?
     WHERE id=?`,
    [
      patient_id,
      service,
      description || null,
      amount,
      bill_date,
      PAYMENT_STATUSES.includes(payment_status) ? payment_status : 'Pending',
      id,
    ]
  );

  if (!result.affectedRows) return res.status(404).json({ message: 'Bill not found.' });
  res.json({ message: 'Bill updated successfully.' });
});

module.exports = { listBills, getBill, createBill, updateBill };
