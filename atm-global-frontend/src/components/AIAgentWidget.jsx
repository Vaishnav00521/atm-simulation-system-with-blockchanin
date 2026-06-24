import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { apiFetch } from '../api/apiFetch';

const AIAgentWidget = () => {
  const [prompt, setPrompt] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'agent', text: 'Terminal Intelligence active. How can I assist you with your blockchain reserves today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatLog, loading]);

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMessage = prompt;
    setChatLog(prev => [...prev, { sender: 'user', text: userMessage }]);
    setPrompt('');
    setLoading(true);

    try {
      const data = await apiFetch('/api/ai/query', {
        method: 'POST',
        body: JSON.stringify({ prompt: userMessage }),
      });

      setChatLog(prev => [...prev, { sender: 'agent', text: data.reply }]);
    } catch (error) {
      setChatLog(prev => [...prev, { sender: 'agent', text: 'Error connecting to brain engine: ' + error.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 h-[450px] flex flex-col justify-between shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[50px] pointer-events-none" />
      
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-4 relative z-10">
        <Bot className="text-purple-500" size={22} />
        <h3 className="font-bold text-white text-lg flex items-center gap-1.5">
          Terminal Agent <Sparkles size={14} className="text-purple-400 fill-purple-400" />
        </h3>
      </div>

      {/* Chat Display Container */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 my-2 pr-2 custom-scrollbar relative z-10">
        {chatLog.map((chat, idx) => (
          <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm ${
              chat.sender === 'user' 
                ? 'bg-purple-600 text-white font-medium rounded-tr-none' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
            }`}>
              {chat.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl rounded-tl-none p-3.5 text-sm flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4 text-purple-500" /> Agent is analyzing system state...
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Control Input */}
      <form onSubmit={handleQuery} className="flex gap-2 bg-black border border-zinc-800 p-2 rounded-xl focus-within:border-purple-500 transition-colors relative z-10">
        <input
          type="text"
          placeholder="Ask about your balances, system specs, or network speeds..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          className="flex-1 bg-transparent text-sm text-white focus:outline-none px-2"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white p-2.5 rounded-lg transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default AIAgentWidget;
