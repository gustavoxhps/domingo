import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { X, Save, Volume2, Mic, Cpu, Search, Star, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const genderIcon = (g) => (g === 'female' ? '👩' : g === 'neutral' ? '😐' : '👨');

const TABS = [
  { id: 'tts',   label: 'PROVEDOR DE VOZ',   Icon: Volume2 },
  { id: 'voice', label: 'VOZ',                Icon: Mic },
  { id: 'llm',   label: 'PROVEDOR DE LLM',    Icon: Cpu },
];

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label className="block">
      <span className="font-tech text-[10px] tracking-widest text-cyan-400/80 uppercase">{label}</span>
      <input
        type={type}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-[#050c1a] border border-cyan-500/30 rounded-lg px-3 py-2 font-tech text-sm text-cyan-100 outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.15)] transition-all placeholder-cyan-500/40"
      />
    </label>
  );
}

function ProviderRadio({ providers, value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {providers.map((p) => {
        const active = p.id === value;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`px-3 py-2 rounded-lg border font-orbitron text-[11px] tracking-widest transition-all
              ${active
                ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.4),inset_0_0_8px_rgba(34,211,238,0.15)]'
                : 'border-cyan-500/30 text-cyan-400/80 hover:border-cyan-400/70 hover:text-cyan-200 hover:bg-cyan-400/5'}`}
          >
            {p.name.toUpperCase()}
            {p.default && <span className="ml-1 text-[8px] text-emerald-400">•DEFAULT</span>}
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsModal({ open, onClose }) {
  const [tab, setTab] = useState('tts');
  const [providers, setProviders] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState('');
  const [voiceSearch, setVoiceSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [provRes, settRes] = await Promise.all([
          axios.get(`${API}/settings/providers`),
          axios.get(`${API}/settings`),
        ]);
        if (cancelled) return;
        setProviders(provRes.data);
        setSettings(settRes.data);
      } catch (e) {
        setError('Falha ao carregar configurações do servidor.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const updateTTSConfig = (providerId, field, value) => {
    setSettings((s) => ({
      ...s,
      tts_config: {
        ...(s.tts_config || {}),
        [providerId]: { ...((s.tts_config || {})[providerId] || {}), [field]: value },
      },
    }));
  };
  const updateLLMConfig = (providerId, field, value) => {
    setSettings((s) => ({
      ...s,
      llm_config: {
        ...(s.llm_config || {}),
        [providerId]: { ...((s.llm_config || {})[providerId] || {}), [field]: value },
      },
    }));
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    try {
      await axios.post(`${API}/settings`, settings);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1600);
    } catch (e) {
      setError('Falha ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const currentTTS = providers?.tts_providers?.find((p) => p.id === settings?.tts_provider);
  const currentLLM = providers?.llm_providers?.find((p) => p.id === settings?.llm_provider);
  const voicesForProvider = useMemo(
    () => (providers && settings ? (providers.voices[settings.tts_provider] || []) : []),
    [providers, settings]
  );
  const filteredVoices = useMemo(() => {
    if (!voiceSearch.trim()) return voicesForProvider;
    const q = voiceSearch.toLowerCase();
    return voicesForProvider.filter((v) =>
      v.name.toLowerCase().includes(q) ||
      (v.accent || '').toLowerCase().includes(q) ||
      (v.gender || '').toLowerCase().includes(q) ||
      (v.id || '').toLowerCase().includes(q)
    );
  }, [voicesForProvider, voiceSearch]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal container */}
      <div
        className="relative w-full max-w-[900px] max-h-[92vh] flex flex-col rounded-2xl border border-cyan-400/40 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(6,20,40,0.98), rgba(3,10,20,0.98))',
          boxShadow: '0 30px 80px -20px rgba(34,211,238,0.35), 0 0 60px -20px rgba(34,211,238,0.4), inset 0 0 30px rgba(34,211,238,0.05)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-cyan-500/25">
          <div>
            <div className="font-orbitron text-lg sm:text-xl tracking-[0.3em] text-cyan-300 glow-cyan">CONFIGURAÇÕES</div>
            <div className="font-tech text-[10px] tracking-widest text-cyan-500/70 mt-0.5">// SISTEMA / PREFERÊNCIAS</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/10 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {loading || !settings || !providers ? (
          <div className="flex-1 flex items-center justify-center py-16 text-cyan-300">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            <span className="font-tech tracking-widest text-xs">Carregando configurações...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col sm:flex-row min-h-0">
            {/* Tabs */}
            <nav className="sm:w-56 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-cyan-500/20 px-3 py-3 sm:py-5 sm:pr-2 flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible">
              {TABS.map(({ id, label, Icon }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg font-orbitron text-[11px] tracking-widest transition-all text-left flex-shrink-0
                      ${active
                        ? 'bg-cyan-400/15 text-cyan-100 border border-cyan-300/70 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                        : 'text-cyan-400/80 border border-transparent hover:text-cyan-200 hover:bg-cyan-400/5'}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-5">
              {/* --- TTS TAB --- */}
              {tab === 'tts' && (
                <>
                  <div>
                    <div className="font-tech text-[10px] text-cyan-500/80 tracking-widest mb-2 uppercase">// PROVEDOR ATIVO</div>
                    <ProviderRadio
                      providers={providers.tts_providers}
                      value={settings.tts_provider}
                      onChange={(id) => setSettings((s) => ({ ...s, tts_provider: id }))}
                    />
                  </div>
                  <div className="space-y-4">
                    {providers.tts_providers.map((p) => {
                      const active = p.id === settings.tts_provider;
                      const cfg = (settings.tts_config || {})[p.id] || {};
                      return (
                        <div
                          key={p.id}
                          className={`rounded-xl border p-4 transition-all ${active ? 'border-cyan-400/60 bg-cyan-400/[0.03]' : 'border-cyan-500/15 opacity-70'}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-orbitron text-sm tracking-widest text-cyan-200">{p.name}</div>
                            {active && <span className="font-tech text-[10px] text-emerald-300 tracking-widest">• ATIVO</span>}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Endpoint" placeholder="https://api..." value={cfg.endpoint}
                              onChange={(v) => updateTTSConfig(p.id, 'endpoint', v)} />
                            <Field label="API Key" placeholder="sk-..." type="password" value={cfg.apikey}
                              onChange={(v) => updateTTSConfig(p.id, 'apikey', v)} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* --- VOICE TAB --- */}
              {tab === 'voice' && (
                <>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="font-tech text-[10px] text-cyan-500/80 tracking-widest uppercase">// VOZES DISPONÍVEIS</div>
                      <div className="font-orbitron text-sm text-cyan-200 tracking-widest mt-0.5">
                        {currentTTS?.name || settings.tts_provider}
                      </div>
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-500/70" />
                      <input
                        value={voiceSearch}
                        onChange={(e) => setVoiceSearch(e.target.value)}
                        placeholder="Buscar voz..."
                        className="pl-8 pr-3 py-1.5 bg-[#050c1a] border border-cyan-500/30 rounded-lg font-tech text-xs text-cyan-100 outline-none focus:border-cyan-400 placeholder-cyan-500/50"
                      />
                    </div>
                  </div>

                  {filteredVoices.length === 0 ? (
                    <div className="text-center py-8 font-tech text-xs text-cyan-500/70">Nenhuma voz encontrada.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredVoices.map((v, i) => {
                        const selected = settings.voice === v.id;
                        return (
                          <button
                            key={`${v.id}-${i}`}
                            type="button"
                            onClick={() => setSettings((s) => ({ ...s, voice: v.id }))}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left
                              ${selected
                                ? 'border-cyan-300 bg-cyan-400/15 shadow-[0_0_10px_rgba(34,211,238,0.35)]'
                                : 'border-cyan-500/20 hover:border-cyan-400/60 hover:bg-cyan-400/5'}`}
                          >
                            <span className="text-lg leading-none">{genderIcon(v.gender)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-orbitron text-[12px] tracking-widest text-cyan-100 flex items-center gap-1.5 truncate">
                                {v.favorite && <Star className="w-3 h-3 fill-amber-300 text-amber-300 flex-shrink-0" />}
                                {v.name}
                              </div>
                              <div className="font-tech text-[10px] text-cyan-500/70 tracking-wider truncate">
                                {v.accent || '—'}{v.id && v.id !== v.name ? ` · ${v.id.slice(0, 14)}${v.id.length > 14 ? '…' : ''}` : ''}
                              </div>
                            </div>
                            {selected && <span className="font-tech text-[9px] text-emerald-300 tracking-widest flex-shrink-0">SELECIONADA</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* --- LLM TAB --- */}
              {tab === 'llm' && (
                <>
                  <div>
                    <div className="font-tech text-[10px] text-cyan-500/80 tracking-widest mb-2 uppercase">// PROVEDOR ATIVO</div>
                    <ProviderRadio
                      providers={providers.llm_providers}
                      value={settings.llm_provider}
                      onChange={(id) => setSettings((s) => ({ ...s, llm_provider: id }))}
                    />
                  </div>
                  <div className="space-y-4">
                    {providers.llm_providers.map((p) => {
                      const active = p.id === settings.llm_provider;
                      const cfg = (settings.llm_config || {})[p.id] || {};
                      return (
                        <div
                          key={p.id}
                          className={`rounded-xl border p-4 transition-all ${active ? 'border-cyan-400/60 bg-cyan-400/[0.03]' : 'border-cyan-500/15 opacity-70'}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-orbitron text-sm tracking-widest text-cyan-200">{p.name}</div>
                            {active && <span className="font-tech text-[10px] text-emerald-300 tracking-widest">• ATIVO</span>}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Field label="Modelo" placeholder="gpt-4o-mini, llama3..." value={cfg.model}
                              onChange={(v) => updateLLMConfig(p.id, 'model', v)} />
                            <Field label="Endpoint" placeholder="https://api..." value={cfg.endpoint}
                              onChange={(v) => updateLLMConfig(p.id, 'endpoint', v)} />
                            <Field label="API Key" placeholder="sk-..." type="password" value={cfg.apikey}
                              onChange={(v) => updateLLMConfig(p.id, 'apikey', v)} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-3 border-t border-cyan-500/25 bg-[#040a16]/70">
          <div className="font-tech text-[10px] tracking-widest">
            {error ? (
              <span className="text-red-400">{error}</span>
            ) : savedFlash ? (
              <span className="text-emerald-300 animate-pulse">✓ CONFIGURAÇÕES SALVAS</span>
            ) : (
              <span className="text-cyan-500/60">ESC para fechar</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-cyan-500/30 font-orbitron text-[11px] tracking-widest text-cyan-300 hover:bg-cyan-400/5 transition-colors"
            >
              CANCELAR
            </button>
            <button
              onClick={save}
              disabled={saving || loading}
              className="px-4 py-1.5 rounded-lg border border-cyan-300 font-orbitron text-[11px] tracking-widest text-cyan-100 bg-cyan-400/15 hover:bg-cyan-400/25 transition-colors disabled:opacity-50 flex items-center gap-2"
              style={{ boxShadow: '0 0 12px rgba(34,211,238,0.4), inset 0 0 8px rgba(34,211,238,0.15)' }}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              SALVAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
