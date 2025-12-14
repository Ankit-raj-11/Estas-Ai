const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabaseService = require('./supabase.service');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * AI Chat Service for Sentinel Flow
 * Uses Google Gemini for interactive security discussions and custom fix generation
 */
class AIChatService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.ai.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: config.ai.model,
      generationConfig: {
        maxOutputTokens: config.ai.maxTokens,
        temperature: 0.7,
        topP: 0.9,
        topK: 40
      }
    });
  }

  /**
   * Start a new conversation about a finding
   */
  async startConversation(findingId, userId = 'anonymous') {
    const finding = await supabaseService.getFinding(findingId);
    
    if (!finding) {
      throw new Error(`Finding not found: ${findingId}`);
    }

    const conversation = await supabaseService.createConversation({
      finding_id: findingId,
      user_id: userId
    });

    // Create system context message
    const systemContext = {
      role: 'system',
      content: `You are Sentinel AI, a helpful security expert assisting a developer understand and fix a vulnerability.

Finding Details:
- Type: ${finding.vulnerability_type}
- Severity: ${finding.severity}
- File: ${finding.file_path}:${finding.line_number}
- Tool: ${finding.tool}
- Current Fix Proposed: ${finding.fixed_code ? 'Yes' : 'No'}
- Explanation: ${finding.explanation}
- AI Decision: ${finding.ai_decision}
- AI Reasoning: ${finding.ai_reasoning}

Your goals:
1. Help the user understand the security risk in simple, clear terms
2. Listen to their concerns and constraints
3. Suggest alternative fixes if they have specific requirements
4. Be educational and patient
5. Adapt fixes based on their business logic needs
6. Explain trade-offs between security and functionality

Keep responses concise but informative. Use code examples when helpful.`
    };

    await supabaseService.saveMessage(conversation.id, systemContext);

    logger.info(`Started conversation ${conversation.id} for finding ${findingId}`);

    return { 
      conversationId: conversation.id, 
      finding,
      welcomeMessage: `Hi! I'm Sentinel AI. I see you want to discuss a ${finding.severity} severity ${finding.vulnerability_type} issue in ${finding.file_path}. How can I help you understand or address this vulnerability?`
    };
  }

  /**
   * Send a message in an existing conversation
   */
  async sendMessage(conversationId, userMessage) {
    const conversation = await supabaseService.getConversation(conversationId);
    
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const history = await supabaseService.getConversationHistory(conversationId);

    // Save user message
    await supabaseService.saveMessage(conversationId, {
      role: 'user',
      content: userMessage
    });

    // Build conversation for Gemini
    const chatHistory = history
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    // Get system context
    const systemMessage = history.find(m => m.role === 'system');
    const systemContext = systemMessage ? systemMessage.content : '';

    try {
      // Start chat with history
      const chat = this.model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7
        }
      });

      // Send message with system context prepended if first user message
      const prompt = chatHistory.length === 0 
        ? `${systemContext}\n\nUser: ${userMessage}`
        : userMessage;

      const result = await chat.sendMessage(prompt);
      const aiResponse = result.response.text();

      // Save AI response
      await supabaseService.saveMessage(conversationId, {
        role: 'assistant',
        content: aiResponse
      });

      logger.info(`Message sent in conversation ${conversationId}`);

      return { 
        message: aiResponse, 
        conversationId 
      };
    } catch (error) {
      logger.error(`Failed to send message: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Generate a custom fix based on user requirements
   */
  async generateCustomFix(findingId, conversationId, userRequirements) {
    const finding = await supabaseService.getFinding(findingId);

    if (!finding) {
      throw new Error(`Finding not found: ${findingId}`);
    }

    const prompt = `You are a security-focused code generator for Sentinel Flow.

ORIGINAL VULNERABLE CODE:
\`\`\`
${finding.original_code}
\`\`\`

VULNERABILITY DETAILS:
- Type: ${finding.vulnerability_type}
- Severity: ${finding.severity}
- File: ${finding.file_path}
- Line: ${finding.line_number}
- Description: ${finding.explanation}

OUR STANDARD FIX:
\`\`\`
${finding.fixed_code || 'No standard fix generated yet'}
\`\`\`

USER'S REQUIREMENTS/CONSTRAINTS:
${userRequirements}

Generate a NEW fix that:
1. Addresses the security vulnerability
2. Meets the user's specific requirements
3. Maintains code functionality
4. Follows their stated constraints

Return ONLY valid JSON (no markdown code blocks):
{
  "fixedCode": "complete fixed code here - the ENTIRE file content with the fix applied",
  "explanation": "why this approach meets both security and user requirements",
  "tradeoffs": "any security tradeoffs made to meet user needs (or 'None' if no tradeoffs)",
  "confidence": 0.85
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      // Clean and parse response
      let cleanResponse = responseText.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }

      const customFix = JSON.parse(cleanResponse);

      // Store custom fix request
      const customFixRecord = await supabaseService.createCustomFixRequest({
        finding_id: findingId,
        user_requirements: userRequirements,
        ai_generated_fix: customFix.fixedCode,
        status: 'generated',
        metadata: {
          explanation: customFix.explanation,
          tradeoffs: customFix.tradeoffs,
          confidence: customFix.confidence,
          conversation_id: conversationId
        }
      });

      logger.info(`Custom fix generated for finding ${findingId}`);

      return {
        customFixId: customFixRecord.id,
        ...customFix
      };
    } catch (error) {
      logger.error(`Failed to generate custom fix: ${error.message}`, { error });
      throw error;
    }
  }

  /**
   * Record user feedback and satisfaction
   */
  async recordFeedback(findingId, conversationId, feedbackData) {
    const feedback = await supabaseService.createUserFeedback({
      finding_id: findingId,
      conversation_id: conversationId,
      satisfaction_score: feedbackData.satisfactionScore,
      decision: feedbackData.decision,
      final_action: feedbackData.finalAction,
      feedback_text: feedbackData.feedbackText
    });

    logger.info(`Feedback recorded for finding ${findingId}`, {
      satisfaction: feedbackData.satisfactionScore,
      decision: feedbackData.decision
    });

    return feedback;
  }

  /**
   * Analyze scan results and make AI decisions (used by Kestra workflow)
   */
  async analyzeFindings(scanResults, repoUrl, branch) {
    const prompt = `You are Sentinel AI, an expert security analyst. Analyze security scan results and make intelligent decisions.

REPOSITORY: ${repoUrl}
BRANCH: ${branch}

SCAN RESULTS:
${JSON.stringify(scanResults, null, 2)}

Your job:
1. SUMMARIZE: Create executive summary of security posture
2. PRIORITIZE: Categorize findings by risk level
3. DECIDE: Determine which fixes are safe to auto-apply vs need human review

AUTO-FIX CRITERIA (recommend auto-fix for):
- Low/Medium severity
- Well-known patterns (SQL injection, XSS, hardcoded secrets)
- High confidence (>80%)
- No business logic changes
- Simple, straightforward fixes

MANUAL REVIEW CRITERIA (require human review for):
- High/Critical severity
- Authentication/authorization issues
- Database schema changes
- Potential breaking changes
- Complex business logic
- Low confidence fixes

Return ONLY valid JSON (no markdown):
{
  "executive_summary": "Brief 2-3 sentence security posture overview",
  "risk_score": 7.5,
  "total_findings": 15,
  "severity_breakdown": {"critical": 0, "high": 2, "medium": 8, "low": 5},
  "auto_fix_recommendations": [
    {"finding_id": "id_here", "reason": "Safe pattern fix", "confidence": 0.95}
  ],
  "manual_review_required": [
    {"finding_id": "id_here", "reason": "Needs human review because...", "urgency": "high"}
  ],
  "top_3_priorities": ["Priority 1", "Priority 2", "Priority 3"]
}`;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.3
        }
      });

      const responseText = result.response.text();
      
      // Clean response
      let cleanResponse = responseText.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }

      const analysis = JSON.parse(cleanResponse);
      
      logger.info('AI analysis completed', {
        totalFindings: analysis.total_findings,
        autoFix: analysis.auto_fix_recommendations?.length || 0,
        manualReview: analysis.manual_review_required?.length || 0
      });

      return analysis;
    } catch (error) {
      logger.error(`Failed to analyze findings: ${error.message}`, { error });
      throw error;
    }
  }
}

module.exports = new AIChatService();
