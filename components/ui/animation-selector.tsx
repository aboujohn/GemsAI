'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/Icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  GiftAnimation, 
  AnimationCategory, 
  AnimationStyle,
  AnimationSelectorProps 
} from '@/lib/types/gifts';

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_LABELS: Record<AnimationCategory, string> = {
  romantic: 'Romantic',
  celebration: 'Celebration',
  holiday: 'Holiday',
  family: 'Family',
  friendship: 'Friendship',
  seasonal: 'Seasonal',
  elegant: 'Elegant',
  playful: 'Playful',
  spiritual: 'Spiritual',
  minimalist: 'Minimalist'
};

const CATEGORY_DESCRIPTIONS: Record<AnimationCategory, string> = {
  romantic: 'Love, romance, Valentine\'s Day',
  celebration: 'Birthday, anniversary, achievement',
  holiday: 'Christmas, Hanukkah, New Year',
  family: 'Mother\'s Day, Father\'s Day, family occasions',
  friendship: 'Friendship, gratitude, support',
  seasonal: 'Spring, summer, fall, winter themes',
  elegant: 'Sophisticated, luxury animations',
  playful: 'Fun, colorful, energetic',
  spiritual: 'Religious, spiritual themes',
  minimalist: 'Simple, clean animations'
};

const STYLE_LABELS: Record<AnimationStyle, string> = {
  particles: 'Particles',
  floral: 'Floral',
  geometric: 'Geometric',
  watercolor: 'Watercolor',
  sparkles: 'Sparkles',
  ribbon: 'Ribbon',
  heart: 'Heart',
  star: 'Star',
  wave: 'Wave',
  confetti: 'Confetti'
};

// ============================================================================
// ANIMATION PREVIEW COMPONENT
// ============================================================================

interface AnimationPreviewProps {
  animation: GiftAnimation;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

const AnimationPreview: React.FC<AnimationPreviewProps> = ({
  animation,
  isSelected,
  onClick,
  className
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-lg border transition-all duration-200',
        'hover:shadow-md hover:scale-102',
        isSelected 
          ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
          : 'border-border hover:border-primary/50',
        className
      )}
      onClick={onClick}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Icons.check className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
      )}

      {/* Premium badge */}
      {animation.is_premium && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="text-xs">
            <Icons.crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </div>
      )}

      {/* Featured badge */}
      {animation.is_featured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="text-xs">
            <Icons.star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      {/* Animation thumbnail */}
      <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
        {!imageError ? (
          <img
            src={animation.thumbnail_url}
            alt={animation.name}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-200',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImageError(true);
              setIsLoading(false);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icons.image className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icons.loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <Icons.play className="h-6 w-6 text-black ml-1" />
          </div>
        </div>
      </div>

      {/* Animation details */}
      <div className="p-3">
        <h3 className="font-medium text-sm mb-1 line-clamp-1">{animation.name}</h3>
        {animation.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {animation.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Icons.clock className="h-3 w-3" />
            <span>{(animation.duration_ms / 1000).toFixed(1)}s</span>
          </div>
          <div className="flex items-center gap-1">
            <Icons.heart className="h-3 w-3" />
            <span>{animation.usage_count}</span>
          </div>
        </div>

        {/* Tags */}
        {animation.tags && animation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {animation.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                {tag}
              </Badge>
            ))}
            {animation.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{animation.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN ANIMATION SELECTOR COMPONENT
// ============================================================================

export const AnimationSelector: React.FC<AnimationSelectorProps> = ({
  selectedAnimation,
  onAnimationSelect,
  category,
  style,
  className
}) => {
  const [animations, setAnimations] = useState<GiftAnimation[]>([]);
  const [categories, setCategories] = useState<AnimationCategory[]>([]);
  const [featuredAnimations, setFeaturedAnimations] = useState<GiftAnimation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<AnimationCategory | 'all'>(category || 'all');
  const [selectedStyle, setSelectedStyle] = useState<AnimationStyle | 'all'>(style || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPremium, setShowPremium] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');

  // Pagination
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch animations
  const fetchAnimations = async (reset = false) => {
    if (!reset && loadingMore) return;

    try {
      if (reset) {
        setLoading(true);
        setAnimations([]);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        limit: '20',
        offset: reset ? '0' : animations.length.toString()
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedStyle !== 'all') {
        params.append('style', selectedStyle);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (currentTab === 'featured') {
        params.append('featured', 'true');
      }
      if (showPremium) {
        params.append('premium', 'true');
      }

      const response = await fetch(`/api/gifts/animations?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch animations');
      }

      const data = await response.json();
      
      if (reset) {
        setAnimations(data.animations);
        setCategories(data.categories);
        setFeaturedAnimations(data.featured);
      } else {
        setAnimations(prev => [...prev, ...data.animations]);
      }
      
      setHasMore(data.hasMore);
      setError(null);
    } catch (err) {
      console.error('Error fetching animations:', err);
      setError('Failed to load animations');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAnimations(true);
  }, [selectedCategory, selectedStyle, searchQuery, currentTab, showPremium]);

  // Handle animation selection
  const handleAnimationSelect = (animation: GiftAnimation) => {
    onAnimationSelect(animation);
  };

  const getDisplayAnimations = () => {
    if (currentTab === 'featured') {
      return featuredAnimations;
    }
    return animations;
  };

  if (loading && animations.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="text-center py-12">
          <Icons.loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading animations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="text-center py-12">
          <Icons.alertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => fetchAnimations(true)} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search animations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div className="flex-1 min-w-40">
            <Label className="text-sm mb-2 block">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as AnimationCategory | 'all')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Style Filter */}
          <div className="flex-1 min-w-40">
            <Label className="text-sm mb-2 block">Style</Label>
            <Select
              value={selectedStyle}
              onValueChange={(value) => setSelectedStyle(value as AnimationStyle | 'all')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
                {Object.entries(STYLE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Premium Toggle */}
          <div className="flex items-end">
            <Button
              variant={showPremium ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPremium(!showPremium)}
              className="h-10"
            >
              <Icons.crown className="h-4 w-4 mr-2" />
              Premium
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Animations</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Selected Category Description */}
          {selectedCategory !== 'all' && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-1">{CATEGORY_LABELS[selectedCategory]}</h3>
              <p className="text-sm text-muted-foreground">
                {CATEGORY_DESCRIPTIONS[selectedCategory]}
              </p>
            </div>
          )}

          {/* Animation Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {getDisplayAnimations().map((animation) => (
              <AnimationPreview
                key={animation.id}
                animation={animation}
                isSelected={selectedAnimation?.id === animation.id}
                onClick={() => handleAnimationSelect(animation)}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && currentTab === 'all' && (
            <div className="text-center pt-4">
              <Button
                onClick={() => fetchAnimations(false)}
                disabled={loadingMore}
                variant="outline"
              >
                {loadingMore ? (
                  <>
                    <Icons.loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredAnimations.map((animation) => (
              <AnimationPreview
                key={animation.id}
                animation={animation}
                isSelected={selectedAnimation?.id === animation.id}
                onClick={() => handleAnimationSelect(animation)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {getDisplayAnimations().length === 0 && !loading && (
        <div className="text-center py-12">
          <Icons.sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No animations found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or filters
          </p>
          <Button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedStyle('all');
              setSearchQuery('');
              setShowPremium(false);
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default AnimationSelector;