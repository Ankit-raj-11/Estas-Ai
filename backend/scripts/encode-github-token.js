const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN not found in .env file!');
  process.exit(1);
}

// Base64 encode the token
const encoded = Buffer.from(GITHUB_TOKEN).toString('base64');

console.log('Your GitHub Token (plain):', GITHUB_TOKEN);
console.log('\nBase64 Encoded Token:');
console.log(encoded);
console.log('\nAdd this to your docker-compose.yml:');
console.log(`SECRET_GITHUB_TOKEN: ${encoded}`);
