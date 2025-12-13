const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function triggerScan() {
  try {
    console.log('🚀 Triggering security scan...\n');
    
    const response = await axios.post(`${BACKEND_URL}/api/scan`, {
      repoUrl: 'https://github.com/octocat/Hello-World',
      branch: 'master'
    });
    
    console.log('✅ Scan initiated successfully!');
    console.log('\nScan Details:');
    console.log(`  Scan ID: ${response.data.scanId}`);
    console.log(`  Status: ${response.data.status}`);
    console.log(`  Kestra Execution ID: ${response.data.kestraExecutionId}`);
    console.log(`\nCheck status at: ${BACKEND_URL}/api/scan/${response.data.scanId}`);
    console.log(`Kestra UI: http://localhost:8080`);
    
  } catch (error) {
    console.error('❌ Failed to trigger scan:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`  ${error.message}`);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure the backend server is running:');
      console.error('   cd backend && npm run dev');
    }
  }
}

triggerScan();
