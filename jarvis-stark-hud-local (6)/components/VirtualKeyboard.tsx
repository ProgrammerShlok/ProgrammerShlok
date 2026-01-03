
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
    <div className="hud-border p-0.5 sm:p-4 rounded-xl select-none bg-slate-900/90 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
      <div className="flex flex-col gap-0.5 sm:gap-2">
        {keys.map((row, i) => (
          <div key={i} className="flex justify-center gap-0.5 sm:gap-1.5">
            {row.map(key => (
              <button
                key={key}
                onClick={() => onKeyPress(key.toLowerCase())}
                className="w-6 h-8 sm:w-12 sm:h-14 border border-cyan-500/10 bg-cyan-950/20 hover:bg-cyan-500/40 hover:border-cyan-400 active:scale-90 transition-all flex items-center justify-center text-cyan-400 text-[9px] sm:text-base font-black rounded shadow-md glow-text"
              >
                {key}
              </button>
            ))}
          </div>
        ))}
        <div className="flex justify-center gap-0.5 mt-1 sm:mt-3 px-1">
          <button
            onClick={() => onKeyPress(' ')}
            className="flex-grow h-8 sm:h-14 border border-cyan-500/10 bg-cyan-950/20 hover:bg-cyan-500/40 text-cyan-400 text-[7px] sm:text-[10px] tracking-widest rounded uppercase font-black"
          >
            SPACE
          </button>
          <button
            onClick={onBackspace}
            className="w-10 sm:w-24 h-8 sm:h-14 border border-red-500/20 bg-red-950/20 hover:bg-red-500/50 text-red-400 text-[7px] sm:text-xs font-black rounded uppercase"
          >
            DEL
          </button>
          <button
            onClick={onEnter}
            className="w-14 sm:w-28 h-8 sm:h-14 border border-green-500/20 bg-green-950/20 hover:bg-green-500/50 text-green-400 text-[7px] sm:text-xs font-black rounded uppercase"
          >
            EXEC
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
