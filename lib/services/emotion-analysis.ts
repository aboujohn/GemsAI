import {
  EmotionAnalysisResult,
  EmotionAnalysisRequest,
  EmotionTag,
  EmotionCategory,
  EmotionIntensity,
  EMOTION_CATEGORIES,
  analyzeEmotions,
} from './openai';
import { createEmotionCache } from './emotion-cache';

// Initialize cache
const cache = createEmotionCache();

// Emotion intensity scoring
const INTENSITY_SCORES = {
  low: 0.3,
  medium: 0.6,
  high: 0.9,
} as const;

// Cultural context patterns for Hebrew/Arabic content
const CULTURAL_PATTERNS = {
  hebrew: {
    family: ['משפחה', 'אמא', 'אבא', 'בן', 'בת', 'אח', 'אחות', 'סבא', 'סבתא'],
    religious: ['ברכה', 'קדושה', 'מזוזה', 'שבת', 'חג', 'תפילה', 'אמונה'],
    tradition: ['מסורת', 'זיכרון', 'דורות', 'ירושה', 'עבר', 'היסטוריה'],
    love: ['אהבה', 'חיבה', 'רגש', 'לב', 'נשמה', 'יקר', 'אהוב'],
    celebration: ['שמחה', 'חגיגה', 'ברכה', 'מזל טוב', 'אושר', 'גיל'],
  },
  arabic: {
    family: ['عائلة', 'أم', 'أب', 'ابن', 'ابنة', 'أخ', 'أخت', 'جد', 'جدة'],
    religious: ['بركة', 'قداسة', 'صلاة', 'إيمان', 'دعاء', 'تقوى'],
    tradition: ['تراث', 'ذكرى', 'أجيال', 'إرث', 'ماضي', 'تاريخ'],
    love: ['حب', 'عشق', 'مشاعر', 'قلب', 'روح', 'عزيز', 'حبيب'],
    celebration: ['فرح', 'احتفال', 'بركة', 'مبروك', 'سعادة', 'بهجة'],
  },
} as const;

// Jewelry style mapping based on emotions
const EMOTION_TO_JEWELRY_STYLES = {
  love: ['romantic', 'heart-shaped', 'rose-gold', 'vintage', 'delicate'],
  joy: ['bright', 'colorful', 'playful', 'modern', 'statement'],
  peace: ['minimalist', 'zen', 'simple', 'clean-lines', 'serene'],
  hope: ['uplifting', 'light', 'ethereal', 'symbolic', 'meaningful'],
  strength: ['bold', 'geometric', 'powerful', 'structured', 'confident'],
  gratitude: ['warm', 'golden', 'classic', 'timeless', 'elegant'],
  courage: ['strong', 'angular', 'metallic', 'contemporary', 'edgy'],
  elegance: ['sophisticated', 'refined', 'luxury', 'classic', 'graceful'],
  passion: ['intense', 'red', 'dramatic', 'bold', 'striking'],
  tenderness: ['soft', 'gentle', 'flowing', 'organic', 'nurturing'],
  nostalgia: ['vintage', 'antique', 'heirloom', 'traditional', 'sentimental'],
  celebration: ['festive', 'sparkling', 'joyful', 'ornate', 'decorative'],
  remembrance: ['memorial', 'symbolic', 'meaningful', 'eternal', 'tribute'],
  pride: ['achievement', 'success', 'milestone', 'accomplishment', 'victory'],
  determination: ['focused', 'linear', 'purposeful', 'strong', 'unwavering'],
  friendship: ['connected', 'linked', 'shared', 'bonding', 'unity'],
  family: ['generational', 'heritage', 'bonding', 'protective', 'nurturing'],
  romance: ['intimate', 'personal', 'loving', 'tender', 'devoted'],
} as const;

export interface EmotionAnalysisOptions {
  includeSecondaryEmotions?: boolean;
  culturalContextAnalysis?: boolean;
  jewelryStyleSuggestions?: boolean;
  confidenceThreshold?: number;
  maxSecondaryEmotions?: number;
}

export interface EnhancedEmotionAnalysis extends EmotionAnalysisResult {
  emotionIntensityScore: number;
  culturalRelevance: number;
  ambiguityScore: number;
  recommendedActions: string[];
  jewelryStyleConfidence: number;
  processingMetadata: {
    analysisTime: number;
    fromCache: boolean;
    fallbackUsed: boolean;
    confidenceLevel: 'high' | 'medium' | 'low';
  };
}

