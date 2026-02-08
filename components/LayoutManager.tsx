import React from 'react';

interface LayoutManagerProps {
  currentLayout: 'default' | 'split' | 'compact';
  onLayoutChange: (layout: 'default' | 'split' | 'compact') => void;
  onResetLayout: () => void;
}

const LayoutManager: React.FC<LayoutManagerProps> = ({
  currentLayout,
  onLayoutChange,
  onResetLayout,
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Layout:</span>
      
      <button
        onClick={() => onLayoutChange('default')}
        className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all ${
          currentLayout === 'default'
            ? 'bg-indigo-600/80 text-white'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
        }`}
      >
        Default
      </button>
      
      <button
        onClick={() => onLayoutChange('split')}
        className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all ${
          currentLayout === 'split'
            ? 'bg-indigo-600/80 text-white'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
        }`}
      >
        Split View
      </button>
      
      <button
        onClick={() => onLayoutChange('compact')}
        className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all ${
          currentLayout === 'compact'
            ? 'bg-indigo-600/80 text-white'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
        }`}
      >
        Compact
      </button>

      <div className="w-px h-4 bg-zinc-700" />

      <button
        onClick={onResetLayout}
        className="px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
        title="Reset all window positions to default"
      >
        Reset Windows
      </button>
    </div>
  );
};

export default LayoutManager;
