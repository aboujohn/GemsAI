'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Icons } from "@/components/ui/Icons";
import { MainNavigation } from '@/components/ui/navigation';
import { useRouter } from 'next/navigation';

export default function StoryStart() {
  const [inputMethod, setInputMethod] = useState<'voice' | 'text' | null>(null);
  const [story, setStory] = useState('');
  const router = useRouter();

  const handleContinue = () => {
    if (story.trim()) {
      router.push('/story/preview');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-rose-200">
              <Icons.heart className="h-4 w-4 text-rose-500" />
              <span className="text-sm font-medium text-gray-700">Share Your Story</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Tell Us Your
              <span className="block bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                Emotional Story
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Share the emotions, memories, or feelings you want to capture in jewelry. 
              Our AI will understand and transform your story into beautiful designs.
            </p>
          </div>

          {!inputMethod ? (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card 
                className="bg-white/70 backdrop-blur-sm border border-rose-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => setInputMethod('voice')}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icons.mic className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Voice Recording</h3>
                  <p className="text-gray-600">
                    Speak naturally about your emotions and let our AI capture the nuances in your voice.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="bg-white/70 backdrop-blur-sm border border-amber-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => setInputMethod('text')}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icons.edit className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Text Input</h3>
                  <p className="text-gray-600">
                    Write your story and emotions in your own words, taking time to express yourself fully.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-white/70 backdrop-blur-sm border border-rose-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {inputMethod === 'voice' ? <Icons.mic className="h-5 w-5 text-rose-500" /> : <Icons.edit className="h-5 w-5 text-amber-500" />}
                  {inputMethod === 'voice' ? 'Record Your Story' : 'Write Your Story'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {inputMethod === 'voice' ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <Icons.mic className="h-12 w-12 text-white" />
                    </div>
                    <p className="text-gray-600 mb-4">Click to start recording your emotional story</p>
                    <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                      Start Recording
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      placeholder="Share your emotional story here... What feelings, memories, or moments do you want to capture in jewelry?"
                      className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">{story.length} characters</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => setInputMethod(null)}
                        >
                          Back
                        </Button>
                        <Button 
                          onClick={handleContinue}
                          disabled={!story.trim()}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        >
                          Continue
                          <Icons.sparkles className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
