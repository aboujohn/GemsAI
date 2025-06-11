'use client';

import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
// import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProposalPreview } from '@/components/ui/proposal-preview';
import { EmotionJewelryBrowser } from '@/components/ui/emotion-jewelry-browser';
import { ProductDetailView } from '@/components/ui/product-detail-view';
import { Icons } from '@/components/ui/Icons';
// import { cn } from '@/lib/utils';
import { Sketch, Product } from '@/lib/types/database';
import { EmotionAnalysisResult } from '@/lib/types/emotions';
import { MatchResult } from '@/lib/services/product-match-engine';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockSketch: Sketch = {
  id: 'sketch-1',
  user_id: 'user-1',
  story_text: 'This ring represents the love story between my grandparents. They met during difficult times but their love remained strong for 60 years. I want to create something that captures their enduring love and the joy they brought to our family.',
  image_url: '/placeholder-sketch.jpg',
  generation_status: 'completed',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  prompt_used: 'A romantic vintage-style ring representing enduring love and joy',
  style_preferences: ['vintage', 'romantic', 'elegant'],
  cost_usd: 0.08
};

const mockEmotions: EmotionAnalysisResult = {
  primaryEmotion: {
    category: 'love',
    confidence: 0.92,
    context: 'enduring partnership and deep affection'
  },
  secondaryEmotions: [
    {
      category: 'gratitude',
      confidence: 0.78,
      context: 'appreciation for family legacy'
    },
    {
      category: 'nostalgia',
      confidence: 0.85,
      context: 'cherishing past memories'
    },
    {
      category: 'joy',
      confidence: 0.73,
      context: 'happiness from family bonds'
    }
  ],
  emotionalIntensity: 0.88,
  culturalContext: 'hebrew',
  analysisTimestamp: new Date().toISOString(),
  confidence: 0.91,
  explanation: 'Strong emotional content focused on enduring love, family legacy, and cherished memories'
};

const mockProducts: Product[] = [
  {
    id: 'product-1',
    name: 'Eternal Love Diamond Ring',
    description: 'A classic solitaire diamond ring with vintage-inspired details, perfect for celebrating enduring love and commitment.',
    price: 12500,
    images: ['/placeholder-ring1.jpg', '/placeholder-ring1-2.jpg'],
    emotion_tags: ['love', 'romance', 'elegance', 'nostalgia'],
    style_tags: ['vintage', 'classic', 'romantic', 'solitaire'],
    materials: ['white-gold', 'diamond'],
    is_available: true,
    featured: true,
    jeweler_id: 'jeweler-1',
    lead_time_days: 14
  },
  {
    id: 'product-2',
    name: 'Heritage Rose Gold Band',
    description: 'A warm rose gold wedding band with intricate engravings inspired by traditional family heirlooms.',
    price: 4800,
    images: ['/placeholder-ring2.jpg'],
    emotion_tags: ['love', 'family', 'gratitude', 'nostalgia'],
    style_tags: ['heritage', 'engraved', 'warm', 'traditional'],
    materials: ['rose-gold'],
    is_available: true,
    featured: false,
    jeweler_id: 'jeweler-2',
    lead_time_days: 10
  },
  {
    id: 'product-3',
    name: 'Vintage Sapphire Engagement Ring',
    description: 'A stunning sapphire center stone surrounded by diamonds in an art deco setting, perfect for those who appreciate vintage elegance.',
    price: 18900,
    images: ['/placeholder-ring3.jpg'],
    emotion_tags: ['love', 'elegance', 'pride', 'nostalgia'],
    style_tags: ['art-deco', 'vintage', 'sapphire', 'elegant'],
    materials: ['platinum', 'sapphire', 'diamond'],
    is_available: false,
    featured: true,
    jeweler_id: 'jeweler-3',
    lead_time_days: 21
  }
];

