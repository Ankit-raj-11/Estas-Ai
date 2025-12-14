const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

/**
 * Supabase Service for Sentinel Flow
 * Handles all database operations for scans, findings, conversations, and feedback
 */
class SupabaseService {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      logger.warn('Supabase credentials not configured - database features disabled');
      this.client = null;
    } else {
      this.client = createClient(supabaseUrl, supabaseKey);
      logger.info('Supabase client initialized');
    }
  }

  /**
   * Check if Supabase is configured
   */
  isConfigured() {
    return this.client !== null;
  }

  // ==========================================
  // SCAN OPERATIONS
  // ==========================================

  /**
   * Create a new scan record
   */
  async createScan(scanData) {
    if (!this.client) throw new Error('Supabase not configured');
    
    const { data, error } = await this.client
      .from('scans')
      .insert({
        id: scanData.id,
        repo_url: scanData.repo_url,
        branch: scanData.branch || 'main',
        status: scanData.status || 'initiated',
        ai_summary: scanData.ai_summary || null,
        risk_score: scanData.risk_score || null,
        total_findings: scanData.total_findings || 0,
        auto_fixed: scanData.auto_fixed || 0,
        needs_review: scanData.needs_review || 0
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create scan', { error });
      throw error;
    }

    logger.info(`Scan created: ${scanData.id}`);
    return data;
  }

  /**
   * Update scan record
   */
  async updateScan(scanId, updates) {
    if (!this.client) throw new Error('Supabase not configured');

    const updateData = { ...updates };
    if (updates.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await this.client
      .from('scans')
      .update(updateData)
      .eq('id', scanId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update scan', { error, scanId });
      throw error;
    }

    return data;
  }

  /**
   * Get scan by ID
   */
  async getScan(scanId) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Failed to get scan', { error, scanId });
      throw error;
    }

    return data;
  }

  /**
   * Get all scans
   */
  async getAllScans() {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('scans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to get all scans', { error });
      throw error;
    }

    return data;
  }

  // ==========================================
  // FINDINGS OPERATIONS
  // ==========================================

  /**
   * Store multiple findings
   */
  async storeFindings(findings) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('findings')
      .insert(findings)
      .select();

    if (error) {
      logger.error('Failed to store findings', { error });
      throw error;
    }

    logger.info(`Stored ${findings.length} findings`);
    return data;
  }

  /**
   * Get finding by ID
   */
  async getFinding(findingId) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('findings')
      .select('*')
      .eq('id', findingId)
      .single();

    if (error) {
      logger.error('Failed to get finding', { error, findingId });
      throw error;
    }

    return data;
  }

  /**
   * Get findings by scan ID
   */
  async getFindingsByScan(scanId) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('findings')
      .select('*')
      .eq('scan_id', scanId)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Failed to get findings', { error, scanId });
      throw error;
    }

    return data;
  }

  /**
   * Update finding status
   */
  async updateFindingStatus(findingId, status) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('findings')
      .update({ status })
      .eq('id', findingId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update finding status', { error, findingId });
      throw error;
    }

    return data;
  }

  /**
   * Update finding with fix
   */
  async updateFindingFix(findingId, fixData) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('findings')
      .update({
        fixed_code: fixData.fixed_code,
        explanation: fixData.explanation
      })
      .eq('id', findingId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update finding fix', { error, findingId });
      throw error;
    }

    return data;
  }

  /**
   * Get approved findings for a scan
   */
  async getApprovedFindings(scanId) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('findings')
      .select('*')
      .eq('scan_id', scanId)
      .eq('status', 'approved');

    if (error) {
      logger.error('Failed to get approved findings', { error, scanId });
      throw error;
    }

    return data;
  }

  // ==========================================
  // AI DECISIONS OPERATIONS
  // ==========================================

  /**
   * Store AI decision
   */
  async storeAIDecision(decision) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('ai_decisions')
      .insert({
        scan_id: decision.scan_id,
        decision_type: decision.decision_type,
        reasoning: decision.reasoning,
        confidence: decision.confidence,
        metadata: decision.metadata
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to store AI decision', { error });
      throw error;
    }

    return data;
  }

  // ==========================================
  // CONVERSATION OPERATIONS
  // ==========================================

  /**
   * Create a new conversation
   */
  async createConversation(data) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data: conversation, error } = await this.client
      .from('finding_conversations')
      .insert({
        finding_id: data.finding_id,
        user_id: data.user_id || 'anonymous'
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create conversation', { error });
      throw error;
    }

    return conversation;
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('finding_conversations')
      .select('*, findings(*)')
      .eq('id', conversationId)
      .single();

    if (error) {
      logger.error('Failed to get conversation', { error, conversationId });
      throw error;
    }

    return data;
  }

  /**
   * Save a message to conversation
   */
  async saveMessage(conversationId, message) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('conversation_messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        metadata: message.metadata || null
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to save message', { error, conversationId });
      throw error;
    }

    return data;
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(conversationId) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Failed to get conversation history', { error, conversationId });
      throw error;
    }

    return data;
  }

  // ==========================================
  // CUSTOM FIX REQUESTS
  // ==========================================

  /**
   * Create custom fix request
   */
  async createCustomFixRequest(data) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data: request, error } = await this.client
      .from('custom_fix_requests')
      .insert({
        finding_id: data.finding_id,
        user_requirements: data.user_requirements,
        ai_generated_fix: data.ai_generated_fix,
        status: data.status || 'pending',
        metadata: data.metadata || null
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create custom fix request', { error });
      throw error;
    }

    return request;
  }

  /**
   * Update custom fix request status
   */
  async updateCustomFixStatus(requestId, status) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('custom_fix_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update custom fix status', { error, requestId });
      throw error;
    }

    return data;
  }

  /**
   * Get latest custom fix for a finding
   */
  async getLatestCustomFix(findingId) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('custom_fix_requests')
      .select('*')
      .eq('finding_id', findingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Failed to get custom fix', { error, findingId });
      throw error;
    }

    return data;
  }

  // ==========================================
  // USER FEEDBACK OPERATIONS
  // ==========================================

  /**
   * Create user feedback
   */
  async createUserFeedback(data) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data: feedback, error } = await this.client
      .from('user_feedback')
      .insert({
        finding_id: data.finding_id,
        conversation_id: data.conversation_id || null,
        satisfaction_score: data.satisfaction_score,
        decision: data.decision,
        final_action: data.final_action,
        feedback_text: data.feedback_text || null
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create user feedback', { error });
      throw error;
    }

    return feedback;
  }

  /**
   * Get feedback stats for a scan
   */
  async getFeedbackStats(scanId) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data: findings } = await this.client
      .from('findings')
      .select('id')
      .eq('scan_id', scanId);

    if (!findings || findings.length === 0) {
      return { avgSatisfaction: 0, totalFeedback: 0 };
    }

    const findingIds = findings.map(f => f.id);

    const { data: feedback, error } = await this.client
      .from('user_feedback')
      .select('satisfaction_score')
      .in('finding_id', findingIds);

    if (error) {
      logger.error('Failed to get feedback stats', { error, scanId });
      throw error;
    }

    const totalFeedback = feedback.length;
    const avgSatisfaction = totalFeedback > 0
      ? feedback.reduce((sum, f) => sum + f.satisfaction_score, 0) / totalFeedback
      : 0;

    return { avgSatisfaction, totalFeedback };
  }
}

module.exports = new SupabaseService();
