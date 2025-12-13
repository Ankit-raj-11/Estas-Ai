const { Octokit } = require('@octokit/rest');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkBranch() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
  try {
    const { data } = await octokit.repos.get({
      owner: 'Debjyoti-19',
      repo: 'T-race'
    });
    
    console.log(`Default branch: ${data.default_branch}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkBranch();
