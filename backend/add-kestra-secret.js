#!/usr/bin/env node

/**
 * Add GitHub Token to Kestra Secrets
 * This script adds the GITHUB_TOKEN from .env to Kestra's secret management
 */

const axios = require('axios');
require('dotenv').config();

const KESTRA_URL = process.env.KESTRA_URL || 'http://localhost:8080';
const NAMESPACE = process.env.KESTRA_NAMESPACE || 'company.team';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function addSecret() {
  if (!GITHUB_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN not found in .env file');
    process.exit(1);
  }

  console.log('🔐 Adding GitHub Token to Kestra Secrets...');
  console.log(`   Kestra URL: ${KESTRA_URL}`);
  console.log(`   Namespace: ${NAMESPACE}`);
  console.log(`   Secret Key: GITHUB_TOKEN`);
  console.log(`   Token: ${GITHUB_TOKEN.substring(0, 10)}...`);
  console.log('');

  try {
    // Kestra API endpoint for secrets
    const url = `${KESTRA_URL}/api/v1/namespaces/${NAMESPACE}/secrets/GITHUB_TOKEN`;
    
    console.log(`📡 Sending request to: ${url}`);
    
    const response = await axios.put(
      url,
      GITHUB_TOKEN,
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    );

    console.log('✅ Success! GitHub token added to Kestra secrets');
    console.log('');
    console.log('You can now use {{secret(\'GITHUB_TOKEN\')}} in your workflows');
    console.log('');
    console.log('Next steps:');
    console.log('1. Verify in Kestra UI: http://localhost:8080/ui/settings/secrets');
    console.log('2. Run your workflow again');
    
  } catch (error) {
    console.error('❌ Failed to add secret to Kestra');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data}`);
    } else if (error.request) {
      console.error('   Error: No response from Kestra server');
      console.error('   Make sure Kestra is running on', KESTRA_URL);
    } else {
      console.error('   Error:', error.message);
    }
    
    console.log('');
    console.log('Alternative: Add secret manually via Kestra UI');
    console.log('1. Open: http://localhost:8080/ui/settings/secrets');
    console.log('2. Click "Create"');
    console.log('3. Key: GITHUB_TOKEN');
    console.log('4. Value: Your GitHub token from .env');
    console.log('5. Namespace: company.team');
    console.log('6. Click "Save"');
    
    process.exit(1);
  }
}

addSecret();
