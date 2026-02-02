
import React, { useState } from 'react';
import { Lead, LeadDocument } from '../types';
import { analyzeDocumentImage } from '../geminiService';

interface LeadDossierProps {
  lead: Lead;
  onClose: () => void;
  onAdvance: (id: string) => void;
  runMaster: (lead: Lead) => void;
  runTrace: (lead: Lead) => void;
  runOutreach: (lead: Lead) => void;
  runLegal: (lead: Lead) => void;
  runFiling: (lead: Lead) => void;
  runRecon: (lead: Lead) => void;
  masterResult: string | null;
  thinkingResult: string | null;
  outreachResult: string | null;
  closingResult: string | null;
  filerResult: string | null;
  reconResult: string | null;
  isDeepThinking: boolean;
  updateLead: (id: string, updates: Partial<Lead>) => void;
}

const LeadDossier: React.FC<LeadDossierProps> = ({
  lead, onClose, onAdvance,
  runMaster, runTrace, runOutreach, runLegal, runFiling, runRecon,
  masterResult, thinkingResult, outreachResult, closingResult, filerResult, reconResult,
  isDeepThinking, updateLead
}) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const wrapAction = async (name: string, fn: (l: Lead) => void) => {
    setActiveAction(name);
    try {
      await fn(lead);
    } finally {
      setActiveAction(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const analysis = await analyzeDocumentImage(base64, file.type);
        
        const newDoc: LeadDocument = {
          id: Math.random().toString(36),
          name: file.name,
          type: file.type,
          timestamp: new Date(),
          status: 'PARSED',
          data: analysis
        };

        updateLead(lead.id, {
          documents: [newDoc, ...lead.documents],
          amount: analysis.amount || lead.amount,
          caseNumber: analysis.caseNumber || lead.caseNumber,
          crmHistory: [{
            id: Math.random().toString(),
            agentId: 'ANALYST',
            timestamp: new Date(),
            action: 'Document Parsed',
            details: `Extracted case ${analysis.caseNumber} via OCR.`
          }, ...lead.crmHistory]
        });
      } catch (err) {
        console.error("OCR Error", err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e]">
      <div className="p-8 border-b border-zinc bg-black/80 backdrop-blur-2xl sticky top-0 z-20 flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-900 border border-zinc px-3 py-1 rounded-lg">OBJ-{lead.id.slice(-6)}</span>
            <div className="flex items-center gap-2">
               <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${lead.priorityScore || 0}%` }} />
               </div>
               <span className="text-[9px] font-bold text-zinc-500 uppercase">{lead.priorityScore || 0}% SCORE</span>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tighter text-white">{lead.ownerName}</h3>
          <div className="text-emerald-500 font-extrabold mono text-2xl tracking-tighter mt-2">
            ${lead.amount.toLocaleString()}
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white p-3 bg-zinc-900 rounded-full transition-all">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll p-8 space-y-12 pb-40">
        
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc/30 pb-3">
             <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Recovery Document Vault</h4>
             <label className="cursor-pointer">
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                <span className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">{isUploading ? 'Parsing...' : 'Upload Docket'}</span>
             </label>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {lead.documents.length === 0 ? (
               <div className="p-10 border border-dashed border-zinc rounded-[24px] text-center">
                  <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Vault Empty</span>
               </div>
            ) : (
              lead.documents.map(doc => (
                <div key={doc.id} className="p-5 bg-zinc-900/50 border border-zinc rounded-[24px] flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                         <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-white">{doc.name}</div>
                        <div className="text-[9px] text-zinc-600 mono uppercase">{doc.status} • Case: {doc.data?.caseNumber || 'N/A'}</div>
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* AI Swarm Operations */}
        <div className="space-y-10">
          <AgentSection title="Strategic Blueprint" agentId="STRATEGIST" result={masterResult} onRun={() => wrapAction('master', runMaster)} active={activeAction === 'master'} />
          <AgentSection title="Property Recon" agentId="SURVEYOR" result={reconResult} onRun={() => wrapAction('recon', runRecon)} active={activeAction === 'recon'} />
          {/* Fix: changed runDeepTrace to the correct prop name runTrace */}
          <AgentSection title="Deep Skip-Trace" agentId="TRACER" result={thinkingResult} onRun={() => wrapAction('trace', runTrace)} active={activeAction === 'trace'} />
          <AgentSection title="Outreach Sequences" agentId="OUTREACH" result={outreachResult} onRun={() => wrapAction('outreach', runOutreach)} active={activeAction === 'outreach'} />
          <AgentSection title="Legal Strategy" agentId="LEGAL" result={closingResult} onRun={() => wrapAction('legal', runLegal)} active={activeAction === 'legal'} />
          <AgentSection title="Filing Checklist" agentId="FILER" result={filerResult} onRun={() => wrapAction('filing', runFiling)} active={activeAction === 'filing'} />
        </div>

        <section className="space-y-6 pb-20">
           <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-zinc/30 pb-3">Audit Trail</h4>
           <div className="space-y-4">
              {lead.crmHistory.map(h => (
                <div key={h.id} className="p-5 bg-zinc-950/40 border border-zinc/50 rounded-2xl group hover:border-white/10 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-500">{h.agentId}</span>
                    <span className="text-[8px] mono text-zinc-700">{new Date(h.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[11px] font-bold text-zinc-200">{h.action}</div>
                  <div className="text-[10px] text-zinc-500 mt-1 italic leading-relaxed">{h.details}</div>
                </div>
              ))}
           </div>
        </section>
      </div>

      <div className="p-8 bg-black/90 backdrop-blur-3xl border-t border-zinc flex gap-4 sticky bottom-0 z-20 shadow-2xl">
         <button 
           onClick={() => onAdvance(lead.id)} 
           disabled={lead.status === 'PAID' || !!activeAction} 
           className="flex-1 px-8 py-5 rounded-[24px] bg-indigo-600 text-[12px] font-black uppercase tracking-[0.2em] text-white hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all disabled:opacity-20"
         >
           Advance Recovery Phase
         </button>
      </div>
    </div>
  );
};

const AgentSection = ({ title, agentId, result, onRun, active }: { title: string, agentId: string, result: string | null, onRun: () => void, active: boolean }) => (
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-indigo-400' : 'text-zinc-500'}`}>{title}</h4>
      <button onClick={onRun} disabled={active} className="text-[10px] font-bold text-indigo-400 hover:text-white uppercase tracking-widest disabled:opacity-30">
        {active ? 'Analyzing...' : result ? 'Re-Run' : 'Deploy'}
      </button>
    </div>
    {result && (
       <div className={`rounded-3xl p-8 border shadow-xl animate-in fade-in slide-in-from-top-2 duration-500 ${
         agentId === 'STRATEGIST' ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-zinc-900 border-zinc'
       }`}>
          <p className="text-[11px] mono italic leading-loose text-zinc-300 whitespace-pre-wrap">{result}</p>
       </div>
    )}
  </section>
);

export default LeadDossier;