export interface EmotionTrend {
  emotion: EmotionCategory;
  frequency: number;
  averageIntensity: number;
  contexts: string[];
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface EmotionProfile {
  dominantEmotions: EmotionCategory[];
  emotionalRange: number; // 0-1, diversity of emotions
  intensityPattern: 'consistent' | 'variable' | 'escalating' | 'declining';
  culturalInfluence: number; // 0-1, how much culture affects emotion expression
  trends: EmotionTrend[];
}

/**
 * Enhanced emotion analysis with additional processing and insights
 */
export async function analyzeEmotionsEnhanced(
  request: EmotionAnalysisRequest,
  options: EmotionAnalysisOptions = {}
): Promise<EnhancedEmotionAnalysis> {
  const startTime = Date.now();
  const {
    includeSecondaryEmotions = true,
    culturalContextAnalysis = true,
    jewelryStyleSuggestions = true,
    confidenceThreshold = 0.5,
    maxSecondaryEmotions = 2,
  } = options;

  // Check cache first
  let result = await cache.get(request);
  let fromCache = true;
  let fallbackUsed = false;

  if (!result) {
    fromCache = false;
    try {
      result = await analyzeEmotions(request);
    } catch (error) {
      console.error('Primary emotion analysis failed:', error);
      result = getFallbackAnalysis(request.text, request.language || 'he');
      fallbackUsed = true;
    }
  }

  // Calculate emotion intensity score
  const emotionIntensityScore = calculateEmotionIntensityScore(result);

  // Analyze cultural relevance
  const culturalRelevance = culturalContextAnalysis
    ? analyzeCulturalRelevance(request.text, request.language || 'he')
    : 0;

  // Calculate ambiguity score
  const ambiguityScore = calculateAmbiguityScore(result);

  // Generate recommended actions
  const recommendedActions = generateRecommendedActions(result, culturalRelevance);

  // Calculate jewelry style confidence
  const jewelryStyleConfidence = calculateJewelryStyleConfidence(result);

  // Determine confidence level
  const confidenceLevel = getConfidenceLevel(result.confidence);

  const analysisTime = Date.now() - startTime;

  return {
    ...result,
    emotionIntensityScore,
    culturalRelevance,
    ambiguityScore,
    recommendedActions,
    jewelryStyleConfidence,
    processingMetadata: {
      analysisTime,
      fromCache,
      fallbackUsed,
      confidenceLevel,
    },
  };
}

/**
 * Calculate overall emotion intensity score
 */
function calculateEmotionIntensityScore(analysis: EmotionAnalysisResult): number {
  const primaryScore =
    INTENSITY_SCORES[analysis.primaryEmotion.intensity] * analysis.primaryEmotion.confidence;

  const secondaryScore = analysis.secondaryEmotions.reduce((sum, emotion) => {
    return sum + INTENSITY_SCORES[emotion.intensity] * emotion.confidence * 0.5;
  }, 0);

  return Math.min(1, primaryScore + secondaryScore);
}

/**
 * Analyze cultural relevance of the text
 */
function analyzeCulturalRelevance(text: string, language: string): number {
  const lowerText = text.toLowerCase();
  let relevanceScore = 0;
  let totalPatterns = 0;

  const patterns =
    language === 'he'
      ? CULTURAL_PATTERNS.hebrew
      : language === 'ar'
        ? CULTURAL_PATTERNS.arabic
        : null;

  if (!patterns) return 0;

  Object.values(patterns).forEach(categoryPatterns => {
    categoryPatterns.forEach(pattern => {
      totalPatterns++;
      if (lowerText.includes(pattern.toLowerCase())) {
        relevanceScore++;
      }
    });
  });

  return totalPatterns > 0 ? relevanceScore / totalPatterns : 0;
}

/**
 * Calculate ambiguity score based on emotion confidence distribution
 */
function calculateAmbiguityScore(analysis: EmotionAnalysisResult): number {
  const allEmotions = [analysis.primaryEmotion, ...analysis.secondaryEmotions];

  if (allEmotions.length <= 1) return 0;

  // Calculate variance in confidence scores
  const confidences = allEmotions.map(e => e.confidence);
  const mean = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
  const variance =
    confidences.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / confidences.length;

  // Higher variance = lower ambiguity (more decisive)
  return Math.max(0, 1 - Math.sqrt(variance));
}

/**
 * Generate recommended actions based on emotion analysis
 */
function generateRecommendedActions(
  analysis: EmotionAnalysisResult,
  culturalRelevance: number
): string[] {
  const actions: string[] = [];
  const primaryEmotion = analysis.primaryEmotion.category;

  // Base recommendations by emotion
  const emotionActions = {
    love: [
      'Consider romantic jewelry styles',
      'Focus on meaningful symbols',
      'Explore heart motifs',
    ],
    joy: ['Bright, colorful designs', 'Celebratory elements', 'Playful patterns'],
    peace: ['Minimalist designs', 'Calming colors', 'Simple, clean lines'],
    hope: ['Uplifting symbols', 'Light, airy designs', 'Meaningful engravings'],
    strength: ['Bold, geometric shapes', 'Strong materials', 'Confident styling'],
  };

  actions.push(...(emotionActions[primaryEmotion] || ['Explore meaningful designs']));

  // Cultural recommendations
  if (culturalRelevance > 0.3) {
    actions.push('Incorporate cultural elements', 'Consider traditional motifs');
  }

  // Confidence-based recommendations
  if (analysis.confidence < 0.7) {
    actions.push('Consider multiple design options', 'Explore emotion refinement');
  }

  return actions;
}

/**
 * Calculate confidence in jewelry style suggestions
 */
function calculateJewelryStyleConfidence(analysis: EmotionAnalysisResult): number {
  const primaryConfidence = analysis.primaryEmotion.confidence;
  const styleRelevance = EMOTION_TO_JEWELRY_STYLES[analysis.primaryEmotion.category] ? 1 : 0.5;

  return primaryConfidence * styleRelevance * analysis.confidence;
}

/**
 * Determine confidence level category
 */
function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
}

