// =========================================
// DOMINGO - static HUD (vanilla JS)
// =========================================

// ---------- Constants ----------
const AGENT_REPLIES = [
  'Sistemas online. Aguardando comandos, Senhor.',
  'Processando sua solicitação. Análise concluída.',
  'Todos os subsistemas operando dentro dos parâmetros normais.',
  'Comando recebido. Executando rotina.',
  'Compreendido. Iniciando protocolo apropriado.',
  'Dados armazenados na memória de longo prazo.',
  'Análise contextual concluída. Recomendo prosseguir.',
];

const STATE_META = {
  idle:       { label: 'TOQUE PARA FALAR', log: 'AGUARDANDO' },
  listening:  { label: 'OUVINDO...',       log: 'OUVINDO' },
  thinking:   { label: 'PENSANDO...',      log: 'PENSANDO' },
  processing: { label: 'PROCESSANDO...',   log: 'PROCESSANDO' },
  offline:    { label: 'OFFLINE',          log: 'OFFLINE' },
};

// Colors per state
const PALETTE = {
  idle:       { primary:'#22d3ee', secondary:'#0891b2', accent:'#a5f3fc', deep:'#155e75', glow:'rgba(34,211,238,0.85)' },
  listening:  { primary:'#22d3ee', secondary:'#0891b2', accent:'#a5f3fc', deep:'#155e75', glow:'rgba(34,211,238,0.9)' },
  thinking:   { primary:'#a78bfa', secondary:'#7c3aed', accent:'#e9d5ff', deep:'#4c1d95', glow:'rgba(167,139,250,0.85)' },
  processing: { primary:'#f59e0b', secondary:'#d97706', accent:'#fde68a', deep:'#78350f', glow:'rgba(245,158,11,0.85)' },
  offline:    { primary:'#475569', secondary:'#334155', accent:'#64748b', deep:'#1e293b', glow:'rgba(71,85,105,0.4)' },
};

// Brain neurons (23) inside 400x400 viewBox
const NEURONS = [
  {x:130,y:120},{x:110,y:170},{x:95,y:220},{x:115,y:270},{x:155,y:300},
  {x:155,y:155},{x:145,y:210},{x:175,y:245},{x:180,y:165},{x:175,y:115},
  {x:270,y:120},{x:290,y:170},{x:305,y:220},{x:285,y:270},{x:245,y:300},
  {x:245,y:155},{x:255,y:210},{x:225,y:245},{x:220,y:165},{x:225,y:115},
  {x:200,y:190},{x:200,y:240},{x:200,y:320}
];
const SYNAPSES = [
  [0,5],[5,1],[1,6],[6,2],[2,3],[3,7],[7,4],[4,21],[5,9],[9,0],[8,5],[8,6],[6,7],[8,20],[9,8],
  [10,15],[15,11],[11,16],[16,12],[12,13],[13,17],[17,14],[14,21],[15,19],[19,10],[18,15],[18,16],[16,17],[18,20],[19,18],
  [20,21],[21,22],[8,18],[6,16],[7,17],[5,19],[3,13],[4,14]
];
const BRAIN_OUTLINE =
  'M 200 60 C 150 60, 100 90, 90 140 C 60 150, 55 200, 80 230 C 60 260, 90 310, 130 320 C 140 355, 180 365, 200 345 C 220 365, 260 355, 270 320 C 310 310, 340 260, 320 230 C 345 200, 340 150, 310 140 C 300 90, 250 60, 200 60 Z';

// ---------- Helpers ----------
const polar = (cx, cy, r, deg) => {
  const a = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
const arcPath = (cx, cy, r, s, e) => {
  const [x1,y1] = polar(cx,cy,r,s);
  const [x2,y2] = polar(cx,cy,r,e);
  const large = (e-s) <= 180 ? 0 : 1;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
};
const nowStr = () => new Date().toTimeString().slice(0,8);
const rand   = (min,max) => min + Math.random() * (max-min);
const clamp  = (v,min,max) => Math.max(min, Math.min(max, v));

// SVG icon templates (feather / lucide-style)
const ICONS = {
  volume2:  '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  volumeX:  '<path d="M11 5 6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>',
  mic:      '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
  micOff:   '<line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
};

// ---------- State ----------
const app = {
  state: 'idle',
  audio: true,
  mic: true,
  showLeft: window.innerWidth >= 900,
  showRight: window.innerWidth >= 900,
  isMobile: window.innerWidth < 900,
  perf: { cpu: 42, mem: 68, lat: 210 },
  timer: null,
};

// ---------- Starfield ----------
function buildStarfield() {
  const host = document.getElementById('starfield');
  const count = 60;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    const size = rand(0.4, 2);
    s.style.cssText = `position:absolute; border-radius:9999px; background:#a5f3fc;
      left:${rand(0,100)}%; top:${rand(0,100)}%; width:${size}px; height:${size}px;
      box-shadow:0 0 4px rgba(165,243,252,.8); opacity:.6;
      animation: flicker ${rand(2,5)}s ease-in-out ${rand(0,3)}s infinite;`;
    frag.appendChild(s);
  }
  host.appendChild(frag);
}

