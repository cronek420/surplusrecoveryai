
import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '../types';

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onAdvanceLead: (id: string) => void;
}

type SortKey = 'priorityScore' | 'ownerName' | 'amount';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const STAGES: LeadStatus[] = ['DISCOVERED', 'TRACED', 'CONTACTED', 'LEGAL_REVIEW', 'FILED', 'PAID'];

const STATUS_THEMES: Record<LeadStatus, { color: string, bg: string, border: string }> = {
  'DISCOVERED': { color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.1)', border: 'rgba(34, 211, 238, 0.2)' },
  'TRACED': { color: '#d946ef', bg: 'rgba(217, 70, 239, 0.1)', border: 'rgba(217, 70, 239, 0.2)' },
  'CONTACTED': { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.2)' },
  'LEGAL_REVIEW': { color: '#fb7185', bg: 'rgba(251, 113, 133, 0.1)', border: 'rgba(251, 113, 133, 0.2)' },
  'FILED': { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)' },
  'PAID': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' },
};

const LeadTable: React.FC<LeadTableProps> = ({ leads, onSelectLead, onAdvanceLead }) => {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    const saved = localStorage.getItem('sr_lead_sort');
    return saved ? JSON.parse(saved) : { key: 'priorityScore', direction: 'desc' };
  });

  useEffect(() => {
    localStorage.setItem('sr_lead_sort', JSON.stringify(sortConfig));
  }, [sortConfig]);

  const toggleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortedAndFiltered = [...leads]
    .filter(l => 
      l.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      l.county.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortConfig.key] ?? 0;
      const bValue = b[sortConfig.key] ?? 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <span className="ml-1 opacity-20">↕</span>;
    return (
      <span className="ml-1 text-indigo-400">
        {sortConfig.direction === 'desc' ? '↓' : '↑'}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e]">
      <div className="p-8 pb-4 flex items-center gap-6">
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            placeholder="FILTER RECOVERY TARGETS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc rounded-2xl px-12 py-4 text-xs font-bold focus:outline-none focus:border-white/20 transition-all placeholder-zinc-700 tracking-wider uppercase"
          />
          <svg className="w-4 h-4 absolute left-4 top-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="hidden lg:flex items-center gap-6">
           <div className="flex flex-col">
              <span className="text-xl font-extrabold text-indigo-400 mono">{sortedAndFiltered.length}</span>
              <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Active Leads</span>
           </div>
           <div className="w-[1px] h-8 bg-zinc-800" />
           <div className="flex flex-col">
              <span className="text-xl font-extrabold text-emerald-500 mono">${sortedAndFiltered.reduce((s,l) => s+l.amount, 0).toLocaleString()}</span>
              <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Total Value</span>
           </div>
        </div>
      </div>

      {/* Tactical Sort Header */}
      <div className="px-8 mb-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 px-6 py-3 bg-zinc-900/30 border border-zinc/20 rounded-2xl">
          <button 
            onClick={() => toggleSort('priorityScore')}
            className={`lg:col-span-1 flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-colors ${sortConfig.key === 'priorityScore' ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            Rank <SortIndicator column="priorityScore" />
          </button>
          
          <button 
            onClick={() => toggleSort('ownerName')}
            className={`lg:col-span-4 flex items-center text-[9px] font-black uppercase tracking-widest transition-colors ${sortConfig.key === 'ownerName' ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            Target Entity <SortIndicator column="ownerName" />
          </button>

          <button 
            onClick={() => toggleSort('amount')}
            className={`lg:col-span-2 flex items-center text-[9px] font-black uppercase tracking-widest transition-colors ${sortConfig.key === 'amount' ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            Asset Value <SortIndicator column="amount" />
          </button>

          <div className="lg:col-span-3 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            Recovery Phase
          </div>

          <div className="lg:col-span-2 text-right text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            Actions
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll p-8 pt-2">
        <div className="grid grid-cols-1 gap-4">
          {sortedAndFiltered.length === 0 ? (
            <div className="p-20 text-center bg-zinc-950/50 rounded-[40px] border border-dashed border-zinc">
              <div className="text-zinc-700 text-xs font-bold uppercase tracking-[0.3em] mb-4">No Data Packets Found</div>
            </div>
          ) : (
            sortedAndFiltered.map(lead => {
              const stageIdx = STAGES.indexOf(lead.status);
              const theme = STATUS_THEMES[lead.status];
              return (
                <div 
                  key={lead.id} 
                  onClick={() => onSelectLead(lead)}
                  className="group grid grid-cols-1 lg:grid-cols-12 items-center gap-8 p-6 bg-[#111114] border border-zinc rounded-[32px] cursor-pointer card-hover hover:border-white/10"
                >
                  <div className="lg:col-span-1 flex flex-col items-center">
                     <div className={`text-[10px] font-black mono mb-1 ${sortConfig.key === 'priorityScore' ? 'text-indigo-400' : 'text-zinc-500'}`}>{lead.priorityScore || 0}%</div>
                     <div className="w-full h-12 bg-zinc-900 rounded-full border border-zinc p-1">
                        <div className={`w-full rounded-full transition-all duration-1000 ${sortConfig.key === 'priorityScore' ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.3)]' : 'bg-indigo-600'}`} style={{ height: `${lead.priorityScore || 0}%` }} />
                     </div>
                  </div>

                  <div className="lg:col-span-4 flex flex-col gap-2 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className={`text-base font-extrabold transition-colors truncate ${sortConfig.key === 'ownerName' ? 'text-indigo-300' : 'text-white group-hover:text-indigo-400'}`}>{lead.ownerName}</h3>
                      <div 
                        className="px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-tighter shrink-0"
                        style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.color }}
                      >
                        {lead.status.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest truncate">{lead.county}, {lead.state}</span>
                      <span className="text-[8px] font-black text-zinc-800 uppercase px-2 py-0.5 bg-zinc-900 rounded-md border border-zinc/40">{lead.caseNumber || 'NO_CASE'}</span>
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex flex-col">
                    <div className={`text-2xl font-black tracking-tighter mono ${sortConfig.key === 'amount' ? 'text-indigo-400' : 'text-emerald-500'}`}>
                      ${lead.amount.toLocaleString()}
                    </div>
                  </div>

                  <div className="lg:col-span-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.color, boxShadow: `0 0 8px ${theme.color}` }} />
                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: theme.color }}>{lead.status.replace('_', ' ')}</span>
                      </div>
                      <span className="text-[9px] mono text-indigo-400 font-bold">{Math.round(((stageIdx + 1) / STAGES.length) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${((stageIdx + 1) / STAGES.length) * 100}%`,
                          backgroundColor: theme.color
                        }}
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex justify-end gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAdvanceLead(lead.id); }}
                      className="p-4 bg-zinc-900 rounded-[20px] text-zinc-400 hover:text-indigo-400 hover:bg-white/10 transition-all border border-zinc group-hover:border-white/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadTable;
