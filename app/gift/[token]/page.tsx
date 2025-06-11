'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/Icons';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { GiftViewResponse, ReactionType } from '@/lib/types/gifts';

interface GiftPageProps {
  params: Promise<{ token: string }>;
}

const REACTION_EMOJIS: Record<ReactionType, string> = {
  love: '❤️',
  wow: '😮',
  laugh: '😂',
  cry: '😢',
  angry: '😠',
  grateful: '🙏',
  excited: '🎉',
  surprised: '😲'
};

const REACTION_LABELS: Record<ReactionType, string> = {
  love: 'Love',
  wow: 'Wow',
  laugh: 'Laugh',
  cry: 'Touching',
  angry: 'Angry',
  grateful: 'Grateful',
  excited: 'Excited',
  surprised: 'Surprised'
};

export default function GiftPage({ params }: GiftPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [gift, setGift] = useState<GiftViewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [isSubmittingReaction, setIsSubmittingReaction] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  useEffect(() => {
    fetchGift();
  }, [resolvedParams.token]);

  const fetchGift = async () => {
    try {
      const response = await fetch(`/api/gifts/share/${resolvedParams.token}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load gift');
      }

      const data: GiftViewResponse = await response.json();
      setGift(data);
      setUserReaction(data.user_reaction);
    } catch (err) {
      console.error('Error fetching gift:', err);
      setError(err instanceof Error ? err.message : 'Failed to load gift');
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (reactionType: ReactionType) => {
    if (!gift || isSubmittingReaction) return;

    setIsSubmittingReaction(true);
    try {
      const response = await fetch('/api/gifts/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          share_token: resolvedParams.token,
          reaction_type: reactionType
        })
      });

      if (response.ok) {
        setUserReaction(reactionType);
        // Update reaction count
        setGift(prev => prev ? {
          ...prev,
          gift: {
            ...prev.gift,
            reaction_count: prev.gift.reaction_count + (userReaction ? 0 : 1)
          }
        } : null);
      }
    } catch (err) {
      console.error('Error submitting reaction:', err);
    } finally {
      setIsSubmittingReaction(false);
    }
  };

  const handleFavorite = async () => {
    if (!gift) return;

    try {
      await fetch(`/api/gifts/share/${resolvedParams.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add' })
      });
    } catch (err) {
      console.error('Error adding to favorites:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icons.loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your gift...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Icons.alertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Unable to Load Gift</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!gift) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-black/20 rounded-full backdrop-blur-sm">
            <Icons.gift className="h-5 w-5 text-primary" />
            <span className="font-medium">You've received a gift</span>
          </div>
        </div>

        {/* Main Gift Card */}
        <Card className="mb-8 overflow-hidden">
          {/* Gift Animation Preview */}
          {gift.animation && (
            <div className="relative h-64 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Icons.sparkles className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-lg font-medium">{gift.animation.name}</p>
                  <p className="text-sm opacity-90">{gift.animation.category}</p>
                </div>
              </div>
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 border-white/50"
                  variant="outline"
                >
                  <Icons.play className="h-6 w-6 mr-2" />
                  Play Animation
                </Button>
              </div>
            </div>
          )}

          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">{gift.gift.title}</CardTitle>
            {gift.gift.gift_type && (
              <Badge variant="secondary" className="mx-auto">
                {gift.gift.gift_type.replace('_', ' ').toUpperCase()}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Sender Info */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Avatar className="h-12 w-12">
                {gift.sender_info.avatar ? (
                  <img src={gift.sender_info.avatar} alt={gift.sender_info.name} />
                ) : (
                  <div className="bg-primary text-primary-foreground flex items-center justify-center">
                    {gift.sender_info.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Avatar>
              <div>
                <p className="font-medium">From {gift.sender_info.name}</p>
                <p className="text-sm text-muted-foreground">
                  Sent on {formatDate(gift.gift.created_at)}
                </p>
              </div>
            </div>

            {/* Message */}
            {gift.gift.message && (
              <div className="space-y-2">
                <h3 className="font-medium">Message</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{gift.gift.message}</p>
                </div>
              </div>
            )}

            {/* Voice Message */}
            {gift.gift.voice_message_url && (
              <div className="space-y-2">
                <h3 className="font-medium">Voice Message</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <audio controls className="w-full">
                    <source src={gift.gift.voice_message_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            )}

            {/* Product */}
            {gift.product && (
              <div className="space-y-2">
                <h3 className="font-medium">Featured Product</h3>
                <div className="flex gap-4 p-4 bg-muted rounded-lg">
                  {gift.product.images?.[0] && (
                    <img 
                      src={gift.product.images[0]} 
                      alt="Product"
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">Beautiful Jewelry Piece</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {gift.product.price} {gift.product.currency}
                    </p>
                    <Button size="sm">View Details</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Sketch */}
            {gift.sketch && (
              <div className="space-y-2">
                <h3 className="font-medium">AI-Generated Sketch</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <img 
                    src={gift.sketch.image_url} 
                    alt="AI Generated Sketch"
                    className="w-full max-w-md mx-auto rounded"
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Reactions */}
            {gift.can_react && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">How does this make you feel?</h3>
                  {gift.gift.reaction_count > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReactions(!showReactions)}
                    >
                      {gift.gift.reaction_count} reaction{gift.gift.reaction_count !== 1 ? 's' : ''}
                      <Icons.chevronDown className={cn(
                        "h-4 w-4 ml-1 transition-transform",
                        showReactions && "rotate-180"
                      )} />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                    <button
                      key={type}
                      onClick={() => handleReaction(type as ReactionType)}
                      disabled={isSubmittingReaction}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors",
                        "hover:bg-muted hover:border-primary",
                        userReaction === type 
                          ? "bg-primary/10 border-primary" 
                          : "bg-background border-border"
                      )}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-xs">{REACTION_LABELS[type as ReactionType]}</span>
                    </button>
                  ))}
                </div>

                {userReaction && (
                  <p className="text-sm text-muted-foreground text-center">
                    You reacted with {REACTION_EMOJIS[userReaction]} {REACTION_LABELS[userReaction]}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button onClick={handleFavorite} variant="outline">
                <Icons.heart className="h-4 w-4 mr-2" />
                Save to Favorites
              </Button>
              <Button variant="outline">
                <Icons.share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Powered by GemsAI - Transforming stories into meaningful jewelry</p>
        </div>
      </div>
    </div>
  );
}