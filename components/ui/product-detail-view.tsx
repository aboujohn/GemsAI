'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/Icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/types/database';
import { MatchResult } from '@/lib/services/product-match-engine';
import { EmotionCategory } from '@/lib/types/emotions';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ProductDetailViewProps {
  product: Product;
  matchResult?: MatchResult;
  className?: string;
  onAddToCart?: (product: Product, quantity: number) => void;
  onAddToWishlist?: (product: Product) => void;
  onContactJeweler?: (jewelerId: string) => void;
  onShare?: (product: Product) => void;
  showMatchDetails?: boolean;
}

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

interface MatchAnalysisProps {
  matchResult: MatchResult;
}

// ============================================================================
// EMOTION DISPLAY INFO
// ============================================================================

const EMOTION_DISPLAY_INFO: Record<EmotionCategory, { 
  label: string; 
  icon: string; 
  color: string;
}> = {
  love: { label: 'Love', icon: 'heart', color: 'text-red-600 bg-red-50' },
  joy: { label: 'Joy', icon: 'smile', color: 'text-yellow-600 bg-yellow-50' },
  gratitude: { label: 'Gratitude', icon: 'gift', color: 'text-amber-600 bg-amber-50' },
  nostalgia: { label: 'Nostalgia', icon: 'clock', color: 'text-sepia-600 bg-sepia-50' },
  pride: { label: 'Pride', icon: 'crown', color: 'text-purple-600 bg-purple-50' },
  peace: { label: 'Peace', icon: 'leaf', color: 'text-green-600 bg-green-50' },
  hope: { label: 'Hope', icon: 'sunrise', color: 'text-blue-600 bg-blue-50' },
  strength: { label: 'Strength', icon: 'shield', color: 'text-gray-700 bg-gray-50' },
  elegance: { label: 'Elegance', icon: 'sparkles', color: 'text-indigo-600 bg-indigo-50' },
  passion: { label: 'Passion', icon: 'flame', color: 'text-red-700 bg-red-50' },
  tenderness: { label: 'Tenderness', icon: 'baby', color: 'text-pink-500 bg-pink-50' },
  celebration: { label: 'Celebration', icon: 'party-popper', color: 'text-orange-600 bg-orange-50' },
  remembrance: { label: 'Remembrance', icon: 'memorial', color: 'text-gray-600 bg-gray-50' },
  determination: { label: 'Determination', icon: 'target', color: 'text-emerald-700 bg-emerald-50' },
  friendship: { label: 'Friendship', icon: 'users', color: 'text-blue-500 bg-blue-50' },
  family: { label: 'Family', icon: 'home', color: 'text-brown-600 bg-brown-50' },
  romance: { label: 'Romance', icon: 'heart-handshake', color: 'text-rose-600 bg-rose-50' }
};

