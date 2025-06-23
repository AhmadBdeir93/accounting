require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'compta_simple',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4',
    timezone: '+00:00'
  },
  
  // CORS configuration
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://accounting_front',
      'http://samo.gsoftci.com:8080',
      'https://samo.gsoftci.com:8080',
    ],
    credentials: true
  },
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Validation rules
  validation: {
    username: {
      minLength: 3,
      maxLength: 100
    },
    password: {
      minLength: 6,
      maxLength: 100
    },
    email: {
      maxLength: 150
    }
  }
};

module.exports = config; 