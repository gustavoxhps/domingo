import React, { useMemo } from 'react';
import { Mic, PowerOff } from 'lucide-react';

// ---------- Brain neurons ----------
const NEURONS = [
  { id: 0, x: 130, y: 120 }, { id: 1, x: 110, y: 170 }, { id: 2, x: 95, y: 220 },
  { id: 3, x: 115, y: 270 }, { id: 4, x: 155, y: 300 }, { id: 5, x: 155, y: 155 },
  { id: 6, x: 145, y: 210 }, { id: 7, x: 175, y: 245 }, { id: 8, x: 180, y: 165 },
  { id: 9, x: 175, y: 115 }, { id: 10, x: 270, y: 120 }, { id: 11, x: 290, y: 170 },
  { id: 12, x: 305, y: 220 }, { id: 13, x: 285, y: 270 }, { id: 14, x: 245, y: 300 },
  { id: 15, x: 245, y: 155 }, { id: 16, x: 255, y: 210 }, { id: 17, x: 225, y: 245 },
  { id: 18, x: 220, y: 165 }, { id: 19, x: 225, y: 115 }, { id: 20, x: 200, y: 190 },
  { id: 21, x: 200, y: 240 }, { id: 22, x: 200, y: 320 },
];

const SYNAPSES = [
  [0,5],[5,1],[1,6],[6,2],[2,3],[3,7],[7,4],[4,21],
  [5,9],[9,0],[8,5],[8,6],[6,7],[8,20],[9,8],
  [10,15],[15,11],[11,16],[16,12],[12,13],[13,17],[17,14],[14,21],
  [15,19],[19,10],[18,15],[18,16],[16,17],[18,20],[19,18],
  [20,21],[21,22],[8,18],[6,16],[7,17],[5,19],[3,13],[4,14],
];

const BRAIN_OUTLINE = `M 200 60 C 150 60, 100 90, 90 140 C 60 150, 55 200, 80 230 C 60 260, 90 310, 130 320 C 140 355, 180 365, 200 345 C 220 365, 260 355, 270 320 C 310 310, 340 260, 320 230 C 345 200, 340 150, 310 140 C 300 90, 250 60, 200 60 Z`;

