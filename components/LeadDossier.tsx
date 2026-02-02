
import React, { useState } from 'react';
import { Lead, LeadDocument } from '../types';
import { analyzeDocumentImage, generateCorrespondence, refineCorrespondence, getTacticalAdvice } from '../geminiService';

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
  
  // Communications Lab State
  const [commMode, setCommMode] = useState<'EMAIL' | 'SMS' | 'PHONE' | 'LETTER'>('EMAIL');
  const [commContext, setCommContext] = useState<'COLD' | 'RESPONSE' | 'FOLLOWUP' | 'CLOSE'>('COLD');
  const [commResult, setCommResult] = useState<string | null>(null);
  const [isGeneratingComm, setIsGeneratingComm] = useState(false);
  
  // Refinement State
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Advice State
  const [adviceQuestion, setAdviceQuestion] = useState('');
  const [adviceResult, setAdviceResult] = useState<string | null>(null);
  const [isAskingAdvice, setIsAskingAdvice] = useState(false);

  const wrapAction = async (name: string, fn: (l: Lead) => void) => {
    setActiveAction(name);
    try {
      await fn(lead);
    } finally {
      setActiveAction(null);
    }
  };

  const deployCommAgent = async () => {
    setIsGeneratingComm(true);
    setCommResult(null);
    try {
      const result = await generateCorrespondence(lead, commMode, commContext);
      setCommResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingComm(false);
    }
  };

  const handleRefine = async () => {
    if (!commResult || !refinementInput.trim()) return;
    setIsRefining(true);
    try {
      const refined = await refineCorrespondence(lead, commResult, refinementInput);
      setCommResult(refined);
      setRefinementInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleAskAdvice = async () => {
    if (!adviceQuestion.trim()) return;
    setIsAskingAdvice(true);
    try {
      const advice = await getTacticalAdvice(lead, adviceQuestion);
      setAdviceResult(advice);
      setAdviceQuestion('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAskingAdvice(false);
    }
  };

  const finalizeCommunication = () => {
    if (!commResult) return;
    updateLead(lead.id, {
      crmHistory: [{
        id: Math.random().toString(),
        agentId: 'CORRESPONDENT',
        timestamp: new Date(),
        action: `Directive Finalized: ${commMode}`,
        details: `Lexicon Swarm synchronized outreach draft for Tom.`
      }, ...lead.crmHistory],
      notes: [`[LEXICON ${commMode}] ${commResult.slice(0, 100)}...`, ...lead.notes]
    });
    alert("Draft finalized and synchronized with Lexicon Operational Memory.");
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
            action: 'Execution: Doc Parse',
            details: `Extracted Case OBJ-${analysis.caseNumber} via Lexicon Logic.`
          }, ...lead.crmHistory]
        });
      } catch (err) {
        console.error("Execution Error", err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e]">
      <div className="p-10 border-b border-zinc bg-black/80 backdrop-blur-3xl sticky top-0 z-20 flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-lg text-indigo-400">OBJ-{lead.id.slice(-6)}</span>
            <div className="flex items-center gap-3">
               <div className="w-24 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${lead.priorityScore || 0}%` }} />
               </div>
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{lead.priorityScore || 0}% RANK</span>
            </div>
          </div>
          <h3 className="text-4xl font-black tracking-tighter text-white">{lead.ownerName}</h3>
          <div className="text-emerald-500 font-black mono text-3xl tracking-tighter mt-3 flex items-center gap-2">
            ${lead.amount.toLocaleString()}
            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-600">ASSET VALUE</span>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-600 hover:text-white p-4 bg-zinc-900/50 rounded-full transition-all border border-zinc hover:border-white/20">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll p-10 space-y-16 pb-48">
        
        {/* Lexicon Advisor Briefing */}
        <section className="space-y-6">
          <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-[40px] p-10 space-y-6 shadow-3xl">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-indigo-400 lexicon-glow" />
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">War-Room Advisor Briefing</span>
                </div>
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Master: Thomas Gronek</span>
             </div>
             <div className="flex gap-4 border-b border-white/5 pb-4">
                <input 
                  type="text" 
                  placeholder="Request tactical pivot or strategic intelligence..."
                  value={adviceQuestion}
                  onChange={(e) => setAdviceQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAdvice()}
                  className="flex-1 bg-transparent py-3 text-[13px] font-bold text-white focus:outline-none placeholder-zinc-800"
                />
                <button onClick={handleAskAdvice} disabled={isAskingAdvice} className="text-indigo-400 hover:text-white transition-all transform hover:scale-110">
                  {isAskingAdvice ? (
                    <div className="w-5 h-5 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="3" /></svg>
                  )}
                </button>
             </div>
             {adviceResult && (
               <div className="text-[12px] mono text-zinc-300 leading-relaxed border-l-4 border-indigo-500/30 pl-8 py-6 mt-6 bg-black/40 rounded-r-3xl animate-in fade-in slide-in-from-left-4 duration-500 whitespace-pre-wrap">
                  {adviceResult}
               </div>
             )}
          </div>
        </section>

        {/* SentinelLink Outreach Execution */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-zinc/20 pb-4">
             <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">SentinelLink Outreach Engine</h4>
             <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Protocol: Direct Execution</span>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="flex flex-col gap-3">
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest px-2">Channel Matrix</span>
                <div className="flex flex-wrap gap-1.5 bg-zinc-900/30 p-1.5 rounded-2xl border border-zinc/20">
                   {(['EMAIL', 'SMS', 'PHONE', 'LETTER'] as const).map(m => (
                      <button 
                        key={m} 
                        onClick={() => setCommMode(m)}
                        className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${commMode === m ? 'bg-indigo-600 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/5'}`}
                      >
                        {m}
                      </button>
                   ))}
                </div>
             </div>
             <div className="flex flex-col gap-3">
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest px-2">Phase Vector</span>
                <select 
                  value={commContext}
                  onChange={(e) => setCommContext(e.target.value as any)}
                  className="bg-zinc-900/50 border border-zinc/20 text-[10px] font-black text-zinc-400 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500/50 uppercase tracking-tighter"
                >
                  <option value="COLD">Initial Engagement</option>
                  <option value="RESPONSE">Requirement Processing</option>
                  <option value="FOLLOWUP">Escalated Follow-up</option>
                  <option value="CLOSE">Disbursement Settlement</option>
                </select>
             </div>
          </div>

          {!commResult ? (
            <button 
              onClick={deployCommAgent}
              disabled={isGeneratingComm}
              className={`w-full py-8 rounded-3xl text-[12px] font-black uppercase tracking-[0.3em] transition-all ${isGeneratingComm ? 'bg-zinc-800 text-zinc-600 border border-zinc' : 'bg-white text-black hover:bg-zinc-200 shadow-3xl shadow-white/5'}`}
            >
              {isGeneratingComm ? 'Synthesizing Lexicon Sequence...' : 'Deploy Outreach Directive'}
            </button>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="relative group">
                <textarea 
                  value={commResult}
                  onChange={(e) => setCommResult(e.target.value)}
                  className="w-full h-[450px] bg-[#08080a] border border-zinc/30 rounded-[40px] p-10 text-[14px] mono leading-relaxed text-zinc-200 focus:outline-none focus:border-indigo-500/50 resize-none shadow-inner"
                />
                <div className="absolute top-8 right-8 flex gap-3">
                  <button 
                    onClick={() => navigator.clipboard.writeText(commResult)}
                    className="px-5 py-3 bg-zinc-900 border border-zinc rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    Copy
                  </button>
                  <button 
                    onClick={finalizeCommunication}
                    className="px-5 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    Finalize
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Request Lexicon to pivot drafting logic... (e.g., 'more aggressive tone')"
                  value={refinementInput}
                  onChange={(e) => setRefinementInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                  className="flex-1 bg-zinc-900/50 border border-zinc/20 rounded-2xl px-6 py-4 text-[12px] font-bold text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-all placeholder-zinc-800"
                />
                <button 
                  onClick={handleRefine}
                  disabled={isRefining || !refinementInput}
                  className="px-10 py-4 bg-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-30 active:scale-95"
                >
                  {isRefining ? 'Pivoting...' : 'Refine'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Operational Swarm Execution */}
        <div className="space-y-12">
          <div className="border-b border-zinc/20 pb-4">
             <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Swarm Directive Execution</h4>
          </div>
          <AgentSection title="Master Strategy Blueprint" agentId="STRATEGIST" result={masterResult} onRun={() => wrapAction('master', runMaster)} active={activeAction === 'master'} />
          <AgentSection title="Geographic Reconnaisance" agentId="SURVEYOR" result={reconResult} onRun={() => wrapAction('recon', runRecon)} active={activeAction === 'recon'} />
          <AgentSection title="Deep Skip-Trace Intelligence" agentId="TRACER" result={thinkingResult} onRun={() => wrapAction('trace', runTrace)} active={activeAction === 'trace'} />
          <AgentSection title="Legal Filing Architecture" agentId="LEGAL" result={closingResult} onRun={() => wrapAction('legal', runLegal)} active={activeAction === 'legal'} />
          <AgentSection title="Payout Verification Matrix" agentId="FILER" result={filerResult} onRun={() => wrapAction('filing', runFiling)} active={activeAction === 'filing'} />
        </div>

        <section className="space-y-8 pb-32">
           <h4 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] border-b border-zinc/20 pb-4">Operational Execution Log</h4>
           <div className="space-y-4">
              {lead.crmHistory.map(h => (
                <div key={h.id} className="p-6 bg-zinc-950/40 border border-zinc/30 rounded-3xl group hover:border-indigo-500/20 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-black uppercase px-3 py-1 rounded bg-zinc-900 text-indigo-400 border border-indigo-500/10">{h.agentId}</span>
                    <span className="text-[9px] mono text-zinc-700 uppercase tracking-widest">{new Date(h.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[12px] font-black text-zinc-200">{h.action}</div>
                  <div className="text-[11px] text-zinc-500 mt-2 italic leading-relaxed border-l border-zinc/20 pl-4">{h.details}</div>
                </div>
              ))}
           </div>
        </section>
      </div>

      <div className="p-10 bg-black/90 backdrop-blur-3xl border-t border-zinc flex gap-6 sticky bottom-0 z-20 shadow-4xl">
         <button 
           onClick={() => onAdvance(lead.id)} 
           disabled={lead.status === 'PAID' || !!activeAction} 
           className="flex-1 px-10 py-6 rounded-[32px] bg-indigo-600 text-[13px] font-black uppercase tracking-[0.3em] text-white hover:bg-indigo-500 hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] transition-all disabled:opacity-20 active:scale-98"
         >
           Advance Recovery Phase
         </button>
      </div>
    </div>
  );
};

const AgentSection = ({ title, agentId, result, onRun, active }: { title: string, agentId: string, result: string | null, onRun: () => void, active: boolean }) => (
  <section className="space-y-5">
    <div className="flex items-center justify-between">
      <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] ${active ? 'text-indigo-400' : 'text-zinc-500'}`}>{title}</h4>
      <button onClick={onRun} disabled={active} className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest disabled:opacity-30 border border-indigo-500/20 px-4 py-2 rounded-xl transition-all hover:bg-indigo-500/10">
        {active ? 'Analyzing...' : result ? 'Refresh Directive' : 'Trigger Execution'}
      </button>
    </div>
    {result && (
       <div className={`rounded-[32px] p-10 border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700 ${
         agentId === 'STRATEGIST' ? 'bg-indigo-600/5 border-indigo-500/30' : 'bg-[#08080a] border-zinc/30'
       }`}>
          <p className="text-[12px] mono italic leading-loose text-zinc-300 whitespace-pre-wrap">{result}</p>
       </div>
    )}
  </section>
);

export default LeadDossier;
