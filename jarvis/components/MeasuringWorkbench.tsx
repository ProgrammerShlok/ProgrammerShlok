
import React, { useState, useRef, useEffect } from 'react';

interface MeasuringWorkbenchProps {
  onClose: () => void;
}

const MeasuringWorkbench: React.FC<MeasuringWorkbenchProps> = ({ onClose }) => {
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;
    return { x, y };
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

  const calculateDistance = () => {
    if (!startPos || !currentPos) return 0;
    const dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const calculateAngle = () => {
    if (!startPos || !currentPos) return 0;
    return Math.atan2(currentPos.y - startPos.y, currentPos.x - startPos.x) * (180 / Math.PI);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      <div className="w-full h-full max-w-6xl max-h-[80vh] hud-border rounded-3xl relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/30 flex justify-between items-center bg-cyan-950/20">
          <div className="flex flex-col">
            <h2 className="text-xl font-black italic glow-text tracking-tighter">ANALYTIC_MEASURING_STATION</h2>
            <span className="text-[10px] opacity-60 tracking-[0.5em]">PRECISION_SCALE: 1.000:1.000</span>
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-red-500/50 bg-red-950/30 hover:bg-red-500/50 text-red-400 font-bold rounded-full transition-all text-xs tracking-widest uppercase"
          >
            DISCONNECT_TOOL
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-grow relative cursor-crosshair group touch-none">
          <canvas 
            ref={canvasRef}
            className="absolute inset-0 w-full h-full opacity-20"
          />
          <div 
            className="absolute inset-0"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          >
            {/* Dynamic Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10 workbench-grid"></div>

            {/* Drawing Layer */}
            {startPos && currentPos && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Measuring Line */}
                <line 
                  x1={startPos.x} y1={startPos.y} 
                  x2={currentPos.x} y2={currentPos.y} 
                  stroke="rgba(34, 211, 238, 0.8)" 
                  strokeWidth="2"
                  strokeDasharray="10,5"
                  filter="url(#glow)"
                />
                
                {/* Endpoints */}
                <circle cx={startPos.x} cy={startPos.y} r="5" fill="cyan" filter="url(#glow)" />
                <circle cx={currentPos.x} cy={currentPos.y} r="5" fill="cyan" filter="url(#glow)" className={isDrawing ? 'animate-pulse' : ''} />

                {/* Dimension Lines (Right Angle) */}
                {isDrawing && (
                  <g opacity="0.3">
                    <line x1={startPos.x} y1={startPos.y} x2={currentPos.x} y2={startPos.y} stroke="cyan" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1={currentPos.x} y1={startPos.y} x2={currentPos.x} y2={currentPos.y} stroke="cyan" strokeWidth="1" strokeDasharray="2,2" />
                  </g>
                )}

                {/* Floating Stats */}
                <g transform={`translate(${currentPos.x + 15}, ${currentPos.y + 15})`}>
                  <rect width="140" height="50" rx="4" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(34, 211, 238, 0.4)" />
                  <text x="10" y="20" fill="cyan" fontSize="12" className="font-bold">LEN: {calculateDistance().toFixed(2)}px</text>
                  <text x="10" y="40" fill="cyan" fontSize="10" opacity="0.7">ANG: {calculateAngle().toFixed(1)}°</text>
                </g>
              </svg>
            )}

            {/* Placeholder instructions if not drawing */}
            {!startPos && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center space-y-4">
                  <div className="text-4xl opacity-20 mb-4 animate-bounce">🖋️</div>
                  <div className="text-cyan-500/40 font-bold tracking-[0.3em] uppercase">Click and Drag to Measure Object</div>
                  <div className="flex gap-10 justify-center">
                    <div className="flex flex-col items-center">
                      <div className="text-[10px] opacity-30">UNIT_TYPE</div>
                      <div className="text-xs font-bold text-cyan-400">PIXELS / STARK_U</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-[10px] opacity-30">AUTO_CALIBRATE</div>
                      <div className="text-xs font-bold text-green-400">ENABLED</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats Bar */}
        <div className="p-3 border-t border-cyan-500/30 flex justify-around items-center bg-cyan-950/40 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex gap-2">
              <span className="opacity-40">COORDS:</span>
              <span className="text-cyan-300">[{currentPos?.x.toFixed(0) || 0}, {currentPos?.y.toFixed(0) || 0}]</span>
            </div>
            <div className="flex gap-2">
              <span className="opacity-40">RESOLUTION:</span>
              <span className="text-cyan-300">1080p_VIRTUAL</span>
            </div>
            <div className="flex gap-2">
              <span className="opacity-40">BUFFER:</span>
              <span className="text-green-400">SYNCHRONIZED</span>
            </div>
        </div>
      </div>
      
      {/* Decorative corners for the workspace */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-cyan-500 opacity-40"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-cyan-500 opacity-40"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-cyan-500 opacity-40"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-cyan-500 opacity-40"></div>
    </div>
  );
};

export default MeasuringWorkbench;
