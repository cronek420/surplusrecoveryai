
import React, { useState } from 'react';
import { Lead, LeadStatus } from '../types';

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onAdvanceLead: (id: string) => void;
}

const STAGES: LeadStatus[] = ['DISCOVERED', 'TRACED', 'CONTACTED', 'LEGAL_REVIEW', 'FILED', 'PAID'];

const LeadTable: React.FC<LeadTableProps> = ({ leads, onSelectLead, onAdvanceLead }) => {
  const [search, setSearch] = useState('');

  const filtered = leads
    .filter(l => 
      l.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      l.county.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e]">
      <div className="p-8 pb-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            placeholder="FILTER RECOVERY TARGETS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc rounded-xl px-12 py-4 text-xs font-bold focus:outline-none focus:border-white/20 transition-all placeholder-zinc-700 tracking-wider uppercase"
          />
          <svg className="w-4 h-4 absolute left-4 top-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="hidden sm:block text-[10px] mono text-zinc-600 uppercase font-black tracking-[0.2em] whitespace-nowrap">
          {filtered.length} NODES IDENTIFIED
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll p-8 pt-4">
        <div className="grid grid-cols-1 gap-3">
          {filtered.length === 0 ? (
            <div className="p-20 text-center bg-zinc-950/50 rounded-3xl border border-dashed border-zinc">
              <div className="text-zinc-700 text-xs font-bold uppercase tracking-[0.3em] mb-4">No Data Packets Found</div>
              <p className="text-[10px] text-zinc-800 mono italic">System scan yielded zero matches.</p>
            </div>
          ) : (
            filtered.map(lead => {
              const stageIdx = STAGES.indexOf(lead.status);
              return (
                <div 
                  key={lead.id} 
                  onClick={() => onSelectLead(lead)}
                  className="group grid grid-cols-1 lg:grid-cols-12 items-center gap-4 lg:gap-8 p-6 bg-[#111114] border border-zinc rounded-[24px] cursor-pointer card-hover hover:border-white/10"
                >
                  <div className="lg:col-span-5 flex items-center gap-6 min-w-0">
                    <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex flex-col items-center justify-center border border-zinc group-hover:bg-white/5 transition-all flex-shrink-0">
                       <span className="text-[8px] font-black text-zinc-600 uppercase">File</span>
                       <span className="text-[10px] font-bold text-zinc-300 mono leading-none">{lead.id.slice(-4)}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1 min-w-0">
                      <h3 className="text-sm font-extrabold text-white group-hover:text-indigo-400 transition-colors truncate">{lead.ownerName}</h3>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest truncate">{lead.county}, {lead.state}</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex flex-col">
                    <div className="text-xl font-extrabold text-emerald-500 tracking-tighter mono">
                      ${lead.amount.toLocaleString()}
                    </div>
                    <div className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">Value</div>
                  </div>

                  <div className="lg:col-span-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{lead.status.replace('_', ' ')}</span>
                      <span className="text-[9px] mono text-indigo-400 font-bold">{Math.round(((stageIdx + 1) / STAGES.length) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${
                          lead.status === 'PAID' ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${((stageIdx + 1) / STAGES.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAdvanceLead(lead.id); }}
                      className="p-3 bg-zinc-900 rounded-xl text-zinc-400 hover:text-indigo-400 hover:bg-white/10 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
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
