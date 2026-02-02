
import React, { useState, useEffect, useMemo } from 'react';
import { generateOrchestrationMap } from '../geminiService';
import { AgentRole, Lead, LeadStatus } from '../types';

interface IntelligenceHubProps {
  selectedLead: Lead | null;
  leads: Lead[];
}

const STAGES: LeadStatus[] = ['DISCOVERED', 'TRACED', 'CONTACTED', 'LEGAL_REVIEW', 'FILED', 'PAID'];

const IntelligenceHub: React.FC<IntelligenceHubProps> = ({ selectedLead, leads }) => {
  const [orchestrationMap, setOrchestrationMap] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const funnelData = useMemo(() => {
    return STAGES.map(stage => ({
      stage,
      count: leads.filter(l => l.status === stage).length,
      value: leads.filter(l => l.status === stage).reduce((sum, l) => sum + l.amount, 0)
    }));
  }, [leads]);

  const totalValue = leads.reduce((sum, l) => sum + l.amount, 0);

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
  }, [selectedLead?.id]);

  const pipeline: { role: AgentRole; name: string; color: string }[] = [
    { role: 'SCOUTER', name: 'Scout-Net', color: '#6366f1' },
    { role: 'TRACER', name: 'Shadow-Trace', color: '#a855f7' },
    { role: 'OUTREACH', name: 'Echo-Sync', color: '#f59e0b' },
    { role: 'LEGAL', name: 'Lex-Analyst', color: '#ec4899' },
    { role: 'FILER', name: 'Veri-File', color: '#8b5cf6' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e] overflow-hidden">
      <div className="p-8 lg:p-10 border-b border-zinc bg-black/40 backdrop-blur-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Swarm Intelligence Hub</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Global Recovery Orchestration & Value Funnel</p>
            
            <div className="grid grid-cols-6 gap-2 mt-10">
              {funnelData.map((data, i) => (
                <div key={data.stage} className="flex flex-col gap-2">
                   <div className="h-16 bg-zinc-900/50 border border-zinc rounded-xl flex flex-col items-center justify-center group hover:border-indigo-500/50 transition-all">
                      <span className="text-xs font-extrabold text-white">${(data.value / 1000).toFixed(0)}k</span>
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter truncate w-full text-center px-1">{data.stage.replace('_', ' ')}</span>
                   </div>
                   <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${(data.value / (totalValue || 1)) * 100}%` }} />
                   </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col justify-end items-end text-right">
             <div className="text-4xl font-black text-white tracking-tighter mb-1">${totalValue.toLocaleString()}</div>
             <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Pipeline Asset Value</div>
             <button 
               onClick={generateMap}
               disabled={loading}
               className="px-6 py-2 bg-zinc-900 border border-zinc rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
             >
               {loading ? 'Thinking...' : 'Refresh Blueprint'}
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 custom-scroll">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-full gap-8">
              <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin" />
           </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12 pb-20">
             <div className="bg-zinc-900/20 rounded-[40px] border border-zinc p-12 whitespace-pre-wrap mono text-[11px] leading-loose text-zinc-400 italic shadow-2xl">
               {orchestrationMap || "Initializing Strategic Neural Network..."}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligenceHub;
