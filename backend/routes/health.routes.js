const express = require('express');
const router = express.Router();
const kestraService = require('../services/kestra.service');
const { Octokit } = require('@octokit/rest');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/', async (req, res) => {
  try {
    const services = {
      kestra: 'unknown',
      github: 'unknown',
      ai_engine: 'unknown'
    };
    
    // Check Kestra
    try {
      const kestraHealthy = await kestraService.checkHealth();
      services.kestra = kestraHealthy ? 'connected' : 'disconnected';
    } catch (error) {
      services.kestra = 'error';
      logger.error(`Kestra health check failed: ${error.message}`);
    }
    
    // Check GitHub
    try {
      const octokit = new Octokit({ auth: config.github.token });
      await octokit.users.getAuthenticated();
      services.github = 'authenticated';
    } catch (error) {
      services.github = 'error';
      logger.error(`GitHub health check failed: ${error.message}`);
    }
    
    // Check AI service (just verify API key is configured)
    services.ai_engine = config.ai.apiKey ? 'operational' : 'not_configured';
    
    const allHealthy = services.kestra === 'connected' && 
                       services.github === 'authenticated' && 
                       services.ai_engine === 'operational';
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      version: '1.0.0',
      services
    });
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`, { error });
    res.status(503).json({
      status: 'unhealthy',
      version: '1.0.0',
      error: error.message
    });
  }
});

module.exports = router;
