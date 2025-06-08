'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Languages, Type, Save, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TextStoryInputProps {
  value?: string;
  onChange?: (content: string, metadata: StoryMetadata) => void;
  onSubmit?: (content: string, metadata: StoryMetadata) => void;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export interface StoryMetadata {
  wordCount: number;
  characterCount: number;
  detectedLanguage: string;
  textDirection: 'ltr' | 'rtl';
  hasMixedContent: boolean;
  estimatedReadingTime: number; // in seconds
}

// Language configuration with RTL support
const LANGUAGES = {
  he: { name: 'עברית', direction: 'rtl' as const, pattern: /[\u0590-\u05FF]/g },
  ar: { name: 'العربية', direction: 'rtl' as const, pattern: /[\u0600-\u06FF]/g },
  en: { name: 'English', direction: 'ltr' as const, pattern: /[a-zA-Z]/g },
  fr: { name: 'Français', direction: 'ltr' as const, pattern: /[a-zA-ZÀ-ÿ]/g },
  es: { name: 'Español', direction: 'ltr' as const, pattern: /[a-zA-ZÑñ]/g },
} as const;

export default function TextStoryInput({
  value = '',
  onChange,
  onSubmit,
  placeholder,
  maxLength = 3000,
  minLength = 50,
  className,
  autoFocus = false,
  disabled = false,
  required = false,
}: TextStoryInputProps) {
  const { t } = useTranslation('story');

  // State
  const [content, setContent] = useState(value);
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof LANGUAGES>('he');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [metadata, setMetadata] = useState<StoryMetadata>({
    wordCount: 0,
    characterCount: 0,
    detectedLanguage: 'he',
    textDirection: 'rtl',
    hasMixedContent: false,
    estimatedReadingTime: 0,
  });

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Language detection with scoring
  const detectLanguage = useCallback((text: string): keyof typeof LANGUAGES => {
    if (!text.trim()) return 'he';

    const scores: Record<keyof typeof LANGUAGES, number> = {
      he: 0,
      ar: 0,
      en: 0,
      fr: 0,
      es: 0,
    };

    // Count matches for each language
    Object.entries(LANGUAGES).forEach(([lang, config]) => {
      const matches = text.match(config.pattern);
      scores[lang as keyof typeof LANGUAGES] = matches ? matches.length : 0;
    });

    // Find language with highest score
    const detectedLang = Object.entries(scores).reduce((a, b) =>
      scores[a[0] as keyof typeof LANGUAGES] > scores[b[0] as keyof typeof LANGUAGES] ? a : b
    )[0] as keyof typeof LANGUAGES;

    return detectedLang;
  }, []);

  // Check for mixed RTL/LTR content
  const hasMixedContent = useCallback((text: string): boolean => {
    const hasRTL = /[\u0590-\u05FF\u0600-\u06FF]/.test(text);
    const hasLTR = /[a-zA-Z]/.test(text);
    return hasRTL && hasLTR;
  }, []);

  // Calculate reading time (average 200 words per minute)
  const calculateReadingTime = useCallback((wordCount: number): number => {
    return Math.ceil((wordCount / 200) * 60); // seconds
  }, []);

  // Update metadata based on content
  const updateMetadata = useCallback(
    (text: string) => {
      const words = text
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);
      const detectedLang = detectLanguage(text);
      const direction = LANGUAGES[detectedLang].direction;
      const mixed = hasMixedContent(text);
      const readingTime = calculateReadingTime(words.length);

      const newMetadata: StoryMetadata = {
        wordCount: words.length,
        characterCount: text.length,
        detectedLanguage: detectedLang,
        textDirection: direction,
        hasMixedContent: mixed,
        estimatedReadingTime: readingTime,
      };

      setMetadata(newMetadata);
      onChange?.(text, newMetadata);
    },
    [detectLanguage, hasMixedContent, calculateReadingTime, onChange]
  );

  // Handle content change
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      if (newContent.length <= maxLength) {
        setContent(newContent);
        updateMetadata(newContent);
      }
    },
    [maxLength, updateMetadata]
  );

  // Handle language change
  const handleLanguageChange = useCallback((lang: keyof typeof LANGUAGES) => {
    setSelectedLanguage(lang);
    const direction = LANGUAGES[lang].direction;

    if (textareaRef.current) {
      textareaRef.current.style.direction = direction;
      textareaRef.current.style.textAlign = direction === 'rtl' ? 'right' : 'left';
    }
  }, []);

  // Clear content
  const clearContent = useCallback(() => {
    setContent('');
    updateMetadata('');
    textareaRef.current?.focus();
  }, [updateMetadata]);

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    try {
      const draft = {
        content,
        language: selectedLanguage,
        timestamp: Date.now(),
      };
      localStorage.setItem('textStoryInput_draft', JSON.stringify(draft));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [content, selectedLanguage]);

  // Load draft from localStorage
  const loadDraft = useCallback(() => {
    try {
      const draftData = localStorage.getItem('textStoryInput_draft');
      if (draftData) {
        const draft = JSON.parse(draftData);
        setContent(draft.content);
        setSelectedLanguage(draft.language);
        updateMetadata(draft.content);

        // Update textarea direction
        if (textareaRef.current) {
          const direction = LANGUAGES[draft.language].direction;
          textareaRef.current.style.direction = direction;
          textareaRef.current.style.textAlign = direction === 'rtl' ? 'right' : 'left';
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, [updateMetadata]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (content.length >= minLength && !disabled) {
      onSubmit?.(content, metadata);
    }
  }, [content, minLength, disabled, onSubmit, metadata]);

  // Auto-detect language and update textarea direction
  useEffect(() => {
    if (content) {
      const detectedLang = detectLanguage(content);
      if (detectedLang !== selectedLanguage) {
        setSelectedLanguage(detectedLang);
      }

      const direction = LANGUAGES[detectedLang].direction;
      if (textareaRef.current) {
        textareaRef.current.style.direction = direction;
        textareaRef.current.style.textAlign = direction === 'rtl' ? 'right' : 'left';
      }
    }
  }, [content, detectLanguage, selectedLanguage]);

  // Initialize with value prop
  useEffect(() => {
    if (value !== content) {
      setContent(value);
      updateMetadata(value);
    }
  }, [value, content, updateMetadata]);

  // Auto-save draft periodically
  useEffect(() => {
    if (content) {
      const timer = setTimeout(saveDraft, 2000); // Auto-save after 2 seconds of inactivity
      return () => clearTimeout(timer);
    }
  }, [content, saveDraft]);

  // Get validation status
  const isValid = content.length >= minLength && content.length <= maxLength;
  const isNearMax = content.length > maxLength * 0.9;
  const currentDirection = metadata.textDirection;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            {t('textStoryInput.title', 'Write Your Story')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGES).map(([lang, config]) => (
                    <SelectItem key={lang} value={lang}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge variant={currentDirection === 'rtl' ? 'default' : 'secondary'}>
              {currentDirection.toUpperCase()}
            </Badge>
            {metadata.hasMixedContent && (
              <Badge variant="outline">{t('textStoryInput.mixedContent', 'Mixed')}</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor="story-text" className="text-sm font-medium">
            {t('textStoryInput.label', 'Your Story')}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>

          <div className="relative">
            {!isPreviewMode ? (
              <Textarea
                id="story-text"
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                placeholder={
                  placeholder ||
                  t('textStoryInput.placeholder', 'Share the story behind your jewelry piece...')
                }
                className={cn(
                  'min-h-[200px] resize-none transition-all',
                  currentDirection === 'rtl' && 'text-right',
                  isNearMax && 'border-amber-300 focus:border-amber-400',
                  !isValid && content.length > 0 && 'border-destructive'
                )}
                style={{
                  direction: currentDirection,
                  textAlign: currentDirection === 'rtl' ? 'right' : 'left',
                }}
                autoFocus={autoFocus}
                disabled={disabled}
                maxLength={maxLength}
              />
            ) : (
              <div
                className={cn(
                  'min-h-[200px] p-3 border rounded-md bg-muted/50',
                  'whitespace-pre-wrap break-words',
                  currentDirection === 'rtl' && 'text-right'
                )}
                style={{
                  direction: currentDirection,
                  textAlign: currentDirection === 'rtl' ? 'right' : 'left',
                }}
              >
                {content || (
                  <span className="text-muted-foreground">
                    {t('textStoryInput.previewEmpty', 'Preview will appear here...')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats and Controls */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>
              {t('textStoryInput.words', 'Words')}: {metadata.wordCount}
            </span>
            <span className={cn(isNearMax && 'text-amber-600')}>
              {t('textStoryInput.characters', 'Characters')}: {metadata.characterCount}/{maxLength}
            </span>
            {metadata.estimatedReadingTime > 0 && (
              <span>
                {t('textStoryInput.readingTime', 'Reading time')}:{' '}
                {Math.floor(metadata.estimatedReadingTime / 60)}:
                {(metadata.estimatedReadingTime % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {t('textStoryInput.detectedLanguage', 'Language')}:{' '}
              {LANGUAGES[metadata.detectedLanguage as keyof typeof LANGUAGES]?.name}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPreviewMode(!isPreviewMode)}>
              {isPreviewMode ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {isPreviewMode
                ? t('textStoryInput.edit', 'Edit')
                : t('textStoryInput.preview', 'Preview')}
            </Button>
            <Button variant="outline" size="sm" onClick={saveDraft} disabled={!content}>
              <Save className="h-4 w-4 mr-2" />
              {t('textStoryInput.saveDraft', 'Save Draft')}
            </Button>
            <Button variant="outline" size="sm" onClick={loadDraft}>
              {t('textStoryInput.loadDraft', 'Load Draft')}
            </Button>
            <Button variant="outline" size="sm" onClick={clearContent} disabled={!content}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('textStoryInput.clear', 'Clear')}
            </Button>
          </div>

          {onSubmit && (
            <Button
              onClick={handleSubmit}
              disabled={!isValid || disabled}
              className="min-w-[120px]"
            >
              {t('textStoryInput.submit', 'Submit Story')}
            </Button>
          )}
        </div>

        {/* Validation Messages */}
        {content.length > 0 && !isValid && (
          <div className="text-sm text-destructive">
            {content.length < minLength
              ? t('textStoryInput.tooShort', `Story must be at least ${minLength} characters long`)
              : t('textStoryInput.tooLong', `Story cannot exceed ${maxLength} characters`)}
          </div>
        )}

        {isValid && content.length > 0 && (
          <div className="text-sm text-green-600">
            {t('textStoryInput.valid', 'Story is ready to submit')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
