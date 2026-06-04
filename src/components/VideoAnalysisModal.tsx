import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Activity, 
  Compass, 
  HelpCircle, 
  ThumbsUp, 
  TrendingUp, 
  AlertCircle,
  Clapperboard,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Video, VideoAnalysis } from '../types';

interface VideoAnalysisModalProps {
  video: Video | null;
  onClose: () => void;
}

export default function VideoAnalysisModal({ video, onClose }: VideoAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!video) {
      setAnalysis(null);
      setError(null);
      return;
    }

    const loadAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/videos/${video.id}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Falha ao gerar inteligência do vídeo de mistério.');
        }

        const data = await response.json();
        setAnalysis(data);
      } catch (err: any) {
        setError(err.message || 'Erro inesperado.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysis();
  }, [video]);

  return (
    <AnimatePresence>
      {video && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#0a0a0c] border-l border-red-900/20 shadow-2xl z-50 overflow-y-auto p-6 flex flex-col"
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-red-900/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-semibold font-mono uppercase tracking-widest text-white">Análise de IA Especializada</h3>
              </div>
              <button
                id="btn-close-analysis"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Mini Banner */}
            <div className="mt-5 flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
              <img
                src={video.thumbnail_url}
                alt={video.title}
                referrerPolicy="no-referrer"
                className="w-28 aspect-video object-cover rounded-lg border border-white/10 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-medium text-red-500 uppercase">Vídeo Selecionado</span>
                <h4 className="text-xs font-semibold text-white line-clamp-2 mt-1 leading-relaxed">{video.title}</h4>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 font-mono">
                  <span>{video.published_at}</span>
                  <span>•</span>
                  <span>{video.duration}</span>
                </div>
              </div>
            </div>

            {/* Content Loading state */}
            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-red-500/10 border-t-red-500 animate-spin"></div>
                  <Flame className="w-5 h-5 text-red-500 absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="text-sm font-display font-medium text-white mt-4 text-center">Invocando Algoritmo de Viralidade...</p>
                <p className="text-xs text-gray-500 mt-2 max-w-xs text-center leading-relaxed">
                  Decodificando mecanismos psicológicos, feedback de thumbnail e ganchos estruturais de narrativa.
                </p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-sm font-semibold mt-3 text-white">Erro na Análise do Gemini</p>
                <p className="text-xs text-red-300 mt-2 bg-red-950/10 border border-red-500/20 p-3 rounded-lg leading-relaxed">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 rounded-lg bg-[#310c0c] hover:bg-red-950 text-red-400 text-xs font-medium transition-colors"
                >
                  Fechar janela
                </button>
              </div>
            )}

            {/* Main Information Output */}
            {!isLoading && !error && analysis && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="mt-6 space-y-6 flex-1 pb-6"
              >
                {/* 1. Hook strength assessment */}
                <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-semibold text-gray-400 uppercase flex items-center gap-2">
                      <Clapperboard className="w-4 h-4 text-emerald-500" />
                      Força do Gancho (Hook Strength)
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      analysis.hookStrength === 'Excelente' ? 'bg-emerald-500/10 text-emerald-400' :
                      analysis.hookStrength === 'Bom' ? 'bg-indigo-500/10 text-indigo-400' :
                      analysis.hookStrength === 'Regular' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {analysis.hookStrength}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 font-normal leading-relaxed mt-3 bg-zinc-900/40 p-3 rounded-lg border border-white/5">
                    {analysis.hookExplanation}
                  </p>
                </div>

                {/* 2. Viral factors bullet points */}
                <div className="space-y-2.5">
                  <h5 className="text-[11px] font-mono uppercase tracking-widest text-gray-400 font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-500" />
                    Fatores Virais Mapeados
                  </h5>
                  <div className="grid gap-2">
                    {analysis.viralFactors.map((fact, idx) => (
                      <div key={idx} className="flex gap-3 items-center text-xs p-3 rounded-lg border border-red-950/20 bg-red-950/5">
                        <Flame className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-gray-300 font-medium">{fact}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Thumbnail Visual critique */}
                <div className="p-4 rounded-xl border border-red-900/20 bg-zinc-900/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -z-10"></div>
                  <span className="text-xs font-display font-semibold text-white uppercase flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-red-500" />
                    Auditoria de Thumbnail
                  </span>
                  <p className="text-xs text-red-200 mt-2.5 leading-relaxed bg-black/30 p-3 rounded-lg border border-red-950/25">
                    {analysis.thumbnailFeedback}
                  </p>
                </div>

                {/* 4. Storytelling strategy */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-mono uppercase tracking-widest text-gray-400 font-semibold flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    Estrutura de Storytelling
                  </h5>
                  <p className="text-xs text-gray-300 leading-relaxed bg-zinc-900/40 p-3 rounded-lg border border-white/5">
                    {analysis.storytellingStrategy}
                  </p>
                </div>

                {/* 5. Audience retention tips */}
                <div className="space-y-2.5">
                  <h5 className="text-[11px] font-mono uppercase tracking-widest text-gray-400 font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Dicas de Retenção de Público
                  </h5>
                  <ul className="space-y-2">
                    {analysis.audienceRetentionTips.map((tip, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-gray-400 items-start">
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
