'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/Icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  GiftType, 
  PrivacyLevel, 
  CreateGiftRequest,
  GiftCreatorProps,
  AnimationCategory,
  GiftAnimation
} from '@/lib/types/gifts';
import AnimationSelector from '@/components/ui/animation-selector';
import { useTextToSpeech } from '@/lib/hooks/useTextToSpeech';

// ============================================================================
// CONSTANTS AND DATA
// ============================================================================

const GIFT_TYPES: Array<{ value: GiftType; label: string; description: string; icon: string }> = [
  {
    value: 'jewelry_story',
    label: 'Story with Jewelry',
    description: 'Share your story with AI-generated sketch and product recommendations',
    icon: 'sparkles'
  },
  {
    value: 'jewelry_piece',
    label: 'Specific Jewelry',
    description: 'Gift a specific jewelry piece you\'ve found',
    icon: 'gem'
  },
  {
    value: 'wish_story',
    label: 'Wish Story',
    description: 'Share a story for someone else to help fulfill',
    icon: 'heart'
  },
  {
    value: 'custom_message',
    label: 'Custom Message',
    description: 'Send a heartfelt message with beautiful animations',
    icon: 'messageSquare'
  }
];

const PRIVACY_LEVELS: Array<{ value: PrivacyLevel; label: string; description: string; icon: string }> = [
  {
    value: 'private',
    label: 'Private',
    description: 'Only you and the recipient can view',
    icon: 'lock'
  },
  {
    value: 'unlisted',
    label: 'Unlisted',
    description: 'Anyone with the link can view',
    icon: 'link'
  },
  {
    value: 'family',
    label: 'Family',
    description: 'Family members can view',
    icon: 'home'
  },
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can discover and view',
    icon: 'globe'
  }
];

const MESSAGE_TEMPLATES = {
  hebrew: [
    {
      occasion: 'יום הולדת',
      template: 'יום הולדת שמח! שתזכה לשנה מלאה בשמחה, בריאות ואהבה. 🎂✨',
      english: 'Happy Birthday! May you have a year full of joy, health and love.'
    },
    {
      occasion: 'אהבה',
      template: 'אהבתי, את/ה האור שבחיי. תודה שאת/ה קיים/ת. ❤️',
      english: 'My love, you are the light of my life. Thank you for existing.'
    },
    {
      occasion: 'הודיה',
      template: 'תודה רבה על כל מה שאת/ה עושה. את/ה אדם מדהים! 🙏',
      english: 'Thank you so much for everything you do. You are an amazing person!'
    },
    {
      occasion: 'חתונה',
      template: 'מזל טוב! שתזכו לבית נאמן בישראל ולאושר עד סוף הימים! 💍',
      english: 'Congratulations! May you merit a faithful home in Israel and happiness forever!'
    },
    {
      occasion: 'חג',
      template: 'חג שמח! שיהיה לכם חג מלא בשמחה ואהבה עם המשפחה. 🕯️',
      english: 'Happy Holiday! May you have a holiday full of joy and love with family.'
    }
  ],
  english: [
    {
      occasion: 'Birthday',
      template: 'Happy Birthday! Wishing you a wonderful year ahead filled with love and laughter! 🎉',
      english: 'Happy Birthday! Wishing you a wonderful year ahead filled with love and laughter!'
    },
    {
      occasion: 'Love',
      template: 'You mean the world to me. Thank you for being the amazing person you are. ❤️',
      english: 'You mean the world to me. Thank you for being the amazing person you are.'
    },
    {
      occasion: 'Gratitude',
      template: 'I\'m so grateful to have you in my life. Thank you for everything! 🙏',
      english: 'I\'m so grateful to have you in my life. Thank you for everything!'
    },
    {
      occasion: 'Congratulations',
      template: 'Congratulations on your special achievement! You deserve all the happiness! 🎊',
      english: 'Congratulations on your special achievement! You deserve all the happiness!'
    },
    {
      occasion: 'Thinking of You',
      template: 'Just wanted you to know that you\'re in my thoughts and prayers. 💭',
      english: 'Just wanted you to know that you\'re in my thoughts and prayers.'
    }
  ]
};

