import React, { useMemo } from 'react';
import { Mic, PowerOff } from 'lucide-react';

// Neurons positioned to form a stylized brain (two hemispheres)
// Coordinates are inside a 400x400 viewBox
const NEURONS = [
  // Left hemisphere
  { id: 0, x: 130, y: 120 },
  { id: 1, x: 110, y: 170 },
  { id: 2, x: 95,  y: 220 },
  { id: 3, x: 115, y: 270 },
  { id: 4, x: 155, y: 300 },
  { id: 5, x: 155, y: 155 },
  { id: 6, x: 145, y: 210 },
  { id: 7, x: 175, y: 245 },
  { id: 8, x: 180, y: 165 },
  { id: 9, x: 175, y: 115 },
  // Right hemisphere
  { id: 10, x: 270, y: 120 },
  { id: 11, x: 290, y: 170 },
  { id: 12, x: 305, y: 220 },
  { id: 13, x: 285, y: 270 },
  { id: 14, x: 245, y: 300 },
  { id: 15, x: 245, y: 155 },
  { id: 16, x: 255, y: 210 },
  { id: 17, x: 225, y: 245 },
  { id: 18, x: 220, y: 165 },
  { id: 19, x: 225, y: 115 },
  // Bridge / brainstem
  { id: 20, x: 200, y: 190 },
  { id: 21, x: 200, y: 240 },
  { id: 22, x: 200, y: 320 },
];

// Synaptic connections (edges) - list of [fromId, toId]
const SYNAPSES = [
  [0, 5], [5, 1], [1, 6], [6, 2], [2, 3], [3, 7], [7, 4], [4, 21],
  [5, 9], [9, 0], [8, 5], [8, 6], [6, 7], [8, 20], [9, 8],
  [10, 15], [15, 11], [11, 16], [16, 12], [12, 13], [13, 17], [17, 14], [14, 21],
  [15, 19], [19, 10], [18, 15], [18, 16], [16, 17], [18, 20], [19, 18],
  [20, 21], [21, 22], [8, 18], [6, 16], [7, 17], [5, 19], [3, 13], [4, 14],
  [0, 9], [10, 19], [20, 6], [20, 16],
];

// Brain outline path (stylized cortex silhouette) - fits 400x400 viewBox
const BRAIN_OUTLINE = `
  M 200 60
  C 150 60, 100 90, 90 140
  C 60 150, 55 200, 80 230
  C 60 260, 90 310, 130 320
  C 140 355, 180 365, 200 345
  C 220 365, 260 355, 270 320
  C 310 310, 340 260, 320 230
  C 345 200, 340 150, 310 140
  C 300 90, 250 60, 200 60 Z
`;

// central sulcus line
const CENTRAL_SULCUS = `M 200 65 C 195 130, 210 190, 200 340`;

