const express = require('express');
const router = express.Router();
const { authenticateToken, checkAccess } = require('../middleware/auth');
const { getDaywiseTaskReport, getAreawiseTaskReport, getItemRequiredReport, getContractRenewalReport } = require('../controllers/reportController');

// Report routes
router.get('/daywise-task', authenticateToken, checkAccess('Reports', 'CanView'), getDaywiseTaskReport);
router.get('/areawise-task', authenticateToken, checkAccess('Reports', 'CanView'), getAreawiseTaskReport);
router.get('/item-required', authenticateToken, checkAccess('Reports', 'CanView'), getItemRequiredReport);
router.get('/contract-renewal', authenticateToken, checkAccess('Reports', 'CanView'), getContractRenewalReport);

module.exports = router;
