
import React, { useState, useRef, useEffect } from 'react';

interface MeasuringWorkbenchProps {
  onClose: () => void;
}

const MeasuringWorkbench: React.FC<MeasuringWorkbenchProps> = ({ onClose }) => {
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Calibration: Standard 96 DPI
  const PIXELS_TO_CM = 0.0264583333;

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
    
    return { x: clientX, y: clientY };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getMousePos(e);
    setStartPos(pos);
    setCurrentPos(pos);
    setIsDrawing(true);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    setCurrentPos(getMousePos(e));
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  const calculateDistanceCM = () => {
    if (!startPos || !currentPos) return 0;
    const dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;
    const pixels = Math.sqrt(dx * dx + dy * dy);
    return pixels * PIXELS_TO_CM;
  };

  return (
    <div 
      className="fixed inset-0 z-[60] bg-cyan-500/[0.03] backdrop-blur-[1px] cursor-crosshair touch-none"
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      {/* Holographic Tool Controls (Always visible top-right) */}
      <div className="absolute top-24 right-10 z-[70] p-4 hud-border rounded-xl bg-slate-950/80 pointer-events-auto flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-black italic tracking-tighter text-cyan-400 glow-text">METRIC_OVERLAY_ACTIVE</span>
          <span className="text-[8px] opacity-40 uppercase tracking-[0.4em]">Scale: 1.000cm : 37.8px</span>
        </div>
        <div className="flex flex-col gap-1 border-t border-cyan-500/10 pt-2">
           <div className="flex justify-between text-[10px] font-bold">
             <span className="opacity-40">READING:</span>
             <span className="text-cyan-300">{calculateDistanceCM().toFixed(2)} CM</span>
           </div>
           <div className="flex justify-between text-[10px] font-bold">
             <span className="opacity-40">CALIB:</span>
             <span className="text-green-500">STARK_PEAK</span>
           </div>
        </div>
        <button 
          onClick={onClose}
          className="mt-2 w-full py-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/40 text-red-400 text-[10px] font-black uppercase tracking-widest transition-all rounded"
        >
          EXIT_HUD_TOOL
        </button>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(34,211,238,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.2)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* SVG Measuring Layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="hudGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {startPos && currentPos && (
          <g filter="url(#hudGlow)">
            {/* Main Measuring Line */}
            <line 
              x1={startPos.x} y1={startPos.y} 
              x2={currentPos.x} y2={currentPos.y} 
              stroke="rgba(34, 211, 238, 0.8)" 
              strokeWidth="2"
              strokeDasharray="4,2"
            />
            
            {/* Anchors */}
            <circle cx={startPos.x} cy={startPos.y} r="4" fill="cyan" />
            <circle cx={currentPos.x} cy={currentPos.y} r="4" fill="cyan" className={isDrawing ? 'animate-pulse' : ''} />

            {/* Distance Tooltip */}
            <g transform={`translate(${currentPos.x + 10}, ${currentPos.y - 10})`}>
              <rect width="100" height="28" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(34, 211, 238, 0.5)" />
              <text x="50" y="18" fill="cyan" fontSize="10" fontWeight="bold" textAnchor="middle" className="italic">
                {calculateDistanceCM().toFixed(2)} CM
              </text>
            </g>
          </g>
        )}
      </svg>

      {/* Center Prompt (Only when starting) */}
      {!startPos && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="p-8 border border-cyan-500/20 rounded-full bg-cyan-500/5 animate-pulse text-center">
             <div className="text-2xl mb-2 opacity-40">📏</div>
             <div className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-500">Click and drag over workspace to measure</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasuringWorkbench;
