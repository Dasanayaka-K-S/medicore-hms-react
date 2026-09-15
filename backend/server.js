require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const lookupsRoutes = require('./routes/lookups');
const dashboardRoutes = require('./routes/dashboard');
const patientsRoutes = require('./routes/patients');
const doctorsRoutes = require('./routes/doctors');
const departmentsRoutes = require('./routes/departments');
const appointmentsRoutes = require('./routes/appointments');
const medicalRecordsRoutes = require('./routes/medicalRecords');
const laboratoryRoutes = require('./routes/laboratory');
const pharmacyRoutes = require('./routes/pharmacy');
const billingRoutes = require('./routes/billing');

const app = express();

// ---- CORS -----------------------------------------------------------
// Allow only the configured frontend origin(s) to call this API.
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

// ---- Routes -----------------------------------------------------------
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/lookups', lookupsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/billing', billingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MediCore HMS API listening on port ${PORT}`);
});

module.exports = app;
