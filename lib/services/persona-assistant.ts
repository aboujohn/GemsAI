import OpenAI from 'openai';
import { config } from '@/lib/config';
import {
  PersonaId,
  ConversationContext,
  AssistantResponse,
  ConversationState,
  LanguageCode,
  AssistantConfig,
} from '@/lib/types/assistant';
import { getPersonaTemplate } from './persona-templates';
import { conversationStateManager } from './conversation-state';

// Lazy initialization to prevent client-side issues
let openaiClient: OpenAI | null = null;

const getOpenAIClient = () => {
  if (!openaiClient) {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      throw new Error('OpenAI client cannot be used on the client side');
    }
    
    // Only initialize if we have an API key
    const apiKey = config.ai.openaiKey || process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your-openai-api-key-here' || apiKey === 'placeholder') {
      throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file.');
    }
    
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openaiClient;
};

// Default assistant configuration
const DEFAULT_CONFIG: AssistantConfig = {
  defaultPersona: 'gift-explorer',
  defaultLanguage: 'he',
  maxHistoryLength: 10,
  sessionTimeout: 30,
  enablePersonaSwitching: true,
  enableConversationBranching: true,
  aiModel: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 500,
  topP: 0.9,
};

export class PersonaAssistant {
  private config: AssistantConfig;

  constructor(config: Partial<AssistantConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a response from the persona-guided assistant
   */
  async generateResponse(
    sessionId: string,
    userMessage: string,
    personaId?: PersonaId
  ): Promise<AssistantResponse> {
    const startTime = Date.now();

    try {
      // Get or create conversation context
      let context = conversationStateManager.getContext(sessionId);
      if (!context) {
        context = conversationStateManager.createContext(
          sessionId,
          personaId || this.config.defaultPersona,
          this.config.defaultLanguage
        );
      }

      // Add user message to history
      conversationStateManager.addMessage(sessionId, {
        role: 'user',
        content: userMessage,
      });

      // Switch persona if requested
      if (personaId && personaId !== context.activePersona) {
        conversationStateManager.switchPersona(sessionId, personaId, 'user_request');
        context = conversationStateManager.getContext(sessionId)!;
      }

      // Get persona template
      const persona = getPersonaTemplate(context.activePersona);

      // Build conversation messages for OpenAI
      const messages = this.buildConversationMessages(context, persona);

      // Call OpenAI
      const completion = await getOpenAIClient().chat.completions.create({
        model: this.config.aiModel,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP,
        response_format: { type: 'json_object' },
      });

      const result = completion.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      // Parse the AI response
      const aiResponse = JSON.parse(result);
      const responseTime = Date.now() - startTime;

      // Create assistant response
      const assistantResponse: AssistantResponse = {
        content: aiResponse.content,
        persona: context.activePersona,
        state: context.state,
        nextState: aiResponse.nextState || context.state,
        suggestedPersona: aiResponse.suggestedPersona,
        branches: aiResponse.branches || [],
        metadata: {
          confidence: aiResponse.confidence || 0.8,
          responseTime,
          tokens: completion.usage?.total_tokens || 0,
          reasoning: aiResponse.reasoning,
        },
      };

      // Add assistant message to history
      conversationStateManager.addMessage(sessionId, {
        role: 'assistant',
        content: assistantResponse.content,
        persona: context.activePersona,
        state: context.state,
        metadata: {
          confidence: assistantResponse.metadata.confidence,
          responseTime,
          tokens: assistantResponse.metadata.tokens,
        },
      });

      // Update conversation state if needed
      if (assistantResponse.nextState && assistantResponse.nextState !== context.state) {
        conversationStateManager.transitionState(
          sessionId,
          assistantResponse.nextState,
          'ai_decision'
        );
      }

      // Update collected information based on AI analysis
      if (aiResponse.extractedInfo) {
        conversationStateManager.updateCollectedInformation(sessionId, aiResponse.extractedInfo);
      }

      return assistantResponse;
    } catch (error) {
      console.error('Error generating persona response:', error);

      // Return fallback response
      return this.generateFallbackResponse(sessionId, 'error');
    }
  }

  /**
   * Suggest persona switch based on conversation context
   */
  async suggestPersonaSwitch(sessionId: string): Promise<PersonaId | null> {
    const context = conversationStateManager.getContext(sessionId);
    if (!context || !this.config.enablePersonaSwitching) {
      return null;
    }

    const triggers = conversationStateManager.analyzePersonaSwitchTriggers(sessionId);

    // Find the trigger with highest confidence
    const bestTrigger = triggers.reduce(
      (best, current) => (current.confidence > (best?.confidence || 0) ? current : best),
      null
    );

    if (bestTrigger && bestTrigger.confidence > 0.8) {
      return bestTrigger.targetPersona;
    }

    return null;
  }

  /**
   * Get conversation summary with AI insights
   */
  async getConversationInsights(sessionId: string): Promise<{
    summary: string;
    recommendations: string[];
    nextSteps: string[];
    confidence: number;
  } | null> {
    const context = conversationStateManager.getContext(sessionId);
    if (!context) {
      return null;
    }

    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content:
            'Analyze this jewelry consultation conversation and provide insights in JSON format with summary, recommendations, nextSteps, and confidence fields.',
        },
        {
          role: 'user',
          content: `Conversation history:\n${context.history
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n')}\n\nProvide analysis in JSON format.`,
        },
      ];

