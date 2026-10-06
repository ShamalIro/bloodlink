const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const ctrl = require('../controllers/donor.controller');

router.use(auth, requireRole('donor'));

router.put('/me', ctrl.upsertMe);
router.get('/me', ctrl.getMe);
router.patch('/me/availability', ctrl.setAvailability);
router.get('/me/qr', ctrl.issueQr);

module.exports = router;