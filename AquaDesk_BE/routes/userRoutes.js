const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin, checkAccess } = require('../middleware/auth');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser, resetPassword } = require('../controllers/userController');

// All user routes require admin access
router.get('/', authenticateToken, isAdmin, getAllUsers);
router.get('/:id', authenticateToken, isAdmin, getUserById);
router.post('/', authenticateToken, isAdmin, createUser);
router.put('/:id', authenticateToken, isAdmin, updateUser);
router.delete('/:id', authenticateToken, isAdmin, deleteUser);
router.post('/:id/reset-password', authenticateToken, isAdmin, resetPassword);

module.exports = router;
