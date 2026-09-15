const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPaginationMeta, computeMedicineStatus } = require('../utils/helpers');

// GET /api/pharmacy?q=&page=
const listMedicines = asyncHandler(async (req, res) => {
  const search = (req.query.q || '').trim();
  const { page, limit, offset } = getPagination(req.query, 10);

  let where = '';
  const params = [];
  if (search) {
    where = 'WHERE medicine_name LIKE ? OR category LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  const [[{ totalRows }]] = await pool.query(
    `SELECT COUNT(*) AS totalRows FROM medicines ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT * FROM medicines ${where} ORDER BY medicine_name ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  // Same banner count the PHP index page showed above the table.
  const [[{ alertCount }]] = await pool.query(
    "SELECT COUNT(*) AS alertCount FROM medicines WHERE status IN ('Low Stock','Out of Stock','Expired')"
  );

  res.json({ data: rows, pagination: buildPaginationMeta(totalRows, page, limit), alertCount });
});

// GET /api/pharmacy/:id
const getMedicine = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM medicines WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Medicine not found.' });
  res.json({ data: rows[0] });
});

function validateMedicine(body) {
  const errors = [];
  if (!body.medicine_name?.trim()) errors.push('Medicine name is required.');
  if (body.quantity === '' || body.quantity === undefined || isNaN(Number(body.quantity))) {
    errors.push('A valid quantity is required.');
  }
  if (body.unit_price === '' || body.unit_price === undefined || isNaN(Number(body.unit_price))) {
    errors.push('A valid unit price is required.');
  }
  return errors;
}

// POST /api/pharmacy
const createMedicine = asyncHandler(async (req, res) => {
  const errors = validateMedicine(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { medicine_name, category, quantity, unit_price, expiry_date, supplier } = req.body;
  // Status is always derived server-side, never taken from the client.
  const status = computeMedicineStatus(quantity, expiry_date);

  const [result] = await pool.query(
    `INSERT INTO medicines (medicine_name, category, quantity, unit_price, expiry_date, supplier, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [medicine_name, category || null, quantity, unit_price, expiry_date || null, supplier || null, status]
  );

  res.status(201).json({ message: 'Medicine added successfully.', id: result.insertId, status });
});

// PUT /api/pharmacy/:id
const updateMedicine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const errors = validateMedicine(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { medicine_name, category, quantity, unit_price, expiry_date, supplier } = req.body;
  const status = computeMedicineStatus(quantity, expiry_date);

  const [result] = await pool.query(
    `UPDATE medicines SET medicine_name=?, category=?, quantity=?, unit_price=?,
     expiry_date=?, supplier=?, status=? WHERE id=?`,
    [medicine_name, category || null, quantity, unit_price, expiry_date || null, supplier || null, status, id]
  );

  if (!result.affectedRows) return res.status(404).json({ message: 'Medicine not found.' });
  res.json({ message: 'Medicine updated successfully.', status });
});

// DELETE /api/pharmacy/:id
const deleteMedicine = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM medicines WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Medicine not found.' });
  res.json({ message: 'Medicine deleted successfully.' });
});

module.exports = { listMedicines, getMedicine, createMedicine, updateMedicine, deleteMedicine };
