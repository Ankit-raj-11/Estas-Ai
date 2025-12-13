const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../config");
const logger = require("../utils/logger");
const { ExternalServiceError } = require("../utils/errors");

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(config.ai.apiKey);

/**
 * Generates a fix for a security issue using Claude AI
 * @param {Object} finding - Security finding object
 * @param {string} fileContent - Content of the vulnerable file
 * @param {Object} context - Additional context
 * @returns {Promise<Object>} Fix object with fixedCode, explanation, and patch
 */
async function generateFix(finding, fileContent, context = {}) {
  try {
    logger.info(`Generating AI fix for ${finding.file}:${finding.line}`, {
      rule: finding.rule,
    });

    const language = detectLanguage(finding.file);
    const codeSnippet = extractCodeSnippet(fileContent, finding.line, 10);

    const prompt = buildPrompt(finding, codeSnippet, language, context);

    const response = await callGeminiAPI(prompt);
    const fixData = parseAIResponse(response);

    const patch = generateUnifiedDiff(
      fileContent,
      fixData.fixedCode,
      finding.file
    );

    logger.info(
      `Successfully generated fix for ${finding.file}:${finding.line}`
    );

    return {
      fixed: true,
      patch,
      explanation: fixData.explanation,
      recommendations: fixData.recommendations,
      fixedCode: fixData.fixedCode,
    };
  } catch (error) {
    logger.error(`Failed to generate AI fix: ${error.message}`, {
      error,
      finding,
    });
    return {
      fixed: false,
      error: error.message,
    };
  }
}

/**
 * Detects programming language from file extension
 * @param {string} filename - File name
 * @returns {string} Language name
 */
function detectLanguage(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const languageMap = {
    js: "JavaScript",
    ts: "TypeScript",
    py: "Python",
    java: "Java",
    go: "Go",
    rb: "Ruby",
    php: "PHP",
    cs: "C#",
    cpp: "C++",
    c: "C",
  };
  return languageMap[ext] || "Unknown";
}

/**
 * Extracts code snippet around the vulnerable line
 * @param {string} fileContent - Full file content
 * @param {number} lineNumber - Line number of the issue
 * @param {number} contextLines - Number of lines before/after to include
 * @returns {string} Code snippet
 */
function extractCodeSnippet(fileContent, lineNumber, contextLines = 10) {
  const lines = fileContent.split("\n");
  const start = Math.max(0, lineNumber - contextLines - 1);
  const end = Math.min(lines.length, lineNumber + contextLines);

  return lines.slice(start, end).join("\n");
}

/**
 * Builds the prompt for Claude AI
 * @param {Object} finding - Security finding
 * @param {string} codeSnippet - Code snippet
 * @param {string} language - Programming language
 * @param {Object} context - Additional context
 * @returns {string} Formatted prompt
 */
function buildPrompt(finding, codeSnippet, language, context) {
  return `You are a security expert fixing code vulnerabilities.

File: ${finding.file}
Language: ${language}
Security Issue:
- Rule: ${finding.rule}
- Severity: ${finding.severity}
- Line: ${finding.line}
- Description: ${finding.message}
- Tool: ${finding.tool}

Current Code:
\`\`\`${language.toLowerCase()}
${codeSnippet}
\`\`\`

Provide:
1. Fixed code that can directly replace the vulnerable code
2. Brief explanation of the fix
3. Security recommendations

Return the response in this JSON format:
{
  "fixedCode": "...",
  "explanation": "...",
  "recommendations": "..."
}

Important: Only return valid JSON. The fixedCode should be the complete corrected code snippet.`;
}

/**
 * Calls Google Gemini API with the prompt using official SDK
 * @param {string} prompt - Formatted prompt
 * @returns {Promise<string>} AI response
 */
async function callGeminiAPI(prompt) {
  try {
    logger.info("Calling Gemini API for fix generation");

    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: config.ai.model,
      generationConfig: {
        maxOutputTokens: config.ai.maxTokens,
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
      },
    });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No response from Gemini API");
    }

    logger.info("Gemini API call successful");
    return text;
  } catch (error) {
    logger.error(`Gemini API call failed: ${error.message}`, { error });
    throw new ExternalServiceError("AI service unavailable", error.message);
  }
}

/**
 * Parses AI response and extracts fix data
 * @param {string} response - Raw AI response
 * @returns {Object} Parsed fix data
 */
function parseAIResponse(response) {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: return response as-is
    return {
      fixedCode: response,
      explanation: "AI provided fix without structured format",
      recommendations: "Review the fix carefully",
    };
  } catch (error) {
    logger.error(`Failed to parse AI response: ${error.message}`);
    throw new Error("Invalid AI response format");
  }
}

/**
 * Generates unified diff format patch
 * @param {string} originalContent - Original file content
 * @param {string} fixedContent - Fixed content
 * @param {string} filename - File name
 * @returns {string} Unified diff
 */
function generateUnifiedDiff(originalContent, fixedContent, filename) {
  // Simple diff generation (in production, use a proper diff library)
  return `--- a/${filename}
+++ b/${filename}
@@ -1,1 +1,1 @@
-${originalContent.split("\n")[0]}
+${fixedContent.split("\n")[0]}`;
}

module.exports = {
  generateFix,
};
