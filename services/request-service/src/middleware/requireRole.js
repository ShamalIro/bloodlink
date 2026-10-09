const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const requireApprovedOrg = require('../middleware/requireApprovedOrg');
const ctrl = require('../controllers/request.controller');

router.use(auth);

router.post('/', ctrl.create);
router.get('/mine', ctrl.listMine); // keep '/mine' and '/pending' above '/:id'
router.get('/pending', requireRole('coordinator'), requireApprovedOrg, ctrl.listPending);
router.get('/:id', ctrl.getById);
router.patch('/:id/verify', requireRole('coordinator'), requireApprovedOrg, ctrl.verify);
router.patch('/:id/respond', requireRole('donor'), ctrl.respond);
router.patch('/:id/fulfill', ctrl.fulfill);
router.patch('/:id/close', ctrl.close);

module.exports = router;