// ---------- Icons rendering ----------
function svgIcon(name, size = 18) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}

function refreshIconButtons() {
  const audioBtn = document.getElementById('audioToggle');
  audioBtn.innerHTML = svgIcon(app.audio ? 'volume2' : 'volumeX');
  audioBtn.classList.toggle('on', app.audio);
  audioBtn.classList.toggle('off', !app.audio);
  audioBtn.title = app.audio ? 'Silenciar áudio' : 'Ativar áudio';

  const micBtn = document.getElementById('micToggle');
  micBtn.innerHTML = svgIcon(app.mic ? 'mic' : 'micOff');
  micBtn.classList.toggle('on', app.mic);
  micBtn.classList.toggle('off', !app.mic);
  micBtn.title = app.mic ? 'Desativar microfone' : 'Ativar microfone';
}

// ---------- Main Orb (SVG generator) ----------
function buildOrb() {
  const host = document.getElementById('orbHost');
  const state = app.state;
  const p = PALETTE[state];
  const off = state === 'offline';
  const listening = state === 'listening';
  const thinking = state === 'thinking';
  const processing = state === 'processing';

  const size = app.isMobile ? 340 : 520;
  const coreSize = app.isMobile ? 180 : 260;

  const fireDur = thinking ? 0.9 : processing ? 0.6 : listening ? 1.4 : 2.2;
  const nodeDur = thinking ? 0.8 : processing ? 0.5 : listening ? 1.2 : 2.4;

  const cx = 250, cy = 250;

  // 12 wedges
  const wedges = Array.from({length:12}).map((_,i) => {
    const deg = i * 30;
    const [x1,y1] = polar(cx,cy,230,deg-8);
    const [x2,y2] = polar(cx,cy,230,deg+8);
    const [x3,y3] = polar(cx,cy,250,deg+12);
    const [x4,y4] = polar(cx,cy,250,deg-12);
    return `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}"
      fill="${p.deep}" stroke="${p.primary}" stroke-width="1" opacity="${off?0.2:0.5}"/>`;
  }).join('');

  // 8 outer hexagons
  const hexes = Array.from({length:8}).map((_,i) => {
    const deg = i * 45 + 22.5;
    const [px,py] = polar(cx,cy,260,deg);
    const s = 8;
    const pts = Array.from({length:6}).map((_,k) => {
      const a = (k * 60) * Math.PI / 180;
      return `${px + s * Math.cos(a)},${py + s * Math.sin(a)}`;
    }).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="${p.primary}" stroke-width="1" opacity="${off?0.25:0.7}"/>`;
  }).join('');

  // Outer ticks
  const outerTicks = Array.from({length:72}).map((_,i) => {
    const deg = (360*i/72);
    const [x1,y1] = polar(cx,cy,218,deg);
    const [x2,y2] = polar(cx,cy,232,deg);
    const isMajor = i % 6 === 0;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
      stroke="${p.primary}" stroke-width="${isMajor?2:1}"
      opacity="${off?0.25:(isMajor?0.9:0.5)}"
      ${isMajor && !off ? `style="filter:drop-shadow(0 0 3px ${p.glow})"` : ''}/>`;
  }).join('');

  // Broken segments (outer)
  const brokenOuter = [10,100,190,280].map(s =>
    `<path d="${arcPath(cx,cy,225,s,s+30)}" fill="none" stroke="${p.primary}"
      stroke-width="4" stroke-linecap="round" opacity="${off?0.3:1}"
      ${off?'':`style="filter:drop-shadow(0 0 6px ${p.glow})"`}/>`
  ).join('');

  // Inner ticks
  const innerTicks = Array.from({length:60}).map((_,i) => {
    const deg = (360*i/60);
    const [x1,y1] = polar(cx,cy,130,deg);
    const [x2,y2] = polar(cx,cy,140,deg);
    const isMajor = i % 5 === 0;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
      stroke="${p.primary}" stroke-width="${isMajor?1.5:0.7}" opacity="${off?0.2:(isMajor?0.9:0.4)}"/>`;
  }).join('');

  const innerBroken = [0,120,240].map(s =>
    `<path d="${arcPath(cx,cy,138,s,s+20)}" fill="none" stroke="${p.accent}"
      stroke-width="3" stroke-linecap="round" opacity="${off?0.3:1}"
      ${off?'':`style="filter:drop-shadow(0 0 5px ${p.glow})"`}/>`
  ).join('');

  // Radial beams
  const beams = !off ? `
    <div class="absolute inset-0 pointer-events-none" style="opacity:.6">
      <svg viewBox="0 0 500 500" width="100%" height="100%">
        ${[0,45,90,135,180,225,270,315].map(deg =>
          `<g style="transform-origin:250px 250px; transform:rotate(${deg}deg)">
            <path d="M 250 40 L 240 250 L 260 250 Z" fill="${p.primary}" opacity=".15" style="filter:blur(6px)"/>
          </g>`).join('')}
      </svg>
    </div>` : '';

  // Brain synapses + neurons
  const synapses = !off ? SYNAPSES.map(([a,b],idx) => {
    const nA = NEURONS[a], nB = NEURONS[b];
    const delay = (idx * 0.13) % 3;
    const secondary = (thinking || processing) ? `
      <circle r="1.4" fill="${p.accent}" opacity="0.7">
        <animateMotion dur="${fireDur}s" repeatCount="indefinite" begin="${delay + fireDur/2}s"
          path="M ${nB.x} ${nB.y} L ${nA.x} ${nA.y}" keyPoints="0;1" keyTimes="0;1"/>
        <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.15;0.85;1"
          dur="${fireDur}s" repeatCount="indefinite" begin="${delay + fireDur/2}s"/>
      </circle>` : '';
    return `
      <g>
        <line x1="${nA.x}" y1="${nA.y}" x2="${nB.x}" y2="${nB.y}" stroke="${p.primary}" stroke-width="0.6" opacity="0.22"/>
        <circle r="2.2" fill="${p.accent}" opacity="0.95" style="filter:drop-shadow(0 0 4px ${p.glow})">
          <animateMotion dur="${fireDur}s" repeatCount="indefinite" begin="${delay}s"
            path="M ${nA.x} ${nA.y} L ${nB.x} ${nB.y}" keyPoints="0;1" keyTimes="0;1"/>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1"
            dur="${fireDur}s" repeatCount="indefinite" begin="${delay}s"/>
        </circle>
        ${secondary}
      </g>`;
  }).join('') : '';

  const neurons = NEURONS.map((n,idx) => {
    const halo = !off ? `
      <circle cx="${n.x}" cy="${n.y}" r="6" fill="${p.primary}" opacity="0.15">
        <animate attributeName="r" values="4;9;4" dur="${nodeDur}s" begin="${(idx*0.11)%2}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.05;0.35;0.05" dur="${nodeDur}s" begin="${(idx*0.11)%2}s" repeatCount="indefinite"/>
      </circle>` : '';
    return `${halo}
      <circle cx="${n.x}" cy="${n.y}" r="${off?1.8:2.4}" fill="${off?p.primary:p.accent}"
        opacity="${off?0.4:1}" style="${off?'':'filter:drop-shadow(0 0 4px '+p.glow+')'}"/>`;
  }).join('');

  const pulseRings = listening ? `
    <div class="absolute rounded-full border-2 animate-pulse-ring" style="inset:150px; border-color:${p.primary}"></div>
    <div class="absolute rounded-full border-2 animate-pulse-ring" style="inset:150px; border-color:${p.primary}; animation-delay:.8s"></div>` : '';

  // Equalizer bars when listening
  const bars = listening ? `
    <div class="absolute -bottom-2 flex items-end gap-1 h-8">
      ${Array.from({length:28}).map((_,i)=>
        `<span class="eq-bar" style="animation-duration:${380 + (i%5)*90}ms; animation-delay:${i*40}ms; background:${p.accent}; box-shadow:0 0 6px ${p.glow}"></span>`
      ).join('')}
    </div>` : '';

  // Overlay chip
  const chip = off ? `
    <div class="flex items-center gap-2 px-3 py-1 border border-slate-600 rounded-full bg-slate-900/70">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
      <span class="font-orbitron text-[10px] tracking-widest text-slate-400">DESLIGADO</span>
    </div>` : listening ? `
    <div class="flex items-center gap-2 px-3 py-1 border rounded-full backdrop-blur" style="border-color:${p.primary}; background:rgba(0,0,0,.4)">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${p.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS.mic}</svg>
      <span class="font-orbitron text-[10px] tracking-widest" style="color:${p.accent}">OUVINDO</span>
    </div>` : '';

  const bg = off
    ? 'radial-gradient(circle at 50% 50%, rgba(30,41,59,.6), rgba(3,7,17,.95))'
    : `radial-gradient(circle at 50% 50%, ${p.secondary}30, rgba(3,7,17,.92) 70%)`;
  const shadow = off
    ? 'inset 0 0 40px rgba(0,0,0,.8)'
    : `0 0 70px ${p.glow}, inset 0 0 40px ${p.secondary}66, inset 0 0 15px ${p.primary}55`;

  const cursor = off ? 'cursor-not-allowed' : 'cursor-pointer hover:brightness-110';

  host.innerHTML = `
    <div class="relative flex items-center justify-center" style="width:${size}px; height:${size}px">
      ${beams}

      <!-- angular backdrop -->
      <div class="absolute inset-0 ${!off?'animate-spin-slow':''}" style="animation-duration:40s">
        <svg viewBox="0 0 500 500" width="100%" height="100%">
          ${wedges}
          ${hexes}
        </svg>
      </div>

      <!-- outer ring with ticks -->
      <div class="absolute inset-0 ${!off?'animate-spin-reverse':''}" style="animation-duration:25s">
        <svg viewBox="0 0 500 500" width="100%" height="100%">
          <circle cx="${cx}" cy="${cy}" r="218" fill="none" stroke="${p.primary}" stroke-width="1" opacity="${off?0.2:0.5}"/>
          <circle cx="${cx}" cy="${cy}" r="232" fill="none" stroke="${p.primary}" stroke-width="0.6" opacity="${off?0.15:0.35}"/>
          ${outerTicks}
          ${brokenOuter}
        </svg>
      </div>

      <!-- inner ring -->
      <div class="absolute ${!off?'animate-spin-reverse':''}" style="inset:100px; animation-duration:${thinking?'3s':'12s'}">
        <svg viewBox="0 0 500 500" width="100%" height="100%">
          <circle cx="${cx}" cy="${cy}" r="130" fill="none" stroke="${p.primary}" stroke-width="1" opacity="${off?0.2:0.5}"/>
          <circle cx="${cx}" cy="${cy}" r="140" fill="none" stroke="${p.primary}" stroke-width="0.6" opacity="${off?0.15:0.35}"/>
          ${innerTicks}
          ${innerBroken}
        </svg>
      </div>

      ${pulseRings}

      <!-- CORE -->
      <button id="orbCore" class="relative rounded-full flex items-center justify-center transition-all ${cursor}"
        ${off?'disabled':''}
        style="width:${coreSize}px; height:${coreSize}px; background:${bg}; box-shadow:${shadow}">
        <svg viewBox="0 0 400 400" width="100%" height="100%">
          <defs>
            <radialGradient id="brainGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="${p.accent}" stop-opacity="${off?0.15:0.4}"/>
              <stop offset="60%" stop-color="${p.primary}" stop-opacity="${off?0.08:0.18}"/>
              <stop offset="100%" stop-color="${p.secondary}" stop-opacity="0"/>
            </radialGradient>
            <filter id="neonBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <circle cx="200" cy="200" r="140" fill="url(#brainGrad)"/>
          <path d="${BRAIN_OUTLINE}" fill="none" stroke="${p.primary}" stroke-width="1.5"
            opacity="${off?0.25:0.6}" ${off?'':'filter="url(#neonBlur)"'}/>
          <path d="${BRAIN_OUTLINE}" fill="${p.secondary}" opacity="${off?0.05:0.08}"/>
          ${synapses}
          ${neurons}
        </svg>
        <div class="absolute bottom-3 flex items-center justify-center">${chip}</div>
      </button>

      ${bars}
    </div>
  `;

  // Attach click
  const core = document.getElementById('orbCore');
  if (core) core.addEventListener('click', handleOrbClick);

  // Update label & color
  const labelEl = document.getElementById('stateLabel');
  labelEl.textContent = STATE_META[state].label;
  if (off) {
    labelEl.style.color = '#64748b';
    labelEl.style.textShadow = 'none';
  } else {
    labelEl.style.color = p.accent;
    labelEl.style.textShadow = `0 0 10px ${p.glow}`;
  }
}

// ---------- Mini orb (left panel) ----------
function buildMiniOrb() {
  const host = document.getElementById('miniOrb');
  const p = PALETTE[app.state];
  const color = p.primary;
  const satellites = [0, 72, 144, 216, 288].map((deg,i) => {
    const rad = deg * Math.PI / 180;
    const cx = 100 + 60 * Math.cos(rad);
    const cy = 100 + 60 * Math.sin(rad);
    return `<circle cx="${cx}" cy="${cy}" r="2" fill="${color}" style="filter:drop-shadow(0 0 3px ${color})">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin="${i*0.3}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');
  host.innerHTML = `
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <defs>
        <radialGradient id="miniGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.6"/>
          <stop offset="70%" stop-color="${color}" stop-opacity="0.05"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="70" fill="url(#miniGrad)"/>
      <circle cx="100" cy="100" r="55" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.5" stroke-dasharray="3 4"/>
      <circle cx="100" cy="100" r="70" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.3"/>
      ${satellites}
      <circle cx="100" cy="100" r="14" fill="${color}" opacity="0.35" style="filter:blur(6px)"/>
      <circle cx="100" cy="100" r="6" fill="#fff" opacity="0.9" style="filter:drop-shadow(0 0 6px ${color})">
        <animate attributeName="r" values="5;8;5" dur="1.4s" repeatCount="indefinite"/>
      </circle>
    </svg>
  `;
  const lbl = document.getElementById('miniOrbLabel');
  lbl.textContent = STATE_META[app.state].log;
  lbl.style.color = p.accent;
  lbl.style.textShadow = `0 0 8px ${p.glow}`;
}

// ---------- Wave visualizer ----------
function buildWave() {
  const host = document.getElementById('waveHost');
  const p = PALETTE[app.state];
  const off = app.state === 'offline';
  const active = ['listening','thinking','processing'].includes(app.state);
  const amp = active ? 22 : 6;
  const speed = app.state === 'processing' ? 1.4 : app.state === 'thinking' ? 2 : 3.5;
  const width = app.isMobile ? 320 : 700;
  const height = app.isMobile ? 40 : 60;

  const paths = [0,1,2].map(k => `
    <path fill="none" stroke="url(#waveFade)" stroke-width="${1.2 - k*0.2}" opacity="${0.9 - k*0.25}"
      style="filter:drop-shadow(0 0 4px ${p.glow})">
      <animate attributeName="d" dur="${speed + k*0.4}s" repeatCount="indefinite"
        values="M 0 40 Q 100 ${40-amp} 200 40 T 400 40 T 600 40 T 800 40;
                M 0 40 Q 100 ${40+amp} 200 40 T 400 40 T 600 40 T 800 40;
                M 0 40 Q 100 ${40-amp} 200 40 T 400 40 T 600 40 T 800 40"/>
    </path>`).join('');

  host.innerHTML = `
    <svg viewBox="0 0 800 80" width="${width}" height="${height}" class="overflow-visible max-w-full" style="opacity:${off?0.25:1}">
      <defs>
        <linearGradient id="waveFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"  stop-color="${p.primary}" stop-opacity="0"/>
          <stop offset="20%" stop-color="${p.primary}" stop-opacity="1"/>
          <stop offset="80%" stop-color="${p.primary}" stop-opacity="1"/>
          <stop offset="100%" stop-color="${p.primary}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${paths}
    </svg>
  `;
}

// ---------- Systems / performance / logs ----------
function refreshSystems() {
  const off = app.state === 'offline';
  const rows = [
    { name: 'Rede',      status: off ? 'DESATIVADA'  : 'NOMINAL',     color: off ? '#fbbf24' : '#34d399' },
    { name: 'IA Core',   status: off ? 'STANDBY'     : 'OPERACIONAL', color: off ? '#fbbf24' : '#34d399' },
    { name: 'Memória',   status: off ? 'INATIVA'     : 'ATIVO',       color: off ? '#fbbf24' : '#34d399' },
    { name: 'Segurança', status: off ? 'MONITORANDO' : 'NOMINAL',     color: off ? '#fbbf24' : '#34d399' },
  ];
  document.getElementById('systemsList').innerHTML = rows.map(r =>
    `<div class="flex justify-between font-tech text-[11px]">
      <span class="text-cyan-100/90">${r.name}</span>
      <span class="tracking-widest" style="color:${r.color}; text-shadow:0 0 6px ${r.color}">${r.status}</span>
    </div>`).join('');
}

function refreshPerf() {
  document.getElementById('cpuVal').textContent = Math.round(app.perf.cpu) + '%';
  document.getElementById('memVal').textContent = Math.round(app.perf.mem) + '%';
  document.getElementById('latVal').textContent = Math.round(app.perf.lat) + 'ms';
  document.getElementById('cpuBar').style.width = Math.min(100, app.perf.cpu) + '%';
  document.getElementById('memBar').style.width = Math.min(100, app.perf.mem) + '%';
  document.getElementById('latBar').style.width = Math.min(100, app.perf.lat / 5) + '%';
}

function pushLog(status) {
  const list = document.getElementById('logList');
  const colorMap = {
    PENSANDO:'#c4b5fd', OUVINDO:'#67e8f9', PROCESSANDO:'#fcd34d',
    AGUARDANDO:'#a5f3fc', OFFLINE:'#94a3b8'
  };
  const c = colorMap[status] || '#67e8f9';
  const item = document.createElement('div');
  item.className = 'font-tech text-[11px] flex items-center gap-2 animate-fade-in';
  item.innerHTML = `
    <span class="text-cyan-500/60">[${nowStr()}]</span>
    <span class="tracking-widest" style="color:${c}; text-shadow:0 0 6px ${c}88">${status}</span>`;
  list.prepend(item);
  // Cap 60 entries
  while (list.children.length > 60) list.removeChild(list.lastChild);
}

// ---------- Clock ----------
function updateClock() {
  const d = new Date();
  document.getElementById('clockTime').textContent = d.toTimeString().slice(0,8);
  document.getElementById('clockDate').textContent = d.toLocaleDateString('pt-BR', {
    weekday:'short', day:'2-digit', month:'short', year:'numeric'
  }).replace('.', '');
}

// ---------- State transitions ----------
function setState(next) {
  app.state = next;
  document.getElementById('onlineDot').className = `w-2 h-2 rounded-full ${next==='offline' ? 'bg-red-500 animate-flicker' : 'bg-emerald-400 animate-pulse'}`;
  document.getElementById('onlineDot').style.boxShadow = next==='offline'
    ? '0 0 10px rgba(239,68,68,.9)' : '0 0 10px rgba(52,211,153,.9)';
  const otxt = document.getElementById('onlineText');
  otxt.textContent = next==='offline' ? 'OFFLINE' : 'ONLINE';
  otxt.className = `hidden sm:inline ${next==='offline' ? 'text-red-400' : 'text-emerald-300'}`;

  pushLog(STATE_META[next].log);
  buildOrb();
  buildMiniOrb();
  buildWave();
  refreshSystems();

  // input state
  const input = document.getElementById('cmdInput');
  const submit = document.getElementById('cmdSubmit');
  input.disabled = next === 'offline';
  input.placeholder = next === 'offline' ? 'SISTEMA OFFLINE...' : 'Digite se preferir...';
  submit.disabled = next === 'offline' || !input.value.trim();
}

function runAgent(text) {
  if (!text.trim()) return;
  setState('thinking');
  clearTimeout(app.timer);
  app.timer = setTimeout(() => {
    setState('processing');
    setTimeout(() => {
      // reply (kept in log only; no chat panel here)
      setState('idle');
    }, 1200);
  }, 1600);
}

function handleOrbClick() {
  if (app.state === 'offline') return;
  if (app.state === 'listening') {
    setTimeout(() => runAgent('Comando de voz'), 200);
  } else if (app.state === 'idle') {
    setState('listening');
    setTimeout(() => { if (app.state === 'listening') setState('idle'); }, 4000);
  }
}

// ---------- Panels show/hide + mobile ----------
function applyPanelLayout() {
  const leftWrap  = document.getElementById('leftPanelWrap');
  const rightWrap = document.getElementById('rightPanelWrap');
  const restoreL  = document.getElementById('restoreLeft');
  const restoreR  = document.getElementById('restoreRight');
  const backdrop  = document.getElementById('mobileBackdrop');

  // Left
  if (app.showLeft) {
    leftWrap.classList.remove('is-hidden');
    restoreL.classList.add('is-hidden');
  } else {
    leftWrap.classList.add('is-hidden');
    restoreL.classList.remove('is-hidden');
  }
  // Right
  if (app.showRight) {
    rightWrap.classList.remove('is-hidden');
    restoreR.classList.add('is-hidden');
  } else {
    rightWrap.classList.add('is-hidden');
    restoreR.classList.remove('is-hidden');
  }

  // Mobile drawer style
  if (app.isMobile) {
    leftWrap.classList.add('mobile-drawer');
    rightWrap.classList.add('mobile-drawer');
    const anyOpen = app.showLeft || app.showRight;
    backdrop.classList.toggle('hidden', !anyOpen);
  } else {
    leftWrap.classList.remove('mobile-drawer');
    rightWrap.classList.remove('mobile-drawer');
    backdrop.classList.add('hidden');
  }
}

function handleResize() {
  const wasMobile = app.isMobile;
  app.isMobile = window.innerWidth < 900;
  if (wasMobile !== app.isMobile) {
    app.showLeft = !app.isMobile;
    app.showRight = !app.isMobile;
    buildOrb();
    buildWave();
  }
  applyPanelLayout();
}

// ---------- Loops ----------
function startLoops() {
  // clock
  updateClock();
  setInterval(updateClock, 1000);

  // performance metrics
  setInterval(() => {
    if (app.state === 'offline') {
      app.perf = { cpu: 0, mem: 0, lat: 0 };
    } else {
      const s = app.state;
      app.perf = {
        cpu: clamp(app.perf.cpu + (s==='thinking' ? rand(0,6) : rand(-4,4)), 20, 97),
        mem: clamp(app.perf.mem + rand(-2,2), 50, 94),
        lat: clamp(app.perf.lat + rand(-20,20), 80, 480),
      };
    }
    refreshPerf();
  }, 1400);
}

// ---------- Event wiring ----------
function wireEvents() {
  document.getElementById('onlineToggle').addEventListener('click', () => {
    setState(app.state === 'offline' ? 'idle' : 'offline');
  });

  document.getElementById('audioToggle').addEventListener('click', () => {
    app.audio = !app.audio;
    refreshIconButtons();
  });
  document.getElementById('micToggle').addEventListener('click', () => {
    app.mic = !app.mic;
    refreshIconButtons();
  });

  document.getElementById('hideLeft').addEventListener('click', () => {
    app.showLeft = false; applyPanelLayout();
  });
  document.getElementById('hideRight').addEventListener('click', () => {
    app.showRight = false; applyPanelLayout();
  });
  document.getElementById('restoreLeft').addEventListener('click', () => {
    app.showLeft = true; applyPanelLayout();
  });
  document.getElementById('restoreRight').addEventListener('click', () => {
    app.showRight = true; applyPanelLayout();
  });
  document.getElementById('leftMobileClose').addEventListener('click', () => {
    app.showLeft = false; applyPanelLayout();
  });
  document.getElementById('rightMobileClose').addEventListener('click', () => {
    app.showRight = false; applyPanelLayout();
  });
  document.getElementById('mobileBackdrop').addEventListener('click', () => {
    app.showLeft = false; app.showRight = false; applyPanelLayout();
  });

  // Form
  const form = document.getElementById('cmdForm');
  const input = document.getElementById('cmdInput');
  const submit = document.getElementById('cmdSubmit');
  input.addEventListener('input', () => {
    submit.disabled = app.state === 'offline' || !input.value.trim();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (app.state === 'offline') return;
    const text = input.value;
    input.value = '';
    submit.disabled = true;
    runAgent(text);
  });

  window.addEventListener('resize', handleResize);
}

// ---------- Init ----------
function init() {
  buildStarfield();
  refreshIconButtons();
  refreshSystems();
  refreshPerf();
  buildOrb();
  buildMiniOrb();
  buildWave();
  pushLog('AGUARDANDO');
  applyPanelLayout();
  wireEvents();
  startLoops();
}

document.addEventListener('DOMContentLoaded', init);
