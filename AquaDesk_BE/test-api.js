require('dotenv').config();
const axios = require('axios');

async function testAPI() {
  try {
    // Login
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('Login successful, token:', token.substring(0, 50) + '...');

    // Test contract type filtering
    const systemsRes = await axios.get('http://localhost:3000/api/admin/contract-type/1/systems', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Systems by contract type:', JSON.stringify(systemsRes.data, null, 2));

    const servicesRes = await axios.get('http://localhost:3000/api/admin/contract-type/1/services', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Services by contract type:', JSON.stringify(servicesRes.data, null, 2));

    const itemsRes = await axios.get('http://localhost:3000/api/admin/contract-type/1/items', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Items by contract type:', JSON.stringify(itemsRes.data, null, 2));

    // Test sales master plans
    const plansRes = await axios.get('http://localhost:3000/api/sales-master-plans', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Sales master plans:', JSON.stringify(plansRes.data, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAPI();
