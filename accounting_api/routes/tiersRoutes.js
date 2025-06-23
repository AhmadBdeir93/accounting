const express = require('express');
const router = express.Router();
const { 
  createTier, 
  getTiers, 
  getTier, 
  updateTier, 
  deleteTier,
  getBalances
} = require('../controllers/tiersController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateTierCreation, validateTierUpdate } = require('../middleware/tiersValidationMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Create a new tier
router.post('/', validateTierCreation, createTier);

// Get all tiers with pagination and filtering
router.get('/', getTiers);

// Route pour récupérer les balances clients/fournisseurs
router.get('/balances', getBalances);

// Get single tier by ID
router.get('/:id', getTier);

// Update tier
router.put('/:id', validateTierUpdate, updateTier);

// Delete tier
router.delete('/:id', deleteTier);

module.exports = router; 