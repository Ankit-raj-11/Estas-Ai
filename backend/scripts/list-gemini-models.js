const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const API_KEY = process.env.AI_API_KEY;

async function listModels() {
  try {
    console.log('📋 Listing available Gemini models...\n');
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // List models
    const models = await genAI.listModels();
    
    console.log('Available models:');
    console.log('─'.repeat(70));
    
    for await (const model of models) {
      console.log(`\n✓ ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
    }
    
    console.log('\n' + '─'.repeat(70));
    
  } catch (error) {
    console.error('❌ Failed to list models:', error.message);
  }
}

listModels();
