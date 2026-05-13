const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin, checkAccess } = require('../middleware/auth');
const { getAllCompanies, getCompanyById, createCompany, updateCompany, deleteCompany } = require('../controllers/companyController');

// All company routes require admin access
router.get('/', authenticateToken, isAdmin, getAllCompanies);
router.get('/:id', authenticateToken, isAdmin, getCompanyById);
router.post('/', authenticateToken, isAdmin, createCompany);
router.put('/:id', authenticateToken, isAdmin, updateCompany);
router.delete('/:id', authenticateToken, isAdmin, deleteCompany);

module.exports = router;
