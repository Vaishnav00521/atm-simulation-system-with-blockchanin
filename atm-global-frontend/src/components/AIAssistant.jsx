import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Cpu, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import api from '../api/axiosConfig'; // 🔴 This is the magic key that fixes the error

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Neural link established. I am Emlie, your Agentic AI Router. I can check your balances or execute transactions. How may I assist you?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      // 🔴 We use the secure 'api' instance to automatically attach your JWT token
      const response = await api.post('/api/ai/chat', { message: userText });
      
      setMessages(prev => [...prev, { sender: 'ai', text: response.data.response }]);
    } catch (error) {
      console.error("AI Core Error (Check F12 Console):", error);
      
      // If it fails, we now capture the ACTUAL error from the backend instead of a generic message
      const errorMessage = error.response?.data?.message || error.message || "Connection refused by Spring Boot.";
      
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        isError: true,
        text: `Execution Halted: ${errorMessage}. Ensure Docker is running and token is valid.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* The Floating Emerald Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles size={24} className="animate-pulse" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-300 border-2 border-emerald-600 rounded-full"></span>
      </button>

      {/* The AI Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-black/80 border-b border-zinc-800 p-4 flex justify-between items-center backdrop-blur-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold flex items-center gap-2">Emlie <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest">Online</span></h3>
                  <p className="text-xs text-zinc-500 font-mono">Agentic NLP Router</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white p-2 bg-zinc-900 rounded-full transition-colors"><X size={16}/></button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-zinc-950 to-black">
              {messages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-sm' 
                      : msg.isError 
                        ? 'bg-red-500/10 border border-red-500/30 text-red-400 rounded-tl-sm flex items-start gap-2' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm'
                  }`}>
                    {msg.isError && <AlertTriangle size={16} className="shrink-0 mt-0.5" />}
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-zinc-900 border border-zinc-800 text-emerald-500 p-3.5 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs font-mono">Accessing Ledger...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/80 border-t border-zinc-800 backdrop-blur-md relative z-10">
              <form onSubmit={handleSend} className="flex gap-2 relative">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  disabled={isLoading}
                  placeholder="Command Emlie (e.g., Transfer 50 USDC)..." 
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400 disabled:text-zinc-600 p-2 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;