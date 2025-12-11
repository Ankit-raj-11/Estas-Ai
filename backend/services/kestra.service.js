const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const { ExternalServiceError } = require('../utils/errors');

/**
 * Triggers a Kestra workflow
 * @param {string} flowId - Workflow ID
 * @param {Object} inputs - Workflow input parameters
 * @returns {Promise<string>} Execution ID
 */
async function triggerWorkflow(flowId, inputs) {
  try {
    logger.info(`Triggering Kestra workflow: ${flowId}`, { inputs });
    
    const url = `${config.kestra.url}/api/v1/executions/${config.kestra.namespace}/${flowId}`;
    
    const response = await axios.post(
      url,
      inputs,
      {
        headers: {
          'Content-Type': 'application/json'
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
    const url = `${config.kestra.url}/api/v1/health`;
    const response = await axios.get(url, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    logger.error(`Kestra health check failed: ${error.message}`);
    return false;
  }
}

module.exports = {
  triggerWorkflow,
  getExecutionStatus,
  getExecutionLogs,
  checkHealth
};
