const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function testFullScan() {
  try {
    console.log('🚀 Testing Full Security Scan Workflow\n');
    console.log('─'.repeat(60));
    
    // Step 1: Initiate scan
    console.log('\n📝 Step 1: Initiating scan...');
    const scanResponse = await axios.post(`${BACKEND_URL}/api/scan`, {
      repoUrl: 'https://github.com/Ankit-raj-11/T-race',
      branch: 'main'
    });
    
    console.log('✅ Scan initiated!');
    console.log(`   Scan ID: ${scanResponse.data.scanId}`);
    console.log(`   Kestra Execution: ${scanResponse.data.kestraExecutionId}`);
    console.log(`   Status: ${scanResponse.data.status}`);
    
    const scanId = scanResponse.data.scanId;
    
    // Step 2: Monitor scan status
    console.log('\n📊 Step 2: Monitoring scan status...');
    console.log('   (Waiting 5 seconds for workflow to start...)');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    for (let i = 0; i < 12; i++) {
      try {
        const statusResponse = await axios.get(`${BACKEND_URL}/api/scan/${scanId}`);
        const status = statusResponse.data;
        
        console.log(`   [${i+1}/12] Status: ${status.status} | Issues: ${status.progress.issuesFound}`);
        
        if (status.status === 'completed' || status.status === 'failed') {
          console.log('\n✅ Scan completed!');
          console.log('\n📋 Final Results:');
          console.log('─'.repeat(60));
          console.log(JSON.stringify(status, null, 2));
          console.log('─'.repeat(60));
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.log(`   [${i+1}/12] Checking... (${error.response?.status || 'waiting'})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log('\n🎉 Test complete!');
    console.log(`\nView in Kestra: http://localhost:8080`);
    console.log(`View scan status: ${BACKEND_URL}/api/scan/${scanId}`);
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   ${error.message}`);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure the backend server is running:');
      console.error('   cd backend && npm run dev');
    }
  }
}

testFullScan();
