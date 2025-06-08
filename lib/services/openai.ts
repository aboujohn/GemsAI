import OpenAI from 'openai';
import { config } from '@/lib/config';

// Re-export types from emotions file (safe for client-side)
export type {
  EmotionCategory,
  EmotionIntensity,
  EmotionTag,
  EmotionDetection,
  CulturalContext,
  JewelryMapping,
  EmotionAnalysisResult,
} from '@/lib/types/emotions';

export {
  EMOTION_CATEGORIES,
  getEmotionByCategory,
  getAllEmotionCategories,
  createDefaultEmotionTag,
} from '@/lib/types/emotions';

import type {
  EmotionCategory,
  EmotionDetection,
  CulturalContext,
  JewelryMapping,
  EmotionAnalysisResult,
} from '@/lib/types/emotions';

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
      throw new Error(
        'OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file.'
      );
    }

    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openaiClient;
};

// Prompt templates for emotion detection
const EMOTION_DETECTION_PROMPTS = {
  he: `אנא נתח את הטקסט הבא וזהה את הרגשות העיקריים. הטקסט מתאר סיפור אישי הקשור לתכשיט או רגש שרוצים לבטא בתכשיט.

זהה:
1. רגש ראשי (הכי חזק)
2. רגשות משניים (עד 2)
3. עוצמת הרגש (נמוכה/בינונית/גבוהה)
4. מילות מפתח רגשיות
5. הקשר תרבותי (אם רלוונטי)
6. סגנונות תכשיטים מתאימים

טקסט לניתוח: "{text}"

השב בפורמט JSON בלבד:`,

  en: `Please analyze the following text and identify the primary emotions. The text describes a personal story related to jewelry or emotions to be expressed through jewelry.

Identify:
1. Primary emotion (strongest)
2. Secondary emotions (up to 2)
3. Emotion intensity (low/medium/high)
4. Emotional keywords
5. Cultural context (if relevant)
6. Suitable jewelry styles

Text to analyze: "{text}"

Respond in JSON format only:`,

  ar: `يرجى تحليل النص التالي وتحديد المشاعر الأساسية. النص يصف قصة شخصية متعلقة بالمجوهرات أو المشاعر المراد التعبير عنها من خلال المجوهرات.

حدد:
1. المشاعر الأساسية (الأقوى)
2. المشاعر الثانوية (حتى 2)
3. شدة المشاعر (منخفضة/متوسطة/عالية)
4. الكلمات المفتاحية العاطفية
5. السياق الثقافي (إذا كان ذا صلة)
6. أنماط المجوهرات المناسبة

النص للتحليل: "{text}"

الرد بصيغة JSON فقط:`,
};

const JSON_SCHEMA = {
  type: 'object',
  properties: {
    primaryEmotion: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: Object.keys(EMOTION_CATEGORIES) },
        intensity: { type: 'string', enum: ['low', 'medium', 'high'] },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        keywords: { type: 'array', items: { type: 'string' } },
      },
      required: ['category', 'intensity', 'confidence', 'keywords'],
    },
    secondaryEmotions: {
      type: 'array',
      maxItems: 2,
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: Object.keys(EMOTION_CATEGORIES) },
          intensity: { type: 'string', enum: ['low', 'medium', 'high'] },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          keywords: { type: 'array', items: { type: 'string' } },
        },
        required: ['category', 'intensity', 'confidence', 'keywords'],
      },
    },
    overallSentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    culturalContext: { type: 'string' },
    suggestedJewelryStyles: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'primaryEmotion',
    'secondaryEmotions',
    'overallSentiment',
    'confidence',
    'suggestedJewelryStyles',
  ],
};

/**
 * Analyze text for emotional content using GPT-4o
 */
