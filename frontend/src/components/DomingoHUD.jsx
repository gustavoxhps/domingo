import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, ChevronsRight, ChevronsLeft } from 'lucide-react';
import TopBar from './hud/TopBar';
import LeftPanel from './hud/LeftPanel';
import LogPanel from './hud/LogPanel';
import AgentOrb from './hud/AgentOrb';
import { agentReplies } from '../mock';

const STATES = {
  BOOT: 'boot',
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  PROCESSING: 'processing',
  OFFLINE: 'offline',
};

const nowStr = () => new Date().toTimeString().slice(0, 8);

// Wave visualizer under the orb
function WaveVisualizer({ state }) {
  const isOffline = state === 'offline';
  const isActive = state === 'listening' || state === 'thinking' || state === 'processing';
  const color = state === 'thinking' ? '#a78bfa' : state === 'processing' ? '#f59e0b' : isOffline ? '#475569' : '#22d3ee';
  const glow = state === 'thinking' ? 'rgba(167,139,250,0.7)' : state === 'processing' ? 'rgba(245,158,11,0.7)' : isOffline ? 'rgba(71,85,105,0.3)' : 'rgba(34,211,238,0.7)';

  const amp = isActive ? 22 : 6;
  const speed = state === 'processing' ? 1.4 : state === 'thinking' ? 2 : 3.5;

  return (
    <div className="w-full flex justify-center mt-6 pointer-events-none" style={{ opacity: isOffline ? 0.25 : 1 }}>
      <svg viewBox="0 0 800 80" width="700" height="60" className="overflow-visible">
        <defs>
          <linearGradient id="waveFade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="20%" stopColor={color} stopOpacity="1" />
            <stop offset="80%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2].map((k) => (
          <path
            key={k}
            fill="none"
            stroke="url(#waveFade)"
            strokeWidth={1.2 - k * 0.2}
            opacity={0.9 - k * 0.25}
            style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
          >
            <animate
              attributeName="d"
              dur={`${speed + k * 0.4}s`}
              repeatCount="indefinite"
              values={`
                M 0 40 Q 100 ${40 - amp} 200 40 T 400 40 T 600 40 T 800 40;
                M 0 40 Q 100 ${40 + amp} 200 40 T 400 40 T 600 40 T 800 40;
                M 0 40 Q 100 ${40 - amp} 200 40 T 400 40 T 600 40 T 800 40
              `}
            />
          </path>
        ))}
      </svg>
    </div>
  );
}