export default function AgentOrb({ state, onClick, label }) {
  const isOffline = state === 'offline';
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';
  const isProcessing = state === 'processing';
  const isBoot = state === 'boot';

  // Palette per state
  const palette = isOffline
    ? { primary: '#475569', secondary: '#334155', glow: 'rgba(71,85,105,0.4)', accent: '#64748b' }
    : isThinking
      ? { primary: '#a78bfa', secondary: '#7c3aed', glow: 'rgba(167,139,250,0.85)', accent: '#e9d5ff' }
      : isProcessing
        ? { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245,158,11,0.85)', accent: '#fde68a' }
        : isListening
          ? { primary: '#22d3ee', secondary: '#0891b2', glow: 'rgba(34,211,238,0.9)', accent: '#a5f3fc' }
          : { primary: '#22d3ee', secondary: '#0e7490', glow: 'rgba(34,211,238,0.7)', accent: '#67e8f9' };

  // Firing speed per state (in seconds)
  const fireDuration = isThinking ? 0.9 : isProcessing ? 0.6 : isListening ? 1.4 : isOffline ? 0 : 2.2;
  const nodePulseDuration = isThinking ? 0.8 : isProcessing ? 0.5 : isListening ? 1.2 : isOffline ? 0 : 2.4;

  // Precompute connections with random delays
  const connections = useMemo(() => {
    return SYNAPSES.map(([a, b], idx) => {
      const nA = NEURONS[a];
      const nB = NEURONS[b];
      const delay = (idx * 0.13) % 3;
      return { a: nA, b: nB, delay, key: `${a}-${b}` };
    });
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <div className="relative w-[460px] h-[460px] flex items-center justify-center">
        {/* Outer decorative dashed ring */}
        <div
          className={`absolute inset-0 rounded-full border border-dashed ${!isOffline && !isBoot ? 'animate-spin-slow' : ''}`}
          style={{ borderColor: palette.primary, opacity: isOffline ? 0.2 : 0.4 }}
        />
        {/* Inner mid ring with broken segments */}
        <div className={`absolute inset-6 ${!isOffline && !isBoot ? 'animate-spin-reverse' : ''}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {[0, 90, 180, 270].map((rot) => (
              <path
                key={rot}
                d="M 100 12 A 88 88 0 0 1 155 38"
                fill="none"
                stroke={palette.primary}
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity={isOffline ? 0.25 : 0.85}
                style={{
                  filter: isOffline ? 'none' : `drop-shadow(0 0 5px ${palette.glow})`,
                  transformOrigin: '100px 100px',
                  transform: `rotate(${rot}deg)`,
                }}
              />
            ))}
            {[45, 135, 225, 315].map((rot, i) => (
              <circle
                key={i}
                cx="100" cy="12" r="2.5"
                fill={palette.primary}
                opacity={isOffline ? 0.3 : 1}
                style={{
                  transformOrigin: '100px 100px',
                  transform: `rotate(${rot}deg)`,
                  filter: isOffline ? 'none' : `drop-shadow(0 0 4px ${palette.glow})`,
                }}
              />
            ))}
          </svg>
        </div>

        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <div
              className="absolute rounded-full border-2 animate-pulse-ring"
              style={{ inset: '90px', borderColor: palette.primary }}
            />
            <div
              className="absolute rounded-full border-2 animate-pulse-ring"
              style={{ inset: '90px', borderColor: palette.primary, animationDelay: '0.8s' }}
            />
          </>
        )}

        {/* BRAIN SVG - CENTER */}
        <button
          onClick={onClick}
          disabled={isOffline}
          className={`relative w-[280px] h-[280px] rounded-full flex items-center justify-center ${isOffline ? 'cursor-not-allowed' : 'cursor-pointer hover:brightness-110'} transition-all`}
          style={{
            background: isOffline
              ? 'radial-gradient(circle at 50% 50%, rgba(30,41,59,0.6), rgba(3,7,17,0.9))'
              : `radial-gradient(circle at 50% 50%, ${palette.secondary}22, rgba(3,7,17,0.85) 70%)`,
            boxShadow: isOffline
              ? 'inset 0 0 30px rgba(0,0,0,0.7)'
              : `0 0 60px ${palette.glow}, inset 0 0 40px ${palette.secondary}55`,
          }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <defs>
              <radialGradient id={`brainGrad-${state}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={palette.accent} stopOpacity={isOffline ? 0.15 : 0.35} />
                <stop offset="60%" stopColor={palette.primary} stopOpacity={isOffline ? 0.08 : 0.15} />
                <stop offset="100%" stopColor={palette.secondary} stopOpacity="0" />
              </radialGradient>

              <filter id={`neonBlur-${state}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id={`synapse-${state}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={palette.primary} stopOpacity="0" />
                <stop offset="50%" stopColor={palette.accent} stopOpacity="1" />
                <stop offset="100%" stopColor={palette.primary} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Ambient brain glow */}
            <circle cx="200" cy="200" r="150" fill={`url(#brainGrad-${state})`} />

            {/* Brain silhouette */}
            <path
              d={BRAIN_OUTLINE}
              fill="none"
              stroke={palette.primary}
              strokeWidth="1.5"
              opacity={isOffline ? 0.25 : 0.55}
              filter={isOffline ? undefined : `url(#neonBlur-${state})`}
            />
            {/* subtle inner outline */}
            <path
              d={BRAIN_OUTLINE}
              fill={palette.secondary}
              opacity={isOffline ? 0.05 : 0.08}
            />
            {/* central sulcus */}
            <path
              d={CENTRAL_SULCUS}
              fill="none"
              stroke={palette.primary}
              strokeWidth="1"
              opacity={isOffline ? 0.15 : 0.35}
              strokeDasharray="4 4"
            />

            {/* Synapses (connections) */}
            {!isOffline && connections.map((c) => {
              const dx = c.b.x - c.a.x;
              const dy = c.b.y - c.a.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              return (
                <g key={c.key}>
                  {/* Base line - dim */}
                  <line
                    x1={c.a.x} y1={c.a.y} x2={c.b.x} y2={c.b.y}
                    stroke={palette.primary}
                    strokeWidth="0.6"
                    opacity="0.22"
                  />
                  {/* Firing pulse traveling along */}
                  <circle r="2.2" fill={palette.accent} opacity="0.95"
                    style={{
                      filter: `drop-shadow(0 0 4px ${palette.glow})`,
                    }}
                  >
                    <animateMotion
                      dur={`${fireDuration}s`}
                      repeatCount="indefinite"
                      begin={`${c.delay}s`}
                      path={`M ${c.a.x} ${c.a.y} L ${c.b.x} ${c.b.y}`}
                      keyPoints="0;1"
                      keyTimes="0;1"
                    />
                    <animate attributeName="opacity"
                      values="0;1;1;0"
                      keyTimes="0;0.15;0.85;1"
                      dur={`${fireDuration}s`}
                      repeatCount="indefinite"
                      begin={`${c.delay}s`}
                    />
                  </circle>
                  {/* Secondary echo pulse when thinking/processing */}
                  {(isThinking || isProcessing) && (
                    <circle r="1.4" fill={palette.accent} opacity="0.7">
                      <animateMotion
                        dur={`${fireDuration}s`}
                        repeatCount="indefinite"
                        begin={`${c.delay + fireDuration / 2}s`}
                        path={`M ${c.b.x} ${c.b.y} L ${c.a.x} ${c.a.y}`}
                        keyPoints="0;1"
                        keyTimes="0;1"
                      />
                      <animate attributeName="opacity"
                        values="0;0.9;0.9;0"
                        keyTimes="0;0.15;0.85;1"
                        dur={`${fireDuration}s`}
                        repeatCount="indefinite"
                        begin={`${c.delay + fireDuration / 2}s`}
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Neurons (nodes) */}
            {NEURONS.map((n, idx) => (
              <g key={n.id}>
                {!isOffline && (
                  <circle
                    cx={n.x} cy={n.y} r="6"
                    fill={palette.primary}
                    opacity="0.15"
                  >
                    <animate
                      attributeName="r"
                      values="4;9;4"
                      dur={`${nodePulseDuration}s`}
                      begin={`${(idx * 0.11) % 2}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.05;0.35;0.05"
                      dur={`${nodePulseDuration}s`}
                      begin={`${(idx * 0.11) % 2}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  cx={n.x} cy={n.y} r={isOffline ? 1.8 : 2.4}
                  fill={isOffline ? palette.primary : palette.accent}
                  opacity={isOffline ? 0.4 : 1}
                  style={{ filter: isOffline ? 'none' : `drop-shadow(0 0 4px ${palette.glow})` }}
                />
              </g>
            ))}
          </svg>

          {/* Overlay icon on top of brain (small, corner-like) */}
          <div className="absolute bottom-4 flex items-center justify-center">
            {isOffline ? (
              <div className="flex items-center gap-2 px-3 py-1 border border-slate-600 rounded-full bg-slate-900/70">
                <PowerOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-orbitron text-[10px] tracking-widest text-slate-400">DESLIGADO</span>
              </div>
            ) : isListening ? (
              <div className="flex items-center gap-2 px-3 py-1 border rounded-full bg-black/40 backdrop-blur"
                style={{ borderColor: palette.primary }}>
                <Mic className="w-3.5 h-3.5" style={{ color: palette.accent }} />
                <span className="font-orbitron text-[10px] tracking-widest" style={{ color: palette.accent }}>OUVINDO</span>
              </div>
            ) : null}
          </div>
        </button>

        {/* Audio bars when listening */}
        {isListening && (
          <div className="absolute -bottom-4 flex items-end gap-1 h-8">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full origin-bottom"
                style={{
                  height: '100%',
                  background: palette.accent,
                  animation: `bar-wave ${380 + (i % 5) * 90}ms ease-in-out ${i * 40}ms infinite`,
                  boxShadow: `0 0 6px ${palette.glow}`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className={`mt-6 font-orbitron tracking-[0.4em] text-sm ${isOffline ? 'text-slate-500' : ''}`}
        style={isOffline ? {} : { color: palette.accent, textShadow: `0 0 10px ${palette.glow}` }}
      >
        {label}
      </div>
    </div>
  );
}
