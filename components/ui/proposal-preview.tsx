'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import { MatchResult } from '@/lib/services/product-match-engine';
import { EmotionAnalysisResult } from '@/lib/types/emotions';
import { Sketch } from '@/lib/types/database';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ProposalPreviewProps {
  sketch: Sketch;
  emotions: EmotionAnalysisResult;
  matches: MatchResult[];
  className?: string;
  onProductSelect?: (match: MatchResult) => void;
  onAddToWishlist?: (match: MatchResult) => void;
  onAddToCart?: (match: MatchResult) => void;
  isLoading?: boolean;
}

interface ProductCardProps {
  match: MatchResult;
  onSelect?: (match: MatchResult) => void;
  onAddToWishlist?: (match: MatchResult) => void;
  onAddToCart?: (match: MatchResult) => void;
  isSelected?: boolean;
}

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================

const ProductCard: React.FC<ProductCardProps> = ({
  match,
  onSelect,
  onAddToWishlist,
  onAddToCart,
  isSelected = false
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (onAddToWishlist) {
      onAddToWishlist(match);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(match);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg',
        isSelected && 'ring-2 ring-primary',
        'group relative overflow-hidden'
      )}
      onClick={() => onSelect?.(match)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        {match.product.images && match.product.images.length > 0 && !imageError ? (
          <img
            src={match.product.images[0]}
            alt={match.product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Icons.gem className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={handleWishlistToggle}
          >
            <Icons.heart 
              className={cn(
                'h-4 w-4',
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
              )} 
            />
          </Button>
        </div>

        {/* Match Score Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            <div className={cn('w-2 h-2 rounded-full mr-1', getScoreColor(match.score.overall_score))} />
            {Math.round(match.score.overall_score * 100)}%
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {match.product.name}
          </h3>
          
          {match.product.price && (
            <p className="text-lg font-bold text-primary">
              {formatPrice(match.product.price)}
            </p>
          )}

          {/* Emotion Tags */}
          {match.product.emotion_tags && match.product.emotion_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {match.product.emotion_tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {match.product.emotion_tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{match.product.emotion_tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Match Explanations */}
          {match.explanation.length > 0 && (
            <div className="space-y-1">
              {match.explanation.slice(0, 2).map((explanation, index) => (
                <p key={index} className="text-xs text-muted-foreground line-clamp-1">
                  • {explanation}
                </p>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleAddToCart}
            >
              <Icons.shoppingCart className="h-3 w-3 mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN PROPOSAL PREVIEW COMPONENT
// ============================================================================

export const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  sketch,
  emotions,
  matches,
  className,
  onProductSelect,
  onAddToWishlist,
  onAddToCart,
  isLoading = false
}) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleProductSelect = (match: MatchResult) => {
    setSelectedMatch(match);
    if (onProductSelect) {
      onProductSelect(match);
    }
  };

  const formatEmotion = (emotion: string) => {
    return emotion.charAt(0).toUpperCase() + emotion.slice(1);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sketch Section */}
        <Card className="lg:w-1/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.sparkles className="h-5 w-5 text-primary" />
              Your AI Sketch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sketch Image */}
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {sketch.image_url ? (
                <img
                  src={sketch.image_url}
                  alt="AI Generated Sketch"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icons.image className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Emotion Analysis */}
            <div className="space-y-3">
              <h4 className="font-medium">Detected Emotions</h4>
              
              {/* Primary Emotion */}
              <div className="space-y-2">
                <Badge variant="default" className="bg-primary">
                  <Icons.heart className="h-3 w-3 mr-1" />
                  {formatEmotion(emotions.primaryEmotion.category)}
                  <span className="ml-1 text-xs">
                    {Math.round(emotions.primaryEmotion.confidence * 100)}%
                  </span>
                </Badge>

                {/* Secondary Emotions */}
                {emotions.secondaryEmotions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {emotions.secondaryEmotions.slice(0, 3).map((emotion, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {formatEmotion(emotion.category)}
                        <span className="ml-1">
                          {Math.round(emotion.confidence * 100)}%
                        </span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Story Context */}
              {sketch.story_text && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Your Story</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {sketch.story_text}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Match Results Overview */}
        <Card className="lg:w-2/3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icons.gem className="h-5 w-5 text-gemstone-600" />
                Matched Jewelry ({matches.length})
              </CardTitle>
              
              {/* View Mode Toggle */}
              <div className="flex gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Icons.grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <Icons.list className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Finding perfect matches...</span>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12">
                <Icons.search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No matches found for your emotional preferences.</p>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'space-y-4'
              )}>
                {matches.map((match, index) => (
                  <ProductCard
                    key={match.product.id || index}
                    match={match}
                    onSelect={handleProductSelect}
                    onAddToWishlist={onAddToWishlist}
                    onAddToCart={onAddToCart}
                    isSelected={selectedMatch?.product.id === match.product.id}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Product Detail */}
      {selectedMatch && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Images */}
              <div className="space-y-4">
                {selectedMatch.product.images && selectedMatch.product.images.length > 0 && (
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={selectedMatch.product.images[0]}
                      alt={selectedMatch.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{selectedMatch.product.name}</h3>
                  {selectedMatch.product.description && (
                    <p className="text-muted-foreground mt-2">
                      {selectedMatch.product.description}
                    </p>
                  )}
                </div>

                {selectedMatch.product.price && (
                  <div className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat('he-IL', {
                      style: 'currency',
                      currency: 'ILS'
                    }).format(selectedMatch.product.price)}
                  </div>
                )}

                {/* Match Score Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-medium">Why This Matches Your Story</h4>
                  <div className="space-y-2">
                    {selectedMatch.explanation.map((explanation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Icons.check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{explanation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => onAddToCart?.(selectedMatch)}
                  >
                    <Icons.shoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onAddToWishlist?.(selectedMatch)}
                  >
                    <Icons.heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProposalPreview;