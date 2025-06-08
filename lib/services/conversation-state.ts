import {
  ConversationContext,
  ConversationMessage,
  ConversationState,
  PersonaId,
  LanguageCode,
  ConversationStateTransition,
  PersonaSwitchTrigger,
} from '@/lib/types/assistant';

export class ConversationStateManager {
  private contexts: Map<string, ConversationContext> = new Map();
  private readonly sessionTimeout: number = 30 * 60 * 1000; // 30 minutes in milliseconds
  private readonly maxHistoryLength: number = 50;

  /**
   * Create a new conversation context
   */
  createContext(
    sessionId: string,
    initialPersona: PersonaId = 'gift-explorer',
    language: LanguageCode = 'he',
    userId?: string
  ): ConversationContext {
    const context: ConversationContext = {
      sessionId,
      userId,
      activePersona: initialPersona,
      language,
      state: 'greeting',
      history: [],
      userPreferences: {},
      collectedInformation: {},
      metadata: {
        startTime: new Date(),
        lastActivity: new Date(),
        totalMessages: 0,
        switchCount: 0,
        previousPersonas: [],
      },
    };

    this.contexts.set(sessionId, context);
    return context;
  }

  /**
   * Get conversation context by session ID
   */
  getContext(sessionId: string): ConversationContext | null {
    const context = this.contexts.get(sessionId);

    if (!context) {
      return null;
    }

    // Check if session has expired
    if (this.isSessionExpired(context)) {
      this.contexts.delete(sessionId);
      return null;
    }

    return context;
  }

  /**
   * Update conversation context
   */
  updateContext(
    sessionId: string,
    updates: Partial<ConversationContext>
  ): ConversationContext | null {
    const context = this.getContext(sessionId);
    if (!context) {
      return null;
    }

    const updatedContext = {
      ...context,
      ...updates,
      metadata: {
        ...context.metadata,
        ...updates.metadata,
        lastActivity: new Date(),
      },
    };

    this.contexts.set(sessionId, updatedContext);
    return updatedContext;
  }

  /**
   * Add a message to conversation history
   */
  addMessage(
    sessionId: string,
    message: Omit<ConversationMessage, 'id' | 'timestamp'>
  ): ConversationContext | null {
    const context = this.getContext(sessionId);
    if (!context) {
      return null;
    }

    const fullMessage: ConversationMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date(),
    };

    // Add message to history
    context.history.push(fullMessage);

    // Trim history if it exceeds max length
    if (context.history.length > this.maxHistoryLength) {
      context.history = context.history.slice(-this.maxHistoryLength);
    }

    // Update metadata
    context.metadata.totalMessages++;
    context.metadata.lastActivity = new Date();

