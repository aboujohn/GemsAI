import { PersonaId, LanguageCode, ConversationState, PersonaTemplate } from '@/lib/types/assistant';
import { getPersonaTemplate } from './persona-templates';

// Standard interaction patterns for persona-guided conversations

export interface InteractionPattern {
  id: string;
  name: string;
  description: string;
  applicableStates: ConversationState[];
  applicablePersonas: PersonaId[];
  triggers: string[];
  responses: {
    [K in LanguageCode]: string[];
  };
  followUpQuestions: {
    [K in LanguageCode]: string[];
  };
  contextHints: string[];
}

export interface InteractionResponse {
  content: string;
  followUpQuestions: string[];
  suggestedActions: string[];
  confidence: number;
  pattern: string;
}

// Predefined interaction patterns
export const INTERACTION_PATTERNS: Record<string, InteractionPattern> = {
  greeting_first_time: {
    id: 'greeting_first_time',
    name: 'First Time Greeting',
    description: 'Initial greeting for new users',
    applicableStates: ['greeting'],
    applicablePersonas: ['romantic-giver', 'self-expressive-buyer', 'gift-explorer'],
    triggers: ['first_visit', 'new_session', 'no_history'],
    responses: {
      he: [
        'שלום ברוך הבא! אני יועץ התכשיטים האישי שלך',
        'איך אפשר לעזור לך היום למצוא את התכשיט המושלם?',
        'נפלא שהגעת! בוא נמצא ביחד את התכשיט שיספר את הסיפור שלך',
      ],
      en: [
        "Hello and welcome! I'm your personal jewelry consultant",
        'How can I help you find the perfect piece today?',
        "Great to meet you! Let's find jewelry that tells your story",
      ],
      ar: [
        'مرحبا وأهلا وسهلا! أنا مستشار المجوهرات الشخصي',
        'كيف يمكنني مساعدتك في العثور على القطعة المثالية اليوم؟',
        'سعيد بلقائك! دعنا نجد مجوهرات تحكي قصتك',
      ],
    },
    followUpQuestions: {
      he: ['מה המناسבת המיוחדת?', 'למי אתה מחפש תכשיט?', 'איזה סגנון אתה אוהב?'],
      en: [
        "What's the special occasion?",
        'Who are you shopping for?',
        'What style do you prefer?',
      ],
      ar: ['ما هي المناسبة الخاصة؟', 'لمن تتسوق؟', 'ما هو الأسلوب الذي تفضله؟'],
    },
    contextHints: ['collect_occasion', 'collect_recipient', 'assess_style_preference'],
  },

  budget_inquiry: {
    id: 'budget_inquiry',
    name: 'Budget Discussion',
    description: 'Tactfully discussing budget constraints',
    applicableStates: ['exploring', 'clarifying'],
    applicablePersonas: ['romantic-giver', 'self-expressive-buyer', 'gift-explorer'],
    triggers: ['budget_question', 'price_concern', 'financial_constraint'],
    responses: {
      he: [
        'אני מבין שהתקציב חשוב. בואו נמצא משהו יפה בטווח המחירים שלך',
        'יש לנו אפשרויות נהדרות בכל טווח מחירים. מה נוח לך?',
        'הכי חשוב שהתכשיט יהיה מושלם בשבילך, לא משנה התקציב',
      ],
      en: [
        "I understand budget is important. Let's find something beautiful within your range",
        'We have great options at every price point. What works for you?',
        'The most important thing is that the jewelry is perfect for you, regardless of budget',
      ],
      ar: [
        'أفهم أن الميزانية مهمة. دعونا نجد شيئا جميلا ضمن نطاقك',
        'لدينا خيارات رائعة في كل نطاق سعري. ما الذي يناسبك؟',
        'الأهم أن تكون المجوهرات مثالية لك، بغض النظر عن الميزانية',
      ],
    },
    followUpQuestions: {
      he: [
        'איזה טווח מחירים נוח לך?',
        'האם יש גמישות בתקציב למשהו מיוחד?',
        'מה הדבר הכי חשוב לך בתכשיט?',
      ],
      en: [
        'What price range feels comfortable?',
        'Is there flexibility for something special?',
        "What's most important to you in the jewelry?",
      ],
      ar: [
        'ما هو النطاق السعري المريح؟',
        'هل هناك مرونة لشيء مميز؟',
        'ما هو الأهم بالنسبة لك في المجوهرات؟',
      ],
    },
    contextHints: ['collect_budget_range', 'assess_value_priorities', 'suggest_alternatives'],
  },

  style_exploration: {
    id: 'style_exploration',
    name: 'Style Preference Discovery',
    description: 'Helping users discover their style preferences',
    applicableStates: ['exploring', 'clarifying'],
    applicablePersonas: ['self-expressive-buyer', 'gift-explorer'],
    triggers: ['style_question', 'preference_uncertainty', 'style_discovery'],
    responses: {
      he: [
        'בואו נגלה את הסגנון שמדבר אליך. איך אתה אוהב להתלבש?',
        'יש הרבה סגנונות יפים. איזה צבעים אתה נמשך אליהם?',
        'הסגנון שלך יכול להיות השראה לתכשיט. ספר לי על האישיות שלך',
      ],
      en: [
        "Let's discover the style that speaks to you. How do you like to dress?",
        'There are many beautiful styles. What colors are you drawn to?',
        'Your personal style can inspire the jewelry. Tell me about your personality',
      ],
      ar: [
        'دعونا نكتشف الأسلوب الذي يتحدث إليك. كيف تحب أن تلبس؟',
        'هناك العديد من الأساليب الجميلة. ما هي الألوان التي تنجذب إليها؟',
        'أسلوبك الشخصي يمكن أن يلهم المجوهرات. أخبرني عن شخصيتك',
      ],
    },
    followUpQuestions: {
      he: [
        'אתה מעדיף משהו קלאסי או מודרני?',
        'איזה חומרים אתה אוהב? זהב, כסף, אבנים?',
        'איך אתה רוצה להרגיש כשאתה לובש את התכשיט?',
      ],
      en: [
        'Do you prefer classic or modern styles?',
        'What materials do you love? Gold, silver, stones?',
        'How do you want to feel wearing the jewelry?',
      ],
      ar: [
        'هل تفضل الأساليب الكلاسيكية أم الحديثة؟',
        'ما هي المواد التي تحبها؟ الذهب، الفضة، الأحجار؟',
        'كيف تريد أن تشعر عند ارتداء المجوهرات؟',
      ],
    },
    contextHints: [
      'assess_style_preference',
      'collect_material_preferences',
      'understand_lifestyle',
    ],
  },

  gift_recipient_analysis: {
    id: 'gift_recipient_analysis',
    name: 'Gift Recipient Understanding',
    description: "Understanding the gift recipient's personality and preferences",
    applicableStates: ['exploring', 'clarifying'],
    applicablePersonas: ['romantic-giver', 'gift-explorer'],
    triggers: ['gift_shopping', 'recipient_question', 'relationship_context'],
    responses: {
      he: [
        'ספר לי על האדם המיוחד הזה. איך היא אוהבת להתלבש?',
        "איזה סגנון חיים יש לה? פעילה, אלגנטית, קז'ואל?",
        'מה מיוחד ביחסים שלכם? זה יעזור לי להמליץ על משהו מושלם',
      ],
      en: [
        'Tell me about this special person. How does she like to dress?',
        "What's her lifestyle like? Active, elegant, casual?",
        "What's special about your relationship? This will help me recommend something perfect",
      ],
      ar: [
        'أخبرني عن هذا الشخص المميز. كيف تحب أن تلبس؟',
        'كيف هو أسلوب حياتها؟ نشطة، أنيقة، عادية؟',
        'ما الذي يميز علاقتكما؟ هذا سيساعدني في التوصية بشيء مثالي',
      ],
    },
    followUpQuestions: {
      he: [
        'איזה תכשיטים היא כבר לובשת?',
        'מה הצבעים שהיא הכי אוהבת?',
        'היא יותר קלאסית או אוהבת לנסות דברים חדשים?',
      ],
      en: [
        'What jewelry does she already wear?',
        'What are her favorite colors?',
        'Is she more classic or does she like trying new things?',
      ],
      ar: [
        'ما هي المجوهرات التي ترتديها بالفعل؟',
        'ما هي ألوانها المفضلة؟',
        'هل هي أكثر كلاسيكية أم تحب تجربة أشياء جديدة؟',
      ],
    },
    contextHints: [
      'collect_recipient_style',
      'understand_relationship',
      'assess_recipient_preferences',
    ],
  },

  emotional_connection: {
    id: 'emotional_connection',
    name: 'Emotional Story Building',
    description: 'Building emotional connection through storytelling',
    applicableStates: ['exploring', 'recommending'],
    applicablePersonas: ['romantic-giver'],
    triggers: ['emotional_story', 'romantic_context', 'special_moment'],
    responses: {
      he: [
        'זה נשמע כמו סיפור אהבה יפה. התכשיט צריך לספר את הסיפור הזה',
        'איזה רגע מיוחד! בואו נמצא משהו שיזכיר לה את הרגש הזה תמיד',
        'האהבה שלכם מיוחדת. התכשיט צריך להיות ייחודי כמוה',
      ],
      en: [
        'That sounds like a beautiful love story. The jewelry should tell this story',
        "What a special moment! Let's find something that will always remind her of this feeling",
        'Your love is special. The jewelry should be as unique as it is',
      ],
      ar: [
        'هذا يبدو وكأنه قصة حب جميلة. يجب أن تحكي المجوهرات هذه القصة',
        'يا لها من لحظة مميزة! دعونا نجد شيئا سيذكرها دائما بهذا الشعور',
        'حبكما مميز. يجب أن تكون المجوهرات فريدة مثله',
      ],
    },
    followUpQuestions: {
      he: [
        'איזה אלמנט בסיפור שלכם הכי חשוב לך?',
        'איך אתה רוצה שהיא תרגיש כשהיא תקבל את זה?',
        'יש תאריך או מקום מיוחד שחשוב לכלול?',
      ],
      en: [
        'What element of your story is most important to you?',
        'How do you want her to feel when she receives this?',
        "Is there a special date or place that's important to include?",
      ],
      ar: [
        'ما هو العنصر الأهم في قصتكما بالنسبة لك؟',
        'كيف تريدها أن تشعر عندما تستقبل هذا؟',
        'هل هناك تاريخ أو مكان مميز من المهم تضمينه؟',
      ],
    },
    contextHints: ['capture_emotional_story', 'identify_key_moments', 'personalize_meaning'],
  },

  recommendation_presentation: {
    id: 'recommendation_presentation',
    name: 'Recommendation Presentation',
    description: 'Presenting recommendations with compelling reasoning',
    applicableStates: ['recommending'],
    applicablePersonas: ['romantic-giver', 'self-expressive-buyer', 'gift-explorer'],
    triggers: ['ready_to_recommend', 'sufficient_information', 'decision_time'],
    responses: {
      he: [
        'בהתבסס על מה שסיפרת לי, יש לי המלצה מושלמת בשבילך',
        'מצאתי בדיוק מה שמתאים לסיפור שלכם. תראה מה אתה חושב',
        'הנה מה שיכול לבטא בדיוק את מה שחיפשת',
      ],
      en: [
        "Based on what you've told me, I have the perfect recommendation for you",
        'I found exactly what fits your story. See what you think',
        "Here's what can express exactly what you were looking for",
      ],
      ar: [
        'بناءً على ما أخبرتني إياه، لدي التوصية المثالية لك',
        'وجدت بالضبط ما يناسب قصتك. انظر ما رأيك',
        'هذا ما يمكن أن يعبر بالضبط عما كنت تبحث عنه',
      ],
    },
    followUpQuestions: {
      he: [
        'מה אתה חושב על ההצעה הזו?',
        'האם זה מתאים למה שדמיינת?',
        'רוצה לראות עוד אפשרויות דומות?',
      ],
      en: [
        'What do you think about this suggestion?',
        'Does this match what you imagined?',
        'Would you like to see more similar options?',
      ],
      ar: [
        'ما رأيك في هذا الاقتراح؟',
        'هل يتطابق هذا مع ما تخيلته؟',
        'هل تريد رؤية المزيد من الخيارات المماثلة؟',
      ],
    },
    contextHints: ['explain_reasoning', 'highlight_fit', 'offer_alternatives'],
  },

  handling_objections: {
    id: 'handling_objections',
    name: 'Objection Handling',
    description: 'Addressing concerns and objections gracefully',
    applicableStates: ['clarifying', 'recommending'],
    applicablePersonas: ['romantic-giver', 'self-expressive-buyer', 'gift-explorer'],
    triggers: ['concern_expressed', 'doubt', 'objection', 'hesitation'],
    responses: {
      he: [
        'אני מבין את הדאגה שלך. בואו נמצא פתרון שיתאים לך יותר',
        'זה דבר חשוב לקחת בחשבון. יש לנו אפשרויות אחרות',
        'נכון לחלוטין להיות זהיר. ספר לי מה מדאיג אותך בדיוק',
      ],
      en: [
        "I understand your concern. Let's find a solution that works better for you",
        "That's important to consider. We have other options",
        "It's absolutely right to be careful. Tell me exactly what concerns you",
      ],
      ar: [
        'أفهم قلقك. دعونا نجد حلا يناسبك أكثر',
        'هذا مهم للنظر فيه. لدينا خيارات أخرى',
        'من الصحيح تماما أن تكون حذرا. أخبرني بالضبط ما يقلقك',
      ],
    },
    followUpQuestions: {
      he: [
        'מה הדבר הכי חשוב לך בבחירה?',
        'איך אני יכול לעזור לך להרגיש בטוח יותר?',
        'יש משהו ספציפי שאתה רוצה לשנות?',
      ],
      en: [
        "What's most important to you in this choice?",
        'How can I help you feel more confident?',
        "Is there something specific you'd like to change?",
      ],
      ar: [
        'ما هو الأهم بالنسبة لك في هذا الاختيار؟',
        'كيف يمكنني مساعدتك على الشعور بثقة أكبر؟',
        'هل هناك شيء محدد تريد تغييره؟',
      ],
    },
    contextHints: ['address_concerns', 'provide_reassurance', 'offer_alternatives'],
  },
};

