const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  checkCustomerAccess,
  getComplaints,
  createComplaint,
  getUpcomingSchedule,
  createScheduleRequest
} = require('../controllers/customerPortalController');

router.get('/customers/:id/complaints', authenticateToken, checkCustomerAccess, getComplaints);
router.post('/customers/:id/complaints', authenticateToken, checkCustomerAccess, createComplaint);
router.get('/customers/:id/schedule/upcoming', authenticateToken, checkCustomerAccess, getUpcomingSchedule);
router.post('/customers/:id/schedule-requests', authenticateToken, checkCustomerAccess, createScheduleRequest);

module.exports = router;
