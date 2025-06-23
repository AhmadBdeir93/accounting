const Tier = require('../models/Tiers');

// Create a new tier
const createTier = async (req, res) => {
  try {
    const { nom, type, email, telephone } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!nom || !type) {
      return res.status(400).json({ 
        message: 'Nom and type are required fields' 
      });
    }

    // Validate type
    if (!['client', 'fournisseur'].includes(type)) {
      return res.status(400).json({ 
        message: 'Type must be either "client" or "fournisseur"' 
      });
    }

    const newTier = await Tier.create(userId, nom, type, email, telephone);

    res.status(201).json({
      message: 'Tier created successfully',
      tier: newTier
    });
  } catch (error) {
    console.error('Create tier error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all tiers with pagination and filtering
const getTiers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      page = 1, 
      limit = 10, 
      type, 
      nom, 
      email, 
      telephone, 
      searchTerm,
      orderBy = 'created_at',
      orderDirection = 'DESC'
    } = req.query;

    const result = await Tier.fetchTiers({
      userId,
      id: req.query.id,
      nom,
      type,
      email,
      telephone,
      searchTerm,
      page: parseInt(page),
      limit: parseInt(limit),
      orderBy,
      orderDirection
    });

    res.json({
      message: 'Tiers retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get tiers error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get single tier by ID
const getTier = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tierId = req.params.id;
    const result = await Tier.fetchTiers({
      userId,
      id: tierId,
      limit: 1
    });

    if (result.data.length === 0) {
      return res.status(404).json({ 
        message: 'Tier not found' 
      });
    }

    res.json({
      message: 'Tier retrieved successfully',
      tier: result.data[0]
    });
  } catch (error) {
    console.error('Get tier error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update tier
const updateTier = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tierId = req.params.id;
    const { nom, type, email, telephone } = req.body;

    // First verify the tier belongs to the user
    const tierCheck = await Tier.fetchTiers({
      userId,
      id: tierId,
      limit: 1
    });

    if (tierCheck.data.length === 0) {
      return res.status(404).json({ 
        message: 'Tier not found or not owned by user' 
      });
    }

    // Prepare update data
    const updateData = {};
    if (nom) updateData.nom = nom;
    if (type) {
      if (!['client', 'fournisseur'].includes(type)) {
        return res.status(400).json({ 
          message: 'Type must be either "client" or "fournisseur"' 
        });
      }
      updateData.type = type;
    }
    if (email !== undefined) updateData.email = email;
    if (telephone !== undefined) updateData.telephone = telephone;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        message: 'No valid fields to update' 
      });
    }

    const success = await Tier.update(tierId, updateData);
    if (!success) {
      return res.status(500).json({ 
        message: 'Failed to update tier' 
      });
    }

    // Get updated tier
    const updatedTier = await Tier.fetchTiers({
      userId,
      id: tierId,
      limit: 1
    });

    res.json({
      message: 'Tier updated successfully',
      tier: updatedTier.data[0]
    });
  } catch (error) {
    console.error('Update tier error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete tier
const deleteTier = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tierId = req.params.id;

    // First verify the tier belongs to the user
    const tierCheck = await Tier.fetchTiers({
      userId,
      id: tierId,
      limit: 1
    });

    if (tierCheck.data.length === 0) {
      return res.status(404).json({ 
        message: 'Tier not found or not owned by user' 
      });
    }

    const success = await Tier.delete(tierId);
    if (!success) {
      return res.status(500).json({ 
        message: 'Failed to delete tier' 
      });
    }

    res.json({
      message: 'Tier deleted successfully'
    });
  } catch (error) {
    console.error('Delete tier error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Nouvelle fonction : balances clients/fournisseurs
const getBalances = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, searchTerm, page = 1, limit = 10 } = req.query;

    const result = await Tier.fetchBalances({
      userId,
      type,
      searchTerm,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.json({
      message: 'Balances retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get balances error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createTier,
  getTiers,
  getTier,
  updateTier,
  deleteTier,
  getBalances
};