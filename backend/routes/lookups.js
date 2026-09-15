const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/lookupsController');
const { requireAuth } = require('../middleware/auth');

// Any authenticated user may read these id/name option lists so that the
// module forms they DO have access to can render their dropdowns.
router.use(requireAuth);

router.get('/patients', ctrl.patientOptions);
router.get('/doctors', ctrl.doctorOptions);
router.get('/departments', ctrl.departmentOptions);

module.exports = router;
