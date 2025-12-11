const Joi = require('joi');
const { ValidationError } = require('./errors');

/**
 * Schema for repository URL validation
 */
const repoUrlSchema = Joi.string()
  .pattern(/^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/)
  .required()
  .messages({
    'string.pattern.base': 'Repository URL must be a valid GitHub URL (https://github.com/owner/repo)'
  });

/**
 * Schema for branch name validation
 */
const branchNameSchema = Joi.string()
  .pattern(/^[\w\-\/\.]+$/)
  .min(1)
  .max(255)
  .required()
  .messages({
    'string.pattern.base': 'Branch name contains invalid characters'
  });

/**
 * Schema for scan ID validation
 */
const scanIdSchema = Joi.string()
  .uuid()
  .required()
  .messages({
    'string.guid': 'Scan ID must be a valid UUID'
  });

/**
 * Schema for scan initiation request
 */
const scanRequestSchema = Joi.object({
  repoUrl: repoUrlSchema,
  branch: branchNameSchema.default('main')
});

/**
 * Validates repository URL
 * @param {string} repoUrl - GitHub repository URL
 * @throws {ValidationError} If validation fails
 * @returns {string} Validated repository URL
 */
function validateRepoUrl(repoUrl) {
  const { error, value } = repoUrlSchema.validate(repoUrl);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
}

/**
 * Validates branch name
 * @param {string} branchName - Git branch name
 * @throws {ValidationError} If validation fails
 * @returns {string} Validated branch name
 */
function validateBranchName(branchName) {
  const { error, value } = branchNameSchema.validate(branchName);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
}

/**
 * Validates scan ID
 * @param {string} scanId - Scan UUID
 * @throws {ValidationError} If validation fails
 * @returns {string} Validated scan ID
 */
function validateScanId(scanId) {
  const { error, value } = scanIdSchema.validate(scanId);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
}

/**
 * Validates scan request body
 * @param {Object} data - Request body data
 * @throws {ValidationError} If validation fails
 * @returns {Object} Validated data
 */
function validateScanRequest(data) {
  const { error, value } = scanRequestSchema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
}

module.exports = {
  validateRepoUrl,
  validateBranchName,
  validateScanId,
  validateScanRequest
};
