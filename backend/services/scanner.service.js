const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');
const { InternalServerError } = require('../utils/errors');

const execAsync = promisify(exec);

/**
 * Runs Semgrep security scanner
 * @param {string} repoDir - Repository directory
 * @returns {Promise<Array>} Normalized findings
 */
async function runSemgrep(repoDir) {
  try {
    logger.info(`Running Semgrep in ${repoDir}`);
    const outputFile = path.join(repoDir, 'semgrep-results.json');
    
    await execAsync(`semgrep --config auto --json -o ${outputFile}`, {
      cwd: repoDir,
      timeout: 300000 // 5 minutes
    });
    
    const results = await fs.readFile(outputFile, 'utf8');
    return parseResults('semgrep', JSON.parse(results));
  } catch (error) {
    logger.error(`Semgrep scan failed: ${error.message}`, { error });
    return [];
  }
}

/**
 * Runs ESLint security scanner
 * @param {string} repoDir - Repository directory
 * @returns {Promise<Array>} Normalized findings
 */
async function runESLint(repoDir) {
  try {
    logger.info(`Running ESLint in ${repoDir}`);
    const outputFile = path.join(repoDir, 'eslint-results.json');
    
    await execAsync(`eslint . --format json -o ${outputFile}`, {
      cwd: repoDir,
      timeout: 300000
    }).catch(() => {}); // ESLint exits with error code if issues found
    
    const results = await fs.readFile(outputFile, 'utf8');
    return parseResults('eslint', JSON.parse(results));
  } catch (error) {
    logger.error(`ESLint scan failed: ${error.message}`, { error });
    return [];
  }
}

/**
 * Runs Bandit security scanner (Python)
 * @param {string} repoDir - Repository directory
 * @returns {Promise<Array>} Normalized findings
 */
async function runBandit(repoDir) {
  try {
    logger.info(`Running Bandit in ${repoDir}`);
    const outputFile = path.join(repoDir, 'bandit-results.json');
    
    await execAsync(`bandit -r . -f json -o ${outputFile}`, {
      cwd: repoDir,
      timeout: 300000
    }).catch(() => {}); // Bandit exits with error code if issues found
    
    const results = await fs.readFile(outputFile, 'utf8');
    return parseResults('bandit', JSON.parse(results));
  } catch (error) {
    logger.error(`Bandit scan failed: ${error.message}`, { error });
    return [];
  }
}

/**
 * Runs Gitleaks secret scanner
 * @param {string} repoDir - Repository directory
 * @returns {Promise<Array>} Normalized findings
 */
async function runGitleaks(repoDir) {
  try {
    logger.info(`Running Gitleaks in ${repoDir}`);
    const outputFile = path.join(repoDir, 'gitleaks-results.json');
    
    await execAsync(`gitleaks detect --report-format json --report-path ${outputFile}`, {
      cwd: repoDir,
      timeout: 300000
    }).catch(() => {}); // Gitleaks exits with error code if secrets found
    
    const results = await fs.readFile(outputFile, 'utf8');
    return parseResults('gitleaks', JSON.parse(results));
  } catch (error) {
    logger.error(`Gitleaks scan failed: ${error.message}`, { error });
    return [];
  }
}

/**
 * Parses and normalizes scan results from different tools
 * @param {string} toolName - Name of the scanning tool
 * @param {Object} jsonOutput - Raw JSON output from tool
 * @returns {Array} Normalized findings
 */
function parseResults(toolName, jsonOutput) {
  const findings = [];
  
  try {
    switch (toolName) {
      case 'semgrep':
        if (jsonOutput.results) {
          jsonOutput.results.forEach(result => {
            findings.push({
              file: result.path,
              line: result.start.line,
              severity: result.extra.severity || 'medium',
              rule: result.check_id,
              message: result.extra.message,
              tool: 'semgrep'
            });
          });
        }
        break;
        
      case 'eslint':
        jsonOutput.forEach(fileResult => {
          fileResult.messages.forEach(msg => {
            if (msg.severity === 2) { // Only errors
              findings.push({
                file: fileResult.filePath,
                line: msg.line,
                severity: 'medium',
                rule: msg.ruleId,
                message: msg.message,
                tool: 'eslint'
              });
            }
          });
        });
        break;
        
      case 'bandit':
        if (jsonOutput.results) {
          jsonOutput.results.forEach(result => {
            findings.push({
              file: result.filename,
              line: result.line_number,
              severity: result.issue_severity.toLowerCase(),
              rule: result.test_id,
              message: result.issue_text,
              tool: 'bandit'
            });
          });
        }
        break;
        
      case 'gitleaks':
        if (Array.isArray(jsonOutput)) {
          jsonOutput.forEach(result => {
            findings.push({
              file: result.File,
              line: result.StartLine,
              severity: 'high',
              rule: result.RuleID,
              message: result.Description,
              tool: 'gitleaks'
            });
          });
        }
        break;
    }
  } catch (error) {
    logger.error(`Failed to parse ${toolName} results: ${error.message}`, { error });
  }
  
  return findings;
}

/**
 * Aggregates and deduplicates findings from multiple tools
 * @param {Array} allResults - Array of findings from all tools
 * @returns {Array} Deduplicated findings
 */
function aggregateResults(allResults) {
  const seen = new Set();
  const aggregated = [];
  
  allResults.forEach(finding => {
    const key = `${finding.file}:${finding.line}:${finding.rule}`;
    if (!seen.has(key)) {
      seen.add(key);
      aggregated.push(finding);
    }
  });
  
  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  aggregated.sort((a, b) => {
    return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
  });
  
  logger.info(`Aggregated ${aggregated.length} unique findings`);
  return aggregated;
}

module.exports = {
  runSemgrep,
  runESLint,
  runBandit,
  runGitleaks,
  parseResults,
  aggregateResults
};
