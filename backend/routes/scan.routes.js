const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scan.controller');
const fixController = require('../controllers/fix.controller');

/**
 * POST /api/scan
 * Initiates a new security scan
 */
router.post('/', scanController.initiateScan);

/**
 * GET /api/scan/all
 * Gets all scans
 */
router.get('/all', scanController.getAllScans);

/**
 * GET /api/scan/:scanId
 * Gets the status of a scan
 */
router.get('/:scanId', scanController.getScanStatus);

/**
 * GET /api/scan/:scanId/findings
 * Gets findings for a scan
 */
router.get('/:scanId/findings', scanController.getScanFindings);

/**
 * POST /api/scan/fix
 * Fixes a security issue (internal API)
 */
router.post('/fix', fixController.fixSecurityIssue);

module.exports = router;
