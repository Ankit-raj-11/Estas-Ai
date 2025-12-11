const aiFixService = require('../services/ai-fix.service');
const logger = require('../utils/logger');
const { ValidationError } = require('../utils/errors');

/**
 * Fixes a security issue using AI
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function fixSecurityIssue(req, res, next) {
  try {
    const { scanId, finding, fileContent, context } = req.body;
    
    // Validate required fields
    if (!finding || !fileContent) {
      throw new ValidationError('Missing required fields: finding, fileContent');
    }
    
    if (!finding.file || !finding.line || !finding.rule) {
      throw new ValidationError('Invalid finding object: missing file, line, or rule');
    }
    
    logger.info(`Fixing security issue in ${finding.file}:${finding.line}`, { scanId, rule: finding.rule });
    
    // Generate fix using AI
    const fix = await aiFixService.generateFix(finding, fileContent, context);
    
    logger.info(`Fix generated for ${finding.file}:${finding.line}`, { fixed: fix.fixed });
    
    res.status(200).json({
      scanId,
      finding: {
        file: finding.file,
        line: finding.line,
        rule: finding.rule
      },
      fixed: fix.fixed,
      patch: fix.patch,
      explanation: fix.explanation,
      recommendations: fix.recommendations,
      error: fix.error
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  fixSecurityIssue
};
