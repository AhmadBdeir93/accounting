const express = require('express');
const router = express.Router();
const { healthCheck } = require('../controllers/healthController');

// Health check route
router.get('/health', healthCheck);

module.exports = router; 