// Script de test pour vérifier le calcul du solde final
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Fonction pour simuler le calcul du solde final
function simulateBalanceCalculation() {
  console.log('🧮 Test de simulation du calcul de solde final\n');

  // Cas de test 1: Valeurs normales
  console.log('1️⃣ Cas de test: Valeurs normales');
  const testData1 = {
    periode: {
      total_debit: 1000,
      total_credit: 600,
      solde_periode: 400
    },
    cumul: {
      total_debit_cumul: 5000,
      total_credit_cumul: 3000,
      solde_cumul: 2000
    }
  };

  const solde_final1 = testData1.cumul.solde_cumul + testData1.periode.solde_periode;
  console.log(`   Solde cumulé: ${testData1.cumul.solde_cumul}`);
  console.log(`   Solde période: ${testData1.periode.solde_periode}`);
  console.log(`   Solde final: ${solde_final1}`);
  console.log(`   ✅ Résultat attendu: 2400`);

  // Cas de test 2: Valeurs null/undefined
  console.log('\n2️⃣ Cas de test: Valeurs null/undefined');
  const testData2 = {
    periode: {
      total_debit: null,
      total_credit: undefined,
      solde_periode: null
    },
    cumul: {
      total_debit_cumul: null,
      total_credit_cumul: undefined,
      solde_cumul: null
    }
  };

  const solde_cumul2 = parseFloat(testData2.cumul.solde_cumul) || 0;
  const solde_periode2 = parseFloat(testData2.periode.solde_periode) || 0;
  const solde_final2 = solde_cumul2 + solde_periode2;
  
  console.log(`   Solde cumulé (après conversion): ${solde_cumul2}`);
  console.log(`   Solde période (après conversion): ${solde_periode2}`);
  console.log(`   Solde final: ${solde_final2}`);
  console.log(`   ✅ Résultat attendu: 0`);

  // Cas de test 3: Valeurs string
  console.log('\n3️⃣ Cas de test: Valeurs string');
  const testData3 = {
    periode: {
      total_debit: "1000.50",
      total_credit: "600.25",
      solde_periode: "400.25"
    },
    cumul: {
      total_debit_cumul: "5000.75",
      total_credit_cumul: "3000.50",
      solde_cumul: "2000.25"
    }
  };

  const solde_cumul3 = parseFloat(testData3.cumul.solde_cumul) || 0;
  const solde_periode3 = parseFloat(testData3.periode.solde_periode) || 0;
  const solde_final3 = solde_cumul3 + solde_periode3;
  
  console.log(`   Solde cumulé (après conversion): ${solde_cumul3}`);
  console.log(`   Solde période (après conversion): ${solde_periode3}`);
  console.log(`   Solde final: ${solde_final3}`);
  console.log(`   ✅ Résultat attendu: 2400.5`);

  // Cas de test 4: Valeurs vides
  console.log('\n4️⃣ Cas de test: Valeurs vides');
  const testData4 = {
    periode: {
      total_debit: "",
      total_credit: "",
      solde_periode: ""
    },
    cumul: {
      total_debit_cumul: "",
      total_credit_cumul: "",
      solde_cumul: ""
    }
  };

  const solde_cumul4 = parseFloat(testData4.cumul.solde_cumul) || 0;
  const solde_periode4 = parseFloat(testData4.periode.solde_periode) || 0;
  const solde_final4 = solde_cumul4 + solde_periode4;
  
  console.log(`   Solde cumulé (après conversion): ${solde_cumul4}`);
  console.log(`   Solde période (après conversion): ${solde_periode4}`);
  console.log(`   Solde final: ${solde_final4}`);
  console.log(`   ✅ Résultat attendu: 0`);

  console.log('\n📋 Résumé des tests:');
  console.log('   - Toutes les valeurs doivent être converties en nombres');
  console.log('   - Les valeurs null/undefined/string vides doivent devenir 0');
  console.log('   - Le calcul final doit être: solde_cumul + solde_periode');
}

// Test de connexion à l'API
async function testApiConnection() {
  console.log('\n🔌 Test de connexion à l\'API\n');

  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Serveur connecté');
    
    // Test avec des paramètres de date
    console.log('\n📊 Test de récupération des écritures (sans auth):');
    try {
      await axios.get(`${API_BASE_URL}/ecritures?date_debut=2024-01-01&date_fin=2024-01-31`);
      console.log('❌ Devrait échouer sans authentification');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ API protégée par authentification');
      } else if (error.response?.status === 404) {
        console.log('❌ Route non trouvée');
      } else {
        console.log('❌ Erreur inattendue:', error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Serveur non connecté:', error.message);
    console.log('💡 Démarrez le serveur: cd ../accounting_api && npm start');
  }
}

// Fonction principale
async function runTests() {
  console.log('🧮 Test du calcul de solde final\n');
  
  // Test de simulation
  simulateBalanceCalculation();
  
  // Test de connexion API
  await testApiConnection();
  
  console.log('\n💡 Solutions pour éviter les NaN:');
  console.log('   1. Convertir toutes les valeurs avec parseFloat() || 0');
  console.log('   2. Vérifier que balanceReport existe avant utilisation');
  console.log('   3. Utiliser des valeurs par défaut pour les cas null/undefined');
  console.log('   4. Tester avec des données réelles après authentification');
}

runTests(); 