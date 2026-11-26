const express = require('express');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/users  (RBAC: admin only)
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  res.json(await User.find().select('-password'));
});

module.exports = router;
