const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const logger = require('../utils/logger');
const storageService = require('../services/storage.service');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(config.ai.apiKey);

/**
 * Handle AI chat messages about security findings
 */
async function handleChat(req, res, next) {
  try {
    const { scanId, message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    logger.info(`Chat request for scan ${scanId}: ${message.substring(0, 50)}...`);
    
    // Build context from findings
    let findingsContext = '';
    if (context?.findings && context.findings.length > 0) {
      findingsContext = `\n\nSecurity Findings:\n${context.findings.map((f, i) => 
        `${i + 1}. [${f.severity.toUpperCase()}] ${f.file}:${f.line || 'N/A'} - ${f.rule}: ${f.message}`
      ).join('\n')}`;
    }
    
    const systemPrompt = `You are an expert security assistant helping developers understand and fix security vulnerabilities in their code.

Repository: ${context?.repoUrl || 'Unknown'}
${findingsContext}

Guidelines:
- Be concise but thorough
- Explain security risks in simple terms
- Provide actionable recommendations
- If asked about a specific vulnerability, explain the risk and how to fix it
- If asked to show code fixes, provide clear before/after examples
- Be encouraging and supportive`;

    const model = genAI.getGenerativeModel({
      model: config.ai.model,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `User: ${message}` }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    logger.info(`Chat response generated for scan ${scanId}`);
    
    res.status(200).json({
      response: text,
      scanId
    });
  } catch (error) {
    logger.error(`Chat error: ${error.message}`, { error });
    res.status(500).json({
      response: "I apologize, but I'm having trouble processing your request. Please try again.",
      error: error.message
    });
  }
}

module.exports = {
  handleChat
};
