
import React from 'react';

interface SavedItem {
  type: 'measurement' | 'annotation';
  value: string;
  timestamp: number;
  details?: string;
  image?: string;
}

interface FileManagerProps {
  items: SavedItem[];
  onClose: () => void;
  onClear: () => void;
  onItemClick?: (item: SavedItem) => void;
}

const FileManager: React.FC<FileManagerProps> = ({ items, onClose, onClear, onItemClick }) => {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl h-[80dvh] hud-border flex flex-col p-6 bg-slate-900 shadow-[0_0_50px_cyan/20]">
        <div className="flex justify-between items-center border-b border-cyan-500/20 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-black italic text-cyan-400 glow-text tracking-[0.2em] uppercase">ARCHIVE_INDEX_01</h2>
            <p className="text-[10px] opacity-40 uppercase tracking-widest">Local Persistent Data Storage</p>
          </div>
          <button onClick={onClose} className="text-cyan-400 hover:text-white text-2xl font-black">×</button>
        </div>

        <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex items-center justify-center text-cyan-500/40 text-[10px] uppercase tracking-[0.5em] italic">No archived protocols found</div>
          ) : (
            items.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => onItemClick?.(item)}
                className="hud-border p-4 bg-slate-950/50 group hover:border-cyan-400/50 cursor-pointer transition-all active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${item.type === 'measurement' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {item.type}
                  </span>
                  <span className="mono-font text-[9px] opacity-30">{new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-lg font-black text-white glow-text mb-1">{item.value}</div>
                {item.details && <div className="text-[10px] text-cyan-500/60 uppercase italic">{item.details}</div>}
                {item.image && (
                  <div className="mt-4 border border-cyan-500/20 rounded-lg overflow-hidden h-32 bg-black/40 relative">
                    <img src={item.image} className="w-full h-full object-contain" alt="Archive Preview" />
                  </div>
                )}
                <div className="mt-3 text-[8px] text-cyan-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to Restore Protocol
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <button onClick={onClear} className="flex-grow py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-black text-xs rounded-xl hover:bg-red-500/20 transition-all uppercase tracking-widest">WIPE_ARCHIVE</button>
          <button onClick={onClose} className="flex-grow py-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-black text-xs rounded-xl hover:bg-cyan-500/40 transition-all uppercase tracking-widest">CLOSE_INDEX</button>
        </div>
      </div>
    </div>
  );
};

export default FileManager;
