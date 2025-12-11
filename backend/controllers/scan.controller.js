const storageService = require('../services/storage.service');
const kestraService = require('../services/kestra.service');
const githubService = require('../services/github.service');
const { validateScanRequest, validateScanId } = require('../utils/validator');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Initiates a new security scan
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function initiateScan(req, res, next) {
  try {
    // Validate request body
    const { repoUrl, branch } = validateScanRequest(req.body);
    
    logger.info(`Initiating scan for ${repoUrl}:${branch}`);
    
    // Validate repository access
    await githubService.validateRepoAccess(repoUrl);
    
    // Create scan record
    const scanId = storageService.createScan({
      repoUrl,
      branch
    });
    
    // Trigger Kestra workflow
    const executionId = await kestraService.triggerWorkflow(
      config.kestra.flowId,
      {
        scanId,
        repoUrl,
        branch,
        backendUrl: `http://${config.server.host}:${config.server.port}`
      }
    );
    
    // Update scan with execution ID
    storageService.updateScan(scanId, {
      kestraExecutionId: executionId,
      status: 'scanning'
    });
    
    logger.info(`Scan initiated successfully: ${scanId}`);
    
    res.status(200).json({
      scanId,
      status: 'initiated',
      kestraExecutionId: executionId,
      message: 'Scan workflow started'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Gets the status of a scan
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function getScanStatus(req, res, next) {
  try {
    const scanId = validateScanId(req.params.scanId);
    
    logger.info(`Getting scan status: ${scanId}`);
    
    const scan = storageService.getScan(scanId);
    
    res.status(200).json({
      scanId: scan.scanId,
      status: scan.status,
      progress: scan.progress,
      results: scan.results,
      kestraExecutionId: scan.kestraExecutionId,
      createdAt: scan.createdAt,
      updatedAt: scan.updatedAt
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  initiateScan,
  getScanStatus
};
