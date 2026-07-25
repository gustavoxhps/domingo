import React, { useEffect, useState } from 'react';
import { ChevronsLeft, Brain } from 'lucide-react';

function MiniOrb({ state }) {
  const color = state === 'thinking' ? '#a78bfa' : state === 'processing' ? '#f59e0b' : state === 'offline' ? '#64748b' : '#22d3ee';
  return (
    <div className="relative w-full h-[140px] flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <radialGradient id="miniGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="70%" stopColor={color} stopOpacity="0.05" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="70" fill="url(#miniGrad)" />
        <circle cx="100" cy="100" r="55" fill="none" stroke={color} strokeWidth="0.5" opacity="0.5" strokeDasharray="3 4" />
        <circle cx="100" cy="100" r="70" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
        {/* satellites */}
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 100 + 60 * Math.cos(rad);
          const cy = 100 + 60 * Math.sin(rad);
          return (
            <circle key={i} cx={cx} cy={cy} r="2" fill={color}
              style={{ filter: `drop-shadow(0 0 3px ${color})` }}>
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2s"
                begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
        {/* core */}
        <circle cx="100" cy="100" r="14" fill={color} opacity="0.35"
          style={{ filter: `blur(6px)` }} />
        <circle cx="100" cy="100" r="6" fill="#fff" opacity="0.9"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
          <animate attributeName="r" values="5;8;5" dur="1.4s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

function Section({ title, children, className = '' }) {
  return (
    <div className={`panel panel-corners p-3 relative ${className}`}>
      <span className="c-tl" /><span className="c-br" />
      <div className="font-tech text-[10px] text-cyan-500/80 tracking-widest mb-2 uppercase">{title}</div>
      {children}
    </div>
  );
}

function PerformanceBar({ label, value, unit = '%', color = 'cyan' }) {
  const colors = {
    cyan: '#22d3ee',
    amber: '#fbbf24',
    emerald: '#34d399',
  };
  const c = colors[color] || colors.cyan;
  return (
    <div>
      <div className="flex justify-between items-center font-tech text-[10px] mb-1">
        <span className="text-cyan-400/80 tracking-widest">{label}</span>
        <span className="text-cyan-100" style={{ textShadow: `0 0 6px ${c}80` }}>{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-cyan-500/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, value)}%`, background: c, boxShadow: `0 0 8px ${c}` }}
        />
      </div>
    </div>
  );
}

export default function LeftPanel({ state, onHide, perf, systems }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const stateLabel = {
    idle: 'AGUARDANDO',
    listening: 'OUVINDO',
    thinking: 'PENSANDO',
    processing: 'PROCESSANDO',
    offline: 'OFFLINE',
    boot: 'INICIALIZANDO',
  }[state] || 'AGUARDANDO';

  const timeStr = now.toTimeString().slice(0, 8);
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');

  return (
    <div className="w-full sm:w-[280px] flex flex-col gap-3 h-full pr-1">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="font-tech text-[11px] tracking-[0.3em] text-cyan-400/80">PAINÉIS</span>
        <button
          onClick={onHide}
          className="px-2 py-1 border border-cyan-500/40 rounded-lg text-[10px] font-tech tracking-widest text-cyan-300 hover:bg-cyan-400/10 flex items-center gap-1"
        >
          <ChevronsLeft className="w-3 h-3" />
          OCULTAR
        </button>
      </div>

      {/* Neural core mini */}
      <Section title="NÚCLEO NEURAL">
        <MiniOrb state={state} />
        <div className="text-center font-orbitron text-xs tracking-[0.3em] mt-1"
          style={{ color: state === 'thinking' ? '#c4b5fd' : state === 'processing' ? '#fcd34d' : '#67e8f9', textShadow: '0 0 8px currentColor' }}>
          {stateLabel}
        </div>
      </Section>

      {/* Time */}
      <Section title="SISTEMA TEMPORAL">
        <div className="text-center py-1">
          <div className="font-orbitron text-4xl font-bold tracking-widest text-cyan-300 glow-cyan">{timeStr}</div>
          <div className="font-tech text-[10px] tracking-widest text-cyan-500/80 mt-1 capitalize">{dateStr}</div>
        </div>
      </Section>

      {/* Performance */}
      <Section title="DESEMPENHO">
        <div className="space-y-3">
          <PerformanceBar label="CPU NEURAL" value={perf.cpu} unit="%" color="cyan" />
          <PerformanceBar label="MEMÓRIA" value={perf.mem} unit="%" color="cyan" />
          <PerformanceBar label="LATÊNCIA" value={perf.lat} unit="ms" color="cyan" />
        </div>
      </Section>

      {/* Systems */}
      <Section title="SISTEMAS">
        <div className="space-y-1.5">
          {systems.map((s) => (
            <div key={s.name} className="flex justify-between font-tech text-[11px]">
              <span className="text-cyan-100/90">{s.name}</span>
              <span className={`tracking-widest ${s.color === 'emerald' ? 'text-emerald-300' : s.color === 'amber' ? 'text-amber-300' : 'text-cyan-300'}`}
                style={{ textShadow: `0 0 6px currentColor` }}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
