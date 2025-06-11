// ============================================================================
// GIFT SYSTEM TYPES
// ============================================================================

export interface Gift {
  id: string;
  sender_id: string;
  sender_name?: string;
  sender_email?: string;
  recipient_id?: string;
  recipient_name?: string;
  recipient_email?: string;
  
  // Gift Content
  message: string;
  voice_message_url?: string;
  animation_id: string;
  product_id?: string;
  sketch_id?: string;
  
  // Metadata
  title: string;
  description?: string;
  gift_type: GiftType;
  privacy_level: PrivacyLevel;
  
  // Sharing & Access
  share_token: string;
  share_url: string;
  is_public: boolean;
  view_count: number;
  reaction_count: number;
  
  // Timing
  created_at: string;
  updated_at: string;
  scheduled_delivery?: string;
  expires_at?: string;
  viewed_at?: string;
  
  // Status
  status: GiftStatus;
  is_favorite: boolean;
}

export interface GiftAnimation {
  id: string;
  name: string;
  description: string;
  file_path: string;
  thumbnail_url: string;
  preview_url?: string;
  
  // Categories and Tags
  category: AnimationCategory;
  tags: string[];
  style: AnimationStyle;
  
  // Metadata
  duration_ms: number;
  file_size_bytes: number;
  is_premium: boolean;
  is_featured: boolean;
  
  // Usage stats
  usage_count: number;
  rating: number;
  
  created_at: string;
  updated_at: string;
}

export interface GiftReaction {
  id: string;
  gift_id: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  
  reaction_type: ReactionType;
  message?: string;
  emoji?: string;
  
  created_at: string;
  ip_address?: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  is_default: boolean;
  
  items: WishlistItem[];
  
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  product_id?: string;
  sketch_id?: string;
  gift_id?: string;
  
  title: string;
  description?: string;
  notes?: string;
  priority: WishlistPriority;
  
  // Custom fields
  price_range?: [number, number];
  preferred_materials?: string[];
  preferred_styles?: string[];
  
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  gift_id: string;
  notes?: string;
  created_at: string;
}

export interface GiftNotification {
  id: string;
  user_id: string;
  gift_id?: string;
  
  type: NotificationType;
  title: string;
  message: string;
  
  is_read: boolean;
  is_email_sent: boolean;
  is_push_sent: boolean;
  
  action_url?: string;
  metadata?: Record<string, any>;
  
  created_at: string;
  read_at?: string;
}

// ============================================================================
// ENUMS AND TYPES
// ============================================================================

export type GiftType = 
  | 'jewelry_story'      // Story + AI sketch + product recommendations
  | 'jewelry_piece'      // Specific jewelry product
  | 'wish_story'         // Story for someone else to fulfill
  | 'custom_message'     // Pure message with animation
  | 'wishlist_share';    // Shared wishlist

export type PrivacyLevel = 
  | 'public'             // Anyone with link can view
  | 'unlisted'          // Only people with link can view
  | 'private'           // Only sender and recipient
  | 'family'            // Family members only
  | 'friends';          // Friends only

export type GiftStatus = 
  | 'draft'             // Being created
  | 'scheduled'         // Scheduled for future delivery
  | 'sent'              // Active and viewable
  | 'viewed'            // Recipient has viewed
  | 'expired'           // Past expiration date
  | 'archived'          // Archived by sender
  | 'blocked';          // Blocked for policy violation

export type AnimationCategory = 
  | 'romantic'          // Love, romance, Valentine's
  | 'celebration'       // Birthday, anniversary, achievement
  | 'holiday'           // Christmas, Hanukkah, New Year
  | 'family'            // Mother's Day, Father's Day, family occasions
  | 'friendship'        // Friendship, gratitude, support
  | 'seasonal'          // Spring, summer, fall, winter themes
  | 'elegant'           // Sophisticated, luxury animations
  | 'playful'           // Fun, colorful, energetic
  | 'spiritual'         // Religious, spiritual themes
  | 'minimalist';       // Simple, clean animations

