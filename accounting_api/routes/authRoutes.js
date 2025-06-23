const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  getAllUsers, 
  updateProfile 
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateRegistration, validateLogin } = require('../middleware/validationMiddleware');

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/users', authenticateToken, getAllUsers); // For admin purposes

module.exports = router; 