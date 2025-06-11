import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StoryContextType {
  inputMethod: 'choice' | 'voice' | 'text';
  setInputMethod: (method: 'choice' | 'voice' | 'text') => void;
  selectedPersona: string | null;
  setSelectedPersona: (persona: string | null) => void;
  storyText: string;
  setStoryText: (text: string) => void;
  emotions: string[];
  setEmotions: (emotions: string[]) => void;
  currentStep: 'start' | 'input' | 'preview' | 'confirm' | 'sketch';
  setCurrentStep: (step: 'start' | 'input' | 'preview' | 'confirm' | 'sketch') => void;
  storyMetadata: {
    language: string;
    isRTL: boolean;
    duration?: number;
    wordCount: number;
  };
  setStoryMetadata: (metadata: Partial<StoryContextType['storyMetadata']>) => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

interface StoryProviderProps {
  children: ReactNode;
}

export const StoryProvider = ({ children }: StoryProviderProps) => {
  const [inputMethod, setInputMethod] = useState<'choice' | 'voice' | 'text'>('choice');
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [storyText, setStoryText] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'start' | 'input' | 'preview' | 'confirm' | 'sketch'>('start');
  const [storyMetadata, setStoryMetadataState] = useState({
    language: 'en',
    isRTL: false,
    wordCount: 0,
  });

  const setStoryMetadata = (metadata: Partial<StoryContextType['storyMetadata']>) => {
    setStoryMetadataState(prev => ({ ...prev, ...metadata }));
  };

  const value = {
    inputMethod,
    setInputMethod,
    selectedPersona,
    setSelectedPersona,
    storyText,
    setStoryText,
    emotions,
    setEmotions,
    currentStep,
    setCurrentStep,
    storyMetadata,
    setStoryMetadata,
  };

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
};