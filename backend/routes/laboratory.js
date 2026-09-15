const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/laboratoryController');
const { requireAuth, requireModuleAccess } = require('../middleware/auth');

router.use(requireAuth, requireModuleAccess('laboratory'));

// No DELETE route - the original laboratory module had add.php and
// edit.php only, so lab requests are never removed.
router.get('/', ctrl.listTests);
router.get('/:id', ctrl.getTest);
router.post('/', ctrl.createTest);
router.put('/:id', ctrl.updateTest);

module.exports = router;
