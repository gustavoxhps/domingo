import React from 'react';
import { Mic, Loader2, Brain, Cpu, PowerOff } from 'lucide-react';

export default function AgentOrb({ state, onClick, label }) {
  const isOffline = state === 'offline';
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';
  const isProcessing = state === 'processing';
  const isBoot = state === 'boot';

  const coreAnim = isListening
    ? 'animate-core-listen'
    : isThinking
      ? 'animate-core-think'
      : isProcessing
        ? 'animate-core-process'
        : isOffline
          ? ''
          : 'animate-core-pulse';

  const ringColor = isOffline ? '#475569' : isThinking ? '#a78bfa' : isProcessing ? '#f59e0b' : '#22d3ee';
  const glow = isOffline ? 'rgba(71,85,105,0.3)' : isThinking ? 'rgba(167,139,250,0.7)' : isProcessing ? 'rgba(245,158,11,0.7)' : 'rgba(34,211,238,0.8)';

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Outer decorative rings */}
      <div className="relative w-[420px] h-[420px] flex items-center justify-center">
        {/* Dashed outer ring */}
        <div
          className={`absolute inset-0 rounded-full border border-dashed ${isOffline ? 'opacity-30' : ''} ${!isOffline && !isBoot ? 'animate-spin-slow' : ''}`}
          style={{ borderColor: ringColor, opacity: isOffline ? 0.2 : 0.5 }}
        />
        {/* Broken segments ring */}
        <div className={`absolute inset-8 ${!isOffline && !isBoot ? 'animate-spin-reverse' : ''}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {[0, 90, 180, 270].map((rot) => (
              <path
                key={rot}
                d="M 100 10 A 90 90 0 0 1 160 40"
                fill="none"
                stroke={ringColor}
                strokeWidth="3"
                strokeLinecap="round"
                opacity={isOffline ? 0.25 : 0.9}
                style={{ filter: isOffline ? 'none' : `drop-shadow(0 0 6px ${glow})`, transformOrigin: '100px 100px', transform: `rotate(${rot}deg)` }}
              />
            ))}
            {/* dots */}
            {[45, 135, 225, 315].map((rot, i) => (
              <circle
                key={i}
                cx="100" cy="10" r="3"
                fill={ringColor}
                opacity={isOffline ? 0.3 : 1}
                style={{ transformOrigin: '100px 100px', transform: `rotate(${rot}deg)`, filter: isOffline ? 'none' : `drop-shadow(0 0 4px ${glow})` }}
              />
            ))}
          </svg>
        </div>

        {/* Inner ring with progress arcs when thinking */}
        <div className={`absolute inset-20 rounded-full ${!isOffline ? 'animate-spin-slow' : ''}`} style={{ animationDuration: isThinking ? '2s' : '10s' }}>
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="90" fill="none" stroke={ringColor} strokeWidth="1" opacity={isOffline ? 0.2 : 0.35} />
            <circle cx="100" cy="100" r="90" fill="none" stroke={ringColor} strokeWidth="3"
              strokeDasharray="140 700" strokeLinecap="round"
              opacity={isOffline ? 0 : 1}
              style={{ filter: `drop-shadow(0 0 6px ${glow})` }} />
          </svg>
        </div>

        {/* Pulse ring only when listening */}
        {isListening && (
          <>
            <div className="absolute inset-28 rounded-full border-2 border-cyan-300 animate-pulse-ring" />
            <div className="absolute inset-28 rounded-full border-2 border-cyan-300 animate-pulse-ring" style={{ animationDelay: '0.8s' }} />
          </>
        )}

        {/* Core */}
        <button
          onClick={onClick}
          disabled={isOffline}
          className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-transform ${coreAnim} ${isOffline ? 'cursor-not-allowed' : 'cursor-pointer hover:brightness-110'}`}
          style={{
            background: isOffline
              ? 'radial-gradient(circle at 30% 30%, rgba(100,116,139,0.5), rgba(15,23,42,0.9))'
              : isThinking
                ? 'radial-gradient(circle at 30% 30%, #ddd6fe, #7c3aed 60%, #1e1b4b)'
                : isProcessing
                  ? 'radial-gradient(circle at 30% 30%, #fef3c7, #f59e0b 60%, #78350f)'
                  : 'radial-gradient(circle at 30% 30%, #cffafe, #06b6d4 55%, #164e63)',
            boxShadow: isOffline
              ? 'inset 0 0 20px rgba(0,0,0,0.6)'
              : `0 0 80px ${glow}, inset 0 0 40px rgba(255,255,255,0.35)`,
          }}
        >
          {isOffline ? (
            <PowerOff className="w-10 h-10 text-slate-400" />
          ) : isThinking ? (
            <Brain className="w-10 h-10 text-white" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' }} />
          ) : isProcessing ? (
            <Cpu className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '1.2s', filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' }} />
          ) : (
            <Mic className="w-10 h-10 text-white" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' }} />
          )}

          {/* Inner concentric ring */}
          <div className="absolute inset-2 rounded-full border border-white/40" />
          <div className="absolute inset-5 rounded-full border border-white/20" />
        </button>
      </div>

      {/* Audio bars when listening */}
      {isListening && (
        <div className="flex items-end gap-1 h-8 -mt-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="w-[3px] bg-cyan-300 rounded-full origin-bottom"
              style={{
                height: '100%',
                animation: `bar-wave ${400 + (i % 5) * 80}ms ease-in-out ${i * 40}ms infinite`,
                boxShadow: '0 0 6px rgba(34,211,238,0.9)',
              }}
            />
          ))}
        </div>
      )}

      <div className={`mt-4 font-orbitron tracking-[0.4em] text-sm ${isOffline ? 'text-slate-500' : 'text-cyan-300 glow-cyan'}`}>
        {label}
      </div>
    </div>
  );
}
