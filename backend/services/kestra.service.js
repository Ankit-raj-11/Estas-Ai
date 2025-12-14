const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const { ExternalServiceError } = require('../utils/errors');

// Kestra default credentials (for local development)
const KESTRA_USERNAME = process.env.KESTRA_USERNAME || 'admin@kestra.io';
const KESTRA_PASSWORD = process.env.KESTRA_PASSWORD || 'kestra';

/**
 * Get axios config with basic auth for Kestra API calls
 */
function getAxiosConfig(additionalHeaders = {}) {
  return {
    auth: {
      username: KESTRA_USERNAME,
      password: KESTRA_PASSWORD
    },
    headers: {
      'Content-Type': 'application/json',
      ...additionalHeaders
    }
  };
}

/**
 * Triggers a Kestra workflow
 * @param {string} flowId - Workflow ID
 * @param {Object} inputs - Workflow input parameters
 * @returns {Promise<string>} Execution ID
 */
async function triggerWorkflow(flowId, inputs) {
  try {
    logger.info(`Triggering Kestra workflow: ${flowId}`, { inputs });
    
    // Kestra API requires /main/ in path and multipart/form-data
    const baseUrl = `${config.kestra.url}/api/v1/main/executions/${config.kestra.namespace}/${flowId}`;
    
    // Build FormData with inputs
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add each input as a form field
    Object.entries(inputs).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    
    const response = await axios.post(
      baseUrl,
      formData,
      {
        auth: {
          username: KESTRA_USERNAME,
          password: KESTRA_PASSWORD
        },
        headers: {
          ...formData.getHeaders()
        },
        timeout: 30000
      }
    );
    
    const executionId = response.data.id;
    logger.info(`Workflow triggered successfully: ${executionId}`);
    
    return executionId;
  } catch (error) {
    logger.error(`Failed to trigger Kestra workflow: ${error.message}`, { error });
    throw new ExternalServiceError('Kestra workflow trigger failed', error.message);
  }
}

/**
 * Gets the status of a workflow execution
 * @param {string} executionId - Execution ID
 * @returns {Promise<Object>} Execution status
 */
async function getExecutionStatus(executionId) {
  try {
    logger.info(`Getting execution status: ${executionId}`);
    
    const url = `${config.kestra.url}/api/v1/executions/${executionId}`;
    
    const response = await axios.get(url, {
      ...getAxiosConfig(),
      timeout: 10000
    });
    
    return {
      id: response.data.id,
      state: response.data.state.current,
      startDate: response.data.state.startDate,
      endDate: response.data.state.endDate,
      duration: response.data.state.duration
    };
  } catch (error) {
    logger.error(`Failed to get execution status: ${error.message}`, { error });
    throw new ExternalServiceError('Failed to get Kestra execution status', error.message);
  }
}

/**
 * Retrieves execution logs
 * @param {string} executionId - Execution ID
 * @returns {Promise<Array>} Execution logs
 */
async function getExecutionLogs(executionId) {
  try {
    logger.info(`Getting execution logs: ${executionId}`);
    
    const url = `${config.kestra.url}/api/v1/logs/${executionId}`;
    
    const response = await axios.get(url, {
      ...getAxiosConfig(),
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    logger.error(`Failed to get execution logs: ${error.message}`, { error });
    throw new ExternalServiceError('Failed to get Kestra execution logs', error.message);
  }
}

/**
 * Checks if Kestra is available
 * @returns {Promise<boolean>} True if Kestra is available
 */
async function checkHealth() {
  try {
    // Try the flows endpoint with authentication (using /main/ path)
    const url = `${config.kestra.url}/api/v1/main/flows/${config.kestra.namespace}`;
    const response = await axios.get(url, { 
      ...getAxiosConfig(),
      timeout: 5000 
    });
    return response.status === 200;
  } catch (error) {
    // If we get 401, auth failed but Kestra is running
    if (error.response && error.response.status === 401) {
      logger.warn('Kestra is running but authentication failed - check credentials');
      return true;
    }
    // 404 means namespace doesn't exist but Kestra is running
    if (error.response && error.response.status === 404) {
      return true;
    }
    logger.error(`Kestra health check failed: ${error.message}`);
    return false;
  }
}

/**
 * Triggers the apply-fixes workflow via webhook
 * @param {Object} params - Workflow parameters
 * @returns {Promise<string>} Execution ID
 */
async function triggerApplyFixesWorkflow(params) {
  try {
    const { scanId, approvedFindingIds, repoUrl, branch } = params;
    
    logger.info(`Triggering apply-fixes workflow for scan: ${scanId}`, {
      approvedCount: approvedFindingIds.length
    });
    
    const url = `${config.kestra.url}/api/v1/executions/webhook/${config.kestra.namespace}/apply-fixes-flow/apply-fixes-webhook-key`;
    
    const response = await axios.post(
      url,
      {
        scanId,
        approvedFindingIds,
        repoUrl,
        branch
      },
      {
        ...getAxiosConfig(),
        timeout: 30000
      }
    );
    
    const executionId = response.data.id;
    logger.info(`Apply-fixes workflow triggered: ${executionId}`);
    
    return executionId;
  } catch (error) {
    logger.error(`Failed to trigger apply-fixes workflow: ${error.message}`, { error });
    throw new ExternalServiceError('Apply-fixes workflow trigger failed', error.message);
  }
}

module.exports = {
  triggerWorkflow,
  getExecutionStatus,
  getExecutionLogs,
  checkHealth,
  triggerApplyFixesWorkflow
};
