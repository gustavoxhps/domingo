import React, { useEffect, useState } from 'react';
import { MapPin, Settings, Power, Wifi } from 'lucide-react';

export default function TopBar({ isOnline, state, onToggleOffline }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const iso = now.toISOString().slice(0, 19).replace('T', ' ');

  return (
    <header className="relative z-20 h-[60px] flex items-center justify-between px-6 border-b border-cyan-500/30 bg-[#050c1a]/60 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="relative w-9 h-9">
          <div className="absolute inset-0 rounded-full border border-cyan-400/70 animate-spin-slow" />
          <div className="absolute inset-1 rounded-full border border-cyan-300/40 animate-spin-reverse" />
          <div className="absolute inset-2.5 rounded-full bg-cyan-400 animate-pulse" style={{ boxShadow: '0 0 12px rgba(34,211,238,0.9)' }} />
        </div>
        <div className="leading-tight">
          <div className="font-orbitron font-bold tracking-[0.35em] text-cyan-300 glow-cyan text-lg">
            D.O.M.I.N.G.O
          </div>
          <div className="font-tech text-[10px] text-cyan-500/80 tracking-widest">
            V3.1 • {iso} UTC
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button
          onClick={onToggleOffline}
          className="group flex items-center gap-2 text-xs font-orbitron tracking-widest"
          title="Alternar Online/Offline"
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-500'} ${isOnline ? 'animate-pulse' : 'animate-flicker'}`} style={{ boxShadow: isOnline ? '0 0 10px rgba(52,211,153,0.9)' : '0 0 10px rgba(239,68,68,0.9)' }} />
          <span className={isOnline ? 'text-emerald-300 glow-emerald' : 'text-red-400'}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </button>
        <button className="text-cyan-400/70 hover:text-cyan-200 transition-colors">
          <MapPin className="w-4 h-4" />
        </button>
        <button className="text-cyan-400/70 hover:text-cyan-200 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
