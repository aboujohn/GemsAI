'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/Icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/types/database';
import { EmotionCategory } from '@/lib/types/emotions';
import { createProductMatchEngine, MatchResult } from '@/lib/services/product-match-engine';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface FilterOptions {
  emotions: EmotionCategory[];
  priceRange: [number, number];
  materials: string[];
  styles: string[];
  availability: 'all' | 'available' | 'pre-order';
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'newest' | 'popular';
  searchQuery: string;
}

export interface EmotionJewelryBrowserProps {
  className?: string;
  onProductSelect?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  maxResults?: number;
  showFilters?: boolean;
  emotionFocus?: EmotionCategory;
}

interface ProductGridItemProps {
  product: Product;
  matchScore?: number;
  onSelect?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  isSelected?: boolean;
}

// ============================================================================
// EMOTION CATEGORIES WITH DISPLAY INFO
// ============================================================================

const EMOTION_DISPLAY_INFO: Record<EmotionCategory, { 
  label: string; 
  icon: string; 
  color: string;
  description: string;
}> = {
  love: { 
    label: 'Love', 
    icon: 'heart', 
    color: 'text-red-600', 
    description: 'Romantic and heartfelt jewelry'
  },
  joy: { 
    label: 'Joy', 
    icon: 'smile', 
    color: 'text-yellow-600', 
    description: 'Bright and celebratory pieces'
  },
  gratitude: { 
    label: 'Gratitude', 
    icon: 'gift', 
    color: 'text-amber-600', 
    description: 'Warm and appreciative designs'
  },
  nostalgia: { 
    label: 'Nostalgia', 
    icon: 'clock', 
    color: 'text-sepia-600', 
    description: 'Vintage and sentimental styles'
  },
  pride: { 
    label: 'Pride', 
    icon: 'crown', 
    color: 'text-purple-600', 
    description: 'Bold and achievement-focused'
  },
  peace: { 
    label: 'Peace', 
    icon: 'leaf', 
    color: 'text-green-600', 
    description: 'Calm and serene jewelry'
  },
  hope: { 
    label: 'Hope', 
    icon: 'sunrise', 
    color: 'text-blue-600', 
    description: 'Uplifting and inspiring pieces'
  },
  strength: { 
    label: 'Strength', 
    icon: 'shield', 
    color: 'text-gray-700', 
    description: 'Powerful and empowering designs'
  },
  elegance: { 
    label: 'Elegance', 
    icon: 'sparkles', 
    color: 'text-indigo-600', 
    description: 'Sophisticated and refined jewelry'
  },
  passion: { 
    label: 'Passion', 
    icon: 'flame', 
    color: 'text-red-700', 
    description: 'Intense and dramatic pieces'
  },
  tenderness: { 
    label: 'Tenderness', 
    icon: 'baby', 
    color: 'text-pink-500', 
    description: 'Gentle and nurturing designs'
  },
  celebration: { 
    label: 'Celebration', 
    icon: 'party-popper', 
    color: 'text-orange-600', 
    description: 'Festive and joyful jewelry'
  },
  remembrance: { 
    label: 'Remembrance', 
    icon: 'memorial', 
    color: 'text-gray-600', 
    description: 'Memorial and tribute pieces'
  },
  determination: { 
    label: 'Determination', 
    icon: 'target', 
    color: 'text-emerald-700', 
    description: 'Focused and purposeful designs'
  },
  friendship: { 
    label: 'Friendship', 
    icon: 'users', 
    color: 'text-blue-500', 
    description: 'Connected and bonding jewelry'
  },
  family: { 
    label: 'Family', 
    icon: 'home', 
    color: 'text-brown-600', 
    description: 'Generational and heritage pieces'
  },
  romance: { 
    label: 'Romance', 
    icon: 'heart-handshake', 
    color: 'text-rose-600', 
    description: 'Intimate and loving jewelry'
  }
};

// ============================================================================
// PRODUCT GRID ITEM COMPONENT
// ============================================================================

