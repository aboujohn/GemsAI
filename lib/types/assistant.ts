// Persona-guided assistant types and interfaces
export type PersonaId = 'romantic-giver' | 'self-expressive-buyer' | 'gift-explorer';

export type ConversationState =
  | 'greeting'
  | 'exploring'
  | 'clarifying'
  | 'recommending'
  | 'closing';

export type LanguageCode = 'he' | 'en' | 'ar';

export interface PersonaTemplate {
  id: PersonaId;
  name: {
    he: string;
    en: string;
    ar: string;
  };
  description: {
    he: string;
    en: string;
    ar: string;
  };
  personality: {
    traits: string[];
    communicationStyle: 'warm' | 'professional' | 'enthusiastic' | 'gentle' | 'direct';
    tone: 'formal' | 'casual' | 'friendly' | 'intimate' | 'supportive';
    empathy: 'high' | 'medium' | 'low';
  };
  expertise: {
    domains: string[];
    specializations: string[];
    experience: 'beginner' | 'intermediate' | 'expert';
  };
  conversationPatterns: {
    greeting: {
      he: string[];
      en: string[];
      ar: string[];
    };
    exploration: {
      he: string[];
      en: string[];
      ar: string[];
    };
    clarification: {
      he: string[];
      en: string[];
      ar: string[];
    };
    recommendation: {
      he: string[];
      en: string[];
      ar: string[];
    };
    farewell: {
      he: string[];
      en: string[];
      ar: string[];
    };
  };
  promptTemplates: {
    systemPrompt: {
      he: string;
      en: string;
      ar: string;
    };
    contextPrompt: {
      he: string;
      en: string;
      ar: string;
    };
  };
  fallbackResponses: {
    unclear: {
      he: string[];
      en: string[];
      ar: string[];
    };
    outOfScope: {
      he: string[];
      en: string[];
      ar: string[];
    };
    error: {
      he: string[];
      en: string[];
      ar: string[];
    };
  };
  behavioralCharacteristics: {
    questioningStyle: 'direct' | 'indirect' | 'conversational' | 'structured';
    responseLength: 'brief' | 'moderate' | 'detailed';
    emotionalIntelligence: 'high' | 'medium' | 'low';
    culturalSensitivity: 'high' | 'medium' | 'low';
  };
}

export interface ConversationContext {
  sessionId: string;
  userId?: string;
  activePersona: PersonaId;
  language: LanguageCode;
  state: ConversationState;
  history: ConversationMessage[];
  userPreferences: {
    jewelryTypes?: string[];
    budget?: string;
    occasion?: string;
    style?: string;
    materials?: string[];
  };
  collectedInformation: {
    story?: string;
    emotions?: string[];
    recipient?: 'self' | 'partner' | 'family' | 'friend';
    relationship?: string;
    specialDates?: string[];
    preferences?: Record<string, any>;
  };
  metadata: {
    startTime: Date;
    lastActivity: Date;
    totalMessages: number;
    switchCount: number;
    previousPersonas: PersonaId[];
  };
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  persona?: PersonaId;
  state?: ConversationState;
  metadata?: {
    confidence?: number;
    responseTime?: number;
    tokens?: number;
    emotions?: string[];
  };
}

export interface ConversationBranch {
  condition: string;
  targetState: ConversationState;
  targetPersona?: PersonaId;
  probability: number;
}

export interface PersonaSwitchTrigger {
  type: 'user-request' | 'context-based' | 'conversation-flow';
  conditions: string[];
  targetPersona: PersonaId;
  confidence: number;
}

export interface AssistantResponse {
  content: string;
  persona: PersonaId;
  state: ConversationState;
  nextState?: ConversationState;
  suggestedPersona?: PersonaId;
  branches?: ConversationBranch[];
  metadata: {
    confidence: number;
    responseTime: number;
    tokens: number;
    reasoning?: string;
  };
}

export interface ConversationStateTransition {
  from: ConversationState;
  to: ConversationState;
  trigger: string;
  conditions: string[];
  persona: PersonaId;
}

export interface AssistantConfig {
  defaultPersona: PersonaId;
  defaultLanguage: LanguageCode;
  maxHistoryLength: number;
  sessionTimeout: number; // in minutes
  enablePersonaSwitching: boolean;
  enableConversationBranching: boolean;
  aiModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}

export interface PersonaMetrics {
  personaId: PersonaId;
  usage: {
    totalSessions: number;
    totalMessages: number;
    averageSessionLength: number;
    successfulRecommendations: number;
  };
  performance: {
    averageConfidence: number;
    averageResponseTime: number;
    userSatisfaction: number;
    completionRate: number;
  };
  patterns: {
    commonQuestions: string[];
    successfulTransitions: ConversationStateTransition[];
    failurePoints: string[];
  };
}

export interface ConversationAnalytics {
  sessionId: string;
  duration: number;
  messageCount: number;
  personaSwitches: number;
  stateTransitions: ConversationStateTransition[];
  outcome: 'completed' | 'abandoned' | 'escalated';
  userSatisfaction?: number;
  generatedRecommendations: number;
  errors: string[];
}
