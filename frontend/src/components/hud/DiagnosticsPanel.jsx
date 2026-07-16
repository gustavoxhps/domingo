import React from 'react';

export default function DiagnosticsPanel({ diag, state }) {
  const rows = [
    ['Modelo', diag.model],
    ['Sessão', diag.session],
    ['Turnos', diag.turns],
    ['Web', diag.web],
  ];
  return (
    <div className="panel panel-corners p-3 relative">
      <span className="c-tl" /><span className="c-br" />
      <div className="font-tech text-[10px] text-cyan-500/80 tracking-widest mb-2">// DIAGNÓSTICOS</div>
      <div className="space-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px] font-tech">
            <span className="text-cyan-500/70">{k}</span>
            <span className="text-cyan-200">{v}</span>
          </div>
        ))}
        <div className="flex justify-between text-[11px] font-tech pt-1 border-t border-cyan-500/10 mt-2">
          <span className="text-cyan-500/70">Estado</span>
          <span className="text-cyan-300 glow-cyan uppercase">{state}</span>
        </div>
      </div>
    </div>
  );
}
