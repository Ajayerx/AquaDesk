const express = require('express');
const router = express.Router();
const { authenticateToken, checkAccess } = require('../middleware/auth');
const { getAllContracts, getContractById, createContract, updateContract, deleteContract, renewContract } = require('../controllers/contractController');

// Contract routes
router.get('/', authenticateToken, checkAccess('ServiceContract', 'CanView'), getAllContracts);
router.get('/:id', authenticateToken, checkAccess('ServiceContract', 'CanView'), getContractById);
router.post('/', authenticateToken, checkAccess('ServiceContract', 'CanAdd'), createContract);
router.put('/:id', authenticateToken, checkAccess('ServiceContract', 'CanEdit'), updateContract);
router.delete('/:id', authenticateToken, checkAccess('ServiceContract', 'CanDelete'), deleteContract);
router.post('/:id/renew', authenticateToken, checkAccess('ServiceContract', 'CanEdit'), renewContract);

module.exports = router;
