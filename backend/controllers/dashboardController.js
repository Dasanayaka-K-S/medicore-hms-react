const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/dashboard
 * Ports every query from dashboard.php into one response payload:
 * the 6 stat cards, today's appointments list, and recent patients list.
 */
const getDashboard = asyncHandler(async (req, res) => {
  const [[{ totalPatients }]] = await pool.query(
    'SELECT COUNT(*) AS totalPatients FROM patients'
  );
  const [[{ totalDoctors }]] = await pool.query(
    "SELECT COUNT(*) AS totalDoctors FROM doctors WHERE status = 'Active'"
  );
  const [[{ todaysAppts }]] = await pool.query(
    'SELECT COUNT(*) AS todaysAppts FROM appointments WHERE appointment_date = CURDATE()'
  );
  const [[{ pendingLabTests }]] = await pool.query(
    "SELECT COUNT(*) AS pendingLabTests FROM laboratory_tests WHERE status != 'Completed'"
  );
  const [[{ stockAlerts }]] = await pool.query(
    "SELECT COUNT(*) AS stockAlerts FROM medicines WHERE status IN ('Low Stock','Out of Stock','Expired')"
  );
  const [[{ totalRevenue }]] = await pool.query(
    "SELECT COALESCE(SUM(amount),0) AS totalRevenue FROM bills WHERE payment_status = 'Paid'"
  );

  const [todaysApptList] = await pool.query(
    `SELECT a.*, p.full_name AS patient_name, d.full_name AS doctor_name
     FROM appointments a
     INNER JOIN patients p ON p.id = a.patient_id
     INNER JOIN doctors d ON d.id = a.doctor_id
     WHERE a.appointment_date = CURDATE()
     ORDER BY a.appointment_time ASC
     LIMIT 8`
  );

  const [recentPatients] = await pool.query(
    'SELECT * FROM patients ORDER BY created_at DESC LIMIT 5'
  );

  res.json({
    stats: {
      totalPatients,
      totalDoctors,
      todaysAppts,
      pendingLabTests,
      stockAlerts,
      totalRevenue: Number(totalRevenue),
    },
    todaysAppointments: todaysApptList,
    recentPatients,
  });
});

module.exports = { getDashboard };
