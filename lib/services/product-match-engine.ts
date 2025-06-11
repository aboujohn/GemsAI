import { createClient } from '@/lib/supabase/client';
import { EmotionAnalysisResult, EmotionCategory } from '@/lib/types/emotions';
import { Product, SketchProductMatch } from '@/lib/types/database';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface MatchCriteria {
  emotions: EmotionAnalysisResult;
  userPreferences?: UserMatchPreferences;
  culturalContext?: string;
  priceRange?: [number, number];
  availableOnly?: boolean;
  maxResults?: number;
}

export interface UserMatchPreferences {
  userId: string;
  preferredStyles: string[];
  preferredMaterials: string[];
  culturalAlignment: number; // 0-1
  occasionTypes: string[];
  priceRange: PriceCategory;
  styleEvolution: 'traditional' | 'modern' | 'eclectic';
}

export interface MatchResult {
  product: Product;
  score: MatchScore;
  explanation: string[];
  rank: number;
}

export interface MatchScore {
  overall_score: number;      // 0-1 final relevance score
  emotion_alignment: number;  // How well emotions match (0-1)
  style_compatibility: number; // Style tag overlap (0-1)
  cultural_relevance: number; // Cultural context fit (0-1)
  personalization: number;    // User history alignment (0-1)
  quality_metrics: number;    // Product rating/popularity (0-1)
  confidence: number;         // Algorithm confidence (0-1)
}

export type PriceCategory = 'budget' | 'mid' | 'luxury' | 'ultra';

// ============================================================================
// EMOTION-TO-STYLE MAPPING FRAMEWORK
// ============================================================================

export interface EmotionStyleMapping {
  styles: string[];
  colors: string[];
  symbols: string[];
  materials: string[];
  formality_level: [number, number]; // min-max range 1-10
  statement_level: [number, number]; // min-max range 1-10 (subtle to bold)
  cultural_variants: Record<string, Partial<EmotionStyleMapping>>;
  weight: number; // confidence in mapping 0-1
}

