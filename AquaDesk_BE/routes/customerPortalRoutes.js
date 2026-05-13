const express = require('express');
const router = express.Router();
const { authenticateToken, isCustomer } = require('../middleware/auth');
const {
  getMyDashboard,
  getMyProfile,
  getMyComplaints,
  createMyComplaint,
  getMyUpcomingSchedule,
  createMyScheduleRequest,
  getMyContracts
} = require('../controllers/customerPortalController');

// All routes require an authenticated Customer user. Per-customer ownership
// is enforced inside each controller via ensureOwnCustomer().

router.get('/customers/:id/dashboard', authenticateToken, isCustomer, getMyDashboard);
router.get('/customers/:id/profile', authenticateToken, isCustomer, getMyProfile);

router.get('/customers/:id/complaints', authenticateToken, isCustomer, getMyComplaints);
router.post('/customers/:id/complaints', authenticateToken, isCustomer, createMyComplaint);

router.get('/customers/:id/schedule/upcoming', authenticateToken, isCustomer, getMyUpcomingSchedule);
router.post('/customers/:id/schedule-requests', authenticateToken, isCustomer, createMyScheduleRequest);

router.get('/customers/:id/contracts', authenticateToken, isCustomer, getMyContracts);

module.exports = router;
