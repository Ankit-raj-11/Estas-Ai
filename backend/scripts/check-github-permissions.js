const { Octokit } = require('@octokit/rest');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function checkPermissions() {
  try {
    console.log('🔍 Checking GitHub Permissions\n');
    console.log('─'.repeat(60));
    
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    
    // Get authenticated user
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`\n✅ Authenticated as: ${user.login}`);
    console.log(`   Name: ${user.name || 'Not set'}`);
    console.log(`   Email: ${user.email || 'Not set'}`);
    
    // List user's repositories
    console.log(`\n📚 Your Repositories (first 10):`);
    console.log('─'.repeat(60));
    
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 10
    });
    
    if (repos.length === 0) {
      console.log('   No repositories found');
    } else {
      repos.forEach((repo, index) => {
        console.log(`\n${index + 1}. ${repo.full_name}`);
        console.log(`   URL: ${repo.html_url}`);
        console.log(`   Permissions: ${repo.permissions.admin ? 'Admin' : repo.permissions.push ? 'Write' : 'Read'}`);
        console.log(`   Private: ${repo.private ? 'Yes' : 'No'}`);
      });
    }
    
    // Check specific repository
    console.log(`\n\n🔍 Checking Access to: Ankit-raj-11/T-race`);
    console.log('─'.repeat(60));
    
    try {
      const { data: repo } = await octokit.repos.get({
        owner: 'Ankit-raj-11',
        repo: 'T-race'
      });
      
      console.log(`✅ Repository accessible`);
      console.log(`   Permissions:`);
      console.log(`   - Admin: ${repo.permissions?.admin || false}`);
      console.log(`   - Push: ${repo.permissions?.push || false}`);
      console.log(`   - Pull: ${repo.permissions?.pull || false}`);
      
      if (!repo.permissions?.push) {
        console.log(`\n⚠️  WARNING: You don't have write access to this repository!`);
        console.log(`   You can only read from it, not create branches or PRs.`);
        console.log(`\n💡 Solutions:`);
        console.log(`   1. Use one of your own repositories listed above`);
        console.log(`   2. Ask the owner to add you as a collaborator`);
      }
    } catch (error) {
      if (error.status === 404) {
        console.log(`❌ Repository not found or not accessible`);
      } else {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '─'.repeat(60));
    console.log('\n💡 Recommendation:');
    console.log('   Use one of your own repositories for testing the scanner.');
    console.log('   Pick any repo from the list above where you have Write/Admin access.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.status === 401) {
      console.error('\n💡 Your GitHub token is invalid or expired.');
      console.error('   Generate a new one at: https://github.com/settings/tokens');
    }
  }
}

checkPermissions();
