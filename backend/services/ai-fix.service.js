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

    const prompt = buildPrompt(
      finding,
      fileContent,
      codeSnippet,
      language,
      context
    );

    const response = await callGeminiAPI(prompt);
    const fixData = parseAIResponse(response);

    // Apply the fix to the full file content
    const fixedFileContent = applyFixToFile(
      fileContent,
      fixData.fixedCode,
      finding.line,
      codeSnippet
    );

    const patch = generateUnifiedDiff(
      fileContent,
      fixedFileContent,
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
      fixedCode: fixedFileContent,
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
 * @param {string} fileContent - Full file content
 * @param {string} codeSnippet - Code snippet around the issue
 * @param {string} language - Programming language
 * @param {Object} context - Additional context
 * @returns {string} Formatted prompt
 */
function buildPrompt(finding, fileContent, codeSnippet, language, context) {
  return `You are a security expert fixing code vulnerabilities.

File: ${finding.file}
Language: ${language}
Security Issue:
- Rule: ${finding.rule}
- Severity: ${finding.severity}
- Line: ${finding.line}
- Description: ${finding.message}
- Tool: ${finding.tool}

Vulnerable Code Section (around line ${finding.line}):
\`\`\`${language.toLowerCase()}
${codeSnippet}
\`\`\`

Full File Content:
\`\`\`${language.toLowerCase()}
${fileContent}
\`\`\`

Task: Fix the security vulnerability and return the COMPLETE fixed file content.

Return the response in this JSON format:
{
  "fixedCode": "... COMPLETE FIXED FILE CONTENT HERE ...",
  "explanation": "Brief explanation of what was changed and why",
  "recommendations": "Additional security recommendations"
}

CRITICAL: 
- The "fixedCode" field MUST contain the ENTIRE file content with the fix applied
- Do NOT return just a snippet - return the COMPLETE file
- Only return valid JSON
- Ensure the fix addresses the security issue without breaking functionality`;
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
    logger.info("Parsing AI response", { responseLength: response.length });

    // Try to extract JSON from response (handle markdown code blocks)
    let jsonText = response;

    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*/g, "").replace(/```\s*/g, "");

    // Try to extract JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Validate that fixedCode exists and is not empty
      if (!parsed.fixedCode || parsed.fixedCode.trim().length === 0) {
        logger.warn("AI returned empty fixedCode, using fallback");
        throw new Error("Empty fixedCode in AI response");
      }

      logger.info("Successfully parsed AI response", {
        hasFixedCode: !!parsed.fixedCode,
        fixedCodeLength: parsed.fixedCode?.length,
      });

      return parsed;
    }

    // Fallback: return response as-is
    logger.warn("Could not extract JSON from AI response, using raw response");
    return {
      fixedCode: response,
      explanation: "AI provided fix without structured format",
      recommendations: "Review the fix carefully",
    };
  } catch (error) {
    logger.error(`Failed to parse AI response: ${error.message}`, {
      responsePreview: response.substring(0, 200),
    });
    throw new Error("Invalid AI response format");
  }
}

/**
 * Applies the AI-generated fix to the full file content
 * @param {string} originalContent - Original file content
 * @param {string} fixedCode - AI-generated fixed code (could be snippet or full file)
 * @param {number} lineNumber - Line number of the issue
 * @param {string} originalSnippet - Original code snippet that was sent to AI
 * @returns {string} Complete fixed file content
 */
function applyFixToFile(
  originalContent,
  fixedCode,
  lineNumber,
  originalSnippet
) {
  // If AI returned the full file (contains multiple lines and looks complete), use it directly
  const fixedLines = fixedCode.split("\n");
  const originalLines = originalContent.split("\n");

  // Check if AI returned full file (has similar line count)
  if (fixedLines.length > originalLines.length * 0.8) {
    logger.info("AI returned full file content, using directly");
    return fixedCode;
  }

  // Otherwise, AI returned a snippet - try to replace the vulnerable section
  logger.info("AI returned snippet, applying to original file");

  // Find the snippet in the original content
  const snippetLines = originalSnippet.split("\n");
  const startLine = Math.max(0, lineNumber - 11); // -11 because we extracted 10 lines before

  // Replace the snippet section with the fixed code
  const beforeFix = originalLines.slice(0, startLine);
  const afterFix = originalLines.slice(startLine + snippetLines.length);

  return [...beforeFix, ...fixedLines, ...afterFix].join("\n");
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
