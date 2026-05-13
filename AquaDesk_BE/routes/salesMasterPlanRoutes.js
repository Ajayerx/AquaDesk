const express = require('express');
const router = express.Router();
const {
  getAllSalesMasterPlans,
  getSalesMasterPlanById,
  createSalesMasterPlan,
  updateSalesMasterPlan,
  deleteSalesMasterPlan,
  getPlansByFrequency
} = require('../controllers/salesMasterPlanController');
const { authenticateToken } = require('../middleware/auth');

// Get all sales master plans
router.get('/', authenticateToken, getAllSalesMasterPlans);

// Get plans by frequency (weekly/monthly)
router.get('/frequency/:frequency', authenticateToken, getPlansByFrequency);

// Get sales master plan by ID
router.get('/:id', authenticateToken, getSalesMasterPlanById);

// Create sales master plan
router.post('/', authenticateToken, createSalesMasterPlan);

// Update sales master plan
router.put('/:id', authenticateToken, updateSalesMasterPlan);

// Delete sales master plan
router.delete('/:id', authenticateToken, deleteSalesMasterPlan);

module.exports = router;
