const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { NotFoundError } = require('../utils/errors');

/**
 * In-memory storage for scan data
 */
const scans = new Map();

/**
 * Creates a new scan record
 * @param {Object} scanData - Initial scan data
 * @returns {string} Generated scan ID
 */
function createScan(scanData) {
  // Use provided scanId or generate a new one
  const scanId = scanData.scanId || uuidv4();
  const scan = {
    scanId,
    repoUrl: scanData.repoUrl,
    branch: scanData.branch,
    status: 'initiated',
    progress: {
      cloned: false,
      scanned: false,
      issuesFound: 0,
      issuesFixed: 0,
      prCreated: false
    },
    results: null,
    kestraExecutionId: scanData.kestraExecutionId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  scans.set(scanId, scan);
  logger.info(`Created scan record: ${scanId}`, { scanId, repoUrl: scanData.repoUrl });
  
  return scanId;
}

/**
 * Retrieves a scan by ID
 * @param {string} scanId - Scan UUID
 * @throws {NotFoundError} If scan not found
 * @returns {Object} Scan data
 */
function getScan(scanId) {
  const scan = scans.get(scanId);
  
  if (!scan) {
    throw new NotFoundError(`Scan not found: ${scanId}`);
  }
  
  return scan;
}

/**
 * Updates a scan record
 * @param {string} scanId - Scan UUID
 * @param {Object} updates - Fields to update
 * @throws {NotFoundError} If scan not found
 * @returns {Object} Updated scan data
 */
function updateScan(scanId, updates) {
  const scan = getScan(scanId);
  
  Object.assign(scan, updates, {
    updatedAt: new Date().toISOString()
  });
  
  scans.set(scanId, scan);
  logger.info(`Updated scan record: ${scanId}`, { updates });
  
  return scan;
}

/**
 * Retrieves all scans
 * @returns {Array} Array of all scan records
 */
function getAllScans() {
  return Array.from(scans.values());
}

/**
 * Deletes a scan record
 * @param {string} scanId - Scan UUID
 * @returns {boolean} True if deleted, false if not found
 */
function deleteScan(scanId) {
  const deleted = scans.delete(scanId);
  if (deleted) {
    logger.info(`Deleted scan record: ${scanId}`);
  }
  return deleted;
}

module.exports = {
  createScan,
  getScan,
  updateScan,
  getAllScans,
  deleteScan
};
