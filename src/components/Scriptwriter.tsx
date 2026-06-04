import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Flame, 
  Image, 
  Copy, 
  Check, 
  Trash2, 
  Compass, 
  BookOpen, 
  Clapperboard, 
  ArrowRight,
  Clock,
  LayoutTemplate
} from 'lucide-react';
import { ScriptItem } from '../types';

interface ScriptwriterProps {
  initialTitle?: string;
  initialConcept?: string;
}

export default function Scriptwriter({ initialTitle = '', initialConcept = '' }: ScriptwriterProps) {
  const [title, setTitle] = useState(initialTitle);
  const [concept, setConcept] = useState(initialConcept);
  const [duration, setDuration] = useState('~15 minutos (~1800 palavras)');

  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [activeScript, setActiveScript] = useState<ScriptItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync inputs if ideas passed in
  useEffect(() => {
    setTitle(initialTitle);
    setConcept(initialConcept);
  }, [initialTitle, initialConcept]);

  const loadScripts = async () => {
    try {
      const res = await fetch('/api/scripts');
      if (res.ok) {
        const data = await res.json();
        setScripts(data);
        if (data.length > 0 && !activeScript) {
          setActiveScript(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadScripts();
  }, []);

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    setError(null);

    const loadingTexts = [
      'Estruturando curva de suspense psicológico...',
      'Idealizando ganchos virais de entrada (relação dos initial 5 segundos)...',
      'Desenhando prompts artísticos para Midjourney/Leonardo...',
      'Redigindo a introdução sombria e imersiva...',
      'Compilando revelações dramáticas e clímax dos 10 minutos...',
      'Adicionando call to action persuasivo...',
      'Higienizando texto final com o Gemini...'
    ];
    let idx = 0;
    setLoadingMsg(loadingTexts[0]);
    const timer = setInterval(() => {
      idx = (idx + 1) % loadingTexts.length;
      setLoadingMsg(loadingTexts[idx]);
    }, 3000);

    try {
      const response = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, concept }),
      });

      if (!response.ok) {
        throw new Error('Falha ao redigir o roteiro de mistério.');
      }

      const newScript = await response.json();
      await loadScripts();
      setActiveScript(newScript);
      
      // Clean inputs
      setTitle('');
      setConcept('');
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      clearInterval(timer);
      setIsLoading(false);
    }
  };

  const handleDeleteScript = async (id: number) => {
    if (!confirm('Excluir este roteiro definitivamente?')) return;
    try {
      const res = await fetch(`/api/scripts/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setScripts(prev => prev.filter(s => s.id !== id));
        if (activeScript?.id === id) {
          const remaining = scripts.filter(s => s.id !== id);
          setActiveScript(remaining.length > 0 ? remaining[0] : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Convert saved JSON prompts lists safely
  const parseJsonList = (jsonStr: string): string[] => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 min-h-[calc(100vh-120px)] select-none">
      {/* Sidebar history & Generator Input panel */}
      <div className="lg:col-span-4 space-y-6">
        {/* Creator panel */}
        <div className="p-5 bg-zinc-900/40 border border-white/5 shadow-lg backdrop-blur-sm rounded-2xl space-y-4">
          <div className="flex gap-3 items-center">
            <span className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
              <FileText className="w-5 h-5" />
            </span>
            <h3 className="text-sm font-semibold font-mono uppercase tracking-widest text-white">Criador de Roteiros</h3>
          </div>
          <p className="text-xs text-gray-400">Escreva um roteiro cinematicamente narrado de 15 minutos, completo com ganchos, prompts e suspense psicológico.</p>

          <form onSubmit={handleGenerateScript} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">Título do Episódio</label>
              <input
                id="input-script-title"
                type="text"
                placeholder="Ex: O Enigma da Floresta Sombria"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-zinc-900/30 border border-white/5 rounded-lg py-2.5 px-3 text-xs text-white placeholder-gray-500 focus:outline-[#1f2833]/40 text-[13px] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">Premissa / Conceito Macro</label>
              <textarea
                id="input-script-concept"
                placeholder="Ex ou notas: Uma expedição russa entra numa caverna nos anos 70 e some. Somente um deles volta carregando uma fita analógica secreta..."
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                rows={4}
                className="w-full bg-zinc-900/30 border border-white/5 rounded-lg py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-[#1f2833]/40 text-[13px] transition-colors resize-none leading-relaxed"
              />
            </div>

            <button
              id="btn-draft-script"
              type="submit"
              disabled={isLoading || !title.trim()}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 text-xs font-semibold font-display shadow-lg shadow-red-600/10 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sincronizando Roteiro...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Roteiro Sombrio</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Saved archive list */}
        <div className="p-5 bg-zinc-900/40 border border-white/5 shadow-lg backdrop-blur-sm rounded-2xl flex flex-col max-h-[350px] lg:max-h-[500px]">
          <h4 className="text-[9px] uppercase font-mono font-bold tracking-[0.2em] text-gray-500 mb-3 border-b border-white/5 pb-2.5">Histórico de Roteiros</h4>
          
          {scripts.length === 0 ? (
            <div className="py-8 text-center bg-zinc-900/10 rounded-xl border border-dashed border-white/5 p-4">
              <Compass className="w-6 h-6 text-gray-650 mx-auto stroke-[1.5]" />
              <p className="text-[11px] text-gray-500 mt-2 font-medium">Nenhum roteiro no arquivo</p>
            </div>
          ) : (
            <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
              {scripts.map((sc) => {
                const isActive = activeScript?.id === sc.id;
                return (
                  <div
                    key={sc.id}
                    id={`script-history-item-${sc.id}`}
                    onClick={() => setActiveScript(sc)}
                    className={`group relative p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isActive 
                        ? 'bg-red-500/5 border-red-500/35 text-white'
                        : 'border-transparent hover:bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 pr-6">
                      <p className="text-xs font-semibold truncate text-white">{sc.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-gray-500">
                        <span>{sc.target_duration || '15m'}</span>
                        <span>•</span>
                        <span>{new Date(sc.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    <button
                      id={`btn-delete-script-${sc.id}`}
                      onClick={(e) => { e.stopPropagation(); sc.id && handleDeleteScript(sc.id); }}
                      className="absolute right-2 p-1 rounded text-gray-500 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      title="Apagar do arquivo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Roteiro details Display panels */}
      <div className="lg:col-span-8">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-300 mb-6">
            <strong>Falha ao gerar roteiro:</strong> {error}
          </div>
        )}

        {/* Loading display */}
        {isLoading && (
          <div className="p-12 rounded-2xl border border-dashed border-white/5 bg-zinc-900/20 backdrop-blur-sm flex flex-col items-center justify-center text-center h-[500px]">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-red-500/10 border-t-red-500 animate-spin"></div>
              <FileText className="w-6 h-6 text-red-500 absolute inset-0 m-auto animate-pulse" />
            </div>
            <h4 className="text-base font-bold font-display text-white mt-5">Inteligência Roteirista Ativada</h4>
            <p className="text-sm font-semibold text-red-400 mt-2 font-mono h-6 animate-pulse">{loadingMsg}</p>
            <p className="text-xs text-gray-500 max-w-sm mt-3 leading-relaxed">
              O Gemini está redigindo histórias com suspense progressivo, ganchos fortes de visualizações e prompts de thumbnails dramáticas. Aguarde.
            </p>
          </div>
        )}

        {/* Selected Script output details */}
        {!isLoading && activeScript && (
          <motion.div
            id="active-script-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Header info */}
            <div className="p-5 bg-zinc-900/40 border border-white/5 shadow-sm backdrop-blur-sm rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between justify-start gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#c54242] uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  Roteiro de Suspense de Alta Retenção
                </span>
                <h2 className="text-lg font-bold text-white font-display mt-1 leading-tight">{activeScript.title}</h2>
              </div>

              <button
                id="btn-copy-full-script"
                onClick={() => handleCopyText(`${activeScript.viral_hooks}\n\n${activeScript.full_script}`, 'full')}
                className="py-2.5 px-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors shrink-0"
              >
                {copiedId === 'full' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Roteiro Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Roteiro Completo</span>
                  </>
                )}
              </button>
            </div>

            {/* Structured view in subsections */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column: Viral Initial Hooks */}
              <div className="p-5 bg-zinc-900/40 border border-white/5 shadow-lg backdrop-blur-sm rounded-2xl space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold flex items-center gap-2">
                  <Flame className="w-4 h-4 animate-pulse" />
                  Ganchos Iniciais (Psicologia de Cliques)
                </span>
                <div className="space-y-2.5">
                  {parseJsonList(activeScript.viral_hooks).map((hook, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-red-500/15 bg-red-950/5 flex gap-3 text-xs leading-relaxed text-gray-300">
                      <span className="font-mono font-bold text-red-500">0{idx + 1}</span>
                      <span>{hook}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Midjourney Prompt sheets */}
              <div className="p-5 bg-zinc-900/40 border border-white/5 shadow-lg backdrop-blur-sm rounded-2xl space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-bold flex items-center gap-2">
                  <Image className="w-4 h-4 text-indigo-400" />
                  Prompts Cinematográficos (Thumbnails/Imagens)
                </span>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {parseJsonList(activeScript.cinematic_prompts).map((prom, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-black/35 border border-white/5 relative group">
                      <div className="flex justify-between items-center pb-1">
                        <span className="text-[9px] font-mono text-indigo-400 font-semibold uppercase">Estágio {idx + 1}</span>
                        <button
                          id={`btn-copy-visual-prompt-${idx}`}
                          onClick={() => handleCopyText(prom, `v-${idx}`)}
                          className="text-[9px] font-mono flex items-center gap-1 text-gray-400 hover:text-white"
                        >
                          {copiedId === `v-${idx}` ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono leading-relaxed line-clamp-2">{prom}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* The Script text narration block */}
            <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-2xl">
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2 pb-3.5 border-b border-white/5">
                <BookOpen className="w-4.5 h-4.5 text-emerald-400" />
                Roteiro Narrativo e Instruções Visuais
              </span>

              {/* Format dialog script beautifully directly from string contents */}
              <div className="mt-5 space-y-5 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap max-h-[700px] overflow-y-auto pr-1">
                {activeScript.full_script.split('\n').map((line, lid) => {
                  if (line.startsWith('###')) {
                    return <h3 key={lid} className="text-base font-bold text-white font-display pt-3 text-gradient flex items-center gap-2">{line.replace('###', '')}</h3>;
                  }
                  if (line.startsWith('[INSTRUÇÃO VISUAL:')) {
                    return (
                      <div key={lid} className="my-2 p-3 rounded-lg border border-rose-500/10 bg-rose-950/5 text-xs text-rose-300 font-mono flex gap-2">
                        <Clapperboard className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{line}</span>
                      </div>
                    );
                  }
                  if (line.startsWith('(NARRADOR')) {
                    return (
                      <div key={lid} className="my-2 p-3 bg-white/5 rounded-lg border border-white/5 pl-4 border-l-2 border-l-emerald-500 font-sans">
                        <span className="block text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider mb-1">Diálogo Narrado</span>
                        <span>{line}</span>
                      </div>
                    );
                  }
                  return <p key={lid} className="mb-2 text-gray-300">{line}</p>;
                })}
              </div>
            </div>
          </motion.div>
        )}

        {!isLoading && !activeScript && (
          <div className="flex flex-col items-center justify-center text-center p-10 h-[400px] rounded-2xl border border-dashed border-white/5 bg-zinc-900/10">
            <LayoutTemplate className="w-12 h-12 text-gray-600 mb-4" />
            <h4 className="text-sm font-semibold text-white">Pronto para escrever seu primeiro roteiro?</h4>
            <p className="text-xs text-gray-400 max-w-sm mt-1.5 leading-relaxed">
              Insira um Título e notas de Conceito no formulário à esquerda, ou selecione qualquer uma das ideias recomendadas geradas na aba de ideias de um canal!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
