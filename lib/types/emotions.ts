// Emotion categories supported by the system
export type EmotionCategory =
  | 'love'
  | 'joy'
  | 'gratitude'
  | 'nostalgia'
  | 'pride'
  | 'hope'
  | 'serenity'
  | 'excitement'
  | 'trust'
  | 'admiration'
  | 'contentment'
  | 'anticipation';

// Emotion intensity levels
export type EmotionIntensity = 'low' | 'medium' | 'high';

// Individual emotion tag interface
export interface EmotionTag {
  id: string;
  name: string;
  category: EmotionCategory;
  intensity: EmotionIntensity;
  color: string;
  isCustom: boolean;
  description?: string;
  keywords?: string[];
  metadata: {
    usageCount: number;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    culturalContext?: string[];
  };
}

// Emotion detection result structure
export interface EmotionDetection {
  category: EmotionCategory;
  confidence: number; // 0-1
  intensity: EmotionIntensity;
  keywords: string[];
}

// Cultural context for emotion interpretation
export interface CulturalContext {
  language: 'en' | 'he' | 'ar' | 'es' | 'fr';
  culturalMarkers: string[];
  religiousContext?: string;
  significance: 'low' | 'medium' | 'high';
}

// Jewelry mapping based on detected emotions
export interface JewelryMapping {
  suggestedStyles: string[];
  metals: string[];
  gemstones: string[];
  occasion: string;
}

// Complete emotion analysis result
export interface EmotionAnalysisResult {
  id: string;
  text: string;
  primaryEmotion: EmotionDetection;
  secondaryEmotions: EmotionDetection[];
  culturalContext: CulturalContext;
  jewelryMapping: JewelryMapping;
  confidence: number; // Overall analysis confidence
  processedAt: Date;
  metadata: {
    model: string;
    version: string;
    processingTime: number; // in milliseconds
  };
}

