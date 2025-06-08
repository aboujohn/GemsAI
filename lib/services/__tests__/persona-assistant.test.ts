import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PersonaAssistant } from '../persona-assistant';
import { ConversationStateManager } from '../conversation-state';
import { conversationFlowManager } from '../conversation-flow';
import { interactionPatternManager } from '../interaction-patterns';
import { PersonaId, LanguageCode, ConversationState } from '@/lib/types/assistant';

// Mock OpenAI
jest.mock('@/lib/services/openai', () => ({
  openaiClient: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
}));

describe('Persona Assistant System', () => {
  let assistant: PersonaAssistant;
  let stateManager: ConversationStateManager;
  const sessionId = 'test-session-123';

  beforeEach(() => {
    assistant = new PersonaAssistant();
    stateManager = new ConversationStateManager();
    jest.clearAllMocks();
  });

  describe('Persona Selection and Switching', () => {
    it('should initialize with gift-explorer persona by default', async () => {
      const context = await stateManager.getOrCreateContext(sessionId);
      expect(context.currentPersona).toBe('gift-explorer');
    });

    it('should switch personas based on user context', async () => {
      const romanticInput = 'I want to buy an engagement ring for my girlfriend';

      // Simulate persona switch detection
      const switchResult = stateManager.detectPersonaSwitch(sessionId, romanticInput);

      expect(switchResult).toEqual({
        shouldSwitch: true,
        suggestedPersona: 'romantic-giver',
        reason: 'context_based',
        confidence: expect.any(Number),
      });
    });

    it('should maintain conversation context during persona switches', async () => {
      const context = await stateManager.getOrCreateContext(sessionId);

      // Add some context
      await stateManager.updateContext(sessionId, {
        collectedInformation: {
          occasion: 'anniversary',
          recipient: 'girlfriend',
        },
      });

      // Switch persona
      await stateManager.switchPersona(sessionId, 'romantic-giver', 'user_request');

      const updatedContext = await stateManager.getOrCreateContext(sessionId);
      expect(updatedContext.currentPersona).toBe('romantic-giver');
      expect(updatedContext.collectedInformation.occasion).toBe('anniversary');
    });
  });

  describe('Conversation Flow Management', () => {
    beforeEach(() => {
      conversationFlowManager.startFlow(sessionId, 'jewelry-consultation');
    });

    it('should start with greeting state', () => {
      const currentNode = conversationFlowManager.getCurrentNode(sessionId);
      expect(currentNode?.state).toBe('greeting');
    });

    it('should transition from greeting to exploring', () => {
      const userInput = "I'm looking for a gift for my mother";
      const context = { collectedInformation: {} };

      const transition = conversationFlowManager.evaluateTransition(sessionId, userInput, context);

      expect(transition).toEqual({
        from: 'greeting',
        to: 'exploring',
        trigger: 'user_mentions_gift',
        conditions: [],
        persona: 'gift-explorer',
      });
    });

    it('should handle unclear user input by moving to clarifying', () => {
      const userInput = 'um, help';
      const context = { collectedInformation: {} };

      const transition = conversationFlowManager.evaluateTransition(sessionId, userInput, context);

      expect(transition).toEqual({
        from: 'greeting',
        to: 'clarifying',
        trigger: 'unclear_intent',
        conditions: [],
        persona: 'gift-explorer',
      });
    });
  });

  describe('Interaction Pattern Matching', () => {
    it('should find appropriate patterns for greeting state', () => {
      const patterns = interactionPatternManager.findMatchingPatterns(
        'first_visit',
        'greeting',
        'gift-explorer'
      );

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].id).toBe('greeting_first_time');
    });

    it('should generate appropriate responses based on patterns', () => {
      const response = interactionPatternManager.generateResponse(
        'first_visit',
        'greeting',
        'gift-explorer',
        'he'
      );

      expect(response).toBeDefined();
      expect(response?.content).toContain('יועץ התכשיטים');
      expect(response?.followUpQuestions.length).toBeGreaterThan(0);
    });

    it('should handle budget discussions tactfully', () => {
      const response = interactionPatternManager.generateResponse(
        'budget_question',
        'exploring',
        'gift-explorer',
        'he'
      );

      expect(response).toBeDefined();
      expect(response?.pattern).toBe('budget_inquiry');
      expect(response?.content).toContain('תקציב');
    });
  });

  describe('Multilingual Support', () => {
    const languages: LanguageCode[] = ['he', 'en', 'ar'];

    languages.forEach(language => {
      it(`should generate responses in ${language}`, () => {
        const response = interactionPatternManager.generateResponse(
          'first_visit',
          'greeting',
          'gift-explorer',
          language
        );

        expect(response).toBeDefined();
        expect(response?.content).toBeTruthy();
        expect(response?.followUpQuestions.length).toBeGreaterThan(0);
      });
    });

    it('should maintain persona characteristics across languages', () => {
      const heResponse = interactionPatternManager.generateResponse(
        'emotional_story',
        'exploring',
        'romantic-giver',
        'he'
      );

      const enResponse = interactionPatternManager.generateResponse(
        'emotional_story',
        'exploring',
        'romantic-giver',
        'en'
      );

      expect(heResponse?.pattern).toBe(enResponse?.pattern);
      expect(heResponse?.pattern).toBe('emotional_connection');
    });
  });

  describe('AI Response Generation', () => {
    beforeEach(() => {
      // Mock successful OpenAI response
      const mockCreate =
        jest.requireMock('@/lib/services/openai').openaiClient.chat.completions.create;
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                content: "Hello! I'm here to help you find the perfect jewelry.",
                confidence: 0.9,
                suggestedPersona: 'gift-explorer',
                stateTransition: 'exploring',
                insights: ['User is looking for jewelry guidance'],
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      });
    });

    it('should generate appropriate AI responses', async () => {
      const response = await assistant.generateResponse({
        message: 'I need help choosing jewelry',
        sessionId,
        persona: 'gift-explorer',
        language: 'en',
      });

      expect(response.success).toBe(true);
      expect(response.data?.content).toBeTruthy();
      expect(response.data?.metadata.confidence).toBeGreaterThan(0);
    });

    it('should handle AI API errors gracefully', async () => {
      // Mock API error
      const mockCreate =
        jest.requireMock('@/lib/services/openai').openaiClient.chat.completions.create;
      mockCreate.mockRejectedValue(new Error('API Error'));

      const response = await assistant.generateResponse({
        message: 'Hello',
        sessionId,
        persona: 'gift-explorer',
        language: 'en',
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('AI service');
    });
  });

  describe('Context Management', () => {
    it('should track conversation history', async () => {
      await stateManager.addMessage(sessionId, {
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      });

      await stateManager.addMessage(sessionId, {
        role: 'assistant',
        content: 'Hi there!',
        timestamp: new Date(),
        persona: 'gift-explorer',
      });

      const context = await stateManager.getOrCreateContext(sessionId);
      expect(context.messages.length).toBe(2);
      expect(context.messages[0].role).toBe('user');
      expect(context.messages[1].role).toBe('assistant');
    });

    it('should collect user information throughout conversation', async () => {
      await stateManager.updateContext(sessionId, {
        collectedInformation: {
          occasion: 'birthday',
          budget: '500-1000',
          style: 'modern',
        },
      });

      const context = await stateManager.getOrCreateContext(sessionId);
      expect(context.collectedInformation.occasion).toBe('birthday');
      expect(context.collectedInformation.budget).toBe('500-1000');
      expect(context.collectedInformation.style).toBe('modern');
    });

    it('should handle session timeout', async () => {
      const expiredSessionId = 'expired-session';

      // Create context with old timestamp
      const oldTimestamp = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      stateManager['contexts'].set(expiredSessionId, {
        sessionId: expiredSessionId,
        currentPersona: 'gift-explorer',
        conversationState: 'greeting',
        messages: [],
        collectedInformation: {},
        userPreferences: {},
        createdAt: oldTimestamp,
        lastActivity: oldTimestamp,
        metadata: {},
      });

      const context = await stateManager.getOrCreateContext(expiredSessionId);

      // Should create new context due to timeout
      expect(context.createdAt.getTime()).toBeGreaterThan(oldTimestamp.getTime());
    });
  });

  describe('Performance and Analytics', () => {
    it('should track response generation time', async () => {
      const startTime = Date.now();

      await assistant.generateResponse({
        message: 'Test message',
        sessionId,
        persona: 'gift-explorer',
        language: 'en',
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond within reasonable time (adjust threshold as needed)
      expect(responseTime).toBeLessThan(5000); // 5 seconds
    });

    it('should track token usage', async () => {
      const response = await assistant.generateResponse({
        message: 'Tell me about jewelry styles',
        sessionId,
        persona: 'gift-explorer',
        language: 'en',
      });

      expect(response.data?.metadata.tokensUsed).toBeDefined();
      expect(response.data?.metadata.tokensUsed?.total).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should provide fallback responses when patterns fail', () => {
      const response = interactionPatternManager.generateResponse(
        'unknown_trigger',
        'greeting',
        'gift-explorer',
        'he'
      );

      // Should return null for unknown triggers, allowing fallback handling
      expect(response).toBeNull();
    });

    it('should handle invalid persona gracefully', async () => {
      const invalidPersona = 'invalid-persona' as PersonaId;

      const response = await assistant.generateResponse({
        message: 'Hello',
        sessionId,
        persona: invalidPersona,
        language: 'en',
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Invalid persona');
    });

    it('should handle flow errors with fallback nodes', () => {
      const currentNode = conversationFlowManager.getCurrentNode(sessionId);
      expect(currentNode?.fallbackNode).toBeDefined();

      const success = conversationFlowManager.handleFlowError(sessionId);
      expect(success).toBe(true);

      const fallbackNode = conversationFlowManager.getCurrentNode(sessionId);
      expect(fallbackNode?.id).toBe(currentNode?.fallbackNode);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete conversation flow', async () => {
      // Start flow
      conversationFlowManager.startFlow(sessionId, 'jewelry-consultation');

      // User greeting
      let response = await assistant.generateResponse({
        message: 'Hi, I need help with jewelry',
        sessionId,
        persona: 'gift-explorer',
        language: 'en',
      });

      expect(response.success).toBe(true);

      // User mentions romance - should suggest persona switch
      response = await assistant.generateResponse({
        message: 'I want to buy an engagement ring',
        sessionId,
        persona: 'gift-explorer',
        language: 'en',
      });

      expect(response.success).toBe(true);
      expect(response.data?.suggestedPersona).toBe('romantic-giver');
    });

    it('should maintain consistency across multiple interactions', async () => {
      const interactions = [
        'Hello, I need jewelry advice',
        "It's for my anniversary",
        'My budget is around $1000',
        'She likes classic styles',
        'What do you recommend?',
      ];

      let lastPersona: PersonaId = 'gift-explorer';

      for (const message of interactions) {
        const response = await assistant.generateResponse({
          message,
          sessionId,
          persona: lastPersona,
          language: 'en',
        });

        expect(response.success).toBe(true);

        // Update persona if suggested
        if (response.data?.suggestedPersona) {
          lastPersona = response.data.suggestedPersona;
        }
      }

      // Should have switched to romantic-giver for anniversary context
      expect(lastPersona).toBe('romantic-giver');
    });
  });
});

// Test utilities for manual testing and development
export class PersonaAssistantTestSuite {
  private assistant: PersonaAssistant;
  private stateManager: ConversationStateManager;

  constructor() {
    this.assistant = new PersonaAssistant();
    this.stateManager = new ConversationStateManager();
  }

  /**
   * Test persona switching behavior
   */
  async testPersonaSwitching(): Promise<void> {
    const sessionId = 'test-persona-switching';
    const testCases = [
      { input: 'I need an engagement ring', expectedPersona: 'romantic-giver' },
      {
        input: 'I want something that shows my personality',
        expectedPersona: 'self-expressive-buyer',
      },
      { input: 'Looking for a gift for my friend', expectedPersona: 'gift-explorer' },
    ];

    for (const testCase of testCases) {
      const switchResult = this.stateManager.detectPersonaSwitch(sessionId, testCase.input);
      console.log(`Input: "${testCase.input}"`);
      console.log(`Expected: ${testCase.expectedPersona}, Got: ${switchResult.suggestedPersona}`);
      console.log(`Confidence: ${switchResult.confidence}\n`);
    }
  }

  /**
   * Test conversation flow transitions
   */
  async testConversationFlow(): Promise<void> {
    const sessionId = 'test-flow';
    conversationFlowManager.startFlow(sessionId, 'jewelry-consultation');

    const testInputs = [
      'Hello',
      'I need jewelry for my girlfriend',
      "It's for our anniversary",
      'My budget is $500-1000',
      'She likes elegant styles',
    ];

    for (const input of testInputs) {
      const currentNode = conversationFlowManager.getCurrentNode(sessionId);
      const transition = conversationFlowManager.evaluateTransition(sessionId, input, {
        collectedInformation: {},
      });

      console.log(`Input: "${input}"`);
      console.log(`Current State: ${currentNode?.state}`);
      console.log(`Transition: ${transition?.from} -> ${transition?.to}`);
      console.log(`Trigger: ${transition?.trigger}\n`);
    }
  }

  /**
   * Test multilingual responses
   */
  async testMultilingualSupport(): Promise<void> {
    const languages: LanguageCode[] = ['he', 'en', 'ar'];

    for (const language of languages) {
      const response = interactionPatternManager.generateResponse(
        'first_visit',
        'greeting',
        'gift-explorer',
        language
      );

      console.log(`Language: ${language}`);
      console.log(`Response: ${response?.content}`);
      console.log(`Follow-up: ${response?.followUpQuestions.join(', ')}\n`);
    }
  }
}

// Export test suite for development use
export const testSuite = new PersonaAssistantTestSuite();
