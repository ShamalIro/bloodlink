const router = require('express').Router();
const internalAuth = require('../middleware/internalAuth');
const ctrl = require('../controllers/verification.controller');

router.use(internalAuth);

router.get('/pending', ctrl.listPending); // keep above '/:userId'
router.get('/hospitals/:hospitalId', ctrl.getHospital);
router.get('/:userId', ctrl.getStatus);
router.patch('/:userId/approve', ctrl.approve);
router.patch('/:userId/reject', ctrl.reject);

module.exports = router;