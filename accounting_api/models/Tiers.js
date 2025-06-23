const { pool } = require('../config/database');

class Tier {
  // Create a new tier
  static async create(userId, nom, type, email = null, telephone = null) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO tiers (user_id, nom, type, email, telephone) VALUES (?, ?, ?, ?, ?)',
        [userId, nom, type, email, telephone]
      );
      
      return {
        id: result.insertId,
        user_id: userId,
        nom,
        type,
        email,
        telephone,
        created_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // Universal fetch method with pagination and filtering
  static async fetchTiers({
    userId,
    id = null,
    nom = null,
    type = null,
    email = null,
    telephone = null,
    searchTerm = null,
    page = 1,
    limit = 10,
    orderBy = 'created_at',
    orderDirection = 'DESC'
  } = {}) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Validate pagination parameters
      page = parseInt(page);
      limit = parseInt(limit);
      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

      const offset = (page - 1) * limit;

      // Build WHERE clause dynamically
      const whereClauses = ['user_id = ?'];
      const params = [userId];

      // Add filters if provided
      if (id) {
        whereClauses.push('id = ?');
        params.push(id);
      }
      if (nom) {
        whereClauses.push('nom LIKE ?');
        params.push(`%${nom}%`);
      }
      if (type) {
        whereClauses.push('type = ?');
        params.push(type);
      }
      if (email) {
        whereClauses.push('email LIKE ?');
        params.push(`%${email}%`);
      }
      if (telephone) {
        whereClauses.push('telephone LIKE ?');
        params.push(`%${telephone}%`);
      }
      if (searchTerm) {
        whereClauses.push(
          '(nom LIKE ? OR email LIKE ? OR telephone LIKE ?)'
        );
        params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
      }

      // Validate order by
      const validOrderColumns = ['id', 'nom', 'type', 'email', 'telephone', 'created_at'];
      if (!validOrderColumns.includes(orderBy)) {
        orderBy = 'created_at';
      }
      const orderDirectionValid = orderDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Build the complete query
      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      const query = `
        SELECT * FROM tiers
        ${whereClause}
        ORDER BY ${orderBy} ${orderDirectionValid}
        LIMIT ? OFFSET ?
      `;
      
      // Add pagination parameters
      params.push(limit, offset);

      // Execute the query
      const [rows] = await pool.execute(query, params);

      // Get total count for pagination metadata
      const countQuery = `
        SELECT COUNT(*) as total FROM tiers
        ${whereClause}
      `;
      const [countResult] = await pool.execute(countQuery, params.slice(0, -2)); // Exclude limit/offset params
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return {
        data: rows,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update tier
  static async update(id, updateData) {
    try {
      const allowedFields = ['nom', 'type', 'email', 'telephone'];
      const fields = Object.keys(updateData).filter(key => allowedFields.includes(key));
      
      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updateData[field]);
      values.push(id);

      const [result] = await pool.execute(
        `UPDATE tiers SET ${setClause} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete tier
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM tiers WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Nouvelle méthode : récupérer les balances clients/fournisseurs
  static async fetchBalances({
    userId,
    type = null,
    searchTerm = null,
    page = 1,
    limit = 10
  } = {}) {
    try {
      if (!userId) throw new Error('User ID is required');
      page = parseInt(page);
      limit = parseInt(limit);
      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;
      const offset = (page - 1) * limit;

      // WHERE
      const whereClauses = ['t.user_id = ?'];
      const params = [userId];
      if (type) {
        whereClauses.push('t.type = ?');
        params.push(type);
      }
      if (searchTerm) {
        whereClauses.push('(t.nom LIKE ? OR t.email LIKE ? OR t.telephone LIKE ?)');
        params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
      }
      const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Query principale : jointure tiers + écritures agrégées
      const query = `
        SELECT t.id, t.nom, t.type, t.email, t.telephone,
          COALESCE(SUM(e.debit),0) as total_debit,
          COALESCE(SUM(e.credit),0) as total_credit,
          COALESCE(SUM(e.debit),0) - COALESCE(SUM(e.credit),0) as solde
        FROM tiers t
        LEFT JOIN ecritures e ON e.tiers_id = t.id AND e.user_id = t.user_id
        ${whereClause}
        GROUP BY t.id
        ORDER BY t.nom ASC
        LIMIT ? OFFSET ?
      `;
      params.push(limit, offset);
      // LOG DEBUG
      
      const [rows] = await pool.execute(query, params);

      // Total pour la pagination
      const countQuery = `SELECT COUNT(*) as total FROM tiers t ${whereClause}`;
      const [countResult] = await pool.execute(countQuery, params.slice(0, -2));
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return {
        data: rows,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Tier;