    this.contexts.set(sessionId, context);
    return context;
  }

  /**
   * Transition conversation state
   */
  transitionState(
    sessionId: string,
    newState: ConversationState,
    trigger: string
  ): ConversationStateTransition | null {
    const context = this.getContext(sessionId);
    if (!context) {
      return null;
    }

    const transition: ConversationStateTransition = {
      from: context.state,
      to: newState,
      trigger,
      conditions: [],
      persona: context.activePersona,
    };

    // Validate transition
    if (this.isValidTransition(context.state, newState)) {
      context.state = newState;
      context.metadata.lastActivity = new Date();
      this.contexts.set(sessionId, context);
      return transition;
    }

    return null;
  }

  /**
   * Switch persona
   */
  switchPersona(sessionId: string, newPersona: PersonaId, reason: string): boolean {
    const context = this.getContext(sessionId);
    if (!context) {
      return false;
    }

    if (context.activePersona !== newPersona) {
      // Record previous persona
      context.metadata.previousPersonas.push(context.activePersona);
      context.metadata.switchCount++;

      // Switch to new persona
      context.activePersona = newPersona;
      context.metadata.lastActivity = new Date();

      this.contexts.set(sessionId, context);
      return true;
    }

    return false;
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(
    sessionId: string,
    preferences: Partial<ConversationContext['userPreferences']>
  ): boolean {
    const context = this.getContext(sessionId);
    if (!context) {
      return false;
    }

    context.userPreferences = {
      ...context.userPreferences,
      ...preferences,
    };

    context.metadata.lastActivity = new Date();
    this.contexts.set(sessionId, context);
    return true;
  }

  /**
   * Update collected information
   */
  updateCollectedInformation(
    sessionId: string,
    information: Partial<ConversationContext['collectedInformation']>
  ): boolean {
    const context = this.getContext(sessionId);
    if (!context) {
      return false;
    }

    context.collectedInformation = {
      ...context.collectedInformation,
      ...information,
    };

    context.metadata.lastActivity = new Date();
    this.contexts.set(sessionId, context);
    return true;
  }

  /**
   * Get conversation summary
   */
  getConversationSummary(sessionId: string): {
    messageCount: number;
    duration: number;
    personaSwitches: number;
    currentState: ConversationState;
    collectedData: Record<string, any>;
  } | null {
    const context = this.getContext(sessionId);
    if (!context) {
      return null;
    }

    const duration = new Date().getTime() - context.metadata.startTime.getTime();

    return {
      messageCount: context.metadata.totalMessages,
      duration,
      personaSwitches: context.metadata.switchCount,
      currentState: context.state,
      collectedData: {
        ...context.userPreferences,
        ...context.collectedInformation,
      },
    };
  }

  /**
   * Analyze persona switching triggers
   */
  analyzePersonaSwitchTriggers(sessionId: string): PersonaSwitchTrigger[] {
    const context = this.getContext(sessionId);
    if (!context) {
      return [];
    }

    const triggers: PersonaSwitchTrigger[] = [];

    // Analyze recent messages for switch triggers
    const recentMessages = context.history.slice(-5);

    for (const message of recentMessages) {
      if (message.role === 'user') {
        // Check for explicit persona requests
        if (this.containsPersonaRequest(message.content)) {
          triggers.push({
            type: 'user-request',
            conditions: ['explicit_request'],
            targetPersona: this.detectRequestedPersona(message.content),
            confidence: 0.9,
          });
        }

        // Check for context-based triggers
        const contextTrigger = this.detectContextBasedTrigger(message.content, context);
        if (contextTrigger) {
          triggers.push(contextTrigger);
        }
      }
    }

    return triggers;
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    const expiredSessionIds: string[] = [];

    for (const [sessionId, context] of this.contexts) {
      if (this.isSessionExpired(context)) {
        expiredSessionIds.push(sessionId);
      }
    }

    expiredSessionIds.forEach(sessionId => {
      this.contexts.delete(sessionId);
    });

    return expiredSessionIds.length;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): string[] {
    const activeSessions: string[] = [];

    for (const [sessionId, context] of this.contexts) {
      if (!this.isSessionExpired(context)) {
        activeSessions.push(sessionId);
      }
    }

    return activeSessions;
  }

  // Private helper methods

  private isSessionExpired(context: ConversationContext): boolean {
    const now = new Date().getTime();
    const lastActivity = context.metadata.lastActivity.getTime();
    return now - lastActivity > this.sessionTimeout;
  }

  private isValidTransition(from: ConversationState, to: ConversationState): boolean {
    const validTransitions: Record<ConversationState, ConversationState[]> = {
      greeting: ['exploring', 'clarifying'],
      exploring: ['clarifying', 'recommending', 'closing'],
      clarifying: ['exploring', 'recommending', 'closing'],
      recommending: ['clarifying', 'exploring', 'closing'],
      closing: ['greeting'], // Can restart
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private containsPersonaRequest(content: string): boolean {
    const personaKeywords = {
      he: ['רומנטי', 'אישי', 'מתנה', 'יועץ', 'עזרה'],
      en: ['romantic', 'personal', 'gift', 'consultant', 'help'],
      ar: ['رومانسي', 'شخصي', 'هدية', 'مستشار', 'مساعدة'],
    };

    return Object.values(personaKeywords).some(keywords =>
      keywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()))
    );
  }

  private detectRequestedPersona(content: string): PersonaId {
    const lowerContent = content.toLowerCase();

    if (
      lowerContent.includes('romantic') ||
      lowerContent.includes('רומנטי') ||
      lowerContent.includes('رومانسي')
    ) {
      return 'romantic-giver';
    }

    if (
      lowerContent.includes('personal') ||
      lowerContent.includes('אישי') ||
      lowerContent.includes('شخصي')
    ) {
      return 'self-expressive-buyer';
    }

    return 'gift-explorer';
  }

  private detectContextBasedTrigger(
    content: string,
    context: ConversationContext
  ): PersonaSwitchTrigger | null {
    // Analyze content for context clues
    const lowerContent = content.toLowerCase();

    // Check for romantic context
    if (this.containsRomanticContext(lowerContent)) {
      return {
        type: 'context-based',
        conditions: ['romantic_keywords'],
        targetPersona: 'romantic-giver',
        confidence: 0.7,
      };
    }

    // Check for self-expression context
    if (this.containsSelfExpressionContext(lowerContent)) {
      return {
        type: 'context-based',
        conditions: ['self_expression_keywords'],
        targetPersona: 'self-expressive-buyer',
        confidence: 0.7,
      };
    }

    return null;
  }

  private containsRomanticContext(content: string): boolean {
    const romanticKeywords = [
      'love',
      'אהבה',
      'حب',
      'anniversary',
      'יום השנה',
      'ذكرى سنوية',
      'valentine',
      'חג האהבה',
    ];
    return romanticKeywords.some(keyword => content.includes(keyword.toLowerCase()));
  }

  private containsSelfExpressionContext(content: string): boolean {
    const selfExpressionKeywords = [
      'style',
      'סגנון',
      'أسلوب',
      'personality',
      'אישיות',
      'شخصية',
      'unique',
      'ייחודי',
      'فريد',
    ];
    return selfExpressionKeywords.some(keyword => content.includes(keyword.toLowerCase()));
  }
}

// Singleton instance
export const conversationStateManager = new ConversationStateManager();
