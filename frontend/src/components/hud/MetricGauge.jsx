import React from 'react';

const colorMap = {
  cyan: { stroke: '#22d3ee', glow: 'rgba(34,211,238,0.7)', text: 'text-cyan-300' },
  amber: { stroke: '#fbbf24', glow: 'rgba(251,191,36,0.7)', text: 'text-amber-300' },
  emerald: { stroke: '#34d399', glow: 'rgba(52,211,153,0.7)', text: 'text-emerald-300' },
};

export default function MetricGauge({ metric, offline }) {
  const c = colorMap[metric.color] || colorMap.cyan;
  const max = metric.max || 100;
  const pct = Math.max(0, Math.min(1, (metric.value || 0) / max));
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  const displayValue = metric.id === 'freq' || metric.id === 'mem'
    ? metric.value.toFixed(metric.id === 'freq' ? 2 : 1)
    : Math.round(metric.value);

  return (
    <div className="panel panel-corners p-2 flex items-center gap-2 relative">
      <span className="c-tl" /><span className="c-br" />
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg width="64" height="64" viewBox="0 0 64 64" className="transform -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="3" />
          <circle
            cx="32" cy="32" r={r}
            fill="none"
            stroke={offline ? '#475569' : c.stroke}
            strokeWidth="3"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ filter: offline ? 'none' : `drop-shadow(0 0 4px ${c.glow})`, transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center font-tech text-[11px] ${offline ? 'text-slate-500' : c.text}`}>
          <span>{offline ? '--' : displayValue}<span className="text-[8px] opacity-70">{metric.unit}</span></span>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="font-tech text-[10px] text-cyan-500/80 tracking-widest">{metric.label}</div>
        <div className={`font-orbitron text-[10px] tracking-widest ${offline ? 'text-slate-500' : c.text}`}>
          {offline ? 'OFFLINE' : metric.status}
        </div>
      </div>
    </div>
  );
}
