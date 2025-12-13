const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const KESTRA_URL = process.env.KESTRA_URL || 'http://localhost:8080';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const NAMESPACE = process.env.KESTRA_NAMESPACE || 'company.team';

/**
 * Adds a secret to Kestra
 */
async function addSecret(key, value, namespace = null) {
  try {
    const url = namespace 
      ? `${KESTRA_URL}/api/v1/namespaces/${namespace}/secrets/${key}`
      : `${KESTRA_URL}/api/v1/secrets/${key}`;
    
    console.log(`Adding secret: ${key} to ${namespace || 'global'}...`);
    
    const response = await axios.put(
      url,
      value,
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    );
    
    console.log(`✅ Secret '${key}' added successfully!`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to add secret '${key}':`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔐 Setting up Kestra secrets...\n');
  
  // Validate environment variables
  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN not found in .env file!');
    console.error('Please add your GitHub token to the .env file first.');
    process.exit(1);
  }
  
  try {
    // Test Kestra connection
    console.log(`Testing connection to Kestra at ${KESTRA_URL}...`);
    await axios.get(`${KESTRA_URL}/api/v1/health`);
    console.log('✅ Kestra is running!\n');
    
    // Add GITHUB_TOKEN secret
    await addSecret('GITHUB_TOKEN', GITHUB_TOKEN, NAMESPACE);
    
    console.log('\n✅ All secrets configured successfully!');
    console.log('\nYou can now run your security scan workflow.');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Cannot connect to Kestra!');
      console.error(`Make sure Kestra is running at ${KESTRA_URL}`);
      console.error('\nStart Kestra with:');
      console.error('  docker run -p 8080:8080 kestra/kestra:latest server local');
    }
    process.exit(1);
  }
}

main();
