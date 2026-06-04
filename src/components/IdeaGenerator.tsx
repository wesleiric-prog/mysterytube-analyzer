import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Lightbulb, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw, 
  BookOpen, 
  Image, 
  Film,
  Flame,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Channel, VideoIdea } from '../types';

interface IdeaGeneratorProps {
  channel: Channel;
  onWriteScript: (title: string, concept: string) => void;
}

export default function IdeaGenerator({ channel, onWriteScript }: IdeaGeneratorProps) {
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchIdeas = async () => {
    try {
      const res = await fetch(`/api/channels/${channel.id}/ideas`);
      if (res.ok) {
        const data = await res.ok ? await res.json() : [];
        setIdeas(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [channel.id]);

  const generateIdeas = async () => {
    setIsLoading(true);
    setError(null);
    
    // Cycle beautiful, suspenseful loading texts to make the UX extremely premium!
    const loadingTexts = [
      'Analisando os maiores segredos históricos...',
      'Desbloqueando arquivos criptografados...',
      'Rastreando anomalias de engajamento no YouTube...',
      'Misturando suspense psicológico com dados...',
      'Formatando propostas dramáticas e conceitos...'
    ];
    let textIdx = 0;
    setLoadingMsg(loadingTexts[0]);
    const textInterval = setInterval(() => {
      textIdx = (textIdx + 1) % loadingTexts.length;
      setLoadingMsg(loadingTexts[textIdx]);
    }, 2500);

    try {
      const res = await fetch(`/api/channels/${channel.id}/ideas`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Falha catastrófica ao tentar invocar a inteligência criativa.');
      }
      
      await fetchIdeas();
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      clearInterval(textInterval);
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteIdea = async (id: number) => {
    if (!confirm('Deseja excluir esta ideia definitivamente?')) return;
    try {
      const res = await fetch(`/api/ideas/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setIdeas(prev => prev.filter(idea => idea.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Tab Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-zinc-900/40 border border-white/5 rounded-2xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-650 to-transparent opacity-30"></div>
        <div className="flex gap-4 items-center relative z-10">
          <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-500 rounded-xl">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">Incubadora de Ideias Criativas</h3>
            <p className="text-xs text-gray-400 mt-1">Crie tópicos que induzem à hipnose e cliques com base no que já funciona no canal.</p>
          </div>
        </div>

        <button
          id="btn-generate-ideas"
          onClick={generateIdeas}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 text-xs font-semibold font-display shadow-lg shadow-red-600/10 disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Sincronizando Mentes...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Gerar 3 Ideias Virais</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-300">
          <strong>Falha ao gerar ideias:</strong> {error}
        </div>
      )}

      {/* Loading Block overlay */}
      {isLoading && (
        <div className="p-10 rounded-2xl border border-dashed border-white/5 bg-zinc-900/20 backdrop-blur-sm flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-4 border-red-500/10 border-t-red-500 animate-spin"></div>
            <Sparkles className="w-6 h-6 text-red-500 absolute inset-0 m-auto animate-pulse" />
          </div>
          <p className="text-sm font-semibold font-display text-white mt-4">{loadingMsg}</p>
          <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">Isso pode levar de 10 a 20 segundos enquanto o Gemini idealiza as teorias.</p>
        </div>
      )}

      {/* Ideas list */}
      {!isLoading && (
        <div className="grid gap-6">
          {ideas.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-white/5 bg-zinc-900/10 text-center">
              <Lightbulb className="w-10 h-10 text-gray-600 mx-auto" />
              <h4 className="text-sm font-semibold text-white mt-3">Nenhuma ideia gerada para este canal</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Clique no botão "Gerar 3 Ideias Virais" acima. O Gemini analisará o nicho e os maiores sucessos históricos para criar conceitos exclusivos.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-5">
              {ideas.map((ide) => (
                <motion.div
                  key={ide.id}
                  id={`idea-card-${ide.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border border-white/5 bg-zinc-900/40 shadow-lg backdrop-blur-sm p-6 flex flex-col justify-between hover:border-red-600/30 group relative transition-all"
                >
                  {/* Floating delete button */}
                  <button
                    id={`btn-delete-idea-${ide.id}`}
                    onClick={() => ide.id && handleDeleteIdea(ide.id)}
                    className="absolute top-4 right-4 p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Excluir ideia"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-4">
                    {/* Visual header */}
                    <div className="flex gap-2 items-center">
                      <span className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                        <Flame className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-red-500 font-bold">Ideia Recomendada</span>
                    </div>

                    {/* Title */}
                    <div>
                      <h4 className="text-sm font-bold text-white font-display leading-snug line-clamp-2">{ide.title}</h4>
                      <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-2 italic">
                        "{ide.concept}"
                      </p>
                    </div>

                    {/* Outline detail */}
                    <div className="pt-3 border-t border-white/5 space-y-1.5">
                      <span className="text-[10px] uppercase font-mono font-bold text-gray-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Estrutura do Enredo
                      </span>
                      <p className="text-[11px] text-gray-300 leading-relaxed font-normal whitespace-pre-wrap">
                        {ide.script_outline}
                      </p>
                    </div>

                    {/* Midjourney cue */}
                    <div className="pt-3 border-t border-white/5 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-mono font-bold text-gray-400 flex items-center gap-1.5">
                          <Image className="w-3.5 h-3.5" />
                          Prompt de Thumbnail
                        </span>
                        <button
                          id={`btn-copy-prompt-${ide.id}`}
                          onClick={() => handleCopy(ide.cinematic_prompt, `p-${ide.id}`)}
                          className="text-[9px] font-mono flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          {copiedId === `p-${ide.id}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed font-mono bg-black/40 p-2 rounded max-h-20 overflow-y-auto border border-white/5">
                        {ide.cinematic_prompt}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <button
                      id={`btn-write-script-from-idea-${ide.id}`}
                      onClick={() => onWriteScript(ide.title, ide.concept)}
                      className="w-full py-2 px-3 rounded-lg bg-[#310c0c] hover:bg-red-950 border border-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold font-display flex items-center justify-center gap-2 transition-colors"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Desenvolver Roteiro 15m</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
