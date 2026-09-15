const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/billingController');
const { requireAuth, requireModuleAccess } = require('../middleware/auth');

router.use(requireAuth, requireModuleAccess('billing'));

// No DELETE route - the original billing module had no delete.php;
// bills are created, viewed and edited only (financial audit trail).
router.get('/', ctrl.listBills);
router.get('/:id', ctrl.getBill);
router.post('/', ctrl.createBill);
router.put('/:id', ctrl.updateBill);

module.exports = router;
