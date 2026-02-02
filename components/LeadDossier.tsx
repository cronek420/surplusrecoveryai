
import React, { useState } from 'react';
import { Lead } from '../types';

interface LeadDossierProps {
  lead: Lead;
  onClose: () => void;
  onAdvance: (id: string) => void;
  runMaster: (lead: Lead) => void;
  runTrace: (lead: Lead) => void;
  runOutreach: (lead: Lead) => void;
  runLegal: (lead: Lead) => void;
  runFiling: (lead: Lead) => void;
  masterResult: string | null;
  thinkingResult: string | null;
  outreachResult: string | null;
  closingResult: string | null;
  filerResult: string | null;
  isDeepThinking: boolean;
}

const LeadDossier: React.FC<LeadDossierProps> = ({
  lead, onClose, onAdvance,
  runMaster, runTrace, runOutreach, runLegal, runFiling,
  masterResult, thinkingResult, outreachResult, closingResult, filerResult,
  isDeepThinking
}) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const wrapAction = async (name: string, fn: (l: Lead) => void) => {
    setActiveAction(name);
    try {
      await fn(lead);
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e]">
      {/* Header */}
      <div className="p-8 border-b border-zinc bg-black/80 backdrop-blur-2xl sticky top-0 z-20 flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
              lead.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              {lead.status.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-zinc">
              OBJ-{lead.id.slice(-6)}
            </span>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-white leading-tight">{lead.ownerName}</h3>
          <div className="text-emerald-500 font-extrabold mono text-2xl tracking-tighter">
            ${lead.amount.toLocaleString()}
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white p-2 bg-zinc-900 rounded-full transition-all">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll p-8 space-y-12 pb-40">
        
        {/* Core Sections remain unchanged for data integrity */}
        <section className="space-y-6">
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] border-b border-zinc/30 pb-2">Core Recovery Data</h4>
          <div className="grid grid-cols-2 gap-6 text-[11px]">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Property Address</label>
              <p className="font-medium text-zinc-300">{lead.propertyAddress || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Last Known Location</label>
              <p className="font-medium text-zinc-300">{lead.lastKnownAddress || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Jurisdiction</label>
              <p className="font-medium text-zinc-300">{lead.county}, {lead.state}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Court System</label>
              <p className="font-medium text-zinc-300">{lead.courtCounty || 'Default Court'}</p>
            </div>
          </div>
        </section>

        {/* Section: AI Swarm Operations with granular loading */}
        <div className="pt-8 border-t border-zinc/30 space-y-10">
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Core-AI Master Blueprint</h4>
              <button 
                onClick={() => wrapAction('master', runMaster)} 
                disabled={activeAction === 'master'}
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 disabled:opacity-30"
              >
                {activeAction === 'master' ? 'Orchestrating...' : masterResult ? 'Regenerate' : 'Generate'}
              </button>
            </div>
            {masterResult && (
               <div className="bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/20">
                  <p className="text-[11px] mono italic leading-relaxed text-zinc-300 whitespace-pre-wrap">{masterResult}</p>
               </div>
            )}
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Shadow-Trace Intel</h4>
              <button 
                onClick={() => wrapAction('trace', runTrace)} 
                disabled={activeAction === 'trace' || isDeepThinking}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-30"
              >
                {activeAction === 'trace' ? 'Scanning Deepweb...' : thinkingResult ? 'Re-Trace' : 'Execute Trace'}
              </button>
            </div>
            {thinkingResult && (
               <div className="bg-indigo-500/5 rounded-2xl p-6 border border-indigo-500/20">
                  <p className="text-[11px] mono italic leading-relaxed text-zinc-300 whitespace-pre-wrap">{thinkingResult}</p>
               </div>
            )}
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Lex-Analyst Legal</h4>
              <button 
                onClick={() => wrapAction('legal', runLegal)}
                disabled={activeAction === 'legal'}
                className="text-[10px] font-bold text-pink-500 hover:text-pink-400 disabled:opacity-30"
              >
                {activeAction === 'legal' ? 'Consulting Statutes...' : closingResult ? 'Update Brief' : 'Draft Standing'}
              </button>
            </div>
            {closingResult && (
               <div className="bg-pink-500/5 rounded-2xl p-6 border border-pink-500/20">
                  <p className="text-[11px] mono italic leading-relaxed text-zinc-300 whitespace-pre-wrap">{closingResult}</p>
               </div>
            )}
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Veri-File Monitoring</h4>
              <button 
                onClick={() => wrapAction('filing', runFiling)}
                disabled={activeAction === 'filing'}
                className="text-[10px] font-bold text-purple-500 hover:text-purple-400 disabled:opacity-30"
              >
                {activeAction === 'filing' ? 'Watching Docket...' : filerResult ? 'Re-Verify' : 'Initialize Watch'}
              </button>
            </div>
            {filerResult && (
               <div className="bg-purple-500/5 rounded-2xl p-6 border border-purple-500/20">
                  <p className="text-[11px] mono italic leading-relaxed text-zinc-300 whitespace-pre-wrap">{filerResult}</p>
               </div>
            )}
          </section>
        </div>

        {/* Audit Trail Section remains as per technical specification */}
        <section className="space-y-5 pb-20">
           <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-zinc/30 pb-2">Full Audit Trail</h4>
           <div className="space-y-3">
              {lead.crmHistory.map(h => (
                <div key={h.id} className="p-4 bg-zinc-900/40 border border-zinc rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{h.agentId}</span>
                    <span className="text-[8px] mono text-zinc-600">{new Date(h.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[11px] font-bold text-zinc-200">{h.action}</div>
                  <div className="text-[10px] text-zinc-500 mt-1 italic leading-relaxed">{h.details}</div>
                </div>
              ))}
           </div>
        </section>
      </div>

      <div className="p-8 bg-black/90 backdrop-blur-xl border-t border-zinc flex gap-4 sticky bottom-0 z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
         <button 
           onClick={() => onAdvance(lead.id)} 
           disabled={lead.status === 'PAID' || !!activeAction} 
           className="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-indigo-500 hover:scale-[1.01] transition-all disabled:opacity-20 shadow-xl shadow-indigo-600/20"
         >
           {lead.status === 'PAID' ? 'Recovery Finalized' : 'Advance Pipeline Stage'}
         </button>
      </div>
    </div>
  );
};

export default LeadDossier;
