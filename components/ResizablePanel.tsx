import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

interface ResizablePanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultWidth?: number | string;
  defaultHeight?: number | string;
  defaultX?: number;
  defaultY?: number;
  minWidth?: number;
  minHeight?: number;
  onClose?: () => void;
  isDraggable?: boolean;
  isResizable?: boolean;
  zIndex?: number;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  id,
  title,
  children,
  defaultWidth = 640,
  defaultHeight = 600,
  defaultX = 100,
  defaultY = 100,
  minWidth = 300,
  minHeight = 200,
  onClose,
  isDraggable = true,
  isResizable = true,
  zIndex = 50,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // Load saved position from localStorage
  const savedPosition = localStorage.getItem(`panel_${id}`);
  const initialPosition = savedPosition ? JSON.parse(savedPosition) : { x: defaultX, y: defaultY, width: defaultWidth, height: defaultHeight };

  const handleDragStop = (e: any, d: any) => {
    localStorage.setItem(`panel_${id}`, JSON.stringify({ 
      x: d.x, 
      y: d.y, 
      width: initialPosition.width, 
      height: initialPosition.height 
    }));
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    localStorage.setItem(`panel_${id}`, JSON.stringify({ 
      x: position.x, 
      y: position.y, 
      width: ref.offsetWidth, 
      height: ref.offsetHeight 
    }));
  };

  return (
    <Rnd
      default={{
        x: initialPosition.x,
        y: initialPosition.y,
        width: initialPosition.width,
        height: initialPosition.height,
      }}
      minWidth={minWidth}
      minHeight={minHeight}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      disableDragging={!isDraggable}
      enableResizing={isResizable ? {
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      } : false}
      style={{ zIndex }}
      className="bg-[#0c0c0e] border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-950 to-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between cursor-move hover:bg-zinc-950/80 transition-colors">
        <div className="flex items-center gap-2 flex-1">
          <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{title}</h3>
          {isMinimized && <span className="text-[9px] text-zinc-500">minimized</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-zinc-400 hover:text-white transition-colors text-sm font-bold"
            title={isMinimized ? 'Restore' : 'Minimize'}
          >
            {isMinimized ? '☐' : '−'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-red-400 transition-colors text-sm font-bold"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto custom-scroll p-4">
          {children}
        </div>
      )}

      {/* Resize Handle Indicator */}
      {isResizable && !isMinimized && (
        <div className="absolute bottom-1 right-1 w-4 h-4 text-zinc-700 text-[10px] flex items-center justify-center cursor-se-resize opacity-50 hover:opacity-100 transition-opacity">
          ⟲
        </div>
      )}
    </Rnd>
  );
};

export default ResizablePanel;
