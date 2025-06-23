import React, { useState, useEffect, useCallback, useRef } from 'react';
import Select from 'react-select/async';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchAllTiers } from '../../store/slices/tiersSlice';
import './TiersAutoComplete.css';

const TiersAutoComplete = ({ 
  value, 
  onChange, 
  placeholder = "Sélectionner un tiers...", 
  isRequired = false,
  isDisabled = false,
  className = "",
  error = null
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedType, setSelectedType] = useState('client'); // 'client' or 'fournisseur'
  const debounceRef = useRef(null);

  // Load tier details when value changes
  useEffect(() => {
    const loadTierDetails = async () => {
      if (!value) {
        setSelectedTier(null);
        return;
      }
      try {
        // NE PAS filtrer par type lors de la recherche par id
        const response = await dispatch(fetchAllTiers({
          id: value,
          page: 1,
          limit: 1
        })).unwrap();
        if (response.data && response.data.length > 0) {
          setSelectedTier(response.data[0]);
        } else {
          setSelectedTier(null);
        }
      } catch (error) {
        console.error('Error fetching tier details:', error);
        setSelectedTier(null);
      }
    };
    loadTierDetails();
  }, [value, dispatch]);

  // Load options for react-select async with enhanced debouncing
  const loadOptions = useCallback(async (inputValue) => {
    if (!inputValue || inputValue.length < 2) {
      return [];
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    return new Promise((resolve) => {
      debounceRef.current = setTimeout(async () => {
        try {
          setLoading(true);
          
          // Build search parameters
          const searchParams = {
            searchTerm: inputValue,
            type: selectedType,
            page: 1,
            limit: 20
          };
          
          // Search tiers with the input value
          const response = await dispatch(fetchAllTiers(searchParams)).unwrap();

          // Convert tiers to options format
          const options = response.data.map(tier => ({
            value: tier.id,
            label: `${tier.nom} (${tier.type})`,
            tier: tier
          }));

          resolve(options);
        } catch (error) {
          console.error('Error loading tiers:', error);
          resolve([]);
        } finally {
          setLoading(false);
        }
      }, 300); // 300ms debounce
    });
  }, [dispatch, selectedType]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Handle selection change
  const handleChange = useCallback((selectedOption) => {
    if (onChange) {
      onChange(selectedOption ? selectedOption.value : null, selectedOption ? selectedOption.tier : null);
    }
  }, [onChange]);

  // Handle type filter change
  const handleTypeChange = useCallback((type) => {
    setSelectedType(type);
  }, []);

  // Get current value for react-select
  const getCurrentValue = useCallback(() => {
    if (!value) return null;
    // Toujours afficher le tiers sélectionné, même si le filtre radio ne correspond pas
    if (selectedTier) {
      return {
        value: selectedTier.id,
        label: `${selectedTier.nom} (${selectedTier.type})`,
        tier: selectedTier
      };
    }
    // Fallback to ID if tier not found
    return {
      value: value,
      label: `ID: ${value}`,
      tier: null
    };
  }, [value, selectedTier]);

  // Empêche le filtre radio de masquer le tiers sélectionné
  useEffect(() => {
    if (selectedTier && selectedTier.type && selectedType !== selectedTier.type) {
      setSelectedType(selectedTier.type);
    }
  }, [selectedTier]);

  // Synchronise le filtre radio avec le type du tiers sélectionné depuis le parent (event custom)
  useEffect(() => {
    const syncType = (e) => {
      if (e.detail && e.detail.type && (e.detail.type === 'client' || e.detail.type === 'fournisseur')) {
        setSelectedType(e.detail.type);
      }
    };
    window.addEventListener('tiers-type-sync', syncType);
    return () => window.removeEventListener('tiers-type-sync', syncType);
  }, []);

  // Custom styles to match existing design
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      border: error ? '1px solid #e74c3c' : state.isFocused ? '1px solid #3498db' : '1px solid #ddd',
      borderRadius: '4px',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(52, 152, 219, 0.2)' : 'none',
      '&:hover': {
        border: error ? '1px solid #e74c3c' : '1px solid #3498db'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3498db' : state.isFocused ? '#f8f9fa' : 'white',
      color: state.isSelected ? 'white' : '#333',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3498db' : '#f8f9fa'
      }
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#6c757d'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#333'
    })
  };

  return (
    <div className={`tiers-autocomplete ${className}`}>
      {/* Type filter radio buttons */}
      <div className="tiers-type-filter">
        <label className="radio-option">
          <input
            type="radio"
            name="tierType"
            value="client"
            checked={selectedType === 'client'}
            onChange={(e) => handleTypeChange(e.target.value)}
            disabled={isDisabled}
          />
          <span className="radio-label">Clients</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name="tierType"
            value="fournisseur"
            checked={selectedType === 'fournisseur'}
            onChange={(e) => handleTypeChange(e.target.value)}
            disabled={isDisabled}
          />
          <span className="radio-label">Fournisseurs</span>
        </label>
      </div>

      <Select
        value={getCurrentValue()}
        onChange={handleChange}
        loadOptions={loadOptions}
        defaultOptions={false}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isLoading={loading}
        isClearable={!isRequired}
        isSearchable={true}
        styles={customStyles}
        noOptionsMessage={() => `Aucun ${selectedType === 'client' ? 'client' : 'fournisseur'} trouvé`}
        loadingMessage={() => "Recherche en cours..."}
        classNamePrefix="tiers-select"
        cacheOptions={false}
        debounceTimeout={300}
        menuPortalTarget={document.body}
        menuPosition="fixed"
      />
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default TiersAutoComplete; 