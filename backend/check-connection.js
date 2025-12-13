#!/usr/bin/env node

/**
 * Connection Diagnostic Tool
 * Checks connectivity between Backend and Kestra
 */

const axios = require('axios');
const chalk = require('chalk');
require('dotenv').config();

const BACKEND_URL = process.env.BASE_URL || 'http://localhost:3001';
const KESTRA_URL = process.env.KESTRA_URL || 'http://localhost:8080';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════════════════╗'));
console.log(chalk.bold.cyan('║     Backend ↔ Kestra Connection Diagnostic Tool           ║'));
console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════╝\n'));

// Test results
const results = {
  backend: { status: 'unknown', details: null },
  kestra: { status: 'unknown', details: null },
  github: { status: 'unknown', details: null },
  connection: { status: 'unknown', details: null }
};

/**
 * Test 1: Backend Server
 */
async function testBackend() {
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold('TEST 1: Backend Server'));
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
  
  console.log(`Testing: ${BACKEND_URL}`);
  
  try {
    const response = await axios.get(`${BACKEND_URL}/`, { timeout: 5000 });
    
    if (response.status === 200 && response.data.status === 'running') {
      console.log(chalk.green('✓ Backend is running'));
      console.log(chalk.gray(`  Name: ${response.data.name}`));
      console.log(chalk.gray(`  Version: ${response.data.version}`));
      console.log(chalk.gray(`  Status: ${response.data.status}`));
      results.backend.status = 'success';
      results.backend.details = response.data;
    } else {
      console.log(chalk.yellow('⚠ Backend responded but with unexpected data'));
      console.log(chalk.gray(`  Status: ${response.status}`));
      console.log(chalk.gray(`  Data: ${JSON.stringify(response.data)}`));
      results.backend.status = 'warning';
      results.backend.details = response.data;
    }
  } catch (error) {
    console.log(chalk.red('✗ Backend is not accessible'));
    if (error.code === 'ECONNREFUSED') {
      console.log(chalk.red('  Error: Connection refused'));
      console.log(chalk.yellow('  Solution: Start backend with "npm start"'));
    } else {
      console.log(chalk.red(`  Error: ${error.message}`));
    }
    results.backend.status = 'error';
    results.backend.details = error.message;
  }
  console.log('');
}

/**
 * Test 2: Kestra Server
 */
async function testKestra() {
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold('TEST 2: Kestra Server'));
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
  
  console.log(`Testing: ${KESTRA_URL}`);
  
  try {
    const response = await axios.get(`${KESTRA_URL}/api/v1/health`, { timeout: 5000 });
    
    if (response.status === 200) {
      console.log(chalk.green('✓ Kestra is running'));
      console.log(chalk.gray(`  Status: ${response.status}`));
      results.kestra.status = 'success';
      results.kestra.details = response.data;
    } else {
      console.log(chalk.yellow('⚠ Kestra responded but with unexpected status'));
      console.log(chalk.gray(`  Status: ${response.status}`));
      results.kestra.status = 'warning';
      results.kestra.details = response.data;
    }
  } catch (error) {
    console.log(chalk.red('✗ Kestra is not accessible'));
    if (error.code === 'ECONNREFUSED') {
      console.log(chalk.red('  Error: Connection refused'));
      console.log(chalk.yellow('  Solution: Start Kestra with "docker-compose up -d"'));
    } else {
      console.log(chalk.red(`  Error: ${error.message}`));
    }
    results.kestra.status = 'error';
    results.kestra.details = error.message;
  }
  console.log('');
}

/**
 * Test 3: Backend → Kestra Connection
 */
