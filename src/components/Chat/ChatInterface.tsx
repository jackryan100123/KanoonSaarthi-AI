import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic, MicOff, Trash, Scale } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import Button from '../ui/Button';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeechService } from '../../services/speechService';

// Custom type declarations for SpeechRecognition API
interface SpeechRecognitionResult {
  readonly transcript: string;
  readonly confidence: number;
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// Extend the Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const ChatInterface: React.FC = () => {
  const { t } = useTranslation();
  const { 
    currentConversation, 
    sendMessage, 
    loading, 
    clearConversation
  } = useChat();
  
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const speechService = useRef(new SpeechService());

  useEffect(() => {
    setIsSpeechSupported(speechService.current.isSupported());
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, loading]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inputValue.trim() || loading) return;

    const messageText = inputValue.trim();
    setInputValue(''); // Clear input immediately

    try {
      await sendMessage(messageText);
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally restore the input value on error
      setInputValue(messageText);
    }
  };

  const toggleListening = async () => {
    if (!isSpeechSupported) {
      console.warn('Speech recognition not available');
      return;
    }

    try {
      if (isListening) {
        speechService.current.stopListening();
        setIsListening(false);
      } else {
        speechService.current.startListening(
          (result) => {
            setInputValue(prev => prev + result.text);
          },
          (error) => {
            console.error('Speech recognition error:', error);
            setIsListening(false);
          }
        );
        setIsListening(true);
      }
    } catch (error) {
      console.error('Error with speech recognition:', error);
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl overflow-hidden border border-primary-100">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIj48cGF0aCBkPSJtMCAwaDYwdjYwaC02MHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJtMCA2MGg2MG0tMzAtNjB2NjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9Ii4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-10"></div>
        <div className="relative flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t('app.name')}</h2>
              <p className="text-primary-100 text-sm">{t('app.tagline')}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20 backdrop-blur-sm"
            icon={<Trash className="h-4 w-4" />}
            onClick={clearConversation}
          >
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-primary-50/30 to-white scroll-smooth"
      >
        {currentConversation?.messages && currentConversation.messages.length > 0 ? (
          currentConversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[80%]">
                <ChatMessage message={message} />
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Scale className="h-12 w-12 mx-auto mb-4 text-primary-400" />
              <p className="text-lg font-medium">{t('chat.welcome') || 'Welcome to Legal AI Assistant'}</p>
              <p className="text-sm mt-2">{t('chat.startConversation') || 'Start a conversation by typing your legal question below'}</p>
            </div>
          </div>
        )}
        
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-start"
            >
              <div className="max-w-[80%]">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-primary-100 p-6 bg-gradient-to-r from-primary-50 to-secondary-50">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder') || 'Ask your legal question...'}
              className="w-full resize-none border-2 border-primary-200 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-500"
              rows={1}
              disabled={loading}
            />
            {isListening && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </motion.div>
            )}
          </div>
          
          <div className="flex space-x-2">
            {isSpeechSupported && (
              <Button
                type="button"
                variant={isListening ? 'danger' : 'outline'}
                className={`!border-2 ${isListening 
                  ? '!bg-red-500 !border-red-500 !text-white' 
                  : '!border-primary-300 !text-primary-600 hover:!bg-primary-50'
                }`}
                onClick={toggleListening}
                icon={isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                aria-label={isListening ? t('chat.listening') : t('chat.voice')}
                title={isListening ? 'Stop listening' : 'Start voice input'}
                disabled={loading}
              >
                {isListening ? 'Listening...' : ''}
              </Button>
            )}
            <Button
              type="submit"
              disabled={!inputValue.trim() || loading}
              isLoading={loading}
              className="!bg-gradient-to-r !from-primary-500 !to-secondary-600 hover:!from-primary-600 hover:!to-secondary-700 !text-white !border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              icon={<Send className="h-5 w-5" />}
            >
              {t('chat.send') || 'Send'}
            </Button>
          </div>
        </form>
        
        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "What is section 302 of BNS?",
            "Explain cybercrime laws",
            "How to file an FIR?",
            "Traffic violation penalties"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-xs bg-white/60 hover:bg-white/80 text-primary-700 px-3 py-1 rounded-full border border-primary-200 hover:border-primary-300 transition-all duration-200"
              disabled={loading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;