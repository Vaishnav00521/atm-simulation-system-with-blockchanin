import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, X, Cpu, Loader2, Sparkles, AlertTriangle, 
  Mic, MicOff, Copy, Check, ChevronDown, Globe,
  MessageSquare, Zap, Wallet, Activity, FileText, Settings
} from 'lucide-react';
import api from '../api/axiosConfig';

// Language configuration
const LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸', dir: 'ltr' },
  hi: { name: 'हिंदी', flag: '🇮🇳', dir: 'ltr' },
  mr: { name: 'मराठी', flag: '🇮🇳', dir: 'ltr' },
  gu: { name: 'ગુજરાતી', flag: '🇮🇳', dir: 'ltr' }
};

// Localized prompts for quick actions
const QUICK_ACTIONS = {
  en: [
    { label: 'Check Balance', icon: Wallet, action: 'Check my balance' },
    { label: 'Recent Transactions', icon: Activity, action: 'Show recent transactions' },
    { label: 'Network Status', icon: Zap, action: 'Check network status' },
    { label: 'Contracts', icon: FileText, action: 'List my contracts' }
  ],
  hi: [
    { label: 'बैलेंस जांचें', icon: Wallet, action: 'मेरा बैलेंस देखाओ' },
    { label: 'लेन-देन', icon: Activity, action: 'हाल के ट्रांजैक्शन दिखाओ' },
    { label: 'नेटवर्क स्थिति', icon: Zap, action: 'नेटवर्क स्थिति बताओ' },
    { label: 'कॉन्ट्रैक्ट्स', icon: FileText, action: 'मेरे कॉन्ट्रैक्ट्स दिखाओ' }
  ],
  mr: [
    { label: 'बॅलन्स तपासा', icon: Wallet, action: 'माझा बॅलन्स दाखवा' },
    { label: 'व्यवहार', icon: Activity, action: 'अलीकडील व्यवहार दाखवा' },
    { label: 'नेटवर्क स्थिती', icon: Zap, action: 'नेटवर्क स्थिती सांगा' },
    { label: 'कॉन्ट्रॅक्ट्स', icon: FileText, action: 'माझे कॉन्ट्रॅक्ट्स दाखवा' }
  ],
  gu: [
    { label: 'બેલેન્સ તપાસો', icon: Wallet, action: 'મારું બેલેન્સ બતાવો' },
    { label: 'ટ્રાંઝેક્શન', icon: Activity, action: 'તાજા ટ્રાંઝેક્શન બતાવો' },
    { label: 'નેટવર્ક સ્થિતિ', icon: Zap, action: 'નેટવર્ક સ્થિતિ જણાવો' },
    { label: 'કોન્ટ્રાક્ટ્સ', icon: FileText, action: 'મારા કોન્ટ્રાક્ટ્સ બતાવો' }
  ]
};

// Initial welcome messages
const WELCOME_MESSAGES = {
  en: "Neural link established. I am Lisa, your AI Assistant. How may I assist you today?",
  hi: "न्यूरल लिंक स्थापित। मैं लिसा हूं, आपकी AI असिस्टेंट। मैं आपकी कैसे मदद कर सकती हूं?",
  mr: "न्यूरल लिंक स्थापित झाला. मी लिसा, तुमची AI असिस्टेंट. मी तुम्हाला कशी मदद करू शकते?",
  gu: "ન્યૂરલ લિંક સ્થાપિત. હું લિસા, તમારી AI સહાયક છું. હું તમને કેવી રીતે મદદ કરી શકું?"
};

// Cache for API responses
const responseCache = new Map();

