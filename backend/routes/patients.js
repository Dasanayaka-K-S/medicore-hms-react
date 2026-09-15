const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/patientsController');
const { requireAuth, requireModuleAccess } = require('../middleware/auth');

router.use(requireAuth, requireModuleAccess('patients'));

router.get('/', ctrl.listPatients);
router.get('/:id', ctrl.getPatient);
router.post('/', ctrl.createPatient);
router.put('/:id', ctrl.updatePatient);
router.delete('/:id', ctrl.deletePatient);

module.exports = router;
