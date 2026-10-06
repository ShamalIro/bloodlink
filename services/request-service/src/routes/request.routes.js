const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/request.controller');

router.use(auth);

router.post('/', ctrl.create);
router.get('/my', ctrl.listMine); // must stay above '/:id'
router.get('/:id', ctrl.getById);
router.post('/:id/respond', ctrl.respond);
router.patch('/:id/fulfill', ctrl.fulfill);

module.exports = router;