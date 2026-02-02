
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
  { id: 'CORRESPONDENT', name: 'SentinelLink', description: 'Strategic Outreach & Advisor.', status: 'IDLE', color: '#f59e0b' },
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
  
  const [discoveryQuota, setDiscoveryQuota] = useState(() => {
    const saved = localStorage.getItem('sr_quota');
    return saved ? parseInt(saved) : 5;
  });
  const [isAutoScouting, setIsAutoScouting] = useState(false);
  const [autoStartOnLoad, setAutoStartOnLoad] = useState(() => localStorage.getItem('sr_autostart') === 'true');
  
  const [locationHint, setLocationHint] = useState(() => {
    const saved = localStorage.getItem('sr_location');
    return saved ? JSON.parse(saved) : { state: 'FL', county: 'Miami-Dade' };
  });
  const [searchMode, setSearchMode] = useState<'GEOGRAPHIC' | 'CUSTOM'>('GEOGRAPHIC');
  const [customQuery, setCustomQuery] = useState('');

  const [isDeepThinking, setIsDeepThinking] = useState(false);
  const [masterResult, setMasterResult] = useState<string | null>(null);
  const [thinkingResult, setThinkingResult] = useState<string | null>(null);
  const [outreachResult, setOutreachResult] = useState<string | null>(null);
  const [closingResult, setClosingResult] = useState<string | null>(null);
  const [filerResult, setFilerResult] = useState<string | null>(null);
  const [reconResult, setReconResult] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem('sr_leads', JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem('sr_auth', isAuthenticated.toString()); }, [isAuthenticated]);
  useEffect(() => { localStorage.setItem('sr_location', JSON.stringify(locationHint)); }, [locationHint]);
  useEffect(() => { localStorage.setItem('sr_autostart', autoStartOnLoad.toString()); }, [autoStartOnLoad]);
  useEffect(() => { localStorage.setItem('sr_quota', discoveryQuota.toString()); }, [discoveryQuota]);

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
        details: `Lexicon Swarm progressed ${lead.ownerName} to ${nextStatus}`
      }, ...lead.crmHistory]
    });
    addLog('STRATEGIST', `Advanced ${lead.ownerName} to ${nextStatus}`, 'SUCCESS', leadId);
  };

  const runDiscovery = async (isManual = true) => {
    // quota check
    if (leads.length >= discoveryQuota) {
      addLog('SCOUTER', `Resource Quota Exhausted (${discoveryQuota}/${discoveryQuota}). Discovery Halted.`, 'WARNING');
      setAgents(prev => prev.map(a => a.id === 'SCOUTER' ? { ...a, status: 'IDLE' } : a));
      setIsAutoScouting(false);
      return;
    }

    if (isManual) setIsAutoScouting(false);
    setAgents(prev => prev.map(a => a.id === 'SCOUTER' ? { ...a, status: 'WORKING' } : a));
    
    try {
      const targetStr = searchMode === 'GEOGRAPHIC' 
        ? `${locationHint.county}, ${locationHint.state}`
        : customQuery || "general surplus opportunities";

      addLog('SCOUTER', `Target Lock: [${targetStr}]. Executing Discovery Directive...`, 'INFO');
      
      const result = await scoutSurplusFunds(
        searchMode === 'GEOGRAPHIC' ? locationHint.state : '', 
        searchMode === 'GEOGRAPHIC' ? locationHint.county : customQuery
      );
      
      if (!result.text || result.text.length < 10) {
        throw new Error("EMPTY_RESULT: No meaningful data returned from search grounding.");
      }

      const leadData = await analyzeLead(`Parsing packet for Tom: ${result.text.slice(0, 1000)}`);
      
      const isDuplicate = leads.some(l => 
        l.ownerName.toLowerCase() === leadData.ownerName?.toLowerCase() || 
        (leadData.caseNumber && l.caseNumber === leadData.caseNumber)
      );

      if (isDuplicate) {
        addLog('SCOUTER', `Duplicate found: ${leadData.ownerName}. Searching new block...`, 'WARNING');
        // Recursively trigger next if still under quota and in auto-mode
        if (isAutoScouting) {
          setTimeout(() => runDiscovery(false), 30000); 
        } else {
          setAgents(prev => prev.map(a => a.id === 'SCOUTER' ? { ...a, status: 'IDLE' } : a));
        }
        return;
      }

      const newLead: Lead = {
        id: Math.random().toString(36).substring(7).toUpperCase(),
        ownerName: leadData.ownerName || 'UNKNOWN',
        amount: leadData.amount || 0,
        lastKnownAddress: '',
        propertyAddress: '',
        county: (searchMode === 'GEOGRAPHIC' ? locationHint.county : (leadData.county || 'UNKNOWN')).toUpperCase(),
        state: (searchMode === 'GEOGRAPHIC' ? locationHint.state : (leadData.state || 'UNKNOWN')).toUpperCase(),
        courtCounty: `${(searchMode === 'GEOGRAPHIC' ? locationHint.county : 'LOCAL').toUpperCase()} COURT`,
        verified: 'PENDING',
        socials: {},
        status: 'DISCOVERED',
        sourceUrl: result.sources?.[0]?.uri || '',
        notes: [],
        crmHistory: [{ id: '1', agentId: 'SCOUTER', timestamp: new Date(), action: 'Discovery', details: `Target identified via Lexicon Search Grounding.` }],
        emailHistory: [],
        documents: [],
        priorityScore: 0,
        caseNumber: leadData.caseNumber,
        latLng: { 
          lat: 25.7617 + (Math.random() - 0.5) * 5.0, 
          lng: -80.1918 + (Math.random() - 0.5) * 5.0 
        }
      };

      newLead.priorityScore = await calculatePriorityScore(newLead);
      setLeads(prev => [newLead, ...prev]);
      addLog('SCOUTER', `Discovery Complete: $${newLead.amount.toLocaleString()}. Priority ${newLead.priorityScore}%`, 'SUCCESS', newLead.id);
      
      // Check quota again after addition
      if (isAutoScouting && (leads.length) < discoveryQuota) {
        setTimeout(() => runDiscovery(false), 30000); 
      } else {
        if (isAutoScouting) {
           addLog('STRATEGIST', `Quota Met (${discoveryQuota}). Deactivating auto-swarm.`, 'SUCCESS');
        }
        setIsAutoScouting(false);
        setAgents(prev => prev.map(a => a.id === 'SCOUTER' ? { ...a, status: 'SUCCESS' } : a));
      }
    } catch (e: any) {
      const errorMsg = typeof e === 'string' ? e : e.message || JSON.stringify(e);
      addLog('SCOUTER', `Execution Error: ${errorMsg}. Self-annealing triggered.`, 'ERROR');
      setAgents(prev => prev.map(a => a.id === 'SCOUTER' ? { ...a, status: 'ERROR' } : a));
      setIsAutoScouting(false);
    }
  };

  const toggleAutoScout = () => {
    const newState = !isAutoScouting;
    setIsAutoScouting(newState);
    if (newState) runDiscovery(false);
  };

  // Improved auto-start with quota awareness
  useEffect(() => {
    if (isAuthenticated && autoStartOnLoad) {
      if (leads.length < discoveryQuota) {
        addLog('STRATEGIST', 'AUTO-START ACTIVATED: Initiating Lexicon Discovery Sequence...', 'INFO');
        setIsAutoScouting(true);
        runDiscovery(false);
      } else {
        addLog('STRATEGIST', `AUTO-START ABORTED: Quota (${discoveryQuota}) already satisfied.`, 'INFO');
      }
    }
  }, [isAuthenticated]);

  const runMasterStrategy = async (lead: Lead) => {
    setIsDeepThinking(true);
    setAgents(prev => prev.map(a => a.id === 'STRATEGIST' ? { ...a, status: 'WORKING' } : a));
    try {
      const res = await generateMasterStrategy(lead);
      setMasterResult(res);
      addLog('STRATEGIST', `Generated Master Blueprint for Tom regarding ${lead.ownerName}`, 'SUCCESS', lead.id);
      setAgents(prev => prev.map(a => a.id === 'STRATEGIST' ? { ...a, status: 'SUCCESS' } : a));
    } catch (err) { setAgents(prev => prev.map(a => a.id === 'STRATEGIST' ? { ...a, status: 'ERROR' } : a));
    } finally { setIsDeepThinking(false); }
  };

  const runDeepTrace = async (lead: Lead) => {
    setIsDeepThinking(true);
    setAgents(prev => prev.map(a => a.id === 'TRACER' ? { ...a, status: 'WORKING' } : a));
    try {
      const res = await optimizeSkipTracingStrategy([], lead);
      setThinkingResult(res);
      addLog('TRACER', `Deep Trace successful for ${lead.ownerName}`, 'SUCCESS', lead.id);
      setAgents(prev => prev.map(a => a.id === 'TRACER' ? { ...a, status: 'SUCCESS' } : a));
    } catch (err) { setAgents(prev => prev.map(a => a.id === 'TRACER' ? { ...a, status: 'ERROR' } : a));
    } finally { setIsDeepThinking(false); }
  };

  const runOutreachGeneration = async (lead: Lead) => {
    setIsDeepThinking(true);
    setAgents(prev => prev.map(a => a.id['CORRESPONDENT'] ? { ...a, status: 'WORKING' } : a));
    try {
      const res = await generateOutreachPlan(lead);
      setOutreachResult(res);
      addLog('CORRESPONDENT', `Outreach directive synthesized for ${lead.ownerName}`, 'SUCCESS', lead.id);
      setAgents(prev => prev.map(a => a.id === 'CORRESPONDENT' ? { ...a, status: 'SUCCESS' } : a));
    } catch (err) { setAgents(prev => prev.map(a => a.id === 'CORRESPONDENT' ? { ...a, status: 'ERROR' } : a));
    } finally { setIsDeepThinking(false); }
  };

  const runClosingStrategy = async (lead: Lead) => {
    setIsDeepThinking(true);
    setAgents(prev => prev.map(a => a.id === 'LEGAL' ? { ...a, status: 'WORKING' } : a));
    try {
      const res = await generateClosingStrategy(lead);
      setClosingResult(res);
      addLog('LEGAL', `Legal Filing Strategy ready for Tom's review.`, 'SUCCESS', lead.id);
      setAgents(prev => prev.map(a => a.id === 'LEGAL' ? { ...a, status: 'SUCCESS' } : a));
    } catch (err) { setAgents(prev => prev.map(a => a.id === 'LEGAL' ? { ...a, status: 'ERROR' } : a));
    } finally { setIsDeepThinking(false); }
  };

  const runFilingChecklist = async (lead: Lead) => {
    setIsDeepThinking(true);
    setAgents(prev => prev.map(a => a.id === 'FILER' ? { ...a, status: 'WORKING' } : a));
    try {
      const res = await generateFilingChecklist(lead);
      setFilerResult(res);
      addLog('FILER', `Deterministic Checklist generated for ${lead.ownerName}`, 'SUCCESS', lead.id);
      setAgents(prev => prev.map(a => a.id === 'FILER' ? { ...a, status: 'SUCCESS' } : a));
    } catch (err) { setAgents(prev => prev.map(a => a.id === 'FILER' ? { ...a, status: 'ERROR' } : a));
    } finally { setIsDeepThinking(false); }
  };

  const runRecon = async (lead: Lead) => {
    setIsDeepThinking(true);
    setAgents(prev => prev.map(a => a.id === 'SURVEYOR' ? { ...a, status: 'WORKING' } : a));
    try {
      const res = await getPropertyInsights(lead.propertyAddress || lead.lastKnownAddress, lead.latLng?.lat, lead.latLng?.lng);
      setReconResult(res.text);
      addLog('SURVEYOR', `Geographic Recon successful for ${lead.ownerName}`, 'SUCCESS', lead.id);
      setAgents(prev => prev.map(a => a.id === 'SURVEYOR' ? { ...a, status: 'SUCCESS' } : a));
    } catch (err) { setAgents(prev => prev.map(a => a.id === 'SURVEYOR' ? { ...a, status: 'ERROR' } : a));
    } finally { setIsDeepThinking(false); }
  };

  const handleVoiceCommand = (command: string) => {
    const normalized = command.toLowerCase();
    addLog('STRATEGIST', `Voice Command Recognized: "${command}"`, 'SUCCESS');
    
    if (normalized.includes('discovery') || normalized.includes('scout')) {
      runDiscovery(true);
    } else if (normalized.includes('map')) {
      setView('TACTICAL_MAP');
    } else if (normalized.includes('deck') || normalized.includes('operations')) {
      setView('OPERATIONS');
    } else if (normalized.includes('audit') || normalized.includes('terminal')) {
      setView('AUDIT');
    } else if (normalized.includes('intelligence') || normalized.includes('hub')) {
      setView('INTELLIGENCE');
    } else if (normalized.includes('enable auto') || normalized.includes('start auto')) {
      setIsAutoScouting(true);
      runDiscovery(false);
    } else if (normalized.includes('disable auto') || normalized.includes('stop auto')) {
      setIsAutoScouting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-black flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-indigo-500/10 blur-[150px] rounded-full scale-50" />
        <div className="w-full max-w-md p-12 bg-[#0c0c0e] rounded-[40px] border border-white/5 shadow-3xl relative">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="w-20 h-20 bg-white rounded-[24px] mb-8 flex items-center justify-center shadow-2xl shadow-white/5">
              <div className="w-10 h-10 bg-black rounded-xl" />
            </div>
            <h1 className="text-3xl font-black tracking-tight uppercase">Lexicon <span className="text-indigo-500">Solutions</span></h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4 leading-relaxed">Master Identity Authentication Required</p>
          </div>
          <button onClick={() => setIsAuthenticated(true)} className="w-full bg-indigo-600 text-white font-black py-6 rounded-2xl text-[12px] uppercase tracking-widest transition-all hover:bg-indigo-500 active:scale-[0.98]">Initialize Master Link</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-black selection:bg-indigo-500/30">
      <aside className="w-[300px] border-r border-zinc flex flex-col bg-[#050507] z-40">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-10 group cursor-default">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center lexicon-glow">
              <div className="w-5 h-5 bg-white rounded-md" />
            </div>
            <div className="flex flex-col">
               <span className="text-lg font-black tracking-tighter text-white uppercase">Lexicon</span>
               <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Solutions Swarm</span>
            </div>
          </div>
          <nav className="space-y-1">
            <button onClick={() => setView('OPERATIONS')} className={`w-full text-left px-5 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${view === 'OPERATIONS' ? 'bg-white/5 text-indigo-400' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
              Operational Deck
            </button>
            <button onClick={() => setView('TACTICAL_MAP')} className={`w-full text-left px-5 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${view === 'TACTICAL_MAP' ? 'bg-white/5 text-indigo-400' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
              Tactical Heatmap
            </button>
            <button onClick={() => setView('INTELLIGENCE')} className={`w-full text-left px-5 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${view === 'INTELLIGENCE' ? 'bg-white/5 text-indigo-400' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
              Intelligence Hub
            </button>
            <button onClick={() => setView('AUDIT')} className={`w-full text-left px-5 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${view === 'AUDIT' ? 'bg-white/5 text-indigo-400' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
              System Audit Stream
            </button>
          </nav>
        </div>
        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scroll space-y-10">
          <div>
            <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-6 px-1">Agent Swarm</h3>
            <div className="space-y-1">
              {agents.map(agent => (
                <div key={agent.id} className="relative">
                  <AgentCard agent={agent} />
                  {agent.id === 'SCOUTER' && isAutoScouting && (
                    <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-8 border-t border-zinc bg-zinc-950/20">
          <LiveAudioController onCommand={handleVoiceCommand} />
          <button onClick={() => setIsAuthenticated(false)} className="mt-6 w-full text-[10px] font-black text-zinc-700 uppercase tracking-widest hover:text-rose-500 transition-colors">Terminate Master Session</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#0c0c0e] relative">
        <div className="h-10 bg-black border-b border-zinc overflow-hidden flex items-center">
            <div className="animate-marquee whitespace-nowrap flex gap-16">
               {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-16 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 mono">
                    <span>IDENTITY: <span className="text-indigo-400">THOMAS GRONEK</span></span>
                    <span>PROTOCOL: <span className="text-emerald-500">3-LAYER ARCHITECTURE ACTIVE</span></span>
                    <span>SYSTEM STATE: <span className="text-emerald-500">STABLE</span></span>
                    <span>SWARM ASSET VALUE: <span className="text-white">${stats.totalDiscovered.toLocaleString()}</span></span>
                    <span>SELF-ANNEALING: <span className="text-amber-500">READY</span></span>
                  </div>
               ))}
            </div>
        </div>
        
        <header className="h-28 border-b border-zinc flex flex-col justify-center px-10 bg-black/40 backdrop-blur-3xl sticky top-0 z-30">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Target Directives</span>
                  <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc p-2 rounded-xl">
                    <select 
                      value={searchMode} 
                      onChange={(e) => setSearchMode(e.target.value as any)}
                      className="bg-transparent text-[10px] font-black text-zinc-400 border-none focus:outline-none px-3 uppercase tracking-tighter"
                    >
                      <option value="GEOGRAPHIC">Geographic Recon</option>
                      <option value="CUSTOM">Deep Search Execution</option>
                    </select>
                    <div className="w-[1px] h-4 bg-zinc-800" />
                    {searchMode === 'GEOGRAPHIC' ? (
                      <div className="flex items-center gap-3">
                        <input 
                          type="text" 
                          placeholder="STATE" 
                          value={locationHint.state}
                          onChange={(e) => setLocationHint({...locationHint, state: e.target.value.toUpperCase().slice(0, 2)})}
                          className="w-12 bg-transparent text-[10px] font-black text-white focus:outline-none placeholder-zinc-700 uppercase text-center"
                        />
                        <input 
                          type="text" 
                          placeholder="ENTER COUNTY..." 
                          value={locationHint.county}
                          onChange={(e) => setLocationHint({...locationHint, county: e.target.value})}
                          className="w-40 bg-transparent text-[10px] font-black text-white focus:outline-none placeholder-zinc-700"
                        />
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        placeholder="ENTER DEEP SEARCH COMMAND..." 
                        value={customQuery}
                        onChange={(e) => setCustomQuery(e.target.value)}
                        className="w-72 bg-transparent text-[10px] font-black text-white focus:outline-none placeholder-zinc-700"
                      />
                    )}
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                   <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Auto-Start On Load</span>
                   <button 
                     onClick={() => setAutoStartOnLoad(!autoStartOnLoad)}
                     className={`p-1.5 rounded-lg border transition-all ${autoStartOnLoad ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-zinc bg-zinc-900/50'}`}
                   >
                     <div className={`w-8 h-4 rounded-full relative transition-colors ${autoStartOnLoad ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${autoStartOnLoad ? 'left-4.5' : 'left-0.5'}`} />
                     </div>
                   </button>
                </div>
                <div className="flex flex-col items-end mr-6">
                   <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Queue Resource Quota</span>
                   <div className="flex items-center bg-zinc-900/50 border border-zinc rounded-xl px-5 py-2.5 gap-4">
                     <input 
                       type="number" 
                       value={discoveryQuota} 
                       onChange={(e) => setDiscoveryQuota(Math.max(1, parseInt(e.target.value) || 1))}
                       className="w-10 bg-transparent text-xs font-black text-indigo-400 focus:outline-none text-center"
                     />
                     <div className="w-[1px] h-5 bg-zinc-800" />
                     <button 
                      onClick={toggleAutoScout}
                      className={`text-[10px] font-black uppercase tracking-widest transition-all ${isAutoScouting ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}
                     >
                       {isAutoScouting ? 'Cease Swarm' : 'Initiate Swarm'}
                     </button>
                   </div>
                </div>
              </div>
              <button onClick={() => runDiscovery(true)} className="bg-white text-black px-8 py-4 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all hover:bg-zinc-200 shadow-2xl shadow-white/5 active:scale-95">Manual Execution</button>
            </div>
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

        <div className={`fixed bottom-12 z-[60] w-[420px] transition-all duration-700 ease-in-out ${selectedLead ? 'right-[660px]' : 'right-12'}`}>
           <ChatBot />
        </div>
      </main>

      <div className={`dossier-panel fixed top-0 right-0 h-full w-[640px] bg-[#0c0c0e] border-l border-zinc z-50 flex flex-col shadow-[-60px_0_120px_rgba(0,0,0,0.9)] ${selectedLead ? 'translate-x-0' : 'translate-x-full'}`}>
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
