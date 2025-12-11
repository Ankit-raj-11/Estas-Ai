const githubService = require('../services/github.service');
const logger = require('../utils/logger');
const { ValidationError } = require('../utils/errors');

/**
 * Creates a new branch
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function createBranch(req, res, next) {
  try {
    const { repoUrl, branchName, fromBranch } = req.body;
    
    if (!repoUrl || !branchName || !fromBranch) {
      throw new ValidationError('Missing required fields: repoUrl, branchName, fromBranch');
    }
    
    logger.info(`Creating branch ${branchName} from ${fromBranch}`);
    
    const { owner, repo } = githubService.parseRepoUrl(repoUrl);
    const branch = await githubService.createBranch(owner, repo, branchName, fromBranch);
    
    res.status(200).json({
      success: true,
      branch: branchName,
      ref: branch.ref,
      sha: branch.object.sha
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Creates a pull request
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function createPullRequest(req, res, next) {
  try {
    const { repoUrl, head, base, title, body } = req.body;
    
    if (!repoUrl || !head || !base || !title) {
      throw new ValidationError('Missing required fields: repoUrl, head, base, title');
    }
    
    logger.info(`Creating PR from ${head} to ${base}`);
    
    const { owner, repo } = githubService.parseRepoUrl(repoUrl);
    const pr = await githubService.createPullRequest(owner, repo, head, base, title, body);
    
    res.status(200).json({
      success: true,
      prNumber: pr.number,
      prUrl: pr.html_url,
      state: pr.state
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Commits changes to a branch
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function commitChanges(req, res, next) {
  try {
    const { repoUrl, branch, path, content, message } = req.body;
    
    if (!repoUrl || !branch || !path || !content || !message) {
      throw new ValidationError('Missing required fields: repoUrl, branch, path, content, message');
    }
    
    logger.info(`Committing changes to ${path} on ${branch}`);
    
    const { owner, repo } = githubService.parseRepoUrl(repoUrl);
    const commit = await githubService.commitFile(owner, repo, branch, path, content, message);
    
    res.status(200).json({
      success: true,
      commit: {
        sha: commit.commit.sha,
        message: commit.commit.message
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBranch,
  createPullRequest,
  commitChanges
};
