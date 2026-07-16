import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Settings, MapPin, Send, Power } from 'lucide-react';
import TopBar from './hud/TopBar';
import MetricGauge from './hud/MetricGauge';
import DiagnosticsPanel from './hud/DiagnosticsPanel';
import QuickCommands from './hud/QuickCommands';
import CapabilityDock from './hud/CapabilityDock';
import ChatPanel from './hud/ChatPanel';
import AgentOrb from './hud/AgentOrb';
import TickerBar from './hud/TickerBar';
import { quickCommands, initialMetrics, diagnostics as initialDiag, agentReplies, bootLines } from '../mock';

const STATES = {
  BOOT: 'boot',
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  PROCESSING: 'processing',
  OFFLINE: 'offline',
};

export default function DomingoHUD() {
  const [state, setState] = useState(STATES.BOOT);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [diag, setDiag] = useState(initialDiag);
  const [messages, setMessages] = useState([
    { role: 'system', text: '// AGUARDANDO ENTRADA. TOQUE NO NÚCLEO OU DIGITE UM COMANDO, SENHOR.' },
  ]);
  const [input, setInput] = useState('');
  const [bootIndex, setBootIndex] = useState(0);
  const timerRef = useRef(null);

  // Boot sequence
  useEffect(() => {
    if (state !== STATES.BOOT) return;
    if (bootIndex < bootLines.length) {
      const t = setTimeout(() => {
        setMessages((m) => [...m, { role: 'system', text: bootLines[bootIndex] }]);
        setBootIndex((i) => i + 1);
      }, 450);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setState(STATES.IDLE), 500);
      return () => clearTimeout(t);
    }
  }, [state, bootIndex]);

  // Live metrics tick
  useEffect(() => {
    const id = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => {
          if (state === STATES.OFFLINE) return { ...m, value: 0 };
          let delta = (Math.random() - 0.5) * (m.id === 'lat' ? 40 : 6);
          let next = m.value + delta;
          if (m.id === 'pwr') next = Math.max(72, Math.min(99, next));
          if (m.id === 'cpu') next = state === STATES.THINKING ? Math.min(97, m.value + Math.random() * 8) : Math.max(15, Math.min(70, next));
          if (m.id === 'mem') next = Math.max(2.5, Math.min(12, m.value + (Math.random() - 0.5) * 0.4));
          if (m.id === 'lat') next = Math.max(80, Math.min(480, next));
          if (m.id === 'net') next = Math.max(60, Math.min(100, next));
          if (m.id === 'freq') next = Math.max(2.4, Math.min(4.8, m.value + (Math.random() - 0.5) * 0.2));
          return { ...m, value: Number(next.toFixed(m.id === 'freq' || m.id === 'mem' ? 2 : 0)) };
        })
      );
    }, 1200);
    return () => clearInterval(id);
  }, [state]);

  const runAgent = (text) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setDiag((d) => ({ ...d, turns: d.turns + 1 }));
    setState(STATES.THINKING);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setState(STATES.PROCESSING);
      setTimeout(() => {
        const reply = agentReplies[Math.floor(Math.random() * agentReplies.length)];
        setMessages((m) => [...m, { role: 'agent', text: reply }]);
        setState(STATES.IDLE);
      }, 1200);
    }, 1600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (state === STATES.OFFLINE) return;
    runAgent(input);
    setInput('');
  };

  const handleOrbClick = () => {
    if (state === STATES.OFFLINE) return;
    if (state === STATES.LISTENING) {
      setState(STATES.THINKING);
      setTimeout(() => runAgent('Comando de voz simulado'), 600);
    } else if (state === STATES.IDLE) {
      setState(STATES.LISTENING);
      setTimeout(() => {
        // auto-cancel listening after 4s
        setState((s) => (s === STATES.LISTENING ? STATES.IDLE : s));
      }, 4000);
    }
  };

  const toggleOffline = () => {
    setState((s) => (s === STATES.OFFLINE ? STATES.IDLE : STATES.OFFLINE));
  };

  const stateLabel = useMemo(() => {
    switch (state) {
      case STATES.BOOT: return 'INICIALIZANDO';
      case STATES.IDLE: return 'TOQUE PARA FALAR';
      case STATES.LISTENING: return 'OUVINDO...';
      case STATES.THINKING: return 'PENSANDO...';
      case STATES.PROCESSING: return 'PROCESSANDO...';
      case STATES.OFFLINE: return 'OFFLINE';
      default: return '';
    }
  }, [state]);

  const isOnline = state !== STATES.OFFLINE && state !== STATES.BOOT;

  return (
    <div className="min-h-screen relative overflow-hidden text-cyan-100">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute inset-0 scanline pointer-events-none" />

      <TopBar isOnline={isOnline} state={state} onToggleOffline={toggleOffline} />

      <main className="relative z-10 px-4 pt-2 pb-24 grid grid-cols-12 gap-3" style={{ minHeight: 'calc(100vh - 60px)' }}>
        {/* LEFT SIDEBAR */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((m) => (
              <MetricGauge key={m.id} metric={m} offline={state === STATES.OFFLINE} />
            ))}
          </div>
          <DiagnosticsPanel diag={diag} state={state} />
          <QuickCommands commands={quickCommands} onPick={(c) => runAgent(c)} disabled={state === STATES.OFFLINE} />
        </aside>

        {/* CENTER */}
        <section className="col-span-12 md:col-span-6 lg:col-span-6 flex flex-col items-center justify-between">
          <div className="flex-1 w-full flex items-center justify-center">
            <AgentOrb state={state} onClick={handleOrbClick} label={stateLabel} />
          </div>

          <CapabilityDock disabled={state === STATES.OFFLINE} />
        </section>

        {/* RIGHT PANEL */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-3">
          <ChatPanel messages={messages} state={state} />
        </aside>
      </main>

      {/* Bottom input bar */}
      <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 z-20 border-t border-cyan-500/30 bg-[#030711]/90 backdrop-blur">
        <div className="flex items-center gap-3 px-6 py-3">
          <span className="text-cyan-400/70 font-tech">&gt;_</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={state === STATES.OFFLINE}
            placeholder={state === STATES.OFFLINE ? 'SISTEMA OFFLINE...' : 'Emita um comando, Senhor...'}
            className="flex-1 bg-transparent outline-none font-tech text-cyan-100 placeholder-cyan-500/50 tracking-wide disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={state === STATES.OFFLINE || !input.trim()}
            className="group relative px-4 py-1.5 text-xs font-orbitron tracking-[0.2em] text-cyan-300 border border-cyan-400/60 hover:bg-cyan-400/10 hover:text-cyan-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            TRANSMITIR
            <Send className="inline-block ml-2 w-3 h-3" />
          </button>
        </div>
        <TickerBar state={state} />
      </form>
    </div>
  );
}
