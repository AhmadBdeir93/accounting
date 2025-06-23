const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testApiConnection() {
  console.log('🔍 Testing API Connection...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Health check successful:', response.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('💡 Server is not running. Please start the backend server first.');
        console.log('   Run: cd ../accounting_api && npm start');
        return;
      }
    }

    // Test 2: Test ecritures route without auth
    console.log('\n2️⃣ Testing ecritures route (should require auth)...');
    try {
      await axios.post(`${API_BASE_URL}/ecritures`, {
        tiers_id: 1,
        date_ecriture: '2024-01-01',
        libelle: 'Test',
        debit: 100,
        credit: 0
      });
      console.log('❌ Should have failed without authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else if (error.response?.status === 404) {
        console.log('❌ Route not found - check if server is running and routes are mounted');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 3: Test GET ecritures route
    console.log('\n3️⃣ Testing GET ecritures route...');
    try {
      await axios.get(`${API_BASE_URL}/ecritures?date_debut=2024-01-01&date_fin=2024-12-31`);
      console.log('❌ Should have failed without authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else if (error.response?.status === 404) {
        console.log('❌ Route not found - check server configuration');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n📋 Summary:');
    console.log('   - If health check failed: Server is not running');
    console.log('   - If routes return 404: Routes are not properly mounted');
    console.log('   - If routes return 401: Routes work but need authentication');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApiConnection(); 