'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StoryShareDialog, { ShareData } from '@/components/forms/StoryShareDialog';
import StorySocialActions from '@/components/forms/StorySocialActions';
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Users,
  Globe,
  Lock,
  Clock,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export default function SocialDemoPage() {
  // Demo state
  const [stories] = useState([
    {
      id: '1',
      title: 'A Ring for My Grandmother\'s Memory',
      content: 'This ring represents the love and wisdom my grandmother shared with our family. She always wore a simple gold band that belonged to her mother, and I want to create something that honors that legacy while adding my own touch...',
      author: 'Sarah M.',
      emotionTags: ['Love', 'Memory', 'Family'],
      styleTags: ['Classic', 'Elegant'],
      likeCount: 24,
      commentCount: 8,
      shareCount: 5,
      viewCount: 156,
      isLiked: false,
      isPublic: true,
      createdAt: '2 hours ago',
    },
    {
      id: '2',
      title: 'Engagement Ring with Cultural Heritage',
      content: 'I want to propose with a ring that reflects both our cultures. She\'s from Morocco and I\'m from Ireland, so I\'m thinking of incorporating traditional patterns from both...',
      author: 'Michael K.',
      emotionTags: ['Love', 'Romance', 'Heritage'],
      styleTags: ['Traditional', 'Cultural', 'Modern'],
      likeCount: 18,
      commentCount: 12,
      shareCount: 3,
      viewCount: 89,
      isLiked: true,
      isPublic: true,
      createdAt: '5 hours ago',
    },
    {
      id: '3',
      title: 'Healing Bracelet After Loss',
      content: 'After losing my father, I want to create a bracelet that helps me feel connected to him. He was a carpenter and loved working with his hands...',
      author: 'Emma L.',
      emotionTags: ['Healing', 'Memory', 'Strength'],
      styleTags: ['Minimalist', 'Organic'],
      likeCount: 31,
      commentCount: 15,
      shareCount: 8,
      viewCount: 203,
      isLiked: false,
      isPublic: false,
      createdAt: '1 day ago',
    },
  ]);

  const [socialStats, setSocialStats] = useState({
    totalStories: 1247,
    totalLikes: 8934,
    totalShares: 2156,
    activeUsers: 456,
  });

  // Demo handlers
  const handleLike = async (storyId: string) => {
    console.log('Liking story:', storyId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleUnlike = async (storyId: string) => {
    console.log('Unliking story:', storyId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleComment = (storyId: string) => {
    console.log('Opening comments for story:', storyId);
    // Would open comment dialog/section
  };

  const handleShare = async (storyId: string, shareData: ShareData) => {
    console.log('Sharing story:', storyId, shareData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleViewLikes = (storyId: string) => {
    console.log('Viewing likes for story:', storyId);
    // Would open likes dialog
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Story Sharing & Social Features Demo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore how users can share their jewelry stories and interact with the community through likes, comments, and sharing.
          </p>
        </div>

        {/* Platform Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{socialStats.totalStories.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Stories Shared</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{socialStats.totalLikes.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{socialStats.totalShares.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Stories Shared</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{socialStats.activeUsers}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Story Feed */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Community Stories
          </h2>

          {stories.map((story) => (
            <Card key={story.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{story.title}</h3>
                      {story.isPublic ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>by {story.author}</span>
                      <span>•</span>
                      <span>{story.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">{story.viewCount}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Story Content */}
                <p className="text-muted-foreground leading-relaxed">
                  {story.content}
                </p>

                {/* Tags */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {story.emotionTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-red-600">
                        <Heart className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {story.styleTags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-purple-600">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Social Actions */}
                <div className="flex items-center justify-between">
                  <StorySocialActions
                    storyId={story.id}
                    storyTitle={story.title}
                    likeCount={story.likeCount}
                    commentCount={story.commentCount}
                    shareCount={story.shareCount}
                    viewCount={story.viewCount}
                    isLiked={story.isLiked}
                    isPublic={story.isPublic}
                    onLike={() => handleLike(story.id)}
                    onUnlike={() => handleUnlike(story.id)}
                    onComment={() => handleComment(story.id)}
                    onShare={(shareData) => handleShare(story.id, shareData)}
                    onViewLikes={() => handleViewLikes(story.id)}
                  />

                  {/* Additional Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Connect with Jeweler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Showcase */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Sharing Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Globe className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-medium">Public Sharing</h4>
                    <p className="text-sm text-muted-foreground">Share with the entire community</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Private Sharing</h4>
                    <p className="text-sm text-muted-foreground">Share with specific people via email</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <h4 className="font-medium">Temporary Links</h4>
                    <p className="text-sm text-muted-foreground">Time-limited sharing with expiration</p>
                  </div>
                </div>
              </div>

              <StoryShareDialog
                storyId="demo"
                storyTitle="Demo Story"
                onShare={async (shareData) => {
                  console.log('Demo share:', shareData);
                }}
              >
                <Button className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Try Sharing Demo
                </Button>
              </StoryShareDialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Social Interactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div>
                    <h4 className="font-medium">Likes & Reactions</h4>
                    <p className="text-sm text-muted-foreground">Express appreciation for stories</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Comments</h4>
                    <p className="text-sm text-muted-foreground">Engage in meaningful conversations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Eye className="h-5 w-5 text-purple-500" />
                  <div>
                    <h4 className="font-medium">View Tracking</h4>
                    <p className="text-sm text-muted-foreground">See how many people viewed your story</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Try Social Actions:</h4>
                <StorySocialActions
                  storyId="demo"
                  storyTitle="Demo Story"
                  likeCount={42}
                  commentCount={8}
                  shareCount={12}
                  viewCount={156}
                  isLiked={false}
                  isPublic={true}
                  onLike={async () => console.log('Demo like')}
                  onUnlike={async () => console.log('Demo unlike')}
                  onComment={() => console.log('Demo comment')}
                  onShare={async (shareData) => console.log('Demo share:', shareData)}
                  onViewLikes={() => console.log('Demo view likes')}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Endpoints Info */}
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Story Management:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• GET /api/stories - List stories</li>
                  <li>• POST /api/stories - Create story</li>
                  <li>• PUT /api/stories - Update story</li>
                  <li>• DELETE /api/stories - Delete story</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Social Features:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• POST /api/stories/[id]/like - Like story</li>
                  <li>• DELETE /api/stories/[id]/like - Unlike story</li>
                  <li>• POST /api/stories/[id]/share - Share story</li>
                  <li>• GET /api/stories/[id]/share - Get shares</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 