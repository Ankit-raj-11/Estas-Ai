#!/usr/bin/env node

/**
 * Comprehensive API and Workflow Test Script
 * Tests all backend endpoints and Kestra integration
 */

const axios = require('axios');
const chalk = require('chalk');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const KESTRA_URL = process.env.KESTRA_URL || 'http://localhost:8080';
const TEST_REPO = process.env.TEST_REPO || 'https://github.com/octocat/Hello-World';
const TEST_BRANCH = process.env.TEST_BRANCH || 'master';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

/**
 * Utility functions
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}]`;
  
  switch (type) {
    case 'success':
      console.log(chalk.green(`✓ ${prefix} ${message}`));
      break;
    case 'error':
      console.log(chalk.red(`✗ ${prefix} ${message}`));
      break;
    case 'warning':
      console.log(chalk.yellow(`⚠ ${prefix} ${message}`));
      break;
    case 'info':
      console.log(chalk.blue(`ℹ ${prefix} ${message}`));
      break;
    case 'skip':
      console.log(chalk.gray(`⊘ ${prefix} ${message}`));
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}

function logSection(title) {
  console.log('\n' + chalk.bold.cyan('='.repeat(60)));
  console.log(chalk.bold.cyan(`  ${title}`));
  console.log(chalk.bold.cyan('='.repeat(60)) + '\n');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test runner
 */