export const EMOTION_TO_STYLE_MAP: Record<EmotionCategory, EmotionStyleMapping> = {
  love: {
    styles: ['romantic', 'heart-shaped', 'rose-gold', 'vintage', 'delicate', 'solitaire', 'infinity'],
    colors: ['rose-gold', 'soft-pink', 'warm-tones', 'red', 'white-gold'],
    symbols: ['hearts', 'infinity', 'intertwined', 'doves', 'roses', 'couples'],
    materials: ['rose-gold', 'pearls', 'soft-gemstones', 'diamonds', 'morganite'],
    formality_level: [6, 10], // Tends toward formal
    statement_level: [4, 8], // Moderate to statement
    cultural_variants: {
      hebrew: {
        symbols: ['chai', 'hamsa', 'jewish-star', 'hebrew-letters'],
        materials: ['white-gold', 'yellow-gold']
      }
    },
    weight: 0.95
  },
  joy: {
    styles: ['bright', 'colorful', 'playful', 'modern', 'statement', 'geometric', 'bold'],
    colors: ['vibrant', 'rainbow', 'yellow-gold', 'multi-color', 'bright-gems'],
    symbols: ['suns', 'stars', 'flowers', 'geometric', 'celebration', 'party'],
    materials: ['yellow-gold', 'colorful-gems', 'enamel', 'citrine', 'sapphire'],
    formality_level: [3, 8], // Can be casual to formal
    statement_level: [6, 10], // Tends toward statement pieces
    cultural_variants: {
      hebrew: {
        symbols: ['menorah', 'pomegranate', 'grapes', 'olive-branch']
      }
    },
    weight: 0.90
  },
  gratitude: {
    styles: ['classic', 'timeless', 'warm', 'golden', 'traditional', 'elegant'],
    colors: ['golden', 'warm-tones', 'amber', 'bronze', 'yellow-gold'],
    symbols: ['hands', 'blessings', 'abundance', 'harvest', 'giving'],
    materials: ['yellow-gold', 'amber', 'warm-gemstones', 'topaz'],
    formality_level: [5, 9], // Moderate to formal
    statement_level: [3, 7], // Subtle to moderate
    cultural_variants: {
      hebrew: {
        symbols: ['shofar', 'wheat', 'pomegranate', 'blessing-hands']
      }
    },
    weight: 0.85
  },
  nostalgia: {
    styles: ['vintage', 'antique', 'heirloom', 'traditional', 'sentimental', 'art-deco'],
    colors: ['antique-gold', 'sepia', 'muted-tones', 'vintage-silver'],
    symbols: ['keys', 'lockets', 'cameos', 'family-crests', 'vintage-patterns'],
    materials: ['vintage-gold', 'antique-silver', 'pearls', 'vintage-gems'],
    formality_level: [4, 8], // Traditional formality
    statement_level: [2, 6], // Subtle to moderate
    cultural_variants: {
      hebrew: {
        symbols: ['family-tree', 'generations', 'torah-scroll', 'ancient-symbols']
      }
    },
    weight: 0.88
  },
  pride: {
    styles: ['bold', 'statement', 'achievement', 'success', 'strong', 'geometric'],
    colors: ['gold', 'bold-colors', 'deep-tones', 'royal-blue', 'emerald'],
    symbols: ['crowns', 'achievements', 'strong-geometric', 'eagles', 'shields'],
    materials: ['gold', 'precious-gems', 'platinum', 'emerald', 'sapphire'],
    formality_level: [7, 10], // Formal to very formal
    statement_level: [6, 10], // Statement pieces
    cultural_variants: {
      hebrew: {
        symbols: ['lion-of-judah', 'crown', 'star-of-david', 'strength']
      }
    },
    weight: 0.92
  },
  peace: {
    styles: ['minimalist', 'zen', 'simple', 'clean-lines', 'serene', 'flowing'],
    colors: ['soft-tones', 'white', 'light-blue', 'pale-green', 'pearl-white'],
    symbols: ['doves', 'olive-branches', 'waves', 'circles', 'smooth-curves'],
    materials: ['white-gold', 'silver', 'pearls', 'moonstone', 'aquamarine'],
    formality_level: [2, 7], // Casual to moderate formal
    statement_level: [1, 4], // Very subtle
    cultural_variants: {
      hebrew: {
        symbols: ['shalom', 'olive-branch', 'dove-with-branch']
      }
    },
    weight: 0.87
  },
  hope: {
    styles: ['uplifting', 'light', 'ethereal', 'symbolic', 'meaningful', 'inspiring'],
    colors: ['light-tones', 'silver', 'white', 'light-blue', 'pastel'],
    symbols: ['stars', 'rising-sun', 'birds', 'growing-plants', 'lighthouses'],
    materials: ['silver', 'white-gold', 'clear-gems', 'diamond', 'crystal'],
    formality_level: [3, 8], // Flexible formality
    statement_level: [3, 7], // Moderate
    cultural_variants: {
      hebrew: {
        symbols: ['rainbow', 'sunrise', 'new-growth', 'hatikva']
      }
    },
    weight: 0.86
  },
  strength: {
    styles: ['bold', 'geometric', 'powerful', 'structured', 'confident', 'angular'],
    colors: ['strong-colors', 'black', 'dark-tones', 'metallic', 'steel'],
    symbols: ['geometric-shapes', 'arrows', 'mountains', 'anchors', 'shields'],
    materials: ['platinum', 'titanium', 'strong-metals', 'onyx', 'hematite'],
    formality_level: [5, 9], // Moderate to formal
    statement_level: [6, 10], // Statement pieces
    cultural_variants: {
      hebrew: {
        symbols: ['fortress', 'rock', 'mountain', 'strong-tree']
      }
    },
    weight: 0.90
  },
  elegance: {
    styles: ['sophisticated', 'refined', 'luxury', 'classic', 'graceful', 'timeless'],
    colors: ['classic-tones', 'platinum', 'pearl-white', 'subtle-colors'],
    symbols: ['graceful-curves', 'classic-motifs', 'sophisticated-patterns'],
    materials: ['platinum', 'high-quality-gems', 'pearls', 'fine-metals'],
    formality_level: [7, 10], // Formal to very formal
    statement_level: [4, 8], // Refined statement
    cultural_variants: {
      hebrew: {
        symbols: ['refined-hebrew-letters', 'elegant-jewish-motifs']
      }
    },
    weight: 0.93
  },
  passion: {
    styles: ['intense', 'red', 'dramatic', 'bold', 'striking', 'fiery'],
    colors: ['red', 'deep-red', 'burgundy', 'intense-colors', 'fire-tones'],
    symbols: ['flames', 'intense-shapes', 'dramatic-curves', 'bold-patterns'],
    materials: ['red-gems', 'ruby', 'garnet', 'red-gold', 'dramatic-stones'],
    formality_level: [5, 9], // Can be dressy
    statement_level: [7, 10], // Bold statements
    cultural_variants: {
      hebrew: {
        symbols: ['burning-bush', 'intense-jewish-symbols']
      }
    },
    weight: 0.89
  },
  tenderness: {
    styles: ['soft', 'gentle', 'flowing', 'organic', 'nurturing', 'delicate'],
    colors: ['soft-tones', 'pastel', 'gentle-colors', 'baby-colors'],
    symbols: ['gentle-curves', 'flowers', 'soft-shapes', 'nurturing-symbols'],
    materials: ['soft-metals', 'gentle-gems', 'pearls', 'rose-quartz'],
    formality_level: [2, 6], // Casual to moderate
    statement_level: [1, 5], // Subtle
    cultural_variants: {
      hebrew: {
        symbols: ['mother-symbols', 'protective-hands', 'gentle-hebrew']
      }
    },
    weight: 0.84
  },
  celebration: {
    styles: ['festive', 'sparkling', 'joyful', 'ornate', 'decorative', 'party'],
    colors: ['sparkling', 'bright-colors', 'festive-tones', 'multi-color'],
    symbols: ['stars', 'fireworks', 'celebration-motifs', 'party-symbols'],
    materials: ['sparkling-gems', 'multiple-stones', 'festive-metals'],
    formality_level: [4, 9], // Flexible for occasions
    statement_level: [6, 10], // Often statement pieces
    cultural_variants: {
      hebrew: {
        symbols: ['festival-symbols', 'holiday-motifs', 'celebration-hebrew']
      }
    },
    weight: 0.91
  },
  remembrance: {
    styles: ['memorial', 'symbolic', 'meaningful', 'eternal', 'tribute', 'lasting'],
    colors: ['memorial-tones', 'eternal-colors', 'respectful-colors'],
    symbols: ['eternal-symbols', 'memory-motifs', 'lasting-patterns'],
    materials: ['lasting-metals', 'memorial-stones', 'eternal-materials'],
    formality_level: [5, 9], // Respectful formality
    statement_level: [3, 7], // Meaningful but respectful
    cultural_variants: {
      hebrew: {
        symbols: ['yahrzeit', 'memory-symbols', 'eternal-hebrew']
      }
    },
    weight: 0.87
  },
  determination: {
    styles: ['focused', 'linear', 'purposeful', 'strong', 'unwavering', 'directed'],
    colors: ['focused-colors', 'strong-tones', 'determined-colors'],
    symbols: ['arrows', 'straight-lines', 'goal-symbols', 'direction-motifs'],
    materials: ['strong-materials', 'focused-gems', 'determined-metals'],
    formality_level: [4, 8], // Professional to formal
    statement_level: [5, 9], // Noticeable
    cultural_variants: {
      hebrew: {
        symbols: ['determination-hebrew', 'strong-jewish-symbols']
      }
    },
    weight: 0.88
  },
  friendship: {
    styles: ['connected', 'linked', 'shared', 'bonding', 'unity', 'partnership'],
    colors: ['friendly-colors', 'warm-tones', 'connecting-colors'],
    symbols: ['links', 'connections', 'friendship-symbols', 'unity-motifs'],
    materials: ['connecting-metals', 'friendship-gems', 'shared-materials'],
    formality_level: [2, 7], // Casual to moderate
    statement_level: [3, 7], // Moderate
    cultural_variants: {
      hebrew: {
        symbols: ['friendship-hebrew', 'unity-jewish-symbols']
      }
    },
    weight: 0.86
  },
  family: {
    styles: ['generational', 'heritage', 'bonding', 'protective', 'nurturing', 'traditional'],
    colors: ['family-tones', 'generational-colors', 'heritage-colors'],
    symbols: ['family-trees', 'generations', 'protection', 'family-motifs'],
    materials: ['heritage-metals', 'family-gems', 'generational-materials'],
    formality_level: [4, 9], // Family-appropriate
    statement_level: [3, 8], // Meaningful
    cultural_variants: {
      hebrew: {
        symbols: ['family-hebrew', 'generational-jewish-symbols', 'l-dor-v-dor']
      }
    },
    weight: 0.92
  },
  romance: {
    styles: ['intimate', 'personal', 'loving', 'tender', 'devoted', 'couple-focused'],
    colors: ['romantic-colors', 'intimate-tones', 'loving-colors'],
    symbols: ['couple-symbols', 'intimate-motifs', 'romantic-patterns'],
    materials: ['romantic-metals', 'intimate-gems', 'loving-materials'],
    formality_level: [4, 9], // Personal to formal
    statement_level: [4, 8], // Personal statement
    cultural_variants: {
      hebrew: {
        symbols: ['romantic-hebrew', 'loving-jewish-symbols']
      }
    },
    weight: 0.94
  }
};

