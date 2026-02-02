
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from '../types';
import { LEXICON_CONSTITUTION } from '../geminiService';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isStreaming]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    setIsStreaming(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "your_gemini_api_key_here") {
        throw new Error("API Key configuration error.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: { 
          systemInstruction: `${LEXICON_CONSTITUTION}\nYou are the Lexicon Strategic Advisor. Answer Tom's complex queries using deep reasoning. You have access to a thinking budget of 32,768 tokens.`,
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });

      const streamResponse = await chat.sendMessageStream({ message: userMsg });
      
      let fullText = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of streamResponse) {
        const c = chunk as GenerateContentResponse;
        const textChunk = c.text;
        if (textChunk) {
          fullText += textChunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last.role === 'model') {
              return [...prev.slice(0, -1), { role: 'model', text: fullText }];
            }
            return prev;
          });
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'model', text: `ERROR: ${e.message || "Connection failed."}` }]);
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="glass flex flex-col h-[480px] rounded-[32px] border border-zinc/20 overflow-hidden shadow-4xl animate-in slide-in-from-bottom-12 duration-700">
      <div className="bg-zinc-950/60 p-5 border-b border-zinc/20 flex justify-between items-center backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 lexicon-glow animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Strategic Intelligence Link</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Pro Thinking Mode Active</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll bg-black/40">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="2" strokeLinecap="round" /></svg>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ready for Strategic Input</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] rounded-3xl px-5 py-4 text-[13px] leading-relaxed shadow-lg ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-zinc-900/80 text-zinc-200 border border-zinc/20 rounded-bl-none'
            }`}>
              <p className={m.role === 'model' ? 'mono italic' : ''}>{m.text}</p>
            </div>
          </div>
        ))}
        {(loading && !isStreaming) && (
          <div className="flex justify-start">
             <div className="bg-zinc-900/80 border border-zinc/20 rounded-3xl px-5 py-3 flex gap-2 items-center">
                <div className="flex gap-1">
                   {[...Array(3)].map((_, i) => (
                     <div key={i} className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                   ))}
                </div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Lexicon is Thinking...</span>
             </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-5 bg-zinc-950/40 border-t border-zinc/20 backdrop-blur-3xl">
        <div className="flex gap-3 bg-zinc-900/50 border border-zinc/20 rounded-2xl p-2 focus-within:border-indigo-500/40 transition-all">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Deploy strategic inquiry..."
            className="flex-1 bg-transparent px-4 py-2 text-sm text-white focus:outline-none placeholder-zinc-700 font-bold"
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-20 active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
