const { Octokit } = require('@octokit/rest');
const config = require('../config');
const logger = require('../utils/logger');
const { UnauthorizedError, NotFoundError, ExternalServiceError } = require('../utils/errors');

const octokit = new Octokit({
  auth: config.github.token,
  baseUrl: config.github.apiUrl
});

/**
 * Parses owner and repo from GitHub URL
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Object} Object with owner and repo properties
 */
function parseRepoUrl(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL format');
  }
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, '')
  };
}

/**
 * Validates repository access
 * @param {string} repoUrl - GitHub repository URL
 * @throws {UnauthorizedError|NotFoundError} If repo is not accessible
 * @returns {Promise<Object>} Repository information
 */
async function validateRepoAccess(repoUrl) {
  try {
    const { owner, repo } = parseRepoUrl(repoUrl);
    logger.info(`Validating access to ${owner}/${repo}`);
    
    const { data } = await octokit.repos.get({ owner, repo });
    
    logger.info(`Successfully validated access to ${owner}/${repo}`);
    return data;
  } catch (error) {
    if (error.status === 401) {
      throw new UnauthorizedError('GitHub authentication failed');
    } else if (error.status === 404) {
      throw new NotFoundError('Repository not found or not accessible');
    }
    logger.error(`Failed to validate repo access: ${error.message}`, { error });
    throw new ExternalServiceError('GitHub API error', error.message);
  }
}

/**
 * Gets the default branch of a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<string>} Default branch name
 */
async function getDefaultBranch(owner, repo) {
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    return data.default_branch;
  } catch (error) {
    logger.error(`Failed to get default branch: ${error.message}`, { error });
    throw new ExternalServiceError('Failed to get default branch', error.message);
  }
}

/**
 * Creates a new branch via GitHub API
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branchName - Name of the new branch
 * @param {string} fromBranch - Source branch to create from
 * @returns {Promise<Object>} Created branch reference
 */
async function createBranch(owner, repo, branchName, fromBranch) {
  try {
    logger.info(`Creating branch ${branchName} from ${fromBranch} in ${owner}/${repo}`);
    
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${fromBranch}`
    });
    
    const { data } = await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: refData.object.sha
    });
    
    logger.info(`Successfully created branch ${branchName}`);
    return data;
  } catch (error) {
    logger.error(`Failed to create branch: ${error.message}`, { error });
    throw new ExternalServiceError('Failed to create branch', error.message);
  }
}

/**
 * Commits a file to a branch
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch name
 * @param {string} path - File path
 * @param {string} content - File content (base64 encoded)
 * @param {string} message - Commit message
 * @returns {Promise<Object>} Commit information
 */
async function commitFile(owner, repo, branch, path, content, message) {
  try {
    logger.info(`Committing file ${path} to ${branch} in ${owner}/${repo}`);
    
    let sha;
    try {
      const { data: fileData } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch
      });
      sha = fileData.sha;
    } catch (error) {
      // File doesn't exist, that's okay
    }
    
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
      sha
    });
    
    logger.info(`Successfully committed file ${path}`);
    return data;
  } catch (error) {
    logger.error(`Failed to commit file: ${error.message}`, { error });
    throw new ExternalServiceError('Failed to commit file', error.message);
  }
}

/**
 * Creates a pull request
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} head - Head branch (source)
 * @param {string} base - Base branch (target)
 * @param {string} title - PR title
 * @param {string} body - PR description
 * @returns {Promise<Object>} Created pull request
 */
async function createPullRequest(owner, repo, head, base, title, body) {
  try {
    logger.info(`Creating PR from ${head} to ${base} in ${owner}/${repo}`);
    
    const { data } = await octokit.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body
    });
    
    logger.info(`Successfully created PR #${data.number}: ${data.html_url}`);
    return data;
  } catch (error) {
    logger.error(`Failed to create pull request: ${error.message}`, { error });
    throw new ExternalServiceError('Failed to create pull request', error.message);
  }
}

module.exports = {
  parseRepoUrl,
  validateRepoAccess,
  getDefaultBranch,
  createBranch,
  commitFile,
  createPullRequest
};
