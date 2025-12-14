const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

/**
 * Validates that required environment variables are present
 * @throws {Error} If required variables are missing
 */
function validateConfig() {
  const required = [
    'GITHUB_TOKEN',
    'KESTRA_URL',
    'AI_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Warn about optional Supabase config
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.warn('⚠️  Supabase not configured - using in-memory storage (set SUPABASE_URL and SUPABASE_KEY for persistence)');
  }
}

validateConfig();

/**
 * Application configuration object - Sentinel Flow
 */
const config = {
  server: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    host: process.env.HOST || '0.0.0.0'
  },
  github: {
    token: process.env.GITHUB_TOKEN,
    apiUrl: process.env.GITHUB_API_URL || 'https://api.github.com'
  },
  kestra: {
    url: process.env.KESTRA_URL,
    namespace: process.env.KESTRA_NAMESPACE || 'company.team',
    flowId: process.env.KESTRA_FLOW_ID || 'security-scan-flow'
  },
  ai: {
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || 'gemini-2.0-flash-exp',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS, 10) || 8192
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  },
  storage: {
    tempRepoDir: process.env.TEMP_REPO_DIR || path.join(__dirname, '..', 'tmp', 'repos')
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;