const LisaAI = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize messages with welcome message
  useEffect(() => {
    setMessages([{ 
      id: 1, 
      sender: 'ai', 
      text: WELCOME_MESSAGES[language],
      timestamp: new Date()
    }]);
  }, [language]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : language === 'gu' ? 'gu-IN' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSend = useCallback(async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMessage = { 
      id: Date.now(), 
      sender: 'user', 
      text: userText, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Check cache first
    const cacheKey = `${language}:${userText.toLowerCase()}`;
    if (responseCache.has(cacheKey)) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          sender: 'ai', 
          text: responseCache.get(cacheKey),
          timestamp: new Date()
        }]);
        setIsLoading(false);
      }, 300);
      return;
    }

    try {
      const response = await api.post('/api/ai/chat', { 
        message: userText,
        language: language
      });
      
      const aiResponse = response.data.response;
      
      // Cache the response
      responseCache.set(cacheKey, aiResponse);
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: aiResponse,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error("Lisa AI Error:", error);
      
      const errorMessage = error.response?.data?.message || 
        error.message || 
        "Connection failed. Please ensure the backend is running.";
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'ai', 
        isError: true,
        text: `Error: ${errorMessage}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, language]);

  const handleQuickAction = useCallback((action) => {
    setInput(action);
    setTimeout(() => {
      handleSend();
    }, 100);
  }, [handleSend]);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.abort();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  }, [isListening]);

  const copyToClipboard = useCallback((text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const toggleLanguage = useCallback((lang) => {
    setLanguage(lang);
    setShowLangMenu(false);
  }, []);

  const formatTime = useCallback((date) => {
    return new Date(date).toLocaleTimeString(language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'gu-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [language]);

  // Memoized quick actions
  const currentQuickActions = useMemo(() => QUICK_ACTIONS[language], [language]);

  // Memoized current language
  const currentLang = useMemo(() => LANGUAGES[language], [language]);

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] transition-all z-40 flex items-center justify-center"
      >
        <Sparkles size={28} className="animate-pulse" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-300 border-2 border-emerald-600 rounded-full flex items-center justify-center">
          <span className="w-2 h-2 bg-emerald-600 rounded-full animate-ping"></span>
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900 to-black border-b border-zinc-800 p-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Cpu size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              Lisa 
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest">Online</span>
            </h3>
            <p className="text-xs text-zinc-500 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              AI Assistant
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-300 hover:border-emerald-500 transition-colors"
            >
              <Globe size={14} />
              <span className="font-medium">{currentLang.flag} {currentLang.name}</span>
              <ChevronDown size={14} className={`transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 right-0 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-xl z-20 min-w-[140px]"
                >
                  {Object.entries(LANGUAGES).map(([key, lang]) => (
                    <button
                      key={key}
                      onClick={() => toggleLanguage(key)}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-zinc-800 transition-colors ${
                        language === key ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-300'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-zinc-500 hover:text-white p-2 bg-zinc-900 rounded-xl transition-colors hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-zinc-950 via-black to-zinc-900">
        {/* Quick Actions - Only show when messages are minimal */}
        {messages.length <= 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-2 mb-4"
          >
            {currentQuickActions.map((action, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleQuickAction(action.action)}
                className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all"
              >
                <action.icon size={14} />
                {action.label}
              </motion.button>
            ))}
          </motion.div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`group max-w-[85%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`p-3.5 rounded-2xl text-sm relative ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-sm' 
                  : msg.isError 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-400 rounded-tl-sm' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm'
              }`}>
                {msg.isError && <AlertTriangle size={16} className="shrink-0 mt-0.5 mb-1" />}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                
                {/* Copy button for AI messages */}
                {msg.sender === 'ai' && !msg.isError && (
                  <button
                    onClick={() => copyToClipboard(msg.text, msg.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700"
                    title="Copy"
                  >
                    {copiedId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-zinc-400" />}
                  </button>
                )}
              </div>
              <p className={`text-[10px] text-zinc-600 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-zinc-900 border border-zinc-800 text-emerald-500 p-3.5 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-mono">Processing...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gradient-to-t from-black to-zinc-900 border-t border-zinc-800 relative z-10">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={language === 'en' ? 'Ask Lisa anything...' : 
              language === 'hi' ? 'लिसा से कुछ भी पूछें...' : 
              language === 'mr' ? 'लिसाला काही विचारा...' : 
              'લિસાને કંઈ પૂછો...'}
            className="flex-1 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl pl-4 pr-24 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all disabled:opacity-50"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoice}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'text-red-500 bg-red-500/10' 
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
              } disabled:opacity-50`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            
            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 text-emerald-500 hover:text-emerald-400 disabled:text-zinc-600 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        
        {/* Powered by text */}
        <p className="text-[10px] text-zinc-600 text-center mt-3 flex items-center justify-center gap-1">
          <Sparkles size={10} />
          Powered by Lisa AI • {language === 'en' ? 'Multi-language Support' : 'बहुभाषा समर्थन'}
        </p>
      </div>
    </motion.div>
  );
});

LisaAI.displayName = 'LisaAI';

export default LisaAI;
