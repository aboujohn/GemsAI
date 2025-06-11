'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Icons } from '@/components/ui/Icons';
// import { VoiceAssistant } from '@/components/ui/voice-assistant';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useTranslation } from '@/lib/hooks/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { t, isRTL, getDirectionalClass } = useTranslation(['common', 'stories']);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50">
      {/* Header */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Icons.gem className="h-8 w-8 text-rose-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
            GemsAI
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              className="text-gray-700 hover:text-rose-600"
            >
              For Jewelers
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-rose-200">
            <Icons.sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">AI-Powered Emotional Jewelry</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Transform Your
            <span className="block bg-gradient-to-r from-rose-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Story into Jewelry
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Share your emotions through voice or text, and watch as AI transforms your feelings 
            into personalized jewelry designs and meaningful digital gifts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Button 
              onClick={() => setShowVoiceAssistant(true)}
              size="lg" 
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Icons.mic className="mr-2 h-5 w-5" />
              Start with Voice
            </Button>
            <Link href="/story/new">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-rose-300 text-rose-600 hover:bg-rose-50 px-8 py-4 rounded-full transition-all duration-300"
              >
                Tell Your Story
                <Icons.arrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard/stories">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-amber-300 text-amber-600 hover:bg-amber-50 px-8 py-4 rounded-full transition-all duration-300"
              >
                <Icons.search className="mr-2 h-5 w-5" />
                Browse Jewelry
              </Button>
            </Link>
          </div>

          {/* Demo Video Placeholder */}
          <Card className="max-w-3xl mx-auto bg-white/70 backdrop-blur-sm border border-rose-200 shadow-xl">
            <CardContent className="p-8">
              <div className="aspect-video bg-gradient-to-br from-rose-100 to-amber-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-amber-500/10"></div>
                <Button
                  variant="ghost"
                  size="lg"
                  className="bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full shadow-lg"
                >
                  <Icons.play className="h-8 w-8 text-rose-600" />
                </Button>
                <div className="absolute bottom-4 left-4 text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  Watch how emotions become jewelry
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            How GemsAI Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/70 backdrop-blur-sm border border-rose-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Share Your Emotions</h3>
                <p className="text-gray-600">
                  Use voice or text to tell your story. Our AI detects emotions and sentiment in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border border-amber-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">AI Design Magic</h3>
                <p className="text-gray-600">
                  Watch as your emotions transform into beautiful, personalized jewelry sketches and designs.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border border-orange-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.gem className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Create & Share</h3>
                <p className="text-gray-600">
                  Turn designs into real jewelry or digital gifts that capture and preserve your emotions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Voice Assistant Modal */}
      {showVoiceAssistant && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Voice Assistant (Coming Soon)</h3>
            <p className="text-gray-600 mb-4">The voice assistant feature will be available soon!</p>
            <Button onClick={() => setShowVoiceAssistant(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
