import React from 'react';

export default function QuickCommands({ commands, onPick, disabled }) {
  return (
    <div className="panel panel-corners p-3 relative">
      <span className="c-tl" /><span className="c-br" />
      <div className="font-tech text-[10px] text-cyan-500/80 tracking-widest mb-2">// COMANDOS RÁPIDOS</div>
      <div className="flex flex-col gap-2">
        {commands.map((c) => (
          <button
            key={c}
            disabled={disabled}
            onClick={() => onPick(c)}
            className="text-left px-2 py-1.5 border border-cyan-500/30 text-[10px] font-orbitron tracking-widest text-cyan-300/90 hover:border-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
