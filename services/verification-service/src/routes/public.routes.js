const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const ctrl = require('../controllers/verification.controller');

router.use(auth);
router.get('/hospitals', ctrl.listHospitals);
router.post('/apply', requireRole('coordinator', 'ngo'), ctrl.apply);
router.get('/me', requireRole('coordinator', 'ngo'), ctrl.getMine);

module.exports = router;