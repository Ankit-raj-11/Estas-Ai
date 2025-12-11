const express = require('express');
const router = express.Router();
const githubController = require('../controllers/github.controller');

/**
 * POST /api/github/create-branch
 * Creates a new branch
 */
router.post('/create-branch', githubController.createBranch);

/**
 * POST /api/github/create-pr
 * Creates a pull request
 */
router.post('/create-pr', githubController.createPullRequest);

/**
 * POST /api/github/commit-changes
 * Commits changes to a branch
 */
router.post('/commit-changes', githubController.commitChanges);

module.exports = router;