// ---------- Helpers to build arcs / ticks ----------
const polar = (cx, cy, r, angleDeg) => {
  const a = (angleDeg - 90) * (Math.PI / 180);
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
const arcPath = (cx, cy, r, startDeg, endDeg) => {
  const [x1, y1] = polar(cx, cy, r, startDeg);
  const [x2, y2] = polar(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
};

// Ticks around a circle: returns array of {x1,y1,x2,y2}
const buildTicks = (cx, cy, rInner, rOuter, count, startDeg = 0, sweep = 360) => {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const deg = startDeg + (sweep * i) / count;
    const [x1, y1] = polar(cx, cy, rInner, deg);
    const [x2, y2] = polar(cx, cy, rOuter, deg);
    arr.push({ x1, y1, x2, y2, deg });
  }
  return arr;
};

export default function AgentOrb({ state, onClick, label }) {
  const isOffline = state === 'offline';
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';
  const isProcessing = state === 'processing';
  const isBoot = state === 'boot';

  const palette = isOffline
    ? { primary: '#475569', secondary: '#334155', glow: 'rgba(71,85,105,0.4)', accent: '#64748b', deep: '#1e293b' }
    : isThinking
      ? { primary: '#a78bfa', secondary: '#7c3aed', glow: 'rgba(167,139,250,0.85)', accent: '#e9d5ff', deep: '#4c1d95' }
      : isProcessing
        ? { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245,158,11,0.85)', accent: '#fde68a', deep: '#78350f' }
        : { primary: '#22d3ee', secondary: '#0891b2', glow: 'rgba(34,211,238,0.85)', accent: '#a5f3fc', deep: '#155e75' };

  const fireDuration = isThinking ? 0.9 : isProcessing ? 0.6 : isListening ? 1.4 : isOffline ? 0 : 2.2;
  const nodePulseDuration = isThinking ? 0.8 : isProcessing ? 0.5 : isListening ? 1.2 : isOffline ? 0 : 2.4;

  const connections = useMemo(() =>
    SYNAPSES.map(([a, b], idx) => ({ a: NEURONS[a], b: NEURONS[b], delay: (idx * 0.13) % 3, key: `${a}-${b}` })),
  []);

  // Tick sets
  const outerTicks = useMemo(() => buildTicks(250, 250, 218, 232, 72), []);
  const scaleTicks = useMemo(() => buildTicks(250, 250, 176, 188, 100), []);
  const innerTicks = useMemo(() => buildTicks(250, 250, 130, 140, 60), []);

  const cx = 250, cy = 250;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <div className="relative w-[520px] h-[520px] flex items-center justify-center">

        {/* Radial light beams (behind everything) */}
        {!isOffline && (
          <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.6 }}>
            <svg viewBox="0 0 500 500" className="w-full h-full">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <g key={deg} style={{ transformOrigin: '250px 250px', transform: `rotate(${deg}deg)` }}>
                  <path
                    d="M 250 40 L 240 250 L 260 250 Z"
                    fill={palette.primary}
                    opacity="0.15"
                    style={{ filter: `blur(6px)` }}
                  />
                </g>
              ))}
            </svg>
          </div>
        )}

        {/* Angular geometric backdrop (octagonal wedges) */}
        <div className={`absolute inset-0 ${!isOffline && !isBoot ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '40s' }}>
          <svg viewBox="0 0 500 500" className="w-full h-full">
            {Array.from({ length: 12 }).map((_, i) => {
              const deg = i * 30;
              const [x1, y1] = polar(cx, cy, 230, deg - 8);
              const [x2, y2] = polar(cx, cy, 230, deg + 8);
              const [x3, y3] = polar(cx, cy, 250, deg + 12);
              const [x4, y4] = polar(cx, cy, 250, deg - 12);
              return (
                <polygon
                  key={i}
                  points={`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`}
                  fill={palette.deep}
                  stroke={palette.primary}
                  strokeWidth="1"
                  opacity={isOffline ? 0.2 : 0.5}
                />
              );
            })}
            {/* Small hexagonal accents */}
            {Array.from({ length: 8 }).map((_, i) => {
              const deg = i * 45 + 22.5;
              const [px, py] = polar(cx, cy, 260, deg);
              const size = 8;
              const points = Array.from({ length: 6 }).map((_, k) => {
                const a = (k * 60) * (Math.PI / 180);
                return `${px + size * Math.cos(a)},${py + size * Math.sin(a)}`;
              }).join(' ');
              return (
                <polygon
                  key={`h-${i}`}
                  points={points}
                  fill="none"
                  stroke={palette.primary}
                  strokeWidth="1"
                  opacity={isOffline ? 0.25 : 0.7}
                />
              );
            })}
          </svg>
        </div>

        {/* OUTER RING with tick marks */}
        <div className={`absolute inset-0 ${!isOffline && !isBoot ? 'animate-spin-reverse' : ''}`} style={{ animationDuration: '25s' }}>
          <svg viewBox="0 0 500 500" className="w-full h-full">
            <circle cx={cx} cy={cy} r="218" fill="none" stroke={palette.primary} strokeWidth="1" opacity={isOffline ? 0.2 : 0.5} />
            <circle cx={cx} cy={cy} r="232" fill="none" stroke={palette.primary} strokeWidth="0.6" opacity={isOffline ? 0.15 : 0.35} />
            {outerTicks.map((t, i) => (
              <line
                key={i}
                x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                stroke={palette.primary}
                strokeWidth={i % 6 === 0 ? 2 : 1}
                opacity={isOffline ? 0.25 : i % 6 === 0 ? 0.9 : 0.5}
                style={i % 6 === 0 && !isOffline ? { filter: `drop-shadow(0 0 3px ${palette.glow})` } : undefined}
              />
            ))}
            {/* Big broken segments */}
            {[10, 100, 190, 280].map((start) => (
              <path
                key={start}
                d={arcPath(cx, cy, 225, start, start + 30)}
                fill="none"
                stroke={palette.primary}
                strokeWidth="4"
                strokeLinecap="round"
                opacity={isOffline ? 0.3 : 1}
                style={{ filter: isOffline ? 'none' : `drop-shadow(0 0 6px ${palette.glow})` }}
              />
            ))}
          </svg>
        </div>

        {/* MID RING with progress arcs */}
        <div className={`absolute ${!isOffline && !isBoot ? 'animate-spin-slow' : ''}`} style={{ inset: '40px', animationDuration: isThinking ? '4s' : '18s' }}>
          <svg viewBox="0 0 500 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <g transform="translate(30, 30)">
              <circle cx={cx - 30} cy={cy - 30} r="180" fill="none" stroke={palette.primary} strokeWidth="0.5" opacity={isOffline ? 0.15 : 0.35} />
              {/* Long arc segment */}
              <path
                d={arcPath(cx - 30, cy - 30, 180, 30, 150)}
                fill="none"
                stroke={palette.primary}
                strokeWidth="3"
                strokeLinecap="round"
                opacity={isOffline ? 0.35 : 1}
                style={{ filter: isOffline ? 'none' : `drop-shadow(0 0 5px ${palette.glow})` }}
              />
              <path
                d={arcPath(cx - 30, cy - 30, 180, 200, 270)}
                fill="none"
                stroke={palette.primary}
                strokeWidth="2"
                strokeLinecap="round"
                opacity={isOffline ? 0.25 : 0.7}
              />
              {/* Scale ticks with counter-rotation trick via alternating heights */}
              {scaleTicks.map((t, i) => {
                const isMajor = i % 10 === 0;
                const isMid = i % 5 === 0;
                return (
                  <line
                    key={i}
                    x1={t.x1 - 30} y1={t.y1 - 30}
                    x2={isMajor ? t.x2 + (t.x2 - t.x1) * 0.6 - 30 : (isMid ? t.x2 + (t.x2 - t.x1) * 0.2 - 30 : t.x2 - 30)}
                    y2={isMajor ? t.y2 + (t.y2 - t.y1) * 0.6 - 30 : (isMid ? t.y2 + (t.y2 - t.y1) * 0.2 - 30 : t.y2 - 30)}
                    stroke={palette.primary}
                    strokeWidth={isMajor ? 1.5 : 0.8}
                    opacity={isOffline ? 0.25 : (isMajor ? 0.95 : isMid ? 0.6 : 0.4)}
                  />
                );
              })}
              {/* Small circle dots on the arc */}
              {[30, 90, 150, 210, 270, 330].map((deg) => {
                const [dx, dy] = polar(cx - 30, cy - 30, 180, deg);
                return (
                  <circle
                    key={deg}
                    cx={dx} cy={dy} r="3"
                    fill={palette.accent}
                    opacity={isOffline ? 0.4 : 1}
                    style={{ filter: isOffline ? 'none' : `drop-shadow(0 0 4px ${palette.glow})` }}
                  />
                );
              })}
            </g>
          </svg>
        </div>

        {/* INNER RING (near the brain) */}
        <div className={`absolute ${!isOffline && !isBoot ? 'animate-spin-reverse' : ''}`} style={{ inset: '100px', animationDuration: isThinking ? '3s' : '12s' }}>
          <svg viewBox="0 0 500 500" className="w-full h-full">
            <g>
              <circle cx={cx} cy={cy} r="130" fill="none" stroke={palette.primary} strokeWidth="1" opacity={isOffline ? 0.2 : 0.5} />
              <circle cx={cx} cy={cy} r="140" fill="none" stroke={palette.primary} strokeWidth="0.6" opacity={isOffline ? 0.15 : 0.35} />
              {innerTicks.map((t, i) => (
                <line
                  key={i}
                  x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                  stroke={palette.primary}
                  strokeWidth={i % 5 === 0 ? 1.5 : 0.7}
                  opacity={isOffline ? 0.2 : (i % 5 === 0 ? 0.9 : 0.4)}
                />
              ))}
              {/* Broken segment arcs */}
              {[0, 120, 240].map((start) => (
                <path
                  key={start}
                  d={arcPath(cx, cy, 138, start, start + 20)}
                  fill="none"
                  stroke={palette.accent}
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity={isOffline ? 0.3 : 1}
                  style={{ filter: isOffline ? 'none' : `drop-shadow(0 0 5px ${palette.glow})` }}
                />
              ))}
            </g>
          </svg>
        </div>

        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <div className="absolute rounded-full border-2 animate-pulse-ring" style={{ inset: '150px', borderColor: palette.primary }} />
            <div className="absolute rounded-full border-2 animate-pulse-ring" style={{ inset: '150px', borderColor: palette.primary, animationDelay: '0.8s' }} />
          </>
        )}

        {/* CORE with brain */}
        <button
          onClick={onClick}
          disabled={isOffline}
          className={`relative w-[260px] h-[260px] rounded-full flex items-center justify-center ${isOffline ? 'cursor-not-allowed' : 'cursor-pointer hover:brightness-110'} transition-all`}
          style={{
            background: isOffline
              ? 'radial-gradient(circle at 50% 50%, rgba(30,41,59,0.6), rgba(3,7,17,0.95))'
              : `radial-gradient(circle at 50% 50%, ${palette.secondary}30, rgba(3,7,17,0.92) 70%)`,
            boxShadow: isOffline
              ? 'inset 0 0 40px rgba(0,0,0,0.8)'
              : `0 0 70px ${palette.glow}, inset 0 0 40px ${palette.secondary}66, inset 0 0 15px ${palette.primary}55`,
          }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <defs>
              <radialGradient id={`brainGrad-${state}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={palette.accent} stopOpacity={isOffline ? 0.15 : 0.4} />
                <stop offset="60%" stopColor={palette.primary} stopOpacity={isOffline ? 0.08 : 0.18} />
                <stop offset="100%" stopColor={palette.secondary} stopOpacity="0" />
              </radialGradient>
              <filter id={`neonBlur-${state}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <circle cx="200" cy="200" r="140" fill={`url(#brainGrad-${state})`} />

            <path d={BRAIN_OUTLINE} fill="none" stroke={palette.primary} strokeWidth="1.5"
              opacity={isOffline ? 0.25 : 0.6}
              filter={isOffline ? undefined : `url(#neonBlur-${state})`} />
            <path d={BRAIN_OUTLINE} fill={palette.secondary} opacity={isOffline ? 0.05 : 0.08} />

            {!isOffline && connections.map((c) => (
              <g key={c.key}>
                <line x1={c.a.x} y1={c.a.y} x2={c.b.x} y2={c.b.y}
                  stroke={palette.primary} strokeWidth="0.6" opacity="0.22" />
                <circle r="2.2" fill={palette.accent} opacity="0.95"
                  style={{ filter: `drop-shadow(0 0 4px ${palette.glow})` }}>
                  <animateMotion dur={`${fireDuration}s`} repeatCount="indefinite" begin={`${c.delay}s`}
                    path={`M ${c.a.x} ${c.a.y} L ${c.b.x} ${c.b.y}`} keyPoints="0;1" keyTimes="0;1" />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1"
                    dur={`${fireDuration}s`} repeatCount="indefinite" begin={`${c.delay}s`} />
                </circle>
                {(isThinking || isProcessing) && (
                  <circle r="1.4" fill={palette.accent} opacity="0.7">
                    <animateMotion dur={`${fireDuration}s`} repeatCount="indefinite" begin={`${c.delay + fireDuration / 2}s`}
                      path={`M ${c.b.x} ${c.b.y} L ${c.a.x} ${c.a.y}`} keyPoints="0;1" keyTimes="0;1" />
                    <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.15;0.85;1"
                      dur={`${fireDuration}s`} repeatCount="indefinite" begin={`${c.delay + fireDuration / 2}s`} />
                  </circle>
                )}
              </g>
            ))}

            {NEURONS.map((n, idx) => (
              <g key={n.id}>
                {!isOffline && (
                  <circle cx={n.x} cy={n.y} r="6" fill={palette.primary} opacity="0.15">
                    <animate attributeName="r" values="4;9;4" dur={`${nodePulseDuration}s`}
                      begin={`${(idx * 0.11) % 2}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.05;0.35;0.05" dur={`${nodePulseDuration}s`}
                      begin={`${(idx * 0.11) % 2}s`} repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={n.x} cy={n.y} r={isOffline ? 1.8 : 2.4}
                  fill={isOffline ? palette.primary : palette.accent}
                  opacity={isOffline ? 0.4 : 1}
                  style={{ filter: isOffline ? 'none' : `drop-shadow(0 0 4px ${palette.glow})` }} />
              </g>
            ))}
          </svg>

          {/* Overlay chip */}
          <div className="absolute bottom-3 flex items-center justify-center">
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
          <div className="absolute -bottom-2 flex items-end gap-1 h-8">
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
        className={`mt-4 font-orbitron tracking-[0.4em] text-sm ${isOffline ? 'text-slate-500' : ''}`}
        style={isOffline ? {} : { color: palette.accent, textShadow: `0 0 10px ${palette.glow}` }}
      >
        {label}
      </div>
    </div>
  );
}
