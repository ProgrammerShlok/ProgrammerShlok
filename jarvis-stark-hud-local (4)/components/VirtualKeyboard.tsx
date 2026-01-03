
import React from 'react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onKeyPress, onBackspace, onEnter }) => {
  const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  return (
    <div className="hud-border p-4 rounded-xl select-none bg-slate-900/40">
      <div className="flex flex-col gap-2">
        {keys.map((row, i) => (
          <div key={i} className="flex justify-center gap-1.5">
            {row.map(key => (
              <button
                key={key}
                onClick={() => onKeyPress(key.toLowerCase())}
                className="w-8 h-10 border border-cyan-500/20 bg-cyan-950/20 hover:bg-cyan-500/40 hover:border-cyan-400 active:scale-90 transition-all flex items-center justify-center text-cyan-400 text-xs font-black rounded shadow-md"
              >
                {key}
              </button>
            ))}
          </div>
        ))}
        <div className="flex justify-center gap-2 mt-2">
          <button
            onClick={() => onKeyPress(' ')}
            className="flex-grow h-10 border border-cyan-500/20 bg-cyan-950/20 hover:bg-cyan-500/40 text-cyan-400 text-[10px] tracking-widest rounded uppercase font-bold"
          >
            SPACE_BUFFER
          </button>
          <button
            onClick={onBackspace}
            className="px-4 h-10 border border-red-500/30 bg-red-950/20 hover:bg-red-500/50 text-red-400 text-[10px] font-bold rounded"
          >
            DEL
          </button>
          <button
            onClick={onEnter}
            className="px-6 h-10 border border-green-500/30 bg-green-950/20 hover:bg-green-500/50 text-green-400 text-[10px] font-bold rounded"
          >
            EXEC
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
