import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { createTier, updateTier, clearError } from '../../store/slices/tiersSlice';
import './Tiers.css';

const TiersForm = ({ tier, onSubmit, onCancel }) => {
  const dispatch = useAppDispatch();
  
  // Sélecteurs optimisés
  const loading = useAppSelector(state => state.tiers.loading);
  const error = useAppSelector(state => state.tiers.error);
  
  const [formData, setFormData] = useState({
    nom: '',
    type: 'client',
    email: '',
    telephone: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tier) {
      setFormData({
        nom: tier.nom || '',
        type: tier.type || 'client',
        email: tier.email || '',
        telephone: tier.telephone || ''
      });
    }
  }, [tier]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }

    if (!formData.type) {
      newErrors.type = 'Le type est obligatoire';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (formData.telephone && !isValidPhone(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (tier) {
        // Mise à jour
        await dispatch(updateTier({ id: tier.id, tierData: formData })).unwrap();
      } else {
        // Création
        await dispatch(createTier(formData)).unwrap();
      }
      
      onSubmit();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }, [dispatch, tier, formData, validateForm, onSubmit]);

  const handleCancel = useCallback(() => {
    dispatch(clearError());
    onCancel();
  }, [dispatch, onCancel]);

  return (
    <div className="tiers-form-container">
      <div className="form-header">
        <h3>{tier ? 'Modifier le tiers' : 'Nouveau tiers'}</h3>
        <button className="close-btn" onClick={handleCancel}>
          ×
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="tiers-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nom">Nom *</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              className={errors.nom ? 'error' : ''}
              placeholder="Nom du tiers"
            />
            {errors.nom && <span className="error-text">{errors.nom}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={errors.type ? 'error' : ''}
            >
              <option value="client">Client</option>
              <option value="fournisseur">Fournisseur</option>
            </select>
            {errors.type && <span className="error-text">{errors.type}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="email@exemple.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="telephone">Téléphone</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              className={errors.telephone ? 'error' : ''}
              placeholder="01 23 45 67 89"
            />
            {errors.telephone && <span className="error-text">{errors.telephone}</span>}
          </div>
        </div>

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
            {loading ? 'Enregistrement...' : (tier ? 'Modifier' : 'Créer')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TiersForm; 