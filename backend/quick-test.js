const axios = require('axios');

async function test() {
  try {
    console.log('Testing root endpoint...');
    const response = await axios.get('http://localhost:3001/');
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
  
  try {
    console.log('\nTesting health endpoint...');
    const response = await axios.get('http://localhost:3001/api/health');
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

test();
