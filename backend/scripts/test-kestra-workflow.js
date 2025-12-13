const axios = require('axios');

async function testWorkflow() {
  try {
    console.log('Testing Kestra workflow execution...\n');
    
    const kestraUrl = 'http://localhost:8080';
    const namespace = 'company.team';
    const flowId = 'security-scan-flow';
    
    const inputs = {
      scanId: 'test-' + Date.now(),
      repoUrl: 'https://github.com/Ankit-raj-11/T-race',
      branch: 'main',
      backendUrl: 'http://localhost:3001'
    };
    
    console.log('Triggering workflow with inputs:', inputs);
    
    const response = await axios.post(
      `${kestraUrl}/api/v1/executions/${namespace}/${flowId}`,
      inputs,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('\n✅ Workflow triggered successfully!');
    console.log('Execution ID:', response.data.id);
    console.log('\nView execution at:');
    console.log(`${kestraUrl}/ui/executions/${namespace}/${response.data.id}`);
    
    console.log('\nWaiting for execution to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const statusResponse = await axios.get(
      `${kestraUrl}/api/v1/executions/${response.data.id}`,
      { timeout: 5000 }
    );
    
    console.log('\nExecution Status:', statusResponse.data.state.current);
    
    if (statusResponse.data.state.current === 'FAILED') {
      console.log('\n❌ Execution failed. Check Kestra UI for logs.');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testWorkflow();
