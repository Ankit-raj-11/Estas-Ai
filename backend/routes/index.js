const express = require('express');
const router = express.Router();

const healthRoutes = require('./health.routes');
const scanRoutes = require('./scan.routes');
const githubRoutes = require('./github.routes');
const webhookRoutes = require('./webhook.routes');

/**
 * Mount all routes
 */
router.use('/health', healthRoutes);
router.use('/scan', scanRoutes);
router.use('/github', githubRoutes);
router.use('/webhooks', webhookRoutes);

module.exports = router;
