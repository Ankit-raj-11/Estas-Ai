#!/usr/bin/env node

/**
 * Test script to start a scan and monitor its progress
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const REPO_URL = 'https://github.com/Ankit-raj-11/T-race';
const BRANCH = 'main';

async function startScan() {
  console.log('🚀 Starting new scan...');
  console.log(`Repository: ${REPO_URL}`);
  console.log(`Branch: ${BRANCH}\n`);
  
  try {
    const response = await axios.post(`${BASE_URL}/api/scan`, {
      repoUrl: REPO_URL,
      branch: BRANCH
    });
    
    const { scanId, kestraExecutionId } = response.data;
    console.log('✅ Scan initiated successfully!');
    console.log(`Scan ID: ${scanId}`);
    console.log(`Kestra Execution: ${kestraExecutionId}`);
    console.log(`\nFrontend URL: http://localhost:3001/scan/${scanId}`);
    console.log(`Kestra URL: http://localhost:8080/ui/executions/company.team/security-scan-flow/${kestraExecutionId}\n`);
    
    // Monitor scan progress
    await monitorScan(scanId);
    
  } catch (error) {
    console.error('❌ Failed to start scan:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function monitorScan(scanId) {
  console.log('📊 Monitoring scan progress...\n');
  
  let completed = false;
  let lastStatus = '';
  
  while (!completed) {
    try {
      const response = await axios.get(`${BASE_URL}/api/scan/${scanId}`);
      const scan = response.data;
      
      if (scan.status !== lastStatus) {
        console.log(`Status: ${scan.status}`);
        console.log(`Repository: ${scan.repoUrl || 'Unknown'}`);
        console.log(`Branch: ${scan.branch || 'Unknown'}`);
        console.log(`Issues Found: ${scan.progress.issuesFound}`);
        console.log(`Issues Fixed: ${scan.progress.issuesFixed}`);
        console.log(`PR Created: ${scan.progress.prCreated ? 'Yes' : 'No'}`);
        
        if (scan.results?.prUrl) {
          console.log(`PR URL: ${scan.results.prUrl}`);
        }
        
        console.log('---');
        lastStatus = scan.status;
      }
      
      if (scan.status === 'completed' || scan.status === 'failed') {
        completed = true;
        console.log('\n✅ Scan completed!');
        console.log(JSON.stringify(scan, null, 2));
      }
      
      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.error('Error checking scan status:', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Run the test
startScan().catch(console.error);