async function testBackendToKestra() {
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold('TEST 3: Backend → Kestra Connection'));
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
  
  console.log('Testing: Backend health check (includes Kestra status)');
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 10000 });
    
    console.log(chalk.gray(`  Overall Status: ${response.data.status}`));
    console.log(chalk.gray(`  Version: ${response.data.version}`));
    console.log('');
    console.log(chalk.bold('  Service Status:'));
    
    // Check Kestra connection
    if (response.data.services.kestra === 'connected') {
      console.log(chalk.green('  ✓ Kestra: connected'));
      results.connection.status = 'success';
    } else if (response.data.services.kestra === 'disconnected') {
      console.log(chalk.red('  ✗ Kestra: disconnected'));
      console.log(chalk.yellow('    Backend cannot reach Kestra'));
      console.log(chalk.yellow('    Check KESTRA_URL in .env file'));
      results.connection.status = 'error';
    } else {
      console.log(chalk.yellow(`  ⚠ Kestra: ${response.data.services.kestra}`));
      results.connection.status = 'warning';
    }
    
    // Check GitHub
    if (response.data.services.github === 'authenticated') {
      console.log(chalk.green('  ✓ GitHub: authenticated'));
    } else {
      console.log(chalk.red(`  ✗ GitHub: ${response.data.services.github}`));
      console.log(chalk.yellow('    Check GITHUB_TOKEN in .env file'));
    }
    
    // Check AI
    if (response.data.services.ai_engine === 'operational') {
      console.log(chalk.green('  ✓ AI Engine: operational'));
    } else {
      console.log(chalk.red(`  ✗ AI Engine: ${response.data.services.ai_engine}`));
      console.log(chalk.yellow('    Check AI_API_KEY in .env file'));
    }
    
    results.connection.details = response.data;
    
  } catch (error) {
    console.log(chalk.red('✗ Cannot check backend health'));
    console.log(chalk.red(`  Error: ${error.message}`));
    results.connection.status = 'error';
    results.connection.details = error.message;
  }
  console.log('');
}

/**
 * Test 4: GitHub Token
 */
