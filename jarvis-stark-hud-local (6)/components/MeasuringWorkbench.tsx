
import React, { useState, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Measurement {
  id: string;
  points: Point[];
  distance: number;
  color: string;
  style: string;
  type: 'linear' | 'freehand';
}

interface MeasuringWorkbenchProps {
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const LINE_STYLES = [
  { label: 'SOLID', value: 'none' },
  { label: 'DOTTED', value: '2, 6' },
  { label: 'DASHED', value: '12, 6' },
  { label: 'TACTICAL', value: '1, 5, 12, 5' }
];

const COLORS = ['#22d3ee', '#f43f5e', '#10b981', '#f59e0b', '#ffffff'];

const MeasuringWorkbench: React.FC<MeasuringWorkbenchProps> = ({ onClose, onSave, initialData }) => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [activePoints, setActivePoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeColor, setActiveColor] = useState('#22d3ee');
  const [activeStyle, setActiveStyle] = useState('none');
  const [mode, setMode] = useState<'linear' | 'freehand'>('linear');
  
  const PIXELS_TO_CM = 0.0264583333;

  useEffect(() => {
    if (initialData && initialData.type === 'measurement' && initialData.rawMeasurements) {
      setMeasurements(initialData.rawMeasurements);
    }
  }, [initialData]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    let clientX = 0;
    let clientY = 0;
    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    return { x: clientX, y: clientY };
  };

  const calculatePathLength = (pts: Point[]) => {
    if (pts.length < 2) return 0;
    let totalPixels = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      totalPixels += Math.sqrt(dx * dx + dy * dy);
    }
    return totalPixels * PIXELS_TO_CM;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.tool-controls')) return;
    const pos = getPos(e);
    setActivePoints([pos]);
    setIsDrawing(true);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    if (mode === 'linear') {
      setActivePoints(prev => [prev[0], pos]);
    } else {
      const lastPoint = activePoints[activePoints.length - 1];
      const dist = Math.sqrt(Math.pow(pos.x - lastPoint.x, 2) + Math.pow(pos.y - lastPoint.y, 2));
      if (dist > 4) setActivePoints(prev => [...prev, pos]);
    }
  };

  const handleEnd = () => {
    if (isDrawing && activePoints.length >= 2) {
      const dist = calculatePathLength(activePoints);
      if (dist > 0.05) {
        setMeasurements(prev => [...prev, {
          id: `m-${Date.now()}`,
          points: [...activePoints],
          distance: dist,
          color: activeColor,
          style: activeStyle,
          type: mode
        }]);
      }
    }
    setIsDrawing(false);
    setActivePoints([]);
  };

  const totalDistance = measurements.reduce((sum, m) => sum + m.distance, 0);

  const handleSaveData = () => {
    if (totalDistance === 0) return;
    onSave({
      type: 'measurement',
      value: totalDistance.toFixed(3) + ' cm',
      timestamp: Date.now(),
      details: `${measurements.length} segments recorded`,
      rawMeasurements: measurements // Store raw data for re-opening
    });
  };

  return (
    <div 
      className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-3xl cursor-crosshair touch-none overflow-hidden"
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.1] bg-[linear-gradient(rgba(34,211,238,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.4)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <div className="absolute top-4 left-4 right-4 z-[160] tool-controls p-4 hud-border rounded-xl bg-slate-900/95 flex flex-col items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full overflow-x-auto pb-2 sm:pb-0">
          <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-cyan-500/20 pb-2 sm:pb-0 sm:pr-6 whitespace-nowrap">
            <span className="text-sm font-black italic text-cyan-400 glow-text uppercase">METRIC_SENSOR_v9.2</span>
            <span className="text-xl font-black text-cyan-300 mono-font">{totalDistance.toFixed(3)} cm</span>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <div className="flex gap-1 bg-slate-800/80 rounded-lg p-1">
              <button onClick={() => setMode('linear')} className={`px-4 py-2 text-[10px] font-black rounded-md ${mode === 'linear' ? 'bg-cyan-500 text-slate-950' : 'text-cyan-500'}`}>LINEAR</button>
              <button onClick={() => setMode('freehand')} className={`px-4 py-2 text-[10px] font-black rounded-md ${mode === 'freehand' ? 'bg-cyan-500 text-slate-950' : 'text-cyan-500'}`}>FREEHAND</button>
            </div>
            
            <div className="flex gap-1 bg-slate-800/80 rounded-lg p-1">
              {LINE_STYLES.map(s => (
                <button key={s.label} onClick={() => setActiveStyle(s.value)} className={`px-3 py-2 text-[10px] font-black rounded-md ${activeStyle === s.value ? 'bg-cyan-400 text-slate-950' : 'text-cyan-400/60'}`}>{s.label}</button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 sm:ml-auto">
              <button onClick={handleSaveData} className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-black uppercase rounded-lg">SAVE_DATA</button>
              <button onClick={() => setMeasurements([])} className="px-4 py-2 bg-slate-800 border border-cyan-500/40 text-cyan-400 text-[10px] font-black uppercase rounded-lg">CLEAR</button>
              <button onClick={onClose} className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-black uppercase rounded-lg">EXIT</button>
          </div>
        </div>
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {measurements.map((m) => {
          const pointsStr = m.points.map(p => `${p.x},${p.y}`).join(' ');
          const labelPos = m.points[Math.floor(m.points.length / 2)];
          return (
            <g key={m.id}>
              <polyline points={pointsStr} fill="none" stroke={m.color} strokeWidth="3" strokeDasharray={m.style === 'none' ? undefined : m.style} />
              <g transform={`translate(${labelPos.x}, ${labelPos.y - 25})`}>
                <rect x="-45" y="-12" width="90" height="22" rx="6" fill="rgba(15,23,42,0.9)" stroke={m.color} strokeWidth="1.5" />
                <text textAnchor="middle" y="4" fill={m.color} fontSize="11" fontWeight="900">{m.distance.toFixed(3)}cm</text>
              </g>
            </g>
          );
        })}
        {isDrawing && activePoints.length >= 2 && (
          <polyline points={activePoints.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={activeColor} strokeWidth="2" strokeDasharray="6,6" className="opacity-70 animate-pulse" />
        )}
      </svg>
    </div>
  );
};

export default MeasuringWorkbench;