export async function analyzeEmotions(
  request: EmotionAnalysisRequest
): Promise<EmotionAnalysisResult> {
  const { text, language = 'he', culturalContext } = request;

  if (!text || text.trim().length === 0) {
    throw new Error('Text is required for emotion analysis');
  }

  try {
    const prompt = EMOTION_DETECTION_PROMPTS[language].replace('{text}', text);

    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert emotion analyst specializing in jewelry and personal stories. You understand cultural nuances and can identify emotions that translate well into jewelry design. Always respond with valid JSON matching the provided schema.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 1000,
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate the JSON response
    const analysis: EmotionAnalysisResult = JSON.parse(result);

    // Validate the response structure
    if (!analysis.primaryEmotion || !analysis.secondaryEmotions || !analysis.overallSentiment) {
      throw new Error('Invalid response structure from OpenAI');
    }

    // Ensure confidence scores are within valid range
    analysis.confidence = Math.max(0, Math.min(1, analysis.confidence));
    analysis.primaryEmotion.confidence = Math.max(
      0,
      Math.min(1, analysis.primaryEmotion.confidence)
    );
    analysis.secondaryEmotions.forEach(emotion => {
      emotion.confidence = Math.max(0, Math.min(1, emotion.confidence));
    });

    return analysis;
  } catch (error) {
    console.error('Error analyzing emotions:', error);

    // Provide fallback analysis if OpenAI fails
    if (error instanceof Error && error.message.includes('API')) {
      return getFallbackEmotionAnalysis(text, language);
    }

    throw error;
  }
}

/**
 * Fallback emotion analysis using simple keyword matching
 */
function getFallbackEmotionAnalysis(text: string, language: string): EmotionAnalysisResult {
  const lowerText = text.toLowerCase();

  // Simple keyword-based emotion detection
  const emotionKeywords = {
    love: ['love', 'אהבה', 'heart', 'לב', 'beloved', 'יקר'],
    joy: ['happy', 'שמח', 'joy', 'שמחה', 'celebration', 'חגיגה'],
    peace: ['peace', 'שלום', 'calm', 'רגוע', 'tranquil', 'שקט'],
    hope: ['hope', 'תקווה', 'future', 'עתיד', 'dream', 'חלום'],
    strength: ['strong', 'חזק', 'power', 'כוח', 'courage', 'אומץ'],
  };

  let detectedEmotion: EmotionCategory = 'love'; // Default
  let maxMatches = 0;

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedEmotion = emotion as EmotionCategory;
    }
  }

  return {
    primaryEmotion: {
      category: detectedEmotion,
      intensity: 'medium',
      confidence: 0.6,
      keywords: emotionKeywords[detectedEmotion] || [],
    },
    secondaryEmotions: [],
    overallSentiment: 'positive',
    confidence: 0.6,
    suggestedJewelryStyles: ['classic', 'elegant', 'meaningful'],
  };
}

/**
 * Get emotion color for UI display
 */
export function getEmotionColor(category: EmotionCategory): string {
  return EMOTION_CATEGORIES[category]?.color || '#6b7280';
}

/**
 * Get emotion intensity levels for a category
 */
export function getEmotionIntensityLevels(category: EmotionCategory): string[] {
  return EMOTION_CATEGORIES[category]?.intensity || ['gentle', 'moderate', 'intense'];
}

/**
 * Validate emotion analysis result
 */
export function validateEmotionAnalysis(analysis: any): analysis is EmotionAnalysisResult {
  return (
    analysis &&
    typeof analysis === 'object' &&
    analysis.primaryEmotion &&
    typeof analysis.primaryEmotion.category === 'string' &&
    typeof analysis.primaryEmotion.intensity === 'string' &&
    typeof analysis.primaryEmotion.confidence === 'number' &&
    Array.isArray(analysis.primaryEmotion.keywords) &&
    Array.isArray(analysis.secondaryEmotions) &&
    typeof analysis.overallSentiment === 'string' &&
    typeof analysis.confidence === 'number' &&
    Array.isArray(analysis.suggestedJewelryStyles)
  );
}
