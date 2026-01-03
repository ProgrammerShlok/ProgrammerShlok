
import React, { useRef, useState, useEffect } from 'react';

interface PenToolProps {
  onClose: () => void;
  onSave: (data: any) => void;
  initialImage?: string;
}

const PenTool: React.FC<PenToolProps> = ({ onClose, onSave, initialImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#22d3ee');

  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;

      // Load initial image if provided
      if (initialImage) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = initialImage;
      }
    }
  };

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [color, initialImage]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX);
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY);

    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave({
      type: 'annotation',
      value: 'Visual Buffer Capture',
      timestamp: Date.now(),
      image: canvas.toDataURL('image/png')
    });
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/70 backdrop-blur-xl cursor-crosshair touch-none overflow-hidden">
      <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={endDrawing} onMouseOut={endDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={endDrawing} className="block w-full h-full" />
      <div className="absolute top-4 left-4 right-4 p-4 hud-border rounded-xl bg-slate-900/90 pointer-events-auto flex flex-col sm:flex-row items-center gap-4 border-2 border-cyan-500/30">
        <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-cyan-500/20 pb-2 sm:pb-0 sm:pr-6">
          <span className="text-sm font-black italic text-cyan-400 glow-text uppercase">Annotate_v5</span>
        </div>
        <div className="flex gap-2">
          {['#22d3ee', '#f43f5e', '#10b981', '#f59e0b', '#ffffff'].map(c => (
            <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white scale-110' : 'border-transparent opacity-60'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="flex gap-3 sm:ml-auto">
            <button onClick={handleSave} className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-black uppercase rounded-lg">ARCHIVE_BUFFER</button>
            <button onClick={clearCanvas} className="px-4 py-2 bg-slate-800 border border-cyan-500/40 text-cyan-400 text-[10px] font-black uppercase rounded-lg">PURGE</button>
            <button onClick={onClose} className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-black uppercase rounded-lg">EXIT</button>
        </div>
      </div>
    </div>
  );
};

export default PenTool;
