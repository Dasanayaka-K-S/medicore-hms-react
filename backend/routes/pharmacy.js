const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pharmacyController');
const { requireAuth, requireModuleAccess } = require('../middleware/auth');

router.use(requireAuth, requireModuleAccess('pharmacy'));

router.get('/', ctrl.listMedicines);
router.get('/:id', ctrl.getMedicine);
router.post('/', ctrl.createMedicine);
router.put('/:id', ctrl.updateMedicine);
router.delete('/:id', ctrl.deleteMedicine);

module.exports = router;
