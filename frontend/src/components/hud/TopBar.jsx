import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

function ToggleIconBtn({ enabled, onToggle, EnabledIcon, DisabledIcon, title }) {
  const color = enabled ? '#22d3ee' : '#f43f5e';
  const glow = enabled ? 'rgba(34,211,238,0.7)' : 'rgba(244,63,94,0.7)';
  const Icon = enabled ? EnabledIcon : DisabledIcon;
  return (
    <button
      onClick={onToggle}
      title={title}
      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border transition-all flex-shrink-0"
      style={{
        borderColor: `${color}80`,
        color,
        boxShadow: `0 0 10px ${glow}, inset 0 0 8px ${color}22`,
      }}
    >
      <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" style={{ filter: `drop-shadow(0 0 4px ${glow})` }} />
    </button>
  );
}

export default function TopBar({ isOnline, onToggleOffline }) {
  const [audio, setAudio] = useState(true);
  const [mic, setMic] = useState(true);

  return (
    <header className="relative z-30 h-[70px]">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      {/* Centered protruding logo pill */}
      <div className="absolute left-1/2 -top-1 -translate-x-1/2">
        <div className="relative">
          <div
            className="px-4 sm:px-10 pt-3 sm:pt-4 pb-2 sm:pb-3 border border-cyan-400/50 border-t-0 flex items-center gap-2 sm:gap-3 relative"
            style={{
              background: 'linear-gradient(180deg, rgba(6,20,40,0.95), rgba(3,10,20,0.85))',
              borderRadius: '0 0 18px 18px',
              boxShadow: '0 8px 24px -6px rgba(34,211,238,0.35), inset 0 -1px 0 rgba(34,211,238,0.4)',
            }}
          >
            <span className="font-orbitron text-lg sm:text-[26px] font-semibold tracking-widest text-cyan-300 glow-cyan leading-none">
              Domingo
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-tech tracking-widest border border-cyan-500/60 text-cyan-300 rounded">
              beta v1.0.1
            </span>
          </div>
          <div className="absolute -bottom-[1px] left-4 right-4 h-[2px]"
            style={{ background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)', filter: 'blur(1px)' }} />
        </div>
      </div>

      {/* Left: Online/Offline indicator */}
      <div className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 flex items-center">
        <button
          onClick={onToggleOffline}
          className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-orbitron tracking-widest"
          title="Alternar Online/Offline"
        >
          <span
            className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500 animate-flicker'}`}
            style={{ boxShadow: isOnline ? '0 0 10px rgba(52,211,153,0.9)' : '0 0 10px rgba(239,68,68,0.9)' }}
          />
          <span className={`hidden sm:inline ${isOnline ? 'text-emerald-300' : 'text-red-400'}`}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </button>
      </div>

      {/* Right controls */}
      <div className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-3">
        <ToggleIconBtn
          enabled={audio}
          onToggle={() => setAudio((v) => !v)}
          EnabledIcon={Volume2}
          DisabledIcon={VolumeX}
          title={audio ? 'Silenciar áudio' : 'Ativar áudio'}
        />
        <ToggleIconBtn
          enabled={mic}
          onToggle={() => setMic((v) => !v)}
          EnabledIcon={Mic}
          DisabledIcon={MicOff}
          title={mic ? 'Desativar microfone' : 'Ativar microfone'}
        />
        <button
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-cyan-400/60 text-cyan-300 hover:bg-cyan-400/10 transition-colors flex-shrink-0"
          style={{ boxShadow: '0 0 10px rgba(34,211,238,0.5), inset 0 0 8px rgba(34,211,238,0.1)' }}
          title="Configurações"
        >
          <Settings className="w-4 h-4 sm:w-[18px] sm:h-[18px]" style={{ filter: 'drop-shadow(0 0 4px rgba(34,211,238,0.7))' }} />
        </button>
      </div>
    </header>
  );
}