/**
 * Fallback analysis for when primary analysis fails
 */
function getFallbackAnalysis(text: string, language: string): EmotionAnalysisResult {
  const lowerText = text.toLowerCase();

  // Simple keyword-based emotion detection
  const emotionKeywords = {
    love: ['love', 'אהבה', 'heart', 'לב', 'beloved', 'יקר', 'حب', 'قلب'],
    joy: ['happy', 'שמח', 'joy', 'שמחה', 'celebration', 'חגיגה', 'فرح', 'سعادة'],
    peace: ['peace', 'שלום', 'calm', 'רגוע', 'tranquil', 'שקט', 'سلام', 'هدوء'],
    hope: ['hope', 'תקווה', 'future', 'עתיד', 'dream', 'חלום', 'أمل', 'مستقبل'],
    strength: ['strong', 'חזק', 'power', 'כוח', 'courage', 'אומץ', 'قوة', 'شجاعة'],
  };

  let detectedEmotion: EmotionCategory = 'love';
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
    suggestedJewelryStyles: EMOTION_TO_JEWELRY_STYLES[detectedEmotion] || ['classic', 'meaningful'],
  };
}

/**
 * Analyze emotion trends over time for a user
 */
export function analyzeEmotionTrends(analyses: EmotionAnalysisResult[]): EmotionProfile {
  const emotionCounts = new Map<EmotionCategory, number>();
  const emotionIntensities = new Map<EmotionCategory, number[]>();

  // Count emotions and track intensities
  analyses.forEach(analysis => {
    const emotion = analysis.primaryEmotion.category;
    emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);

    if (!emotionIntensities.has(emotion)) {
      emotionIntensities.set(emotion, []);
    }
    emotionIntensities.get(emotion)!.push(INTENSITY_SCORES[analysis.primaryEmotion.intensity]);
  });

  // Calculate dominant emotions
  const dominantEmotions = Array.from(emotionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emotion]) => emotion);

  // Calculate emotional range (diversity)
  const uniqueEmotions = emotionCounts.size;
  const totalAnalyses = analyses.length;
  const emotionalRange =
    totalAnalyses > 0
      ? uniqueEmotions / Math.min(totalAnalyses, Object.keys(EMOTION_CATEGORIES).length)
      : 0;

  // Determine intensity pattern
  const intensityPattern = determineIntensityPattern(analyses);

  // Calculate cultural influence (placeholder)
  const culturalInfluence = 0.5; // Would be calculated based on cultural context analysis

  // Generate trends
  const trends: EmotionTrend[] = Array.from(emotionCounts.entries()).map(
    ([emotion, frequency]) => ({
      emotion,
      frequency,
      averageIntensity:
        emotionIntensities.get(emotion)!.reduce((sum, i) => sum + i, 0) /
        emotionIntensities.get(emotion)!.length,
      contexts: [], // Would be populated with actual context analysis
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date(),
      },
    })
  );

  return {
    dominantEmotions,
    emotionalRange,
    intensityPattern,
    culturalInfluence,
    trends,
  };
}

/**
 * Determine intensity pattern from analyses
 */
function determineIntensityPattern(
  analyses: EmotionAnalysisResult[]
): 'consistent' | 'variable' | 'escalating' | 'declining' {
  if (analyses.length < 3) return 'consistent';

  const intensities = analyses.map(a => INTENSITY_SCORES[a.primaryEmotion.intensity]);
  const variance = calculateVariance(intensities);

  if (variance < 0.1) return 'consistent';

  // Check for trends
  const firstHalf = intensities.slice(0, Math.floor(intensities.length / 2));
  const secondHalf = intensities.slice(Math.floor(intensities.length / 2));

  const firstAvg = firstHalf.reduce((sum, i) => sum + i, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, i) => sum + i, 0) / secondHalf.length;

  if (secondAvg > firstAvg + 0.1) return 'escalating';
  if (secondAvg < firstAvg - 0.1) return 'declining';

  return 'variable';
}

/**
 * Calculate variance of an array of numbers
 */
function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  return numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
}

/**
 * Get jewelry style suggestions for an emotion
 */
export function getJewelryStylesForEmotion(emotion: EmotionCategory): string[] {
  return EMOTION_TO_JEWELRY_STYLES[emotion] || ['classic', 'meaningful'];
}

/**
 * Validate emotion analysis request
 */
export function validateEmotionRequest(request: any): request is EmotionAnalysisRequest {
  return (
    request &&
    typeof request.text === 'string' &&
    request.text.trim().length > 0 &&
    request.text.length <= 5000 &&
    (!request.language || ['he', 'en', 'ar'].includes(request.language))
  );
}
