'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import RichTextEditor from './RichTextEditor';
import TextStoryInput from './TextStoryInput';
import VoiceToTextStoryInput from './VoiceToTextStoryInput';
import {
  CheckCircle,
  AlertCircle,
  Upload,
  Save,
  Eye,
  Edit,
  FileText,
  Mic,
  Type,
  Clock,
  User,
  Heart,
  Sparkles,
  DollarSign,
  Calendar,
  Globe,
  PenTool,
  BookOpen,
} from 'lucide-react';

export interface StoryMetadata {
  title: string;
  content: string;
  language: string;
  direction: 'ltr' | 'rtl';
  wordCount: number;
  characterCount: number;
  readingTime: number;
  emotionTags: string[];
  styleTags: string[];
  budgetRange: string;
  timeline: string;
  culturalSignificance: string;
  specialNotes: string;
  audioUrl?: string;
  audioDuration?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completionScore: number;
}

export interface StorySubmissionFormProps {
  initialData?: Partial<StoryMetadata>;
  onSubmit?: (data: StoryMetadata) => Promise<void>;
  onSaveDraft?: (data: Partial<StoryMetadata>) => Promise<void>;
  allowVoiceInput?: boolean;
  allowTextInput?: boolean;
  allowRichEditor?: boolean;
  maxCharacters?: number;
  minCharacters?: number;
  required?: {
    title?: boolean;
    content?: boolean;
    emotionTags?: boolean;
    styleTags?: boolean;
    budgetRange?: boolean;
    timeline?: boolean;
  };
}

