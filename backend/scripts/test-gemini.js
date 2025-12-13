const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const API_KEY = process.env.AI_API_KEY;
const MODEL = process.env.AI_MODEL || 'gemini-2.0-flash-exp';

async function testGemini() {
  try {
    console.log('🤖 Testing Google Gemini API...\n');
    console.log(`Model: ${MODEL}`);
    console.log(`API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT SET'}\n`);
    
    if (!API_KEY) {
      console.error('❌ AI_API_KEY not found in .env file!');
      process.exit(1);
    }
    
    // Initialize the AI
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: MODEL,
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.2
      }
    });
    
    console.log('Sending test prompt...');
    
    // Generate content
    const result = await model.generateContent('Explain how AI works in a few words');
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ Gemini API Response:');
    console.log('─'.repeat(50));
    console.log(text);
    console.log('─'.repeat(50));
    console.log('\n✅ Gemini API is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Gemini API test failed:');
    console.error(`Error: ${error.message}`);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('\n💡 Your API key appears to be invalid.');
      console.error('Get a new key from: https://aistudio.google.com/apikey');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.error('\n💡 Permission denied. Check if your API key has the correct permissions.');
    }
    
    process.exit(1);
  }
}

testGemini();
