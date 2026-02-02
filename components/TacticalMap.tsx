
import React, { useState } from 'react';
import { Lead } from '../types';

interface TacticalMapProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

const TacticalMap: React.FC<TacticalMapProps> = ({ leads, onSelectLead }) => {
  const [activeLayer, setActiveLayer] = useState<'VALUE' | 'PHASE'>('VALUE');

  // Simulated radar map view
  return (
    <div className="h-full flex flex-col bg-[#0c0c0e] overflow-hidden relative">
      <div className="p-8 pb-4 flex items-center justify-between z-10 bg-gradient-to-b from-[#0c0c0e] to-transparent">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Geographic Bounty Grid</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Spatial Distribution Analysis</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveLayer('VALUE')}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeLayer === 'VALUE' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-900 border-zinc text-zinc-500'}`}
           >
             Value Heatmap
           </button>
           <button 
             onClick={() => setActiveLayer('PHASE')}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeLayer === 'PHASE' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-900 border-zinc text-zinc-500'}`}
           >
             Phase Cluster
           </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden group">
         {/* Mock Radar Background */}
         <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-[800px] h-[800px] border border-zinc rounded-full flex items-center justify-center">
               <div className="w-[600px] h-[600px] border border-zinc rounded-full flex items-center justify-center">
                  <div className="w-[400px] h-[400px] border border-zinc rounded-full flex items-center justify-center">
                     <div className="w-[200px] h-[200px] border border-indigo-500/20 rounded-full" />
                  </div>
               </div>
            </div>
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-zinc-900" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-zinc-900" />
         </div>

         {/* Bounty Points */}
         <div className="absolute inset-0 p-10">
            {leads.map((lead, i) => {
               if (!lead.latLng) return null;
               // Calculate display positions based on mock coordinates relative to Miami center
               const top = 50 + (lead.latLng.lat - 25.76) * 500;
               const left = 50 + (lead.latLng.lng + 80.19) * 500;
               
               return (
                  <div 
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="absolute cursor-pointer transition-all hover:scale-150 z-20"
                    style={{ top: `${top}%`, left: `${left}%` }}
                  >
                    <div className="relative">
                       <div className={`w-3 h-3 rounded-full border-2 border-white/20 animate-pulse ${
                         activeLayer === 'VALUE' ? (lead.amount > 100000 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-indigo-500') : 'bg-white'
                       }`} />
                       <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md px-2 py-1 rounded border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-[8px] font-black text-white uppercase tracking-tighter">${(lead.amount / 1000).toFixed(0)}k</div>
                       </div>
                    </div>
                  </div>
               );
            })}
         </div>

         {/* Corner Stats Overlay */}
         <div className="absolute bottom-10 left-10 space-y-4 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-xl border border-zinc p-6 rounded-[32px] w-64 shadow-2xl">
               <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4">Tactical Summary</div>
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <span className="text-[10px] font-bold text-zinc-400">Total Density</span>
                     <span className="text-xl font-black text-white mono">{leads.length} Targets</span>
                  </div>
                  <div className="flex justify-between items-end">
                     <span className="text-[10px] font-bold text-zinc-400">Max Asset Loc</span>
                     <span className="text-[10px] font-black text-emerald-500 uppercase">South MIAMI</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TacticalMap;
