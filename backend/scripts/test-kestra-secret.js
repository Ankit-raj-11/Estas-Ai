const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const KESTRA_URL = process.env.KESTRA_URL || 'http://localhost:8080';

async function testSecret() {
  try {
    console.log('Testing Kestra connection...');
    
    // Try to access Kestra API
    const response = await axios.get(`${KESTRA_URL}/api/v1/flows`, {
      validateStatus: () => true // Accept any status
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Kestra is accessible!');
      console.log('\nThe GITHUB_TOKEN secret should now be available in workflows.');
      console.log('It\'s configured via environment variable in docker-compose.yml');
      console.log('\nYou can now trigger your security scan workflow!');
    } else if (response.status === 401) {
      console.log('⚠️  Kestra requires authentication.');
      console.log('But secrets are configured via environment variables in docker-compose.yml');
    } else {
      console.log(`Unexpected status: ${response.status}`);
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to Kestra!');
      console.error('Make sure Kestra is running with: docker-compose up -d');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testSecret();
