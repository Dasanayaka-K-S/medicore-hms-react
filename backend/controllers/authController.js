const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/auth/login
 * Mirrors login.php: look up the user by username, join their role,
 * verify status + bcrypt password, then issue a JWT (replaces the
 * PHP session that used to be stored in $_SESSION['user']).
 */
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter both username and password.' });
  }

  const [rows] = await pool.query(
    `SELECT u.*, r.role_name
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     WHERE u.username = ?
     LIMIT 1`,
    [username]
  );

  const user = rows[0];

  if (!user || user.status !== 'Active') {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const payload = {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    email: user.email,
    role_id: user.role_id,
    role_name: user.role_name,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

  res.json({ token, user: payload });
});

/** GET /api/auth/me - returns the currently authenticated user (from the JWT). */
const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { login, me };
