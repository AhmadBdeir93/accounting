const express = require('express');
const router = express.Router();
const { 
  createEcriture, 
  getEcritures, 
  getEcriture, 
  updateEcriture, 
  deleteEcriture, 
  getEcrituresByTiers, 
  getSummary,
  getBalanceReport,
  getTodayStats,
  getRecentEcritures
} = require('../controllers/ecrituresController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create a new ecriture
router.post('/', createEcriture);

// Get all ecritures with pagination and filtering (REQUIRES date_debut and date_fin)
router.get('/', getEcritures);

// Get summary statistics (optional date range) - MUST BE BEFORE /:id
router.get('/summary', getSummary);

// Get today's statistics for Quick Stats - MUST BE BEFORE /:id
router.get('/today-stats', getTodayStats);

// Get recent ecritures for dashboard - MUST BE BEFORE /:id
router.get('/recent', getRecentEcritures);

// Get balance report (REQUIRES date_debut and date_fin) - MUST BE BEFORE /:id
router.get('/balance/report', getBalanceReport);

// Get ecritures by tiers (REQUIRES date_debut and date_fin) - MUST BE BEFORE /:id
router.get('/tiers/:tiersId', getEcrituresByTiers);

// Get single ecriture by ID - MUST BE LAST
router.get('/:id', getEcriture);

// Update ecriture
router.put('/:id', updateEcriture);

// Delete ecriture
router.delete('/:id', deleteEcriture);

module.exports = router; 