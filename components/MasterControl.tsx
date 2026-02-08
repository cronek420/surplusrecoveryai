import React, { useState, useMemo, useEffect } from 'react';
import { Agent, Lead, ActivityLog, AgentRole } from '../types';

interface MasterControlProps {
  agents: Agent[];
  leads: Lead[];
  logs: ActivityLog[];
  isAutoScouting: boolean;
  onStopAll: () => void;
  selectedAgentId?: AgentRole | null;
  onSelectAgent?: (agentId: AgentRole | null) => void;
}

const MasterControl: React.FC<MasterControlProps> = ({
  agents,
  leads,
  logs,
  isAutoScouting,
  onStopAll,
  selectedAgentId,
  onSelectAgent
}) => {
  const [expandedAgent, setExpandedAgent] = useState<AgentRole | null>(selectedAgentId || null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterType, setFilterType] = useState<ActivityLog['type'] | 'ALL'>('ALL');
  const [logLimit, setLogLimit] = useState(50);

  // Calculate real-time metrics
  const metrics = useMemo(() => {
    const totalCapital = leads.reduce((sum, l) => sum + l.amount, 0);
    const byStatus = {
      DISCOVERED: leads.filter(l => l.status === 'DISCOVERED').length,
      TRACED: leads.filter(l => l.status === 'TRACED').length,
      CONTACTED: leads.filter(l => l.status === 'CONTACTED').length,
      LEGAL_REVIEW: leads.filter(l => l.status === 'LEGAL_REVIEW').length,
      FILED: leads.filter(l => l.status === 'FILED').length,
      PAID: leads.filter(l => l.status === 'PAID').length
    };
    
    const byAgent: Record<AgentRole, number> = {} as any;
    agents.forEach(a => {
      byAgent[a.id] = logs.filter(l => l.agentId === a.id).length;
    });

    return { totalCapital, byStatus, byAgent };
  }, [leads, agents, logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    let filtered = filterType === 'ALL' ? logs : logs.filter(l => l.type === filterType);
    if (expandedAgent) {
      filtered = filtered.filter(l => l.agentId === expandedAgent);
    }
    return filtered.slice(0, logLimit);
  }, [logs, filterType, expandedAgent, logLimit]);

  // Get agent details
  const selectedAgent = agents.find(a => a.id === expandedAgent);
  const agentLogs = expandedAgent ? logs.filter(l => l.agentId === expandedAgent) : [];

  const statusColor = (status: Agent['status']) => {
    switch (status) {
      case 'IDLE': return 'text-zinc-400';
      case 'WORKING': return 'text-yellow-400 animate-pulse';
      case 'SUCCESS': return 'text-emerald-400';
      case 'ERROR': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const statusBg = (status: Agent['status']) => {
    switch (status) {
      case 'IDLE': return 'bg-zinc-900/30 border-zinc-700';
      case 'WORKING': return 'bg-yellow-900/20 border-yellow-600';
      case 'SUCCESS': return 'bg-emerald-900/20 border-emerald-600';
      case 'ERROR': return 'bg-red-900/20 border-red-600';
      default: return 'bg-zinc-900/30 border-zinc-700';
    }
  };

  const logTypeColor = (type: ActivityLog['type']) => {
    switch (type) {
      case 'INFO': return 'text-blue-400';
      case 'SUCCESS': return 'text-emerald-400';
      case 'WARNING': return 'text-yellow-400';
      case 'ERROR': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const logTypeIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'INFO': return 'ℹ️';
      case 'SUCCESS': return '✅';
      case 'WARNING': return '⚠️';
      case 'ERROR': return '❌';
      default: return '•';
    }
  };

  return (
    <div className="flex h-full bg-[#0c0c0e] text-white">
      {/* LEFT PANEL: AGENT SWARM */}
      <div className="w-72 border-r border-zinc-800 bg-black/40 backdrop-blur-xl overflow-y-auto custom-scroll flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-black/60 backdrop-blur-lg border-b border-zinc-800 p-4 z-10">
          <h2 className="text-sm font-black uppercase tracking-wider text-indigo-400 mb-3">👁️ All-Seeing Eye</h2>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-900/20 border border-red-600 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${isAutoScouting ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`} />
            <span className="text-xs font-bold text-red-300 uppercase tracking-tight">
              {isAutoScouting ? 'SWARM ACTIVE' : 'IDLE'}
            </span>
            <button
              onClick={onStopAll}
              className="ml-auto px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded transition-colors"
            >
              STOP ALL
            </button>
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="p-4 space-y-3 border-b border-zinc-800">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-400 uppercase tracking-tighter font-bold">Total Capital</span>
              <span className="font-black text-emerald-400">${(metrics.totalCapital / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-400 uppercase tracking-tighter font-bold">Active Leads</span>
              <span className="font-black text-indigo-400">{leads.length}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-400 uppercase tracking-tighter font-bold">Swarm Efficiency</span>
              <span className="font-black text-yellow-400">{leads.length > 0 ? Math.floor((metrics.byStatus.PAID / leads.length) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Agent List */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto custom-scroll">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                setExpandedAgent(expandedAgent === agent.id ? null : agent.id);
                onSelectAgent?.(expandedAgent === agent.id ? null : agent.id);
              }}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                expandedAgent === agent.id
                  ? 'bg-indigo-900/40 border-indigo-500'
                  : `${statusBg(agent.status)} border-zinc-700 hover:border-zinc-600`
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                  <div>
                    <div className="text-xs font-black uppercase tracking-tight">{agent.name}</div>
                    <div className="text-[10px] text-zinc-500">{agent.description}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[10px] font-black uppercase ${statusColor(agent.status)}`}>
                  {agent.status}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {metrics.byAgent[agent.id]} actions
                </span>
              </div>

              {agent.lastAction && (
                <div className="mt-2 text-[9px] text-zinc-400 italic truncate">
                  {agent.lastAction}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Pipeline Status */}
        <div className="border-t border-zinc-800 p-4 space-y-2">
          <div className="text-[10px] font-black text-zinc-500 uppercase">Pipeline</div>
          {Object.entries(metrics.byStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between text-[9px]">
              <span className="text-zinc-400 uppercase tracking-tight">{status.replace('_', ' ')}</span>
              <span className="font-black text-indigo-400">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER PANEL: AGENT DETAILS */}
      {expandedAgent && selectedAgent && (
        <div className="w-96 border-r border-zinc-800 bg-gradient-to-b from-purple-900/10 to-transparent backdrop-blur-xl overflow-y-auto custom-scroll flex flex-col">
          {/* Agent Header */}
          <div className="sticky top-0 bg-black/60 backdrop-blur-lg border-b border-zinc-800 p-6 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedAgent.color }}
              />
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider">{selectedAgent.name}</h3>
                <p className="text-xs text-zinc-400">{selectedAgent.description}</p>
              </div>
            </div>
            
            <div className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black ${
              selectedAgent.status === 'WORKING'
                ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-600'
                : selectedAgent.status === 'SUCCESS'
                ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-600'
                : selectedAgent.status === 'ERROR'
                ? 'bg-red-900/40 text-red-300 border border-red-600'
                : 'bg-zinc-900/40 text-zinc-400 border border-zinc-700'
            }`}>
              {selectedAgent.status}
            </div>
          </div>

          {/* Agent Stats */}
          <div className="p-6 border-b border-zinc-800 space-y-4">
            <div>
              <div className="text-[9px] text-zinc-500 uppercase font-bold mb-2">Total Actions</div>
              <div className="text-3xl font-black text-indigo-400">{agentLogs.length}</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['INFO', 'SUCCESS', 'ERROR'].map((type) => (
                <div key={type}>
                  <div className="text-[8px] text-zinc-500 uppercase mb-1">{type}</div>
                  <div className="text-lg font-black" style={{
                    color: type === 'INFO' ? '#60a5fa' : type === 'SUCCESS' ? '#10b981' : '#ef4444'
                  }}>
                    {agentLogs.filter(l => l.type === type).length}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Actions */}
          <div className="flex-1 overflow-y-auto custom-scroll p-6">
            <div className="text-[10px] font-black text-zinc-500 uppercase mb-4">Recent Actions</div>
            <div className="space-y-2">
              {agentLogs.slice(0, 20).map((log) => (
                <div key={log.id} className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg text-[9px]">
                  <div className="flex items-start gap-2 mb-1">
                    <span>{logTypeIcon(log.type)}</span>
                    <div className="flex-1">
                      <p className={logTypeColor(log.type)}>{log.message}</p>
                      <p className="text-zinc-500 text-[8px] mt-1">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {log.leadId && (
                    <div className="mt-2 p-2 bg-black/40 rounded border border-zinc-700 text-zinc-400">
                      Lead: {log.leadId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RIGHT PANEL: ACTIVITY FEED */}
      <div className="flex-1 bg-black/20 backdrop-blur-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-black/60 backdrop-blur-lg border-b border-zinc-800 p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black uppercase tracking-wider">Real-Time Activity</h3>
            <button
              onClick={onStopAll}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-lg flex items-center gap-2 transition-colors"
            >
              <span>🛑</span> EMERGENCY STOP
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Events</option>
              <option value="INFO">Info Only</option>
              <option value="SUCCESS">Success Only</option>
              <option value="WARNING">Warnings</option>
              <option value="ERROR">Errors</option>
            </select>

            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="w-4 h-4"
              />
              Auto-scroll
            </label>

            <div className="ml-auto text-[10px] text-zinc-500 font-mono">
              {filteredLogs.length} / {logs.length} events
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-3">
          {filteredLogs.map((log) => {
            const agent = agents.find(a => a.id === log.agentId);
            return (
              <div
                key={log.id}
                className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="text-xl">{logTypeIcon(log.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: agent?.color || '#999' }}
                      />
                      <span className="text-xs font-black text-zinc-300 uppercase tracking-tight">
                        {agent?.name || log.agentId}
                      </span>
                      <span className={`text-[10px] font-bold ${logTypeColor(log.type)}`}>
                        {log.type}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-200 break-words">{log.message}</p>
                    <p className="text-[10px] text-zinc-500 mt-2">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {log.leadId && (
                  <div className="mt-3 p-2 bg-black/60 rounded border border-zinc-800 text-[10px] text-zinc-400">
                    📋 Lead: <span className="text-indigo-400 font-mono">{log.leadId}</span>
                  </div>
                )}
              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
              No activity yet. Start a discovery or whale hunt.
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="sticky bottom-0 bg-black/60 backdrop-blur-lg border-t border-zinc-800 p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-[8px] text-zinc-500 uppercase font-bold">Working</div>
              <div className="text-lg font-black text-yellow-400">
                {agents.filter(a => a.status === 'WORKING').length}
              </div>
            </div>
            <div>
              <div className="text-[8px] text-zinc-500 uppercase font-bold">Success</div>
              <div className="text-lg font-black text-emerald-400">
                {logs.filter(l => l.type === 'SUCCESS').length}
              </div>
            </div>
            <div>
              <div className="text-[8px] text-zinc-500 uppercase font-bold">Warnings</div>
              <div className="text-lg font-black text-yellow-500">
                {logs.filter(l => l.type === 'WARNING').length}
              </div>
            </div>
            <div>
              <div className="text-[8px] text-zinc-500 uppercase font-bold">Errors</div>
              <div className="text-lg font-black text-red-400">
                {logs.filter(l => l.type === 'ERROR').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterControl;
