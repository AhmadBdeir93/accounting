import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { createEcriture, updateEcriture, clearCurrentEcriture } from '../../store/slices/ecrituresSlice';
import TiersAutoComplete from '../common/TiersAutoComplete';
import './Ecritures.css';
import { APP_CURRENCY } from '../../api/config';

const EcrituresForm = ({ onClose, editingEcriture = null }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.ecritures);

  // Form state
  const [formData, setFormData] = useState({
    tiers_id: '',
    date_ecriture: '',
    libelle: '',
    debit: '',
    credit: ''
  });

  const [errors, setErrors] = useState({});

  // Check authentication
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  const libelleInputRef = useRef(null);

  // Initialize form with editing data
  useEffect(() => {
    if (editingEcriture) {
      setFormData({
        tiers_id: editingEcriture.tiers_id || '',
        date_ecriture: editingEcriture.date_ecriture ? editingEcriture.date_ecriture.split('T')[0] : '',
        libelle: editingEcriture.libelle || '',
        debit: editingEcriture.debit || '',
        credit: editingEcriture.credit || ''
      });
    } else {
      setFormData(prev => ({
        ...prev,
        date_ecriture: new Date().toISOString().split('T')[0]
      }));
    }
  }, [editingEcriture]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Exclusivité Débit/Crédit
      if (name === 'debit') {
        return {
          ...prev,
          debit: value,
          credit: value && parseFloat(value) > 0 ? '' : prev.credit
        };
      } else if (name === 'credit') {
        return {
          ...prev,
          credit: value,
          debit: value && parseFloat(value) > 0 ? '' : prev.debit
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleTiersChange = useCallback((tiersId, tierData) => {
    setFormData(prev => ({
      ...prev,
      tiers_id: tiersId
    }));

    // Synchronise le filtre radio avec le type du tiers sélectionné
    if (tierData && tierData.type && typeof window !== 'undefined') {
      // On va déclencher un event custom pour informer le composant enfant
      const event = new CustomEvent('tiers-type-sync', { detail: { type: tierData.type } });
      window.dispatchEvent(event);
    }

    // Effacer l'erreur du tiers
    if (errors.tiers_id) {
      setErrors(prev => ({
        ...prev,
        tiers_id: ''
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Check authentication
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour créer une écriture');
      return;
    }

    // Validation
    if (!formData.tiers_id) {
      alert('Veuillez sélectionner un tiers');
      return;
    }

    if (!formData.date_ecriture) {
      alert('Veuillez sélectionner une date');
      return;
    }

    if (!formData.libelle.trim()) {
      alert('Veuillez saisir un libellé');
      return;
    }

    const debit = parseFloat(formData.debit) || 0;
    const credit = parseFloat(formData.credit) || 0;

    if ((debit > 0 && credit > 0) || (debit === 0 && credit === 0)) {
      alert('Veuillez saisir soit un montant en débit, soit en crédit, mais pas les deux.');
      return;
    }

    try {
      const ecritureData = {
        tiers_id: parseInt(formData.tiers_id),
        date_ecriture: formData.date_ecriture,
        libelle: formData.libelle.trim(),
        debit,
        credit
      };

      if (editingEcriture) {
        await dispatch(updateEcriture({ id: editingEcriture.id, ecritureData })).unwrap();
        dispatch(clearCurrentEcriture());
        onClose();
      } else {
        const lastTiersId = formData.tiers_id;
        await dispatch(createEcriture(ecritureData)).unwrap();
        // Reset le formulaire après création, mais garder le tiers sélectionné
        setFormData({
          tiers_id: lastTiersId,
          date_ecriture: new Date().toISOString().split('T')[0],
          libelle: '',
          debit: '',
          credit: ''
        });
        // Focus sur le champ libellé
        setTimeout(() => {
          if (libelleInputRef.current) libelleInputRef.current.focus();
        }, 0);
        dispatch(clearCurrentEcriture());
      }
    } catch (error) {
      console.error('Error saving ecriture:', error);
      
      // Provide more specific error messages
      if (error.includes('Route not found')) {
        alert('Erreur de connexion au serveur. Vérifiez que le serveur back-end est démarré.');
      } else if (error.includes('401')) {
        alert('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        alert(`Erreur lors de la sauvegarde: ${error}`);
      }
    }
  }, [dispatch, formData, editingEcriture, isAuthenticated, onClose]);

  const handleCancel = useCallback(() => {
    dispatch(clearCurrentEcriture());
    onClose();
  }, [dispatch, onClose]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(APP_CURRENCY.locale, {
      style: 'currency',
      currency: APP_CURRENCY.code
    }).format(amount) + ' ' + APP_CURRENCY.symbol;
  };

  // Show authentication warning
  if (!isAuthenticated) {
    return (
      <div className="ecritures-form-overlay">
        <div className="ecritures-form-container">
          <div className="form-header">
            <h3>Authentification requise</h3>
            <button className="close-btn" onClick={handleCancel}>
              ×
            </button>
          </div>
          <div className="error-message">
            <p>Vous devez être connecté pour créer ou modifier des écritures.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.href = '/login'}
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ecritures-form-overlay">
      <div className="ecritures-form-container">
        <div className="form-header">
          <h3>{editingEcriture ? 'Modifier l\'écriture' : 'Nouvelle écriture'}</h3>
          <button className="close-btn" onClick={handleCancel}>
            ×
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="ecritures-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date_ecriture" style={{ minWidth: 90 }}>Date *</label>
              <input
                type="date"
                id="date_ecriture"
                name="date_ecriture"
                value={formData.date_ecriture}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="tiers_id" style={{ minWidth: 90 }}>Tiers *</label>
              <TiersAutoComplete
                id="tiers_id"
                name="tiers_id"
                value={formData.tiers_id ? String(formData.tiers_id) : ''}
                onChange={handleTiersChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="libelle" style={{ minWidth: 90 }}>Libellé *</label>
            <input
              type="text"
              id="libelle"
              name="libelle"
              value={formData.libelle}
              onChange={handleInputChange}
              placeholder="Description de l'écriture"
              required
              ref={libelleInputRef}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="debit">Débit</label>
              <input
                type="number"
                id="debit"
                name="debit"
                value={formData.debit}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="credit">Crédit</label>
              <input
                type="number"
                id="credit"
                name="credit"
                value={formData.credit}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Preview of the entry */}
          {(formData.debit > 0 || formData.credit > 0) && (
            <div className="entry-preview">
              <h4>Aperçu de l'écriture :</h4>
              <div className="preview-details">
                <p><strong>Date :</strong> {formData.date_ecriture}</p>
                <p><strong>Tiers :</strong> {formData.tiers_id ? `ID: ${formData.tiers_id}` : 'Non sélectionné'}</p>
                <p><strong>Libellé :</strong> {formData.libelle}</p>
                <p><strong>Débit :</strong> {formData.debit > 0 ? formatCurrency(formData.debit) : '-'}</p>
                <p><strong>Crédit :</strong> {formData.credit > 0 ? formatCurrency(formData.credit) : '-'}</p>
                <p className={`solde ${parseFloat(formData.debit) - parseFloat(formData.credit) > 0 ? 'positive' : 'negative'}`}>
                  <strong>Solde :</strong> {formatCurrency(parseFloat(formData.debit) - parseFloat(formData.credit))}
                </p>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : (editingEcriture ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EcrituresForm; 