import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ecrituresApi from '../api/ecrituresApi';
import { APP_CURRENCY } from '../api/config';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [todayStats, setTodayStats] = useState({
    client: {
      total_transactions: 0,
      total_income: 0,
      total_expenses: 0,
      net_balance: 0
    },
    fournisseur: {
      total_transactions: 0,
      total_income: 0,
      total_expenses: 0,
      net_balance: 0
    }
  });
  const [recentEcritures, setRecentEcritures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTodayStats = async () => {
      try {
        setLoading(true);
        const response = await ecrituresApi.fetchTodayStats();
        setTodayStats(response.todayStats);
        setError(null);
      } catch (err) {
        console.error('Error loading today stats:', err);
        setError('Failed to load today\'s statistics');
      } finally {
        setLoading(false);
      }
    };

    const loadRecentEcritures = async () => {
      try {
        setRecentLoading(true);
        // Récupérer les écritures des 7 derniers jours
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const response = await ecrituresApi.fetchRecentEcritures({
          dateDebut: startDate,
          dateFin: endDate,
          page: 1,
          limit: 5,
          orderBy: 'date_ecriture',
          orderDirection: 'DESC'
        });
        
        setRecentEcritures(response.data || []);
      } catch (err) {
        console.error('Error loading recent ecritures:', err);
        // Ne pas afficher d'erreur pour les écritures récentes, juste laisser vide
      } finally {
        setRecentLoading(false);
      }
    };

    loadTodayStats();
    loadRecentEcritures();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: APP_CURRENCY.code
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getAmountColor = (debit, credit) => {
    if (debit > 0) return 'income';
    if (credit > 0) return 'expense';
    return 'neutral';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to Your Dashboard</h1>
        <p>Hello, {user?.username}! This is your accounting dashboard.</p>
      </div>
      <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/tiers" className="action-button">
              Gérer les Tiers
            </Link>
            <Link to="/ecritures" className="action-button">
              Add Transaction
            </Link>
            <Link to="/balances" className="action-button">
              View balance
            </Link>
          
          </div>
        </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>Stats Clients (Aujourd'hui)</h3>
          {loading ? (
            <div className="stats-loading">Loading statistics...</div>
          ) : error ? (
            <div className="stats-error">{error}</div>
          ) : (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{todayStats.client.total_transactions}</span>
                <span className="stat-label">Total Transactions</span>
              </div>
              <div className="stat-item">
                <span className="stat-number income">{formatCurrency(todayStats.client.total_income)}</span>
                <span className="stat-label">Débit</span>
              </div>
              <div className="stat-item">
                <span className="stat-number expense">{formatCurrency(todayStats.client.total_expenses)}</span>
                <span className="stat-label">Crédit</span>
              </div>
              <div className="stat-item">
                <span className={`stat-number ${todayStats.client.net_balance >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(todayStats.client.net_balance)}</span>
                <span className="stat-label">Net Balance</span>
              </div>
            </div>
          )}
        </div>
        <div className="dashboard-card">
          <h3>Stats Fournisseurs (Aujourd'hui)</h3>
          {loading ? (
            <div className="stats-loading">Loading statistics...</div>
          ) : error ? (
            <div className="stats-error">{error}</div>
          ) : (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{todayStats.fournisseur.total_transactions}</span>
                <span className="stat-label">Total Transactions</span>
              </div>
              <div className="stat-item">
                <span className="stat-number income">{formatCurrency(todayStats.fournisseur.total_income)}</span>
                <span className="stat-label">Débit</span>
              </div>
              <div className="stat-item">
                <span className="stat-number expense">{formatCurrency(todayStats.fournisseur.total_expenses)}</span>
                <span className="stat-label">Crédit</span>
              </div>
              <div className="stat-item">
                <span className={`stat-number ${todayStats.fournisseur.net_balance >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(todayStats.fournisseur.net_balance)}</span>
                <span className="stat-label">Net Balance</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentLoading ? (
              <div className="activity-loading">Loading recent activities...</div>
            ) : recentEcritures.length > 0 ? (
              <div className="recent-activities">
                {recentEcritures.map((ecriture) => (
                  <div key={ecriture.id} className="activity-item">
                    <div className="activity-header">
                      <span className="activity-date">{formatDate(ecriture.date_ecriture)}</span>
                      <span className={`activity-amount ${getAmountColor(ecriture.debit, ecriture.credit)}`}>
                        {formatCurrency(ecriture.debit - ecriture.credit)}
                      </span>
                    </div>
                    <div className="activity-details">
                      <span className="activity-description">{ecriture.libelle}</span>
                      {ecriture.tiers_nom && (
                        <span className="activity-tiers">{ecriture.tiers_nom}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-activity">No recent activity to display.</p>
            )}
          </div>
        </div>
        
       
      </div>
    </div>
  );
};

export default Dashboard; 