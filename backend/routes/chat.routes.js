const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

/**
 * Chat Routes for Sentinel Flow
 * Handles AI conversations about security findings
 */

// Main chat endpoint - AI assistant for security questions
router.post('/', chatController.handleChat);

module.exports = router;
