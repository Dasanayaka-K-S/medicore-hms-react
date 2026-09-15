const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/appointmentsController');
const { requireAuth, requireModuleAccess } = require('../middleware/auth');

router.use(requireAuth, requireModuleAccess('appointments'));

router.get('/', ctrl.listAppointments);
router.get('/:id', ctrl.getAppointment);
router.post('/', ctrl.createAppointment);
router.put('/:id', ctrl.updateAppointment);
// Soft cancel, mirroring appointments/cancel.php (no DELETE in the original app)
router.patch('/:id/cancel', ctrl.cancelAppointment);

module.exports = router;