export class InteractionPatternManager {
  private patterns: Map<string, InteractionPattern> = new Map();

  constructor() {
    // Load all predefined patterns
    Object.values(INTERACTION_PATTERNS).forEach(pattern => {
      this.patterns.set(pattern.id, pattern);
    });
  }

  /**
   * Find matching interaction patterns based on context
   */
  findMatchingPatterns(
    trigger: string,
    state: ConversationState,
    persona: PersonaId,
    userInput?: string
  ): InteractionPattern[] {
    const matchingPatterns: InteractionPattern[] = [];

    for (const pattern of this.patterns.values()) {
      if (this.isPatternApplicable(pattern, trigger, state, persona, userInput)) {
        matchingPatterns.push(pattern);
      }
    }

    // Sort by relevance (more specific patterns first)
    return matchingPatterns.sort((a, b) => {
      const scoreA = this.calculatePatternScore(a, trigger, state, persona);
      const scoreB = this.calculatePatternScore(b, trigger, state, persona);
      return scoreB - scoreA;
    });
  }

  /**
   * Generate response using best matching pattern
   */
  generateResponse(
    trigger: string,
    state: ConversationState,
    persona: PersonaId,
    language: LanguageCode,
    userInput?: string,
    context?: Record<string, any>
  ): InteractionResponse | null {
    const patterns = this.findMatchingPatterns(trigger, state, persona, userInput);

    if (patterns.length === 0) {
      return null;
    }

    const bestPattern = patterns[0];
    const personaTemplate = getPersonaTemplate(persona);

    // Select response based on persona style
    const responses = bestPattern.responses[language];
    const followUps = bestPattern.followUpQuestions[language];

    const selectedResponse = this.selectPersonaAppropriateResponse(
      responses,
      personaTemplate,
      context
    );

    const selectedFollowUps = this.selectRelevantQuestions(
      followUps,
      bestPattern.contextHints,
      context
    );

    return {
      content: selectedResponse,
      followUpQuestions: selectedFollowUps,
      suggestedActions: bestPattern.contextHints,
      confidence: this.calculatePatternScore(bestPattern, trigger, state, persona) / 100,
      pattern: bestPattern.id,
    };
  }

