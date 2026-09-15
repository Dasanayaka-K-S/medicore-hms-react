const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/departments
// The original departments/index.php listed every department with no
// search or pagination, so this returns the full list.
const listDepartments = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM departments ORDER BY department_name');
  res.json({ data: rows });
});

// GET /api/departments/:id
const getDepartment = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM departments WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Department not found.' });
  res.json({ data: rows[0] });
});

// POST /api/departments
const createDepartment = asyncHandler(async (req, res) => {
  const department_name = (req.body.department_name || '').trim();
  const description = (req.body.description || '').trim();

  if (!department_name) return res.status(400).json({ message: 'Department name is required.' });

  const [dupe] = await pool.query('SELECT id FROM departments WHERE department_name = ?', [department_name]);
  if (dupe.length) return res.status(409).json({ message: 'This department already exists.' });

  const [result] = await pool.query(
    'INSERT INTO departments (department_name, description) VALUES (?, ?)',
    [department_name, description || null]
  );

  res.status(201).json({ message: 'Department added successfully.', id: result.insertId });
});

// PUT /api/departments/:id
const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const department_name = (req.body.department_name || '').trim();
  const description = (req.body.description || '').trim();

  if (!department_name) return res.status(400).json({ message: 'Department name is required.' });

  const [dupe] = await pool.query(
    'SELECT id FROM departments WHERE department_name = ? AND id != ?',
    [department_name, id]
  );
  if (dupe.length) return res.status(409).json({ message: 'Another department already uses this name.' });

  const [result] = await pool.query(
    'UPDATE departments SET department_name=?, description=? WHERE id=?',
    [department_name, description || null, id]
  );

  if (!result.affectedRows) return res.status(404).json({ message: 'Department not found.' });
  res.json({ message: 'Department updated successfully.' });
});

// DELETE /api/departments/:id
const deleteDepartment = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Department not found.' });
  res.json({ message: 'Department deleted successfully.' });
});

module.exports = { listDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };
