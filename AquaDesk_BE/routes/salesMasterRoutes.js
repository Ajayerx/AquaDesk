const express = require('express');
const router = express.Router();
const { authenticateToken, checkAccess } = require('../middleware/auth');
const { getAllSalesMaster, getSalesMasterById, createSalesMaster, updateSalesMaster, deleteSalesMaster } = require('../controllers/salesMasterController');

// SalesMaster routes
router.get('/', authenticateToken, checkAccess('SalesMaster', 'CanView'), getAllSalesMaster);
router.get('/:id', authenticateToken, checkAccess('SalesMaster', 'CanView'), getSalesMasterById);
router.post('/', authenticateToken, checkAccess('SalesMaster', 'CanAdd'), createSalesMaster);
router.put('/:id', authenticateToken, checkAccess('SalesMaster', 'CanEdit'), updateSalesMaster);
router.delete('/:id', authenticateToken, checkAccess('SalesMaster', 'CanDelete'), deleteSalesMaster);

module.exports = router;
