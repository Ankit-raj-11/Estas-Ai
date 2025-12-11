const storageService = require('../services/storage.service');
const logger = require('../utils/logger');

/**
 * Handles webhook callbacks from Kestra
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function handleWebhook(req, res, next) {
  try {
    const { executionId, status, scanId, outputs } = req.body;
    
    logger.info(`Received Kestra webhook for execution ${executionId}`, { status, scanId });
    
    if (!scanId) {
      logger.warn('Webhook received without scanId');
      return res.status(200).json({ received: true });
    }
    
    try {
      // Find and update scan
      const scan = storageService.getScan(scanId);
      
      const updates = {
        status: status === 'success' ? 'completed' : 'failed'
      };
      
      if (outputs) {
        updates.progress = {
          ...scan.progress,
          issuesFound: outputs.issuesFound || scan.progress.issuesFound,
          issuesFixed: outputs.issuesFixed || scan.progress.issuesFixed,
          prCreated: !!outputs.prUrl
        };
        
        updates.results = {
          ...outputs,
          executionId,
          completedAt: new Date().toISOString()
        };
      }
      
      storageService.updateScan(scanId, updates);
      
      logger.info(`Updated scan ${scanId} with webhook data`, { status: updates.status });
    } catch (error) {
      logger.error(`Failed to update scan from webhook: ${error.message}`, { error, scanId });
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleWebhook
};
