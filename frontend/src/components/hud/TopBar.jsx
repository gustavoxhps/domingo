import React, { useEffect, useState } from 'react';
import { Settings, Volume2, Mic } from 'lucide-react';

export default function TopBar({ isOnline, onToggleOffline }) {
  return (
    <header className="relative z-30 h-[64px] flex items-center justify-between px-6">
      <div className="w-40" />

      <div className="flex items-center gap-3">
        <div className="px-6 py-1.5 border border-cyan-400/40 rounded-md bg-[#050c1a]/70 backdrop-blur flex items-center gap-3">
          <span className="font-orbitron text-2xl font-semibold tracking-widest text-cyan-300 glow-cyan">Domingo</span>
          <span className="px-2 py-0.5 text-[10px] font-tech tracking-widest border border-cyan-500/50 text-cyan-400 rounded">beta v1.0.1</span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-40 justify-end">
        <button
          onClick={onToggleOffline}
          className="flex items-center gap-2 text-xs font-orbitron tracking-widest"
          title="Alternar Online/Offline"
        >
          <span
            className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500 animate-flicker'}`}
            style={{ boxShadow: isOnline ? '0 0 10px rgba(52,211,153,0.9)' : '0 0 10px rgba(239,68,68,0.9)' }}
          />
          <span className={isOnline ? 'text-emerald-300' : 'text-red-400'}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </button>
        <IconBtn><Volume2 className="w-4 h-4" /></IconBtn>
        <IconBtn><Mic className="w-4 h-4" /></IconBtn>
        <IconBtn><Settings className="w-4 h-4" /></IconBtn>
      </div>
    </header>
  );
}

function IconBtn({ children }) {
  return (
    <button className="w-9 h-9 flex items-center justify-center border border-cyan-400/40 rounded-md text-cyan-300 hover:border-cyan-300 hover:bg-cyan-400/10 transition-colors">
      {children}
    </button>
  );
}
