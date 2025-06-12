'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-rose-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">💎</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
            GemsAI
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/jeweler/dashboard">
            <button className="text-gray-700 hover:text-rose-600 px-4 py-2 rounded-md transition-colors">
              For Jewelers
            </button>
          </Link>
          <Link href="/auth/login">
            <button className="border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-md transition-colors">
              Sign In
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-rose-200">
            <span className="text-amber-500">✨</span>
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
            <button 
              onClick={() => setShowVoiceModal(true)}
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              🎤 Start with Voice
            </button>
            <Link href="/story/new">
              <button className="border-2 border-rose-300 text-rose-600 hover:bg-rose-50 px-8 py-4 rounded-full transition-all duration-300">
                Tell Your Story →
              </button>
            </Link>
            <Link href="/products">
              <button className="border-2 border-amber-300 text-amber-600 hover:bg-amber-50 px-8 py-4 rounded-full transition-all duration-300">
                🔍 Browse Jewelry
              </button>
            </Link>
          </div>

          {/* Demo Placeholder */}
          <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-sm border border-rose-200 shadow-xl rounded-lg">
            <div className="p-8">
              <div className="aspect-video bg-gradient-to-br from-rose-100 to-amber-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-amber-500/10"></div>
                <button className="bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full shadow-lg p-4">
                  <span className="text-4xl text-rose-600">▶️</span>
                </button>
                <div className="absolute bottom-4 left-4 text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  Watch how emotions become jewelry
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            How GemsAI Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/70 backdrop-blur-sm border border-rose-200 hover:shadow-lg transition-all duration-300 rounded-lg">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">❤️</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Share Your Emotions</h3>
                <p className="text-gray-600">
                  Use voice or text to tell your story. Our AI detects emotions and sentiment in real-time.
                </p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-amber-200 hover:shadow-lg transition-all duration-300 rounded-lg">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">✨</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">AI Design Magic</h3>
                <p className="text-gray-600">
                  Watch as your emotions transform into beautiful, personalized jewelry sketches and designs.
                </p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-orange-200 hover:shadow-lg transition-all duration-300 rounded-lg">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">💎</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Create & Share</h3>
                <p className="text-gray-600">
                  Turn designs into real jewelry or digital gifts that capture and preserve your emotions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center bg-white/70 backdrop-blur-sm border border-rose-200 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready to Begin Your Journey?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Join thousands of users who have transformed their emotions into beautiful jewelry
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/auth/signup">
              <button className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300">
                Get Started Free
              </button>
            </Link>
            <Link href="/story-submission-demo">
              <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-full font-semibold transition-all duration-300">
                Try Demo
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Voice Assistant Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Voice Assistant</h3>
            <p className="text-gray-600 mb-4">
              Voice recording feature is ready! You can access it through the story creation page.
            </p>
            <div className="flex space-x-4">
              <Link href="/story/new">
                <button 
                  className="bg-rose-500 text-white px-4 py-2 rounded-md hover:bg-rose-600 transition-colors"
                  onClick={() => setShowVoiceModal(false)}
                >
                  Go to Story Creation
                </button>
              </Link>
              <button 
                onClick={() => setShowVoiceModal(false)}
                className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-rose-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-6 w-6 bg-rose-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💎</span>
              </div>
              <span className="font-semibold text-gray-800">GemsAI</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link href="/about" className="hover:text-rose-600 transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-rose-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-rose-600 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-rose-600 transition-colors">Contact</Link>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-4">
            © 2025 GemsAI. Transforming emotions into meaningful jewelry.
          </div>
        </div>
      </footer>
    </div>
  );
}