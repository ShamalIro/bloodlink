const router = require('express').Router();
const internalAuth = require('../middleware/internalAuth');
const ctrl = require('../controllers/donor.controller');

router.use(internalAuth);
router.get('/match', ctrl.match);
router.post('/validate-qr', ctrl.validateQr);
router.post('/:donorId/donations', ctrl.recordDonation);

module.exports = router;