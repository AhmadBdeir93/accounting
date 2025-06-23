// Script de test pour le cas spécifique du solde final
console.log('🧮 Test du cas spécifique: Solde cumulé -10 000€ + Solde période 10 000€\n');

// Simulation du cas problématique
const testCase = {
  solde_cumul: -10000,
  solde_periode: 10000,
  solde_final_attendu: 0
};

console.log('📊 Données de test:');
console.log(`   Solde cumulé: ${testCase.solde_cumul}€`);
console.log(`   Solde période: ${testCase.solde_periode}€`);
console.log(`   Solde final attendu: ${testCase.solde_final_attendu}€`);

// Test 1: Calcul direct
console.log('\n1️⃣ Test de calcul direct:');
const solde_final_direct = testCase.solde_cumul + testCase.solde_periode;
console.log(`   ${testCase.solde_cumul} + ${testCase.solde_periode} = ${solde_final_direct}`);
console.log(`   ✅ Résultat: ${solde_final_direct === testCase.solde_final_attendu ? 'CORRECT' : 'ERREUR'}`);

// Test 2: Simulation des valeurs du back-end
console.log('\n2️⃣ Test avec valeurs du back-end:');
const balanceReport = {
  cumul: {
    solde_cumul: -10000
  },
  periode: {
    solde_periode: 10000
  }
};

const solde_final_backend = balanceReport.cumul.solde_cumul + balanceReport.periode.solde_periode;
console.log(`   Back-end: ${balanceReport.cumul.solde_cumul} + ${balanceReport.periode.solde_periode} = ${solde_final_backend}`);
console.log(`   ✅ Résultat: ${solde_final_backend === testCase.solde_final_attendu ? 'CORRECT' : 'ERREUR'}`);

// Test 3: Test avec parseFloat (comme dans le code)
console.log('\n3️⃣ Test avec parseFloat:');
const solde_cumul_parsed = parseFloat(balanceReport.cumul.solde_cumul) || 0;
const solde_periode_parsed = parseFloat(balanceReport.periode.solde_periode) || 0;
const solde_final_parsed = solde_cumul_parsed + solde_periode_parsed;

console.log(`   Solde cumulé (parsed): ${solde_cumul_parsed}`);
console.log(`   Solde période (parsed): ${solde_periode_parsed}`);
console.log(`   Solde final (parsed): ${solde_final_parsed}`);
console.log(`   ✅ Résultat: ${solde_final_parsed === testCase.solde_final_attendu ? 'CORRECT' : 'ERREUR'}`);

// Test 4: Test avec des valeurs string (comme pourrait venir de la DB)
console.log('\n4️⃣ Test avec valeurs string:');
const balanceReportString = {
  cumul: {
    solde_cumul: "-10000"
  },
  periode: {
    solde_periode: "10000"
  }
};

const solde_cumul_string = parseFloat(balanceReportString.cumul.solde_cumul) || 0;
const solde_periode_string = parseFloat(balanceReportString.periode.solde_periode) || 0;
const solde_final_string = solde_cumul_string + solde_periode_string;

console.log(`   Solde cumulé (string): "${balanceReportString.cumul.solde_cumul}" -> ${solde_cumul_string}`);
console.log(`   Solde période (string): "${balanceReportString.periode.solde_periode}" -> ${solde_periode_string}`);
console.log(`   Solde final (string): ${solde_final_string}`);
console.log(`   ✅ Résultat: ${solde_final_string === testCase.solde_final_attendu ? 'CORRECT' : 'ERREUR'}`);

// Test 5: Vérification de la fonction formatCurrency
console.log('\n5️⃣ Test de la fonction formatCurrency:');
function formatCurrency(amount) {
  const numAmount = parseFloat(amount) || 0;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(numAmount);
}

console.log(`   formatCurrency(-10000): ${formatCurrency(-10000)}`);
console.log(`   formatCurrency(10000): ${formatCurrency(10000)}`);
console.log(`   formatCurrency(0): ${formatCurrency(0)}`);
console.log(`   formatCurrency("0"): ${formatCurrency("0")}`);
console.log(`   formatCurrency(null): ${formatCurrency(null)}`);
console.log(`   formatCurrency(undefined): ${formatCurrency(undefined)}`);

console.log('\n📋 Analyse du problème:');
console.log('   Si vous obtenez -10 000€ au lieu de 0€, cela peut venir de:');
console.log('   1. Le back-end ne calcule pas correctement le solde_final');
console.log('   2. Le front-end reçoit des valeurs incorrectes');
console.log('   3. Les valeurs ne sont pas correctement converties en nombres');
console.log('   4. Il y a un problème dans l\'affichage (formatCurrency)');

console.log('\n💡 Solutions:');
console.log('   1. Vérifiez les logs du back-end pour voir les valeurs calculées');
console.log('   2. Vérifiez les logs du front-end pour voir les valeurs reçues');
console.log('   3. Assurez-vous que toutes les valeurs sont des nombres');
console.log('   4. Testez avec des données réelles après authentification'); 