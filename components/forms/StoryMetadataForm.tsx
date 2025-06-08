'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Heart, Sparkles, DollarSign, Calendar, Globe, PenTool } from 'lucide-react';

export interface MetadataFormData {
  title: string;
  emotionTags: string[];
  styleTags: string[];
  budgetRange: string;
  timeline: string;
  culturalSignificance: string;
  specialNotes: string;
}

export interface StoryMetadataFormProps {
  initialData?: Partial<MetadataFormData>;
  onChange?: (data: MetadataFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
  required?: {
    title?: boolean;
    emotionTags?: boolean;
    styleTags?: boolean;
    budgetRange?: boolean;
    timeline?: boolean;
  };
}

const EMOTION_TAGS = [
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
];

const STYLE_TAGS = [
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
];

const BUDGET_RANGES = [
  '$500-$1,000',
  '$1,000-$2,500',
  '$2,500-$5,000',
  '$5,000-$10,000',
  '$10,000-$25,000',
  '$25,000+',
];

const TIMELINES = ['1-2 weeks', '3-4 weeks', '1-2 months', '3-6 months', '6+ months', 'No rush'];

export const StoryMetadataForm: React.FC<StoryMetadataFormProps> = ({
  initialData = {},
  onChange,
  onValidationChange,
  required = {},
}) => {
  const { t } = useTranslation(['story', 'common']);

  const [formData, setFormData] = useState<MetadataFormData>({
    title: '',
    emotionTags: [],
    styleTags: [],
    budgetRange: '',
    timeline: '',
    culturalSignificance: '',
    specialNotes: '',
    ...initialData,
  });

  // Validation
  const validateForm = useCallback(() => {
    const isValid =
      (!required.title || formData.title.trim().length > 0) &&
      (!required.emotionTags || formData.emotionTags.length > 0) &&
      (!required.styleTags || formData.styleTags.length > 0) &&
      (!required.budgetRange || formData.budgetRange.length > 0) &&
      (!required.timeline || formData.timeline.length > 0);

    onValidationChange?.(isValid);
    return isValid;
  }, [formData, required, onValidationChange]);

  // Update form data and notify parent
  const updateFormData = useCallback(
    (updates: Partial<MetadataFormData>) => {
      const newData = { ...formData, ...updates };
      setFormData(newData);
      onChange?.(newData);
      validateForm();
    },
    [formData, onChange, validateForm]
  );

  // Handle tag selection
  const toggleTag = useCallback(
    (tag: string, tagType: 'emotion' | 'style') => {
      const field = tagType === 'emotion' ? 'emotionTags' : 'styleTags';
      const currentTags = formData[field];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];

      updateFormData({ [field]: newTags });
    },
    [formData, updateFormData]
  );

  return (
    <div className="space-y-6">
      {/* Story Title */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <PenTool className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{t('storySubmission.metadata.titleSection')}</h3>
          {required.title && <span className="text-red-500">*</span>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">{t('storySubmission.metadata.titleLabel')}</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={e => updateFormData({ title: e.target.value })}
            placeholder={t('storySubmission.metadata.titlePlaceholder')}
            maxLength={100}
            className="text-lg"
          />
          <p className="text-sm text-muted-foreground">
            {t('storySubmission.metadata.titleHelper')} ({formData.title.length}/100)
          </p>
        </div>
      </Card>

      {/* Emotion Tags */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{t('storySubmission.metadata.emotionSection')}</h3>
          {required.emotionTags && <span className="text-red-500">*</span>}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {t('storySubmission.metadata.emotionHelper')}
        </p>
        <div className="flex flex-wrap gap-2">
          {EMOTION_TAGS.map(tag => (
            <Badge
              key={tag}
              variant={formData.emotionTags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => toggleTag(tag, 'emotion')}
            >
              {t(`storySubmission.emotions.${tag.toLowerCase()}`, tag)}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {t('storySubmission.metadata.selectedCount', {
            count: formData.emotionTags.length,
            type: t('storySubmission.metadata.emotions'),
          })}
        </p>
      </Card>

      {/* Style Tags */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{t('storySubmission.metadata.styleSection')}</h3>
          {required.styleTags && <span className="text-red-500">*</span>}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {t('storySubmission.metadata.styleHelper')}
        </p>
        <div className="flex flex-wrap gap-2">
          {STYLE_TAGS.map(tag => (
            <Badge
              key={tag}
              variant={formData.styleTags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => toggleTag(tag, 'style')}
            >
              {t(`storySubmission.styles.${tag.toLowerCase()}`, tag)}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {t('storySubmission.metadata.selectedCount', {
            count: formData.styleTags.length,
            type: t('storySubmission.metadata.styles'),
          })}
        </p>
      </Card>

      {/* Budget and Timeline */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5" />
            <h3 className="text-lg font-semibold">{t('storySubmission.metadata.budgetSection')}</h3>
            {required.budgetRange && <span className="text-red-500">*</span>}
          </div>
          <div className="space-y-2">
            <Label>{t('storySubmission.metadata.budgetLabel')}</Label>
            <Select
              value={formData.budgetRange}
              onValueChange={value => updateFormData({ budgetRange: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('storySubmission.metadata.budgetPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_RANGES.map(range => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t('storySubmission.metadata.budgetHelper')}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5" />
            <h3 className="text-lg font-semibold">
              {t('storySubmission.metadata.timelineSection')}
            </h3>
            {required.timeline && <span className="text-red-500">*</span>}
          </div>
          <div className="space-y-2">
            <Label>{t('storySubmission.metadata.timelineLabel')}</Label>
            <Select
              value={formData.timeline}
              onValueChange={value => updateFormData({ timeline: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('storySubmission.metadata.timelinePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {TIMELINES.map(timeline => (
                  <SelectItem key={timeline} value={timeline}>
                    {t(
                      `storySubmission.timelines.${timeline.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
                      timeline
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t('storySubmission.metadata.timelineHelper')}
            </p>
          </div>
        </Card>
      </div>

      {/* Cultural Significance */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{t('storySubmission.metadata.culturalSection')}</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cultural">{t('storySubmission.metadata.culturalLabel')}</Label>
          <Textarea
            id="cultural"
            value={formData.culturalSignificance}
            onChange={e => updateFormData({ culturalSignificance: e.target.value })}
            placeholder={t('storySubmission.metadata.culturalPlaceholder')}
            rows={3}
            maxLength={500}
          />
          <p className="text-sm text-muted-foreground">
            {t('storySubmission.metadata.culturalHelper')} ({formData.culturalSignificance.length}
            /500)
          </p>
        </div>
      </Card>

      {/* Special Notes */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <PenTool className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{t('storySubmission.metadata.notesSection')}</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">{t('storySubmission.metadata.notesLabel')}</Label>
          <Textarea
            id="notes"
            value={formData.specialNotes}
            onChange={e => updateFormData({ specialNotes: e.target.value })}
            placeholder={t('storySubmission.metadata.notesPlaceholder')}
            rows={4}
            maxLength={800}
          />
          <p className="text-sm text-muted-foreground">
            {t('storySubmission.metadata.notesHelper')} ({formData.specialNotes.length}/800)
          </p>
        </div>
      </Card>
    </div>
  );
};

export default StoryMetadataForm;
