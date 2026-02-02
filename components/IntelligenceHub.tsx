
import React, { useState, useEffect } from 'react';
import { generateOrchestrationMap } from '../geminiService';
import { AgentRole, Lead } from '../types';

interface IntelligenceHubProps {
  selectedLead: Lead | null;
}

const IntelligenceHub: React.FC<IntelligenceHubProps> = ({ selectedLead }) => {
  const [orchestrationMap, setOrchestrationMap] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateMap = async () => {
    setLoading(true);
    try {
      const result = await generateOrchestrationMap(selectedLead || undefined);
      setOrchestrationMap(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateMap();
  }, [selectedLead?.id]); // Only re-run if the lead actually changes

  const pipeline: { role: AgentRole; name: string; color: string }[] = [
    { role: 'SCOUTER', name: 'Scout-Net', color: '#6366f1' },
    { role: 'TRACER', name: 'Shadow-Trace', color: '#a855f7' },
    { role: 'OUTREACH', name: 'Echo-Sync', color: '#f59e0b' },
    { role: 'LEGAL', name: 'Lex-Analyst', color: '#ec4899' },
    { role: 'FILER', name: 'Veri-File', color: '#8b5cf6' },
  ];

  const statusToRoleMap: Record<string, string> = {
    'DISCOVERED': 'SCOUTER',
    'TRACED': 'TRACER',
    'CONTACTED': 'OUTREACH',
    'LEGAL_REVIEW': 'LEGAL',
    'FILED': 'FILER',
    'PAID': 'FILER'
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e] overflow-hidden">
      <div className="p-8 lg:p-10 border-b border-zinc bg-black/40 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              {selectedLead ? `Focus: ${selectedLead.ownerName}` : 'Global Orchestration'}
            </h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-2">
              {selectedLead ? 'Active Object Intelligence' : 'System-Wide Recovery Strategy'}
            </p>
          </div>
          <button 
            onClick={generateMap}
            disabled={loading}
            className="px-6 py-2 bg-zinc-900 border border-zinc rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-30"
          >
            {loading ? 'Thinking...' : 'Refresh Intel'}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 lg:gap-4 px-2 lg:px-10 relative">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-zinc-900 -z-10" />
          {pipeline.map((step, i) => {
            const isActive = selectedLead?.status && statusToRoleMap[selectedLead.status] === step.role;
            return (
              <div key={step.role} className="flex flex-col items-center gap-4 relative">
                <div 
                  className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center border transition-all duration-700 ${
                    isActive ? 'border-white bg-white/10 scale-110 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'border-zinc bg-zinc-900 grayscale opacity-40'
                  }`}
                >
                  <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-md ${isActive ? 'animate-pulse' : ''}`} style={{ backgroundColor: step.color }} />
                </div>
                <div className="text-center">
                  <div className="text-[8px] lg:text-[9px] font-black text-white uppercase tracking-widest truncate max-w-[80px]">{step.name}</div>
                </div>
                {i < pipeline.length - 1 && (
                  <div className="absolute top-6 lg:top-7 -right-5 lg:-right-10 text-zinc-800">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 custom-scroll space-y-10">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-full gap-8">
              <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin" />
              <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Synthesizing Map...</div>
           </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
             <div className="prose prose-invert max-w-none">
                <div className="bg-zinc-900/40 rounded-[32px] border border-zinc p-10 whitespace-pre-wrap mono text-[11px] leading-relaxed text-zinc-400 italic">
                  {orchestrationMap || "Initializing Swarm Intelligence Protocol..."}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligenceHub;