export const StorySubmissionForm: React.FC<StorySubmissionFormProps> = ({
  initialData = {},
  onSubmit,
  onSaveDraft,
  allowVoiceInput = true,
  allowTextInput = true,
  allowRichEditor = true,
  maxCharacters = 2000,
  minCharacters = 50,
  required = {
    title: true,
    content: true,
    emotionTags: false,
    styleTags: false,
    budgetRange: false,
    timeline: false,
  },
}) => {
  const { t } = useTranslation(['story', 'common']);

  // Form state
  const [formData, setFormData] = useState<Partial<StoryMetadata>>({
    title: '',
    content: '',
    language: 'auto',
    direction: 'ltr',
    wordCount: 0,
    characterCount: 0,
    readingTime: 0,
    emotionTags: [],
    styleTags: [],
    budgetRange: '',
    timeline: '',
    culturalSignificance: '',
    specialNotes: '',
    ...initialData,
  });

  // UI state
  const [currentStep, setCurrentStep] = useState<'input' | 'details' | 'preview' | 'submit'>(
    'input'
  );
  const [inputMode, setInputMode] = useState<'text' | 'rich' | 'voice'>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    errors: [],
    warnings: [],
    completionScore: 0,
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auto-save draft functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (formData.content && formData.content.length > 10 && onSaveDraft) {
        handleSaveDraft();
      }
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSave);
  }, [formData]);

  // Validation logic
  const validateForm = useCallback((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (required.title && !formData.title?.trim()) {
      errors.push(t('storySubmission.validation.titleRequired'));
    }

    if (required.content && !formData.content?.trim()) {
      errors.push(t('storySubmission.validation.contentRequired'));
    }

    // Content length validation
    const contentLength = formData.content?.length || 0;
    if (contentLength > 0 && contentLength < minCharacters) {
      errors.push(t('storySubmission.validation.contentTooShort', { min: minCharacters }));
    }

    if (contentLength > maxCharacters) {
      errors.push(t('storySubmission.validation.contentTooLong', { max: maxCharacters }));
    }

    // Title length validation
    const titleLength = formData.title?.length || 0;
    if (titleLength > 100) {
      errors.push(t('storySubmission.validation.titleTooLong'));
    }

    // Optional field warnings
    if (!formData.emotionTags?.length && required.emotionTags) {
      warnings.push(t('storySubmission.validation.emotionTagsRecommended'));
    }

    if (!formData.budgetRange && required.budgetRange) {
      warnings.push(t('storySubmission.validation.budgetRangeRecommended'));
    }

    // Calculate completion score
    let completionScore = 0;
    const maxScore = 100;

    if (formData.title?.trim()) completionScore += 20;
    if (formData.content?.trim()) completionScore += 30;
    if (formData.emotionTags?.length) completionScore += 15;
    if (formData.styleTags?.length) completionScore += 10;
    if (formData.budgetRange) completionScore += 10;
    if (formData.timeline) completionScore += 10;
    if (formData.culturalSignificance?.trim()) completionScore += 5;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completionScore: Math.min(completionScore, maxScore),
    };
  }, [formData, required, minCharacters, maxCharacters, t]);

  // Update validation when form data changes
  useEffect(() => {
    setValidation(validateForm());
  }, [formData, validateForm]);

  // Handle input from different components
  const handleStoryInput = useCallback(
    (data: {
      content: string;
      metadata?: {
        language?: string;
        direction?: 'ltr' | 'rtl';
        wordCount?: number;
        characterCount?: number;
        readingTime?: number;
        audioUrl?: string;
        audioDuration?: number;
      };
    }) => {
      setFormData(prev => ({
        ...prev,
        content: data.content,
        language: data.metadata?.language || prev.language,
        direction: data.metadata?.direction || prev.direction,
        wordCount: data.metadata?.wordCount || prev.wordCount,
        characterCount: data.metadata?.characterCount || prev.characterCount,
        readingTime: data.metadata?.readingTime || prev.readingTime,
        audioUrl: data.metadata?.audioUrl || prev.audioUrl,
        audioDuration: data.metadata?.audioDuration || prev.audioDuration,
      }));
    },
    []
  );

  // Save draft
  const handleSaveDraft = useCallback(async () => {
    if (!onSaveDraft) return;

    setIsDraftSaving(true);
    try {
      await onSaveDraft(formData);
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsDraftSaving(false);
    }
  }, [formData, onSaveDraft]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    if (!validation.isValid || !onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData as StoryMetadata);
      setSubmitSuccess(true);
      setCurrentStep('submit');
    } catch (error) {
      console.error('Failed to submit story:', error);
      // Handle error state
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validation.isValid, onSubmit]);

  // Render different input modes
  const renderInputContent = () => {
    switch (inputMode) {
      case 'voice':
        return allowVoiceInput ? (
          <VoiceToTextStoryInput
            onStoryComplete={handleStoryInput}
            maxCharacters={maxCharacters}
            minCharacters={minCharacters}
          />
        ) : null;

      case 'rich':
        return allowRichEditor ? (
          <RichTextEditor
            initialContent={formData.content || ''}
            onChange={(content, metadata) => handleStoryInput({ content, metadata })}
            maxCharacters={maxCharacters}
            placeholder={t('storySubmission.placeholders.richEditor')}
          />
        ) : null;

      case 'text':
      default:
        return allowTextInput ? (
          <TextStoryInput
            initialValue={formData.content || ''}
            onChange={(content, metadata) => handleStoryInput({ content, metadata })}
            maxCharacters={maxCharacters}
            minCharacters={minCharacters}
            placeholder={t('storySubmission.placeholders.textInput')}
          />
        ) : null;
    }
  };

  // Render validation status
  const renderValidationStatus = () => (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {validation.isValid ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          {t('storySubmission.validation.title')}
        </h3>
        <Badge variant={validation.completionScore >= 80 ? 'default' : 'secondary'}>
          {validation.completionScore}% {t('storySubmission.validation.complete')}
        </Badge>
      </div>

      <Progress value={validation.completionScore} className="mb-3" />

      {validation.errors.length > 0 && (
        <Alert className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.warnings.length > 0 && (
        <Alert className="mb-3" variant="destructive">
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );

  // Render step navigation
  const steps = [
    { id: 'input', label: t('storySubmission.steps.input'), icon: Type },
    { id: 'details', label: t('storySubmission.steps.details'), icon: FileText },
    { id: 'preview', label: t('storySubmission.steps.preview'), icon: Eye },
    { id: 'submit', label: t('storySubmission.steps.submit'), icon: Upload },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  if (submitSuccess) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold">{t('storySubmission.success.title')}</h2>
          <p className="text-muted-foreground">{t('storySubmission.success.message')}</p>
          <div className="flex gap-4 mt-6">
            <Button onClick={() => (window.location.href = '/dashboard')}>
              {t('storySubmission.success.goToDashboard')}
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              {t('storySubmission.success.createAnother')}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress indicator */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{t('storySubmission.title')}</h2>
          <div className="flex items-center gap-2">
            {isDraftSaving && <Save className="h-4 w-4 animate-spin" />}
            <span className="text-sm text-muted-foreground">
              {t('storySubmission.step')} {currentStepIndex + 1} {t('common.of')} {steps.length}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    index <= currentStepIndex
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
                <span
                  className={`ml-2 text-sm ${
                    index <= currentStepIndex ? 'font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${
                      index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Validation status */}
      {renderValidationStatus()}

      {/* Main content */}
      <Tabs value={currentStep} onValueChange={value => setCurrentStep(value as any)}>
        {/* Input step */}
        <TabsContent value="input" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('storySubmission.input.title')}</h3>
              <div className="flex gap-2">
                {allowTextInput && (
                  <Button
                    variant={inputMode === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInputMode('text')}
                  >
                    <Type className="h-4 w-4 mr-1" />
                    {t('storySubmission.inputModes.text')}
                  </Button>
                )}
                {allowRichEditor && (
                  <Button
                    variant={inputMode === 'rich' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInputMode('rich')}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t('storySubmission.inputModes.rich')}
                  </Button>
                )}
                {allowVoiceInput && (
                  <Button
                    variant={inputMode === 'voice' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInputMode('voice')}
                  >
                    <Mic className="h-4 w-4 mr-1" />
                    {t('storySubmission.inputModes.voice')}
                  </Button>
                )}
              </div>
            </div>

            {renderInputContent()}
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isDraftSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isDraftSaving ? t('common.saving') : t('common.saveDraft')}
            </Button>
            <Button onClick={() => setCurrentStep('details')} disabled={!formData.content?.trim()}>
              {t('common.next')}
            </Button>
          </div>
        </TabsContent>

        {/* Details step would go here */}
        <TabsContent value="details">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" />
              <h3 className="text-lg font-semibold">
                {t('storySubmission.metadata.titleSection')}
              </h3>
            </div>

            <div className="space-y-6">
              {/* Story Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('storySubmission.metadata.titleLabel')}
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('storySubmission.metadata.titlePlaceholder')}
                  className="w-full p-3 border rounded-lg"
                  maxLength={100}
                />
                <p className="text-sm text-muted-foreground">
                  {t('storySubmission.metadata.titleHelper')} ({formData.title?.length || 0}/100)
                </p>
              </div>

              {/* Emotion Tags */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  {t('storySubmission.metadata.emotionSection')}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t('storySubmission.metadata.emotionHelper')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Love',
                    'Joy',
                    'Hope',
                    'Peace',
                    'Strength',
                    'Courage',
                    'Elegance',
                    'Passion',
                    'Tenderness',
                    'Gratitude',
                    'Wisdom',
                    'Faith',
                    'Freedom',
                    'Adventure',
                    'Romance',
                    'Family',
                    'Friendship',
                    'Achievement',
                    'Memory',
                  ].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const currentTags = formData.emotionTags || [];
                        const newTags = currentTags.includes(tag)
                          ? currentTags.filter(t => t !== tag)
                          : [...currentTags, tag];
                        setFormData(prev => ({ ...prev, emotionTags: newTags }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        (formData.emotionTags || []).includes(tag)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:border-primary'
                      }`}
                    >
                      {t(`storySubmission.emotions.${tag.toLowerCase()}`, tag)}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('storySubmission.metadata.selectedCount', {
                    count: formData.emotionTags?.length || 0,
                    type: t('storySubmission.metadata.emotions'),
                  })}
                </p>
              </div>

              {/* Style Tags */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t('storySubmission.metadata.styleSection')}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t('storySubmission.metadata.styleHelper')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Modern',
                    'Classic',
                    'Vintage',
                    'Minimalist',
                    'Bold',
                    'Delicate',
                    'Traditional',
                    'Contemporary',
                    'Artistic',
                    'Geometric',
                    'Organic',
                    'Luxurious',
                    'Rustic',
                    'Bohemian',
                    'Gothic',
                    'Art Deco',
                    'Ethnic',
                  ].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const currentTags = formData.styleTags || [];
                        const newTags = currentTags.includes(tag)
                          ? currentTags.filter(t => t !== tag)
                          : [...currentTags, tag];
                        setFormData(prev => ({ ...prev, styleTags: newTags }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        (formData.styleTags || []).includes(tag)
                          ? 'bg-secondary text-secondary-foreground border-secondary'
                          : 'bg-background border-border hover:border-secondary'
                      }`}
                    >
                      {t(`storySubmission.styles.${tag.toLowerCase()}`, tag)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget and Timeline */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {t('storySubmission.metadata.budgetLabel')}
                  </label>
                  <select
                    value={formData.budgetRange || ''}
                    onChange={e => setFormData(prev => ({ ...prev, budgetRange: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">{t('storySubmission.metadata.budgetPlaceholder')}</option>
                    <option value="$500-$1,000">$500-$1,000</option>
                    <option value="$1,000-$2,500">$1,000-$2,500</option>
                    <option value="$2,500-$5,000">$2,500-$5,000</option>
                    <option value="$5,000-$10,000">$5,000-$10,000</option>
                    <option value="$10,000-$25,000">$10,000-$25,000</option>
                    <option value="$25,000+">$25,000+</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t('storySubmission.metadata.timelineLabel')}
                  </label>
                  <select
                    value={formData.timeline || ''}
                    onChange={e => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">{t('storySubmission.metadata.timelinePlaceholder')}</option>
                    <option value="1-2 weeks">{t('storySubmission.timelines.12weeks')}</option>
                    <option value="3-4 weeks">{t('storySubmission.timelines.34weeks')}</option>
                    <option value="1-2 months">{t('storySubmission.timelines.12months')}</option>
                    <option value="3-6 months">{t('storySubmission.timelines.36months')}</option>
                    <option value="6+ months">{t('storySubmission.timelines.6months')}</option>
                    <option value="No rush">{t('storySubmission.timelines.norush')}</option>
                  </select>
                </div>
              </div>

              {/* Cultural Significance */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t('storySubmission.metadata.culturalLabel')}
                </label>
                <textarea
                  value={formData.culturalSignificance || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, culturalSignificance: e.target.value }))
                  }
                  placeholder={t('storySubmission.metadata.culturalPlaceholder')}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-sm text-muted-foreground">
                  {t('storySubmission.metadata.culturalHelper')} (
                  {formData.culturalSignificance?.length || 0}/500)
                </p>
              </div>

              {/* Special Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  {t('storySubmission.metadata.notesLabel')}
                </label>
                <textarea
                  value={formData.specialNotes || ''}
                  onChange={e => setFormData(prev => ({ ...prev, specialNotes: e.target.value }))}
                  placeholder={t('storySubmission.metadata.notesPlaceholder')}
                  className="w-full p-3 border rounded-lg"
                  rows={4}
                  maxLength={800}
                />
                <p className="text-sm text-muted-foreground">
                  {t('storySubmission.metadata.notesHelper')} ({formData.specialNotes?.length || 0}
                  /800)
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep('input')}>
                {t('common.previous')}
              </Button>
              <Button onClick={() => setCurrentStep('preview')} disabled={!validation.isValid}>
                {t('common.next')}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Preview step would go here */}
        <TabsContent value="preview">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <h3 className="text-lg font-semibold">{t('storySubmission.steps.preview')}</h3>
              </div>
              <div className="text-sm text-muted-foreground">
                {t('storyPreview.privateInfo')} - {t('storyPreview.jewelryOpportunityDesc')}
              </div>
            </div>

            {formData.content && formData.title ? (
              <div className="space-y-6">
                {/* Story Header */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h1
                        className="text-2xl font-bold mb-2"
                        style={{
                          direction: formData.direction,
                          textAlign: formData.direction === 'rtl' ? 'right' : 'left',
                        }}
                      >
                        {formData.title}
                      </h1>

                      {/* Tags */}
                      {formData.emotionTags && formData.emotionTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {formData.emotionTags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                            >
                              <Heart className="h-3 w-3 inline mr-1" />
                              {t(`storySubmission.emotions.${tag.toLowerCase()}`, tag)}
                            </span>
                          ))}
                        </div>
                      )}

                      {formData.styleTags && formData.styleTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.styleTags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-xs"
                            >
                              <Sparkles className="h-3 w-3 inline mr-1" />
                              {t(`storySubmission.styles.${tag.toLowerCase()}`, tag)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Story Content */}
                <div className="border rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {t('storyPreview.storyContent')}
                  </h2>
                  <div
                    className="prose max-w-none leading-relaxed"
                    style={{
                      direction: formData.direction,
                      textAlign: formData.direction === 'rtl' ? 'right' : 'left',
                    }}
                  >
                    {formData.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  <div className="border-t pt-4 mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {formData.wordCount || 0} {t('common.words')}
                    </span>
                    <span>
                      {formData.characterCount || 0} {t('common.characters')}
                    </span>
                    <span>
                      {formData.readingTime || 0} {t('common.minutesRead')}
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid md:grid-cols-2 gap-6">
                  {formData.budgetRange && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4" />
                        {t('storyPreview.budgetRange')}
                      </h3>
                      <p className="text-muted-foreground">{formData.budgetRange}</p>
                    </div>
                  )}

                  {formData.timeline && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4" />
                        {t('storyPreview.timeline')}
                      </h3>
                      <p className="text-muted-foreground">{formData.timeline}</p>
                    </div>
                  )}
                </div>

                {formData.culturalSignificance && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4" />
                      {t('storyPreview.culturalSignificance')}
                    </h3>
                    <p
                      className="text-muted-foreground"
                      style={{
                        direction: formData.direction,
                        textAlign: formData.direction === 'rtl' ? 'right' : 'left',
                      }}
                    >
                      {formData.culturalSignificance}
                    </p>
                  </div>
                )}

                {formData.specialNotes && (
                  <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                    <h3 className="font-medium flex items-center gap-2 mb-2 text-orange-800">
                      <PenTool className="h-4 w-4" />
                      {t('storyPreview.specialNotes')}
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                        {t('storyPreview.privateInfo')}
                      </span>
                    </h3>
                    <p
                      className="text-orange-700"
                      style={{
                        direction: formData.direction,
                        textAlign: formData.direction === 'rtl' ? 'right' : 'left',
                      }}
                    >
                      {formData.specialNotes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4" />
                <p>{t('textStoryInput.previewEmpty')}</p>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep('details')}>
                {t('common.previous')}
              </Button>
              <Button onClick={() => setCurrentStep('submit')} disabled={!validation.isValid}>
                {t('common.submit')}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Submit step would go here */}
        <TabsContent value="submit">
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
              <Upload className="h-16 w-16 text-primary" />
              <h2 className="text-2xl font-bold">{t('storySubmission.steps.submit')}</h2>
              <p className="text-muted-foreground">
                {validation.isValid
                  ? 'Your story is ready to be submitted to our jeweler network.'
                  : 'Please complete all required fields before submitting.'}
              </p>

              {validation.isValid && (
                <div className="w-full space-y-4">
                  <div className="text-left space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('common.words')}:</span>
                      <span>{formData.wordCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t('storySubmission.metadata.emotions')}:</span>
                      <span>{formData.emotionTags?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t('storySubmission.metadata.styles')}:</span>
                      <span>{formData.styleTags?.length || 0}</span>
                    </div>
                    {formData.budgetRange && (
                      <div className="flex justify-between text-sm">
                        <span>{t('storyPreview.budgetRange')}:</span>
                        <span>{formData.budgetRange}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        {t('common.loading')}...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {t('common.submit')} {t('title')}
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep('preview')}>
                  {t('common.previous')}
                </Button>
                <Button variant="outline" onClick={handleSaveDraft} disabled={isDraftSaving}>
                  {isDraftSaving ? t('common.saving') : t('common.saveDraft')}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StorySubmissionForm;
