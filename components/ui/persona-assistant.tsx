'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Avatar } from './avatar';
import { Badge } from './badge';
import { PersonaId, PersonaTemplate, AssistantResponse } from '@/lib/types/assistant';
import { getAllPersonaTemplates } from '@/lib/services/persona-templates';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  persona?: PersonaId;
}

interface PersonaAssistantProps {
  sessionId?: string;
  language?: 'he' | 'en' | 'ar';
  initialPersona?: PersonaId;
  onMessageSent?: (message: string, response: AssistantResponse) => void;
}

export function PersonaAssistant({
  sessionId = `session_${Date.now()}`,
  language = 'he',
  initialPersona = 'gift-explorer',
  onMessageSent,
}: PersonaAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<PersonaId>(initialPersona);
  const [personas, setPersonas] = useState<PersonaTemplate[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load personas on mount
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const response = await fetch('/api/assistant/personas');
        const result = await response.json();
        if (result.success) {
          setPersonas(result.data);
        }
      } catch (error) {
        console.error('Error loading personas:', error);
        // Fallback to client-side personas
        setPersonas(getAllPersonaTemplates());
      }
    };
    loadPersonas();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send initial greeting when persona changes
  useEffect(() => {
    if (personas.length > 0 && messages.length === 0) {
      sendGreeting();
    }
  }, [currentPersona, personas]);

  const sendGreeting = () => {
    const persona = personas.find(p => p.id === currentPersona);
    if (!persona) return;

    const greetings = persona.conversationPatterns.greeting[language];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    const assistantMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
      persona: currentPersona,
    };

    setMessages([assistantMessage]);
  };

  const handlePersonaSwitch = async (newPersona: PersonaId) => {
    if (newPersona === currentPersona) return;

    try {
      const response = await fetch('/api/assistant/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          personaId: newPersona,
          reason: 'user_selection',
        }),
      });

      if (response.ok) {
        setCurrentPersona(newPersona);

        // Send transition message
        const persona = personas.find(p => p.id === newPersona);
        if (persona) {
          const greetings = persona.conversationPatterns.greeting[language];
          const greeting = greetings[Math.floor(Math.random() * greetings.length)];

          const transitionMessage: Message = {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: greeting,
            timestamp: new Date(),
            persona: newPersona,
          };

          setMessages(prev => [...prev, transitionMessage]);
        }
      }
    } catch (error) {
      console.error('Error switching persona:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          personaId: currentPersona,
          language,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const assistantResponse: AssistantResponse = result.data;

        const assistantMessage: Message = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: assistantResponse.content,
          timestamp: new Date(),
          persona: assistantResponse.persona,
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Update persona if suggested
        if (
          assistantResponse.suggestedPersona &&
          assistantResponse.suggestedPersona !== currentPersona
        ) {
          setCurrentPersona(assistantResponse.suggestedPersona);
        }

        // Call callback if provided
        onMessageSent?.(userMessage.content, assistantResponse);
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content:
          language === 'he'
            ? 'מצטער, נתקלתי בבעיה. אפשר לנסות שוב?'
            : language === 'ar'
              ? 'آسف، واجهت مشكلة. هل يمكنك المحاولة مرة أخرى؟'
              : 'Sorry, I encountered an error. Could you try again?',
        timestamp: new Date(),
        persona: currentPersona,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentPersonaTemplate = personas.find(p => p.id === currentPersona);

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto border rounded-lg bg-white shadow-lg">
      {/* Header with persona selector */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">
            {language === 'he'
              ? 'יועץ התכשיטים האישי'
              : language === 'ar'
                ? 'مستشار المجوهرات الشخصي'
                : 'Personal Jewelry Assistant'}
          </h3>
          {currentPersonaTemplate && (
            <Badge variant="secondary">{currentPersonaTemplate.name[language]}</Badge>
          )}
        </div>

        {/* Persona selector */}
        <div className="flex gap-2 overflow-x-auto">
          {personas.map(persona => (
            <Button
              key={persona.id}
              variant={persona.id === currentPersona ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePersonaSwitch(persona.id)}
              className="whitespace-nowrap"
            >
              {persona.name[language]}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start gap-3 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <Avatar className="w-8 h-8">
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center text-white text-sm ${
                    message.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}
                >
                  {message.role === 'user' ? 'U' : 'A'}
                </div>
              </Avatar>

              <div
                className={`p-3 rounded-lg ${
                  message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <div className="w-full h-full rounded-full bg-purple-500 flex items-center justify-center text-white text-sm">
                  A
                </div>
              </Avatar>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              language === 'he'
                ? 'כתב הודעה...'
                : language === 'ar'
                  ? 'اكتب رسالة...'
                  : 'Type a message...'
            }
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!inputValue.trim() || isLoading} className="px-6">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : language === 'he' ? (
              'שלח'
            ) : language === 'ar' ? (
              'إرسال'
            ) : (
              'Send'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
