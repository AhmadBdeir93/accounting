import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useDebounce } from '../../hooks/useDebounce';
import { 
  fetchAllTiers, 
  deleteTier,
  setFilters,
  clearFilters,
  setPagination,
  clearError
} from '../../store/slices/tiersSlice';
import TiersForm from './TiersForm';
import './Tiers.css';

const TiersList = () => {
  const dispatch = useAppDispatch();
  
  // Sélecteurs optimisés pour éviter les re-renders
  const tiers = useAppSelector(state => state.tiers.tiers);
  const loading = useAppSelector(state => state.tiers.loading);
  const error = useAppSelector(state => state.tiers.error);
  const filters = useAppSelector(state => state.tiers.filters);
  const pagination = useAppSelector(state => state.tiers.pagination);
  
  const [showForm, setShowForm] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Fonction loadTiers mémorisée avec useCallback
  const loadTiers = useCallback(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
    };

    // Ajouter les filtres si présents
    if (filters.type) {
      params.type = filters.type;
    }
    if (searchTerm.trim()) {
      params.searchTerm = searchTerm.trim();
    }

    dispatch(fetchAllTiers(params));
  }, [dispatch, pagination.page, pagination.limit, filters.type, searchTerm]);

  useEffect(() => {
    loadTiers();
  }, [loadTiers]);

  // Fonction de recherche avec debounce
  const handleSearchChange = useCallback((searchValue) => {
    setSearchTerm(searchValue);
    dispatch(setPagination({ page: 1 }));
  }, [dispatch]);

  const { debouncedCallback: debouncedSearch, cancelDebounce } = useDebounce(handleSearchChange, 500);

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Annuler le debounce et rechercher immédiatement
    cancelDebounce();
    handleSearchChange(searchTerm);
  };

  const handleFilterByType = useCallback((type) => {
    setSelectedType(type);
    dispatch(setFilters({ type }));
    dispatch(setPagination({ page: 1 }));
  }, [dispatch]);

  const handleClearFilters = useCallback(() => {
    setSelectedType('');
    setSearchTerm('');
    // Annuler le timeout de recherche
    cancelDebounce();
    dispatch(clearFilters());
    dispatch(setPagination({ page: 1 }));
  }, [dispatch, cancelDebounce]);

  const handleEdit = useCallback((tier) => {
    setEditingTier(tier);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce tiers ?')) {
      await dispatch(deleteTier(id));
      loadTiers();
    }
  }, [dispatch, loadTiers]);

  const handleFormClose = useCallback(() => {
    setShowForm(false);
    setEditingTier(null);
  }, []);

  const handleFormSubmit = useCallback(() => {
    handleFormClose();
    loadTiers();
  }, [handleFormClose, loadTiers]);

  const handlePageChange = useCallback((newPage) => {
    dispatch(setPagination({ page: newPage }));
  }, [dispatch]);

  if (error) {
    return (
      <div className="tiers-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => dispatch(clearError())}>Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tiers-container">
      <div className="tiers-header">
        <h2>Gestion des Tiers</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Nouveau Tiers
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="tiers-filters">
        <div className="search-section">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Rechercher un tiers..."
              defaultValue={searchTerm}
              onChange={handleSearchInputChange}
              className="search-input"
            />
            <button type="submit" className="btn btn-secondary">
              Rechercher
            </button>
          </form>
        </div>

        <div className="filter-section">
          <button
            className={`filter-btn ${selectedType === '' ? 'active' : ''}`}
            onClick={() => handleFilterByType('')}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${selectedType === 'client' ? 'active' : ''}`}
            onClick={() => handleFilterByType('client')}
          >
            Clients
          </button>
          <button
            className={`filter-btn ${selectedType === 'fournisseur' ? 'active' : ''}`}
            onClick={() => handleFilterByType('fournisseur')}
          >
            Fournisseurs
          </button>
          <button
            className="clear-filters-btn"
            onClick={handleClearFilters}
          >
            Effacer les filtres
          </button>
        </div>
      </div>

      {/* Tableau des tiers */}
      <div className="tiers-table-container">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : tiers.length === 0 ? (
          <div className="no-data">Aucun tiers trouvé</div>
        ) : (
          <div className="table-responsive">
            <table className="tiers-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier) => (
                  <tr key={tier.id} className="tier-row">
                    <td className="tier-name">
                      <strong>{tier.nom}</strong>
                    </td>
                    <td>
                      <span className={`tier-type ${tier.type}`}>
                        {tier.type === 'client' ? 'Client' : 'Fournisseur'}
                      </span>
                    </td>
                    <td>{tier.email || '-'}</td>
                    <td>{tier.telephone || '-'}</td>
                    <td className="tier-actions">
                      <button
                        className="btn btn-edit btn-sm"
                        onClick={() => handleEdit(tier)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-delete btn-sm"
                        onClick={() => handleDelete(tier.id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={!pagination.hasPreviousPage}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            Précédent
          </button>
          <span className="page-info">
            Page {pagination.currentPage} sur {pagination.totalPages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={!pagination.hasNextPage}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Suivant
          </button>
        </div>
      )}

      {/* Modal du formulaire */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <TiersForm
              tier={editingTier}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TiersList; 