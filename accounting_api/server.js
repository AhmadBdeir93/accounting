const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const { testConnection } = require('./config/database');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Routes
app.use('/api', routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Cannot start server without database connection');
      process.exit(1);
    }

    // Initialize database tables
   

    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.environment}`);
      console.log(`🏥 Health check: http://localhost:${config.port}/api/health`);
      console.log(`📚 API Documentation:`);
      console.log(`  🔐 Authentication:`);
      console.log(`    POST /api/auth/register - Register a new user`);
      console.log(`    POST /api/auth/login - Login user`);
      console.log(`    GET /api/auth/profile - Get user profile (protected)`);
      console.log(`    PUT /api/auth/profile - Update user profile (protected)`);
      console.log(`    GET /api/auth/users - Get all users (protected)`);
      console.log(`  👥 Tiers (Clients/Fournisseurs):`);
      console.log(`    POST /api/tiers - Create a new tier (protected)`);
      console.log(`    GET /api/tiers - Get all tiers with pagination (protected)`);
      console.log(`    GET /api/tiers/:id - Get single tier (protected)`);
      console.log(`    PUT /api/tiers/:id - Update tier (protected)`);
      console.log(`    DELETE /api/tiers/:id - Delete tier (protected)`);
      console.log(`  📊 Écritures Comptables:`);
      console.log(`    POST /api/ecritures - Create a new ecriture (protected)`);
      console.log(`    GET /api/ecritures?date_debut=YYYY-MM-DD&date_fin=YYYY-MM-DD - Get all ecritures (protected)`);
      console.log(`    GET /api/ecritures/:id - Get single ecriture (protected)`);
      console.log(`    PUT /api/ecritures/:id - Update ecriture (protected)`);
      console.log(`    DELETE /api/ecritures/:id - Delete ecriture (protected)`);
      console.log(`    GET /api/ecritures/tiers/:tiersId?date_debut=YYYY-MM-DD&date_fin=YYYY-MM-DD - Get ecritures by tiers (protected)`);
      console.log(`    GET /api/ecritures/summary?date_debut=YYYY-MM-DD&date_fin=YYYY-MM-DD - Get summary (protected)`);
      console.log(`    GET /api/ecritures/balance/report?date_debut=YYYY-MM-DD&date_fin=YYYY-MM-DD - Get balance report (protected)`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 