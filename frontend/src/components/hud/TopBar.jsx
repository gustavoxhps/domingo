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
      className="w-10 h-10 flex items-center justify-center rounded-md border transition-all"
      style={{
        borderColor: `${color}80`,
        color,
        boxShadow: `0 0 10px ${glow}, inset 0 0 8px ${color}22`,
      }}
    >
      <Icon className="w-[18px] h-[18px]" style={{ filter: `drop-shadow(0 0 4px ${glow})` }} />
    </button>
  );
}

export default function TopBar({ isOnline, onToggleOffline }) {
  const [audio, setAudio] = useState(true);
  const [mic, setMic] = useState(true);

  return (
    <header className="relative z-30 h-[70px]">
      {/* Full-width bottom line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      {/* Centered protruding logo pill */}
      <div className="absolute left-1/2 -top-1 -translate-x-1/2">
        <div className="relative">
          {/* Backdrop shape - trapezoid look via clip */}
          <div
            className="px-10 pt-4 pb-3 border border-cyan-400/50 border-t-0 flex items-center gap-3 relative"
            style={{
              background: 'linear-gradient(180deg, rgba(6,20,40,0.95), rgba(3,10,20,0.85))',
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
              boxShadow: '0 8px 24px -6px rgba(34,211,238,0.35), inset 0 -1px 0 rgba(34,211,238,0.4)',
              clipPath: 'polygon(6% 0, 94% 0, 100% 100%, 0 100%)',
            }}
          >
            <span className="font-orbitron text-[26px] font-semibold tracking-widest text-cyan-300 glow-cyan leading-none">
              Domingo
            </span>
            <span className="px-2 py-0.5 text-[10px] font-tech tracking-widest border border-cyan-500/60 text-cyan-300 rounded">
              beta v1.0.1
            </span>
          </div>
          {/* Neon underline glow */}
          <div className="absolute -bottom-[1px] left-4 right-4 h-[2px]"
            style={{ background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)', filter: 'blur(1px)' }} />
        </div>
      </div>

      {/* Right controls */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
        <button
          onClick={onToggleOffline}
          className="flex items-center gap-2 text-xs font-orbitron tracking-widest mr-1"
          title="Alternar Online/Offline"
        >
          <span
            className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500 animate-flicker'}`}
            style={{ boxShadow: isOnline ? '0 0 10px rgba(52,211,153,0.9)' : '0 0 10px rgba(239,68,68,0.9)' }}
          />
          <span className={isOnline ? 'text-emerald-300' : 'text-red-400'}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </button>
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
        {/* Settings - fixed cyan */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-md border border-cyan-400/60 text-cyan-300 hover:bg-cyan-400/10 transition-colors"
          style={{ boxShadow: '0 0 10px rgba(34,211,238,0.5), inset 0 0 8px rgba(34,211,238,0.1)' }}
          title="Configurações"
        >
          <Settings className="w-[18px] h-[18px]" style={{ filter: 'drop-shadow(0 0 4px rgba(34,211,238,0.7))' }} />
        </button>
      </div>
    </header>
  );
}
