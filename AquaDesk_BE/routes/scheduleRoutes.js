const express = require('express');
const router = express.Router();
const { authenticateToken, checkAccess } = require('../middleware/auth');
const {
  getWeekView,
  getUpcomingTasks,
  getScheduleById,
  confirmSchedule,
  rescheduleTask,
  getConfirmedTasks,
  markTasksCompleted,
  getCompletedTasks,
  getManualSchedule,
  insertManualSchedule
} = require('../controllers/scheduleController');

// Schedule routes
router.get('/week-view', authenticateToken, checkAccess('WeekView', 'CanView'), getWeekView);
router.get('/upcoming', authenticateToken, checkAccess('WeekView', 'CanView'), getUpcomingTasks);
router.get('/confirmed', authenticateToken, checkAccess('ConfirmedTasks', 'CanView'), getConfirmedTasks);
router.get('/completed', authenticateToken, checkAccess('CompletedTasks', 'CanView'), getCompletedTasks);
router.get('/manual', authenticateToken, checkAccess('ManualSchedule', 'CanView'), getManualSchedule);
router.get('/:id', authenticateToken, checkAccess('WeekView', 'CanView'), getScheduleById);
router.post('/:id/confirm', authenticateToken, checkAccess('WeekView', 'CanEdit'), confirmSchedule);
router.post('/:id/reschedule', authenticateToken, checkAccess('WeekView', 'CanEdit'), rescheduleTask);
router.post('/mark-completed', authenticateToken, checkAccess('ConfirmedTasks', 'CanEdit'), markTasksCompleted);
router.post('/manual-insert', authenticateToken, checkAccess('ManualSchedule', 'CanAdd'), insertManualSchedule);

module.exports = router;
