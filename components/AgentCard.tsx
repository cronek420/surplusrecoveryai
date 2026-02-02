
import React from 'react';
import { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const isWorking = agent.status === 'WORKING';
  const isSuccess = agent.status === 'SUCCESS';
  
  return (
    <div className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group cursor-default ${
      isWorking ? 'bg-white/5 border border-white/5' : 'hover:bg-white/5'
    }`}>
      <div className="relative flex-shrink-0">
        <div className={`absolute -inset-1 rounded-full blur-md transition-opacity duration-500 ${
          isWorking ? 'opacity-40 animate-pulse' : isSuccess ? 'opacity-20' : 'opacity-0'
        }`} style={{ backgroundColor: agent.color }} />
        
        <svg className="w-10 h-10 -rotate-90 relative">
          <circle
            cx="20" cy="20" r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-zinc-800"
          />
          <circle
            cx="20" cy="20" r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray={113}
            strokeDashoffset={isWorking ? 56 : isSuccess ? 0 : 80}
            className={`transition-all duration-700 ease-in-out ${
              agent.status === 'SUCCESS' ? 'text-emerald-500' :
              agent.status === 'ERROR' ? 'text-rose-500' :
              isWorking ? 'text-indigo-500' : 'text-zinc-700'
            }`}
            style={!isWorking && !isSuccess ? { color: agent.color } : {}}
          />
        </svg>
        {isWorking && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: agent.color }} />
          </div>
        )}
      </div>
      
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wide truncate ${isSuccess ? 'text-emerald-400' : 'text-zinc-100'}`}>
            {agent.name}
          </span>
          {agent.isAutomated && (
            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter bg-indigo-500/10 px-1 rounded">Auto</span>
          )}
        </div>
        <span className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
          {isWorking ? 'Synthesizing Docket Stream...' : 
           isSuccess ? 'Verification Optimized' : 
           agent.status === 'ERROR' ? 'Protocol Breach' : 'System Standby'}
        </span>
      </div>
    </div>
  );
};

export default AgentCard;