const mockMatches: MatchResult[] = mockProducts.map((product, index) => ({
  product,
  score: {
    overall_score: 0.95 - (index * 0.1),
    emotion_alignment: 0.92 - (index * 0.08),
    style_compatibility: 0.88 - (index * 0.12),
    cultural_relevance: 0.85,
    personalization: 0.75,
    quality_metrics: 0.90,
    confidence: 0.89
  },
  explanation: [
    `Perfect emotional match for ${mockEmotions.primaryEmotion.category}`,
    'Excellent style compatibility with vintage preferences',
    'High-quality craftsmanship with attention to detail',
    'Culturally appropriate design elements'
  ].slice(0, 3 + index),
  rank: index + 1
}));

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProposalDemoPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('proposal-preview');

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab('product-detail');
  };

  const handleAddToCart = (product: Product, quantity?: number) => {
    console.log('Add to cart:', product.name, 'Quantity:', quantity || 1);
    // In a real app, this would integrate with cart state/API
  };

  const handleAddToWishlist = (product: Product) => {
    console.log('Add to wishlist:', product.name);
    // In a real app, this would integrate with wishlist state/API
  };

  const handleContactJeweler = (jewelerId: string) => {
    console.log('Contact jeweler:', jewelerId);
    // In a real app, this would open a contact form or messaging interface
  };

  const handleShare = (product: Product) => {
    console.log('Share product:', product.name);
    // In a real app, this would open share options
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Container className="py-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-gemstone-600 bg-clip-text text-transparent">
            Proposal Preview & Browsing Demo
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover how AI matches emotional stories with perfect jewelry pieces
          </p>
        </div>
      </Container>

      {/* Demo Content */}
      <Container className="pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="proposal-preview" className="flex items-center gap-2">
              <Icons.sparkles className="h-4 w-4" />
              Proposal Preview
            </TabsTrigger>
            <TabsTrigger value="emotion-browser" className="flex items-center gap-2">
              <Icons.heart className="h-4 w-4" />
              Emotion Browser
            </TabsTrigger>
            <TabsTrigger value="product-detail" className="flex items-center gap-2">
              <Icons.gem className="h-4 w-4" />
              Product Detail
            </TabsTrigger>
          </TabsList>

          {/* Proposal Preview Tab */}
          <TabsContent value="proposal-preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.sparkles className="h-5 w-5 text-primary" />
                  AI-Generated Proposal Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  This demonstrates how the system shows users their AI-generated sketch alongside 
                  perfectly matched jewelry products based on the emotional analysis of their story.
                </p>
                
                <ProposalPreview
                  sketch={mockSketch}
                  emotions={mockEmotions}
                  matches={mockMatches}
                  onProductSelect={handleProductSelect}
                  onAddToCart={(match) => handleAddToCart(match.product)}
                  onAddToWishlist={(match) => handleAddToWishlist(match.product)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emotion Browser Tab */}
          <TabsContent value="emotion-browser" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.heart className="h-5 w-5 text-red-500" />
                  Emotion-Based Jewelry Browser
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Browse our jewelry collection filtered by emotional themes. Users can explore 
                  pieces that match specific feelings and occasions.
                </p>
                
                <EmotionJewelryBrowser
                  onProductSelect={handleProductSelect}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  emotionFocus="love"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Detail Tab */}
          <TabsContent value="product-detail" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.gem className="h-5 w-5 text-gemstone-600" />
                  Detailed Product View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  {selectedProduct 
                    ? `Viewing details for "${selectedProduct.name}" with emotional context and match analysis.`
                    : 'Select a product from the other tabs to see detailed information with match analysis.'
                  }
                </p>
                
                {selectedProduct ? (
                  <ProductDetailView
                    product={selectedProduct}
                    matchResult={mockMatches.find(m => m.product.id === selectedProduct.id)}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                    onContactJeweler={handleContactJeweler}
                    onShare={handleShare}
                    showMatchDetails={true}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Icons.gem className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a product from the Proposal Preview or Emotion Browser to see its details
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Demo Features Information */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Demo Features Implemented</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  Proposal Preview
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Side-by-side sketch and product view</li>
                  <li>• Emotion analysis display</li>
                  <li>• Match scoring and explanations</li>
                  <li>• Grid/list view toggle</li>
                  <li>• Interactive product selection</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  Emotion Browser
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Filter by 17+ emotion categories</li>
                  <li>• Price range slider</li>
                  <li>• Availability filtering</li>
                  <li>• Search functionality</li>
                  <li>• Sort by multiple criteria</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  Product Detail
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Image gallery with zoom</li>
                  <li>• Match analysis breakdown</li>
                  <li>• Specifications and care info</li>
                  <li>• Add to cart/wishlist</li>
                  <li>• Jeweler contact integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}