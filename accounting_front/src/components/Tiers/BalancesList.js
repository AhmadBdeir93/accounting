import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchBalances } from '../../store/slices/tiersSlice';
import { APP_CURRENCY } from '../../api/config';
import './Tiers.css';

const BalancesList = () => {
  const dispatch = useAppDispatch();
  const { balances, balancesPagination, loading, error } = useAppSelector(state => state.tiers);

  const [type, setType] = useState(''); // '' = tous
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const debounceTimeout = useRef(null);

  // Debounce sur la recherche
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(debounceTimeout.current);
  }, [searchTerm]);

  // Charger les balances à chaque changement de filtre/page ou de recherche debouncée
  useEffect(() => {
    const params = { searchTerm: debouncedSearchTerm, page, limit };
    if (type) params.type = type;
    dispatch(fetchBalances(params));
  }, [dispatch, type, debouncedSearchTerm, page]);

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="tiers-container">
      <div className="tiers-header">
        <h2>Balances {type === '' ? 'Tous les Tiers' : type === 'client' ? 'Clients' : 'Fournisseurs'}</h2>
      </div>
      <div className="tiers-filters">
        <div className="filter-section">
          <select value={type} onChange={handleTypeChange} className="filter-btn">
            <option value="">Tous</option>
            <option value="client">Clients</option>
            <option value="fournisseur">Fournisseurs</option>
          </select>
          <input
            type="text"
            placeholder="Recherche nom, email, téléphone..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
            style={{ maxWidth: 300 }}
          />
        </div>
      </div>
      <div className="tiers-table-container">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : balances.length === 0 ? (
          <div className="no-data">Aucun résultat</div>
        ) : (
          <div className="table-responsive">
            <table className="tiers-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Solde</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((tier) => (
                  <tr key={tier.id}>
                    <td>{tier.nom}</td>
                    <td>{tier.type}</td>
                    <td>{tier.email || '-'}</td>
                    <td>{tier.telephone || '-'}</td>
                    <td style={{ fontWeight: 600, color: tier.solde > 0 ? '#27ae60' : tier.solde < 0 ? '#e74c3c' : '#7f8c8d' }}>
                      {Number(tier.solde).toLocaleString(APP_CURRENCY.locale, { style: 'currency', currency: APP_CURRENCY.code }) + ' ' + APP_CURRENCY.symbol}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Pagination */}
      <div className="pagination">
        <button
          className="btn btn-secondary"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1 || loading}
        >
          Précédent
        </button>
        <span className="pagination-info">
          Page {balancesPagination.currentPage} / {balancesPagination.totalPages}
        </span>
        <button
          className="btn btn-secondary"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= balancesPagination.totalPages || loading}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default BalancesList; 