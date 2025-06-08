import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { EmotionCategory, EMOTION_CATEGORIES } from './openai';

// Tag types and interfaces
export interface EmotionTag {
  id: string;
  name: string;
  category: EmotionCategory;
  intensity: 'low' | 'medium' | 'high';
  color: string;
  description?: string;
  isCustom: boolean;
  userId?: string;
  parentTagId?: string;
  metadata: {
    usageCount: number;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    confidence?: number;
  };
}

export interface TagHierarchy {
  id: string;
  name: string;
  children: TagHierarchy[];
  level: number;
  path: string[];
}

export interface TagFilter {
  category?: EmotionCategory;
  intensity?: 'low' | 'medium' | 'high';
  isCustom?: boolean;
  userId?: string;
  isActive?: boolean;
  search?: string;
}

export interface TagBatchOperation {
  operation: 'create' | 'update' | 'delete' | 'merge';
  tagIds: string[];
  data?: Partial<EmotionTag>;
  mergeTargetId?: string;
}

export interface TagUsageStats {
  tagId: string;
  usageCount: number;
  lastUsed: string;
  contexts: string[];
  averageConfidence: number;
}

/**
 * Tag Management Service
 */
export class EmotionTagService {
  private supabase;

  constructor() {
    const cookieStore = cookies();
    this.supabase = createClient(cookieStore);
  }

  /**
   * Get all emotion tags with optional filtering
   */
  async getTags(filter: TagFilter = {}): Promise<EmotionTag[]> {
    let query = this.supabase.from('emotion_tags').select('*').eq('is_active', true);

    // Apply filters
    if (filter.category) {
      query = query.eq('category', filter.category);
    }
    if (filter.intensity) {
      query = query.eq('intensity', filter.intensity);
    }
    if (filter.isCustom !== undefined) {
      query = query.eq('is_custom', filter.isCustom);
    }
    if (filter.userId) {
      query = query.eq('user_id', filter.userId);
    }
    if (filter.search) {
      query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
    }

    const { data, error } = await query.order('usage_count', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch tags: ${error.message}`);
    }

    return data?.map(this.mapDatabaseToTag) || [];
  }

  /**
   * Get tag by ID
   */
  async getTagById(id: string): Promise<EmotionTag | null> {
    const { data, error } = await this.supabase
      .from('emotion_tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch tag: ${error.message}`);
    }

