const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const healthRoutes = require('./healthRoutes');
const tiersRoutes = require('./tiersRoutes');
const ecrituresRoutes = require('./ecrituresRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/', healthRoutes);
router.use('/tiers', tiersRoutes);
router.use('/ecritures', ecrituresRoutes);

module.exports = router; 