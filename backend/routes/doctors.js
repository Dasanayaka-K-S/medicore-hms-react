const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/doctorsController');
const { requireAuth, requireModuleAccess } = require('../middleware/auth');

router.use(requireAuth, requireModuleAccess('doctors'));

router.get('/', ctrl.listDoctors);
router.get('/:id', ctrl.getDoctor);
router.post('/', ctrl.createDoctor);
router.put('/:id', ctrl.updateDoctor);
router.delete('/:id', ctrl.deleteDoctor);

module.exports = router;
