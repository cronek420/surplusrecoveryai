
import React, { useState, useEffect, useMemo } from 'react';
import { Agent, Lead, ActivityLog, AgentRole, LeadStatus, ViewType } from './types';
import AgentCard from './components/AgentCard';
import LeadTable from './components/LeadTable';
import Terminal from './components/Terminal';
import ChatBot from './components/ChatBot';
import IntelligenceHub from './components/IntelligenceHub';
import LeadDossier from './components/LeadDossier';
import LiveAudioController from './components/LiveAudioController';
import TacticalMap from './components/TacticalMap';
import { 
  scoutSurplusFunds, 
  analyzeLead, 
  optimizeSkipTracingStrategy, 
  generateOutreachPlan, 
  generateClosingStrategy, 
  generateMasterStrategy, 
  generateFilingChecklist, 
  calculatePriorityScore,
  getPropertyInsights
} from './geminiService';

const INITIAL_AGENTS: Agent[] = [
  { id: 'SCOUTER', name: 'Scout-Net', description: 'Public Record Sweep.', status: 'IDLE', color: '#6366f1' },
  { id: 'TRACER', name: 'Shadow-Trace', description: 'Deep-Web Identity.', status: 'IDLE', color: '#a855f7' },
  { id: 'OUTREACH', name: 'Echo-Sync', description: 'Automated Outreach.', status: 'IDLE', color: '#f59e0b', isAutomated: true },
  { id: 'SURVEYOR', name: 'Surv-01', description: 'Geographic Intelligence.', status: 'IDLE', color: '#3b82f6' },
  { id: 'ANALYST', name: 'Data-Forge', description: 'Financial Intelligence.', status: 'IDLE', color: '#10b981' },
  { id: 'LEGAL', name: 'Lex-Analyst', description: 'Legal Logic Engine.', status: 'IDLE', color: '#ec4899' },
  { id: 'FILER', name: 'Veri-File', description: 'Payout Monitoring.', status: 'IDLE', color: '#8b5cf6' },
  { id: 'STRATEGIST', name: 'Core-AI', description: 'Swarm Strategist.', status: 'IDLE', color: '#ffffff' },
];

const STAGE_ORDER: LeadStatus[] = ['DISCOVERED', 'TRACED', 'CONTACTED', 'LEGAL_REVIEW', 'FILED', 'PAID'];

