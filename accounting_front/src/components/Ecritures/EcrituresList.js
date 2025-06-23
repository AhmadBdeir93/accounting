import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchEcritures, setFilters, clearFilters } from '../../store/slices/ecrituresSlice';
import TiersAutoComplete from '../common/TiersAutoComplete';
import './Ecritures.css';
import { APP_CURRENCY } from '../../api/config';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EcrituresList = ({ onEdit, onDelete }) => {
  const dispatch = useAppDispatch();
  const { ecritures, loading, error, pagination, balanceReport } = useAppSelector(state => state.ecritures);

  // Local state for form inputs
  const [dateDebut, setDateDebut] = useState(() => {
    // Date de début : il y a un mois
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [dateFin, setDateFin] = useState(() => {
    // Date de fin : aujourd'hui
    return new Date().toISOString().split('T')[0];
  });
  const [selectedTiersId, setSelectedTiersId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search term using useMemo and setTimeout
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch ecritures when filters change
  useEffect(() => {
    if (dateDebut && dateFin && selectedTiersId) {
      const params = {
        dateDebut,
        dateFin,
        tiersId: selectedTiersId,
        searchTerm: debouncedSearchTerm || null
      };

      dispatch(fetchEcritures(params));
    }
  }, [dispatch, dateDebut, dateFin, selectedTiersId, debouncedSearchTerm]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleTiersChange = useCallback((tiersId, tierData) => {
    setSelectedTiersId(tiersId);
  }, []);

  const handleClearFilters = useCallback(() => {
    setDateDebut('');
    setDateFin('');
    setSelectedTiersId('');
    setSearchTerm('');
    dispatch(clearFilters());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    // Convertir en nombre et gérer les valeurs null/undefined
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: APP_CURRENCY.code
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getSoldeColor = (solde) => {
    const numSolde = parseFloat(solde) || 0;
    if (numSolde > 0) return 'positive';
    if (numSolde < 0) return 'negative';
    return 'neutral';
  };

  // Calculate cumulative balance for the table
  const ecrituresWithCumulativeBalance = useMemo(() => {
    if (!ecritures.length || !balanceReport) return ecritures;

    // Start with the cumulative balance from the report (convert to number safely)
    let runningBalance = parseFloat(balanceReport.cumul.solde_cumul) || 0;
    
    return ecritures.map(ecriture => {
      const ecritureSolde = (parseFloat(ecriture.debit) || 0) - (parseFloat(ecriture.credit) || 0);
      runningBalance += ecritureSolde;
      
      return {
        ...ecriture,
        solde_cumulatif: runningBalance
      };
    });
  }, [ecritures, balanceReport]);

  // Impression du tableau
  const handlePrint = () => {
    // Ajoute dynamiquement une entête temporaire pour l'impression
    const printHeaderId = 'print-balance-header';
    let header = document.getElementById(printHeaderId);
    if (header) header.remove();
    if (balanceReport && balanceReport.periode && balanceReport.cumul) {
      header = document.createElement('div');
      header.id = printHeaderId;
      header.style = 'margin-bottom: 20px;';
      header.innerHTML = `
        <h2 style='margin:0 0 10px 0;'>Rapport de Solde</h2>
        <div style='font-size:13px;'>
          <div><strong>Période :</strong> ${formatDate(balanceReport.periode.date_debut)} - ${formatDate(balanceReport.periode.date_fin)}</div>
          <div><strong>Total écritures :</strong> ${balanceReport.periode.total_ecritures || 0}</div>
          <div><strong>Total débit :</strong> ${formatCurrency(balanceReport.periode.total_debit)}</div>
          <div><strong>Total crédit :</strong> ${formatCurrency(balanceReport.periode.total_credit)}</div>
          <div><strong>Solde période :</strong> ${formatCurrency(balanceReport.periode.solde_periode)}</div>
          <div><strong>Total débit cumul :</strong> ${formatCurrency(balanceReport.cumul.total_debit_cumul)}</div>
          <div><strong>Total crédit cumul :</strong> ${formatCurrency(balanceReport.cumul.total_credit_cumul)}</div>
          <div><strong>Solde cumulé :</strong> ${formatCurrency(balanceReport.cumul.solde_cumul)}</div>
          <div><strong>Solde final :</strong> ${formatCurrency(balanceReport.solde_final)}</div>
        </div>
      `;
      const tableContainer = document.querySelector('.ecritures-table-container');
      if (tableContainer && tableContainer.parentNode) {
        tableContainer.parentNode.insertBefore(header, tableContainer);
      }
    }
    window.print();
    // Nettoyage après impression
    setTimeout(() => {
      const header = document.getElementById(printHeaderId);
      if (header) header.remove();
    }, 500);
  };

  // Export Excel
  const handleExportExcel = () => {
    const wsData = [
      [
        'Date',
        'Tiers',
        'Libellé',
        'Débit',
        'Crédit',
        'Solde Cumulatif'
      ],
      ...ecrituresWithCumulativeBalance.map(ecriture => [
        formatDate(ecriture.date_ecriture),
        ecriture.tiers_nom || '',
        ecriture.libelle,
        ecriture.debit > 0 ? ecriture.debit : '',
        ecriture.credit > 0 ? ecriture.credit : '',
        ecriture.solde_cumulatif
      ])
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Ecritures');
    XLSX.writeFile(wb, 'ecritures.xlsx');
  };

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    // Ajout de l'entête rapport de solde
    let y = 14;
    doc.setFontSize(14);
    doc.text('Rapport de Solde', 14, y);
    doc.setFontSize(10);
    y += 8;
    if (balanceReport && balanceReport.periode && balanceReport.cumul) {
      doc.text(`Période : ${formatDate(balanceReport.periode.date_debut)} - ${formatDate(balanceReport.periode.date_fin)}`, 14, y); y += 6;
      doc.text(`Total écritures : ${balanceReport.periode.total_ecritures || 0}`, 14, y); y += 6;
      doc.text(`Total débit : ${formatCurrency(balanceReport.periode.total_debit)}`, 14, y); y += 6;
      doc.text(`Total crédit : ${formatCurrency(balanceReport.periode.total_credit)}`, 14, y); y += 6;
      doc.text(`Solde période : ${formatCurrency(balanceReport.periode.solde_periode)}`, 14, y); y += 6;
      doc.text(`Total débit cumul : ${formatCurrency(balanceReport.cumul.total_debit_cumul)}`, 14, y); y += 6;
      doc.text(`Total crédit cumul : ${formatCurrency(balanceReport.cumul.total_credit_cumul)}`, 14, y); y += 6;
      doc.text(`Solde cumulé : ${formatCurrency(balanceReport.cumul.solde_cumul)}`, 14, y); y += 6;
      doc.text(`Solde final : ${formatCurrency(balanceReport.solde_final)}`, 14, y); y += 8;
    }
    doc.setFontSize(12);
    doc.text('Liste des Écritures', 14, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [[
        'Date',
        'Tiers',
        'Libellé',
        'Débit',
        'Crédit',
        'Solde Cumulatif'
      ]],
      body: ecrituresWithCumulativeBalance.map(ecriture => [
        formatDate(ecriture.date_ecriture),
        ecriture.tiers_nom || '',
        ecriture.libelle,
        ecriture.debit > 0 ? ecriture.debit : '',
        ecriture.credit > 0 ? ecriture.credit : '',
        ecriture.solde_cumulatif
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [102, 126, 234] }
    });
    doc.save('ecritures.pdf');
  };

  if (!selectedTiersId) {
    return (
      <div className="ecritures-container">
        <div className="ecritures-header">
          <h2>Écritures Comptables</h2>
          <p className="tiers-required">Veuillez sélectionner un tiers pour afficher les écritures</p>
        </div>
        
        <div className="date-selector">
          <div className="date-input-group">
            <label htmlFor="dateDebut">Date de début :</label>
            <input
              type="date"
              id="dateDebut"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              required
            />
          </div>
          
          <div className="date-input-group">
            <label htmlFor="dateFin">Date de fin :</label>
            <input
              type="date"
              id="dateFin"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="tiersFilter">Sélectionner un tiers (obligatoire) :</label>
            <TiersAutoComplete
              value={selectedTiersId}
              onChange={handleTiersChange}
              placeholder="Choisir un tiers"
              isRequired={true}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ecritures-container">
      <div className="ecritures-header">
        <h2>Écritures Comptables</h2>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleClearFilters}>
            Effacer les filtres
          </button>
          <button className="btn btn-primary" onClick={handlePrint} title="Imprimer la liste">
            🖨️ Imprimer
          </button>
          <button className="btn btn-primary" onClick={handleExportExcel} title="Exporter en Excel">
            📥 Excel
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF} title="Exporter en PDF">
            📄 PDF
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="date-selector">
        <div className="date-input-group">
          <label htmlFor="dateDebut">Date de début :</label>
          <input
            type="date"
            id="dateDebut"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            required
          />
        </div>
        
        <div className="date-input-group">
          <label htmlFor="dateFin">Date de fin :</label>
          <input
            type="date"
            id="dateFin"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Balance Report */}
      {balanceReport && balanceReport.periode && balanceReport.cumul && (
        <div className="balance-report">
          <h3>Rapport de Solde</h3>
          
          {/* Debug info - à retirer après correction */}
          {console.log('🔍 DEBUG - Front-end Balance Report:', {
            solde_cumul: balanceReport.cumul.solde_cumul,
            solde_periode: balanceReport.periode.solde_periode,
            solde_final: balanceReport.solde_final,
            type_solde_cumul: typeof balanceReport.cumul.solde_cumul,
            type_solde_periode: typeof balanceReport.periode.solde_periode,
            type_solde_final: typeof balanceReport.solde_final
          })}
          
          <div className="balance-grid">
            <div className="balance-card">
              <h4>Période ({formatDate(balanceReport.periode.date_debut)} - {formatDate(balanceReport.periode.date_fin)})</h4>
              <div className="balance-details">
                <p><strong>Total écritures :</strong> {balanceReport.periode.total_ecritures || 0}</p>
                <p><strong>Total débit :</strong> {formatCurrency(balanceReport.periode.total_debit)}</p>
                <p><strong>Total crédit :</strong> {formatCurrency(balanceReport.periode.total_credit)}</p>
                <p className={`solde ${getSoldeColor(balanceReport.periode.solde_periode)}`}>
                  <strong>Solde période :</strong> {formatCurrency(balanceReport.periode.solde_periode)}
                </p>
              </div>
            </div>
            
            <div className="balance-card">
              <h4>Cumul jusqu'au {formatDate(balanceReport.periode.date_debut)}</h4>
              <div className="balance-details">
                <p><strong>Total débit cumul :</strong> {formatCurrency(balanceReport.cumul.total_debit_cumul)}</p>
                <p><strong>Total crédit cumul :</strong> {formatCurrency(balanceReport.cumul.total_credit_cumul)}</p>
                <p className={`solde ${getSoldeColor(balanceReport.cumul.solde_cumul)}`}>
                  <strong>Solde cumulé :</strong> {formatCurrency(balanceReport.cumul.solde_cumul)}
                </p>
              </div>
            </div>
            
            <div className="balance-card final">
              <h4>Solde Final</h4>
              <div className="balance-details">
                <p className={`solde-final ${getSoldeColor(balanceReport.solde_final)}`}>
                  <strong>{formatCurrency(balanceReport.solde_final)}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="tiersFilter">Tiers (obligatoire) :</label>
          <TiersAutoComplete
            value={selectedTiersId}
            onChange={handleTiersChange}
            placeholder="Choisir un tiers"
            isRequired={true}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="searchInput">Rechercher :</label>
          <input
            type="text"
            id="searchInput"
            placeholder="Rechercher dans les libellés..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-message">
          <p>Chargement des écritures...</p>
        </div>
      )}

      {/* Ecritures Table */}
      {!loading && ecrituresWithCumulativeBalance.length > 0 && (
        <div className="ecritures-table-container">
          <table className="ecritures-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Tiers</th>
                <th>Libellé</th>
                <th>Débit</th>
                <th>Crédit</th>
                <th>Solde Cumulatif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ecrituresWithCumulativeBalance.map(ecriture => (
                <tr key={ecriture.id}>
                  <td>{formatDate(ecriture.date_ecriture)}</td>
                  <td>
                    {ecriture.tiers_nom ? (
                      <span className={`tiers-badge ${ecriture.tiers_type}`}>
                        {ecriture.tiers_nom}
                      </span>
                    ) : (
                      <span className="no-tiers">Aucun tiers</span>
                    )}
                  </td>
                  <td>{ecriture.libelle}</td>
                  <td className="amount debit">
                    {ecriture.debit > 0 ? formatCurrency(ecriture.debit) : '-'}
                  </td>
                  <td className="amount credit">
                    {ecriture.credit > 0 ? formatCurrency(ecriture.credit) : '-'}
                  </td>
                  <td className={`amount solde ${getSoldeColor(ecriture.solde_cumulatif)}`}>
                    {formatCurrency(ecriture.solde_cumulatif)}
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() => onEdit(ecriture)}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => onDelete(ecriture)}
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

      {/* No Results */}
      {!loading && ecrituresWithCumulativeBalance.length === 0 && (
        <div className="no-results">
          <p>Aucune écriture trouvée pour cette période.</p>
        </div>
      )}
    </div>
  );
};

export default EcrituresList; 