// Emotion categories with their properties
export const EMOTION_CATEGORIES: Record<EmotionCategory, {
  name: string;
  color: string;
  description: string;
  keywords: string[];
  culturalVariations?: Record<string, string[]>;
}> = {
  love: {
    name: 'Love',
    color: '#FF6B6B',
    description: 'Deep affection, romantic feelings, unconditional love',
    keywords: ['love', 'heart', 'affection', 'romance', 'devotion', 'passion'],
    culturalVariations: {
      he: ['אהבה', 'חיבה', 'אהבת נצח'],
      ar: ['حب', 'عشق', 'غرام'],
    },
  },
  joy: {
    name: 'Joy',
    color: '#FFD93D',
    description: 'Happiness, delight, celebration, positive emotions',
    keywords: ['joy', 'happiness', 'celebration', 'delight', 'bliss', 'cheerful'],
    culturalVariations: {
      he: ['שמחה', 'אושר', 'גיל'],
      ar: ['فرح', 'سعادة', 'بهجة'],
    },
  },
  gratitude: {
    name: 'Gratitude',
    color: '#4ECDC4',
    description: 'Thankfulness, appreciation, recognition of blessings',
    keywords: ['grateful', 'thankful', 'blessed', 'appreciation', 'recognition'],
    culturalVariations: {
      he: ['הכרת הטוב', 'תודה', 'הערכה'],
      ar: ['امتنان', 'شكر', 'تقدير'],
    },
  },
  nostalgia: {
    name: 'Nostalgia',
    color: '#A8E6CF',
    description: 'Fond memories, longing for the past, sentimental feelings',
    keywords: ['memory', 'remember', 'past', 'nostalgia', 'sentimental', 'reminiscence'],
    culturalVariations: {
      he: ['געגועים', 'זיכרון', 'ימים יפים'],
      ar: ['حنين', 'ذكريات', 'شوق'],
    },
  },
  pride: {
    name: 'Pride',
    color: '#DDA0DD',
    description: 'Achievement, accomplishment, self-respect, dignity',
    keywords: ['proud', 'achievement', 'success', 'accomplishment', 'honor'],
    culturalVariations: {
      he: ['גאווה', 'הישג', 'כבוד'],
      ar: ['فخر', 'إنجاز', 'كرامة'],
    },
  },
  hope: {
    name: 'Hope',
    color: '#87CEEB',
    description: 'Optimism, faith in the future, positive expectations',
    keywords: ['hope', 'future', 'optimism', 'faith', 'dream', 'aspiration'],
    culturalVariations: {
      he: ['תקווה', 'אמונה', 'חלום'],
      ar: ['أمل', 'رجاء', 'تفاؤل'],
    },
  },
  serenity: {
    name: 'Serenity',
    color: '#B6E5D8',
    description: 'Peace, tranquility, calmness, inner harmony',
    keywords: ['peace', 'calm', 'tranquil', 'serene', 'harmony', 'balanced'],
    culturalVariations: {
      he: ['שלווה', 'רוגע', 'שקט'],
      ar: ['سكينة', 'هدوء', 'سلام'],
    },
  },
  excitement: {
    name: 'Excitement',
    color: '#FF8C42',
    description: 'Enthusiasm, anticipation, energetic positive emotions',
    keywords: ['excited', 'thrilled', 'enthusiastic', 'eager', 'energetic'],
    culturalVariations: {
      he: ['התרגשות', 'הלהיב', 'נלהב'],
      ar: ['إثارة', 'حماس', 'تشويق'],
    },
  },
  trust: {
    name: 'Trust',
    color: '#6A5ACD',
    description: 'Faith, confidence, reliability, security in relationships',
    keywords: ['trust', 'faith', 'confidence', 'reliable', 'secure', 'belief'],
    culturalVariations: {
      he: ['אמון', 'ביטחון', 'אמונה'],
      ar: ['ثقة', 'أمان', 'يقين'],
    },
  },
  admiration: {
    name: 'Admiration',
    color: '#F7DC6F',
    description: 'Respect, appreciation for qualities, looking up to someone',
    keywords: ['admire', 'respect', 'appreciate', 'look up to', 'esteem'],
    culturalVariations: {
      he: ['הערצה', 'כבוד', 'הערכה'],
      ar: ['إعجاب', 'احترام', 'تقدير'],
    },
  },
  contentment: {
    name: 'Contentment',
    color: '#98FB98',
    description: 'Satisfaction, fulfillment, being at peace with life',
    keywords: ['content', 'satisfied', 'fulfilled', 'complete', 'peaceful'],
    culturalVariations: {
      he: ['שביעות רצון', 'מלאות', 'שלמות'],
      ar: ['رضا', 'قناعة', 'سعادة'],
    },
  },
  anticipation: {
    name: 'Anticipation',
    color: '#FFB6C1',
    description: 'Looking forward, expectation, preparation for future events',
    keywords: ['anticipate', 'expect', 'look forward', 'await', 'prepare'],
    culturalVariations: {
      he: ['ציפייה', 'הכנה', 'המתנה'],
      ar: ['ترقب', 'انتظار', 'توقع'],
    },
  },
};

// Helper function to get emotion by category
export function getEmotionByCategory(category: EmotionCategory) {
  return EMOTION_CATEGORIES[category];
}

// Helper function to get all emotion categories
export function getAllEmotionCategories(): EmotionCategory[] {
  return Object.keys(EMOTION_CATEGORIES) as EmotionCategory[];
}

// Helper function to create a default emotion tag
export function createDefaultEmotionTag(
  category: EmotionCategory,
  intensity: EmotionIntensity = 'medium'
): EmotionTag {
  const emotionDef = EMOTION_CATEGORIES[category];
  return {
    id: category,
    name: emotionDef.name,
    category,
    intensity,
    color: emotionDef.color,
    isCustom: false,
    description: emotionDef.description,
    keywords: emotionDef.keywords,
    metadata: {
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    },
  };
} 