const reviveLeads = (data: any[]): Lead[] => {
  if (!Array.isArray(data)) return [];
  return data.map(l => ({
    ...l,
    documents: l.documents || [],
    priorityScore: l.priorityScore || 0,
    crmHistory: (l.crmHistory || []).map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) })),
    emailHistory: (l.emailHistory || []).map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })),
  }));
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('sr_auth') === 'true');
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('sr_leads');
      return saved ? reviveLeads(JSON.parse(saved)) : [];
    } catch { return []; }
  });
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [view, setView] = useState<ViewType>('OPERATIONS');
  
  const [discoveryQuota, setDiscoveryQuota] = useState(5);
  const [isAutoScouting, setIsAutoScouting] = useState(false);
  const [locationHint] = useState({ state: 'FL', county: 'Miami-Dade' });

  const [isDeepThinking, setIsDeepThinking] = useState(false);
  const [thinkingResult, setThinkingResult] = useState<string | null>(null);
  const [outreachResult, setOutreachResult] = useState<string | null>(null);
  const [closingResult, setClosingResult] = useState<string | null>(null);
  const [masterResult, setMasterResult] = useState<string | null>(null);
  const [filerResult, setFilerResult] = useState<string | null>(null);
  const [reconResult, setReconResult] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem('sr_leads', JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem('sr_auth', isAuthenticated.toString()); }, [isAuthenticated]);

  const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId) || null, [leads, selectedLeadId]);

  const stats = useMemo(() => {
    const totalDiscovered = leads.reduce((sum, l) => sum + l.amount, 0);
    const activeFiles = leads.filter(l => l.status !== 'PAID').length;
    return { totalDiscovered, activeFiles };
  }, [leads]);

  const addLog = (agentId: AgentRole, message: string, type: ActivityLog['type'] = 'INFO', leadId?: string) => {
    setLogs(prev => [{ id: Math.random().toString(36), agentId, message, timestamp: new Date(), type, leadId }, ...prev]);
  };

  const updateLead = (leadId: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...updates } : l));
  };

  const clearResults = () => {
    setThinkingResult(null);
    setOutreachResult(null);
    setClosingResult(null);
    setMasterResult(null);
    setFilerResult(null);
    setReconResult(null);
  };

  const handleSelectLead = (lead: Lead) => {
    if (selectedLeadId === lead.id) {
      setSelectedLeadId(null);
      clearResults();
      return;
    }
    setSelectedLeadId(lead.id);
    clearResults();
  };

  const advanceLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const currentIdx = STAGE_ORDER.indexOf(lead.status);
    if (currentIdx === STAGE_ORDER.length - 1) return;
    const nextStatus = STAGE_ORDER[currentIdx + 1];
    updateLead(leadId, { 
      status: nextStatus,
      crmHistory: [{
        id: Math.random().toString(36),
        agentId: 'STRATEGIST',
        timestamp: new Date(),
        action: 'Stage Advanced',
        details: `Progressed to ${nextStatus}`
      }, ...lead.crmHistory]
    });
    addLog('STRATEGIST', `Advanced ${lead.ownerName} to ${nextStatus}`, 'SUCCESS', leadId);
  };

  const runDiscovery = async (isManual = true) => {
    if (isManual) setIsAutoScouting(false);
    setAgents(prev => prev.map(a => a.id === 'SCOUTER' ? { ...a, status: 'WORKING' } : a));
    
    try {
      addLog('SCOUTER', `Scanning ${locationHint.county} public records...`, 'INFO');
      const result = await scoutSurplusFunds(locationHint.state, locationHint.county);
      const leadData = await analyzeLead(`Extracting details from: ${result.text.slice(0, 100)}`);
      
      const isDuplicate = leads.some(l => 
        l.ownerName.toLowerCase() === leadData.ownerName.toLowerCase() && 
        Math.abs(l.amount - leadData.amount) < 100
      );

      if (isDuplicate) {
        addLog('SCOUTER', `Duplicate data found for ${leadData.ownerName}. Searching next record...`, 'WARNING');
        if (isAutoScouting) setTimeout(() => runDiscovery(false), 3000);
        else setAgents(prev => prev.map(a => a.id === 'SCOUTER' ? { ...a, status: 'IDLE' } : a));
        return;
      }

      const newLead: Lead = {
        id: Math.random().toString(36).substring(7).toUpperCase(),
        ownerName: leadData.ownerName || 'PENDING IDENT',
        amount: leadData.amount || 0,
        lastKnownAddress: leadData.lastKnownAddress || '',
        propertyAddress: leadData.propertyAddress || '',
        county: locationHint.county.toUpperCase(),
        state: locationHint.state.toUpperCase(),
        courtCounty: `${locationHint.county.toUpperCase()} COURT`,
        verified: 'PENDING',
        socials: {},
        status: 'DISCOVERED',
        sourceUrl: result.sources[0]?.uri || '',
        notes: [],
        crmHistory: [{ id: '1', agentId: 'SCOUTER', timestamp: new Date(), action: 'Discovery', details: 'Record identified.' }],
        emailHistory: [],
        documents: [],
        priorityScore: 0,
        latLng: { 
          lat: 25.7617 + (Math.random() - 0.5) * 0.1, 
          lng: -80.1918 + (Math.random() - 0.5) * 0.1 
        }
      };

      newLead.priorityScore = await calculatePriorityScore(newLead);

      setLeads(prev => [newLead, ...prev]);
      addLog('SCOUTER', `Success: $${newLead.amount.toLocaleString()} Recovery Identified. Priority: ${newLead.priorityScore}%`, 'SUCCESS', newLead.id);
      
      if (isAutoScouting && leads.length + 1 < discoveryQuota) {
        setTimeout(() => runDiscovery(false), 4000);
      } else {
        setIsAutoScouting(false);
        setAgents(prev => prev.map(a => a.id === 'SCOUTER' ? { ...a, status: 'SUCCESS' } : a));
      }
    } catch (e) {
      setAgents(prev => prev.map(a => a.id === 'SCOUTER' ? { ...a, status: 'ERROR' } : a));
      setIsAutoScouting(false);
    }
  };

  const toggleAutoScout = () => {
    const newState = !isAutoScouting;
    setIsAutoScouting(newState);
    if (newState) runDiscovery(false);
  };

  const runMasterStrategy = async (lead: Lead) => {
    setIsDeepThinking(true);
    setAgents(prev => prev.map(a => a.id === 'STRATEGIST' ? { ...a, status: 'WORKING' } : a));
    try {
      const res = await generateMasterStrategy(lead);
      setMasterResult(res);
      addLog('STRATEGIST', `Generated master blueprint for ${lead.ownerName}`, 'SUCCESS', lead.id);
      setAgents(prev => prev.map(a => a.id === 'STRATEGIST' ? { ...a, status: 'SUCCESS' } : a));
    } catch (err) {
      setAgents(prev => prev.map(a => a.id === 'STRATEGIST' ? { ...a, status: 'ERROR' } : a));
    } finally { setIsDeepThinking(false); }
  };

  const runDeepTrace = async (lead: Lead) => {
    setIsDeepThinking(true);
    setAgents(prev => prev.map(a => a.id === 'TRACER' ? { ...a, status: 'WORKING' } : a));
    try {
      const res = await optimizeSkipTracingStrategy([], lead);
      setThinkingResult(res);
      addLog('TRACER', `Deep skip-trace complete for ${lead.ownerName}`, 'SUCCESS', lead.id);
      setAgents(prev => prev.map(a => a.id === 'TRACER' ? { ...a, status: 'SUCCESS' } : a));
    } catch (err) {
      setAgents(prev => prev.map(a => a.id === 'TRACER' ? { ...a, status: 'ERROR' } : a));
    } finally { setIsDeepThinking(false); }
  };

  const runOutreachGeneration = async (lead: Lead) => {
    setIsDeepThinking(true);
    setAgents(prev => prev.map(a => a.id === 'OUTREACH' ? { ...a, status: 'WORKING' } : a));
    try {
      const res = await generateOutreachPlan(lead);
      setOutreachResult(res);
      addLog('OUTREACH', `Optimized outreach sequences generated for ${lead.ownerName}`, 'SUCCESS', lead.id);
      setAgents(prev => prev.map(a => a.id === 'OUTREACH' ? { ...a, status: 'SUCCESS' } : a));
    } catch (err) {
      setAgents(prev => prev.map(a => a.id === 'OUTREACH' ? { ...a, status: 'ERROR' } : a));
    } finally { setIsDeepThinking(false); }
  };

  const runClosingStrategy = async (lead: Lead) => {
    setIsDeepThinking(true);
    setAgents(prev => prev.map(a => a.id === 'LEGAL' ? { ...a, status: 'WORKING' } : a));
    try {
      const res = await generateClosingStrategy(lead);
      setClosingResult(res);
      addLog('LEGAL', `Legal closing strategy finalized for ${lead.ownerName}`, 'SUCCESS', lead.id);
      setAgents(prev => prev.map(a => a.id === 'LEGAL' ? { ...a, status: 'SUCCESS' } : a));
    } catch (err) {
      setAgents(prev => prev.map(a => a.id === 'LEGAL' ? { ...a, status: 'ERROR' } : a));
    } finally { setIsDeepThinking(false); }
  };

  const runFilingChecklist = async (lead: Lead) => {
    setIsDeepThinking(true);
    setAgents(prev => prev.map(a => a.id === 'FILER' ? { ...a, status: 'WORKING' } : a));
    try {
      const res = await generateFilingChecklist(lead);
      setFilerResult(res);
      addLog('FILER', `Filing watchdog checklist compiled for ${lead.ownerName}`, 'SUCCESS', lead.id);
      setAgents(prev => prev.map(a => a.id === 'FILER' ? { ...a, status: 'SUCCESS' } : a));
    } catch (err) {
      setAgents(prev => prev.map(a => a.id === 'FILER' ? { ...a, status: 'ERROR' } : a));
    } finally { setIsDeepThinking(false); }
  };

  const runRecon = async (lead: Lead) => {
    setIsDeepThinking(true);
    setAgents(prev => prev.map(a => a.id === 'SURVEYOR' ? { ...a, status: 'WORKING' } : a));
    try {
      const res = await getPropertyInsights(lead.propertyAddress || lead.lastKnownAddress, lead.latLng?.lat, lead.latLng?.lng);
      setReconResult(res.text);
      addLog('SURVEYOR', `Property recon successful for ${lead.propertyAddress}`, 'SUCCESS', lead.id);
      setAgents(prev => prev.map(a => a.id === 'SURVEYOR' ? { ...a, status: 'SUCCESS' } : a));
    } catch (err) {
      setAgents(prev => prev.map(a => a.id === 'SURVEYOR' ? { ...a, status: 'ERROR' } : a));
    } finally { setIsDeepThinking(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-black flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] rounded-full scale-50" />
        <div className="w-full max-w-sm p-12 bg-[#0c0c0e] rounded-[32px] border border-white/5 shadow-2xl relative">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="w-16 h-16 bg-white rounded-[20px] mb-8 flex items-center justify-center shadow-xl shadow-white/5">
              <div className="w-8 h-8 bg-black rounded-lg" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Recovery Console</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-3 leading-relaxed">Identity Auth Required</p>
          </div>
          <button onClick={() => setIsAuthenticated(true)} className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl text-sm transition-all hover:bg-indigo-500 active:scale-[0.98]">Initialize Linkage</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-black selection:bg-indigo-500/30">
      <aside className="w-[280px] border-r border-zinc flex flex-col bg-[#09090b] z-40">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-10 group cursor-default">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm" />
            </div>
            <span className="text-lg font-extrabold tracking-tighter">SR-AI <span className="text-indigo-500">Workhorse</span></span>
          </div>
          <nav className="space-y-1">
            <button onClick={() => setView('OPERATIONS')} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${view === 'OPERATIONS' ? 'bg-white/5 text-indigo-400' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
              Operations Deck
            </button>
            <button onClick={() => setView('TACTICAL_MAP')} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${view === 'TACTICAL_MAP' ? 'bg-white/5 text-indigo-400' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
              Tactical Map
            </button>
            <button onClick={() => setView('INTELLIGENCE')} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${view === 'INTELLIGENCE' ? 'bg-white/5 text-indigo-400' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
              Intelligence Hub
            </button>
            <button onClick={() => setView('AUDIT')} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${view === 'AUDIT' ? 'bg-white/5 text-indigo-400' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
              Audit Stream
            </button>
          </nav>
        </div>
        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scroll space-y-8">
          <div>
            <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-6 px-1">Agent Swarm</h3>
            <div className="space-y-1">
              {agents.map(agent => (
                <div key={agent.id} className="relative">
                  <AgentCard agent={agent} />
                  {agent.id === 'SCOUTER' && isAutoScouting && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-zinc bg-zinc-950/30">
          <LiveAudioController />
          <button onClick={() => setIsAuthenticated(false)} className="mt-4 w-full text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-rose-500 transition-colors">Terminate Session</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#0c0c0e] relative">
        <div className="h-10 bg-black border-b border-zinc overflow-hidden flex items-center">
            <div className="animate-marquee whitespace-nowrap flex gap-12">
               {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mono">
                    <span>SYSTEM STATUS: <span className="text-emerald-500">OPTIMAL</span></span>
                    <span>PIPELINE VALUE: <span className="text-indigo-400">${stats.totalDiscovered.toLocaleString()}</span></span>
                    <span>ACTIVE TARGETS: <span className="text-white">{stats.activeFiles}</span></span>
                  </div>
               ))}
            </div>
        </div>
        <header className="h-16 border-b border-zinc flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
          <h2 className="text-sm font-extrabold tracking-tight uppercase tracking-widest">{view.replace('_', ' ')}</h2>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-zinc-900 border border-zinc rounded-xl px-4 py-1.5 gap-3">
               <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Quota</span>
               <input 
                 type="number" 
                 value={discoveryQuota} 
                 onChange={(e) => setDiscoveryQuota(Math.max(1, parseInt(e.target.value) || 1))}
                 className="w-10 bg-transparent text-xs font-bold text-indigo-400 focus:outline-none"
               />
               <div className="w-[1px] h-4 bg-zinc-800" />
               <button 
                onClick={toggleAutoScout}
                className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isAutoScouting ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}
               >
                 {isAutoScouting ? 'Stop' : 'Auto-Scout'}
               </button>
            </div>
            <button onClick={() => runDiscovery(true)} className="bg-white text-black px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:bg-zinc-200">Manual Scout</button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
           {view === 'OPERATIONS' ? (
             <LeadTable leads={leads} onSelectLead={handleSelectLead} onAdvanceLead={advanceLead} />
           ) : view === 'TACTICAL_MAP' ? (
             <TacticalMap leads={leads} onSelectLead={handleSelectLead} />
           ) : view === 'AUDIT' ? (
             <div className="p-10 h-full"><Terminal logs={logs} /></div>
           ) : (
             <IntelligenceHub selectedLead={selectedLead} leads={leads} />
           )}
        </div>

        <div className={`fixed bottom-10 z-[60] w-[400px] transition-all duration-500 ease-in-out ${selectedLead ? 'right-[640px]' : 'right-10'}`}>
           <ChatBot />
        </div>
      </main>

      <div className={`dossier-panel fixed top-0 right-0 h-full w-[600px] bg-[#0c0c0e] border-l border-zinc z-50 flex flex-col shadow-[-40px_0_80px_rgba(0,0,0,0.8)] ${selectedLead ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedLead && (
          <LeadDossier 
            lead={selectedLead}
            onClose={() => { setSelectedLeadId(null); clearResults(); }}
            onAdvance={advanceLead}
            runMaster={runMasterStrategy}
            runTrace={runDeepTrace}
            runOutreach={runOutreachGeneration}
            runLegal={runClosingStrategy}
            runFiling={runFilingChecklist}
            runRecon={runRecon}
            masterResult={masterResult}
            thinkingResult={thinkingResult}
            outreachResult={outreachResult}
            closingResult={closingResult}
            filerResult={filerResult}
            reconResult={reconResult}
            isDeepThinking={isDeepThinking}
            updateLead={updateLead}
          />
        )}
      </div>
    </div>
  );
};

export default App;