// ============================================================================
// IMAGE GALLERY COMPONENT
// ============================================================================

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [imageError, setImageError] = useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setImageError(prev => new Set([...prev, index]));
  };

  const validImages = images.filter((_, index) => !imageError.has(index));

  if (validImages.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <Icons.gem className="h-24 w-24 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
        <img
          src={validImages[currentImage] || '/placeholder-jewelry.jpg'}
          alt={`${productName} - Image ${currentImage + 1}`}
          className="w-full h-full object-cover"
          onError={() => handleImageError(currentImage)}
        />
        
        {/* Zoom Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <Icons.zoomIn className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{productName}</DialogTitle>
            </DialogHeader>
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <img
                src={validImages[currentImage]}
                alt={`${productName} - Enlarged`}
                className="w-full h-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Thumbnail Gallery */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={cn(
                'flex-shrink-0 aspect-square w-16 h-16 rounded-md overflow-hidden border-2 transition-colors',
                currentImage === index ? 'border-primary' : 'border-transparent'
              )}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(index)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MATCH ANALYSIS COMPONENT
// ============================================================================

const MatchAnalysis: React.FC<MatchAnalysisProps> = ({ matchResult }) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    return 'Fair';
  };

  return (
    <div className="space-y-6">
      {/* Overall Match Score */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">
              {Math.round(matchResult.score.overall_score * 100)}%
            </div>
            <div className="text-lg font-medium">
              Overall Match Score
            </div>
            <Badge 
              variant="secondary" 
              className={cn('text-sm', getScoreColor(matchResult.score.overall_score))}
            >
              {getScoreLabel(matchResult.score.overall_score)} Match
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Match Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Emotion Alignment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Emotion Alignment</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(matchResult.score.emotion_alignment * 100)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${matchResult.score.emotion_alignment * 100}%` }}
              />
            </div>
          </div>

          {/* Style Compatibility */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Style Compatibility</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(matchResult.score.style_compatibility * 100)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-gemstone-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${matchResult.score.style_compatibility * 100}%` }}
              />
            </div>
          </div>

          {/* Cultural Relevance */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cultural Relevance</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(matchResult.score.cultural_relevance * 100)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${matchResult.score.cultural_relevance * 100}%` }}
              />
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Quality & Features</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(matchResult.score.quality_metrics * 100)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${matchResult.score.quality_metrics * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Explanations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Why This Matches Your Story</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {matchResult.explanation.map((explanation, index) => (
              <div key={index} className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{explanation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// MAIN PRODUCT DETAIL VIEW COMPONENT
// ============================================================================

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  matchResult,
  className,
  onAddToCart,
  onAddToWishlist,
  onContactJeweler,
  onShare,
  showMatchDetails = false
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  const estimatedDelivery = () => {
    if (!product.lead_time_days) return 'Contact jeweler for delivery time';
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + product.lead_time_days);
    
    return `Estimated delivery: ${deliveryDate.toLocaleDateString('he-IL')}`;
  };

  return (
    <div className={cn('max-w-7xl mx-auto', className)}>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <ImageGallery 
            images={product.images || ['/placeholder-jewelry.jpg']}
            productName={product.name}
          />
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              {product.price && (
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              {product.featured && (
                <Badge variant="secondary" className="bg-gold-100 text-gold-800">
                  <Icons.star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              
              <Badge 
                variant={product.is_available ? 'default' : 'secondary'}
                className={product.is_available ? 'bg-green-100 text-green-800' : ''}
              >
                {product.is_available ? 'Available' : 'Pre-order'}
              </Badge>

              {matchResult && (
                <Badge variant="outline" className="border-primary text-primary">
                  {Math.round(matchResult.score.overall_score * 100)}% Match
                </Badge>
              )}
            </div>

            {/* Emotion Tags */}
            {product.emotion_tags && product.emotion_tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Emotional Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {product.emotion_tags.map((tag) => {
                    const emotionInfo = EMOTION_DISPLAY_INFO[tag as EmotionCategory];
                    return (
                      <Badge 
                        key={tag} 
                        variant="outline"
                        className={emotionInfo ? emotionInfo.color : ''}
                      >
                        {emotionInfo ? emotionInfo.label : tag}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Icons.minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Icons.plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                className="flex-1" 
                onClick={handleAddToCart}
                disabled={!product.is_available}
              >
                <Icons.shoppingCart className="h-4 w-4 mr-2" />
                {product.is_available ? 'Add to Cart' : 'Pre-order'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleAddToWishlist}
              >
                <Icons.heart 
                  className={cn(
                    'h-4 w-4',
                    isWishlisted && 'fill-red-500 text-red-500'
                  )} 
                />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => onShare?.(product)}
              >
                <Icons.share className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Delivery Information */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Icons.truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Delivery Information</p>
                  <p className="text-sm text-muted-foreground">
                    {estimatedDelivery()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Jeweler */}
          {product.jeweler_id && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <Icons.user className="h-5 w-5" />
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Crafted by Expert Jeweler</p>
                      <p className="text-sm text-muted-foreground">
                        Ask questions or request customizations
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onContactJeweler?.(product.jeweler_id)}
                  >
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <div className="mt-12">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            {showMatchDetails && matchResult && (
              <TabsTrigger value="match-analysis">Match Analysis</TabsTrigger>
            )}
            <TabsTrigger value="care">Care Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">
                  {product.description || 'This beautiful piece represents the perfect blend of traditional craftsmanship and modern design sensibilities. Each detail has been carefully considered to create a jewelry piece that not only looks stunning but also carries deep emotional meaning.'}
                </p>
                
                {/* Materials */}
                {product.materials && product.materials.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Materials</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.materials.map((material, index) => (
                        <Badge key={index} variant="outline">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Style Tags */}
                {product.style_tags && product.style_tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Style Elements</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.style_tags.map((style, index) => (
                        <Badge key={index} variant="secondary">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Product ID</span>
                      <span className="text-sm text-muted-foreground">{product.id}</span>
                    </div>
                    
                    {product.materials && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Primary Material</span>
                        <span className="text-sm text-muted-foreground">
                          {product.materials[0]}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Availability</span>
                      <span className="text-sm text-muted-foreground">
                        {product.is_available ? 'In Stock' : 'Made to Order'}
                      </span>
                    </div>
                    
                    {product.lead_time_days && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Lead Time</span>
                        <span className="text-sm text-muted-foreground">
                          {product.lead_time_days} days
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {showMatchDetails && matchResult && (
            <TabsContent value="match-analysis" className="mt-6">
              <MatchAnalysis matchResult={matchResult} />
            </TabsContent>
          )}
          
          <TabsContent value="care" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Care Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">General Care</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Store in a dry, cool place away from direct sunlight</li>
                      <li>• Keep in individual pouches to prevent scratching</li>
                      <li>• Remove before swimming, showering, or exercising</li>
                      <li>• Clean gently with a soft, lint-free cloth</li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Professional Maintenance</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Professional cleaning recommended every 6 months</li>
                      <li>• Inspection of settings and clasps annually</li>
                      <li>• Re-polishing services available</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetailView;