import { NextRequest, NextResponse } from 'next/server';
import {
  createEmotionTagService,
  validateEmotionTag,
  TagFilter,
} from '@/lib/services/emotion-tags';
import { rateLimit } from '@/lib/utils/rate-limit';

// Rate limiting
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip ?? 'anonymous';
    const { success, limit, reset, remaining } = await limiter.check(30, identifier);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    const tagService = createEmotionTagService();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filter: TagFilter = {};

    if (searchParams.get('category')) {
      filter.category = searchParams.get('category') as any;
    }
    if (searchParams.get('intensity')) {
      filter.intensity = searchParams.get('intensity') as any;
    }
    if (searchParams.get('isCustom')) {
      filter.isCustom = searchParams.get('isCustom') === 'true';
    }
    if (searchParams.get('search')) {
      filter.search = searchParams.get('search')!;
    }

    // Handle different endpoints
    const action = searchParams.get('action');

    switch (action) {
      case 'search':
        const query = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit') || '20');
        const results = await tagService.searchTags(query, limit);
        return NextResponse.json({ tags: results });

      case 'popular':
        const popularLimit = parseInt(searchParams.get('limit') || '10');
        const popular = await tagService.getPopularTags(popularLimit);
        return NextResponse.json({ tags: popular });

      case 'hierarchy':
        const hierarchy = await tagService.getTagHierarchy();
        return NextResponse.json({ hierarchy });

      case 'stats':
        const tagId = searchParams.get('tagId');
        if (!tagId) {
          return NextResponse.json({ error: 'Tag ID required for stats' }, { status: 400 });
        }
        const stats = await tagService.getTagUsageStats(tagId);
        return NextResponse.json({ stats });

      default:
        // Get all tags with filters
        const tags = await tagService.getTags(filter);
        return NextResponse.json({
          tags,
          total: tags.length,
          filters: filter,
        });
    }
  } catch (error) {
    console.error('Tags API GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip ?? 'anonymous';
    const { success, limit, reset, remaining } = await limiter.check(10, identifier);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    const tagService = createEmotionTagService();
    const body = await request.json();

    // Handle different operations
    const { action } = body;

    switch (action) {
      case 'batch':
        const { operation } = body;
        if (!operation) {
          return NextResponse.json({ error: 'Batch operation required' }, { status: 400 });
        }
        await tagService.batchOperation(operation);
        return NextResponse.json({ success: true });

      case 'merge':
        const { sourceTagIds, targetTagId } = body;
        if (!sourceTagIds || !targetTagId) {
          return NextResponse.json(
            { error: 'Source tag IDs and target tag ID required' },
            { status: 400 }
          );
        }
        await tagService.mergeTags(sourceTagIds, targetTagId);
        return NextResponse.json({ success: true });

      case 'initialize':
        await tagService.initializeDefaultTags();
        return NextResponse.json({ success: true, message: 'Default tags initialized' });

      default:
        // Create new tag
        if (!validateEmotionTag(body)) {
          return NextResponse.json({ error: 'Invalid tag data' }, { status: 400 });
        }

        const newTag = await tagService.createTag(body);
        return NextResponse.json({ tag: newTag }, { status: 201 });
    }
  } catch (error) {
    console.error('Tags API POST error:', error);

    if (error instanceof Error) {
      if (error.message.includes('authenticated')) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return NextResponse.json({ error: 'Tag already exists' }, { status: 409 });
      }
    }

    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip ?? 'anonymous';
    const { success, limit, reset, remaining } = await limiter.check(15, identifier);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    const tagService = createEmotionTagService();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Tag ID required' }, { status: 400 });
    }

    const updatedTag = await tagService.updateTag(id, updates);
    return NextResponse.json({ tag: updatedTag });
  } catch (error) {
    console.error('Tags API PUT error:', error);

    if (error instanceof Error) {
      if (error.message.includes('authenticated')) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip ?? 'anonymous';
    const { success, limit, reset, remaining } = await limiter.check(10, identifier);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    const tagService = createEmotionTagService();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Tag ID required' }, { status: 400 });
    }

    await tagService.deleteTag(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tags API DELETE error:', error);

    if (error instanceof Error) {
      if (error.message.includes('authenticated')) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
