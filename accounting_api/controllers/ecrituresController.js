const Ecriture = require('../models/Ecritures');

// Create a new ecriture
const createEcriture = async (req, res) => {
  try {
    const { tiers_id, date_ecriture, libelle, debit, credit } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!tiers_id || !date_ecriture || !libelle) {
      return res.status(400).json({ 
        message: 'Tiers ID, date_ecriture and libelle are required fields' 
      });
    }

    // Validate that at least one of debit or credit is provided
    if ((!debit || debit === 0) && (!credit || credit === 0)) {
      return res.status(400).json({ 
        message: 'At least one of debit or credit must be provided and greater than 0' 
      });
    }

    // Validate amounts
    const debitAmount = parseFloat(debit) || 0;
    const creditAmount = parseFloat(credit) || 0;
    
    if (debitAmount < 0 || creditAmount < 0) {
      return res.status(400).json({ 
        message: 'Debit and credit amounts must be positive' 
      });
    }

    const newEcriture = await Ecriture.create(
      userId, 
      tiers_id, 
      date_ecriture, 
      libelle, 
      debitAmount, 
      creditAmount
    );

    res.status(201).json({
      message: 'Ecriture created successfully',
      ecriture: newEcriture
    });
  } catch (error) {
    console.error('Create ecriture error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all ecritures with pagination and filtering - REQUIRES DATE RANGE AND TIERS
const getEcritures = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      tiers_id, 
      libelle, 
      searchTerm,
      orderBy = 'date_ecriture',
      orderDirection = 'ASC',
      date_debut,
      date_fin
    } = req.query;

    // Validate required date range
    if (!date_debut || !date_fin) {
      return res.status(400).json({
        message: 'Date range is required. Please provide both date_debut and date_fin parameters.'
      });
    }

    // Validate required tiers_id
    if (!tiers_id) {
      return res.status(400).json({
        message: 'Tiers ID is required. Please provide tiers_id parameter.'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date_debut) || !dateRegex.test(date_fin)) {
      return res.status(400).json({
        message: 'Invalid date format. Use YYYY-MM-DD format.'
      });
    }

    // Validate date range
    if (new Date(date_debut) > new Date(date_fin)) {
      return res.status(400).json({
        message: 'date_debut must be before or equal to date_fin'
      });
    }

    const result = await Ecriture.fetchEcritures({
      userId,
      dateDebut: date_debut,
      dateFin: date_fin,
      tiersId: tiers_id,
      id: req.query.id,
      libelle,
      searchTerm,
      orderBy,
      orderDirection
    });

    res.json({
      message: 'Ecritures retrieved successfully',
      data: result.data,
      balanceReport: result.balanceReport
    });
  } catch (error) {
    console.error('Get ecritures error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get single ecriture by ID
const getEcriture = async (req, res) => {
  try {
    const userId = req.user.userId;
    const ecritureId = req.params.id;

    const ecriture = await Ecriture.getById(ecritureId, userId);

    if (!ecriture) {
      return res.status(404).json({ 
        message: 'Ecriture not found' 
      });
    }

    res.json({
      message: 'Ecriture retrieved successfully',
      ecriture
    });
  } catch (error) {
    console.error('Get ecriture error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update ecriture
const updateEcriture = async (req, res) => {
  try {
    const userId = req.user.userId;
    const ecritureId = req.params.id;
    const { tiers_id, date_ecriture, libelle, debit, credit } = req.body;

    // First verify the ecriture belongs to the user
    const ecritureCheck = await Ecriture.getById(ecritureId, userId);

    if (!ecritureCheck) {
      return res.status(404).json({ 
        message: 'Ecriture not found or not owned by user' 
      });
    }

    // Prepare update data
    const updateData = {};
    if (tiers_id) updateData.tiers_id = tiers_id;
    if (date_ecriture) updateData.date_ecriture = date_ecriture;
    if (libelle) updateData.libelle = libelle;
    if (debit !== undefined) updateData.debit = parseFloat(debit) || 0;
    if (credit !== undefined) updateData.credit = parseFloat(credit) || 0;

    // Validate that at least one of debit or credit is provided
    if (updateData.debit === 0 && updateData.credit === 0) {
      return res.status(400).json({ 
        message: 'At least one of debit or credit must be greater than 0' 
      });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        message: 'No valid fields to update' 
      });
    }

    const success = await Ecriture.update(ecritureId, updateData);
    if (!success) {
      return res.status(500).json({ 
        message: 'Failed to update ecriture' 
      });
    }

    // Get updated ecriture
    const updatedEcriture = await Ecriture.getById(ecritureId, userId);

    res.json({
      message: 'Ecriture updated successfully',
      ecriture: updatedEcriture
    });
  } catch (error) {
    console.error('Update ecriture error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete ecriture
const deleteEcriture = async (req, res) => {
  try {
    const userId = req.user.userId;
    const ecritureId = req.params.id;

    // First verify the ecriture belongs to the user
    const ecritureCheck = await Ecriture.getById(ecritureId, userId);

    if (!ecritureCheck) {
      return res.status(404).json({ 
        message: 'Ecriture not found or not owned by user' 
      });
    }

    const success = await Ecriture.delete(ecritureId);
    if (!success) {
      return res.status(500).json({ 
        message: 'Failed to delete ecriture' 
      });
    }

    res.json({
      message: 'Ecriture deleted successfully'
    });
  } catch (error) {
    console.error('Delete ecriture error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get ecritures by tiers with balance report - REQUIRES DATE RANGE
const getEcrituresByTiers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tiersId = req.params.tiersId;
    const { page = 1, limit = 10, date_debut, date_fin } = req.query;

    // Validate required date range
    if (!date_debut || !date_fin) {
      return res.status(400).json({
        message: 'Date range is required. Please provide both date_debut and date_fin parameters.'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date_debut) || !dateRegex.test(date_fin)) {
      return res.status(400).json({
        message: 'Invalid date format. Use YYYY-MM-DD format.'
      });
    }

    // Validate date range
    if (new Date(date_debut) > new Date(date_fin)) {
      return res.status(400).json({
        message: 'date_debut must be before or equal to date_fin'
      });
    }

    const result = await Ecriture.getByTiers(
      tiersId, 
      userId, 
      date_debut,
      date_fin,
      parseInt(page), 
      parseInt(limit)
    );

    res.json({
      message: 'Ecritures by tiers retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      balanceReport: result.balanceReport
    });
  } catch (error) {
    console.error('Get ecritures by tiers error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get summary statistics with optional date range
const getSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date_debut, date_fin } = req.query;

    // Validate date format if provided
    if (date_debut || date_fin) {
      if (!date_debut || !date_fin) {
        return res.status(400).json({
          message: 'Both date_debut and date_fin must be provided together.'
        });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date_debut) || !dateRegex.test(date_fin)) {
        return res.status(400).json({
          message: 'Invalid date format. Use YYYY-MM-DD format.'
        });
      }

      if (new Date(date_debut) > new Date(date_fin)) {
        return res.status(400).json({
          message: 'date_debut must be before or equal to date_fin'
        });
      }
    }

    const summary = await Ecriture.getSummary(userId, date_debut, date_fin);

    res.json({
      message: 'Summary retrieved successfully',
      summary
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get today's statistics for Quick Stats
const getTodayStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Utilise la nouvelle méthode pour séparer client/fournisseur
    const todayStats = await Ecriture.getTodayStatsByType(userId);
    res.json({
      message: "Today's statistics retrieved successfully",
      todayStats
    });
  } catch (error) {
    console.error('Get today stats error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get balance report for a specific date range
const getBalanceReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date_debut, date_fin, tiers_id } = req.query;

    // Validate required date range
    if (!date_debut || !date_fin) {
      return res.status(400).json({
        message: 'Date range is required. Please provide both date_debut and date_fin parameters.'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date_debut) || !dateRegex.test(date_fin)) {
      return res.status(400).json({
        message: 'Invalid date format. Use YYYY-MM-DD format.'
      });
    }

    // Validate date range
    if (new Date(date_debut) > new Date(date_fin)) {
      return res.status(400).json({
        message: 'date_debut must be before or equal to date_fin'
      });
    }

    const balanceReport = await Ecriture.getBalanceReport(userId, date_debut, date_fin, tiers_id);

    res.json({
      message: 'Balance report retrieved successfully',
      balanceReport
    });
  } catch (error) {
    console.error('Get balance report error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get recent ecritures for dashboard (without tiers requirement)
const getRecentEcritures = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      page = 1, 
      limit = 10, 
      orderBy = 'date_ecriture',
      orderDirection = 'DESC',
      date_debut,
      date_fin
    } = req.query;

    // Validate required date range
    if (!date_debut || !date_fin) {
      return res.status(400).json({
        message: 'Date range is required. Please provide both date_debut and date_fin parameters.'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date_debut) || !dateRegex.test(date_fin)) {
      return res.status(400).json({
        message: 'Invalid date format. Use YYYY-MM-DD format.'
      });
    }

    // Validate date range
    if (new Date(date_debut) > new Date(date_fin)) {
      return res.status(400).json({
        message: 'date_debut must be before or equal to date_fin'
      });
    }

    const result = await Ecriture.getRecentEcritures({
      userId,
      dateDebut: date_debut,
      dateFin: date_fin,
      page: parseInt(page),
      limit: parseInt(limit),
      orderBy,
      orderDirection
    });

    res.json({
      message: 'Recent ecritures retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get recent ecritures error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

module.exports = {
  createEcriture,
  getEcritures,
  getEcriture,
  updateEcriture,
  deleteEcriture,
  getEcrituresByTiers,
  getSummary,
  getTodayStats,
  getBalanceReport,
  getRecentEcritures
}; 