async function testGitHub() {
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold('TEST 4: GitHub Token'));
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
  
  if (!GITHUB_TOKEN) {
    console.log(chalk.red('✗ GitHub token not found in .env'));
    console.log(chalk.yellow('  Add GITHUB_TOKEN to .env file'));
    results.github.status = 'error';
    results.github.details = 'Token not configured';
    console.log('');
    return;
  }
  
  console.log(`Token: ${GITHUB_TOKEN.substring(0, 10)}...`);
  
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` },
      timeout: 5000
    });
    
    console.log(chalk.green('✓ GitHub token is valid'));
    console.log(chalk.gray(`  User: ${response.data.login}`));
    console.log(chalk.gray(`  Name: ${response.data.name || 'N/A'}`));
    console.log(chalk.gray(`  Type: ${response.data.type}`));
    
    // Check scopes
    const scopes = response.headers['x-oauth-scopes'] || '';
    console.log(chalk.gray(`  Scopes: ${scopes || 'none'}`));
    
    if (scopes.includes('repo')) {
      console.log(chalk.green('  ✓ Has "repo" scope (required)'));
    } else {
      console.log(chalk.red('  ✗ Missing "repo" scope'));
      console.log(chalk.yellow('    Token needs "repo" permission'));
    }
    
    results.github.status = 'success';
    results.github.details = {
      user: response.data.login,
      scopes: scopes
    };
    
  } catch (error) {
    console.log(chalk.red('✗ GitHub token is invalid'));
    if (error.response && error.response.status === 401) {
      console.log(chalk.red('  Error: Unauthorized (token expired or invalid)'));
      console.log(chalk.yellow('  Solution: Generate new token at https://github.com/settings/tokens'));
    } else {
      console.log(chalk.red(`  Error: ${error.message}`));
    }
    results.github.status = 'error';
    results.github.details = error.message;
  }
  console.log('');
}

/**
 * Test 5: Kestra Workflow
 */
async function testKestraWorkflow() {
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold('TEST 5: Kestra Workflow'));
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
  
  console.log('Checking: company.team/security-scan-flow');
  
  try {
    const response = await axios.get(
      `${KESTRA_URL}/api/v1/flows/company.team/security-scan-flow`,
      { timeout: 5000 }
    );
    
    console.log(chalk.green('✓ Workflow exists'));
    console.log(chalk.gray(`  ID: ${response.data.id}`));
    console.log(chalk.gray(`  Namespace: ${response.data.namespace}`));
    console.log(chalk.gray(`  Revision: ${response.data.revision || 'N/A'}`));
    
    // Check if workflow uses secret or env
    const workflowYaml = JSON.stringify(response.data);
    if (workflowYaml.includes('secret(\'GITHUB_TOKEN\')')) {
      console.log(chalk.yellow('  ⚠ Workflow uses {{secret(\'GITHUB_TOKEN\')}}'));
      console.log(chalk.yellow('    Should use {{envs.GITHUB_TOKEN}} instead'));
      console.log(chalk.yellow('    Update workflow in Kestra UI'));
    } else if (workflowYaml.includes('envs.GITHUB_TOKEN')) {
      console.log(chalk.green('  ✓ Workflow uses {{envs.GITHUB_TOKEN}}'));
    }
    
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(chalk.red('✗ Workflow not found'));
      console.log(chalk.yellow('  Solution: Create workflow in Kestra UI'));
      console.log(chalk.yellow('  1. Open http://localhost:8080/ui'));
      console.log(chalk.yellow('  2. Go to Flows → Create'));
      console.log(chalk.yellow('  3. Copy from backend/workflows/security-scan-workflow.yml'));
    } else {
      console.log(chalk.red('✗ Cannot check workflow'));
      console.log(chalk.red(`  Error: ${error.message}`));
    }
  }
  console.log('');
}

/**
 * Print Summary
 */
function printSummary() {
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold('SUMMARY'));
  console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
  
  const statusIcon = (status) => {
    if (status === 'success') return chalk.green('✓');
    if (status === 'error') return chalk.red('✗');
    if (status === 'warning') return chalk.yellow('⚠');
    return chalk.gray('?');
  };
  
  console.log(`${statusIcon(results.backend.status)} Backend Server: ${results.backend.status}`);
  console.log(`${statusIcon(results.kestra.status)} Kestra Server: ${results.kestra.status}`);
  console.log(`${statusIcon(results.github.status)} GitHub Token: ${results.github.status}`);
  console.log(`${statusIcon(results.connection.status)} Backend ↔ Kestra: ${results.connection.status}`);
  console.log('');
  
  // Overall status
  const allSuccess = Object.values(results).every(r => r.status === 'success');
  const hasError = Object.values(results).some(r => r.status === 'error');
  
  if (allSuccess) {
    console.log(chalk.green.bold('✓ All systems operational!'));
    console.log(chalk.green('  Backend and Kestra are properly connected'));
    console.log(chalk.green('  You can now run: npm run test:api'));
  } else if (hasError) {
    console.log(chalk.red.bold('✗ Issues detected'));
    console.log(chalk.yellow('\nRecommended actions:'));
    
    if (results.backend.status === 'error') {
      console.log(chalk.yellow('  1. Start backend: npm start'));
    }
    if (results.kestra.status === 'error') {
      console.log(chalk.yellow('  2. Start Kestra: cd docker && docker-compose up -d'));
    }
    if (results.github.status === 'error') {
      console.log(chalk.yellow('  3. Update GITHUB_TOKEN in .env file'));
    }
    if (results.connection.status === 'error') {
      console.log(chalk.yellow('  4. Check KESTRA_URL in .env file'));
    }
  } else {
    console.log(chalk.yellow.bold('⚠ Some warnings detected'));
    console.log(chalk.yellow('  Review the test results above'));
  }
  
  console.log('');
  console.log(chalk.gray('Configuration:'));
  console.log(chalk.gray(`  Backend URL: ${BACKEND_URL}`));
  console.log(chalk.gray(`  Kestra URL: ${KESTRA_URL}`));
  console.log(chalk.gray(`  GitHub Token: ${GITHUB_TOKEN ? GITHUB_TOKEN.substring(0, 10) + '...' : 'not set'}`));
  console.log('');
}

/**
 * Main
 */
async function main() {
  try {
    await testBackend();
    await testKestra();
    await testBackendToKestra();
    await testGitHub();
    await testKestraWorkflow();
    printSummary();
  } catch (error) {
    console.error(chalk.red('Unexpected error:'), error);
    process.exit(1);
  }
}

main();
