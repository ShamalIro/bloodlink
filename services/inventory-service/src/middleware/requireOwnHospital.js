// Use after requireApprovedOrg: a coordinator may only touch their own hospital's stock.
module.exports = (req, res, next) =>
  req.params.hospitalId === req.user.hospitalId
    ? next()
    : res.status(403).json({ message: 'You can only manage your own hospital' });