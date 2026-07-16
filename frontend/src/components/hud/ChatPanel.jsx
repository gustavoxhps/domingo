import React, { useEffect, useRef } from 'react';

export default function ChatPanel({ messages, state }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="panel panel-corners p-3 h-full flex flex-col relative" style={{ minHeight: '60vh' }}>
      <span className="c-tl" /><span className="c-br" />
      <div className="font-tech text-[10px] text-cyan-500/80 tracking-widest mb-2">// TRANSMISSÃO</div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className="animate-fade-in">
            {m.role === 'system' && (
              <div className="font-tech text-[10px] text-cyan-500/70 leading-relaxed">{m.text}</div>
            )}
            {m.role === 'user' && (
              <div className="font-tech text-[11px] text-amber-300/90">
                <span className="text-amber-500/70">USUÁRIO &gt;</span> {m.text}
              </div>
            )}
            {m.role === 'agent' && (
              <div className="font-tech text-[11px] text-cyan-100">
                <span className="text-cyan-400">DOMINGO &gt;</span> {m.text}
              </div>
            )}
          </div>
        ))}
        {(state === 'thinking' || state === 'processing') && (
          <div className="font-tech text-[10px] text-cyan-400/80 flex items-center gap-1">
            <span>DOMINGO</span>
            <span className="inline-flex gap-0.5">
              <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
              <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
