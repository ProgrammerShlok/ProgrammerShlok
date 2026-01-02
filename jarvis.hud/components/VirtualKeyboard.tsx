
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
    <div className="hud-border p-6 rounded-xl select-none bg-black/40">
      <div className="flex flex-col gap-3">
        {keys.map((row, i) => (
          <div key={i} className="flex justify-center gap-2">
            {row.map(key => (
              <button
                key={key}
                onClick={() => onKeyPress(key.toLowerCase())}
                className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-500/50 hover:border-cyan-400 active:scale-90 transition-all flex items-center justify-center text-cyan-400 text-base md:text-xl font-black rounded-lg shadow-inner"
              >
                {key}
              </button>
            ))}
          </div>
        ))}
        <div className="flex justify-center gap-3 mt-2">
          <button
            onClick={() => onKeyPress(' ')}
            className="flex-grow max-w-[300px] h-12 md:h-14 border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-500/40 text-cyan-400 text-sm tracking-[0.4em] rounded-lg uppercase font-bold"
          >
            SPACEBAR
          </button>
          <button
            onClick={onBackspace}
            className="px-6 h-12 md:h-14 border border-red-500/40 bg-red-950/30 hover:bg-red-500/60 text-red-400 text-sm font-bold rounded-lg shadow-[0_0_10px_rgba(239,68,68,0.2)]"
          >
            DELETE
          </button>
          <button
            onClick={onEnter}
            className="px-8 h-12 md:h-14 border border-green-500/40 bg-green-950/30 hover:bg-green-500/60 text-green-400 text-sm font-bold rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.2)]"
          >
            EXECUTE
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
