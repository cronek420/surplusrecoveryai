
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Guidelines: Initializing with direct env variable
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: { systemInstruction: "You are the SurplusRecovery AI Assistant. You help users navigate the legal complexities of recovering surplus funds from government auctions." }
      });
      const response = await chat.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm not sure about that." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to service." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass flex flex-col h-[400px] rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
      <div className="bg-slate-800 p-3 border-b border-slate-700 font-bold text-sm flex justify-between items-center">
        <span>Strategic Advisor Bot</span>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-slate-500 italic">Thinking...</div>}
        <div ref={scrollRef} />
      </div>
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about recovery strategies..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
        <button 
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
