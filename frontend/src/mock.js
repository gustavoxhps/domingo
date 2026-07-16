// Mock data for Domingo AI interface
export const quickCommands = [
  'STATUS REPORT',
  "WHAT'S THE WEATHER?",
  'SCHEDULE A MEETING TOMORROW AT 3PM',
  'SUMMARIZE THIS IMAGE',
  'REMEMBER MY NAME IS TONY',
];

export const capabilities = [
  { id: 'voice', label: 'VOICE', icon: 'Mic' },
  { id: 'files', label: 'FILES', icon: 'FolderOpen' },
  { id: 'camera', label: 'CAMERA', icon: 'Camera' },
  { id: 'screen', label: 'SCREEN', icon: 'Monitor' },
  { id: 'web', label: 'WEB', icon: 'Globe' },
  { id: 'email', label: 'EMAIL', icon: 'Mail' },
  { id: 'calendar', label: 'CALENDAR', icon: 'Calendar' },
  { id: 'memory', label: 'MEMORY', icon: 'BrainCircuit' },
];

export const initialMetrics = [
  { id: 'pwr', label: 'PWR', value: 91, unit: '%', color: 'cyan', status: 'NOMINAL' },
  { id: 'cpu', label: 'CPU', value: 43, unit: '%', color: 'cyan', status: 'NOMINAL' },
  { id: 'mem', label: 'MEM', value: 4.0, unit: 'G', color: 'cyan', status: 'NOMINAL', max: 16 },
  { id: 'lat', label: 'LAT', value: 238, unit: 'ms', color: 'amber', status: 'NOMINAL', max: 500 },
  { id: 'net', label: 'NET', value: 98, unit: '%', color: 'emerald', status: 'NOMINAL' },
  { id: 'freq', label: 'FREQ', value: 3.87, unit: 'ghz', color: 'cyan', status: 'NOMINAL', max: 5 },
];

export const diagnostics = {
  model: 'domingo-3.1-pro',
  session: '7b3187df-0...',
  turns: 0,
  web: 'OFFLINE',
};

export const agentReplies = [
  'Sistemas online. Aguardando comandos, Senhor.',
  'Processando sua solicitação. Análise concluída.',
  'Todos os subsistemas operando dentro dos parâmetros normais.',
  'Comando recebido. Executando rotina.',
  'Compreendido. Iniciando protocolo apropriado.',
  'Dados armazenados na memória de longo prazo.',
  'Análise contextual concluída. Recomendo prosseguir.',
];

export const bootLines = [
  '> INICIALIZANDO NÚCLEO DOMINGO v3.1...',
  '> CARREGANDO MÓDULOS COGNITIVOS...',
  '> CONECTANDO À REDE NEURAL...',
  '> CALIBRANDO SENSORES DE ÁUDIO...',
  '> PROTOCOLOS DE SEGURANÇA ATIVOS.',
  '> SISTEMA ONLINE. BEM-VINDO.',
];
