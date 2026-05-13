const express = require('express');
const router = express.Router();
const { authenticateToken, hasRole } = require('../middleware/auth');
const { getStats } = require('../controllers/dashboardController');

// Internal dashboard stats. Restricted to non-Customer roles. Customers have
// a separate per-customer dashboard endpoint under /api/customer-portal.
router.get(
  '/stats',
  authenticateToken,
  hasRole('Admin', 'Manager', 'Engineer', 'SuperAdmin'),
  getStats
);

module.exports = router;
