import React, { useState, useCallback, useMemo } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { setCurrentEcriture, deleteEcriture } from '../../store/slices/ecrituresSlice';
import EcrituresList from './EcrituresList';
import EcrituresForm from './EcrituresForm';
import './Ecritures.css';

const Ecritures = () => {
  const dispatch = useAppDispatch();
  const { currentEcriture } = useAppSelector(state => state.ecritures);
  
  const [showForm, setShowForm] = useState(false);

  const handleAddEcriture = useCallback(() => {
    dispatch(setCurrentEcriture(null));
    setShowForm(true);
  }, [dispatch]);

  const handleEditEcriture = useCallback((ecriture) => {
    dispatch(setCurrentEcriture(ecriture));
    setShowForm(true);
  }, [dispatch]);

  const handleDeleteEcriture = useCallback(async (ecriture) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'écriture "${ecriture.libelle}" ?`)) {
      try {
        await dispatch(deleteEcriture(ecriture.id)).unwrap();
      } catch (error) {
        console.error('Error deleting ecriture:', error);
      }
    }
  }, [dispatch]);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
  }, []);

  // Memoize the handlers to prevent unnecessary re-renders
  const handlers = useMemo(() => ({
    onEdit: handleEditEcriture,
    onDelete: handleDeleteEcriture
  }), [handleEditEcriture, handleDeleteEcriture]);

  return (
    <div className="ecritures-page">
      <div className="page-header">
        <h1>Gestion des Écritures Comptables</h1>
        <button className="btn btn-primary" onClick={handleAddEcriture}>
          + Nouvelle écriture
        </button>
      </div>

      <EcrituresList 
        onEdit={handlers.onEdit}
        onDelete={handlers.onDelete}
      />

      {showForm && (
        <EcrituresForm 
          onClose={handleCloseForm}
          editingEcriture={currentEcriture}
        />
      )}
    </div>
  );
};

export default Ecritures; 