'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Languages,
  Eye,
  Save,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RichTextEditorProps {
  value?: string;
  onChange?: (content: string, metadata: TextMetadata) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: number;
  className?: string;
  showWordCount?: boolean;
  showLanguageSelector?: boolean;
  autoDetectLanguage?: boolean;
  supportedLanguages?: string[];
  onLanguageDetected?: (language: string, direction: 'ltr' | 'rtl') => void;
}

export interface TextMetadata {
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  detectedLanguage: string;
  textDirection: 'ltr' | 'rtl';
  hasMixedContent: boolean;
  formattingUsed: string[];
}

interface TextFormat {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'left' | 'center' | 'right';
}

// Language configuration
const LANGUAGE_CONFIG = {
  he: { name: 'עברית', direction: 'rtl' as const, pattern: /[\u0590-\u05FF]/ },
  ar: { name: 'العربية', direction: 'rtl' as const, pattern: /[\u0600-\u06FF]/ },
  en: { name: 'English', direction: 'ltr' as const, pattern: /[a-zA-Z]/ },
  fr: { name: 'Français', direction: 'ltr' as const, pattern: /[a-zA-ZÀ-ÿ]/ },
  es: { name: 'Español', direction: 'ltr' as const, pattern: /[a-zA-ZÑñ]/ },
};

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder,
  maxLength = 5000,
  minHeight = 200,
  className,
  showWordCount = true,
  showLanguageSelector = true,
  autoDetectLanguage = true,
  supportedLanguages = ['he', 'ar', 'en', 'fr', 'es'],
  onLanguageDetected,
}: RichTextEditorProps) {
  const { t } = useTranslation('story');

  // State
  const [content, setContent] = useState(value);
  const [selectedLanguage, setSelectedLanguage] = useState('he');
  const [textDirection, setTextDirection] = useState<'ltr' | 'rtl'>('rtl');
  const [format, setFormat] = useState<TextFormat>({
    bold: false,
    italic: false,
    underline: false,
    alignment: 'right', // Default to right for RTL
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [metadata, setMetadata] = useState<TextMetadata>({
    wordCount: 0,
    characterCount: 0,
    characterCountNoSpaces: 0,
    detectedLanguage: 'he',
    textDirection: 'rtl',
    hasMixedContent: false,
    formattingUsed: [],
  });

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);

  // Language detection
  const detectLanguage = useCallback((text: string) => {
    if (!text.trim()) return 'he';

    const languageScores: Record<string, number> = {};

    Object.entries(LANGUAGE_CONFIG).forEach(([lang, config]) => {
      const matches = text.match(config.pattern);
      languageScores[lang] = matches ? matches.length : 0;
    });

    const detectedLang = Object.entries(languageScores).reduce((a, b) =>
      languageScores[a[0]] > languageScores[b[0]] ? a : b
    )[0];

    return detectedLang || 'he';
  }, []);

  // Check for mixed content (RTL + LTR)
  const checkMixedContent = useCallback((text: string) => {
    const hasRTL = /[\u0590-\u05FF\u0600-\u06FF]/.test(text);
    const hasLTR = /[a-zA-Z]/.test(text);
    return hasRTL && hasLTR;
  }, []);

  // Update metadata
  const updateMetadata = useCallback(
    (text: string) => {
      const words = text
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);
      const detectedLang = autoDetectLanguage ? detectLanguage(text) : selectedLanguage;
      const direction =
        LANGUAGE_CONFIG[detectedLang as keyof typeof LANGUAGE_CONFIG]?.direction || 'ltr';
      const hasMixed = checkMixedContent(text);

      const newMetadata: TextMetadata = {
        wordCount: words.length,
        characterCount: text.length,
        characterCountNoSpaces: text.replace(/\s/g, '').length,
        detectedLanguage: detectedLang,
        textDirection: direction,
        hasMixedContent: hasMixed,
        formattingUsed: Object.entries(format)
          .filter(([_, value]) => value === true)
          .map(([key]) => key),
      };

      setMetadata(newMetadata);

      // Auto-update direction if language changed
      if (autoDetectLanguage && direction !== textDirection) {
        setTextDirection(direction);
        setSelectedLanguage(detectedLang);
        onLanguageDetected?.(detectedLang, direction);
      }

      onChange?.(text, newMetadata);
    },
    [
      format,
      detectLanguage,
      checkMixedContent,
      autoDetectLanguage,
      selectedLanguage,
      textDirection,
      onChange,
      onLanguageDetected,
    ]
  );

  // Handle content change
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;

    const text = editorRef.current.innerText || '';
    setContent(text);
    updateMetadata(text);
  }, [updateMetadata]);

  // Handle format commands
  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();

    // Update format state
    setFormat(prev => ({
      ...prev,
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    }));
  }, []);

  // Handle language change
  const handleLanguageChange = useCallback((lang: string) => {
    setSelectedLanguage(lang);
    const direction = LANGUAGE_CONFIG[lang as keyof typeof LANGUAGE_CONFIG]?.direction || 'ltr';
    setTextDirection(direction);

    if (editorRef.current) {
      editorRef.current.style.direction = direction;
      editorRef.current.style.textAlign = direction === 'rtl' ? 'right' : 'left';
    }

    setFormat(prev => ({
      ...prev,
      alignment: direction === 'rtl' ? 'right' : 'left',
    }));
  }, []);

  // Handle alignment
  const handleAlignment = useCallback(
    (alignment: 'left' | 'center' | 'right') => {
      const command = `justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`;
      executeCommand(command);
      setFormat(prev => ({ ...prev, alignment }));
    },
    [executeCommand]
  );

  // Clear formatting
  const clearFormatting = useCallback(() => {
    executeCommand('removeFormat');
    setFormat({
      bold: false,
      italic: false,
      underline: false,
      alignment: textDirection === 'rtl' ? 'right' : 'left',
    });
  }, [executeCommand, textDirection]);

  // Save draft
  const saveDraft = useCallback(() => {
    localStorage.setItem(
      'richTextEditor_draft',
      JSON.stringify({
        content,
        language: selectedLanguage,
        direction: textDirection,
        timestamp: Date.now(),
      })
    );
  }, [content, selectedLanguage, textDirection]);

  // Load draft
  const loadDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem('richTextEditor_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        setContent(parsed.content);
        setSelectedLanguage(parsed.language);
        setTextDirection(parsed.direction);

        if (editorRef.current) {
          editorRef.current.innerText = parsed.content;
          editorRef.current.style.direction = parsed.direction;
          editorRef.current.style.textAlign = parsed.direction === 'rtl' ? 'right' : 'left';
        }

        updateMetadata(parsed.content);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, [updateMetadata]);

  // Initialize
  useEffect(() => {
    if (value !== content) {
      setContent(value);
      if (editorRef.current) {
        editorRef.current.innerText = value;
      }
      updateMetadata(value);
    }
  }, [value, content, updateMetadata]);

  // Setup editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.direction = textDirection;
      editorRef.current.style.textAlign = textDirection === 'rtl' ? 'right' : 'left';
    }
  }, [textDirection]);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            {t('richTextEditor.title', 'Rich Text Editor')}
          </CardTitle>
          <div className="flex items-center gap-2">
            {showLanguageSelector && (
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map(lang => (
                      <SelectItem key={lang} value={lang}>
                        {LANGUAGE_CONFIG[lang as keyof typeof LANGUAGE_CONFIG]?.name || lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Badge variant={textDirection === 'rtl' ? 'default' : 'secondary'}>
              {textDirection.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
          {/* Text formatting */}
          <div className="flex items-center gap-1">
            <Button
              variant={format.bold ? 'default' : 'ghost'}
              size="sm"
              onClick={() => executeCommand('bold')}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={format.italic ? 'default' : 'ghost'}
              size="sm"
              onClick={() => executeCommand('italic')}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={format.underline ? 'default' : 'ghost'}
              size="sm"
              onClick={() => executeCommand('underline')}
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <Button
              variant={format.alignment === 'left' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleAlignment('left')}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={format.alignment === 'center' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleAlignment('center')}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={format.alignment === 'right' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleAlignment('right')}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFormatting}
              title={t('richTextEditor.clearFormatting', 'Clear Formatting')}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              title={t('richTextEditor.preview', 'Preview')}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={saveDraft}
              title={t('richTextEditor.saveDraft', 'Save Draft')}
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable={!isPreviewMode}
            onInput={handleContentChange}
            onKeyUp={handleContentChange}
            className={cn(
              'w-full p-4 border rounded-lg resize-none',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'prose max-w-none',
              textDirection === 'rtl' && 'text-right',
              isPreviewMode && 'bg-muted/50 cursor-default',
              !content && 'text-muted-foreground'
            )}
            style={{
              minHeight: `${minHeight}px`,
              direction: textDirection,
              textAlign: textDirection === 'rtl' ? 'right' : 'left',
            }}
            data-placeholder={
              placeholder || t('richTextEditor.placeholder', 'Start writing your story...')
            }
            suppressContentEditableWarning={true}
          />

          {!content && (
            <div
              className={cn(
                'absolute top-4 p-4 text-muted-foreground pointer-events-none',
                textDirection === 'rtl' ? 'right-0' : 'left-0'
              )}
            >
              {placeholder || t('richTextEditor.placeholder', 'Start writing your story...')}
            </div>
          )}
        </div>

        {/* Metadata and counters */}
        {showWordCount && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>
                {t('richTextEditor.words', 'Words')}: {metadata.wordCount}
              </span>
              <span>
                {t('richTextEditor.characters', 'Characters')}: {metadata.characterCount}/
                {maxLength}
              </span>
              {metadata.hasMixedContent && (
                <Badge variant="outline">{t('richTextEditor.mixedContent', 'Mixed Content')}</Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span>
                {t('richTextEditor.detectedLanguage', 'Language')}:{' '}
                {LANGUAGE_CONFIG[metadata.detectedLanguage as keyof typeof LANGUAGE_CONFIG]?.name ||
                  metadata.detectedLanguage}
              </span>
              {isPreviewMode && (
                <Badge variant="secondary">{t('richTextEditor.previewMode', 'Preview')}</Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={loadDraft}>
            {t('richTextEditor.loadDraft', 'Load Draft')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.innerText = '';
                setContent('');
                updateMetadata('');
              }
            }}
          >
            {t('richTextEditor.clear', 'Clear')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
