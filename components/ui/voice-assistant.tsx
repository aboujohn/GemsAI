'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Icons } from "@/components/ui/Icons";

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryComplete: () => void;
}

export const VoiceAssistant = ({ isOpen, onClose, onStoryComplete }: VoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantMessage, setAssistantMessage] = useState("Hi! I'm here to help you transform your story into beautiful jewelry. What's on your heart today?");
  const [step, setStep] = useState<'intro' | 'listening' | 'processing' | 'complete'>('intro');

  const handleStartListening = () => {
    setIsListening(true);
    setStep('listening');
    setAssistantMessage("I'm listening... share whatever feels meaningful to you.");
    
    // Simulate voice recognition (replace with actual implementation)
    setTimeout(() => {
      setTranscript("I want to create something special for my grandmother who always believed in me...");
      setStep('processing');
      setAssistantMessage("I can feel the love and gratitude in your words. Let me help you create something beautiful from this emotion.");
    }, 3000);

    setTimeout(() => {
      setStep('complete');
      setAssistantMessage("Perfect! I've captured the emotions from your story. Ready to see your jewelry design?");
    }, 6000);
  };

  const handleStopListening = () => {
    setIsListening(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-rose-50 to-amber-50 border-rose-200">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-2xl font-bold text-gray-800">
            <div className="flex items-center space-x-2">
              <Icons.heart className="h-6 w-6 text-rose-500" />
              <span>Voice Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <Icons.x className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assistant Message */}
          <Card className="bg-white/70 backdrop-blur-sm border border-rose-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icons.volume2 className="h-4 w-4 text-white" />
                </div>
                <p className="text-gray-700 leading-relaxed">{assistantMessage}</p>
              </div>
            </CardContent>
          </Card>

          {/* Voice Controls */}
          <div className="text-center space-y-4">
            {step === 'intro' && (
              <Button
                onClick={handleStartListening}
                size="lg"
                className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Icons.mic className="mr-2 h-6 w-6" />
                Start Sharing Your Story
              </Button>
            )}

            {step === 'listening' && (
              <div className="space-y-4">
                <div className="relative">
                  <Button
                    onClick={handleStopListening}
                    size="lg"
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 rounded-full shadow-lg animate-pulse"
                  >
                    <Icons.micOff className="mr-2 h-6 w-6" />
                    Stop Recording
                  </Button>
                  {/* Animated rings */}
                  <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
                  <div className="absolute inset-2 rounded-full border-2 border-red-200 animate-ping animation-delay-75"></div>
                </div>
                <p className="text-sm text-gray-600">Speak naturally - I'm here to listen</p>
              </div>
            )}

            {step === 'processing' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full flex items-center justify-center mx-auto animate-spin">
                  <Icons.heart className="h-8 w-8 text-white" />
                </div>
                <p className="text-sm text-gray-600">Analyzing emotions and sentiment...</p>
              </div>
            )}

            {step === 'complete' && (
              <Button
                onClick={onStoryComplete}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Icons.heart className="mr-2 h-6 w-6" />
                See My Jewelry Design
              </Button>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <Card className="bg-white/70 backdrop-blur-sm border border-amber-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Your Story:</h4>
                <p className="text-gray-700 italic">"{transcript}"</p>
              </CardContent>
            </Card>
          )}

          {/* Emotion Preview */}
          {step === 'complete' && (
            <Card className="bg-white/70 backdrop-blur-sm border border-green-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Detected Emotions:</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">Love</span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">Gratitude</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Nostalgia</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Hope</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};