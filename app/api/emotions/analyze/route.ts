import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import {
  analyzeEmotions,
  EmotionAnalysisRequest,
  validateEmotionAnalysis,
} from '@/lib/services/openai';
import { createEmotionCache } from '@/lib/services/emotion-cache';
import { rateLimit } from '@/lib/utils/rate-limit';

// Initialize cache
const emotionCache = createEmotionCache();

// Rate limiting configuration
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 unique users per minute
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip ?? 'anonymous';
    const { success, limit, reset, remaining } = await limiter.check(10, identifier); // 10 requests per minute per user

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    // Authentication
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { text, language = 'he', culturalContext, storyId } = body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum length is 5000 characters.' },
        { status: 400 }
      );
    }

    if (language && !['he', 'en', 'ar'].includes(language)) {
      return NextResponse.json(
        { error: 'Unsupported language. Supported languages: he, en, ar' },
        { status: 400 }
      );
    }

    // Create analysis request
    const analysisRequest: EmotionAnalysisRequest = {
      text: text.trim(),
      language,
      culturalContext,
    };

    // Check cache first
    let result = await emotionCache.get(analysisRequest);
    let fromCache = true;

    if (!result) {
      // Perform analysis using OpenAI
      fromCache = false;
      result = await analyzeEmotions(analysisRequest);

      // Cache the result
      await emotionCache.set(analysisRequest, result);
    }

    // Validate the result
    if (!validateEmotionAnalysis(result)) {
      console.error('Invalid emotion analysis result:', result);
      return NextResponse.json(
        { error: 'Invalid analysis result. Please try again.' },
        { status: 500 }
      );
    }

    // If storyId is provided, update the story with emotion tags
    if (storyId) {
      try {
        const emotionTags = [
          result.primaryEmotion.category,
          ...result.secondaryEmotions.map(e => e.category),
        ];

        const { error: updateError } = await supabase
          .from('stories')
          .update({
            emotion_tags: emotionTags,
            updated_at: new Date().toISOString(),
          })
          .eq('id', storyId)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating story with emotion tags:', updateError);
          // Don't fail the request, just log the error
        }
      } catch (error) {
        console.error('Error updating story:', error);
        // Don't fail the request, just log the error
      }
    }

    // Log analytics (optional)
    try {
      await supabase.from('emotion_analysis_logs').insert({
        user_id: user.id,
        story_id: storyId || null,
        text_length: text.length,
        language,
        primary_emotion: result.primaryEmotion.category,
        confidence: result.confidence,
        from_cache: fromCache,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      // Analytics logging is optional, don't fail the request
      console.error('Error logging analytics:', error);
    }

    return NextResponse.json(
      {
        analysis: result,
        metadata: {
          fromCache,
          textLength: text.length,
          language,
          processingTime: fromCache ? '<1ms' : 'variable',
        },
      },
      {
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Emotion analysis API error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service configuration error. Please try again later.' },
          { status: 503 }
        );
      }

      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'AI service temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }

      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Analysis timed out. Please try again with shorter text.' },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get cache statistics
    const cacheStats = await emotionCache.getStats();

    // Get user's recent analyses
    const { data: recentAnalyses, error: queryError } = await supabase
      .from('emotion_analysis_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (queryError) {
      console.error('Error fetching recent analyses:', queryError);
    }

    return NextResponse.json({
      cacheStats,
      recentAnalyses: recentAnalyses || [],
      supportedLanguages: ['he', 'en', 'ar'],
      maxTextLength: 5000,
    });
  } catch (error) {
    console.error('Emotion analysis info API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
