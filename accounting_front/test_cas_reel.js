// Script de test pour le cas réel
console.log('🧮 Test du cas réel avec vos données exactes\n');

// Vos données exactes
const casReel = {
  periode: {
    total_ecritures: 2,
    total_debit: 10000,
    total_credit: 0,
    solde_periode: 10000
  },
  cumul: {
    total_debit_cumul: 0,
    total_credit_cumul: 10000,
    solde_cumul: -10000
  }
};

console.log('📊 Vos données:');
console.log('   Période:');
console.log(`     - Total écritures: ${casReel.periode.total_ecritures}`);
console.log(`     - Total débit: ${casReel.periode.total_debit}€`);
console.log(`     - Total crédit: ${casReel.periode.total_credit}€`);
console.log(`     - Solde période: ${casReel.periode.solde_periode}€`);
console.log('');
console.log('   Cumul:');
console.log(`     - Total débit cumul: ${casReel.cumul.total_debit_cumul}€`);
console.log(`     - Total crédit cumul: ${casReel.cumul.total_credit_cumul}€`);
console.log(`     - Solde cumulé: ${casReel.cumul.solde_cumul}€`);

// Test 1: Calcul direct
console.log('\n1️⃣ Calcul direct:');
const solde_final_direct = casReel.cumul.solde_cumul + casReel.periode.solde_periode;
console.log(`   ${casReel.cumul.solde_cumul} + ${casReel.periode.solde_periode} = ${solde_final_direct}`);
console.log(`   ✅ Résultat attendu: 0€`);
console.log(`   ✅ Calcul correct: ${solde_final_direct === 0 ? 'OUI' : 'NON'}`);

// Test 2: Vérification du calcul du solde cumulé
console.log('\n2️⃣ Vérification du solde cumulé:');
const solde_cumul_calcule = casReel.cumul.total_debit_cumul - casReel.cumul.total_credit_cumul;
console.log(`   ${casReel.cumul.total_debit_cumul} - ${casReel.cumul.total_credit_cumul} = ${solde_cumul_calcule}`);
console.log(`   ✅ Solde cumulé correct: ${solde_cumul_calcule === casReel.cumul.solde_cumul ? 'OUI' : 'NON'}`);

// Test 3: Vérification du calcul du solde période
console.log('\n3️⃣ Vérification du solde période:');
const solde_periode_calcule = casReel.periode.total_debit - casReel.periode.total_credit;
console.log(`   ${casReel.periode.total_debit} - ${casReel.periode.total_credit} = ${solde_periode_calcule}`);
console.log(`   ✅ Solde période correct: ${solde_periode_calcule === casReel.periode.solde_periode ? 'OUI' : 'NON'}`);

// Test 4: Calcul alternatif du solde final
console.log('\n4️⃣ Calcul alternatif du solde final:');
const solde_final_alt = (casReel.cumul.total_debit_cumul - casReel.cumul.total_credit_cumul) + 
                       (casReel.periode.total_debit - casReel.periode.total_credit);
console.log(`   (${casReel.cumul.total_debit_cumul} - ${casReel.cumul.total_credit_cumul}) + (${casReel.periode.total_debit} - ${casReel.periode.total_credit}) = ${solde_final_alt}`);
console.log(`   ✅ Résultat attendu: 0€`);
console.log(`   ✅ Calcul correct: ${solde_final_alt === 0 ? 'OUI' : 'NON'}`);

// Test 5: Simulation du problème potentiel
console.log('\n5️⃣ Test avec valeurs string (comme pourrait venir de la DB):');
const casReelString = {
  periode: {
    total_debit: "10000",
    total_credit: "0",
    solde_periode: "10000"
  },
  cumul: {
    total_debit_cumul: "0",
    total_credit_cumul: "10000",
    solde_cumul: "-10000"
  }
};

const solde_cumul_string = parseFloat(casReelString.cumul.solde_cumul) || 0;
const solde_periode_string = parseFloat(casReelString.periode.solde_periode) || 0;
const solde_final_string = solde_cumul_string + solde_periode_string;

console.log(`   Solde cumulé (string): "${casReelString.cumul.solde_cumul}" -> ${solde_cumul_string}`);
console.log(`   Solde période (string): "${casReelString.periode.solde_periode}" -> ${solde_periode_string}`);
console.log(`   Solde final (string): ${solde_final_string}`);
console.log(`   ✅ Résultat attendu: 0€`);
console.log(`   ✅ Calcul correct: ${solde_final_string === 0 ? 'OUI' : 'NON'}`);

// Test 6: Test avec Number() comme dans le code corrigé
console.log('\n6️⃣ Test avec Number() (comme dans le code corrigé):');
const solde_cumul_number = Number(casReelString.cumul.solde_cumul);
const solde_periode_number = Number(casReelString.periode.solde_periode);
const solde_final_number = solde_cumul_number + solde_periode_number;

console.log(`   Solde cumulé (Number): ${solde_cumul_number}`);
console.log(`   Solde période (Number): ${solde_periode_number}`);
console.log(`   Solde final (Number): ${solde_final_number}`);
console.log(`   ✅ Résultat attendu: 0€`);
console.log(`   ✅ Calcul correct: ${solde_final_number === 0 ? 'OUI' : 'NON'}`);

console.log('\n📋 Analyse:');
console.log('   Si le calcul est correct dans tous les tests mais que vous obtenez -10 000€,');
console.log('   le problème peut venir de:');
console.log('   1. Les valeurs ne sont pas correctement transmises du back-end au front-end');
console.log('   2. Il y a un problème dans l\'affichage (formatCurrency)');
console.log('   3. Les logs du back-end montreront les vraies valeurs calculées');

console.log('\n💡 Prochaines étapes:');
console.log('   1. Vérifiez les logs du back-end après avoir fait une requête');
console.log('   2. Vérifiez les logs du front-end dans la console du navigateur');
console.log('   3. Comparez les valeurs affichées avec les valeurs calculées'); 