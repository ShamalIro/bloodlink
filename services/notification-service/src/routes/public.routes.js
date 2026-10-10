const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/notification.controller');

router.use(auth);
router.get('/mine', ctrl.listMine);
router.patch('/:id/read', ctrl.markRead);

module.exports = router;