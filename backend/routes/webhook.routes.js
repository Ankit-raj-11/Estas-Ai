const express = require('express');
const router = express.Router();
const kestraController = require('../controllers/kestra.controller');

/**
 * POST /api/webhooks/kestra
 * Handles Kestra workflow completion webhooks
 */
router.post('/kestra', kestraController.handleWebhook);

module.exports = router;
