const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const requireApprovedOrg = require('../middleware/requireApprovedOrg');
const ownHospital = require('../middleware/requireOwnHospital');
const ctrl = require('../controllers/Inventory.controller');

// Approved hospital coordinators only, and only for their own hospital.
router.use(auth, requireRole('coordinator'), requireApprovedOrg);

router.get('/:hospitalId', ownHospital, ctrl.getStock);
router.put('/:hospitalId/:bloodType', ownHospital, ctrl.setStock);
router.post('/:hospitalId/broadcast-appeal', ownHospital, ctrl.broadcastAppeal);

module.exports = router;