// ============================================================================
// VOICE RECORDER COMPONENT
// ============================================================================

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  className?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, className }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        onRecordingComplete(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Icons.mic className="h-4 w-4" />
            Start Recording
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Icons.micOff className="h-4 w-4" />
            Stop Recording ({formatTime(recordingTime)})
          </Button>
        )}
      </div>

      {audioBlob && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Icons.volume2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Recording Complete</span>
          </div>
          <audio controls className="w-full">
            <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
          </audio>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MESSAGE TEMPLATES COMPONENT
// ============================================================================

interface MessageTemplatesProps {
  language: 'hebrew' | 'english';
  onTemplateSelect: (template: string) => void;
  className?: string;
}

const MessageTemplates: React.FC<MessageTemplatesProps> = ({ language, onTemplateSelect, className }) => {
  const templates = MESSAGE_TEMPLATES[language];

  return (
    <div className={cn('space-y-3', className)}>
      <Label className="text-sm font-medium">Quick Templates</Label>
      <div className="grid gap-2 max-h-48 overflow-y-auto">
        {templates.map((template, index) => (
          <button
            key={index}
            onClick={() => onTemplateSelect(template.template)}
            className="text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <div className="font-medium text-sm mb-1">{template.occasion}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {template.template}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN GIFT CREATOR COMPONENT
// ============================================================================

export const GiftCreator: React.FC<GiftCreatorProps> = ({
  initialData,
  onGiftCreated,
  className
}) => {
  const [formData, setFormData] = useState<CreateGiftRequest>({
    title: '',
    message: '',
    gift_type: 'custom_message',
    privacy_level: 'private',
    animation_id: '',
    recipient_email: '',
    recipient_name: '',
    ...initialData
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [messageLanguage, setMessageLanguage] = useState<'hebrew' | 'english'>('english');
  const [messageType, setMessageType] = useState<'text' | 'voice'>('text');
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedAnimation, setSelectedAnimation] = useState<GiftAnimation | null>(null);
  
  // TTS functionality
  const [ttsState, ttsControls] = useTextToSpeech();
  const [useTextToSpeechForVoice, setUseTextToSpeechForVoice] = useState(false);

  const updateFormData = (field: keyof CreateGiftRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title?.trim()) {
          newErrors.title = 'Title is required';
        }
        if (!formData.gift_type) {
          newErrors.gift_type = 'Gift type is required';
        }
        break;
      case 2:
        if (messageType === 'text' && !formData.message?.trim()) {
          newErrors.message = 'Message is required';
        }
        if (messageType === 'voice' && !voiceBlob && !ttsState.audioBlob) {
          newErrors.voice_message = 'Voice recording or text-to-speech is required';
        }
        break;
      case 3:
        if (!selectedAnimation) {
          newErrors.animation_id = 'Animation selection is required';
        }
        break;
      case 4:
        if (!formData.privacy_level) {
          newErrors.privacy_level = 'Privacy level is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Here you would call your API to create the gift
      const giftData = {
        ...formData,
        animation_id: selectedAnimation?.id || '',
        voice_message_file: voiceBlob || ttsState.audioBlob || undefined
      };

      console.log('Creating gift:', giftData);
      
      // Mock success response
      const mockGift = {
        id: 'gift-' + Date.now(),
        ...formData,
        share_token: 'share-' + Math.random().toString(36).substr(2, 9),
        share_url: `${window.location.origin}/gift/share-${Math.random().toString(36).substr(2, 9)}`,
        view_count: 0,
        reaction_count: 0,
        status: 'sent' as const,
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (onGiftCreated) {
        onGiftCreated(mockGift);
      }
    } catch (error) {
      console.error('Error creating gift:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCharacterCount = () => {
    return formData.message?.length || 0;
  };

  const getCharacterLimit = () => {
    return formData.gift_type === 'custom_message' ? 500 : 1000;
  };

  return (
    <div className={cn('max-w-4xl mx-auto space-y-6', className)}>
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              {step < currentStep ? (
                <Icons.check className="h-4 w-4" />
              ) : (
                step
              )}
            </div>
            {step < 4 && (
              <div className={cn(
                'h-px w-16 ml-2',
                step < currentStep ? 'bg-primary' : 'bg-muted'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Gift Type & Basic Info */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.gift className="h-5 w-5 text-primary" />
              Create Your Gift
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Gift Title</Label>
              <Input
                id="title"
                placeholder="e.g., Happy Birthday Mom!, Anniversary Surprise"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                error={errors.title}
              />
            </div>

            {/* Gift Type Selection */}
            <div className="space-y-3">
              <Label>Gift Type</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {GIFT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => updateFormData('gift_type', type.value)}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-colors',
                      formData.gift_type === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {type.icon === 'sparkles' && <Icons.sparkles className="h-5 w-5 text-primary" />}
                      {type.icon === 'gem' && <Icons.gem className="h-5 w-5 text-primary" />}
                      {type.icon === 'heart' && <Icons.heart className="h-5 w-5 text-primary" />}
                      {type.icon === 'messageSquare' && <Icons.messageSquare className="h-5 w-5 text-primary" />}
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </button>
                ))}
              </div>
              {errors.gift_type && (
                <p className="text-sm text-destructive">{errors.gift_type}</p>
              )}
            </div>

            {/* Recipient Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient_name">Recipient Name (Optional)</Label>
                <Input
                  id="recipient_name"
                  placeholder="Who is this gift for?"
                  value={formData.recipient_name || ''}
                  onChange={(e) => updateFormData('recipient_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient_email">Recipient Email (Optional)</Label>
                <Input
                  id="recipient_email"
                  type="email"
                  placeholder="their@email.com"
                  value={formData.recipient_email || ''}
                  onChange={(e) => updateFormData('recipient_email', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNext}>
                Next
                <Icons.arrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Message Creation */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.messageSquare className="h-5 w-5 text-primary" />
              Your Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={messageType} onValueChange={(value) => setMessageType(value as 'text' | 'voice')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Icons.edit className="h-4 w-4" />
                  Text Message
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex items-center gap-2">
                  <Icons.mic className="h-4 w-4" />
                  Voice Message
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                {/* Language Selection */}
                <div className="flex items-center gap-4">
                  <Label>Language:</Label>
                  <Select
                    value={messageLanguage}
                    onValueChange={(value) => setMessageLanguage(value as 'hebrew' | 'english')}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hebrew">עברית</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Message Input */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea
                      id="message"
                      placeholder={messageLanguage === 'hebrew' 
                        ? 'כתבו כאן את המסר שלכם...'
                        : 'Write your heartfelt message here...'
                      }
                      value={formData.message}
                      onChange={(e) => updateFormData('message', e.target.value)}
                      className={cn(
                        'min-h-32 resize-none',
                        messageLanguage === 'hebrew' && 'text-right font-hebrew'
                      )}
                      dir={messageLanguage === 'hebrew' ? 'rtl' : 'ltr'}
                      maxLength={getCharacterLimit()}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{getCharacterCount()}/{getCharacterLimit()} characters</span>
                      {errors.message && (
                        <span className="text-destructive">{errors.message}</span>
                      )}
                    </div>
                  </div>

                  {/* Templates */}
                  <MessageTemplates
                    language={messageLanguage}
                    onTemplateSelect={(template) => updateFormData('message', template)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="voice" className="space-y-4">
                {/* Voice Method Selection */}
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={!useTextToSpeechForVoice ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setUseTextToSpeechForVoice(false);
                      ttsControls.clearAudio();
                    }}
                  >
                    <Icons.mic className="h-4 w-4 mr-2" />
                    Record Voice
                  </Button>
                  <Button
                    type="button"
                    variant={useTextToSpeechForVoice ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setUseTextToSpeechForVoice(true);
                      setVoiceBlob(null);
                    }}
                  >
                    <Icons.volume2 className="h-4 w-4 mr-2" />
                    Text-to-Speech
                  </Button>
                </div>

                {!useTextToSpeechForVoice ? (
                  <>
                    {/* Voice Recording */}
                    <VoiceRecorder
                      onRecordingComplete={(blob) => setVoiceBlob(blob)}
                    />
                  </>
                ) : (
                  <>
                    {/* Text-to-Speech */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Convert your message to voice using AI</Label>
                      <p className="text-sm text-muted-foreground">
                        Enter text below and we'll create a natural-sounding voice message in Hebrew
                      </p>
                    </div>

                    {/* TTS Input */}
                    <div className="space-y-2">
                      <Label htmlFor="tts-text">Text for Voice Message</Label>
                      <Textarea
                        id="tts-text"
                        placeholder={messageLanguage === 'hebrew' 
                          ? 'כתבו כאן את המסר שתרצו להפוך לקול...'
                          : 'Write your message here to convert to voice...'
                        }
                        value={formData.message}
                        onChange={(e) => updateFormData('message', e.target.value)}
                        className={cn(
                          'min-h-24 resize-none',
                          messageLanguage === 'hebrew' && 'text-right font-hebrew'
                        )}
                        dir={messageLanguage === 'hebrew' ? 'rtl' : 'ltr'}
                        maxLength={500}
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formData.message?.length || 0}/500 characters</span>
                      </div>
                    </div>

                    {/* TTS Controls */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          if (formData.message?.trim()) {
                            ttsControls.generateSpeech(formData.message, {
                              language: messageLanguage,
                              saveToStorage: true
                            });
                          }
                        }}
                        disabled={!formData.message?.trim() || ttsState.isGenerating}
                        size="sm"
                      >
                        {ttsState.isGenerating ? (
                          <>
                            <Icons.loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Icons.volume2 className="h-4 w-4 mr-2" />
                            Generate Voice
                          </>
                        )}
                      </Button>

                      {ttsState.audioUrl && (
                        <>
                          <Button
                            type="button"
                            onClick={ttsState.isPlaying ? ttsControls.pauseAudio : ttsControls.playAudio}
                            variant="outline"
                            size="sm"
                          >
                            {ttsState.isPlaying ? (
                              <Icons.pause className="h-4 w-4" />
                            ) : (
                              <Icons.play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            onClick={ttsControls.clearAudio}
                            variant="outline"
                            size="sm"
                          >
                            <Icons.trash className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* TTS Result */}
                    {ttsState.audioUrl && (
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Icons.volume2 className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm">Voice Message Generated</span>
                          {ttsState.voiceInfo && (
                            <Badge variant="outline" className="text-xs">
                              {ttsState.voiceInfo.name}
                            </Badge>
                          )}
                        </div>
                        <audio controls className="w-full">
                          <source src={ttsState.audioUrl} type="audio/mpeg" />
                        </audio>
                        {ttsState.duration && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Duration: {Math.round(ttsState.duration)}s
                          </p>
                        )}
                      </div>
                    )}

                    {/* TTS Error */}
                    {ttsState.error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">{ttsState.error}</p>
                      </div>
                    )}
                  </div>
                  </>
                )}

                {errors.voice_message && (
                  <p className="text-sm text-destructive">{errors.voice_message}</p>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <Icons.arrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext}>
                Next
                <Icons.arrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Animation Selection */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.sparkles className="h-5 w-5 text-primary" />
              Choose Animation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimationSelector
              selectedAnimation={selectedAnimation}
              onAnimationSelect={(animation) => {
                setSelectedAnimation(animation);
                updateFormData('animation_id', animation.id);
              }}
            />

            {selectedAnimation && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.check className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Animation Selected</span>
                </div>
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedAnimation.thumbnail_url} 
                    alt={selectedAnimation.name}
                    className="w-16 h-10 rounded object-cover"
                  />
                  <div>
                    <p className="font-medium text-sm">{selectedAnimation.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedAnimation.category} • {(selectedAnimation.duration_ms / 1000).toFixed(1)}s
                    </p>
                  </div>
                </div>
              </div>
            )}

            {errors.animation_id && (
              <p className="text-sm text-destructive">{errors.animation_id}</p>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <Icons.arrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext}>
                Next
                <Icons.arrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Privacy & Final Review */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.shield className="h-5 w-5 text-primary" />
              Privacy & Share Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Privacy Level Selection */}
            <div className="space-y-3">
              <Label>Privacy Level</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {PRIVACY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => updateFormData('privacy_level', level.value)}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-colors',
                      formData.privacy_level === level.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {level.icon === 'lock' && <Icons.lock className="h-5 w-5 text-primary" />}
                      {level.icon === 'link' && <Icons.link className="h-5 w-5 text-primary" />}
                      {level.icon === 'home' && <Icons.home className="h-5 w-5 text-primary" />}
                      {level.icon === 'globe' && <Icons.globe className="h-5 w-5 text-primary" />}
                      <span className="font-medium">{level.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </button>
                ))}
              </div>
              {errors.privacy_level && (
                <p className="text-sm text-destructive">{errors.privacy_level}</p>
              )}
            </div>

            {/* Gift Preview */}
            <div className="border rounded-lg p-6 bg-muted/30">
              <h3 className="font-medium mb-4">Gift Preview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title:</span>
                  <span>{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{GIFT_TYPES.find(t => t.value === formData.gift_type)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Message:</span>
                  <span className="max-w-xs truncate">
                    {messageType === 'text' ? formData.message : 'Voice message attached'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Privacy:</span>
                  <span>{PRIVACY_LEVELS.find(p => p.value === formData.privacy_level)?.label}</span>
                </div>
                {formData.recipient_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">For:</span>
                    <span>{formData.recipient_name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                <Icons.arrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Icons.loader2 className="h-4 w-4 animate-spin" />
                    Creating Gift...
                  </>
                ) : (
                  <>
                    <Icons.gift className="h-4 w-4" />
                    Create Gift
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GiftCreator;