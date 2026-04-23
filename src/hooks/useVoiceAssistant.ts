import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition?: new () => SpeechRecognitionInterface;
  }
}

export type SupportedLanguage = 'en-US' | 'hi-IN' | 'kn-IN';

export const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; nativeLabel: string }[] = [
  { code: 'en-US', label: 'English', nativeLabel: 'English' },
  { code: 'hi-IN', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'kn-IN', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
];

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export const useVoiceAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('en-US');
  const { toast } = useToast();
  
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript;
        setTranscript(transcriptResult);

        if (event.results[current].isFinal) {
          handleUserMessage(transcriptResult);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Denied",
            description: "Please enable microphone access to use voice features.",
            variant: "destructive",
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, [language]);

  // Load speech voices asynchronously (required in Chrome).
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        voicesRef.current = voices;
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setTranscript('');
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
    }
  }, [toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    // Fix 'Stuck' Audio: Call window.speechSynthesis.cancel() at the very beginning
    window.speechSynthesis.cancel();

    if (!('speechSynthesis' in window)) {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    // The 'Speak-Empty' Hack: Wake up Chrome Speech Synthesis engine
    const wakeUpUtterance = new SpeechSynthesisUtterance('');
    wakeUpUtterance.lang = 'en-US';
    window.speechSynthesis.speak(wakeUpUtterance);

    // Chrome has a bug where long text can fail - split into chunks if needed
    const maxLength = 200;
    const textToSpeak = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Manual Rate & Pitch: Explicitly set to 1
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Detection: Checks if the text contains Kannada characters
    const hasKannada = /[\u0C80-\u0CFF]/.test(textToSpeak);

    // The Logic Bridge
    const langMap: Record<string, string> = { English: 'en-US', Hindi: 'hi-IN', Kannada: 'kn-IN' };
    const currentLangLabel = LANGUAGE_OPTIONS.find(opt => opt.code === language)?.label || 'English';
    let targetLangCode = langMap[currentLangLabel] || language;

    // The Accent Overwrite: Explicitly set utterance.lang = 'kn-IN' for the entire text
    if (hasKannada) {
      targetLangCode = 'kn-IN';
    }
    
    utterance.lang = targetLangCode;

    // Set event handlers BEFORE speaking
    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
    };
    utterance.onend = (e) => {
      console.log('Speech ended successfully. Event:', e);
      setIsSpeaking(false);
    };
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsSpeaking(false);
      // Don't show toast for 'interrupted' errors (user cancelled)
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        toast({
          title: "Speech Error",
          description: `Could not play voice (${e.error}). Try using a different browser.`,
          variant: "destructive",
        });
      }
    };

    synthRef.current = utterance;

    // The Refresh Hack: Call getVoices() twice
    let voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
      voices = window.speechSynthesis.getVoices();
    }
    
    if (!voices.length) {
      await new Promise<void>((resolve) => {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          if (!voices.length) voices = window.speechSynthesis.getVoices(); // Double call hack inside listener too
          voicesRef.current = voices;
          window.speechSynthesis.onvoiceschanged = null; // cleanup
          resolve();
        };
      });
    }

    // Debug Check
    const debugVoices = voices.filter(v => v.lang.toLowerCase().includes('kn') || v.lang.toLowerCase().includes('hi'));
    console.log("Available 'kn' or 'hi' voices:", debugVoices);

    // Aggressive Voice Selection + Force Kannada Voice
    let foundVoice: SpeechSynthesisVoice | undefined;
    if (hasKannada) {
      // Force Kannada Voice: find a voice where v.lang is exactly 'kn-IN'
      foundVoice = voices.find((v) => v.lang === 'kn-IN');
      
      // Fallback if not found exactly
      if (!foundVoice) {
        foundVoice = voices.find((v) => 
          v.lang.startsWith('kn') || 
          v.name.toLowerCase().includes('kannada') ||
          v.name.toLowerCase().includes('kalpana') ||
          v.name.toLowerCase().includes('hemant')
        );
      }
    } else if (targetLangCode === 'kn-IN') {
      foundVoice = voices.find((v) => 
        v.lang.startsWith('kn') || 
        v.name.toLowerCase().includes('kannada') ||
        v.name.toLowerCase().includes('kalpana') ||
        v.name.toLowerCase().includes('hemant')
      );
    } else if (targetLangCode === 'hi-IN') {
      foundVoice = voices.find((v) => 
        v.lang.startsWith('hi') || 
        v.name.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('hemant') ||
        v.name.toLowerCase().includes('kalpana')
      );
    } else {
      foundVoice =
        voices.find((v) => v.lang === 'en-US') ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    }

    // Explicitly assign utterance.voice = foundVoice if a match is found in the system list
    if (foundVoice) {
      console.log("Selected voice:", foundVoice.name, foundVoice.lang);
      utterance.voice = foundVoice;
    } else {
      console.warn("No specific voice found for lang:", targetLangCode);
    }

    // Resume Audio: Call window.speechSynthesis.resume() right before speak()
    window.speechSynthesis.resume();

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [toast, language]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const streamChat = useCallback(async (messagesToSend: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-assistant`;

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: messagesToSend.map(m => ({ role: m.role, content: m.content })),
        language: language,
      }),
    });

    if (resp.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    if (resp.status === 402) {
      throw new Error("Service credits exhausted. Please try again later.");
    }
    if (!resp.ok || !resp.body) {
      throw new Error("Failed to connect to assistant");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            fullResponse += content;
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return fullResponse;
  }, [language]);

  const handleUserMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages(prev => [...prev, userMessage]);
    setTranscript('');
    setIsProcessing(true);
    setIsListening(false);

    try {
      const allMessages = [...messages, userMessage];
      const response = await streamChat(allMessages);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMessage]);
      speak(response);
    } catch (error) {
      console.error('Error getting response:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [messages, streamChat, speak, toast]);

  const sendTextMessage = useCallback((text: string) => {
    handleUserMessage(text);
  }, [handleUserMessage]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    stopSpeaking();
    setTranscript('');
  }, [stopSpeaking]);

  return {
    messages,
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    language,
    setLanguage,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    sendTextMessage,
    clearConversation,
  };
};
