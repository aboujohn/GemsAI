'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import StoryShareDialog, { ShareData } from './StoryShareDialog';
import { Heart, MessageCircle, Share2, Eye, MoreHorizontal, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StorySocialActionsProps {
  storyId: string;
  storyTitle: string;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  viewCount?: number;
  isLiked?: boolean;
  isPublic?: boolean;
  showCounts?: boolean;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  onLike?: () => Promise<void>;
  onUnlike?: () => Promise<void>;
  onComment?: () => void;
  onShare?: (shareData: ShareData) => Promise<void>;
  onViewLikes?: () => void;
  className?: string;
}

export default function StorySocialActions({
  storyId,
  storyTitle,
  likeCount = 0,
  commentCount = 0,
  shareCount = 0,
  viewCount = 0,
  isLiked = false,
  isPublic = false,
  showCounts = true,
  size = 'md',
  orientation = 'horizontal',
  onLike,
  onUnlike,
  onComment,
  onShare,
  onViewLikes,
  className,
}: StorySocialActionsProps) {
  const { t } = useTranslation(['story', 'common']);

  // State
  const [isLiking, setIsLiking] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);
  const [currentIsLiked, setCurrentIsLiked] = useState(isLiked);

  // Update state when props change
  useEffect(() => {
    setCurrentLikeCount(likeCount);
    setCurrentIsLiked(isLiked);
  }, [likeCount, isLiked]);

  // Handle like/unlike
  const handleLikeToggle = useCallback(async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      if (currentIsLiked) {
        await onUnlike?.();
        setCurrentIsLiked(false);
        setCurrentLikeCount(prev => Math.max(prev - 1, 0));
      } else {
        await onLike?.();
        setCurrentIsLiked(true);
        setCurrentLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert optimistic update
      setCurrentIsLiked(isLiked);
      setCurrentLikeCount(likeCount);
    } finally {
      setIsLiking(false);
    }
  }, [currentIsLiked, isLiking, onLike, onUnlike, isLiked, likeCount]);

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'h-8 px-2',
      icon: 'h-3 w-3',
      text: 'text-xs',
      gap: 'gap-1',
    },
    md: {
      button: 'h-9 px-3',
      icon: 'h-4 w-4',
      text: 'text-sm',
      gap: 'gap-2',
    },
    lg: {
      button: 'h-10 px-4',
      icon: 'h-5 w-5',
      text: 'text-base',
      gap: 'gap-2',
    },
  };

  const config = sizeConfig[size];

  // Format count for display
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const containerClass = cn(
    'flex items-center',
    orientation === 'vertical' ? 'flex-col space-y-2' : `${config.gap}`,
    className
  );

  return (
    <TooltipProvider>
      <div className={containerClass}>
        {/* Like Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentIsLiked ? 'default' : 'ghost'}
              size="sm"
              onClick={handleLikeToggle}
              disabled={isLiking}
              className={cn(
                config.button,
                currentIsLiked && 'text-red-500 hover:text-red-600',
                'transition-colors'
              )}
            >
              <Heart
                className={cn(
                  config.icon,
                  currentIsLiked && 'fill-current',
                  isLiking && 'animate-pulse'
                )}
              />
              {showCounts && <span className={config.text}>{formatCount(currentLikeCount)}</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {currentIsLiked ? t('storySocial.unlike') : t('storySocial.like')}
          </TooltipContent>
        </Tooltip>

        {/* Comment Button */}
        {onComment && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onComment} className={config.button}>
                <MessageCircle className={config.icon} />
                {showCounts && <span className={config.text}>{formatCount(commentCount)}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('storySocial.comment')}</TooltipContent>
          </Tooltip>
        )}

        {/* Share Button */}
        <StoryShareDialog
          storyId={storyId}
          storyTitle={storyTitle}
          isPublic={isPublic}
          onShare={onShare}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className={config.button}>
                <Share2 className={config.icon} />
                {showCounts && <span className={config.text}>{formatCount(shareCount)}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.share')}</TooltipContent>
          </Tooltip>
        </StoryShareDialog>

        {/* View Count (if public) */}
        {isPublic && showCounts && viewCount > 0 && (
          <div className={cn('flex items-center', config.gap, 'text-muted-foreground')}>
            <Eye className={config.icon} />
            <span className={config.text}>{formatCount(viewCount)}</span>
          </div>
        )}

        {/* Like Count with Avatars (clickable to view likes) */}
        {onViewLikes && currentLikeCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewLikes}
                className={cn(config.button, 'text-muted-foreground hover:text-foreground')}
              >
                <Users className={config.icon} />
                <span className={config.text}>
                  {currentLikeCount === 1
                    ? t('storySocial.oneLike')
                    : t('storySocial.multipleLikes', { count: currentLikeCount })}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('storySocial.viewLikes')}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
