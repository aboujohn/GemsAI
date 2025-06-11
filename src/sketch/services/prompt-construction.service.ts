import { Injectable, Logger } from '@nestjs/common';

export interface EmotionTag {
  name: string;
  intensity: number; // 0-1
}

export interface SketchStyle {
  name: string;
  modifiers: string[];
  quality: 'draft' | 'standard' | 'high';
}

export interface PromptConstructionOptions {
  storyText: string;
  emotionTags: EmotionTag[];
  style: SketchStyle;
  additionalContext?: string;
}

export interface ConstructedPrompt {
  fullPrompt: string;
  basePrompt: string;
  emotionModifiers: string[];
  styleModifiers: string[];
  qualitySettings: {
    quality: string;
    size: string;
    model: string;
  };
}

@Injectable()
export class PromptConstructionService {
  private readonly logger = new Logger(PromptConstructionService.name);
  
  // Predefined sketch styles with their modifiers
  private readonly sketchStyles: Record<string, SketchStyle> = {
    realistic: {
      name: 'realistic',
      modifiers: [
        'photorealistic',
        'highly detailed',
        'professional photography',
        'studio lighting',
        'sharp focus'
      ],
      quality: 'high'
    },
    cartoon: {
      name: 'cartoon',
      modifiers: [
        'cartoon style',
        'animated',
        'colorful',
        'friendly',
        'stylized illustration'
      ],
      quality: 'standard'
    },
    abstract: {
      name: 'abstract',
      modifiers: [
        'abstract art',
        'conceptual',
        'artistic interpretation',
        'creative composition',
        'expressive'
      ],
      quality: 'standard'
    },
    sketch: {
      name: 'sketch',
      modifiers: [
        'pencil sketch',
        'hand-drawn',
        'artistic sketch',
        'line art',
        'monochrome'
      ],
      quality: 'draft'
    },
    watercolor: {
      name: 'watercolor',
      modifiers: [
        'watercolor painting',
        'soft colors',
        'artistic brush strokes',
        'gentle blending',
        'traditional art'
      ],
      quality: 'standard'
    }
  };

  // Emotion-specific prompt modifiers
  private readonly emotionModifiers: Record<string, string[]> = {
    joy: ['bright colors', 'warm lighting', 'cheerful atmosphere', 'uplifting mood'],
    sadness: ['muted colors', 'soft lighting', 'melancholic atmosphere', 'gentle mood'],
    anger: ['bold colors', 'dramatic lighting', 'intense atmosphere', 'powerful mood'],
    fear: ['dark tones', 'mysterious lighting', 'tense atmosphere', 'suspenseful mood'],
    surprise: ['vibrant colors', 'dynamic lighting', 'energetic atmosphere', 'exciting mood'],
    love: ['warm colors', 'soft lighting', 'romantic atmosphere', 'tender mood'],
    peace: ['calm colors', 'serene lighting', 'tranquil atmosphere', 'peaceful mood'],
    excitement: ['electric colors', 'dynamic lighting', 'energetic atmosphere', 'thrilling mood']
  };

  /**
   * Construct an optimized prompt for AI image generation
   */
  async constructPrompt(options: PromptConstructionOptions): Promise<ConstructedPrompt> {
    this.logger.log(`Constructing prompt for story with ${options.emotionTags.length} emotion tags`);

    try {
      // Get base story prompt
      const basePrompt = this.extractStoryElements(options.storyText);
      
      // Get emotion modifiers
      const emotionModifiers = this.buildEmotionModifiers(options.emotionTags);
      
      // Get style modifiers
      const styleModifiers = this.getStyleModifiers(options.style);
      
      // Combine all elements
      const fullPrompt = this.buildFullPrompt({
        basePrompt,
        emotionModifiers,
        styleModifiers,
        additionalContext: options.additionalContext
      });

      const qualitySettings = this.getQualitySettings(options.style);

      const result: ConstructedPrompt = {
        fullPrompt,
        basePrompt,
        emotionModifiers,
        styleModifiers,
        qualitySettings
      };

      this.logger.log(`Prompt constructed successfully: ${fullPrompt.length} characters`);
      return result;

    } catch (error) {
      this.logger.error('Failed to construct prompt:', error);
      throw new Error(`Prompt construction failed: ${error.message}`);
    }
  }

  /**
   * Get available sketch styles
   */
  getAvailableStyles(): SketchStyle[] {
    return Object.values(this.sketchStyles);
  }

  /**
   * Get a specific style by name
   */
  getStyle(styleName: string): SketchStyle | null {
    return this.sketchStyles[styleName] || null;
  }

  /**
   * Extract key visual elements from story text
   */
  private extractStoryElements(storyText: string): string {
    // Clean and prepare the story text
    const cleanText = storyText.trim();
    
    // For now, use the story text directly with some enhancement
    // In the future, this could use NLP to extract key visual elements
    const enhancedPrompt = `Create a visual representation of: ${cleanText}`;
    
    return enhancedPrompt;
  }

  /**
   * Build emotion-based modifiers
   */
  private buildEmotionModifiers(emotionTags: EmotionTag[]): string[] {
    const modifiers: string[] = [];
    
    for (const tag of emotionTags) {
      const emotionMods = this.emotionModifiers[tag.name.toLowerCase()];
      if (emotionMods) {
        // Weight modifiers by emotion intensity
        const weightedMods = emotionMods.map(mod => {
          if (tag.intensity > 0.7) {
            return `${mod} (strong)`;
          } else if (tag.intensity > 0.4) {
            return mod;
          } else {
            return `subtle ${mod}`;
          }
        });
        modifiers.push(...weightedMods);
      }
    }
    
    return modifiers;
  }

  /**
   * Get style-specific modifiers
   */
  private getStyleModifiers(style: SketchStyle): string[] {
    return [...style.modifiers];
  }

  /**
   * Build the complete prompt
   */
  private buildFullPrompt(components: {
    basePrompt: string;
    emotionModifiers: string[];
    styleModifiers: string[];
    additionalContext?: string;
  }): string {
    const parts: string[] = [components.basePrompt];
    
    // Add style modifiers
    if (components.styleModifiers.length > 0) {
      parts.push(`Style: ${components.styleModifiers.join(', ')}`);
    }
    
    // Add emotion modifiers
    if (components.emotionModifiers.length > 0) {
      parts.push(`Mood: ${components.emotionModifiers.join(', ')}`);
    }
    
    // Add additional context
    if (components.additionalContext) {
      parts.push(components.additionalContext);
    }
    
    // Add quality enhancement
    parts.push('high quality, detailed, professional');
    
    return parts.join('. ');
  }

  /**
   * Get quality settings based on style
   */
  private getQualitySettings(style: SketchStyle): {
    quality: string;
    size: string;
    model: string;
  } {
    const sizeMap = {
      draft: '512x512',
      standard: '1024x1024',
      high: '1024x1024'
    };

    return {
      quality: style.quality,
      size: sizeMap[style.quality],
      model: 'dall-e-3' // Default to DALL-E 3 for best quality
    };
  }
} 