
import React, { useEffect, useRef, useState } from 'react';
import { ActivityLog } from '../types';

interface TerminalProps {
  logs: ActivityLog[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(filter.toLowerCase()) || 
    log.agentId.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between gap-4">
         <div className="relative flex-1">
           <input 
             type="text" 
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             placeholder="SEARCH SYSTEM STREAM..."
             className="w-full bg-zinc-900 border border-zinc rounded-xl px-12 py-3 text-[10px] font-bold text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-all placeholder-zinc-700 tracking-widest"
           />
           <svg className="w-4 h-4 absolute left-4 top-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
         </div>
         <div className="flex items-center gap-4 bg-zinc-900 border border-zinc rounded-xl px-4 py-3">
            <div className="flex gap-1">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="w-1 h-3 bg-indigo-500/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
               ))}
            </div>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Live Pulse</span>
         </div>
      </div>
      
      <div className="flex-1 bg-black/60 rounded-[32px] p-8 font-mono text-[11px] overflow-y-auto border border-zinc shadow-2xl custom-scroll relative group">
        <div className="absolute top-8 right-8 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
           <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.4em] text-right">
             SR-AI CORE // SYSTEM AUDIT<br/>ENCRYPTED STREAM 0x90
           </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-700 italic opacity-50">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Command Deployment</span>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex flex-col gap-1 border-l-2 border-zinc-900 pl-4 hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-zinc-600 text-[10px] font-bold">[{log.timestamp.toLocaleTimeString()}]</span>
                  <span className={`text-[10px] font-black uppercase tracking-tighter w-20 ${
                    log.type === 'ERROR' ? 'text-rose-500' : 
                    log.type === 'SUCCESS' ? 'text-emerald-500' : 
                    log.type === 'WARNING' ? 'text-amber-500' : 'text-indigo-400'
                  }`}>
                    {log.agentId}
                  </span>
                  <span className="text-zinc-300 leading-relaxed max-w-2xl">
                    {log.message}
                  </span>
                </div>
                {log.leadId && (
                  <div className="text-[9px] text-zinc-700 ml-24 font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                    Reference: OBJ-{log.leadId.slice(-6)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default Terminal;