const ProductGridItem: React.FC<ProductGridItemProps> = ({
  product,
  matchScore,
  onSelect,
  onAddToCart,
  onAddToWishlist,
  isSelected = false
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg',
        isSelected && 'ring-2 ring-primary',
        'group relative overflow-hidden'
      )}
      onClick={() => onSelect?.(product)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        {product.images && product.images.length > 0 && !imageError ? (
          <img
            src={product.images[0]}
            alt={product.name}
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
        {matchScore && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              {Math.round(matchScore * 100)}% match
            </Badge>
          </div>
        )}

        {/* Availability Badge */}
        {!product.is_available && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
              Pre-order
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Product Name */}
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {/* Price */}
          {product.price && (
            <p className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </p>
          )}

          {/* Emotion Tags */}
          {product.emotion_tags && product.emotion_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.emotion_tags.slice(0, 3).map((tag) => {
                const emotionInfo = EMOTION_DISPLAY_INFO[tag as EmotionCategory];
                return (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {emotionInfo ? emotionInfo.label : tag}
                  </Badge>
                );
              })}
              {product.emotion_tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.emotion_tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleAddToCart}
            >
              <Icons.shoppingCart className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN EMOTION JEWELRY BROWSER COMPONENT
// ============================================================================

export const EmotionJewelryBrowser: React.FC<EmotionJewelryBrowserProps> = ({
  className,
  onProductSelect,
  onAddToCart,
  onAddToWishlist,
  maxResults = 50,
  showFilters = true,
  emotionFocus
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState<FilterOptions>({
    emotions: emotionFocus ? [emotionFocus] : [],
    priceRange: [0, 50000],
    materials: [],
    styles: [],
    availability: 'all',
    sortBy: 'relevance',
    searchQuery: ''
  });

  // Mock product data for development
  const mockProducts: Product[] = useMemo(() => [
    {
      id: '1',
      name: 'Elegant Heart Diamond Ring',
      description: 'A beautiful diamond ring perfect for expressing love',
      price: 8500,
      images: ['/placeholder-ring.jpg'],
      emotion_tags: ['love', 'romance', 'elegance'],
      style_tags: ['romantic', 'classic', 'diamond'],
      materials: ['white-gold', 'diamond'],
      is_available: true,
      featured: true,
      jeweler_id: 'jeweler-1',
      lead_time_days: 7
    },
    {
      id: '2',
      name: 'Joyful Sunburst Necklace',
      description: 'Bright and cheerful necklace to celebrate happy moments',
      price: 3200,
      images: ['/placeholder-necklace.jpg'],
      emotion_tags: ['joy', 'celebration', 'hope'],
      style_tags: ['bright', 'modern', 'statement'],
      materials: ['yellow-gold', 'citrine'],
      is_available: true,
      featured: false,
      jeweler_id: 'jeweler-2',
      lead_time_days: 10
    },
    {
      id: '3',
      name: 'Peaceful Moonstone Bracelet',
      description: 'Calming bracelet with moonstone for inner peace',
      price: 1800,
      images: ['/placeholder-bracelet.jpg'],
      emotion_tags: ['peace', 'tenderness', 'hope'],
      style_tags: ['minimalist', 'serene', 'healing'],
      materials: ['silver', 'moonstone'],
      is_available: false,
      featured: true,
      jeweler_id: 'jeweler-3',
      lead_time_days: 14
    }
  ], []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = mockProducts;

    // Filter by emotions
    if (filters.emotions.length > 0) {
      filtered = filtered.filter(product => 
        product.emotion_tags?.some(tag => 
          filters.emotions.includes(tag as EmotionCategory)
        )
      );
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.emotion_tags?.some(tag => tag.toLowerCase().includes(query)) ||
        product.style_tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price && 
      product.price >= filters.priceRange[0] && 
      product.price <= filters.priceRange[1]
    );

    // Filter by availability
    if (filters.availability === 'available') {
      filtered = filtered.filter(product => product.is_available);
    } else if (filters.availability === 'pre-order') {
      filtered = filtered.filter(product => !product.is_available);
    }

    // Sort products
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        // Mock: sort by ID for demo
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default:
        // Keep original order for relevance
        break;
    }

    return filtered.slice(0, maxResults);
  }, [mockProducts, filters, maxResults]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  const toggleEmotionFilter = (emotion: EmotionCategory) => {
    setFilters(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion]
    }));
  };

  const resetFilters = () => {
    setFilters({
      emotions: emotionFocus ? [emotionFocus] : [],
      priceRange: [0, 50000],
      materials: [],
      styles: [],
      availability: 'all',
      sortBy: 'relevance',
      searchQuery: ''
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Discover Jewelry by Emotion</h2>
          <p className="text-muted-foreground">
            Find pieces that match your feelings and story
          </p>
        </div>
        
        <div className="flex items-center gap-2">
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
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filters</CardTitle>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search by name, emotion, or style..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                leftIcon={<Icons.search className="h-4 w-4" />}
              />
            </div>

            {/* Emotion Filters */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Emotions</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {Object.entries(EMOTION_DISPLAY_INFO).map(([emotion, info]) => (
                  <Button
                    key={emotion}
                    variant={filters.emotions.includes(emotion as EmotionCategory) ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start"
                    onClick={() => toggleEmotionFilter(emotion as EmotionCategory)}
                  >
                    <span className={cn('mr-2', info.color)}>
                      {/* Icon would go here */}
                    </span>
                    {info.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Price Range: ₪{filters.priceRange[0].toLocaleString()} - ₪{filters.priceRange[1].toLocaleString()}
              </label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                max={50000}
                min={0}
                step={500}
                className="w-full"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.availability}
                onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value as any }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="pre-order">Pre-order</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredProducts.length} products found
        </p>
        
        {filters.emotions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Selected emotions:</span>
            {filters.emotions.map(emotion => {
              const info = EMOTION_DISPLAY_INFO[emotion];
              return (
                <Badge 
                  key={emotion} 
                  variant="default" 
                  className="cursor-pointer"
                  onClick={() => toggleEmotionFilter(emotion)}
                >
                  {info.label}
                  <Icons.x className="h-3 w-3 ml-1" />
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading jewelry...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Icons.search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No jewelry found</p>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={resetFilters}>
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        )}>
          {filteredProducts.map((product) => (
            <ProductGridItem
              key={product.id}
              product={product}
              onSelect={handleProductSelect}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              isSelected={selectedProduct?.id === product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmotionJewelryBrowser;