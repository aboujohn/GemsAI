'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import {
  Heart,
  Sparkles,
  DollarSign,
  Calendar,
  Globe,
  PenTool,
  Clock,
  Type,
  Mic,
  User,
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

export interface StoryPreviewProps {
  story: StoryMetadata;
  userName?: string;
  userAvatar?: string;
  showMetadata?: boolean;
  showPrivateFields?: boolean;
  compact?: boolean;
}

export const StoryPreview: React.FC<StoryPreviewProps> = ({
  story,
  userName = 'Anonymous',
  userAvatar,
  showMetadata = true,
  showPrivateFields = false,
  compact = false,
}) => {
  const { t } = useTranslation(['story', 'common']);

  const formatDate = (date: Date = new Date()) => {
    return new Intl.DateTimeFormat(story.language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            {userAvatar ? <img src={userAvatar} alt={userName} /> : <User className="h-6 w-6" />}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{story.title}</h3>
              <Badge variant="outline" className="shrink-0">
                {story.emotionTags[0]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{userName}</p>
            <p
              className="text-sm line-clamp-3"
              style={{
                direction: story.direction,
                textAlign: story.direction === 'rtl' ? 'right' : 'left',
              }}
            >
              {story.content}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {story.wordCount} {t('common.words')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {story.readingTime} {t('common.min')}
              </span>
              {story.audioUrl && (
                <span className="flex items-center gap-1">
                  <Mic className="h-3 w-3" />
                  {formatDuration(story.audioDuration || 0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Story Header */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            {userAvatar ? <img src={userAvatar} alt={userName} /> : <User className="h-8 w-8" />}
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{
                    direction: story.direction,
                    textAlign: story.direction === 'rtl' ? 'right' : 'left',
                  }}
                >
                  {story.title}
                </h1>
                <p className="text-muted-foreground">
                  {t('story.by')} {userName}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{formatDate()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{story.language.toUpperCase()}</Badge>
                  {story.direction === 'rtl' && <Badge variant="outline">RTL</Badge>}
                </div>
              </div>
            </div>

            {/* Emotion Tags */}
            {story.emotionTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {story.emotionTags.map(tag => (
                  <Badge key={tag} variant="default" className="text-xs">
                    <Heart className="h-3 w-3 mr-1" />
                    {t(`storySubmission.emotions.${tag.toLowerCase()}`, tag)}
                  </Badge>
                ))}
              </div>
            )}

            {/* Style Tags */}
            {story.styleTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {story.styleTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {t(`storySubmission.styles.${tag.toLowerCase()}`, tag)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Story Content */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{t('storyPreview.storyContent')}</h2>
        </div>

        {/* Audio Player */}
        {story.audioUrl && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Mic className="h-5 w-5" />
              <span className="font-medium">{t('storyPreview.audioVersion')}</span>
              <Badge variant="outline">{formatDuration(story.audioDuration || 0)}</Badge>
            </div>
            <audio controls className="w-full">
              <source src={story.audioUrl} type="audio/mpeg" />
              {t('storyPreview.audioNotSupported')}
            </audio>
          </div>
        )}

        {/* Text Content */}
        <div
          className="prose prose-lg max-w-none leading-relaxed"
          style={{
            direction: story.direction,
            textAlign: story.direction === 'rtl' ? 'right' : 'left',
          }}
        >
          {story.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Content Stats */}
        <Separator className="my-6" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Type className="h-4 w-4" />
              {story.characterCount} {t('common.characters')}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {story.wordCount} {t('common.words')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {story.readingTime} {t('common.minutesRead')}
            </span>
          </div>
        </div>
      </Card>

      {/* Cultural Significance */}
      {story.culturalSignificance && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{t('storyPreview.culturalSignificance')}</h2>
          </div>
          <p
            className="text-muted-foreground leading-relaxed"
            style={{
              direction: story.direction,
              textAlign: story.direction === 'rtl' ? 'right' : 'left',
            }}
          >
            {story.culturalSignificance}
          </p>
        </Card>
      )}

      {/* Metadata (Show to jewelers/staff) */}
      {showMetadata && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('storyPreview.jewelryPreferences')}</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Budget Range */}
            {story.budgetRange && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{t('storyPreview.budgetRange')}</p>
                  <p className="text-sm text-muted-foreground">{story.budgetRange}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            {story.timeline && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{t('storyPreview.timeline')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      `storySubmission.timelines.${story.timeline.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
                      story.timeline
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Special Notes (Private - only for jewelers) */}
      {showPrivateFields && story.specialNotes && (
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-2 mb-4">
            <PenTool className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-orange-800">
              {t('storyPreview.specialNotes')}
            </h2>
            <Badge variant="destructive" className="text-xs">
              {t('storyPreview.privateInfo')}
            </Badge>
          </div>
          <p
            className="text-orange-700 leading-relaxed"
            style={{
              direction: story.direction,
              textAlign: story.direction === 'rtl' ? 'right' : 'left',
            }}
          >
            {story.specialNotes}
          </p>
        </Card>
      )}

      {/* Call to Action for Jewelers */}
      {showMetadata && (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{t('storyPreview.jewelryOpportunity')}</h3>
            <p className="text-muted-foreground mb-4">{t('storyPreview.jewelryOpportunityDesc')}</p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                {story.emotionTags.length} {t('storyPreview.emotions')}
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-purple-500" />
                {story.styleTags.length} {t('storyPreview.stylePrefs')}
              </span>
              {story.budgetRange && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  {story.budgetRange.split('-')[0]} {t('storyPreview.budget')}
                </span>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StoryPreview;