// ============================================================================
// SCORING WEIGHTS CONFIGURATION
// ============================================================================

export interface ScoringWeights {
  emotion_alignment: number;
  style_compatibility: number;
  cultural_relevance: number;
  personalization: number;
  quality_metrics: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  emotion_alignment: 0.40,
  style_compatibility: 0.25,
  cultural_relevance: 0.15,
  personalization: 0.15,
  quality_metrics: 0.05
};

// ============================================================================
// PRODUCT MATCH ENGINE
// ============================================================================

export class ProductMatchEngine {
  private supabase = createClient();
  private weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS;
  private cache = new Map<string, MatchResult[]>();

  constructor(customWeights?: Partial<ScoringWeights>) {
    if (customWeights) {
      this.weights = { ...DEFAULT_SCORING_WEIGHTS, ...customWeights };
    }
  }

  /**
   * Main matching function - finds products that match emotional criteria
   */
  async findMatches(criteria: MatchCriteria): Promise<MatchResult[]> {
    const cacheKey = this.generateCacheKey(criteria);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Get products from database with initial filtering
      const products = await this.getFilteredProducts(criteria);
      
      // Score and rank products
      const scoredResults = await this.scoreProducts(products, criteria);
      
      // Apply final filtering and sorting
      const finalResults = this.optimizeResults(scoredResults, criteria);
      
      // Cache results
      this.cache.set(cacheKey, finalResults);
      
      return finalResults;
    } catch (error) {
      console.error('Error in findMatches:', error);
      return this.getFallbackMatches(criteria);
    }
  }

  /**
   * Get products from database with initial filtering
   */
  private async getFilteredProducts(criteria: MatchCriteria): Promise<Product[]> {
    let query = this.supabase
      .from('products')
      .select('*')
      .eq('is_available', criteria.availableOnly !== false);

    // Add emotion tag filtering if available
    if (criteria.emotions.primaryEmotion) {
      const emotionTags = this.getEmotionTagsForFiltering(criteria.emotions);
      if (emotionTags.length > 0) {
        query = query.overlaps('emotion_tags', emotionTags);
      }
    }

    // Add price filtering
    if (criteria.priceRange) {
      query = query
        .gte('price', criteria.priceRange[0])
        .lte('price', criteria.priceRange[1]);
    }

    // Limit results for performance
    query = query.limit(criteria.maxResults || 100);

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  /**
   * Score products based on emotional and other criteria
   */
  private async scoreProducts(products: Product[], criteria: MatchCriteria): Promise<MatchResult[]> {
    const results: MatchResult[] = [];

    for (const product of products) {
      const score = await this.calculateMatchScore(product, criteria);
      const explanation = this.generateExplanation(product, criteria, score);
      
      results.push({
        product,
        score,
        explanation,
        rank: 0 // Will be set during optimization
      });
    }

    return results;
  }

  /**
   * Calculate comprehensive match score for a product
   */
  private async calculateMatchScore(product: Product, criteria: MatchCriteria): Promise<MatchScore> {
    // Emotion alignment score
    const emotion_alignment = this.calculateEmotionAlignment(product, criteria.emotions);
    
    // Style compatibility score
    const style_compatibility = this.calculateStyleCompatibility(product, criteria.emotions);
    
    // Cultural relevance score
    const cultural_relevance = this.calculateCulturalRelevance(product, criteria.culturalContext);
    
    // Personalization score
    const personalization = criteria.userPreferences 
      ? this.calculatePersonalizationScore(product, criteria.userPreferences)
      : 0.5;
    
    // Quality metrics score
    const quality_metrics = this.calculateQualityScore(product);
    
    // Calculate overall score
    const overall_score = 
      emotion_alignment * this.weights.emotion_alignment +
      style_compatibility * this.weights.style_compatibility +
      cultural_relevance * this.weights.cultural_relevance +
      personalization * this.weights.personalization +
      quality_metrics * this.weights.quality_metrics;

    // Calculate confidence based on data completeness
    const confidence = this.calculateConfidence(product, criteria);

    return {
      overall_score,
      emotion_alignment,
      style_compatibility,
      cultural_relevance,
      personalization,
      quality_metrics,
      confidence
    };
  }

  /**
   * Calculate how well product emotions align with user emotions
   */
  private calculateEmotionAlignment(product: Product, emotions: EmotionAnalysisResult): number {
    if (!product.emotion_tags || product.emotion_tags.length === 0) {
      return 0.3; // Default score for products without emotion tags
    }

    const primaryEmotion = emotions.primaryEmotion.category;
    const primaryWeight = emotions.primaryEmotion.confidence;
    
    // Check primary emotion match
    let score = 0;
    if (product.emotion_tags.includes(primaryEmotion)) {
      score += 0.6 * primaryWeight;
    }

    // Check secondary emotions
    for (const secondaryEmotion of emotions.secondaryEmotions) {
      if (product.emotion_tags.includes(secondaryEmotion.category)) {
        score += 0.2 * secondaryEmotion.confidence;
      }
    }

    // Check for related emotions using our mapping
    const mappedEmotions = this.getRelatedEmotions(primaryEmotion);
    for (const mappedEmotion of mappedEmotions) {
      if (product.emotion_tags.includes(mappedEmotion)) {
        score += 0.1;
      }
    }

    return Math.min(1, score);
  }

  /**
   * Calculate style compatibility based on emotion-to-style mapping
   */
  private calculateStyleCompatibility(product: Product, emotions: EmotionAnalysisResult): number {
    if (!product.style_tags || product.style_tags.length === 0) {
      return 0.4; // Default score for products without style tags
    }

    const primaryEmotion = emotions.primaryEmotion.category;
    const emotionMapping = EMOTION_TO_STYLE_MAP[primaryEmotion];
    
    if (!emotionMapping) {
      return 0.4;
    }

    let score = 0;
    let totalPossible = 0;

    // Check style tag matches
    const allMappedStyles = [
      ...emotionMapping.styles,
      ...emotionMapping.colors,
      ...emotionMapping.symbols,
      ...emotionMapping.materials
    ];

    for (const mappedStyle of allMappedStyles) {
      totalPossible++;
      if (product.style_tags.some(tag => 
        tag.toLowerCase().includes(mappedStyle.toLowerCase()) ||
        mappedStyle.toLowerCase().includes(tag.toLowerCase())
      )) {
        score++;
      }
    }

    // Weight by emotion mapping confidence
    const styleScore = totalPossible > 0 ? (score / totalPossible) : 0.4;
    return styleScore * emotionMapping.weight;
  }

  /**
   * Calculate cultural relevance score
   */
  private calculateCulturalRelevance(product: Product, culturalContext?: string): number {
    if (!culturalContext) {
      return 0.7; // Neutral score when no cultural context
    }

    // Check for cultural indicators in product data
    const culturalScore = this.analyzeCulturalIndicators(product, culturalContext);
    return culturalScore;
  }

  /**
   * Calculate personalization score based on user preferences
   */
  private calculatePersonalizationScore(product: Product, preferences: UserMatchPreferences): number {
    let score = 0;
    let factors = 0;

    // Style preferences
    if (preferences.preferredStyles.length > 0 && product.style_tags) {
      const styleMatches = preferences.preferredStyles.filter(style =>
        product.style_tags!.includes(style)
      ).length;
      score += (styleMatches / preferences.preferredStyles.length) * 0.4;
      factors += 0.4;
    }

    // Material preferences
    if (preferences.preferredMaterials.length > 0 && product.materials) {
      const materialMatches = preferences.preferredMaterials.filter(material =>
        product.materials!.includes(material)
      ).length;
      score += (materialMatches / preferences.preferredMaterials.length) * 0.3;
      factors += 0.3;
    }

    // Price range preference
    if (product.price) {
      const priceScore = this.calculatePricePreferenceScore(product.price, preferences.priceRange);
      score += priceScore * 0.3;
      factors += 0.3;
    }

    return factors > 0 ? score / factors : 0.5;
  }

  /**
   * Calculate quality score based on product metrics
   */
  private calculateQualityScore(product: Product): number {
    let score = 0.5; // Base score

    // Featured products get bonus
    if (product.featured) {
      score += 0.2;
    }

    // Available products preferred
    if (product.is_available) {
      score += 0.1;
    }

    // Products with images preferred
    if (product.images && product.images.length > 0) {
      score += 0.1;
    }

    // Reasonable lead time preferred (<=14 days)
    if (product.lead_time_days <= 14) {
      score += 0.1;
    }

    return Math.min(1, score);
  }

  /**
   * Calculate confidence score based on data completeness
   */
  private calculateConfidence(product: Product, criteria: MatchCriteria): number {
    let confidence = 0;
    let factors = 0;

    // Emotion tags completeness
    if (product.emotion_tags && product.emotion_tags.length > 0) {
      confidence += 0.3;
    }
    factors += 0.3;

    // Style tags completeness
    if (product.style_tags && product.style_tags.length > 0) {
      confidence += 0.2;
    }
    factors += 0.2;

    // Materials data
    if (product.materials && product.materials.length > 0) {
      confidence += 0.2;
    }
    factors += 0.2;

    // Images availability
    if (product.images && product.images.length > 0) {
      confidence += 0.1;
    }
    factors += 0.1;

    // Price data
    if (product.price) {
      confidence += 0.1;
    }
    factors += 0.1;

    // Primary emotion strength
    confidence += criteria.emotions.primaryEmotion.confidence * 0.1;
    factors += 0.1;

    return factors > 0 ? confidence / factors : 0.5;
  }

  /**
   * Optimize and rank final results
   */
  private optimizeResults(results: MatchResult[], criteria: MatchCriteria): MatchResult[] {
    // Sort by overall score
    const sorted = results.sort((a, b) => b.score.overall_score - a.score.overall_score);
    
    // Apply diversity filtering
    const diversified = this.ensureDiversity(sorted);
    
    // Limit to max results
    const limited = diversified.slice(0, criteria.maxResults || 20);
    
    // Add rank
    limited.forEach((result, index) => {
      result.rank = index + 1;
    });

    return limited;
  }

  /**
   * Ensure diversity in results to prevent too many similar products
   */
  private ensureDiversity(results: MatchResult[]): MatchResult[] {
    const diversified: MatchResult[] = [];
    const jewelerCount = new Map<string, number>();
    const styleCount = new Map<string, number>();

    for (const result of results) {
      const jewelerId = result.product.jeweler_id;
      const currentJewelerCount = jewelerCount.get(jewelerId) || 0;
      
      // Limit products per jeweler (max 30% of results)
      const maxPerJeweler = Math.ceil(results.length * 0.3);
      if (currentJewelerCount >= maxPerJeweler) {
        continue;
      }

      // Add to diversified results
      diversified.push(result);
      jewelerCount.set(jewelerId, currentJewelerCount + 1);
    }

    return diversified;
  }

  /**
   * Generate explanation for match
   */
  private generateExplanation(product: Product, criteria: MatchCriteria, score: MatchScore): string[] {
    const explanations: string[] = [];
    const primaryEmotion = criteria.emotions.primaryEmotion.category;

    // Emotion alignment explanation
    if (score.emotion_alignment > 0.7) {
      explanations.push(`Perfect emotional match for ${primaryEmotion}`);
    } else if (score.emotion_alignment > 0.5) {
      explanations.push(`Good emotional alignment with ${primaryEmotion}`);
    }

    // Style compatibility explanation
    if (score.style_compatibility > 0.7) {
      explanations.push('Excellent style compatibility with your emotions');
    } else if (score.style_compatibility > 0.5) {
      explanations.push('Good style match for your emotional expression');
    }

    // Cultural relevance explanation
    if (score.cultural_relevance > 0.7) {
      explanations.push('Culturally appropriate and meaningful');
    }

    // Quality explanation
    if (score.quality_metrics > 0.8) {
      explanations.push('High-quality product with excellent features');
    }

    // Personalization explanation
    if (score.personalization > 0.7) {
      explanations.push('Matches your personal style preferences');
    }

    return explanations;
  }

  /**
   * Get fallback matches when main algorithm fails
   */
  private async getFallbackMatches(criteria: MatchCriteria): Promise<MatchResult[]> {
    try {
      // Simple fallback: get featured products
      const { data: products } = await this.supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('is_available', true)
        .limit(10);

      if (!products) return [];

      return products.map((product, index) => ({
        product,
        score: {
          overall_score: 0.5,
          emotion_alignment: 0.4,
          style_compatibility: 0.4,
          cultural_relevance: 0.5,
          personalization: 0.5,
          quality_metrics: 0.8,
          confidence: 0.6
        },
        explanation: ['Featured product', 'High quality selection'],
        rank: index + 1
      }));
    } catch (error) {
      console.error('Fallback matches failed:', error);
      return [];
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateCacheKey(criteria: MatchCriteria): string {
    return JSON.stringify({
      primaryEmotion: criteria.emotions.primaryEmotion,
      secondaryEmotions: criteria.emotions.secondaryEmotions,
      userPreferences: criteria.userPreferences?.userId,
      priceRange: criteria.priceRange,
      maxResults: criteria.maxResults
    });
  }

  private getEmotionTagsForFiltering(emotions: EmotionAnalysisResult): string[] {
    const tags = [emotions.primaryEmotion.category];
    emotions.secondaryEmotions.forEach(emotion => {
      tags.push(emotion.category);
    });
    return tags;
  }

  private getRelatedEmotions(emotion: EmotionCategory): string[] {
    // Define emotion relationships for better matching
    const relationships: Record<string, string[]> = {
      love: ['romance', 'tenderness', 'family'],
      joy: ['celebration', 'hope', 'gratitude'],
      romance: ['love', 'tenderness', 'passion'],
      family: ['love', 'pride', 'gratitude'],
      // Add more relationships as needed
    };

    return relationships[emotion] || [];
  }

  private analyzeCulturalIndicators(product: Product, culturalContext: string): number {
    // Analyze product for cultural relevance
    let score = 0.5; // Base score

    if (culturalContext === 'hebrew' || culturalContext === 'jewish') {
      // Check for Hebrew/Jewish cultural indicators
      const culturalTags = product.style_tags || [];
      const culturalKeywords = ['hebrew', 'jewish', 'kosher', 'traditional', 'chai', 'hamsa', 'star-of-david'];
      
      for (const keyword of culturalKeywords) {
        if (culturalTags.some(tag => tag.toLowerCase().includes(keyword))) {
          score += 0.1;
        }
      }
    }

    return Math.min(1, score);
  }

  private calculatePricePreferenceScore(price: number, priceRange: PriceCategory): number {
    const ranges = {
      budget: [0, 1000],
      mid: [1000, 5000],
      luxury: [5000, 15000],
      ultra: [15000, Infinity]
    };

    const [min, max] = ranges[priceRange];
    if (price >= min && price <= max) {
      return 1.0;
    }

    // Partial score for nearby ranges
    const distance = Math.min(Math.abs(price - min), Math.abs(price - max));
    const maxDistance = max - min;
    return Math.max(0, 1 - (distance / maxDistance));
  }

  /**
   * Update algorithm weights for tuning
   */
  updateWeights(newWeights: Partial<ScoringWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
    this.cache.clear(); // Clear cache when weights change
  }

  /**
   * Clear match cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get algorithm statistics
   */
  getStats(): { cacheSize: number; weights: ScoringWeights } {
    return {
      cacheSize: this.cache.size,
      weights: { ...this.weights }
    };
  }
}

// ============================================================================
// FACTORY AND EXPORTS
// ============================================================================

export function createProductMatchEngine(weights?: Partial<ScoringWeights>): ProductMatchEngine {
  return new ProductMatchEngine(weights);
}

export default ProductMatchEngine; 