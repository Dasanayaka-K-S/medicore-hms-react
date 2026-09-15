const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { requireAuth, requireModuleAccess } = require('../middleware/auth');

router.get('/', requireAuth, requireModuleAccess('dashboard'), getDashboard);

module.exports = router;