    return data ? this.mapDatabaseToTag(data) : null;
  }

  /**
   * Create a new emotion tag
   */
  async createTag(tag: Omit<EmotionTag, 'id' | 'metadata'>): Promise<EmotionTag> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to create tags');
    }

    const tagData = {
      name: tag.name,
      category: tag.category,
      intensity: tag.intensity,
      color: tag.color,
      description: tag.description,
      is_custom: tag.isCustom,
      user_id: tag.isCustom ? user.id : null,
      parent_tag_id: tag.parentTagId,
      usage_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('emotion_tags')
      .insert(tagData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create tag: ${error.message}`);
    }

    return this.mapDatabaseToTag(data);
  }

  /**
   * Update an existing emotion tag
   */
  async updateTag(id: string, updates: Partial<EmotionTag>): Promise<EmotionTag> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to update tags');
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Map updates to database fields
    if (updates.name) updateData.name = updates.name;
    if (updates.category) updateData.category = updates.category;
    if (updates.intensity) updateData.intensity = updates.intensity;
    if (updates.color) updateData.color = updates.color;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.parentTagId !== undefined) updateData.parent_tag_id = updates.parentTagId;

    const { data, error } = await this.supabase
      .from('emotion_tags')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own custom tags
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update tag: ${error.message}`);
    }

    return this.mapDatabaseToTag(data);
  }

  /**
   * Delete an emotion tag (soft delete)
   */
  async deleteTag(id: string): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to delete tags');
    }

    const { error } = await this.supabase
      .from('emotion_tags')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user can only delete their own custom tags

    if (error) {
      throw new Error(`Failed to delete tag: ${error.message}`);
    }
  }

  /**
   * Get tag hierarchy
   */
  async getTagHierarchy(): Promise<TagHierarchy[]> {
    const tags = await this.getTags();
    return this.buildHierarchy(tags);
  }

  /**
   * Merge multiple tags into one
   */
  async mergeTags(sourceTagIds: string[], targetTagId: string): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to merge tags');
    }

    // Start transaction
    const { error } = await this.supabase.rpc('merge_emotion_tags', {
      source_tag_ids: sourceTagIds,
      target_tag_id: targetTagId,
      user_id: user.id,
    });

    if (error) {
      throw new Error(`Failed to merge tags: ${error.message}`);
    }
  }

  /**
   * Perform batch operations on tags
   */
  async batchOperation(operation: TagBatchOperation): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated for batch operations');
    }

    switch (operation.operation) {
      case 'delete':
        await this.batchDelete(operation.tagIds);
        break;
      case 'update':
        if (operation.data) {
          await this.batchUpdate(operation.tagIds, operation.data);
        }
        break;
      case 'merge':
        if (operation.mergeTargetId) {
          await this.mergeTags(operation.tagIds, operation.mergeTargetId);
        }
        break;
      default:
        throw new Error(`Unsupported batch operation: ${operation.operation}`);
    }
  }

  /**
   * Get tag usage statistics
   */
  async getTagUsageStats(tagId: string): Promise<TagUsageStats> {
    const { data, error } = await this.supabase.rpc('get_tag_usage_stats', { tag_id: tagId });

    if (error) {
      throw new Error(`Failed to get tag usage stats: ${error.message}`);
    }

    return data;
  }

  /**
   * Search tags by name or description
   */
  async searchTags(query: string, limit: number = 20): Promise<EmotionTag[]> {
    const { data, error } = await this.supabase
      .from('emotion_tags')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search tags: ${error.message}`);
    }

    return data?.map(this.mapDatabaseToTag) || [];
  }

  /**
   * Get popular tags
   */
  async getPopularTags(limit: number = 10): Promise<EmotionTag[]> {
    const { data, error } = await this.supabase
      .from('emotion_tags')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get popular tags: ${error.message}`);
    }

    return data?.map(this.mapDatabaseToTag) || [];
  }

  /**
   * Initialize default emotion tags
   */
  async initializeDefaultTags(): Promise<void> {
    const defaultTags = Object.entries(EMOTION_CATEGORIES).map(([category, config]) => ({
      name: category,
      category: category as EmotionCategory,
      intensity: 'medium' as const,
      color: config.color,
      description: `Default ${category} emotion tag`,
      is_custom: false,
      user_id: null,
      parent_tag_id: null,
      usage_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await this.supabase
      .from('emotion_tags')
      .upsert(defaultTags, { onConflict: 'name,category' });

    if (error) {
      throw new Error(`Failed to initialize default tags: ${error.message}`);
    }
  }

  // Private helper methods

  private mapDatabaseToTag(data: any): EmotionTag {
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      intensity: data.intensity,
      color: data.color,
      description: data.description,
      isCustom: data.is_custom,
      userId: data.user_id,
      parentTagId: data.parent_tag_id,
      metadata: {
        usageCount: data.usage_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isActive: data.is_active,
        confidence: data.confidence,
      },
    };
  }

  private buildHierarchy(tags: EmotionTag[]): TagHierarchy[] {
    const tagMap = new Map<string, EmotionTag>();
    const rootTags: TagHierarchy[] = [];

    // Create tag map
    tags.forEach(tag => tagMap.set(tag.id, tag));

    // Build hierarchy
    tags.forEach(tag => {
      if (!tag.parentTagId) {
        // Root tag
        rootTags.push(this.createHierarchyNode(tag, tags, 0, [tag.name]));
      }
    });

    return rootTags;
  }

  private createHierarchyNode(
    tag: EmotionTag,
    allTags: EmotionTag[],
    level: number,
    path: string[]
  ): TagHierarchy {
    const children = allTags
      .filter(t => t.parentTagId === tag.id)
      .map(child => this.createHierarchyNode(child, allTags, level + 1, [...path, child.name]));

    return {
      id: tag.id,
      name: tag.name,
      children,
      level,
      path,
    };
  }

  private async batchDelete(tagIds: string[]): Promise<void> {
    const { error } = await this.supabase
      .from('emotion_tags')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .in('id', tagIds);

    if (error) {
      throw new Error(`Failed to batch delete tags: ${error.message}`);
    }
  }

  private async batchUpdate(tagIds: string[], updates: Partial<EmotionTag>): Promise<void> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Map updates to database fields
    if (updates.name) updateData.name = updates.name;
    if (updates.category) updateData.category = updates.category;
    if (updates.intensity) updateData.intensity = updates.intensity;
    if (updates.color) updateData.color = updates.color;
    if (updates.description !== undefined) updateData.description = updates.description;

    const { error } = await this.supabase.from('emotion_tags').update(updateData).in('id', tagIds);

    if (error) {
      throw new Error(`Failed to batch update tags: ${error.message}`);
    }
  }
}

/**
 * Create emotion tag service instance
 */
export function createEmotionTagService(): EmotionTagService {
  return new EmotionTagService();
}

/**
 * Validate emotion tag data
 */
export function validateEmotionTag(tag: any): tag is Omit<EmotionTag, 'id' | 'metadata'> {
  return (
    tag &&
    typeof tag.name === 'string' &&
    tag.name.trim().length > 0 &&
    typeof tag.category === 'string' &&
    Object.keys(EMOTION_CATEGORIES).includes(tag.category) &&
    typeof tag.intensity === 'string' &&
    ['low', 'medium', 'high'].includes(tag.intensity) &&
    typeof tag.color === 'string' &&
    /^#[0-9A-F]{6}$/i.test(tag.color) &&
    typeof tag.isCustom === 'boolean'
  );
}
