const router = require('express').Router();
const internalAuth = require('../middleware/internalAuth');
const ctrl = require('../controllers/notification.controller');

router.use(internalAuth);

router.post('/request-broadcast', ctrl.broadcastRequest);
router.post('/request-closed', ctrl.requestClosed);
router.post('/stock-appeal', ctrl.stockAppeal);

module.exports = router;