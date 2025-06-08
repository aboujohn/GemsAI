// GemsAI Database TypeScript Definitions
// Auto-generated types for Supabase schema with i18n support

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      // ============================================================================
      // CORE BUSINESS TABLES
      // ============================================================================

      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          role: 'user' | 'jeweler' | 'admin';
          phone: string | null;
          date_of_birth: string | null;
          preferred_language: string;
          email_verified: boolean;
          phone_verified: boolean;
          marketing_consent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'jeweler' | 'admin';
          phone?: string | null;
          date_of_birth?: string | null;
          preferred_language?: string;
          email_verified?: boolean;
          phone_verified?: boolean;
          marketing_consent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'jeweler' | 'admin';
          phone?: string | null;
          date_of_birth?: string | null;
          preferred_language?: string;
          email_verified?: boolean;
          phone_verified?: boolean;
          marketing_consent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_preferred_language_fkey';
            columns: ['preferred_language'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['id'];
          },
        ];
      };

      stories: {
        Row: {
          id: string;
          user_id: string;
          emotion: string | null;
          jewelry_style: string | null;
          material_preference: string | null;
          budget_range: string | null;
          timeline: string | null;
          special_requests: string | null;
          image_urls: string[] | null;
          status: 'draft' | 'submitted' | 'processing' | 'completed';
          ai_analysis: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          emotion?: string | null;
          jewelry_style?: string | null;
          material_preference?: string | null;
          budget_range?: string | null;
          timeline?: string | null;
          special_requests?: string | null;
          image_urls?: string[] | null;
          status?: 'draft' | 'submitted' | 'processing' | 'completed';
          ai_analysis?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          emotion?: string | null;
          jewelry_style?: string | null;
          material_preference?: string | null;
          budget_range?: string | null;
          timeline?: string | null;
          special_requests?: string | null;
          image_urls?: string[] | null;
          status?: 'draft' | 'submitted' | 'processing' | 'completed';
          ai_analysis?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'stories_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };

      sketches: {
        Row: {
          id: string;
          story_id: string;
          image_url: string;
          prompt: string;
          ai_model: string | null;
          generation_params: Json | null;
          variants: string[] | null;
          status: 'generating' | 'completed' | 'failed' | 'archived';
          generation_cost: number | null;
          user_rating: number | null;
          user_feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          image_url: string;
          prompt: string;
          ai_model?: string | null;
          generation_params?: Json | null;
          variants?: string[] | null;
          status?: 'generating' | 'completed' | 'failed' | 'archived';
          generation_cost?: number | null;
          user_rating?: number | null;
          user_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          image_url?: string;
          prompt?: string;
          ai_model?: string | null;
          generation_params?: Json | null;
          variants?: string[] | null;
          status?: 'generating' | 'completed' | 'failed' | 'archived';
          generation_cost?: number | null;
          user_rating?: number | null;
          user_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sketches_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
        ];
      };

      jewelers: {
        Row: {
          id: string;
          user_id: string;
          business_name: string | null;
          business_license: string | null;
          portfolio_url: string | null;
          verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
          verification_documents: string[] | null;
          rating: number;
          total_orders: number;
          response_time_hours: number;
          location_city: string | null;
          location_country: string | null;
          specialties: string[] | null;
          years_experience: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name?: string | null;
          business_license?: string | null;
          portfolio_url?: string | null;
          verification_status?: 'pending' | 'verified' | 'rejected' | 'suspended';
          verification_documents?: string[] | null;
          rating?: number;
          total_orders?: number;
          response_time_hours?: number;
          location_city?: string | null;
          location_country?: string | null;
          specialties?: string[] | null;
          years_experience?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string | null;
          business_license?: string | null;
          portfolio_url?: string | null;
          verification_status?: 'pending' | 'verified' | 'rejected' | 'suspended';
          verification_documents?: string[] | null;
          rating?: number;
          total_orders?: number;
          response_time_hours?: number;
          location_city?: string | null;
          location_country?: string | null;
          specialties?: string[] | null;
          years_experience?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'jewelers_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };

      products: {
        Row: {
          id: string;
          jeweler_id: string;
          sku: string | null;
          price: number | null;
          currency: string;
          images: string[];
          category: string | null;
          materials: string[] | null;
          dimensions: Json | null;
          customizable: boolean;
          lead_time_days: number;
          is_available: boolean;
          inventory_count: number | null;
          emotion_tags: string[] | null;
          style_tags: string[] | null;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          jeweler_id: string;
          sku?: string | null;
          price?: number | null;
          currency?: string;
          images: string[];
          category?: string | null;
          materials?: string[] | null;
          dimensions?: Json | null;
          customizable?: boolean;
          lead_time_days?: number;
          is_available?: boolean;
          inventory_count?: number | null;
          emotion_tags?: string[] | null;
          style_tags?: string[] | null;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          jeweler_id?: string;
          sku?: string | null;
          price?: number | null;
          currency?: string;
          images?: string[];
          category?: string | null;
          materials?: string[] | null;
          dimensions?: Json | null;
          customizable?: boolean;
          lead_time_days?: number;
          is_available?: boolean;
          inventory_count?: number | null;
          emotion_tags?: string[] | null;
          style_tags?: string[] | null;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'products_jeweler_id_fkey';
            columns: ['jeweler_id'];
            isOneToOne: false;
            referencedRelation: 'jewelers';
            referencedColumns: ['id'];
          },
        ];
      };

      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          jeweler_id: string;
          story_id: string | null;
          product_id: string | null;
          status:
            | 'pending'
            | 'confirmed'
            | 'in_progress'
            | 'completed'
            | 'shipped'
            | 'delivered'
            | 'cancelled';
          total_amount: number;
          currency: string;
          payment_id: string | null;
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          shipping_address: Json | null;
          billing_address: Json | null;
          tracking_number: string | null;
          estimated_delivery: string | null;
          actual_delivery: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id: string;
          jeweler_id: string;
          story_id?: string | null;
          product_id?: string | null;
          status?:
            | 'pending'
            | 'confirmed'
            | 'in_progress'
            | 'completed'
            | 'shipped'
            | 'delivered'
            | 'cancelled';
          total_amount: number;
          currency?: string;
          payment_id?: string | null;
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          shipping_address?: Json | null;
          billing_address?: Json | null;
          tracking_number?: string | null;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string;
          jeweler_id?: string;
          story_id?: string | null;
          product_id?: string | null;
          status?:
            | 'pending'
            | 'confirmed'
            | 'in_progress'
            | 'completed'
            | 'shipped'
            | 'delivered'
            | 'cancelled';
          total_amount?: number;
          currency?: string;
          payment_id?: string | null;
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          shipping_address?: Json | null;
          billing_address?: Json | null;
          tracking_number?: string | null;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_jeweler_id_fkey';
            columns: ['jeweler_id'];
            isOneToOne: false;
            referencedRelation: 'jewelers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };

      gifts: {
        Row: {
          id: string;
          sender_id: string;
          recipient_email: string;
          recipient_name: string | null;
          story_id: string | null;
          sketch_id: string | null;
          product_id: string | null;
          message: string | null;
          share_token: string;
          animation_type: string | null;
          voice_message_url: string | null;
          status: 'created' | 'sent' | 'viewed' | 'expired';
          viewed_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_email: string;
          recipient_name?: string | null;
          story_id?: string | null;
          sketch_id?: string | null;
          product_id?: string | null;
          message?: string | null;
          share_token: string;
          animation_type?: string | null;
          voice_message_url?: string | null;
          status?: 'created' | 'sent' | 'viewed' | 'expired';
          viewed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_email?: string;
          recipient_name?: string | null;
          story_id?: string | null;
          sketch_id?: string | null;
          product_id?: string | null;
          message?: string | null;
          share_token?: string;
          animation_type?: string | null;
          voice_message_url?: string | null;
          status?: 'created' | 'sent' | 'viewed' | 'expired';
          viewed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'gifts_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gifts_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gifts_sketch_id_fkey';
            columns: ['sketch_id'];
            isOneToOne: false;
            referencedRelation: 'sketches';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gifts_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };

      // ============================================================================
      // SUPPORTING TABLES
      // ============================================================================

      sketch_product_matches: {
        Row: {
          id: string;
          sketch_id: string;
          product_id: string;
          match_score: number | null;
          match_reasoning: string | null;
          ai_model: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sketch_id: string;
          product_id: string;
          match_score?: number | null;
          match_reasoning?: string | null;
          ai_model?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sketch_id?: string;
          product_id?: string;
          match_score?: number | null;
          match_reasoning?: string | null;
          ai_model?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sketch_product_matches_sketch_id_fkey';
            columns: ['sketch_id'];
            isOneToOne: false;
            referencedRelation: 'sketches';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sketch_product_matches_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };

      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          preferred_styles: string[] | null;
          preferred_materials: string[] | null;
          budget_range: string | null;
          notification_settings: Json | null;
          privacy_settings: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          preferred_styles?: string[] | null;
          preferred_materials?: string[] | null;
          budget_range?: string | null;
          notification_settings?: Json | null;
          privacy_settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          preferred_styles?: string[] | null;
          preferred_materials?: string[] | null;
          budget_range?: string | null;
          notification_settings?: Json | null;
          privacy_settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_preferences_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };

      reviews: {
        Row: {
          id: string;
          user_id: string;
          order_id: string;
          jeweler_id: string;
          product_id: string | null;
          rating: number;
          title: string | null;
          content: string | null;
          images: string[] | null;
          helpful_votes: number;
          verified_purchase: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_id: string;
          jeweler_id: string;
          product_id?: string | null;
          rating: number;
          title?: string | null;
          content?: string | null;
          images?: string[] | null;
          helpful_votes?: number;
          verified_purchase?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_id?: string;
          jeweler_id?: string;
          product_id?: string | null;
          rating?: number;
          title?: string | null;
          content?: string | null;
          images?: string[] | null;
          helpful_votes?: number;
          verified_purchase?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_jeweler_id_fkey';
            columns: ['jeweler_id'];
            isOneToOne: false;
            referencedRelation: 'jewelers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };

      // ============================================================================
      // INTERNATIONALIZATION TABLES
      // ============================================================================

      languages: {
        Row: {
          id: string;
          name: Json;
          direction: 'ltr' | 'rtl';
          is_default: boolean;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: Json;
          direction: 'ltr' | 'rtl';
          is_default?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: Json;
          direction?: 'ltr' | 'rtl';
          is_default?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      translation_metadata: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          language_id: string;
          is_original: boolean;
          translation_status: 'draft' | 'pending' | 'approved' | 'published';
          translator_id: string | null;
          translation_quality_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id: string;
          language_id: string;
          is_original?: boolean;
          translation_status?: 'draft' | 'pending' | 'approved' | 'published';
          translator_id?: string | null;
          translation_quality_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string;
          language_id?: string;
          is_original?: boolean;
          translation_status?: 'draft' | 'pending' | 'approved' | 'published';
          translator_id?: string | null;
          translation_quality_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'translation_metadata_language_id_fkey';
            columns: ['language_id'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['id'];
          },
        ];
      };

      story_translations: {
        Row: {
          id: string;
          story_id: string;
          language_id: string;
          title: string | null;
          content: string;
          summary: string | null;
          emotion_tags: string[] | null;
          seo_title: string | null;
          seo_description: string | null;
          slug: string | null;
          reading_time_minutes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          language_id: string;
          title?: string | null;
          content: string;
          summary?: string | null;
          emotion_tags?: string[] | null;
          seo_title?: string | null;
          seo_description?: string | null;
          slug?: string | null;
          reading_time_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          language_id?: string;
          title?: string | null;
          content?: string;
          summary?: string | null;
          emotion_tags?: string[] | null;
          seo_title?: string | null;
          seo_description?: string | null;
          slug?: string | null;
          reading_time_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'story_translations_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'story_translations_language_id_fkey';
            columns: ['language_id'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['id'];
          },
        ];
      };

      product_translations: {
        Row: {
          id: string;
          product_id: string;
          language_id: string;
          name: string;
          description: string | null;
          short_description: string | null;
          materials_description: string | null;
          care_instructions: string | null;
          style_tags: string[] | null;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          language_id: string;
          name: string;
          description?: string | null;
          short_description?: string | null;
          materials_description?: string | null;
          care_instructions?: string | null;
          style_tags?: string[] | null;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          language_id?: string;
          name?: string;
          description?: string | null;
          short_description?: string | null;
          materials_description?: string | null;
          care_instructions?: string | null;
          style_tags?: string[] | null;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_translations_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_translations_language_id_fkey';
            columns: ['language_id'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['id'];
          },
        ];
      };

      jeweler_translations: {
        Row: {
          id: string;
          jeweler_id: string;
          language_id: string;
          name: string;
          bio: string | null;
          specialties: string[] | null;
          location_description: string | null;
          tagline: string | null;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          jeweler_id: string;
          language_id: string;
          name: string;
          bio?: string | null;
          specialties?: string[] | null;
          location_description?: string | null;
          tagline?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          jeweler_id?: string;
          language_id?: string;
          name?: string;
          bio?: string | null;
          specialties?: string[] | null;
          location_description?: string | null;
          tagline?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'jeweler_translations_jeweler_id_fkey';
            columns: ['jeweler_id'];
            isOneToOne: false;
            referencedRelation: 'jewelers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'jeweler_translations_language_id_fkey';
            columns: ['language_id'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['id'];
          },
        ];
      };

      system_translations: {
        Row: {
          id: string;
          translation_key: string;
          translations: Json;
          context: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          translation_key: string;
          translations: Json;
          context?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          translation_key?: string;
          translations?: Json;
          context?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      enum_translations: {
        Row: {
          id: string;
          enum_type: string;
          enum_value: string;
          translations: Json;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          enum_type: string;
          enum_value: string;
          translations: Json;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          enum_type?: string;
          enum_value?: string;
          translations?: Json;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };

    Views: {
      // Multilingual views with automatic fallback
      stories_multilingual: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          content: string;
          summary: string | null;
          emotion_tags: string[] | null;
          seo_title: string | null;
          seo_description: string | null;
          language_id: string;
          requested_language: string;
          fallback_language: string;
          has_requested_translation: boolean;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };

      products_multilingual: {
        Row: {
          id: string;
          jeweler_id: string;
          price: number | null;
          images: string[] | null;
          name: string;
          description: string | null;
          short_description: string | null;
          materials_description: string | null;
          care_instructions: string | null;
          style_tags: string[] | null;
          seo_title: string | null;
          seo_description: string | null;
          language_id: string;
          requested_language: string;
          fallback_language: string;
          has_requested_translation: boolean;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };

      jewelers_multilingual: {
        Row: {
          id: string;
          user_id: string;
          portfolio_url: string | null;
          name: string;
          bio: string | null;
          specialties: string[] | null;
          location_description: string | null;
          tagline: string | null;
          seo_title: string | null;
          seo_description: string | null;
          language_id: string;
          requested_language: string;
          fallback_language: string;
          has_requested_translation: boolean;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
    };

    Functions: {
      // Translation helper functions
      get_system_translation: {
        Args: {
          translation_key: string;
          language_id?: string;
        };
        Returns: string;
      };

      get_enum_translation: {
        Args: {
          enum_type: string;
          enum_value: string;
          language_id?: string;
        };
        Returns: string;
      };

      get_translation_completeness: {
        Args: {
          entity_type: string;
          entity_id: string;
        };
        Returns: {
          language_id: string;
          language_name: string;
          is_complete: boolean;
          missing_fields: string[];
        }[];
      };

      set_config: {
        Args: {
          setting_name: string;
          new_value: string;
          is_local: boolean;
        };
        Returns: string;
      };

      generate_order_number: {
        Args: {};
        Returns: string;
      };

      generate_share_token: {
        Args: {};
        Returns: string;
      };
    };

    Enums: {
      user_role: 'user' | 'jeweler' | 'admin';
      story_status: 'draft' | 'submitted' | 'processing' | 'completed';
      sketch_status: 'generating' | 'completed' | 'failed' | 'archived';
      verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
      order_status:
        | 'pending'
        | 'confirmed'
        | 'in_progress'
        | 'completed'
        | 'shipped'
        | 'delivered'
        | 'cancelled';
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
      gift_status: 'created' | 'sent' | 'viewed' | 'expired';
      translation_status: 'draft' | 'pending' | 'approved' | 'published';
      text_direction: 'ltr' | 'rtl';
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ============================================================================
// TYPE HELPERS
// ============================================================================

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
        Database['public']['Views'])
    ? (Database['public']['Tables'] &
        Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof Database['public']['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never;

// ============================================================================
// CONVENIENCE TYPE EXPORTS
// ============================================================================

// Core business types
export type User = Tables<'users'>;
export type Story = Tables<'stories'>;
export type Sketch = Tables<'sketches'>;
export type Jeweler = Tables<'jewelers'>;
export type Product = Tables<'products'>;
export type Order = Tables<'orders'>;
export type Gift = Tables<'gifts'>;

// Supporting types
export type SketchProductMatch = Tables<'sketch_product_matches'>;
export type UserPreferences = Tables<'user_preferences'>;
export type Review = Tables<'reviews'>;

// Multilingual types
export type StoryMultilingual = Tables<'stories_multilingual'>;
export type ProductMultilingual = Tables<'products_multilingual'>;
export type JewelerMultilingual = Tables<'jewelers_multilingual'>;

// i18n types
export type Language = Tables<'languages'>;
export type SystemTranslation = Tables<'system_translations'>;
export type EnumTranslation = Tables<'enum_translations'>;

// Insert types
export type UserInsert = TablesInsert<'users'>;
export type StoryInsert = TablesInsert<'stories'>;
export type SketchInsert = TablesInsert<'sketches'>;
export type ProductInsert = TablesInsert<'products'>;
export type OrderInsert = TablesInsert<'orders'>;
export type GiftInsert = TablesInsert<'gifts'>;

// Update types
export type UserUpdate = TablesUpdate<'users'>;
export type StoryUpdate = TablesUpdate<'stories'>;
export type SketchUpdate = TablesUpdate<'sketches'>;
export type ProductUpdate = TablesUpdate<'products'>;
export type OrderUpdate = TablesUpdate<'orders'>;
export type GiftUpdate = TablesUpdate<'gifts'>;

// Enum types
export type UserRole = Enums<'user_role'>;
export type StoryStatus = Enums<'story_status'>;
export type SketchStatus = Enums<'sketch_status'>;
export type VerificationStatus = Enums<'verification_status'>;
export type OrderStatus = Enums<'order_status'>;
export type PaymentStatus = Enums<'payment_status'>;
export type GiftStatus = Enums<'gift_status'>;