  /**
   * Register a new interaction pattern
   */
  registerPattern(pattern: InteractionPattern): void {
    this.patterns.set(pattern.id, pattern);
  }

  /**
   * Get all patterns for a specific state and persona
   */
  getPatternsForContext(state: ConversationState, persona: PersonaId): InteractionPattern[] {
    return Array.from(this.patterns.values()).filter(
      pattern =>
        pattern.applicableStates.includes(state) && pattern.applicablePersonas.includes(persona)
    );
  }

  // Private helper methods

  private isPatternApplicable(
    pattern: InteractionPattern,
    trigger: string,
    state: ConversationState,
    persona: PersonaId,
    userInput?: string
  ): boolean {
    // Check state applicability
    if (!pattern.applicableStates.includes(state)) {
      return false;
    }

    // Check persona applicability
    if (!pattern.applicablePersonas.includes(persona)) {
      return false;
    }

    // Check trigger match
    if (!pattern.triggers.some(t => trigger.includes(t) || t.includes(trigger))) {
      return false;
    }

    // Optional: Check user input for additional context
    if (userInput && pattern.triggers.length > 0) {
      const lowerInput = userInput.toLowerCase();
      const hasKeywordMatch = pattern.triggers.some(triggerWord =>
        lowerInput.includes(triggerWord.toLowerCase())
      );

      if (!hasKeywordMatch) {
        // Allow if trigger matches even without keyword match
        return true;
      }
    }

    return true;
  }

  private calculatePatternScore(
    pattern: InteractionPattern,
    trigger: string,
    state: ConversationState,
    persona: PersonaId
  ): number {
    let score = 0;

    // Base score for applicability
    if (pattern.applicableStates.includes(state)) score += 30;
    if (pattern.applicablePersonas.includes(persona)) score += 30;

    // Bonus for exact trigger match
    if (pattern.triggers.includes(trigger)) score += 40;

    // Bonus for pattern specificity
    score += Math.max(0, 20 - pattern.applicableStates.length * 5);
    score += Math.max(0, 20 - pattern.applicablePersonas.length * 7);

    return score;
  }

  private selectPersonaAppropriateResponse(
    responses: string[],
    personaTemplate: PersonaTemplate,
    context?: Record<string, any>
  ): string {
    // For now, select randomly
    // In production, this would consider persona characteristics
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private selectRelevantQuestions(
    questions: string[],
    contextHints: string[],
    context?: Record<string, any>
  ): string[] {
    // Return up to 2 most relevant questions
    // In production, this would filter based on already collected information
    return questions.slice(0, 2);
  }
}

// Export singleton instance
export const interactionPatternManager = new InteractionPatternManager();
