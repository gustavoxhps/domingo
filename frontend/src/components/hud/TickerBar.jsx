import React from 'react';

export default function TickerBar({ state }) {
  const items = [
    'NÚCLEO DOMINGO v3.1',
    'REDE NEURAL: ATIVA',
    'CRIPTOGRAFIA: AES-512',
    'SATELITE: SYNC',
    'PROTOCOLOS: OK',
    'MEMÓRIA DE LONGO PRAZO: ESTÁVEL',
    `ESTADO: ${state.toUpperCase()}`,
    'AGUARDANDO INSTRUÇÕES',
  ];
  const line = items.join('   •   ');
  return (
    <div className="h-6 overflow-hidden border-t border-cyan-500/20 bg-[#050c1a]/80">
      <div className="flex whitespace-nowrap animate-ticker py-1 font-tech text-[10px] tracking-widest text-cyan-500/70">
        <span className="px-8">{line}</span>
        <span className="px-8">{line}</span>
      </div>
    </div>
  );
}
