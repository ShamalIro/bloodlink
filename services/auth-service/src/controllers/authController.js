const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// FR1 — register as donor, recipient, or hospital/NGO staff
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, bloodType, district, organizationName, organizationType, staffIdOrRegNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password, and role are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      bloodType: role === 'donor' ? bloodType : undefined,
      district: role === 'donor' ? district : undefined,
      organizationName: role === 'coordinator' || role === 'ngo' ? organizationName : undefined,
      organizationType: role === 'coordinator' || role === 'ngo' ? organizationType : undefined,
      staffIdOrRegNumber: role === 'coordinator' || role === 'ngo' ? staffIdOrRegNumber : undefined,
      // Coordinator/NGO accounts start unverified until reviewed (FR5)
      isVerified: role === 'donor' || role === 'requester',
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, role: user.role, isVerified: user.isVerified },
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// Login — routes the app to the correct role Home screen
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role, isVerified: user.isVerified },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
