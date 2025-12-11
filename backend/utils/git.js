const simpleGit = require('simple-git');
const logger = require('./logger');
const { InternalServerError } = require('./errors');

/**
 * Clones a repository with authentication
 * @param {string} repoUrl - Repository URL
 * @param {string} targetDir - Target directory for cloning
 * @param {string} token - GitHub authentication token
 * @returns {Promise<void>}
 */
async function cloneRepository(repoUrl, targetDir, token) {
  try {
    logger.info(`Cloning repository ${repoUrl} to ${targetDir}`);
    
    const authenticatedUrl = repoUrl.replace(
      'https://github.com/',
      `https://${token}@github.com/`
    );
    
    const git = simpleGit();
    await git.clone(authenticatedUrl, targetDir);
    
    logger.info(`Successfully cloned repository to ${targetDir}`);
  } catch (error) {
    logger.error(`Failed to clone repository: ${error.message}`, { error });
    throw new InternalServerError('Failed to clone repository', error.message);
  }
}

/**
 * Creates and checks out a new branch
 * @param {string} repoDir - Repository directory
 * @param {string} branchName - Name of the branch to create
 * @returns {Promise<void>}
 */
async function createBranch(repoDir, branchName) {
  try {
    logger.info(`Creating branch ${branchName} in ${repoDir}`);
    
    const git = simpleGit(repoDir);
    await git.checkoutLocalBranch(branchName);
    
    logger.info(`Successfully created and checked out branch ${branchName}`);
  } catch (error) {
    logger.error(`Failed to create branch: ${error.message}`, { error });
    throw new InternalServerError('Failed to create branch', error.message);
  }
}

/**
 * Stages all changes and commits them
 * @param {string} repoDir - Repository directory
 * @param {string} message - Commit message
 * @returns {Promise<void>}
 */
async function commitChanges(repoDir, message) {
  try {
    logger.info(`Committing changes in ${repoDir}`);
    
    const git = simpleGit(repoDir);
    await git.add('.');
    await git.commit(message);
    
    logger.info(`Successfully committed changes`);
  } catch (error) {
    logger.error(`Failed to commit changes: ${error.message}`, { error });
    throw new InternalServerError('Failed to commit changes', error.message);
  }
}

/**
 * Pushes a branch to remote repository
 * @param {string} repoDir - Repository directory
 * @param {string} branchName - Name of the branch to push
 * @param {string} token - GitHub authentication token
 * @returns {Promise<void>}
 */
async function pushBranch(repoDir, branchName, token) {
  try {
    logger.info(`Pushing branch ${branchName} from ${repoDir}`);
    
    const git = simpleGit(repoDir);
    
    const remotes = await git.getRemotes(true);
    const origin = remotes.find(r => r.name === 'origin');
    
    if (origin) {
      const authenticatedUrl = origin.refs.push.replace(
        'https://github.com/',
        `https://${token}@github.com/`
      );
      await git.removeRemote('origin');
      await git.addRemote('origin', authenticatedUrl);
    }
    
    await git.push('origin', branchName);
    
    logger.info(`Successfully pushed branch ${branchName}`);
  } catch (error) {
    logger.error(`Failed to push branch: ${error.message}`, { error });
    throw new InternalServerError('Failed to push branch', error.message);
  }
}

module.exports = {
  cloneRepository,
  createBranch,
  commitChanges,
  pushBranch
};
