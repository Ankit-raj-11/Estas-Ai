const storageService = require('../services/storage.service');
const supabaseService = require('../services/supabase.service');
const kestraService = require('../services/kestra.service');
const githubService = require('../services/github.service');
const { validateScanRequest, validateScanId } = require('../utils/validator');
const logger = require('../utils/logger');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

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
    
    // Generate scan ID
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store in Supabase if configured, otherwise use in-memory
    if (supabaseService.isConfigured()) {
      await supabaseService.createScan({
        id: scanId,
        repo_url: repoUrl,
        branch,
        status: 'initiated'
      });
    } else {
      // Fallback to in-memory storage - pass scanId to use consistent ID
      storageService.createScan({
        scanId,
        repoUrl,
        branch
      });
    }
    
    // Trigger Kestra workflow
    // Use localhost for backendUrl - Kestra workflow will convert to host.docker.internal
    const executionId = await kestraService.triggerWorkflow(
      config.kestra.flowId,
      {
        scanId,
        repoUrl,
        branch,
        backendUrl: `http://localhost:${config.server.port}`
      }
    );
    
    // Update scan with execution ID
    if (supabaseService.isConfigured()) {
      await supabaseService.updateScan(scanId, {
        status: 'scanning'
      });
    } else {
      storageService.updateScan(scanId, {
        kestraExecutionId: executionId,
        status: 'scanning'
      });
    }
    
    logger.info(`Scan initiated successfully: ${scanId}`);
    
    res.status(200).json({
      scanId,
      status: 'initiated',
      kestraExecutionId: executionId,
      message: 'Sentinel Flow scan workflow started'
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
    
    let scan;
    let findings = [];
    
    if (supabaseService.isConfigured()) {
      scan = await supabaseService.getScan(scanId);
      
      if (!scan) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Scan not found: ${scanId}`
        });
      }
      
      // Fetch findings if scan is analyzed or awaiting approval
      if (['analyzed', 'awaiting_approval', 'applying_fixes', 'completed'].includes(scan.status)) {
        findings = await supabaseService.getFindingsByScan(scanId);
      }
      
      res.status(200).json({
        scanId: scan.id,
        repoUrl: scan.repo_url,
        branch: scan.branch,
        status: scan.status,
        aiSummary: scan.ai_summary,
        riskScore: scan.risk_score,
        totalFindings: scan.total_findings,
        autoFixed: scan.auto_fixed,
        needsReview: scan.needs_review,
        findings,
        createdAt: scan.created_at,
        completedAt: scan.completed_at
      });
    } else {
      // Fallback to in-memory storage
      scan = storageService.getScan(scanId);
      
      res.status(200).json({
        scanId: scan.scanId,
        repoUrl: scan.repoUrl,
        branch: scan.branch,
        status: scan.status,
        progress: scan.progress,
        results: scan.results,
        kestraExecutionId: scan.kestraExecutionId,
        createdAt: scan.createdAt,
        updatedAt: scan.updatedAt
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Get all scans
 */
async function getAllScans(req, res, next) {
  try {
    let scans;
    
    if (supabaseService.isConfigured()) {
      scans = await supabaseService.getAllScans();
    } else {
      scans = storageService.getAllScans();
    }
    
    res.status(200).json({
      success: true,
      scans
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get findings for a scan
 */
async function getScanFindings(req, res, next) {
  try {
    const { scanId } = req.params;
    
    if (!supabaseService.isConfigured()) {
      return res.status(400).json({
        error: 'Not Available',
        message: 'Findings require Supabase configuration'
      });
    }
    
    const findings = await supabaseService.getFindingsByScan(scanId);
    
    res.status(200).json({
      success: true,
      scanId,
      findings
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get execution logs for a scan
 */
async function getScanLogs(req, res, next) {
  try {
    const scanId = validateScanId(req.params.scanId);
    
    logger.info(`Getting logs for scan: ${scanId}`);
    
    let scan;
    if (supabaseService.isConfigured()) {
      scan = await supabaseService.getScan(scanId);
    } else {
      scan = storageService.getScan(scanId);
    }
    
    if (!scan) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Scan not found: ${scanId}`
      });
    }
    
    const executionId = scan.kestraExecutionId || scan.results?.executionId;
    
    if (!executionId) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No execution ID found for this scan'
      });
    }
    
    try {
      const logs = await kestraService.getExecutionLogs(executionId);
      
      res.status(200).json({
        success: true,
        scanId,
        executionId,
        logs
      });
    } catch (error) {
      logger.error(`Failed to fetch logs from Kestra: ${error.message}`);
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Failed to fetch logs from Kestra',
        details: error.message
      });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  initiateScan,
  getScanStatus,
  getAllScans,
  getScanFindings,
  getScanLogs
};
