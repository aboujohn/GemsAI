'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, X, Tag, Heart, Star, Filter } from 'lucide-react';
import { EmotionTag, EmotionCategory, EMOTION_CATEGORIES } from '@/lib/types/emotions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface EmotionTagSelectorProps {
  selectedTags: EmotionTag[];
  onTagsChange: (tags: EmotionTag[]) => void;
  availableTags: EmotionTag[];
  onCreateTag?: (tag: Omit<EmotionTag, 'id' | 'metadata'>) => void;
  maxTags?: number;
  className?: string;
  placeholder?: string;
  showCreateButton?: boolean;
  allowCustomTags?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
}

interface DraggedTag {
  tag: EmotionTag;
  offsetX: number;
  offsetY: number;
}

export function EmotionTagSelector({
  selectedTags,
  onTagsChange,
  availableTags,
  onCreateTag,
  maxTags = 10,
  className,
  placeholder = 'Search emotion tags...',
  showCreateButton = true,
  allowCustomTags = true,
  size = 'md',
  variant = 'default',
}: EmotionTagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTags, setFilteredTags] = useState<EmotionTag[]>([]);
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);
  const [draggedTag, setDraggedTag] = useState<DraggedTag | null>(null);
  const [activeCategory, setActiveCategory] = useState<EmotionCategory | 'all'>('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            searchInputRef.current?.focus();
            break;
          case 'n':
            if (showCreateButton) {
              e.preventDefault();
              // Trigger create tag modal
            }
            break;
        }
      }

      if (e.key === 'Escape') {
        setSearchQuery('');
        setActiveCategory('all');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showCreateButton]);

  // Filter tags based on search and category
  useEffect(() => {
    let filtered = availableTags;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        tag =>
          tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(tag => tag.category === activeCategory);
    }

    // Apply favorites filter
    if (showFavorites) {
      filtered = filtered.filter(tag => favorites.includes(tag.id));
    }

    // Exclude already selected tags
    filtered = filtered.filter(tag => !selectedTags.some(selected => selected.id === tag.id));

    setFilteredTags(filtered);
  }, [searchQuery, activeCategory, showFavorites, availableTags, selectedTags, favorites]);

  const handleTagSelect = useCallback(
    (tag: EmotionTag) => {
      if (selectedTags.length >= maxTags) return;
      onTagsChange([...selectedTags, tag]);
    },
    [selectedTags, maxTags, onTagsChange]
  );

  const handleTagRemove = useCallback(
    (tagId: string) => {
      onTagsChange(selectedTags.filter(tag => tag.id !== tagId));
    },
    [selectedTags, onTagsChange]
  );

  const handleDragStart = (tag: EmotionTag, e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedTag({
      tag,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', tag.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDropZoneActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (!rect) return;

    const { clientX, clientY } = e;
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setIsDropZoneActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropZoneActive(false);

    if (draggedTag && selectedTags.length < maxTags) {
      handleTagSelect(draggedTag.tag);
    }
    setDraggedTag(null);
  };

  const toggleFavorite = (tagId: string) => {
    setFavorites(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const getTagIcon = (category: EmotionCategory) => {
    const icons = {
      love: Heart,
      joy: Star,
      // Add more category-specific icons
    };
    return icons[category] || Tag;
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const TagComponent = ({
    tag,
    isDraggable = true,
    onRemove,
  }: {
    tag: EmotionTag;
    isDraggable?: boolean;
    onRemove?: () => void;
  }) => {
    const IconComponent = getTagIcon(tag.category);

    return (
      <Badge
        key={tag.id}
        variant="secondary"
        className={cn(
          'flex items-center gap-1 cursor-pointer transition-all duration-200',
          'hover:scale-105 hover:shadow-md',
          sizeClasses[size],
          isDraggable && 'cursor-grab active:cursor-grabbing'
        )}
        style={{
          backgroundColor: tag.color + '20',
          borderColor: tag.color,
          color: tag.color,
        }}
        draggable={isDraggable}
        onDragStart={isDraggable ? e => handleDragStart(tag, e) : undefined}
        onClick={!isDraggable ? onRemove : undefined}
      >
        <IconComponent size={12} />
        <span>{tag.name}</span>
        {!isDraggable && onRemove && (
          <X
            size={12}
            className="hover:text-red-500 cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              onRemove();
            }}
          />
        )}
        {favorites.includes(tag.id) && <Star size={10} className="fill-current" />}
      </Badge>
    );
  };

  if (variant === 'compact') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn('w-full justify-start', className)}>
            <Tag className="mr-2 h-4 w-4" />
            {selectedTags.length > 0
              ? `${selectedTags.length} tags selected`
              : 'Select emotion tags...'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="start">
          <EmotionTagSelector
            {...{
              selectedTags,
              onTagsChange,
              availableTags,
              onCreateTag,
              maxTags,
              placeholder,
              showCreateButton,
              allowCustomTags,
              size,
            }}
            variant="default"
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={showFavorites ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFavorites(!showFavorites)}
          >
            <Star className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <h4 className="font-medium">Filter by Category</h4>
                <div className="space-y-1">
                  <Button
                    variant={activeCategory === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveCategory('all')}
                  >
                    All Categories
                  </Button>
                  {Object.keys(EMOTION_CATEGORIES).map(category => (
                    <Button
                      key={category}
                      variant={activeCategory === category ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setActiveCategory(category as EmotionCategory)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Selected Tags Drop Zone */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">
              Selected Tags ({selectedTags.length}/{maxTags})
            </h3>
            {selectedTags.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => onTagsChange([])}>
                Clear All
              </Button>
            )}
          </div>

          <div
            ref={dropZoneRef}
            className={cn(
              'min-h-[80px] p-3 border-2 border-dashed rounded-lg transition-colors',
              isDropZoneActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50',
              selectedTags.length === 0 && 'flex items-center justify-center'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedTags.length === 0 ? (
              <p className="text-gray-500 text-center">Drag tags here or click to select</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <TagComponent
                    key={tag.id}
                    tag={tag}
                    isDraggable={false}
                    onRemove={() => handleTagRemove(tag.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Tags */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Available Tags</h3>
            {showCreateButton && onCreateTag && (
              <Button
                size="sm"
                onClick={() => {
                  /* Open create modal */
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            )}
          </div>

          <Tabs value={activeCategory} onValueChange={value => setActiveCategory(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="love">Primary</TabsTrigger>
              <TabsTrigger value="joy">Secondary</TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory} className="mt-4">
              {filteredTags.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {searchQuery ? 'No tags found matching your search' : 'No tags available'}
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {filteredTags.map(tag => (
                    <div
                      key={tag.id}
                      className="relative group"
                      onClick={() => handleTagSelect(tag)}
                    >
                      <TagComponent tag={tag} />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        onClick={e => {
                          e.stopPropagation();
                          toggleFavorite(tag.id);
                        }}
                      >
                        <Star
                          className={cn(
                            'h-3 w-3',
                            favorites.includes(tag.id)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-400'
                          )}
                        />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>
          <kbd className="bg-gray-100 px-1 rounded">Ctrl+F</kbd> Focus search
        </p>
        <p>
          <kbd className="bg-gray-100 px-1 rounded">Ctrl+N</kbd> Create new tag
        </p>
        <p>
          <kbd className="bg-gray-100 px-1 rounded">Esc</kbd> Clear filters
        </p>
      </div>
    </div>
  );
}