export type AnimationStyle = 
  | 'particles'         // Particle effects
  | 'floral'           // Flower and nature themes
  | 'geometric'        // Geometric patterns
  | 'watercolor'       // Artistic watercolor effects
  | 'sparkles'         // Glitter and sparkle effects
  | 'ribbon'           // Ribbon and bow animations
  | 'heart'            // Heart-themed animations
  | 'star'             // Star and celestial themes
  | 'wave'             // Wave and fluid animations
  | 'confetti';        // Confetti and celebration effects

export type ReactionType = 
  | 'love'             // ❤️
  | 'wow'              // 😮
  | 'laugh'            // 😂
  | 'cry'              // 😢
  | 'angry'            // 😠
  | 'grateful'         // 🙏
  | 'excited'          // 🎉
  | 'surprised';       // 😲

export type WishlistPriority = 
  | 'low'
  | 'medium' 
  | 'high'
  | 'urgent';

export type NotificationType = 
  | 'gift_received'     // Someone sent you a gift
  | 'gift_viewed'       // Your gift was viewed
  | 'gift_reaction'     // Someone reacted to your gift
  | 'wishlist_update'   // Someone added to your wishlist
  | 'gift_reminder'     // Reminder for scheduled gift
  | 'gift_expiring'     // Gift expiring soon
  | 'system_update';    // System notifications

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateGiftRequest {
  recipient_email?: string;
  recipient_name?: string;
  title: string;
  message: string;
  voice_message_file?: File;
  animation_id: string;
  product_id?: string;
  sketch_id?: string;
  gift_type: GiftType;
  privacy_level: PrivacyLevel;
  scheduled_delivery?: string;
  expires_at?: string;
}

export interface CreateGiftResponse {
  gift: Gift;
  share_url: string;
  success: boolean;
  message?: string;
}

export interface GiftViewResponse {
  gift: Gift;
  animation: GiftAnimation;
  product?: any; // Product type from database
  sketch?: any;  // Sketch type from database
  sender_info: {
    name: string;
    avatar?: string;
  };
  can_react: boolean;
  user_reaction?: ReactionType;
}

export interface GiftListResponse {
  gifts: Gift[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AnimationListResponse {
  animations: GiftAnimation[];
  total: number;
  categories: AnimationCategory[];
  featured: GiftAnimation[];
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface GiftCreatorProps {
  initialData?: Partial<CreateGiftRequest>;
  onGiftCreated?: (gift: Gift) => void;
  className?: string;
}

export interface GiftViewerProps {
  shareToken: string;
  className?: string;
}

export interface AnimationSelectorProps {
  selectedAnimation?: GiftAnimation;
  onAnimationSelect: (animation: GiftAnimation) => void;
  category?: AnimationCategory;
  style?: AnimationStyle;
  className?: string;
}

export interface WishlistManagerProps {
  userId: string;
  className?: string;
}

export interface GiftReactionButtonProps {
  gift: Gift;
  currentReaction?: ReactionType;
  onReactionChange: (reaction: ReactionType | null) => void;
  className?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface GiftFilterOptions {
  status?: GiftStatus[];
  gift_type?: GiftType[];
  privacy_level?: PrivacyLevel[];
  date_from?: string;
  date_to?: string;
  search_query?: string;
}

export interface AnimationFilterOptions {
  category?: AnimationCategory[];
  style?: AnimationStyle[];
  is_premium?: boolean;
  is_featured?: boolean;
  duration_range?: [number, number];
  search_query?: string;
}

// ============================================================================
// CULTURAL CONTEXT
// ============================================================================

export interface CulturalGiftData {
  hebrew_animations: AnimationCategory[];
  jewish_holidays: {
    name: string;
    date: string;
    recommended_animations: string[];
    traditional_messages: string[];
  }[];
  hebrew_message_templates: {
    occasion: string;
    template: string;
    english_translation: string;
  }[];
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  Gift,
  GiftAnimation,
  GiftReaction,
  Wishlist,
  WishlistItem,
  UserFavorite,
  GiftNotification,
  CreateGiftRequest,
  CreateGiftResponse,
  GiftViewResponse,
  GiftListResponse,
  AnimationListResponse,
  GiftCreatorProps,
  GiftViewerProps,
  AnimationSelectorProps,
  WishlistManagerProps,
  GiftReactionButtonProps,
  GiftFilterOptions,
  AnimationFilterOptions,
  CulturalGiftData
};