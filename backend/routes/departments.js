const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/departmentsController');
const { requireAuth, requireModuleAccess } = require('../middleware/auth');

router.use(requireAuth, requireModuleAccess('departments'));

router.get('/', ctrl.listDepartments);
router.get('/:id', ctrl.getDepartment);
router.post('/', ctrl.createDepartment);
router.put('/:id', ctrl.updateDepartment);
router.delete('/:id', ctrl.deleteDepartment);

module.exports = router;
