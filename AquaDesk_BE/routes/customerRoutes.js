const express = require('express');
const router = express.Router();
const { authenticateToken, checkAccess } = require('../middleware/auth');
const { getAllCustomers, getCustomerById, getCustomerDetails, createCustomer, updateCustomer, deleteCustomer, addCustomerSystem, addCustomerContract } = require('../controllers/customerController');

// Customer routes
router.get('/', authenticateToken, checkAccess('Customer', 'CanView'), getAllCustomers);
router.get('/:id', authenticateToken, checkAccess('Customer', 'CanView'), getCustomerById);
router.get('/:id/details', authenticateToken, checkAccess('Customer', 'CanView'), getCustomerDetails);
router.post('/', authenticateToken, checkAccess('Customer', 'CanAdd'), createCustomer);
router.put('/:id', authenticateToken, checkAccess('Customer', 'CanEdit'), updateCustomer);
router.delete('/:id', authenticateToken, checkAccess('Customer', 'CanDelete'), deleteCustomer);
router.post('/:id/systems', authenticateToken, checkAccess('Customer', 'CanAdd'), addCustomerSystem);
router.post('/:id/contracts', authenticateToken, checkAccess('Customer', 'CanAdd'), addCustomerContract);

module.exports = router;
