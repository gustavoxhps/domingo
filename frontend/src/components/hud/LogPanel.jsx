import React, { useEffect, useRef } from 'react';
import { ChevronsRight } from 'lucide-react';

export default function LogPanel({ logs, onHide }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [logs]);

  const colorFor = (status) => {
    switch (status) {
      case 'PENSANDO': return '#c4b5fd';
      case 'OUVINDO': return '#67e8f9';
      case 'PROCESSANDO': return '#fcd34d';
      case 'AGUARDANDO': return '#a5f3fc';
      case 'OFFLINE': return '#94a3b8';
      default: return '#67e8f9';
    }
  };

  return (
    <div className="w-full sm:w-[280px] flex flex-col gap-3 h-full pl-1">
      <div className="flex items-center justify-between px-1">
        <span className="font-tech text-[11px] tracking-[0.3em] text-cyan-400/80">LOG DO SISTEMA</span>
        <button
          onClick={onHide}
          className="px-2 py-1 border border-cyan-500/40 rounded text-[10px] font-tech tracking-widest text-cyan-300 hover:bg-cyan-400/10 flex items-center gap-1"
        >
          OCULTAR
          <ChevronsRight className="w-3 h-3" />
        </button>
      </div>

      <div className="panel panel-corners p-3 relative flex-1 overflow-hidden flex flex-col">
        <span className="c-tl" /><span className="c-br" />
        <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1 space-y-1">
          {logs.map((l, i) => (
            <div key={i} className="font-tech text-[11px] flex items-center gap-2 animate-fade-in">
              <span className="text-cyan-500/60">[{l.time}]</span>
              <span style={{ color: colorFor(l.status), textShadow: `0 0 6px ${colorFor(l.status)}88` }} className="tracking-widest">
                {l.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