async function runTest(name, testFn, options = {}) {
  const { skip = false, critical = false } = options;
  
  if (skip) {
    log(`SKIPPED: ${name}`, 'skip');
    results.skipped++;
    results.tests.push({ name, status: 'skipped' });
    return { success: true, skipped: true };
  }
  
  try {
    log(`Testing: ${name}`, 'info');
    const result = await testFn();
    log(`PASSED: ${name}`, 'success');
    results.passed++;
    results.tests.push({ name, status: 'passed', ...result });
    return { success: true, ...result };
  } catch (error) {
    log(`FAILED: ${name} - ${error.message}`, 'error');
    if (error.response) {
      log(`  Status: ${error.response.status}`, 'error');
      log(`  Data: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
    }
    results.failed++;
    results.tests.push({ name, status: 'failed', error: error.message });
    
    if (critical) {
      throw new Error(`Critical test failed: ${name}`);
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Test Suite 1: Health Checks
 */
async function testHealthChecks() {
  logSection('Health Checks');
  
  // Test 1: Backend health
  await runTest('Backend Server Health', async () => {
    const response = await axios.get(`${BASE_URL}/`);
    if (response.status !== 200) throw new Error('Server not responding');
    if (!response.data.status) throw new Error('Invalid health response');
    return { data: response.data };
  }, { critical: true });
  
  // Test 2: Health endpoint
  await runTest('Health Endpoint', async () => {
    const response = await axios.get(`${BASE_URL}/api/health`);
    if (response.status !== 200) throw new Error('Health check failed');
    return { data: response.data };
  });
  
  // Test 3: Kestra health
  await runTest('Kestra Server Health', async () => {
    const response = await axios.get(`${KESTRA_URL}/api/v1/health`, { timeout: 5000 });
    if (response.status !== 200) throw new Error('Kestra not responding');
    return { data: response.data };
  });
}

/**
 * Test Suite 2: Scan Endpoints
 */
async function testScanEndpoints() {
  logSection('Scan Endpoints');
  
  let scanId;
  
  // Test 1: Initiate scan with invalid data
  await runTest('Initiate Scan - Invalid Data', async () => {
    try {
      await axios.post(`${BASE_URL}/api/scan`, {});
      throw new Error('Should have failed with validation error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return { validated: true };
      }
      throw error;
    }
  });
  
  // Test 2: Initiate scan with valid data
  const scanResult = await runTest('Initiate Scan - Valid Data', async () => {
    const response = await axios.post(`${BASE_URL}/api/scan`, {
      repoUrl: TEST_REPO,
      branch: TEST_BRANCH
    });
    
    if (response.status !== 200) throw new Error('Scan initiation failed');
    if (!response.data.scanId) throw new Error('No scanId returned');
    if (!response.data.kestraExecutionId) throw new Error('No kestraExecutionId returned');
    
    scanId = response.data.scanId;
    return { 
      scanId: response.data.scanId,
      executionId: response.data.kestraExecutionId,
      data: response.data 
    };
  });
  
  // Test 3: Get scan status
  if (scanId) {
    await runTest('Get Scan Status', async () => {
      const response = await axios.get(`${BASE_URL}/api/scan/${scanId}`);
      if (response.status !== 200) throw new Error('Failed to get scan status');
      if (response.data.scanId !== scanId) throw new Error('ScanId mismatch');
      return { data: response.data };
    });
  }
  
  // Test 4: Get non-existent scan
  await runTest('Get Non-existent Scan', async () => {
    try {
      await axios.get(`${BASE_URL}/api/scan/non-existent-id`);
      throw new Error('Should have returned 404');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { validated: true };
      }
      throw error;
    }
  });
  
  return { scanId, executionId: scanResult.executionId };
}

/**
 * Test Suite 3: GitHub Endpoints
 */
async function testGitHubEndpoints() {
  logSection('GitHub Endpoints');
  
  // Test 1: Create branch - invalid data
  await runTest('Create Branch - Invalid Data', async () => {
    try {
      await axios.post(`${BASE_URL}/api/github/create-branch`, {});
      throw new Error('Should have failed with validation error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return { validated: true };
      }
      throw error;
    }
  });
  
  // Test 2: Create PR - invalid data
  await runTest('Create PR - Invalid Data', async () => {
    try {
      await axios.post(`${BASE_URL}/api/github/create-pr`, {});
      throw new Error('Should have failed with validation error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return { validated: true };
      }
      throw error;
    }
  });
  
  // Test 3: Commit changes - invalid data
  await runTest('Commit Changes - Invalid Data', async () => {
    try {
      await axios.post(`${BASE_URL}/api/github/commit`, {});
      throw new Error('Should have failed with validation error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return { validated: true };
      }
      throw error;
    }
  });
}

/**
 * Test Suite 4: Fix Endpoint
 */
async function testFixEndpoint() {
  logSection('Fix Endpoint');
  
  // Test 1: Fix issue - invalid data
  await runTest('Fix Issue - Invalid Data', async () => {
    try {
      await axios.post(`${BASE_URL}/api/scan/fix`, {});
      throw new Error('Should have failed with validation error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return { validated: true };
      }
      throw error;
    }
  });
  
  // Test 2: Fix issue - valid data
  await runTest('Fix Issue - Valid Data', async () => {
    const response = await axios.post(`${BASE_URL}/api/scan/fix`, {
      scanId: 'test-scan-id',
      finding: {
        file: 'test.js',
        line: 10,
        rule: 'no-eval',
        message: 'eval() is dangerous'
      },
      fileContent: 'const result = eval("1 + 1");'
    });
    
    if (response.status !== 200) throw new Error('Fix generation failed');
    if (typeof response.data.fixed !== 'boolean') throw new Error('Invalid response format');
    
    return { data: response.data };
  });
}

/**
 * Test Suite 5: Webhook Endpoint
 */
async function testWebhookEndpoint() {
  logSection('Webhook Endpoint');
  
  // Test 1: Webhook with valid data
  await runTest('Kestra Webhook - Valid Data', async () => {
    const response = await axios.post(`${BASE_URL}/api/webhooks/kestra`, {
      executionId: 'test-execution-id',
      status: 'success',
      scanId: 'test-scan-id',
      outputs: {
        issuesFound: 5,
        issuesFixed: 3,
        prUrl: 'https://github.com/test/test/pull/1'
      }
    });
    
    if (response.status !== 200) throw new Error('Webhook failed');
    return { data: response.data };
  });
  
  // Test 2: Webhook without scanId
  await runTest('Kestra Webhook - No ScanId', async () => {
    const response = await axios.post(`${BASE_URL}/api/webhooks/kestra`, {
      executionId: 'test-execution-id',
      status: 'success'
    });
    
    if (response.status !== 200) throw new Error('Webhook failed');
    return { data: response.data };
  });
}

/**
 * Test Suite 6: Kestra Workflow
 */
async function testKestraWorkflow(scanData) {
  logSection('Kestra Workflow Integration');
  
  if (!scanData || !scanData.executionId) {
    log('Skipping workflow tests - no execution ID available', 'skip');
    return;
  }
  
  const { executionId } = scanData;
  
  // Test 1: Check execution exists
  await runTest('Kestra Execution Exists', async () => {
    const response = await axios.get(
      `${KESTRA_URL}/api/v1/executions/${executionId}`,
      { timeout: 5000 }
    );
    
    if (response.status !== 200) throw new Error('Execution not found');
    return { data: response.data };
  });
  
  // Test 2: Monitor execution status
  await runTest('Monitor Execution Status', async () => {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const response = await axios.get(
        `${KESTRA_URL}/api/v1/executions/${executionId}`,
        { timeout: 5000 }
      );
      
      const state = response.data.state.current;
      log(`  Execution state: ${state}`, 'info');
      
      if (state === 'SUCCESS' || state === 'FAILED' || state === 'WARNING') {
        return { 
          finalState: state,
          duration: response.data.state.duration,
          data: response.data 
        };
      }
      
      attempts++;
      await sleep(3000);
    }
    
    throw new Error('Execution did not complete within timeout');
  });
  
  // Test 3: Check workflow definition
  await runTest('Workflow Definition Exists', async () => {
    const response = await axios.get(
      `${KESTRA_URL}/api/v1/flows/company.team/security-scan-flow`,
      { timeout: 5000 }
    );
    
    if (response.status !== 200) throw new Error('Workflow not found');
    if (response.data.id !== 'security-scan-flow') throw new Error('Wrong workflow');
    
    return { 
      workflow: response.data.id,
      revision: response.data.revision 
    };
  });
}

/**
 * Test Suite 7: Error Handling
 */
async function testErrorHandling() {
  logSection('Error Handling');
  
  // Test 1: 404 endpoint
  await runTest('404 Not Found', async () => {
    try {
      await axios.get(`${BASE_URL}/api/non-existent-endpoint`);
      throw new Error('Should have returned 404');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { validated: true };
      }
      throw error;
    }
  });
  
  // Test 2: Invalid JSON
  await runTest('Invalid JSON Handling', async () => {
    try {
      await axios.post(`${BASE_URL}/api/scan`, 'invalid-json', {
        headers: { 'Content-Type': 'application/json' }
      });
      throw new Error('Should have returned 400');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return { validated: true };
      }
      throw error;
    }
  });
}

/**
 * Print summary
 */
function printSummary() {
  logSection('Test Summary');
  
  const total = results.passed + results.failed + results.skipped;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(2) : 0;
  
  console.log(chalk.bold(`Total Tests: ${total}`));
  console.log(chalk.green(`Passed: ${results.passed}`));
  console.log(chalk.red(`Failed: ${results.failed}`));
  console.log(chalk.gray(`Skipped: ${results.skipped}`));
  console.log(chalk.bold(`Pass Rate: ${passRate}%\n`));
  
  if (results.failed > 0) {
    console.log(chalk.red.bold('Failed Tests:'));
    results.tests
      .filter(t => t.status === 'failed')
      .forEach(t => {
        console.log(chalk.red(`  - ${t.name}: ${t.error}`));
      });
    console.log();
  }
  
  return results.failed === 0;
}

/**
 * Main test execution
 */
async function main() {
  console.log(chalk.bold.magenta('\n╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.magenta('║     Automated Security Scanner - API Test Suite           ║'));
  console.log(chalk.bold.magenta('╚════════════════════════════════════════════════════════════╝\n'));
  
  log(`Backend URL: ${BASE_URL}`, 'info');
  log(`Kestra URL: ${KESTRA_URL}`, 'info');
  log(`Test Repository: ${TEST_REPO}`, 'info');
  log(`Test Branch: ${TEST_BRANCH}`, 'info');
  
  try {
    // Run all test suites
    await testHealthChecks();
    const scanData = await testScanEndpoints();
    await testGitHubEndpoints();
    await testFixEndpoint();
    await testWebhookEndpoint();
    await testKestraWorkflow(scanData);
    await testErrorHandling();
    
    // Print summary
    const success = printSummary();
    
    if (success) {
      log('All tests passed! 🎉', 'success');
      process.exit(0);
    } else {
      log('Some tests failed. Please review the errors above.', 'error');
      process.exit(1);
    }
    
  } catch (error) {
    log(`Critical error: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  main();
}

module.exports = { runTest, testHealthChecks, testScanEndpoints };
