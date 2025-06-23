const { pool } = require('../config/database');

class Ecriture {
  // Create a new ecriture
  static async create(userId, tiersId, dateEcriture, libelle, debit = 0, credit = 0) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO ecritures (user_id, tiers_id, date_ecriture, libelle, debit, credit) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, tiersId, dateEcriture, libelle, debit, credit]
      );
      
      return {
        id: result.insertId,
        user_id: userId,
        tiers_id: tiersId,
        date_ecriture: dateEcriture,
        libelle,
        debit,
        credit,
        created_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // Universal fetch method with pagination and filtering - REQUIRES DATE RANGE AND TIERS
  static async fetchEcritures({
    userId,
    dateDebut,
    dateFin,
    tiersId,
    id = null,
    libelle = null,
    searchTerm = null,
    orderBy = 'date_ecriture',
    orderDirection = 'ASC'
  } = {}) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!dateDebut || !dateFin) {
        throw new Error('Date range (dateDebut and dateFin) is required');
      }

      if (!tiersId) {
        throw new Error('Tiers ID is required');
      }

      // Build WHERE clause dynamically - ALWAYS include date range and tiers
      const whereClauses = ['e.user_id = ?', 'e.date_ecriture >= ?', 'e.date_ecriture <= ?', 'e.tiers_id = ?'];
      const params = [userId, dateDebut, dateFin, tiersId];

      // Add filters if provided
      if (id) {
        whereClauses.push('e.id = ?');
        params.push(id);
      }
      if (libelle) {
        whereClauses.push('e.libelle LIKE ?');
        params.push(`%${libelle}%`);
      }
      if (searchTerm) {
        whereClauses.push(
          '(e.libelle LIKE ? OR t.nom LIKE ?)'
        );
        params.push(`%${searchTerm}%`, `%${searchTerm}%`);
      }

      // Validate order by
      const validOrderColumns = ['id', 'date_ecriture', 'libelle', 'debit', 'credit', 'created_at'];
      if (!validOrderColumns.includes(orderBy)) {
        orderBy = 'date_ecriture';
      }
      const orderDirectionValid = orderDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Build the complete query with JOIN to get tiers information
      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      const query = `
        SELECT e.*, t.nom as tiers_nom, t.type as tiers_type
        FROM ecritures e
        LEFT JOIN tiers t ON e.tiers_id = t.id
        ${whereClause}
        ORDER BY e.${orderBy} ${orderDirectionValid}
      `;

      // Execute the query
      const [rows] = await pool.execute(query, params);

      // Calculate balance report for the date range
      const balanceReport = await this.getBalanceReport(userId, dateDebut, dateFin, tiersId);

      return {
        data: rows,
        balanceReport
      };
    } catch (error) {
      throw error;
    }
  }

  // Get balance report for a date range
  static async getBalanceReport(userId, dateDebut, dateFin, tiersId = null) {
    try {
      const whereClauses = ['user_id = ?', 'date_ecriture >= ?', 'date_ecriture <= ?'];
      const params = [userId, dateDebut, dateFin];

      if (tiersId) {
        whereClauses.push('tiers_id = ?');
        params.push(tiersId);
      }

      const whereClause = whereClauses.join(' AND ');

      // Get summary for the period
      const [summaryRows] = await pool.execute(
        `SELECT 
          COUNT(*) as total_ecritures,
          SUM(debit) as total_debit,
          SUM(credit) as total_credit,
          SUM(debit - credit) as solde_periode
         FROM ecritures 
         WHERE ${whereClause}`,
        params
      );

      // Get cumulative balance up to the start date
      const [cumulativeRows] = await pool.execute(
        `SELECT 
          SUM(debit) as total_debit_cumul,
          SUM(credit) as total_credit_cumul,
          SUM(debit - credit) as solde_cumul
         FROM ecritures 
         WHERE user_id = ? AND date_ecriture < ?${tiersId ? ' AND tiers_id = ?' : ''}`,
        tiersId ? [userId, dateDebut, tiersId] : [userId, dateDebut]
      );

      const summary = summaryRows[0];
      const cumulative = cumulativeRows[0];

      // Convert all values to numbers to avoid NaN issues
      const total_ecritures = parseInt(summary.total_ecritures) || 0;
      const total_debit = parseFloat(summary.total_debit) || 0;
      const total_credit = parseFloat(summary.total_credit) || 0;
      const solde_periode = parseFloat(summary.solde_periode) || 0;
      
      const total_debit_cumul = parseFloat(cumulative.total_debit_cumul) || 0;
      const total_credit_cumul = parseFloat(cumulative.total_credit_cumul) || 0;
      const report_solde = parseFloat(cumulative.solde_cumul) || 0;

      // Calculate final balance (report_solde + period)
      const solde_final = Number(report_solde) + Number(solde_periode);

    
      // Vérification alternative du calcul
      
      // Vérification que le solde_final est bien un nombre
      if (typeof solde_final !== 'number' || isNaN(solde_final)) {
        console.error('❌ ERREUR: solde_final n\'est pas un nombre valide:', solde_final);
        throw new Error('Erreur de calcul du solde final');
      }

      return {
        periode: {
          date_debut: dateDebut,
          date_fin: dateFin,
          total_ecritures: total_ecritures,
          total_debit: total_debit,
          total_credit: total_credit,
          solde_periode: solde_periode
        },
        cumul: {
          total_debit_cumul: total_debit_cumul,
          total_credit_cumul: total_credit_cumul,
          solde_cumul: report_solde
        },
        solde_final: solde_final
      };
    } catch (error) {
      throw error;
    }
  }

  // Get ecritures by tiers with balance report
  static async getByTiers(tiersId, userId, dateDebut, dateFin, page = 1, limit = 10) {
    try {
      if (!dateDebut || !dateFin) {
        throw new Error('Date range (dateDebut and dateFin) is required');
      }

      const offset = (page - 1) * limit;
      
      const [rows] = await pool.execute(
        `SELECT e.*, t.nom as tiers_nom, t.type as tiers_type
         FROM ecritures e
         LEFT JOIN tiers t ON e.tiers_id = t.id
         WHERE e.tiers_id = ? AND e.user_id = ? AND e.date_ecriture >= ? AND e.date_ecriture <= ?
         ORDER BY e.date_ecriture ASC, e.created_at ASC
         LIMIT ? OFFSET ?`,
        [tiersId, userId, dateDebut, dateFin, limit, offset]
      );

      // Get total count
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM ecritures WHERE tiers_id = ? AND user_id = ? AND date_ecriture >= ? AND date_ecriture <= ?',
        [tiersId, userId, dateDebut, dateFin]
      );
      
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get balance report for this tiers
      const balanceReport = await this.getBalanceReport(userId, dateDebut, dateFin, tiersId);

      return {
        data: rows,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        balanceReport
      };
    } catch (error) {
      throw error;
    }
  }

  // Update ecriture
  static async update(id, updateData) {
    try {
      const allowedFields = ['tiers_id', 'date_ecriture', 'libelle', 'debit', 'credit'];
      const fields = Object.keys(updateData).filter(key => allowedFields.includes(key));
      
      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updateData[field]);
      values.push(id);

      const [result] = await pool.execute(
        `UPDATE ecritures SET ${setClause} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete ecriture
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM ecritures WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get ecriture by ID with tiers information
  static async getById(id, userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT e.*, t.nom as tiers_nom, t.type as tiers_type
         FROM ecritures e
         LEFT JOIN tiers t ON e.tiers_id = t.id
         WHERE e.id = ? AND e.user_id = ?`,
        [id, userId]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Get summary statistics for a user with date range
  static async getSummary(userId, dateDebut = null, dateFin = null) {
    try {
      let whereClause = 'user_id = ?';
      let params = [userId];

      if (dateDebut && dateFin) {
        whereClause += ' AND date_ecriture >= ? AND date_ecriture <= ?';
        params.push(dateDebut, dateFin);
      }

      const [rows] = await pool.execute(
        `SELECT 
          COUNT(*) as total_ecritures,
          SUM(debit) as total_debit,
          SUM(credit) as total_credit,
          SUM(debit - credit) as solde
         FROM ecritures 
         WHERE ${whereClause}`,
        params
      );

      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get today's statistics for Quick Stats
  static async getTodayStats(userId) {
    try {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      const [rows] = await pool.execute(
        `SELECT 
          COUNT(*) as total_transactions,
          SUM(debit) as total_income,
          SUM(credit) as total_expenses,
          SUM(debit - credit) as net_balance
         FROM ecritures 
         WHERE user_id = ? AND DATE(date_ecriture) = ?`,
        [userId, today]
      );

      const stats = rows[0];
      
      return {
        total_transactions: parseInt(stats.total_transactions) || 0,
        total_income: parseFloat(stats.total_income) || 0,
        total_expenses: parseFloat(stats.total_expenses) || 0,
        net_balance: parseFloat(stats.net_balance) || 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Get today's statistics for Quick Stats, separated by tiers type
  static async getTodayStatsByType(userId) {
    try {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      // Stats pour les clients
      const [clientRows] = await pool.execute(
        `SELECT 
          COUNT(*) as total_transactions,
          SUM(debit) as total_income,
          SUM(credit) as total_expenses,
          SUM(debit - credit) as net_balance
         FROM ecritures e
         LEFT JOIN tiers t ON e.tiers_id = t.id
         WHERE e.user_id = ? AND DATE(e.date_ecriture) = ? AND t.type = 'client'`,
        [userId, today]
      );
      // Stats pour les fournisseurs
      const [fournisseurRows] = await pool.execute(
        `SELECT 
          COUNT(*) as total_transactions,
          SUM(debit) as total_income,
          SUM(credit) as total_expenses,
          SUM(debit - credit) as net_balance
         FROM ecritures e
         LEFT JOIN tiers t ON e.tiers_id = t.id
         WHERE e.user_id = ? AND DATE(e.date_ecriture) = ? AND t.type = 'fournisseur'`,
        [userId, today]
      );
      const client = clientRows[0] || {};
      const fournisseur = fournisseurRows[0] || {};
      return {
        client: {
          total_transactions: parseInt(client.total_transactions) || 0,
          total_income: parseFloat(client.total_income) || 0,
          total_expenses: parseFloat(client.total_expenses) || 0,
          net_balance: parseFloat(client.net_balance) || 0
        },
        fournisseur: {
          total_transactions: parseInt(fournisseur.total_transactions) || 0,
          total_income: parseFloat(fournisseur.total_income) || 0,
          total_expenses: parseFloat(fournisseur.total_expenses) || 0,
          net_balance: parseFloat(fournisseur.net_balance) || 0
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get recent ecritures for dashboard (without tiers requirement)
  static async getRecentEcritures({
    userId,
    dateDebut,
    dateFin,
    page = 1,
    limit = 10,
    orderBy = 'date_ecriture',
    orderDirection = 'DESC'
  } = {}) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!dateDebut || !dateFin) {
        throw new Error('Date range (dateDebut and dateFin) is required');
      }

      // Validate pagination parameters
      page = parseInt(page);
      limit = parseInt(limit);
      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

      const offset = (page - 1) * limit;

      // Build WHERE clause - only date range and user, no tiers requirement
      const whereClauses = ['e.user_id = ?', 'e.date_ecriture >= ?', 'e.date_ecriture <= ?'];
      const params = [userId, dateDebut, dateFin];

      // Validate order by
      const validOrderColumns = ['id', 'date_ecriture', 'libelle', 'debit', 'credit', 'created_at'];
      if (!validOrderColumns.includes(orderBy)) {
        orderBy = 'date_ecriture';
      }
      const orderDirectionValid = orderDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Build the complete query with JOIN to get tiers information
      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      const query = `
        SELECT e.*, t.nom as tiers_nom, t.type as tiers_type
        FROM ecritures e
        LEFT JOIN tiers t ON e.tiers_id = t.id
        ${whereClause}
        ORDER BY e.${orderBy} ${orderDirectionValid}
        LIMIT ? OFFSET ?
      `;
      
      // Add pagination parameters
      params.push(limit, offset);

      // Execute the query
      const [rows] = await pool.execute(query, params);

      // Get total count for pagination metadata
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM ecritures e
        LEFT JOIN tiers t ON e.tiers_id = t.id
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
}

module.exports = Ecriture; 