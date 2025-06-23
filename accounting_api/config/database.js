const mysql = require('mysql2/promise');
const config = require('./config');

// Create connection pool
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  port: config.database.port,
  charset: config.database.charset,
  timezone: config.database.timezone,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT(11) NOT NULL AUTO_INCREMENT,
        username VARCHAR(100) NOT NULL COLLATE 'utf8mb4_general_ci',
        email VARCHAR(150) NOT NULL COLLATE 'utf8mb4_general_ci',
        password_hash VARCHAR(255) NOT NULL COLLATE 'utf8mb4_general_ci',
        created_at TIMESTAMP NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id) USING BTREE,
        UNIQUE INDEX username (username) USING BTREE,
        UNIQUE INDEX email (email) USING BTREE
      )
      COLLATE='utf8mb4_general_ci'
      ENGINE=InnoDB
      AUTO_INCREMENT=1
    `;
    
    await connection.execute(createUsersTable);
    console.log('✅ Database tables initialized successfully');
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase
}; 