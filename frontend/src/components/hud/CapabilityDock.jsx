import React from 'react';
import { Mic, FolderOpen, Camera, Monitor, Globe, Mail, Calendar, BrainCircuit } from 'lucide-react';
import { capabilities } from '../../mock';

const iconMap = { Mic, FolderOpen, Camera, Monitor, Globe, Mail, Calendar, BrainCircuit };

export default function CapabilityDock({ disabled }) {
  return (
    <div className="panel panel-corners p-3 relative w-full max-w-3xl">
      <span className="c-tl" /><span className="c-br" />
      <div className="font-tech text-[10px] text-cyan-500/80 tracking-widest mb-2">// DOCK DE CAPACIDADES</div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {capabilities.map((cap) => {
          const Icon = iconMap[cap.icon];
          return (
            <button
              key={cap.id}
              disabled={disabled}
              className="group flex flex-col items-center gap-1 py-2 border border-cyan-500/20 hover:border-cyan-300 hover:bg-cyan-400/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Icon className="w-5 h-5 text-cyan-300 group-hover:text-cyan-100 transition-colors" />
              <span className="font-orbitron text-[9px] tracking-widest text-cyan-400/80 group-hover:text-cyan-200">{cap.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