// Starfield background
function Starfield() {
  const stars = useMemo(() => Array.from({ length: 90 }).map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.6 + 0.4,
    delay: Math.random() * 3,
    duration: Math.random() * 3 + 2,
  })), []);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-cyan-100"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            boxShadow: '0 0 4px rgba(165,243,252,0.8)',
            opacity: 0.6,
            animation: `flicker ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function DomingoHUD() {
  const [state, setState] = useState(STATES.IDLE);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);
  const [logs, setLogs] = useState([{ time: nowStr(), status: 'AGUARDANDO' }]);
  const [perf, setPerf] = useState({ cpu: 42, mem: 68, lat: 210 });
  const timerRef = useRef(null);

  // Push a log entry whenever state changes
  useEffect(() => {
    const map = {
      idle: 'AGUARDANDO',
      listening: 'OUVINDO',
      thinking: 'PENSANDO',
      processing: 'PROCESSANDO',
      offline: 'OFFLINE',
    };
    if (map[state]) {
      setLogs((l) => [{ time: nowStr(), status: map[state] }, ...l].slice(0, 60));
    }
  }, [state]);

  // Live perf tick
  useEffect(() => {
    const id = setInterval(() => {
      if (state === STATES.OFFLINE) {
        setPerf({ cpu: 0, mem: 0, lat: 0 });
        return;
      }
      setPerf((p) => ({
        cpu: Math.max(20, Math.min(97, p.cpu + (state === STATES.THINKING ? Math.random() * 6 : (Math.random() - 0.5) * 8))),
        mem: Math.max(50, Math.min(94, p.mem + (Math.random() - 0.5) * 4)),
        lat: Math.max(80, Math.min(480, p.lat + (Math.random() - 0.5) * 40)),
      }));
    }, 1400);
    return () => clearInterval(id);
  }, [state]);

  const systems = useMemo(() => {
    const off = state === STATES.OFFLINE;
    return [
      { name: 'Rede',      status: off ? 'DESATIVADA' : 'NOMINAL',     color: off ? 'amber' : 'emerald' },
      { name: 'IA Core',   status: off ? 'STANDBY'    : 'OPERACIONAL', color: off ? 'amber' : 'emerald' },
      { name: 'Mem\u00f3ria',    status: off ? 'INATIVA'    : 'ATIVO',       color: off ? 'amber' : 'emerald' },
      { name: 'Seguran\u00e7a', status: off ? 'MONITORANDO' : 'NOMINAL',   color: off ? 'amber' : 'emerald' },
    ];
  }, [state]);

  const runAgent = (text) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', text }]);
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
      setTimeout(() => runAgent('Comando de voz simulado'), 200);
    } else if (state === STATES.IDLE) {
      setState(STATES.LISTENING);
      setTimeout(() => {
        setState((s) => (s === STATES.LISTENING ? STATES.IDLE : s));
      }, 4000);
    }
  };

  const toggleOffline = () => {
    setState((s) => (s === STATES.OFFLINE ? STATES.IDLE : STATES.OFFLINE));
  };

  const stateLabel = useMemo(() => {
    switch (state) {
      case STATES.IDLE: return 'TOQUE PARA FALAR';
      case STATES.LISTENING: return 'OUVINDO...';
      case STATES.THINKING: return 'PENSANDO...';
      case STATES.PROCESSING: return 'PROCESSANDO...';
      case STATES.OFFLINE: return 'OFFLINE';
      default: return '';
    }
  }, [state]);

  const isOnline = state !== STATES.OFFLINE;

  return (
    <div className="min-h-screen relative overflow-hidden text-cyan-100" style={{ background: '#020617' }}>
      <Starfield />
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="absolute inset-0 scanline pointer-events-none opacity-70" />

      <TopBar isOnline={isOnline} onToggleOffline={toggleOffline} />

      <main className="relative z-10 flex px-4 pb-24 gap-3" style={{ minHeight: 'calc(100vh - 64px - 72px)' }}>
        {/* LEFT PANEL / restore tab */}
        {showLeft ? (
          <LeftPanel
            state={state}
            onHide={() => setShowLeft(false)}
            perf={{ cpu: Math.round(perf.cpu), mem: Math.round(perf.mem), lat: Math.round(perf.lat) }}
            systems={systems}
          />
        ) : (
          <button
            onClick={() => setShowLeft(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-30 border border-cyan-400/50 border-l-0 rounded-r-md bg-[#050c1a]/80 backdrop-blur px-2 py-4 hover:bg-cyan-400/10 transition-colors"
            title="Mostrar painéis"
          >
            <div className="flex flex-col items-center gap-2">
              <ChevronsRight className="w-4 h-4 text-cyan-300" />
              <span className="font-tech text-[10px] tracking-widest text-cyan-300 [writing-mode:vertical-rl] rotate-180">PAINEL</span>
            </div>
          </button>
        )}

        {/* CENTER */}
        <section className="flex-1 flex flex-col items-center justify-center relative">
          <AgentOrb state={state} onClick={handleOrbClick} label={stateLabel} />
          <WaveVisualizer state={state} />
        </section>

        {/* RIGHT PANEL / restore tab */}
        {showRight ? (
          <LogPanel logs={logs} onHide={() => setShowRight(false)} />
        ) : (
          <button
            onClick={() => setShowRight(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-30 border border-cyan-400/50 border-r-0 rounded-l-md bg-[#050c1a]/80 backdrop-blur px-2 py-4 hover:bg-cyan-400/10 transition-colors"
            title="Mostrar log"
          >
            <div className="flex flex-col items-center gap-2">
              <ChevronsLeft className="w-4 h-4 text-cyan-300" />
              <span className="font-tech text-[10px] tracking-widest text-cyan-300 [writing-mode:vertical-rl]">LOG</span>
            </div>
          </button>
        )}
      </main>

      {/* Bottom input */}
      <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-4 pt-2">
        <div className="max-w-[1400px] mx-auto panel panel-corners px-4 py-2 flex items-center gap-3 relative">
          <span className="c-tl" /><span className="c-br" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={state === STATES.OFFLINE}
            placeholder={state === STATES.OFFLINE ? 'SISTEMA OFFLINE...' : 'Digite se preferir...'}
            className="flex-1 bg-transparent outline-none font-tech text-cyan-100 placeholder-cyan-500/50 tracking-wide disabled:opacity-40 py-1.5"
          />
          <button
            type="submit"
            disabled={state === STATES.OFFLINE || !input.trim()}
            className="px-4 py-1.5 text-[11px] font-orbitron tracking-[0.25em] text-cyan-300 border border-cyan-400/60 rounded hover:bg-cyan-400/10 hover:text-cyan-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            ENVIAR
            <Send className="w-3 h-3" />
          </button>
        </div>
      </form>
    </div>
  );
}
