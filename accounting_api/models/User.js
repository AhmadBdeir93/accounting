const { pool } = require('../config/database');

class User {
  // Create a new user
  static async create(username, email, passwordHash) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash]
      );
      
      return {
        id: result.insertId,
        username,
        email,
        created_at: new Date()
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('username')) {
          throw new Error('Username already exists');
        } else if (error.message.includes('email')) {
          throw new Error('Email already exists');
        }
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [id]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all users (without passwords)
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC'
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async update(id, updateData) {
    try {
      const allowedFields = ['username', 'email'];
      const fields = Object.keys(updateData).filter(key => allowedFields.includes(key));
      
      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updateData[field]);
      values.push(id);

      const [result] = await pool.execute(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('username')) {
          throw new Error('Username already exists');
        } else if (error.message.includes('email')) {
          throw new Error('Email already exists');
        }
      }
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Count total users
  static async count() {
    try {
      const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users');
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Search users
  static async search(searchTerm, limit = 10) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, username, email, created_at 
         FROM users 
         WHERE username LIKE ? OR email LIKE ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [`%${searchTerm}%`, `%${searchTerm}%`, limit]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User; 