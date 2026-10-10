const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const requireApprovedNgo = require('../middleware/requireApprovedNGO');
const ctrl = require('../controllers/camp.controller');

router.use(auth);

// NGO staff (approved NGO accounts only)
router.post('/', requireRole('ngo'), requireApprovedNgo, ctrl.create);
router.get('/mine', requireRole('ngo'), requireApprovedNgo, ctrl.listMine);

// Donors. Keep '/nearby' and '/my-rsvps' above '/:id'.
router.get('/nearby', requireRole('donor'), ctrl.nearby);
router.get('/my-rsvps', requireRole('donor'), ctrl.myRsvps);

router.get('/:id', ctrl.getById);
router.patch('/:id', requireRole('ngo'), requireApprovedNgo, ctrl.update);
router.delete('/:id', requireRole('ngo'), requireApprovedNgo, ctrl.cancel);
router.post('/:id/invite', requireRole('ngo'), requireApprovedNgo, ctrl.invite);
router.post('/:id/rsvp', requireRole('donor'), ctrl.rsvp);
router.delete('/:id/rsvp', requireRole('donor'), ctrl.cancelRsvp);

module.exports = router;