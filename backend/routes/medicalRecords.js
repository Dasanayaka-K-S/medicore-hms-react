const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/medicalRecordsController');
const { requireAuth, requireModuleAccess } = require('../middleware/auth');

router.use(requireAuth, requireModuleAccess('medical-records'));

// Note: no DELETE route - the original PHP module had no delete.php,
// medical records were intentionally append/edit only.
router.get('/', ctrl.listRecords);
router.get('/:id', ctrl.getRecord);
router.post('/', ctrl.createRecord);
router.put('/:id', ctrl.updateRecord);

module.exports = router;