      const completion = await getOpenAIClient().chat.completions.create({
        model: this.config.aiModel,
        messages,
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      });

      const result = completion.choices[0]?.message?.content;
      if (result) {
        return JSON.parse(result);
      }
    } catch (error) {
      console.error('Error generating conversation insights:', error);
    }

    return null;
  }

  /**
   * Generate fallback response when AI fails
   */
  private generateFallbackResponse(
    sessionId: string,
    type: 'error' | 'unclear' | 'outOfScope'
  ): AssistantResponse {
    const context = conversationStateManager.getContext(sessionId);
    const persona = context
      ? getPersonaTemplate(context.activePersona)
      : getPersonaTemplate('gift-explorer');
    const language = context?.language || 'he';

    const fallbackMessages = persona.fallbackResponses[type][language];
    const content = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    return {
      content,
      persona: context?.activePersona || 'gift-explorer',
      state: context?.state || 'greeting',
      metadata: {
        confidence: 0.3,
        responseTime: 0,
        tokens: 0,
        reasoning: `Fallback response for ${type}`,
      },
    };
  }

  /**
   * Build conversation messages for OpenAI API
   */
  private buildConversationMessages(
    context: ConversationContext,
    persona: any
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    // System message with persona instructions
    const systemPrompt = this.buildSystemPrompt(context, persona);
    messages.push({
      role: 'system',
      content: systemPrompt,
    });

    // Add conversation history (limited)
    const recentHistory = context.history.slice(-this.config.maxHistoryLength);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    return messages;
  }

  /**
   * Build system prompt based on persona and context
   */
  private buildSystemPrompt(context: ConversationContext, persona: any): string {
    const basePrompt = persona.promptTemplates.systemPrompt[context.language];
    const contextPrompt = persona.promptTemplates.contextPrompt[context.language];

    const stateInstructions = this.getStateInstructions(context.state, context.language);
    const collectedInfo = this.formatCollectedInfo(context);

    return `${basePrompt}

${contextPrompt}

Current conversation state: ${context.state}
${stateInstructions}

Collected information about the user:
${collectedInfo}

Persona characteristics:
- Communication style: ${persona.personality.communicationStyle}
- Tone: ${persona.personality.tone}
- Response length: ${persona.behavioralCharacteristics.responseLength}

IMPORTANT: Respond in JSON format with the following structure:
{
  "content": "Your response message",
  "confidence": 0.8,
  "nextState": "exploring|clarifying|recommending|closing",
  "suggestedPersona": "romantic-giver|self-expressive-buyer|gift-explorer" (optional),
  "extractedInfo": {}, (optional: any new information to save)
  "reasoning": "Brief explanation of your response strategy"
}`;
  }

  /**
   * Get instructions for current conversation state
   */
  private getStateInstructions(state: ConversationState, language: LanguageCode): string {
    const instructions = {
      greeting: {
        he: 'התחל בברכה חמה והכר את המשתמש. גלה מה הוא מחפש.',
        en: 'Start with a warm greeting and get to know the user. Discover what they are looking for.',
        ar: 'ابدأ بتحية دافئة وتعرف على المستخدم. اكتشف ما يبحثون عنه.',
      },
      exploring: {
        he: 'חקור את הצרכים והרצונות של המשתמש. שאל שאלות מעמיקות.',
        en: "Explore the user's needs and desires. Ask deep questions.",
        ar: 'استكشف احتياجات ورغبات المستخدم. اطرح أسئلة عميقة.',
      },
      clarifying: {
        he: 'הבהר פרטים חשובים ווודא שאתה מבין את הדרישות.',
        en: 'Clarify important details and ensure you understand the requirements.',
        ar: 'وضح التفاصيل المهمة وتأكد من فهمك للمتطلبات.',
      },
      recommending: {
        he: 'הצע המלצות מתאימות בהתבסס על מה שלמדת.',
        en: "Offer suitable recommendations based on what you've learned.",
        ar: 'قدم توصيات مناسبة بناءً على ما تعلمته.',
      },
      closing: {
        he: 'סכם את השיחה ווודא שהמשתמש מרוצה.',
        en: 'Summarize the conversation and ensure the user is satisfied.',
        ar: 'لخص المحادثة وتأكد من رضا المستخدم.',
      },
    };

    return instructions[state][language];
  }

  /**
   * Format collected information for the prompt
   */
  private formatCollectedInfo(context: ConversationContext): string {
    const info = [];

    if (context.collectedInformation.story) {
      info.push(`Story: ${context.collectedInformation.story}`);
    }

    if (context.collectedInformation.emotions?.length) {
      info.push(`Emotions: ${context.collectedInformation.emotions.join(', ')}`);
    }

    if (context.collectedInformation.recipient) {
      info.push(`Recipient: ${context.collectedInformation.recipient}`);
    }

    if (context.userPreferences.budget) {
      info.push(`Budget: ${context.userPreferences.budget}`);
    }

    if (context.userPreferences.style) {
      info.push(`Style preference: ${context.userPreferences.style}`);
    }

    return info.length > 0 ? info.join('\n') : 'No specific information collected yet';
  }
}

// Export singleton instance
export const personaAssistant = new PersonaAssistant();
